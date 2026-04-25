import "dotenv/config";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = path.resolve(process.cwd(), dbUrl.replace(/^file:/, ""));
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) });

async function main() {
  const [, , email, password, name] = process.argv;
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [name]");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, name: name ?? null },
    create: { email, password: hashed, name: name ?? null, role: "ADMIN" },
  });

  console.log(`✓ User created: ${user.email} (${user.role})`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
