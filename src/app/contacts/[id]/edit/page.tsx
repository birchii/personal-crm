import { notFound } from "next/navigation";
import { updateContact } from "@/app/actions";
import { ContactForm } from "@/components/contact-form";
import { getContact } from "@/lib/contacts";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Изменить контакт</h1>
      <div className="rounded-xl border bg-background p-5">
        <ContactForm
          action={updateContact.bind(null, contact.id)}
          initial={{ name: contact.name, origin: contact.origin, phone: contact.phone, email: contact.email }}
          submitLabel="Сохранить"
          cancelHref={`/contacts/${contact.id}`}
        />
      </div>
    </div>
  );
}
