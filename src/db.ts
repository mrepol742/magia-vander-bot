import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { config } from "./config";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Parses the database URL into a connection configuration object.
 *
 * @param url - The database URL to parse.
 * @returns The parsed connection configuration object.
 */
function parseDatabaseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

const adapter = new PrismaMariaDb({
  ...parseDatabaseUrl(config.databaseUrl),
  connectionLimit: 5,
});

export const prisma = global.__prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
