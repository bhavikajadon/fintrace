FINTRACE

Your market, with a memory.

FINTRACE is an India-focused market intelligence dashboard designed to help users understand what changed in the market, why it matters, and what deserves attention.

Track the market. Trace what changed. Know what matters.

Live Demo

Production: https://fintrace-production-kit.vercel.app

The current deployment runs in DEMO mode using an original synthetic market-data fixture. It does not scrape or redistribute unofficial NSE data.

What FINTRACE Does

FINTRACE combines a market dashboard with analytical memory.

Core workflow:

Review the market

Mark a watchlist as reviewed

Simulate a market movement

See what changed since the previous review

Open a security for deeper analysis

Understand why the change matters

Compare securities

Inspect RRG positioning

Review fixed-income indicators

Create metric-based alerts

The central idea is:

A market dashboard should not only tell you where prices are. It should help you understand what changed since you last looked.

Key Features

Watchlists

Track selected securities

Add/remove securities

Reorder watchlist items

Capture market snapshots

Since You Last Checked

FINTRACE compares the current watchlist state with a previous snapshot using:

Price movement

Relative performance

Volume anomaly

Volatility

Bid/ask spread

Attention score

Security Detail

Price

Bid / ask

Volume

Historical prices

Return windows

Relative performance versus NIFTY 50

Spread information

Volatility

Attention score

Deterministic explanation

Compare

Compare multiple securities using consistent market metrics.

Relative Rotation Graph (RRG)

Relative Strength = security performance relative to NIFTY 50

Momentum = change in relative strength

Quadrants: Leading, Improving, Lagging, Weakening

RRG is descriptive, not predictive.

Fixed Income

GSEC 5Y yield

GSEC 10Y yield

10Y–5Y spread

Spread movement

Alerts

Create alerts using a security, metric, operator, and threshold.

Market Simulation

The DEMO environment includes deterministic price and volume changes so the full workflow can be demonstrated without live market data.

Attention Score

FINTRACE uses a deterministic 0–100 Attention Score.

Component

Weight

Price movement

35%

Relative performance

25%

Volume anomaly

20%

Volatility

10%

Spread / yield

10%

Score

Level

0–29

LOW

30–59

MODERATE

60–79

HIGH

80–100

CRITICAL

The score is an investigation aid, not a prediction or buy/sell recommendation.

Explainability

FINTRACE deliberately avoids inventing market narratives.

Explanations are based on measurable changes such as price, relative performance, volume, volatility, and spread/yield.

When a verified market event or source is unavailable, the system does not fabricate a news explanation and instead reports:

No verified market event detected.

Data Reliability

The architecture supports explicit reliability states:

LIVE

DELAYED

STALE

DEMO

ERROR

Timestamps are exposed so users can understand data freshness.

Architecture

FINTRACE UI
React + TypeScript + Vite
        |
        | REST API
        v
Express + TypeScript API
        |
        +-------------------+
        |                   |
        v                   v
Change / Analytics      Alert Engine
Engine
        |
        v
Data Abstraction
        |
        +-------------------+
        |                   |
        v                   v
JSON DEMO Store       PostgreSQL Layer

Frontend

React

TypeScript

Vite

Recharts

Backend

Node.js

Express

TypeScript

PostgreSQL support through pg

Persistence

The current evaluation deployment uses a JSON-backed DEMO state. A PostgreSQL schema and database layer are included for production evolution.

API

System

GET  /
GET  /health
GET  /api/status

Securities

GET  /api/securities
GET  /api/securities/:id
GET  /api/securities/:id/history

Watchlists

GET  /api/watchlists
POST /api/watchlists/:id/items
DELETE /api/watchlists/:id/items/:securityId
PUT  /api/watchlists/:id/items/reorder
POST /api/watchlists/:id/snapshot

Demo

POST /api/demo/simulate
POST /api/demo/reset
GET  /api/export/demo.json

Analytics

GET /api/rrg
GET /api/fixed-income

Alerts

