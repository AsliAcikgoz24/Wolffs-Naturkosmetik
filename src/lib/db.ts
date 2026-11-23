import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const globalDb = globalThis as typeof globalThis & { wolffsDb?: PrismaClient };
export const db = globalDb.wolffsDb ?? new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./wolffs.db" }),
});
if (process.env.NODE_ENV !== "production") globalDb.wolffsDb = db;
