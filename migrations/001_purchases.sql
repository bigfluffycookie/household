create table purchases (
  id serial primary key,
  bought_on date not null,
  source text not null,
  raw_name text not null,
  qty numeric not null,
  unit_price numeric,
  weight numeric,
  pack_count numeric,
  product_id text
);
