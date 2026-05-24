import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Health"];
const getPath = generatePath("/health");

export const healthRouter = router({
  status: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/status"),
        tags: TAGS,
      },
    })
    .input(zodUndefinedModel)
    .output(
      z.object({
        healthy: z.boolean(),
        service: z.string(),
      }),
    )
    .query(() => {
      return {
        healthy: true,
        service: "api",
      };
    }),
});
