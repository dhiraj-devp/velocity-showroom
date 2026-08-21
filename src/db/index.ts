import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

function createDatabase(url: string) {
  const pool = mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
  });
  return drizzle({ client: pool });
}

type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env before using MySQL repositories.",
    );
  }

  database ??= createDatabase(url);
  return database;
}
