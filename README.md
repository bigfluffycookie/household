# Household

Personal tool for turning grocery receipts into a Postgres table of purchases.

Right now it imports **Migros** PDFs (in-store receipts and Migros Online invoices) via a CLI. More shops will be added in the future.

## What it stores

A receipt is one shopping trip, stored in a single canonical shape no matter where it came from.

Paper till slip, PDF, or online invoice all become the same record: store, date, lines, totals. That is how shopping from different shops is unified.

Identity is the shop plus that shop’s own id (`external_id`) — which is a unique identifier to avoid duplicate uploads of the same shopping trip.

**Purchases** are the items of that receipt. (name, qty, `pcs` or `kg`, price). 

## Setup

Needs Node 22+ (for `process.loadEnvFile`) and Docker.

```bash
npm install
docker compose up -d --wait
```

Create a `.env` in the repo root:

```
DATABASE_URL=postgres://household:household@localhost:5432/household
```

Migrations run automatically on CLI/server start.

## Import a PDF

```bash
node bin/household.mjs import path/to/receipt.pdf
```

First time: writes the receipt and its lines. Same file again: `Skipping receipt …: already committed` and `wrote 0 items`.

## HTTP (optional)

```bash
npm start
```

- `GET /health`
- `GET /purchases` — all line items

## Tests

Parser tests use redacted fixture PDFs. They do not need Postgres.

```bash
npm test
```
