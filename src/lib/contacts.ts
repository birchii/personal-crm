import "server-only";
import { asc, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contacts, notes } from "@/db/schema";

const idSchema = z.uuid();

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export async function listContacts(query: string) {
  const q = query.trim();
  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      origin: contacts.origin,
      phone: contacts.phone,
      email: contacts.email,
    })
    .from(contacts)
    .where(q ? ilike(contacts.name, `%${escapeLike(q)}%`) : undefined)
    .orderBy(asc(contacts.name));
}

export async function countContacts() {
  const [{ value }] = await db.select({ value: count() }).from(contacts);
  return value;
}

export async function getContact(id: string) {
  if (!idSchema.safeParse(id).success) return null;
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  return contact ?? null;
}

export async function getNotes(contactId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.contactId, contactId))
    .orderBy(desc(notes.createdAt));
}

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(200, "Слишком длинное имя"),
  origin: z.string().trim().max(500, "Слишком длинный текст"),
  phone: z.string().trim().max(50, "Слишком длинный телефон"),
  email: z
    .string()
    .trim()
    .max(200, "Слишком длинная почта")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Похоже, в почте опечатка"),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export async function insertContact(input: ContactInput) {
  const [row] = await db.insert(contacts).values(input).returning({ id: contacts.id });
  return row.id;
}

export async function updateContactById(id: string, input: ContactInput) {
  if (!idSchema.safeParse(id).success) return false;
  const rows = await db
    .update(contacts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id });
  return rows.length > 0;
}

export async function insertNote(contactId: string, body: string) {
  return db.transaction(async (tx) => {
    await tx.insert(notes).values({ contactId, body });
    await tx.update(contacts).set({ updatedAt: new Date() }).where(eq(contacts.id, contactId));
  });
}
