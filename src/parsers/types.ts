export type ParsedLine = {
    raw_name: string;
    qty: number;
    unit_price: number | null;
    source: string;
    bought_on: string;
    product_id: string | null;
    weight: number | null;
};

export type ReceiptParser = {
    source: string;
    match: (text: string) => boolean;
    parse: (text: string) => ParsedLine[];
};