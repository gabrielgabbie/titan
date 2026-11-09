# Titan Foresight

Foresight (powered by Titan) — Mastercard detection-queue triage, built from the **Titan** section of the
[Titan Foresight (Mastercard) Figma prototype](https://www.figma.com/design/xGMGiOYpYYiehaXZIIHtwn/Titan-Foresight--Mastercard-?node-id=3096-84014).

Next.js 15 (App Router) · Tailwind CSS v4 · [shadcn/ui](https://ui.shadcn.com) · Recharts.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Screens

| Route | Figma flow |
| --- | --- |
| `/queues` | Queue View — Detection Queues list |
| `/queues/[queueId]` | Detection Queue — summary bar, alerted-merchant grid, Mark Work & Disposition popover, View picker, Edit / Create View sheet |
| `/merchants` | Merchant View — Alerted Merchants grid with per-merchant queues popover and pagination |
| `/merchants/[mid]` | Merchant Details — alert status, MC Score chart/grid, transaction history, cases, merchant notes |
| DQ Details dialog | Opened from any "DQ Details" link — parameter results, today's cycles, alert history |

## Structure

- `src/components/ui/*` — shadcn components (generated; theme tokens in `src/app/globals.css`)
- `src/components/titan/*` — app components (sidebar, alert grid, disposition control, view sheet, DQ dialog…)
- `src/lib/data.ts` — mock data for Report Date 10/28/2026
- `src/lib/store.tsx` — client state (work status, saved views, notes, cases) — in-memory, resets on reload
