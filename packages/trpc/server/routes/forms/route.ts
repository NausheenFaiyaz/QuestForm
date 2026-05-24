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
  paginatedResponseListOutputModel,
  submitFormInputModel,
  submitOutputModel,
  updateFormInputModel,
} from "@repo/services/form/model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const idInputModel = z.object({ formId: z.string().uuid() });

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
    .query(async ({ input }) => {
      return formService.getPublicFormBySlug(input);
    }),
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(submitFormInputModel)
    .output(submitOutputModel)
    .mutation(async ({ ctx, input }) => {
      return formService.submitPublishedForm(input, {
        ip: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
      });
    }),
});
