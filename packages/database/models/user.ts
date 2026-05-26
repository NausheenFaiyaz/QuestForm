import { jsonb, pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),
  username: varchar("username", { length: 40 }).unique(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  googleSub: varchar("google_sub", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false),

  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  websiteUrl: text("website_url"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),

  salt: text("salt"),
  password: text("password"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
