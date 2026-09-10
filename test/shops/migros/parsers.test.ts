import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { pdfToText } from "../../../src/utils/pdf-to-text.js";
import { detectShop } from "../../../src/shops/index.js";
import type { Item, PurchaseUnit } from "../../../src/purchases/types.js";

describe("pdf fixtures", () => {
    it("parses an in-store receipt", async () => {
        const text = await textOf("migros-store.pdf");
        const shop = detectShop(text);
        assert.equal(shop.store, "migros");
        assert.deepEqual(shop.parseDocument(text), {
            store: "migros",
            external_id: "0000001-001-0001-2026-08-28",
            bought_on: "2026-08-28",
            items: [
                item("MClass Orange mild", 1, 1.8),
                item("MClass Apfelsaft 1l", 1, 1.3),
                item("Lotus Karamell Crème", 1, 4.4),
                item("Schweinsbrust", 0.319, 6.85, "kg"),
                item("YOU Skyr Stracciatella", 4, 7.2),
                item("Bio Zucchetti", 1, 2.95),
                item("Bio Mungosprossen", 1, 1.4),
                item("YOU Skyr Mokka", 2, 3.6),
                item("Bundzwiebeln", 1, 1.7),
                item("Schwedentorte", 1, 14.5),
                item("Zweifel Corn Chips", 2, 4.8),
                item("Coca-Cola Vanilla", 1, 1.1),
            ],
        });
    });

    it("parses in-store catch-weight as kg", () => {
        const text = [
            "Artikelbezeichnung Menge Preis Gespart Total #",
            "Zucchetti 0.157 3.50 0.55 1",
            "YOU Skyr Mokka 2 1.80 3.60 1",
            "Zwischentotal 4.15",
            "1 0 1 1 05.09.2026",
        ].join("\n");
        const shop = detectShop(text);
        assert.deepEqual(shop.parseDocument(text), {
            store: "migros",
            external_id: "1-1-1-2026-09-05",
            bought_on: "2026-09-05",
            items: [
                item("Zucchetti", 0.157, 0.55, "kg"),
                item("YOU Skyr Mokka", 2, 3.6),
            ],
        });
    });

    it("parses an online invoice", async () => {
        const text = await textOf("migros-online.pdf");
        const shop = detectShop(text);
        assert.equal(shop.store, "migros");
        assert.deepEqual(shop.parseDocument(text), {
            store: "migros",
            external_id: "abc-033415210-xyz",
            bought_on: "2026-09-09",
            items: [
                item("Dill", 1, 2.3),
                item("Salbei", 1, 2.3),
                item("Zwiebeln", 1, 0.8),
                item("Migros - Schalotten", 1, 1.95),
                item("Migros Bio - Eier - 63+ Freilandhaltung", 2, 7),
                item("ZEBA - Gebührensäcke - 35l, Zug", 1, 25),
                item("Chinakohl", 0.55, 2.7, "kg"),
                item("Coca-Cola - Zero - ohne Zuckerzusatz", 1, 14.35),
                item("Migros - Gurken", 1, 1.5),
                item("Kinder - Country", 1, 3.8),
                item("Migros - Granatapfel", 1, 1.8),
                item("Hygo - Ultra Power - WC 3 Phasen Tabs", 3, 9.96),
                item("Longobardi - Passata", 2, 3.1),
                item("Homemade - Cup Lovers - Muffin", 2, 3.9),
                item("Migros Bio - Peterli - gekraust", 1, 1.6),
                item("Migros - Zitrone", 3, 1.5),
                item("Malbuch", 1, 0),
                item("PET-Sammelsack", 1, 0),
                item("Floralp - Vorzugsbutter", 1, 3.5),
                item("Galbani - Ricotta", 1, 3.65),
                item("Migros Bio - Poulet- Minifilet", 0.19, 11.1, "kg"),
                item("You - Skyr - Stracciatella", 4, 7.2),
                item("Story Mania Sticker", 5, 0),
            ],
        });
    });
});

function textOf(name: string) {
    const file = fileURLToPath(new URL(`./pdfs/${name}`, import.meta.url));
    return pdfToText(fs.readFileSync(file));
}

function item(
    name: string,
    qty: number,
    price: number,
    unit: PurchaseUnit = "pcs",
): Item {
    return { name, qty, unit, price };
}
