import { z } from "zod";

export const formFieldTypeModel = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
]);

export const formVisibilityModel = z.enum(["public", "unlisted"]);

export const fieldConfigModel = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  options: z.array(z.string().min(1).max(100)).max(100).optional(),
  ratingScale: z.number().int().min(3).max(10).optional(),
}).passthrough();

export const formFieldInputModel = z.object({
  label: z.string().min(1).max(160),
  fieldType: formFieldTypeModel,
  fieldKey: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9_]+$/),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(1000).optional(),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0),
  config: fieldConfigModel.default({}),
});

export const createFormInputModel = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(5000).optional(),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  themeKey: z.string().min(3).max(80).default("startup-clean"),
  visibility: formVisibilityModel.default("public"),
  isTemplate: z.boolean().default(false),
  allowAnonymousResponses: z.boolean().default(true),
  responseLimit: z.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
  fields: z.array(formFieldInputModel).min(1).max(120),
});

export const updateFormInputModel = createFormInputModel
  .omit({ fields: true })
  .partial()
  .extend({
    fields: z.array(formFieldInputModel).min(1).max(120).optional(),
  });

export const publicFormAnswerValueModel = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.date(),
  z.null(),
]);

export const submitFormInputModel = z.object({
  slug: z.string().min(3).max(160),
  respondentEmail: z.string().email().optional(),
  answers: z.record(z.string(), publicFormAnswerValueModel),
});

export const formStatusModel = z.enum(["draft", "published", "archived"]);

export const formFieldOutputModel = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  label: z.string(),
  fieldType: formFieldTypeModel,
  fieldKey: z.string(),
  placeholder: z.string().nullable(),
  helpText: z.string().nullable(),
  isRequired: z.boolean(),
  order: z.number().int(),
  config: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const formOutputModel = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  themeKey: z.string(),
  status: formStatusModel,
  visibility: formVisibilityModel,
  isTemplate: z.boolean(),
  allowAnonymousResponses: z.boolean(),
  responseLimit: z.number().int().nullable(),
  expiresAt: z.date().nullable(),
  publishedAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const formWithFieldsOutputModel = formOutputModel.extend({
  fields: z.array(formFieldOutputModel),
});

export const dailyResponsePointOutputModel = z.object({
  day: z.coerce.date(),
  count: z.number().int().nonnegative(),
});

export const formStatusCountOutputModel = z.object({
  status: formStatusModel,
  count: z.number().int().nonnegative(),
});

export const topFormAnalyticsOutputModel = z.object({
  formId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  status: formStatusModel,
  responseCount: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
  completionRate: z.number().min(0),
});

export const analyticsOutputModel = z.object({
  formId: z.string().uuid(),
  totalResponses: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
  completionRate: z.number().min(0),
  dailyResponses: z.array(dailyResponsePointOutputModel),
  dailyViews: z.array(dailyResponsePointOutputModel),
});

export const ownerDashboardAnalyticsOutputModel = z.object({
  totalForms: z.number().int().nonnegative(),
  publishedForms: z.number().int().nonnegative(),
  unpublishedForms: z.number().int().nonnegative(),
  totalResponses: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
  overallCompletionRate: z.number().min(0),
  dailyResponses: z.array(dailyResponsePointOutputModel),
  dailyViews: z.array(dailyResponsePointOutputModel),
  formsByStatus: z.array(formStatusCountOutputModel),
  topForms: z.array(topFormAnalyticsOutputModel),
});

export const submitOutputModel = z.object({
  responseId: z.string().uuid(),
  formId: z.string().uuid(),
});

export const formPublicReadInputModel = z.object({
  slug: z.string().min(3).max(160),
});

export const listResponsesInputModel = z.object({
  formId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  respondentEmail: z.string().email().optional(),
  submittedAfter: z.coerce.date().optional(),
  submittedBefore: z.coerce.date().optional(),
});

export const responseItemOutputModel = z.object({
  fieldId: z.string().uuid(),
  fieldKey: z.string(),
  fieldLabel: z.string(),
  value: z.unknown(),
});

export const formResponseOutputModel = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  submittedByUserId: z.string().uuid().nullable(),
  respondentEmail: z.string().nullable(),
  submittedAt: z.date(),
  items: z.array(responseItemOutputModel),
});

export const paginatedResponseListOutputModel = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(formResponseOutputModel),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const cloneFormInputModel = z.object({
  formId: z.string().uuid(),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  title: z.string().min(3).max(140).optional(),
});

export const archiveFormInputModel = z.object({
  formId: z.string().uuid(),
});

export type CreateFormInputType = z.infer<typeof createFormInputModel>;
export type UpdateFormInputType = z.infer<typeof updateFormInputModel>;
export type SubmitFormInputType = z.infer<typeof submitFormInputModel>;
