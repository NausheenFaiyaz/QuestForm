import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { isServiceError } from "@repo/services";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

const serviceErrorToTRPCError = tRPCContext.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (!isServiceError(error)) throw error;

    const mappedCode: TRPCError["code"] =
      error.code === "BAD_REQUEST"
        ? "BAD_REQUEST"
        : error.code === "UNAUTHORIZED"
          ? "UNAUTHORIZED"
          : error.code === "FORBIDDEN"
            ? "FORBIDDEN"
            : error.code === "NOT_FOUND"
              ? "NOT_FOUND"
              : error.code === "CONFLICT"
                ? "CONFLICT"
                : error.code === "TOO_MANY_REQUESTS"
                  ? "TOO_MANY_REQUESTS"
                  : "INTERNAL_SERVER_ERROR";

    throw new TRPCError({
      code: mappedCode,
      message: error.message,
      cause: error,
    });
  }
});

export const publicProcedure = tRPCContext.procedure.use(serviceErrorToTRPCError);

const requireAuthMiddleware = tRPCContext.middleware(async ({ ctx, next }) => {
  if (!ctx.authUser?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  return next({
    ctx: {
      ...ctx,
      authUser: ctx.authUser,
    },
  });
});

export const protectedProcedure = tRPCContext.procedure.use(requireAuthMiddleware);
