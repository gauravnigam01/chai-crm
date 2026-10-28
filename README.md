# Chai Tracker

Phone-first, simple tracker for a tea stall / office tea service: who got what (tea, coffee, snacks…) in the morning, afternoon and evening, and how much each customer owes.

- **Home** — customer cards. Tap a customer, then tap big Tea / Coffee / Juice buttons (each tap adds one, “− 1” undoes). “Something else” adds a typed-in item with its total; “Money received” records a payment. Date and shift are picked automatically (tap Change to edit).
- **Daily Report** — one day's sales by item and shift, plus who got what in each shift. Share on WhatsApp.
- **Bills** — totals for all customers for this week, this month, last month or any date range. Tap a customer to open their own bill (with mobile and address), then send it on WhatsApp or print it.
- **Customers** — "+ Add customer" opens a form for name, mobile and office address. Every customer has a **Bill** button.
- **Items** — add items with a price. Prices are stored on each entry, so changing a price never changes old bills.
- **Payments** — "💰 Receive" (in Entry, Customers and each bill) records cash/UPI received. Each customer shows their all-time balance: **Due** (they owe you), **Advance** (they paid extra, you owe them) or **Settled**. Bills shows the total still to collect; the Daily Report shows payments received that day.
- **Settings** — backup download/restore.

Customers and items that already have entries are hidden instead of deleted, so old reports stay correct.

All data is saved in the browser (localStorage) on the device where it is entered. There is no server, so take a backup from Settings regularly. Data from the first version (tea only) is migrated automatically.

On phones the app uses a bottom bar (Home, Bills, Report, More); Customers, Items and Backup are under More. On a computer the same pages are in a sidebar.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

`render.yaml` deploys it as a free Render static site. Redeploying does not touch saved data because the data lives in the browser.
