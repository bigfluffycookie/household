import { createHash } from "node:crypto";
import fs from "node:fs";
import { detectShop } from "../shops";
import { pdfToText } from "../utils/pdf-to-text";
import { save } from "./save";

function sha256(bytes: Buffer) {
    return createHash("sha256").update(bytes).digest("hex");
}

function isIsoDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function readPdfFile(file: string): Buffer {
    if (!file.toLowerCase().endsWith(".pdf")) {
        throw new Error(`not a pdf: ${file}`);
    }
    const bytes = fs.readFileSync(file);
    if (!bytes.length) throw new Error(`file is empty: ${file}`);
    return bytes;
}

export async function fromPdf(file: string) {
    const bytes = readPdfFile(file);
    const text = await pdfToText(bytes);
    if (!text.trim()) throw new Error("no text in this pdf");

    const shop = detectShop(text);
    const lines = shop.parseDocument(text);
    if (!lines.length) throw new Error("no items parsed from this document");
    if (lines.some((line) => !isIsoDate(line.bought_on))) {
        throw new Error("could not parse receipt date");
    }

    return save(shop, lines, sha256(bytes));
}
