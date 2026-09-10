export type PurchaseUnit = "pcs" | "kg";

export type Purchase = {
    store: string;
    external_id: string;
    bought_on: string;
    items: Item[];
};

export type Item = {
    name: string;
    qty: number;
    unit: PurchaseUnit;
    price: number | null;
};

export type ItemRow = Item & {
    id: number;
    receipt_id: number;
};