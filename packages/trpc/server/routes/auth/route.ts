import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  authenticatedUserOutputModel,
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signOutOutputModel,
  signInWithEmailAndPasswordInputModel,
  updateMeInputModel,
} from "./model";
import { userService } from "../../services";
import { clearAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";
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
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });

      setAuthenticationCookie(ctx, token);

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
      const { id, token } = await userService.signInUserWithEmailAndPassword(input);
      setAuthenticationCookie(ctx, token);
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
      clearAuthenticationCookie(ctx);
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
        profileImageUrl: user.profileImageUrl,
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
        profileImageUrl: updated.profileImageUrl,
      };
    }),
});
