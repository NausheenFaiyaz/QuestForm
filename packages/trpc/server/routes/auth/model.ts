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

export const authenticatedUserOutputModel = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  profileImageUrl: z.string().nullable().optional(),
});

export const signOutOutputModel = z.object({
  ok: z.boolean(),
});

export const updateMeInputModel = z.object({
  fullName: z.string().min(2).max(80),
  profileImageUrl: z.string().url().optional(),
});

