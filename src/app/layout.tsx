import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Личная CRM",
  description: "Люди, которых я знаю лично, и контекст общения с ними",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-muted/30 antialiased">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
            <Link href="/" className="font-semibold">
              Личная CRM
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
