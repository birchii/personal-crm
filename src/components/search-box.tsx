"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const q = value.trim();
      startTransition(() => router.replace(q ? `/?q=${encodeURIComponent(q)}` : "/", { scroll: false }));
    }, 250);
    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    // Plain GET form so search also works before JavaScript loads.
    <form action="/" role="search" onSubmit={(e) => e.preventDefault()}>
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Найти по имени…"
        aria-label="Поиск по имени"
        autoComplete="off"
        className="h-10 bg-background"
        data-pending={isPending || undefined}
      />
    </form>
  );
}
