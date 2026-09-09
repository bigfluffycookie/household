import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db";
import { detectShop } from "../shops";
import { pdfToText } from "./pdf-to-text";
import { save } from "./write";

async function fromPdf(bytes: Buffer) {
    const text = await pdfToText(bytes);
    const shop = detectShop(text);
    return save(shop, shop.parseDocument(text));
}

const isMain =
    path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);

if (isMain) {
    const file = process.argv[2];
    if (!file) {
        console.error(
            "usage: npx tsx --env-file=.env src/purchases/from-pdf.ts <file.pdf>",
        );
        process.exit(1);
    }
    await fromPdf(fs.readFileSync(file));
    await pool.end();
}
