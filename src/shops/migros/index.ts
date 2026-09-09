import type { ParsedLine } from "../../purchases/types";
import type { Shop } from "../types";
import { byId } from "./lookup";
import { migrosStore } from "./parse-in-store";
import { migrosOnline } from "./parse-online";

const parsers = [migrosStore, migrosOnline];

export const migros: Shop = {
    store: "migros",
    match(text) {
        return parsers.some((parser) => parser.match(text));
    },
    parseDocument(text) {
        const parser = parsers.find((p) => p.match(text));
        if (!parser) {
            throw new Error("no migros parser for this document");
        }
        return parser.parse(text);
    },
    async enrich(lines) {
        const out: ParsedLine[] = [];
        for (const line of lines) {
            if (!line.product_id) {
                out.push(line);
                continue;
            }
            const extra = await byId(line.product_id);
            out.push(
                extra ? { ...line, product_id: extra.migrosId } : line,
            );
        }
        return out;
    },
};
