import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3 py-10 text-center">
      <h1 className="text-xl font-semibold">Такого контакта нет</h1>
      <Link href="/" className="underline underline-offset-4">
        Вернуться к списку
      </Link>
    </div>
  );
}
