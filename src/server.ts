import Fastify from "fastify";
import { migrate } from "./migrate";
import { pool } from "./db";

await migrate();

const app = Fastify({ logger: true });

app.get("/health", async () => {
    return { ok: true };
});

app.get("/purchases", async () => {
    const { rows } = await pool.query(
        "select id, name, qty, unit, price, receipt_id from purchases order by id",
    );
    return rows;
});

await app.listen({ port: 3000, host: "127.0.0.1" });