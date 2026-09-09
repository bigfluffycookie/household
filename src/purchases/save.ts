import type { PoolClient } from "pg";
import { pool } from "../db";
import type { Shop } from "../shops/types";
import type { ParsedLine, PurchaseRow } from "./types";

const purchaseColumns =
    "id, bought_on, store, raw_name, qty, unit, unit_price, product_id, receipt_id";

export type SaveResult = {
    duplicate: boolean;
    purchases: PurchaseRow[];
};

async function purchasesForReceipt(client: PoolClient, receiptId: number) {
    const { rows } = await client.query<PurchaseRow>(
        `select ${purchaseColumns} from purchases where receipt_id = $1 order by id`,
        [receiptId],
    );
    return rows;
}

export async function save(
    shop: Shop,
    lines: ParsedLine[],
    sha256: string,
): Promise<SaveResult> {
    const first = lines[0];
    if (!first) {
        return { duplicate: false, purchases: [] };
    }

    const client = await pool.connect();
    try {
        await client.query("begin");
        const inserted = await client.query<{ id: number }>(
            `insert into receipts (store, bought_on, sha256)
             values ($1, $2, $3)
             on conflict (sha256) do nothing
             returning id`,
            [shop.store, first.bought_on, sha256],
        );
        const receiptId = inserted.rows[0]?.id;
        if (!receiptId) {
            const existing = await client.query<{ id: number }>(
                "select id from receipts where sha256 = $1",
                [sha256],
            );
            const id = existing.rows[0]?.id;
            if (!id) throw new Error("duplicate receipt missing after conflict");
            const purchases = await purchasesForReceipt(client, id);
            await client.query("commit");
            return { duplicate: true, purchases };
        }

        const written: PurchaseRow[] = [];
        for (const line of lines) {
            const { rows } = await client.query<PurchaseRow>(
                `insert into purchases (bought_on, store, raw_name, qty, unit, unit_price, product_id, receipt_id)
                 values ($1, $2, $3, $4, $5, $6, $7, $8)
                 returning ${purchaseColumns}`,
                [
                    line.bought_on,
                    line.store,
                    line.raw_name,
                    line.qty,
                    line.unit,
                    line.unit_price,
                    line.product_id,
                    receiptId,
                ],
            );
            const row = rows[0];
            if (!row) throw new Error("insert returned no row");
            written.push(row);
        }
        await client.query("commit");
        return { duplicate: false, purchases: written };
    } catch (err) {
        await client.query("rollback");
        throw err;
    } finally {
        client.release();
    }
}
