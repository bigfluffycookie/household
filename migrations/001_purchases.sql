create table receipts (
  id serial primary key,
  store text not null,
  bought_on date not null,
  sha256 text not null unique
);

comment on table receipts is
  'One imported receipt or invoice. Purchase lines belong to a receipt.';
comment on column receipts.sha256 is
  'SHA-256 of the source PDF. Same file cannot be imported twice.';

create table purchases (
  id serial primary key,
  bought_on date not null,
  store text not null,
  raw_name text not null,
  qty numeric not null,
  unit text not null,
  unit_price numeric,
  product_id text,
  receipt_id integer references receipts(id),
  line_no integer,
  constraint purchases_unit_check check (unit in ('pcs', 'kg')),
  constraint purchases_receipt_line unique (receipt_id, line_no)
);

comment on table purchases is
  'Append-only receipt lines.';
comment on column purchases.store is
  'Shop the receipt came from.';
comment on column purchases.raw_name is
  'Item name as printed on the receipt.';
comment on column purchases.qty is
  'How much of unit was bought. Pack count for pcs, kilograms for kg.';
comment on column purchases.unit is
  'pcs for packed items, kg for items sold by weight.';
comment on column purchases.product_id is
  'Store product id from the receipt, when present.';
comment on column purchases.receipt_id is
  'Receipt this line was imported from.';
comment on column purchases.line_no is
  '1-based line index on that receipt.';
