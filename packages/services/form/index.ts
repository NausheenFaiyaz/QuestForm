import { createHash } from "node:crypto";
import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  formFieldsTable,
  formResponseItemsTable,
  formResponsesTable,
  formsTable,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  publicApiRateLimitsTable,
  sql,
} from "@repo/database";
import type { SelectFormField } from "@repo/database/models/form";
import { ServiceError } from "../errors";
import {
  archiveFormInputModel,
  cloneFormInputModel,
  createFormInputModel,
  formFieldTypeModel,
  listResponsesInputModel,
  formPublicReadInputModel,
  submitFormInputModel,
  type SubmitFormInputType,
  updateFormInputModel,
} from "./model";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

export class FormService {
  private hashSubject(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
  }

  private normalizeUnexpectedDbError(error: unknown): never {
    const dbError = error as { code?: string; detail?: string; constraint?: string } | undefined;
    if (dbError?.code === "23505") {
      throw new ServiceError("CONFLICT", "A unique constraint was violated", {
        detail: dbError.detail,
        constraint: dbError.constraint,
      });
    }
    throw error;
  }

  private async getOwnedFormOrThrow(ownerId: string, formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
      .limit(1);

    if (!form) throw new ServiceError("NOT_FOUND", "Form not found");
    return form;
  }

  async createForm(ownerId: string, payload: unknown) {
    const data = await createFormInputModel.parseAsync(payload);

    try {
      return await db.transaction(async (tx) => {
        const [form] = await tx
          .insert(formsTable)
          .values({
            ownerId,
            title: data.title,
            description: data.description,
            slug: data.slug,
            themeKey: data.themeKey,
            visibility: data.visibility,
            isTemplate: data.isTemplate,
            allowAnonymousResponses: data.allowAnonymousResponses,
            responseLimit: data.responseLimit,
            expiresAt: data.expiresAt,
          })
          .returning();
        if (!form?.id) throw new ServiceError("INTERNAL", "Failed to create form");

        await tx.insert(formFieldsTable).values(
          data.fields.map((field) => ({
            formId: form.id,
            ...field,
          })),
        );

        return form;
      });
    } catch (error) {
      this.normalizeUnexpectedDbError(error);
    }
  }

