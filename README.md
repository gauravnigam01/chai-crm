# Chai Hisaab

Simple tea-delivery tracker: who got how many cups of chai in the morning (Subah), afternoon (Dopahar) and evening (Shaam), and how much each person owes.

- **Chai likho** — pick the date and shift, tap + / − next to each name.
- **Hisaab** — totals per person for today, this week, this month, last month or any date range, split by shift, with the grand total bill. Tap a name for a day-wise bill and send it on WhatsApp.
- **Log** — add, rename, or remove people (people with past entries are hidden, not deleted, so old bills stay correct).
- **Settings** — chai rate (stored per entry, so changing the rate never changes old bills), backup download/restore.

All data is saved in the browser (localStorage) on the device where it is entered. There is no server, so take a backup from Settings regularly.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

`render.yaml` deploys it as a free Render static site. Redeploying does not touch saved data because the data lives in the browser.
