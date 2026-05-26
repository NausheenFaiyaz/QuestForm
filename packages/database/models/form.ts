import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);
export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived"]);
export const formFieldTypeEnum = pgEnum("form_field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    themeKey: varchar("theme_key", { length: 80 }).notNull().default("startup-clean"),
    status: formStatusEnum("status").notNull().default("draft"),
    visibility: formVisibilityEnum("visibility").notNull().default("public"),
    isTemplate: boolean("is_template").notNull().default(false),
    allowAnonymousResponses: boolean("allow_anonymous_responses").notNull().default(true),
    responseLimit: integer("response_limit"),
    expiresAt: timestamp("expires_at"),
    expiryNotificationSentAt: timestamp("expiry_notification_sent_at"),
    publishedAt: timestamp("published_at"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("forms_owner_idx").on(table.ownerId),
    statusVisibilityIdx: index("forms_status_visibility_idx").on(table.status, table.visibility),
    publishedAtIdx: index("forms_published_at_idx").on(table.publishedAt),
  }),
);

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 160 }).notNull(),
    fieldType: formFieldTypeEnum("field_type").notNull(),
    fieldKey: varchar("field_key", { length: 120 }).notNull(),
    placeholder: varchar("placeholder", { length: 255 }),
    helpText: text("help_text"),
    isRequired: boolean("is_required").notNull().default(false),
    order: integer("order").notNull().default(0),
    // Dynamic constraints/options (min/max length, regex, option labels, etc.)
    config: jsonb("config").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    formOrderIdx: uniqueIndex("form_fields_form_order_unique").on(table.formId, table.order),
    formFieldKeyUniqueIdx: uniqueIndex("form_fields_form_key_unique").on(table.formId, table.fieldKey),
    formIdIdx: index("form_fields_form_id_idx").on(table.formId),
  }),
);

export const formResponsesTable = pgTable(
  "form_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    submittedByUserId: uuid("submitted_by_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    respondentEmail: varchar("respondent_email", { length: 255 }),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: varchar("user_agent", { length: 500 }),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (table) => ({
    formSubmittedAtIdx: index("form_responses_form_submitted_at_idx").on(table.formId, table.submittedAt),
    formIdIdx: index("form_responses_form_id_idx").on(table.formId),
    formIpHashUniqueIdx: uniqueIndex("form_responses_form_ip_hash_unique").on(table.formId, table.ipHash),
  }),
);

export const formResponseItemsTable = pgTable(
  "form_response_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponsesTable.id, { onDelete: "cascade" }),
    formFieldId: uuid("form_field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    responseFieldUniqueIdx: uniqueIndex("form_response_items_response_field_unique").on(
      table.responseId,
      table.formFieldId,
    ),
    responseIdx: index("form_response_items_response_idx").on(table.responseId),
  }),
);

export const formViewsTable = pgTable(
  "form_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: varchar("user_agent", { length: 500 }),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => ({
    formViewedAtIdx: index("form_views_form_viewed_at_idx").on(table.formId, table.viewedAt),
  }),
);

export const publicApiRateLimitsTable = pgTable(
  "public_api_rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    routeKey: varchar("route_key", { length: 120 }).notNull(),
    subjectHash: varchar("subject_hash", { length: 128 }).notNull(),
    windowStart: timestamp("window_start").notNull(),
    requestCount: integer("request_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    routeSubjectWindowUniqueIdx: uniqueIndex("public_api_rate_limits_unique").on(
      table.routeKey,
      table.subjectHash,
      table.windowStart,
    ),
    routeWindowIdx: index("public_api_rate_limits_route_window_idx").on(table.routeKey, table.windowStart),
  }),
);

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
