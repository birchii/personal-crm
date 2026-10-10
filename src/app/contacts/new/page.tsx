import { createContact } from "@/app/actions";
import { ContactForm } from "@/components/contact-form";

export default function NewContactPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Новый контакт</h1>
      <div className="rounded-xl border bg-background p-5">
        <ContactForm action={createContact} submitLabel="Сохранить" cancelHref="/" />
      </div>
    </div>
  );
}
