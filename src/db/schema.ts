import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // How we know each other: "university friend", "met at a conference", etc.
    origin: text("origin").notNull().default(""),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contacts_name_idx").on(t.name)],
);

// Notes are appended after each conversation and kept as a history.
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_contact_id_idx").on(t.contactId, t.createdAt)],
);

export type Contact = typeof contacts.$inferSelect;
export type Note = typeof notes.$inferSelect;
