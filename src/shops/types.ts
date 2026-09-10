import type { Purchase } from "../purchases/types";

export type Shop = {
    store: string;
    match(text: string): boolean;
    parseDocument(text: string): Purchase | null;
};
