# FINTRACE — production-ready development kit

**Track the market. Trace what changed. Know what matters.**

FINTRACE is an India-focused market-intelligence watchlist built around one differentiator: **market memory**. A user reviews a watchlist, leaves, and later sees the changes that deserve attention.

## What is included

- React + TypeScript + Vite frontend
- Express + TypeScript API
- Deterministic synthetic demo market data
- Snapshot / Since You Last Checked engine
- Attention Score and deterministic explanations
- Search, add/remove watchlist items
- Security detail and history chart
- Compare workflow
- RRG workflow
- Fixed income view
- Alert API
- Simulate / reset demo mode
- PostgreSQL production schema
- Vercel deployment configuration/runbook
- Original synthetic raw data generation
- Product backlog and data policy

## Quick start

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:5173.

## Demo script

1. Review the watchlist.
2. Click **Mark reviewed**.
3. Click **Simulate market movement**.
4. Open **Since You Last Checked**.
5. Open RELIANCE and inspect the deterministic explanation.
6. Compare securities.
7. Open RRG.
8. Open Fixed Income.
9. Reset demo and repeat.

## Data

Included market data is synthetic and generated for development. It is deliberately labeled `DEMO`. It is not copied from a market website and is not a substitute for a licensed production feed.

## Deployment

See `docs/DEPLOYMENT.md`.
