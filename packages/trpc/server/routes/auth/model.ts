import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().min(2).max(80).describe("Name of the user"),
  email: z.string().email().describe("Email of the user"),
  password: z.string().min(8).max(128).describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});

export const signInWithEmailAndPasswordInputModel = z.object({
  email: z.string().email().describe("Email of the user"),
  password: z.string().min(8).max(128).describe("Password of the user"),
});

export const signInWithGoogleInputModel = z.object({
  idToken: z.string().min(1).describe("Google ID token from the client"),
});

export const authenticatedUserOutputModel = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  username: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  socialLinks: z.record(z.string(), z.string()).nullable().optional(),
  createdAt: z.string().nullable().optional(),
});

export const signOutOutputModel = z.object({
  ok: z.boolean(),
});

export const updateMeInputModel = z.object({
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

