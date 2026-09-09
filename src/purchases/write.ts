import { pool } from "../db";
import type { Shop } from "../shops/types";
import type { ParsedLine } from "./types";

const purchaseColumns =
    "id, bought_on, store, raw_name, qty, unit, unit_price, product_id, receipt_id, line_no";

export type SaveResult = {
    duplicate: boolean;
    purchases: Record<string, unknown>[];
};

async function purchasesForReceipt(receiptId: number) {
    const { rows } = await pool.query(
        `select ${purchaseColumns} from purchases where receipt_id = $1 order by line_no`,
        [receiptId],
    );
    return rows;
}

export async function save(
    shop: Shop,
    lines: ParsedLine[],
    sha256: string,
): Promise<SaveResult> {
    const linesToWrite = await shop.enrich(lines);
    if (!linesToWrite.length) {
        return { duplicate: false, purchases: [] };
    }

    const client = await pool.connect();
    try {
        await client.query("begin");
        const inserted = await client.query(
            `insert into receipts (store, bought_on, sha256)
             values ($1, $2, $3)
             on conflict (sha256) do nothing
             returning id`,
            [shop.store, linesToWrite[0]?.bought_on, sha256],
        );
        const receiptId = inserted.rows[0]?.id as number | undefined;
        if (!receiptId) {
            await client.query("rollback");
            const existing = await pool.query(
                "select id from receipts where sha256 = $1",
                [sha256],
            );
            const id = existing.rows[0]?.id as number | undefined;
            if (!id) throw new Error("duplicate receipt missing after conflict");
            return { duplicate: true, purchases: await purchasesForReceipt(id) };
        }

        const written = [];
        for (const [i, line] of linesToWrite.entries()) {
            const { rows } = await client.query(
                `insert into purchases (bought_on, store, raw_name, qty, unit, unit_price, product_id, receipt_id, line_no)
                 values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
                    i + 1,
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
