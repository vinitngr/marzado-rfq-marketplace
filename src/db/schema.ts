import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  pgEnum,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["BUYER", "SUPPLIER", "ADMIN"]);
export const rfqStatusEnum = pgEnum("rfq_status", [
  "DRAFT",
  "OPEN",
  "CLOSED",
  "AWARDED",
  "EXPIRED",
]);
export const quotationStatusEnum = pgEnum("quotation_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: roleEnum("role"),
  companyName: text("company_name"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const rfqs = pgTable(
  "rfqs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").default("units").notNull(),
    deliveryLocation: text("delivery_location").notNull(),
    imageUrl: text("image_url"),
    budgetMin: numeric("budget_min", { precision: 12, scale: 2 }),
    budgetMax: numeric("budget_max", { precision: 12, scale: 2 }),
    deadline: timestamp("deadline", { mode: "date" }).notNull(),
    status: rfqStatusEnum("status").default("OPEN").notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    buyerIdx: index("buyer_idx").on(table.buyerId),
    statusIdx: index("status_idx").on(table.status),
    deadlineIdx: index("deadline_idx").on(table.deadline),
  })
);

export const quotations = pgTable(
  "quotations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    rfqId: text("rfq_id")
      .notNull()
      .references(() => rfqs.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    leadTimeDays: integer("lead_time_days").notNull(),
    notes: text("notes").notNull(),
    status: quotationStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    rfqSupplierUnique: uniqueIndex("rfq_supplier_unique").on(
      table.rfqId,
      table.supplierId
    ),
    rfqIdx: index("rfq_idx").on(table.rfqId),
    supplierIdx: index("supplier_idx").on(table.supplierId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
  quotations: many(quotations),
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  buyer: one(users, {
    fields: [rfqs.buyerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [rfqs.categoryId],
    references: [categories.id],
  }),
  quotations: many(quotations),
}));

export const quotationsRelations = relations(quotations, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [quotations.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(users, {
    fields: [quotations.supplierId],
    references: [users.id],
  }),
}));
