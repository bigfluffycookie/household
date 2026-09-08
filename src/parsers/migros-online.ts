/** 
 * parses invoices from migros online delivery service. 
 * Subject to change if migros changes the layout.
*/
import type { ParsedLine, ReceiptParser } from "./types";

const source = "migros";

const purchaseRow =
    /^(?<productId>\d{3,})\s+(?<name>.+?)\s+\d+\s+(?<qty>\d+)\s+(?<unitPrice>\d+\.\d{2})(?:\s+\*\d+\.\d{2})?(?<perKg>\s+\/(?:\s+kg)?)?\s+(?<lineTotal>\d+\.\d{2})\s+\d+\.\d%$/;

function match(receipt: string): boolean {
    return receipt.includes("Migros Online AG");
}

function deliveryDate(receipt: string): string {
    const header = receipt.split("Ihre Lieferung im Detail")[0] ?? receipt;
    const dates = [...header.matchAll(/(\d{2}\/\d{2}\/\d{4})/g)].map((m) => m[1]);
    return (dates[2] ?? dates[1] ?? dates[0] ?? "").split("/").reverse().join("-");
}

/** pdf-parse puts /kg and discount leftovers on the next lines. */
function joinWrappedRows(lines: string[]): string[] {
    const rows: string[] = [];
    for (const line of lines) {
        if (!line) continue;
        const prev = rows.at(-1);
        const wrap =
            line === "kg" ||
            line.startsWith("*") ||
            /^\d+\.\d{2}\s+\d+\.\d%$/.test(line);
        if (prev && wrap && !purchaseRow.test(prev)) {
            rows[rows.length - 1] = `${prev} ${line}`;
        } else {
            rows.push(line);
        }
    }
    return rows;
}

function parse(receipt: string): ParsedLine[] {
    const bought_on = deliveryDate(receipt);
    const lines = joinWrappedRows(
        receipt.split(/\r?\n/).map((line) => line.trim()),
    );

    const purchases: ParsedLine[] = [];
    for (const line of lines) {
        if (
            line.startsWith("Lieferkosten") ||
            line.startsWith("CO2") ||
            line.startsWith("Total")
        ) {
            break;
        }

        const row = line.match(purchaseRow)?.groups;
        if (!row?.productId || !row.name || !row.qty || !row.unitPrice) continue;

        const unitPrice = Number(row.unitPrice);
        purchases.push({
            raw_name: row.name,
            qty: Number(row.qty),
            unit_price: unitPrice,
            source,
            bought_on,
            product_id: row.productId,
            weight:
                row.perKg && unitPrice !== 0 && row.lineTotal
                    ? Number(row.lineTotal) / unitPrice
                    : null,
        });
    }
    return purchases;
}

export const migrosOnline: ReceiptParser = {
    source,
    match,
    parse,
};
