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

export const signInWithGoogleInput = z.object({
  idToken: z.string().min(1).describe("Google ID token from Google Identity Services"),
});

export type SignInWithGoogleInputType = z.infer<typeof signInWithGoogleInput>;

export const updateUserProfileInput = z.object({
  fullName: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscores"),
  profileImageUrl: z
    .string()
    .refine((value) => value.startsWith("data:image/") || z.string().url().safeParse(value).success)
    .optional(),
  bio: z.string().max(280).optional(),
  websiteUrl: z.string().url().optional(),
  socialLinks: z.record(z.string(), z.string().url()).optional(),
});

export type UpdateUserProfileInputType = z.infer<typeof updateUserProfileInput>;
