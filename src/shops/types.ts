import type { ParsedLine } from "../purchases/types";

export type Shop = {
    store: string;
    match(text: string): boolean;
    parseDocument(text: string): ParsedLine[];
};
