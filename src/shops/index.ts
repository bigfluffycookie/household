import { migros } from "./migros/index";
import type { Shop } from "./types";

export type { Shop } from "./types";

export const shops: Shop[] = [migros];

export function detectShop(text: string): Shop {
    const shop = shops.find((s) => s.match(text));
    if (!shop) {
        throw new Error("no shop for this document");
    }
    return shop;
}
