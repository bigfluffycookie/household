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
