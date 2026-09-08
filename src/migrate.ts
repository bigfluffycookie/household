import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export async function migrate() {
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query(
      "select 1 from schema_migrations where id = $1",
      [file],
    );
    if (rows.length) continue;

    const sql = await readFile(path.join(dir, file), "utf8");
    await pool.query(sql);
    await pool.query("insert into schema_migrations (id) values ($1)", [file]);
    console.log("applied", file);
  }
}
