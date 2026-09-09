export type PurchaseUnit = "pcs" | "kg";

export type ParsedLine = {
    raw_name: string;
    qty: number;
    unit: PurchaseUnit;
    unit_price: number | null;
    store: string;
    bought_on: string;
    product_id: string | null;
};

export type PurchaseRow = {
    id: number;
    bought_on: string;
    store: string;
    raw_name: string;
    qty: number;
    unit: PurchaseUnit;
    unit_price: number | null;
    product_id: string | null;
    receipt_id: number;
};
