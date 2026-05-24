import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { type ServerRouter } from "../server";

export type RouterOutputs = inferRouterOutputs<ServerRouter>;
export type RouterInputs = inferRouterInputs<ServerRouter>;

export type { ServerRouter } from "../server";

export * from "@trpc/client";
