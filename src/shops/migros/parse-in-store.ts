/**
 * parses receipts from migros in store purchases.
 * Subject to change if migros changes the layout.
 */
import type { Purchase, Item } from "../../purchases/types";

const store = "migros";

const purchaseRow =
    /^(?<name>.*)\s+(?<qty>\d+(?:\.\d+)?)\s+\d+\.\d{2}(?:\s+\d+\.\d{2})?\s+(?<price>\d+\.\d{2})\s+\d+$/;

const footerRow =
    /^(?<filiale>\d+)\s+\d+\s+(?<kasse>\d+)\s+(?<bon>\d+)\s+(?<date>\d{2}\.\d{2}\.\d{4})\b/;

function match(receipt: string): boolean {
    return receipt.includes("Artikelbezeichnung");
}

function toIso(day: string, month: string, year: string): string {
    return `${year}-${month}-${day}`;
}

function getFooterData(line: string) {
    const row = line.match(footerRow)?.groups;
    if (!row?.filiale || !row.kasse || !row.bon || !row.date) return null;
    const [day, month, year] = row.date.split(".");
    if (!day || !month || !year) return null;
    const bought_on = toIso(day, month, year);
    return {
        external_id: `${row.filiale}-${row.kasse}-${row.bon}-${bought_on}`,
        bought_on,
    };
}

function getExternalId(receipt: string) {
    const lines = receipt.split(/\r?\n/).map((line) => line.trim());
    for (const line of lines) {
        const parsed = getFooterData(line);
        if (parsed) return parsed;
    }
    console.warn("External Id could not be parsed from migros receipt.")
    return null;
}

function getItems(receipt: string): Item[] {
    const lines = receipt.split(/\r?\n/).map((line) => line.trim());
    const header = lines.findIndex((line) =>
        line.startsWith("Artikelbezeichnung"),
    );
    if (header === -1) return [];

    const parsed: Item[] = [];
    for (const line of lines.slice(header + 1)) {
        if (line.startsWith("Zwischentotal")) break;
        if (!line || line.startsWith("Kassentragtasche")) continue;

        const row = line.match(purchaseRow)?.groups;
        if (!row?.name || !row.qty || !row.price) continue;

        parsed.push({
            name: row.name,
            qty: Number(row.qty),
            unit: row.qty.includes(".") ? "kg" : "pcs",
            price: Number(row.price),
        });
    }
    return parsed;
}

export function parse(receipt: string): Purchase | null {
    const externalId = getExternalId(receipt);
    if (!externalId) return null;

    const parsedItems = getItems(receipt);
    if (!parsedItems.length) return null;

    return { store, ...externalId, items: parsedItems };
}

export const migrosStore = {
    store,
    match,
    parse,
};
