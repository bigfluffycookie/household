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
        "select id, bought_on, source, store, raw_name, qty, unit_price from purchases order by id",
    );
    return rows;
});


await app.listen({ port: 3000, host: "127.0.0.1" });