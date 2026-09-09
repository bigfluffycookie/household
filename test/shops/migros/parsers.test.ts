import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { pdfToText } from "../../../src/purchases/pdf-to-text.js";
import { detectShop } from "../../../src/shops/index.js";
import type { ParsedLine } from "../../../src/purchases/types.js";

describe("pdf fixtures", () => {
    it("parses an in-store receipt", async () => {
        const text = await textOf("migros-store.pdf");
        const shop = detectShop(text);
        assert.equal(shop.store, "migros");
        assert.deepEqual(shop.parseDocument(text), [
            inStoreLine("M-Budget 1 for all NFB", 1, 2.7),
            inStoreLine("Chocolate Chip Shortb.", 1, 4.95),
            inStoreLine("MClass Bärentatzen", 1, 3.5),
            inStoreLine("Dessert Kugel", 1, 5),
            inStoreLine("YOU Skyr Mokka", 2, 1.8),
            inStoreLine("Bio Eier 4 Stück", 1, 3.5),
            inStoreLine("MClass Butterzopf", 1, 3.85),
            inStoreLine("Rüeblischnitte", 1, 3.5),
            inStoreLine("Ofenschinken", 1, 4.5),
            inStoreLine("Prosciutto hauchdünn", 1, 4.5),
            inStoreLine("Migros Léger Nature", 1, 1.95),
            inStoreLine("Bifidus Drink Mango", 1, 2),
            inStoreLine("Triosalat", 1, 1.85),
            inStoreLine("Yogi Drink Himbeer", 1, 1.35),
        ]);
    });

    it("parses an online invoice", async () => {
        const text = await textOf("migros-online.pdf");
        const shop = detectShop(text);
        assert.equal(shop.store, "migros");
        assert.deepEqual(shop.parseDocument(text), [
            onlineLine("Dill", 1, 2.3, "13551"),
            onlineLine("Salbei", 1, 2.3, "13595"),
            onlineLine("Zwiebeln", 1, 0.8, "4212237"),
            onlineLine("Migros - Schalotten", 1, 1.95, "4212543"),
            onlineLine("Migros Bio - Eier - 63+ Freilandhaltung", 2, 3.5, "6581918"),
            onlineLine("ZEBA - Gebührensäcke - 35l, Zug", 1, 25, "5293394"),
            onlineLine("Chinakohl", 1, 4.9, "61641", 2.7 / 4.9),
            onlineLine("Coca-Cola - Zero - ohne Zuckerzusatz", 1, 14.35, "69306"),
            onlineLine("Migros - Gurken", 1, 1.5, "73424"),
            onlineLine("Kinder - Country", 1, 3.8, "81280"),
            onlineLine("Migros - Granatapfel", 1, 1.8, "122074"),
            onlineLine("Hygo - Ultra Power - WC 3 Phasen Tabs", 3, 3.32, "218240"),
            onlineLine("Longobardi - Passata", 2, 1.55, "218347"),
            onlineLine("Homemade - Cup Lovers - Muffin", 2, 1.95, "4960236"),
            onlineLine("Migros Bio - Peterli - gekraust", 1, 1.6, "7094535"),
            onlineLine("Migros - Zitrone", 3, 0.5, "12789754"),
            onlineLine("Malbuch", 1, 0, "17469885"),
            onlineLine("PET-Sammelsack", 1, 0, "3545100"),
            onlineLine("Floralp - Vorzugsbutter", 1, 3.5, "10847"),
            onlineLine("Galbani - Ricotta", 1, 3.65, "11515"),
            onlineLine("Migros Bio - Poulet- Minifilet", 1, 58.4, "222131", 11.1 / 58.4),
            onlineLine("You - Skyr - Stracciatella", 4, 1.8, "16139727"),
            onlineLine("Story Mania Sticker", 5, 0, "17346910"),
        ]);
    });
});

function textOf(name: string) {
    const file = fileURLToPath(new URL(`./test-pdfs/${name}`, import.meta.url));
    return pdfToText(fs.readFileSync(file));
}

function inStoreLine(
    raw_name: string,
    qty: number,
    unit_price: number,
): ParsedLine {
    return {
        raw_name,
        qty,
        unit_price,
        store: "migros",
        bought_on: "05.09.2026",
        product_id: null,
        weight: null,
    };
}

function onlineLine(
    raw_name: string,
    qty: number,
    unit_price: number,
    product_id: string,
    weight: number | null = null,
): ParsedLine {
    return {
        raw_name,
        qty,
        unit_price,
        store: "migros",
        bought_on: "2026-09-09",
        product_id,
        weight,
    };
}
