import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  createCookieFactory,
  getCookieFactory,
  clearCookieFactory,
  getAuthenticationCookieFromGetter,
} from "./utils/cookie";
import UserService from "@repo/services/user";

const userService = new UserService();
export interface TRPCContext {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
  authUser: { id: string } | null;
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  const getCookie = getCookieFactory(req);
  const token = getAuthenticationCookieFromGetter(getCookie);
  const authUser = token ? await userService.verifyUserToken(token) : null;

  const ctx: TRPCContext = {
    req,
    res,
    createCookie: createCookieFactory(res),
    getCookie,
    clearCookie: clearCookieFactory(res),
    authUser,
  };
  return {
    ...ctx,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
