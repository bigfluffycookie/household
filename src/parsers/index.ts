import { migrosStore } from "./migros-in-store";
import { migrosOnline } from "./migros-online";
import type { ParsedLine, ReceiptParser } from "./types";

const parsers: ReceiptParser[] = [migrosStore, migrosOnline];

export function pickParser(text: string): ReceiptParser {
    const parser = parsers.find((p) => p.match(text));
    if (!parser) {
        throw new Error("no parser for this receipt");
    }
    return parser;
}

export function parseReceipt(text: string): ParsedLine[] {
    return pickParser(text).parse(text);
}
