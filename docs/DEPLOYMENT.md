# FINTRACE deployment runbook

## 1. Local

Requirements: Node 20+, npm, Git.

```bash
npm install
npm run seed
npm run dev
```

Web: http://localhost:5173
API: http://localhost:4000/health

## 2. GitHub

```bash
git init
git add .
git commit -m "Initial FINTRACE platform"
git branch -M main
git remote add origin https://github.com/YOUR_USER/FINTRACE.git
git push -u origin main
```

## 3. Vercel frontend

Import the GitHub repository as a new Vercel project.
Set Root Directory to `frontend`.
Framework: Vite (auto-detected).
Build command: `npm run build`.
Output directory: `dist`.
Add `VITE_API_URL` pointing to the API project URL.

## 4. Vercel backend

Create a second Vercel project from the same repository.
Set Root Directory to `backend`.
Vercel detects the Express backend through `server.ts`.
Add environment variables:

- `DATA_MODE=DEMO`
- `CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app`
- `DATABASE_URL=` when PostgreSQL is connected.

## 5. PostgreSQL

Create a managed PostgreSQL database. Run `db/schema.sql` once, then migrate the JSON store to PostgreSQL before enabling production market ingestion.

Do not commit secrets. Do not put credentials in the repository.

## 6. Production data

Keep `DATA_MODE=DEMO` until a licensed/authorized market-data source is configured. Implement the provider boundary before using live NSE data. Demo data in this repository is synthetic and explicitly marked DEMO.

## 7. Production checklist

- [ ] Database connected
- [ ] Authentication added
- [ ] PostgreSQL adapter replaces JSON persistence
- [ ] Licensed market-data provider configured
- [ ] Ingestion/scheduling configured
- [ ] LIVE/DELAYED/STALE states verified
- [ ] Alert evaluation job enabled
- [ ] Error monitoring enabled
- [ ] Rate limiting enabled
- [ ] Backups enabled
- [ ] Custom domain configured
