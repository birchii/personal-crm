"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  contactInputSchema,
  getContact,
  insertContact,
  insertNote,
  updateContactById,
} from "@/lib/contacts";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "origin" | "phone" | "email" | "body", string>>;
  values?: Record<string, string>;
  ok?: boolean;
};

function readContactForm(formData: FormData) {
  const values = {
    name: String(formData.get("name") ?? ""),
    origin: String(formData.get("origin") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  return { values, parsed: contactInputSchema.safeParse(values) };
}

function fieldErrorsOf(error: z.ZodError): FormState["fieldErrors"] {
  const result: FormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof NonNullable<FormState["fieldErrors"]>;
    result[key] ??= issue.message;
  }
  return result;
}

export async function createContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const { values, parsed } = readContactForm(formData);
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const id = await insertContact(parsed.data);
  revalidatePath("/");
  redirect(`/contacts/${id}`);
}

export async function updateContact(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { values, parsed } = readContactForm(formData);
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const updated = await updateContactById(id, parsed.data);
  if (!updated) return { values, error: "Контакт не найден — возможно, его удалили" };
  revalidatePath("/");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

const noteSchema = z.string().trim().min(1, "Заметка пустая").max(10000, "Слишком длинная заметка");

export async function addNote(contactId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const raw = String(formData.get("body") ?? "");
  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) return { values: { body: raw }, fieldErrors: { body: parsed.error.issues[0].message } };

  const contact = await getContact(contactId);
  if (!contact) return { values: { body: raw }, error: "Контакт не найден — возможно, его удалили" };

  await insertNote(contactId, parsed.data);
  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}
