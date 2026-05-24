import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().min(2).max(80).describe("Full name of the user"),
  email: z.string().email().describe("Email address of the user"),
  password: z.string().min(8).max(128).describe("Password of the user"),
});

export type CreateUserWithEmailAndPasswordType = z.infer<typeof createUserWithEmailAndPasswordInput>;


export const generateUserTokenPayload = z.object({
  id: z.string().describe("UUID of the user"),
})

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;

export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.string().email().describe("Email address of the user"),
  password: z.string().min(8).max(128).describe("Password of the user"),
});

export type SignInUserWithEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>;

export const updateUserProfileInput = z.object({
  fullName: z.string().min(2).max(80),
  profileImageUrl: z.string().url().optional(),
});

export type UpdateUserProfileInputType = z.infer<typeof updateUserProfileInput>;
