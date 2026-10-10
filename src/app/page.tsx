import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/search-box";
import { buttonVariants } from "@/components/ui/button";
import { countContacts, listContacts } from "@/lib/contacts";

export const dynamic = "force-dynamic";

function pluralContacts(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "контакт";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "контакта";
  return "контактов";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [items, total] = await Promise.all([listContacts(q), countContacts()]);
  const query = q.trim();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Контакты</h1>
          <p className="text-sm text-muted-foreground">
            {query
              ? `Найдено ${items.length} из ${total}`
              : `${total} ${pluralContacts(total)}`}
          </p>
        </div>
        <Link href="/contacts/new" className={buttonVariants({ size: "lg" })}>
          + Добавить контакт
        </Link>
      </div>

      <Suspense>
        <SearchBox />
      </Suspense>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-background p-8 text-center text-muted-foreground">
          {query ? (
            <>По запросу «{query}» никого не нашлось.</>
          ) : (
            <>Пока нет ни одного контакта. Добавьте первого человека.</>
          )}
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/contacts/${c.id}`}
                className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  {c.origin && <div className="truncate text-sm text-muted-foreground">{c.origin}</div>}
                </div>
                <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                  {c.phone && <div>{c.phone}</div>}
                  {c.email && <div>{c.email}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
