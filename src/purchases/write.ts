import { pool } from "../db";
import type { Shop } from "../shops/types";
import type { ParsedLine } from "./types";

function toIsoDate(boughtOn: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(boughtOn)) return boughtOn;
    return boughtOn.split(".").reverse().join("-");
}

async function writePurchases(lines: ParsedLine[]) {
    const written = [];
    for (const line of lines) {
        const { rows } = await pool.query(
            `insert into purchases (bought_on, store, raw_name, qty, unit_price, weight, product_id)
             values ($1, $2, $3, $4, $5, $6, $7)
             returning id, bought_on, store, raw_name, qty, unit_price, weight, product_id`,
            [
                toIsoDate(line.bought_on),
                line.store,
                line.raw_name,
                line.qty,
                line.unit_price,
                line.weight,
                line.product_id,
            ],
        );
        const row = rows[0];
        if (!row) throw new Error("insert returned no row");
        written.push(row);
    }
    return written;
}

export async function save(shop: Shop, lines: ParsedLine[]) {
    return writePurchases(await shop.enrich(lines));
}
