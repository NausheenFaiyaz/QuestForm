import type { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const isProductionEnv = ["production", "prod"].includes(process.env.NODE_ENV ?? "");

const defaultCookieOption: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: isProductionEnv,
  sameSite: isProductionEnv ? "none" : "lax",
};

const clearCookieOption: CookieOptions = {
  path: defaultCookieOption.path,
  httpOnly: defaultCookieOption.httpOnly,
  secure: defaultCookieOption.secure,
  sameSite: defaultCookieOption.sameSite,
};

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOption,
  ) {
    res.cookie(name, value, opts);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies?.[name];
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string) {
    res.clearCookie(name, clearCookieOption);
  };
}

const ACCESS_TOKEN_COOKIE_NAME = "access-token";
const REFRESH_TOKEN_COOKIE_NAME = "refresh-token";

function parseDurationToMs(duration: string) {
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(duration.trim());
  if (!match || !match[1] || !match[2]) throw new Error(`invalid duration format: ${duration}`);

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "ms") return value;
  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}

function getCookieMaxAgeFromEnv(value: string, fallback: string) {
  try {
    return parseDurationToMs(value || fallback);
  } catch {
    return parseDurationToMs(fallback);
  }
}

export function setAccessTokenCookie(ctx: TRPCContext, accessToken: string) {
  const maxAge = getCookieMaxAgeFromEnv(
    process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "",
    "15m",
  );
  ctx.createCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...defaultCookieOption, maxAge });
}

export function setRefreshTokenCookie(ctx: TRPCContext, refreshToken: string) {
  const maxAge = getCookieMaxAgeFromEnv(process.env.REFRESH_TOKEN_EXPIRES_IN || "", "30d");
  ctx.createCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...defaultCookieOption, maxAge });
}

export function getAccessTokenCookie(ctx: TRPCContext) {
  return ctx.getCookie(ACCESS_TOKEN_COOKIE_NAME);
}

export function getRefreshTokenCookie(ctx: TRPCContext) {
  return ctx.getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function getAccessTokenCookieFromGetter(getCookie: (name: string) => string | undefined) {
  return getCookie(ACCESS_TOKEN_COOKIE_NAME);
}

export function getRefreshTokenCookieFromGetter(getCookie: (name: string) => string | undefined) {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function clearAccessTokenCookie(ctx: TRPCContext) {
  ctx.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
}

export function clearRefreshTokenCookie(ctx: TRPCContext) {
  ctx.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function clearAuthenticationCookies(ctx: TRPCContext) {
  clearAccessTokenCookie(ctx);
  clearRefreshTokenCookie(ctx);
}
