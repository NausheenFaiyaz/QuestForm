import { createTRPCReact } from "@trpc/react-query";
import { ServerRouter } from "@repo/trpc/client";

export const trpc = createTRPCReact<ServerRouter>();
