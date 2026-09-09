import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db";
import { migrate } from "../migrate";
import { detectShop } from "../shops";
import { pdfToText } from "../utils.ts/pdf-to-text";
import { save } from "./write";

function readPdfFile(file: string): Buffer {
    let stat;
    try {
        stat = fs.statSync(file);
    } catch (err) {
        const code =
            err && typeof err === "object" && "code" in err ? err.code : undefined;
        if (code === "ENOENT") throw new Error(`file not found: ${file}`);
        throw err;
    }
    if (!stat.isFile()) throw new Error(`not a file: ${file}`);
    if (!file.toLowerCase().endsWith(".pdf")) {
        throw new Error(`not a pdf: ${file}`);
    }
    const bytes = fs.readFileSync(file);
    if (bytes.length === 0) throw new Error(`file is empty: ${file}`);
    return bytes;
}

async function fromPdf(bytes: Buffer) {
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    let text: string;
    try {
        text = await pdfToText(bytes);
    } catch {
        throw new Error("could not read pdf");
    }
    if (!text.trim()) throw new Error("no text in this pdf");

    const shop = detectShop(text);
    const lines = shop.parseDocument(text);
    if (!lines.length) throw new Error("no items parsed from this document");
    if (lines.some((line) => !/^\d{4}-\d{2}-\d{2}$/.test(line.bought_on))) {
        throw new Error("could not parse receipt date");
    }
    return save(shop, lines, sha256);
}

const isMain =
    path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);

if (isMain) {
    const file = process.argv.slice(2).find((arg) => arg !== "--");
    if (!file) {
        console.error("usage: npm run from-pdf -- <file.pdf>");
        process.exit(1);
    }
    try {
        const bytes = readPdfFile(file);
        await migrate();
        const { duplicate, purchases } = await fromPdf(bytes);
        console.log(
            duplicate
                ? `already imported, ${purchases.length} purchases`
                : `wrote ${purchases.length} purchases`,
        );
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}
