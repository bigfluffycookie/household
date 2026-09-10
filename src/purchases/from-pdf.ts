import fs from "node:fs";
import { detectShop } from "../shops";
import { pdfToText } from "../utils/pdf-to-text";
import { save } from "./save";
import { type ItemRow } from "./types"

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

export async function fromPdf(file: string): Promise<ItemRow[]> {
    const bytes = readPdfFile(file);
    const text = await pdfToText(bytes);
    if (!text.trim()) throw new Error("no text in this pdf");

    const shop = detectShop(text);
    const purchase = shop.parseDocument(text);
    if (!purchase) throw new Error("no items parsed from this document");
    if (!isIsoDate(purchase.bought_on)) {
        throw new Error("could not parse receipt date");
    }
    if (!purchase.external_id) {
        throw new Error("could not parse external id");
    }

    return save(purchase);
}
