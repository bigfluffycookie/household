create table receipts (
  id serial primary key,
  store text not null,
  bought_on date not null,
  external_id text not null,
  unique (store, external_id)
);

comment on table receipts is
  'One till visit or order. Item rows belong to a receipt.';
comment on column receipts.external_id is
  'Shop-native id, unique per store. In-store Migros: Filiale-Kasse-Bon-date.';

create table purchases (
  id serial primary key,
  name text not null,
  qty numeric not null,
  unit text not null,
  price numeric,
  receipt_id integer not null references receipts(id),
  constraint purchases_unit_check check (unit in ('pcs', 'kg'))
);

comment on table purchases is
  'Append-only receipt lines.';
comment on column purchases.name is
  'Item name as printed on the receipt.';
comment on column purchases.qty is
  'Pack count for pcs, kilograms for kg.';
