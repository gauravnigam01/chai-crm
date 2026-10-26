# Chai Tracker

Simple tracker for a tea stall / office tea service: who got what (tea, coffee, snacks…) in the morning, afternoon and evening, and how much each customer owes.

- **Entry** — pick the date, shift and item, then tap + / − next to each customer.
- **Daily Report** — one day's sales by item and shift, plus who got what in each shift. Share on WhatsApp.
- **Bills** — totals for all customers for this week, this month, last month or any date range. Tap a customer to open their own bill (with mobile and address), then send it on WhatsApp or print it.
- **Customers** — "+ Add customer" opens a form for name, mobile and office address. Every customer has a **Bill** button.
- **Items** — add items with a price. Prices are stored on each entry, so changing a price never changes old bills.
- **Settings** — backup download/restore.

Customers and items that already have entries are hidden instead of deleted, so old reports stay correct.

All data is saved in the browser (localStorage) on the device where it is entered. There is no server, so take a backup from Settings regularly. Data from the first version (tea only) is migrated automatically.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

`render.yaml` deploys it as a free Render static site. Redeploying does not touch saved data because the data lives in the browser.