GET    /api/alerts
POST   /api/alerts
DELETE /api/alerts/:id

Demo Data

The repository contains an original synthetic fixture covering representative securities including:

RELIANCE

TCS

INFY

HDFCBANK

ICICIBANK

SBIN

ITC

BHARTIARTL

LT

AXISBANK

NIFTY50

NIFTYBANK

GSEC5Y

GSEC10Y

This is synthetic/demo data, not live NSE data and not investment information.

Production Data Architecture

The intended production flow is:

Licensed / Authorized Market Data
              |
              v
       Provider Adapter
              |
              v
        Normalization
              |
              v
        Data Validation
              |
              v
          PostgreSQL
              |
              v
       Analytics Engine
              |
              v
          REST API
              |
              v
        FINTRACE UI

This provider abstraction is intentional: real exchange data should be connected through an appropriately licensed or authorized source.

Project Structure

FINTRACE_PRODUCTION_KIT/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── store.ts
│   │   ├── db.ts
│   │   ├── analytics.ts
│   │   └── seed.ts
│   ├── data/
│   ├── package.json
│   └── package-lock.json
├── db/
│   └── schema.sql
├── scripts/
├── docs/
├── vercel.json
├── package.json
└── README.md

Running Locally

Requirements:

Node.js

npm

PostgreSQL is optional for the current DEMO workflow.

Install:

npm install
cd backend
npm install
cd ..

Validate:

npm run check

Build:

npm run build

Run development:

npm run dev

Local services:

Frontend: http://localhost:5173

API: http://localhost:4000

Environment Variables

Backend:

PORT=4000
CORS_ORIGINS=http://localhost:5173
DATA_MODE=DEMO
DATABASE_URL=

Frontend:

VITE_API_URL=http://localhost:4000

Deployment

FINTRACE is deployed on Vercel as separate frontend and backend services.

API requests under /api are routed to the backend service while the remaining application routes are served by the frontend.

Production deployment:

vercel --prod

Verification

The following workflows were verified during development:

Frontend production build

TypeScript checks

Backend health endpoint

Securities API

Watchlists API

Snapshot creation

Demo simulation

RRG endpoint

Fixed-income endpoint

Alerts API

PostgreSQL schema creation/connectivity

Vercel production deployment

Design Principles

FINTRACE intentionally follows a professional market-terminal aesthetic:

Dense information hierarchy

Data-first presentation

Compact typography

Thin borders

Minimal decoration

Neutral light interface

Subtle blue accent

Tables and analytical views over oversized cards

Clear timestamps and reliability indicators

Product Philosophy

Most market dashboards answer:

What is the price?

FINTRACE is designed to answer:

What changed since I last checked, and what deserves my attention?

Snapshots provide memory. Change detection provides context. Attention scoring provides prioritization. RRG provides relative positioning. Fixed-income analytics broaden the market view. Deterministic explanations keep the system evidence-based.

Limitations

The current public deployment is a demonstration environment.

It does not provide:

Live NSE market data

Guaranteed real-time prices

Investment advice

Predictive trading signals

Verified news explanations for every market movement

The synthetic dataset exists to demonstrate the product and engineering workflows.

Roadmap

Completed

Dashboard

Watchlists

Snapshot memory

Change detection

Attention score

Security detail

Compare

RRG

Fixed income

Alerts

Demo simulation/reset

REST API

PostgreSQL schema

Vercel deployment

Next

Authorized live market-data provider

Production PostgreSQL persistence

Authentication

User-specific watchlists

Background data ingestion

Historical analytics

Alert evaluation workers

Event/news-source integration

Sector and breadth analytics

Portfolio monitoring

Production observability

Disclaimer

FINTRACE is a software engineering and market-intelligence demonstration project.

The DEMO environment uses synthetic data and is not a source of real-time financial information. Nothing in the application constitutes investment, trading, or financial advice.

Author

Bhavika Jadon

FINTRACE combines product thinking, financial-market analytics, data engineering, backend API development, frontend engineering, explainable analytics, and production deployment.