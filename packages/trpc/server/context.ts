import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  clearAuthenticationCookies,
  createCookieFactory,
  getAccessTokenCookieFromGetter,
  getCookieFactory,
  getRefreshTokenCookieFromGetter,
  clearCookieFactory,
  setAccessTokenCookie,
  setRefreshTokenCookie,
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
  const accessToken = getAccessTokenCookieFromGetter(getCookie);
  const refreshToken = getRefreshTokenCookieFromGetter(getCookie);
  let authUser = accessToken ? await userService.verifyUserToken(accessToken) : null;

  if (!authUser && refreshToken) {
    const rotated = await userService.rotateRefreshSession(refreshToken, {
      userAgent: req.headers["user-agent"] ?? null,
    });

    if (rotated) {
      setAccessTokenCookie(
        {
          req,
          res,
          createCookie: createCookieFactory(res),
          getCookie,
          clearCookie: clearCookieFactory(res),
          authUser: null,
        },
        rotated.accessToken,
      );
      setRefreshTokenCookie(
        {
          req,
          res,
          createCookie: createCookieFactory(res),
          getCookie,
          clearCookie: clearCookieFactory(res),
          authUser: null,
        },
        rotated.refreshToken,
      );
      authUser = { id: rotated.userId };
    } else {
      clearAuthenticationCookies({
        req,
        res,
        createCookie: createCookieFactory(res),
        getCookie,
        clearCookie: clearCookieFactory(res),
        authUser: null,
      });
    }
  }

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
