import { jsonb, pgTable, uuid, varchar, timestamp, boolean, text, index } from "drizzle-orm/pg-core";

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

export const userRefreshSessionsTable = pgTable(
  "user_refresh_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("user_refresh_sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("user_refresh_sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export type SelectUserRefreshSession = typeof userRefreshSessionsTable.$inferSelect;
export type InsertUserRefreshSession = typeof userRefreshSessionsTable.$inferInsert;
