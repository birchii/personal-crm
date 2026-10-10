// Fills the database with test contacts. Does nothing if contacts already exist,
// so it never overwrites real data.
import "dotenv/config";
import { fakerRU as faker } from "@faker-js/faker";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { contacts, notes } from "../src/db/schema";
import { getDatabaseUrl } from "../src/db/url";

const CONTACT_COUNT = 1000;

const ORIGINS = [
  "Учились вместе в университете",
  "Бывший коллега",
  "Познакомились на конференции",
  "Сосед по дому",
  "Друг детства",
  "Познакомил общий друг",
  "Тренировки в спортзале",
  "Курсы английского",
  "Встретились в поездке",
  "Клиент на прошлой работе",
  "Родственник",
  "Знакомы по волонтёрству",
];

const NOTE_TEMPLATES = [
  () => `Созвонились, договорились встретиться ${faker.date.soon({ days: 30 }).toLocaleDateString("ru-RU")}.`,
  () => `Обещал(а) прислать контакты хорошего ${faker.helpers.arrayElement(["стоматолога", "юриста", "репетитора", "автомеханика"])}.`,
  () => `Переезжает в ${faker.location.city()}, спросить, как устроились.`,
  () => `Поздравить с днём рождения — ${faker.date.birthdate().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}.`,
  () => `Работает в «${faker.company.name()}», ищет ${faker.person.jobTitle().toLowerCase()}.`,
  () => `Договорились вместе сходить на ${faker.helpers.arrayElement(["концерт", "выставку", "футбол", "лекцию"])}.`,
  () => `Вернуть книгу «${faker.lorem.words(2)}».`,
  () => `Попросил(а) совета по поводу ${faker.helpers.arrayElement(["ремонта", "отпуска", "смены работы", "инвестиций"])}.`,
];

async function main() {
  const client = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle(client);

  const [{ value: existing }] = await db.select({ value: count() }).from(contacts);
  if (existing > 0) {
    console.log(`Database already has ${existing} contacts, seed skipped.`);
    await client.end();
    return;
  }

  faker.seed(42);
  const contactRows = Array.from({ length: CONTACT_COUNT }, () => {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const createdAt = faker.date.past({ years: 3 });
    return {
      name: `${firstName} ${lastName}`,
      origin: faker.helpers.arrayElement(ORIGINS),
      phone: faker.helpers.maybe(() => faker.phone.number({ style: "international" }), { probability: 0.85 }) ?? "",
      email: faker.helpers.maybe(() => faker.internet.email({ firstName, lastName }).toLowerCase(), { probability: 0.7 }) ?? "",
      createdAt,
      updatedAt: createdAt,
    };
  });

  const inserted = await db.insert(contacts).values(contactRows).returning({ id: contacts.id, createdAt: contacts.createdAt });

  const noteRows = inserted.flatMap(({ id, createdAt }) =>
    Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      contactId: id,
      body: faker.helpers.arrayElement(NOTE_TEMPLATES)(),
      createdAt: faker.date.between({ from: createdAt, to: new Date() }),
    })),
  );
  for (let i = 0; i < noteRows.length; i += 500) {
    await db.insert(notes).values(noteRows.slice(i, i + 500));
  }

  console.log(`Seeded ${inserted.length} contacts and ${noteRows.length} notes.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
