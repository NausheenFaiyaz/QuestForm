import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  authenticatedUserOutputModel,
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signOutOutputModel,
  signInWithGoogleInputModel,
  signInWithEmailAndPasswordInputModel,
  updateMeInputModel,
} from "./model";
import { userService } from "../../services";
import {
  clearAuthenticationCookies,
  getRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie";
import { TRPCError } from "@trpc/server";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });
      const { accessToken, refreshToken } = await userService.createSessionForUser(id, {
        userAgent: ctx.req.headers["user-agent"] ?? null,
      });
      setAccessTokenCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, refreshToken);

      return {
        id,
      };
    }),
  signInWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signInWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await userService.signInUserWithEmailAndPassword(input);
      const { accessToken, refreshToken } = await userService.createSessionForUser(id, {
        userAgent: ctx.req.headers["user-agent"] ?? null,
      });
      setAccessTokenCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, refreshToken);
      return { id };
    }),
  signInWithGoogle: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInWithGoogle"),
        tags: TAGS,
      },
    })
    .input(signInWithGoogleInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await userService.signInWithGoogle(input);
      const { accessToken, refreshToken } = await userService.createSessionForUser(id, {
        userAgent: ctx.req.headers["user-agent"] ?? null,
      });
      setAccessTokenCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, refreshToken);
      return { id };
    }),
  signOut: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signOut"),
        tags: TAGS,
      },
    })
    .output(signOutOutputModel)
    .mutation(async ({ ctx }) => {
      const refreshToken = getRefreshTokenCookie(ctx);
      if (refreshToken) await userService.revokeRefreshSession(refreshToken);
      clearAuthenticationCookies(ctx);
      return { ok: true };
    }),
  me: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/me"),
        tags: TAGS,
      },
    })
    .output(authenticatedUserOutputModel)
    .query(async ({ ctx }) => {
      const user = await userService.getUserById(ctx.authUser.id);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "User session is invalid" });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        websiteUrl: user.websiteUrl,
        socialLinks: user.socialLinks,
        createdAt: user.createdAt?.toISOString() ?? null,
      };
    }),
  updateMe: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateMe"),
        tags: TAGS,
      },
    })
    .input(updateMeInputModel)
    .output(authenticatedUserOutputModel)
    .mutation(async ({ ctx, input }) => {
      const updated = await userService.updateUserProfile(ctx.authUser.id, input);
      return {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        username: updated.username,
        profileImageUrl: updated.profileImageUrl,
        bio: updated.bio,
        websiteUrl: updated.websiteUrl,
        socialLinks: updated.socialLinks,
        createdAt: updated.createdAt?.toISOString() ?? null,
      };
    }),
});
