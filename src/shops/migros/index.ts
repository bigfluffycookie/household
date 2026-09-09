import type { Shop } from "../types";
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
        // TODO
        return []
    },
};
