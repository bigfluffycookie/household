create table purchases (
  id serial primary key,
  bought_on date not null,
  store text not null,
  raw_name text not null,
  qty numeric not null,
  unit_price numeric,
  weight numeric,
  product_id text
);

comment on table purchases is
  'Append-only receipt lines.';
comment on column purchases.store is
  'Shop the receipt came from.';
comment on column purchases.raw_name is
  'Item name as printed on the receipt.';
comment on column purchases.qty is
  'How many of this line were bought.';
comment on column purchases.product_id is
  'Store product id from the receipt, when present.';
