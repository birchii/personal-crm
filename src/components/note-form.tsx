"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = { action: (prev: FormState, formData: FormData) => Promise<FormState> };

export function NoteForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const error = state.fieldErrors?.body ?? state.error;

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <Textarea
        name="body"
        defaultValue={state.values?.body}
        placeholder="О чём поговорили, о чём договорились…"
        aria-label="Новая заметка"
        aria-invalid={error ? true : undefined}
        rows={3}
        className="bg-background"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit();
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняю…" : "Добавить заметку"}
        </Button>
        {state.ok && !pending && <span className="text-sm text-muted-foreground">Сохранено</span>}
      </div>
    </form>
  );
}