  async updateForm(ownerId: string, formId: string, payload: unknown) {
    const data = await updateFormInputModel.parseAsync(payload);

    try {
      return await db.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(formsTable)
          .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
          .limit(1);
        if (!existing) throw new ServiceError("NOT_FOUND", "Form not found");

        if (Object.keys(data).length > 0) {
          const patch = {
            ...("title" in data ? { title: data.title } : {}),
            ...("description" in data ? { description: data.description } : {}),
            ...("slug" in data ? { slug: data.slug } : {}),
            ...("themeKey" in data ? { themeKey: data.themeKey } : {}),
            ...("visibility" in data ? { visibility: data.visibility } : {}),
            ...("isTemplate" in data ? { isTemplate: data.isTemplate } : {}),
            ...("allowAnonymousResponses" in data
              ? { allowAnonymousResponses: data.allowAnonymousResponses }
              : {}),
            ...("responseLimit" in data ? { responseLimit: data.responseLimit ?? null } : {}),
            ...("expiresAt" in data ? { expiresAt: data.expiresAt ?? null } : {}),
          };
          if (Object.keys(patch).length > 0) {
            await tx.update(formsTable).set(patch).where(eq(formsTable.id, formId));
          }
        }

        if (data.fields) {
          await tx.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
          await tx.insert(formFieldsTable).values(data.fields.map((field) => ({ formId, ...field })));
        }

        const [updated] = await tx.select().from(formsTable).where(eq(formsTable.id, formId)).limit(1);
        if (!updated) throw new ServiceError("INTERNAL", "Failed to update form");
        return updated;
      });
    } catch (error) {
      this.normalizeUnexpectedDbError(error);
    }
  }

  async setFormPublishStatus(ownerId: string, formId: string, publish: boolean) {
    const [updated] = await db
      .update(formsTable)
      .set({
        status: publish ? "published" : "draft",
        publishedAt: publish ? new Date() : null,
      })
      .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
      .returning();

    if (!updated) throw new ServiceError("NOT_FOUND", "Form not found");
    return updated;
  }

  async listOwnerForms(ownerId: string) {
    return db.select().from(formsTable).where(eq(formsTable.ownerId, ownerId)).orderBy(desc(formsTable.createdAt));
  }

  async getFormWithFieldsById(ownerId: string, formId: string) {
    const form = await this.getOwnedFormOrThrow(ownerId, formId);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.order));

    return { ...form, fields };
  }

  async getPublicFormBySlug(slugInput: unknown) {
    const { slug } = await formPublicReadInputModel.parseAsync(slugInput);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.slug, slug), eq(formsTable.status, "published")))
      .limit(1);

    if (!form) throw new ServiceError("NOT_FOUND", "Form not found");
    if (form.expiresAt && form.expiresAt < new Date()) {
      throw new ServiceError("FORBIDDEN", "Form is expired");
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.order));

    return {
      ...form,
      fields,
    };
  }

  async listPublicExploreForms(limit = 20, offset = 0) {
    return db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public"),
          or(isNull(formsTable.expiresAt), gte(formsTable.expiresAt, new Date())),
        ),
      )
      .orderBy(desc(formsTable.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  private parseAndValidateAnswer(field: SelectFormField, value: unknown) {
    const type = formFieldTypeModel.parse(field.fieldType);
    if (value == null) {
      if (field.isRequired) throw new Error(`${field.fieldKey} is required`);
      return null;
    }

    const cfg = (field.config ?? {}) as Record<string, unknown>;
    switch (type) {
      case "short_text":
      case "long_text": {
        if (typeof value !== "string") throw new Error(`${field.fieldKey} must be a string`);
        const minLength = typeof cfg.minLength === "number" ? cfg.minLength : undefined;
        const maxLength = typeof cfg.maxLength === "number" ? cfg.maxLength : undefined;
        if (minLength != null && value.length < minLength) throw new Error(`${field.fieldKey} is too short`);
        if (maxLength != null && value.length > maxLength) throw new Error(`${field.fieldKey} is too long`);
        return value;
      }
      case "email": {
        if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          throw new Error(`${field.fieldKey} must be a valid email`);
        return value;
      }
      case "number": {
        if (typeof value !== "number" || Number.isNaN(value))
          throw new Error(`${field.fieldKey} must be a number`);
        return value;
      }
      case "single_select": {
        if (typeof value !== "string") throw new Error(`${field.fieldKey} must be a string option`);
        const options = Array.isArray(cfg.options) ? cfg.options : [];
        if (options.length > 0 && !options.includes(value))
          throw new Error(`${field.fieldKey} has invalid option`);
        return value;
      }
      case "multi_select": {
        if (!Array.isArray(value) || value.some((v) => typeof v !== "string"))
          throw new Error(`${field.fieldKey} must be a list of string options`);
        const options = Array.isArray(cfg.options) ? cfg.options : [];
        if (options.length > 0 && value.some((item) => !options.includes(item)))
          throw new Error(`${field.fieldKey} has invalid option`);
        return value;
      }
      case "checkbox": {
        if (typeof value !== "boolean") throw new Error(`${field.fieldKey} must be boolean`);
        return value;
      }
      case "rating": {
        if (typeof value !== "number") throw new Error(`${field.fieldKey} must be a number`);
        const max = typeof cfg.ratingScale === "number" ? cfg.ratingScale : 5;
        if (value < 1 || value > max) throw new Error(`${field.fieldKey} must be between 1 and ${max}`);
        return value;
      }
      case "date": {
        const date = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(date.getTime())) throw new Error(`${field.fieldKey} must be a valid date`);
        return date.toISOString();
      }
    }
  }

  async submitPublishedForm(payload: SubmitFormInputType, subject: { ip?: string; userAgent?: string }) {
    const data = await submitFormInputModel.parseAsync(payload);
    const subjectRaw = `${subject.ip ?? "unknown"}:${subject.userAgent ?? "unknown"}`;
    await this.checkAndConsumeRateLimit("public_form_submit", subjectRaw);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.slug, data.slug), eq(formsTable.status, "published")))
      .limit(1);
    if (!form) throw new ServiceError("NOT_FOUND", "Form not found");
    if (form.expiresAt && form.expiresAt < new Date()) throw new ServiceError("FORBIDDEN", "Form is expired");

    const [responsesCount] = await db
      .select({ count: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, form.id));

    if (form.responseLimit && (responsesCount?.count ?? 0) >= form.responseLimit) {
      throw new ServiceError("FORBIDDEN", "Response limit reached");
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.order));

    const parsedAnswers: Array<{ fieldId: string; value: unknown }> = [];
    for (const field of fields) {
      const providedValue = data.answers[field.fieldKey];
      const parsedValue = this.parseAndValidateAnswer(field, providedValue);
      if (parsedValue !== null || field.isRequired) {
        parsedAnswers.push({ fieldId: field.id, value: parsedValue });
      }
    }

    return db.transaction(async (tx) => {
      const [response] = await tx
        .insert(formResponsesTable)
        .values({
          formId: form.id,
          respondentEmail: data.respondentEmail,
          ipHash: this.hashSubject(subject.ip ?? "unknown"),
          userAgent: subject.userAgent,
        })
        .returning({ id: formResponsesTable.id });
      if (!response?.id) throw new ServiceError("INTERNAL", "Failed to persist response");

      if (parsedAnswers.length > 0) {
        await tx.insert(formResponseItemsTable).values(
          parsedAnswers.map((answer) => ({
            responseId: response.id,
            formFieldId: answer.fieldId,
            value: answer.value,
          })),
        );
      }

      return { responseId: response.id, formId: form.id };
    });
  }

  async getResponseAnalytics(ownerId: string, formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
      .limit(1);
    if (!form) throw new ServiceError("NOT_FOUND", "Form not found");

    const [totalResponses] = await db
      .select({ count: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));

    const dailyResponses = await db.execute(sql`
      select date_trunc('day', submitted_at) as day, count(*)::int as count
      from form_responses
      where form_id = ${formId}
      group by 1
      order by 1 desc
      limit 30
    `);

    return {
      formId,
      totalResponses: totalResponses?.count ?? 0,
      dailyResponses: dailyResponses.rows.map((row) => ({
        day: row.day,
        count: Number(row.count ?? 0),
      })),
    };
  }

  async listFormResponses(ownerId: string, rawInput: unknown) {
    const input = await listResponsesInputModel.parseAsync(rawInput);
    if (input.submittedAfter && input.submittedBefore && input.submittedAfter > input.submittedBefore) {
      throw new ServiceError("BAD_REQUEST", "Invalid submission date range");
    }

    await this.getOwnedFormOrThrow(ownerId, input.formId);

    const whereFilters = [
      eq(formResponsesTable.formId, input.formId),
      ...(input.respondentEmail
        ? [ilike(formResponsesTable.respondentEmail, `%${input.respondentEmail}%`)]
        : []),
      ...(input.submittedAfter ? [gte(formResponsesTable.submittedAt, input.submittedAfter)] : []),
      ...(input.submittedBefore ? [lt(formResponsesTable.submittedAt, input.submittedBefore)] : []),
    ];

    const [totalRow] = await db
      .select({ count: count() })
      .from(formResponsesTable)
      .where(and(...whereFilters));

    const baseRows = await db
      .select()
      .from(formResponsesTable)
      .where(and(...whereFilters))
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(input.limit)
      .offset(input.offset);

    if (baseRows.length === 0) {
      return { total: totalRow?.count ?? 0, items: [], limit: input.limit, offset: input.offset };
    }

    const responseIds = baseRows.map((row) => row.id);
    const itemsRows = await db
      .select({
        responseId: formResponseItemsTable.responseId,
        fieldId: formResponseItemsTable.formFieldId,
        value: formResponseItemsTable.value,
      })
      .from(formResponseItemsTable)
      .where(inArray(formResponseItemsTable.responseId, responseIds));

    const fieldIds = Array.from(new Set(itemsRows.map((row) => row.fieldId)));
    const fieldsRows =
      fieldIds.length === 0
        ? []
        : await db
            .select({
              id: formFieldsTable.id,
              fieldKey: formFieldsTable.fieldKey,
              fieldLabel: formFieldsTable.label,
            })
            .from(formFieldsTable)
            .where(inArray(formFieldsTable.id, fieldIds));
    const fieldMap = new Map(fieldsRows.map((row) => [row.id, row]));

    const itemMap = new Map<string, Array<{ fieldId: string; fieldKey: string; fieldLabel: string; value: unknown }>>();
    for (const row of itemsRows) {
      const responseId = String(row.responseId);
      const field = fieldMap.get(row.fieldId);
      if (!field) continue;
      const existing = itemMap.get(responseId) ?? [];
      existing.push({
        fieldId: row.fieldId,
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        value: row.value,
      });
      itemMap.set(responseId, existing);
    }

    return {
      total: totalRow?.count ?? 0,
      items: baseRows.map((row) => ({
        id: row.id,
        formId: row.formId,
        submittedByUserId: row.submittedByUserId,
        respondentEmail: row.respondentEmail,
        submittedAt: row.submittedAt,
        items: itemMap.get(row.id) ?? [],
      })),
      limit: input.limit,
      offset: input.offset,
    };
  }

  async cloneForm(ownerId: string, rawInput: unknown) {
    const input = await cloneFormInputModel.parseAsync(rawInput);
    const source = await this.getOwnedFormOrThrow(ownerId, input.formId);

    const sourceFields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, source.id))
      .orderBy(asc(formFieldsTable.order));

    const slug = input.slug ?? `${source.slug}-${Date.now()}`;

    try {
      return await db.transaction(async (tx) => {
        const [cloned] = await tx
          .insert(formsTable)
          .values({
            ownerId,
            title: input.title ?? `${source.title} (Copy)`,
            description: source.description,
            slug,
            themeKey: source.themeKey,
            status: "draft",
            visibility: source.visibility,
            isTemplate: source.isTemplate,
            allowAnonymousResponses: source.allowAnonymousResponses,
            responseLimit: source.responseLimit,
            expiresAt: source.expiresAt,
          })
          .returning();

        if (!cloned?.id) throw new ServiceError("INTERNAL", "Failed to clone form");

        if (sourceFields.length > 0) {
          await tx.insert(formFieldsTable).values(
            sourceFields.map((field) => ({
              formId: cloned.id,
              label: field.label,
              fieldType: field.fieldType,
              fieldKey: field.fieldKey,
              placeholder: field.placeholder,
              helpText: field.helpText,
              isRequired: field.isRequired,
              order: field.order,
              config: field.config,
            })),
          );
        }

        return cloned;
      });
    } catch (error) {
      this.normalizeUnexpectedDbError(error);
    }
  }

  async archiveForm(ownerId: string, rawInput: unknown) {
    const input = await archiveFormInputModel.parseAsync(rawInput);
    const [updated] = await db
      .update(formsTable)
      .set({
        status: "archived",
        archivedAt: new Date(),
        publishedAt: null,
      })
      .where(and(eq(formsTable.id, input.formId), eq(formsTable.ownerId, ownerId)))
      .returning();

    if (!updated) throw new ServiceError("NOT_FOUND", "Form not found");
    return updated;
  }

  private async checkAndConsumeRateLimit(routeKey: string, subjectRaw: string) {
    const now = new Date();
    const subjectHash = this.hashSubject(subjectRaw);
    const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);

    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(publicApiRateLimitsTable)
        .where(
          and(
            eq(publicApiRateLimitsTable.routeKey, routeKey),
            eq(publicApiRateLimitsTable.subjectHash, subjectHash),
            eq(publicApiRateLimitsTable.windowStart, windowStart),
          ),
        )
        .limit(1);

      if (!existing) {
        await tx.insert(publicApiRateLimitsTable).values({
          routeKey,
          subjectHash,
          windowStart,
          requestCount: 1,
        });
        return;
      }

      if (existing.requestCount >= MAX_REQUESTS_PER_WINDOW) {
        throw new ServiceError("TOO_MANY_REQUESTS", "Rate limit exceeded");
      }

      await tx
        .update(publicApiRateLimitsTable)
        .set({ requestCount: existing.requestCount + 1 })
        .where(eq(publicApiRateLimitsTable.id, existing.id));

      await tx
        .delete(publicApiRateLimitsTable)
        .where(lt(publicApiRateLimitsTable.windowStart, new Date(now.getTime() - 24 * 60 * 60 * 1000)));
    });
  }
}

export default FormService;
