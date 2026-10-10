import Link from "next/link";
import { notFound } from "next/navigation";
import { addNote } from "@/app/actions";
import { NoteForm } from "@/components/note-form";
import { buttonVariants } from "@/components/ui/button";
import { getContact, getNotes } from "@/lib/contacts";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();
  const contactNotes = await getNotes(contact.id);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Все контакты
      </Link>

      <section className="space-y-4 rounded-xl border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">{contact.name}</h1>
          <Link href={`/contacts/${contact.id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Изменить
          </Link>
        </div>
        <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <Field label="Откуда знакомы" value={contact.origin} />
          <Field
            label="Телефон"
            value={contact.phone}
            href={contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined}
          />
          <Field label="Почта" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Заметки</h2>
        <NoteForm action={addNote.bind(null, contact.id)} />
        {contactNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Заметок пока нет.</p>
        ) : (
          <ul className="space-y-3">
            {contactNotes.map((n) => (
              <li key={n.id} className="rounded-xl border bg-background p-4">
                <div className="mb-1 text-xs text-muted-foreground">{dateFormat.format(n.createdAt)}</div>
                <p className="whitespace-pre-wrap">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="-mt-2 sm:mt-0">
        {!value ? (
          <span className="text-muted-foreground">—</span>
        ) : href ? (
          <a href={href} className="underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </>
  );
}
