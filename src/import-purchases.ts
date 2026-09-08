import fs from "node:fs";
import { PDFParse } from "pdf-parse";
import { pool } from "./db";
import { parseReceipt } from "./parsers";

const path = process.argv[2];
if (!path) {
    console.error("usage: npx tsx src/import-purchases.ts <file.pdf>");
    process.exit(1);
}

function toIsoDate(boughtOn: string): string {
    return boughtOn.split(".").reverse().join("-");
}

const pdf = new PDFParse({ data: fs.readFileSync(path) });
const { text } = await pdf.getText();
await pdf.destroy();

const purchases = parseReceipt(text);

for (const purchase of purchases) {
    await pool.query(
        `insert into purchases (bought_on, source, raw_name, qty, unit_price, product_id)
         values ($1, $2, $3, $4, $5, $6)`,
        [
            toIsoDate(purchase.bought_on),
            purchase.source,
            purchase.raw_name,
            purchase.qty,
            purchase.unit_price,
            purchase.product_id,
        ],
    );
}

await pool.end();
