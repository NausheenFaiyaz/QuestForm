import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";
import {
  analyticsOutputModel,
  archiveFormInputModel,
  cloneFormInputModel,
  createFormInputModel,
  formOutputModel,
  formPublicReadInputModel,
  formVisibilityModel,
  formWithFieldsOutputModel,
  listResponsesInputModel,
  ownerDashboardAnalyticsOutputModel,
  paginatedResponseListOutputModel,
  submitFormInputModel,
  submitOutputModel,
  updateFormInputModel,
} from "@repo/services/form/model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const idInputModel = z.object({ formId: z.string().uuid() });

function normalizeIp(rawIp?: string | null) {
  if (!rawIp) return undefined;
  const first = rawIp.split(",")[0]?.trim();
  if (!first) return undefined;
  if (first === "::1") return "127.0.0.1";
  if (first.startsWith("::ffff:")) return first.slice(7);
  return first;
}

function getClientIp(req: { ip?: string; headers: Record<string, unknown>; socket?: { remoteAddress?: string | null } }) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const cfIp = req.headers["cf-connecting-ip"];

  const headerIp =
    (Array.isArray(forwardedFor) ? forwardedFor[0] : typeof forwardedFor === "string" ? forwardedFor : undefined) ??
    (Array.isArray(realIp) ? realIp[0] : typeof realIp === "string" ? realIp : undefined) ??
    (Array.isArray(cfIp) ? cfIp[0] : typeof cfIp === "string" ? cfIp : undefined);

  return normalizeIp(headerIp) ?? normalizeIp(req.ip) ?? normalizeIp(req.socket?.remoteAddress);
}

export const formsRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(createFormInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.createForm(ctx.authUser.id, input);
    }),
  update: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(idInputModel.extend({ data: updateFormInputModel }))
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.updateForm(ctx.authUser.id, input.formId, input.data);
    }),
  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/publish"), tags: TAGS } })
    .input(idInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.setFormPublishStatus(ctx.authUser.id, input.formId, true);
    }),
  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unpublish"), tags: TAGS } })
    .input(idInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.setFormPublishStatus(ctx.authUser.id, input.formId, false);
    }),
  delete: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(idInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.deleteForm(ctx.authUser.id, input.formId);
    }),
  archive: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archive"), tags: TAGS } })
    .input(archiveFormInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.archiveForm(ctx.authUser.id, input);
    }),
  clone: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/clone"), tags: TAGS } })
    .input(cloneFormInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.cloneForm(ctx.authUser.id, input);
    }),
  mine: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/mine"), tags: TAGS } })
    .output(z.array(formOutputModel))
    .query(async ({ ctx }) => {
      return formService.listOwnerForms(ctx.authUser.id);
    }),
  ownerAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/ownerAnalytics"), tags: TAGS } })
    .output(ownerDashboardAnalyticsOutputModel)
    .query(async ({ ctx }) => {
      return formService.getOwnerDashboardAnalytics(ctx.authUser.id);
    }),
  detail: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/detail"), tags: TAGS } })
    .input(idInputModel)
    .output(formWithFieldsOutputModel)
    .query(async ({ ctx, input }) => {
      return formService.getFormWithFieldsById(ctx.authUser.id, input.formId);
    }),
  analytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/analytics"), tags: TAGS } })
    .input(idInputModel)
    .output(analyticsOutputModel)
    .query(async ({ ctx, input }) => {
      return formService.getResponseAnalytics(ctx.authUser.id, input.formId);
    }),
  responses: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/responses"), tags: TAGS } })
    .input(listResponsesInputModel)
    .output(paginatedResponseListOutputModel)
    .query(async ({ ctx, input }) => {
      return formService.listFormResponses(ctx.authUser.id, input);
    }),
  explore: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/explore"), tags: TAGS } })
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(20).optional(),
        offset: z.number().int().min(0).default(0).optional(),
        visibility: formVisibilityModel.default("public").optional(),
      }),
    )
    .output(z.array(formOutputModel))
    .query(async ({ input }) => {
      if (input?.visibility === "unlisted") return [];
      return formService.listPublicExploreForms(input?.limit ?? 20, input?.offset ?? 0);
    }),
  publicBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/publicBySlug"), tags: TAGS } })
    .input(formPublicReadInputModel)
    .output(formWithFieldsOutputModel)
    .query(async ({ ctx, input }) => {
      return formService.getPublicFormBySlug(input, {
        ip: getClientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"],
      });
    }),
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(submitFormInputModel)
    .output(submitOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.submitPublishedForm(input, {
        ip: getClientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"],
      });
    }),
});
