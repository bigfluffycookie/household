import { pool } from "../db";
import type { ItemRow, Purchase } from "./types";

const itemColumns = "id, name, qty, unit, price, receipt_id";

export async function save(purchase: Purchase): Promise<ItemRow[]> {
    if (!purchase.items.length) {
        return [];
    }

    const client = await pool.connect();
    try {
        await client.query("begin");
        const inserted = await client.query<{ id: number }>(
            `insert into receipts (store, bought_on, external_id)
             values ($1, $2, $3)
             on conflict (store, external_id) do nothing
             returning id`,
            [purchase.store, purchase.bought_on, purchase.external_id],
        );
        const receiptId = inserted.rows[0]?.id;
        if (!receiptId) {
            await client.query("rollback");
            console.log(
                `Skipping receipt ${purchase.external_id}: already committed`,
            );
            return [];
        }

        const written: ItemRow[] = [];
        for (const item of purchase.items) {
            const { rows } = await client.query<ItemRow>(
                `insert into purchases (name, qty, unit, price, receipt_id)
                 values ($1, $2, $3, $4, $5)
                 returning ${itemColumns}`,
                [item.name, item.qty, item.unit, item.price, receiptId],
            );
            const row = rows[0];
            if (!row) throw new Error("insert returned no row");
            written.push(row);
        }
        await client.query("commit");
        return written;
    } catch (err) {
        await client.query("rollback");
        throw err;
    } finally {
        client.release();
    }
}
