/**
 * parses receipts from migros in store purchases.
 * Subject to change if migros changes the layout.
 */
import type { ParsedLine } from "../../purchases/types";

const store = "migros";

const purchaseRow =
    /^(?<name>.*)\s+(?<qty>\d+)\s+(?<unitPrice>\d+\.\d{2})(?:\s+\d+\.\d{2})?\s+\d+\.\d{2}\s+\d+$/;

function match(receipt: string): boolean {
    return receipt.includes("Artikelbezeichnung");
}

function parse(receipt: string): ParsedLine[] {
    const bought_on = receipt.match(/(\d{2}\.\d{2}\.\d{4})/)?.[1] ?? "";

    const lines = receipt.split(/\r?\n/).map((line) => line.trim());
    const header = lines.findIndex((line) =>
        line.startsWith("Artikelbezeichnung"),
    );
    if (header === -1) return [];

    const purchases: ParsedLine[] = [];
    for (const line of lines.slice(header + 1)) {
        if (line.startsWith("Zwischentotal")) break;
        if (!line || line.startsWith("Kassentragtasche")) continue;

        const row = line.match(purchaseRow)?.groups;
        if (!row?.name || !row.qty || !row.unitPrice) continue;

        purchases.push({
            raw_name: row.name,
            qty: Number(row.qty),
            unit_price: Number(row.unitPrice),
            store,
            bought_on,
            product_id: null,
            weight: null,
        });
    }
    return purchases;
}

export const migrosStore = {
    store,
    match,
    parse,
};
