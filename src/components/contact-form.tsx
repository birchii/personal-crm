"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { name: string; origin: string; phone: string; email: string };

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Fields;
  submitLabel: string;
  cancelHref: string;
};

const FIELDS: { key: keyof Fields; label: string; type?: string; placeholder?: string }[] = [
  { key: "name", label: "Имя", placeholder: "Например, Анна Петрова" },
  { key: "origin", label: "Откуда знакомы", placeholder: "Например, учились вместе" },
  { key: "phone", label: "Телефон", type: "tel", placeholder: "+7 900 000-00-00" },
  { key: "email", label: "Почта", type: "email", placeholder: "name@example.com" },
];

export function ContactForm({ action, initial, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initial ?? { name: "", origin: "", phone: "", email: "" };

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {FIELDS.map((f) => {
        const error = state.fieldErrors?.[f.key];
        return (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>
              {f.label}
              {f.key === "name" && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={f.key}
              name={f.key}
              type={f.type ?? "text"}
              defaultValue={values[f.key as keyof typeof values]}
              placeholder={f.placeholder}
              aria-invalid={error ? true : undefined}
              autoFocus={f.key === "name"}
              className="h-10"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Сохраняю…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Отмена
        </Link>
      </div>
    </form>
  );
}
