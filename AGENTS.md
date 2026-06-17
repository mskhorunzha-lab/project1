# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`infra-portal` — a single Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL web portal
("Портал управления ИТ-инфраструктурой"). UI is in Russian. Standard setup/run steps live in
`README.md`; scripts live in `package.json` (`dev`, `build`, `lint`, `db:generate`, `db:push`,
`db:seed`, `db:studio`).

### Database (PostgreSQL)
- Unlike the README (which uses `docker compose`), this environment runs **PostgreSQL natively via apt**
  (Docker is not installed). The cluster, the `infra` role (password `infra`), the `infra_portal`
  database, the pushed Prisma schema, and the seed data are all baked into the VM snapshot.
- Postgres does **not** auto-start on boot. Start it before running the app or any DB command:
  ```bash
  sudo pg_ctlcluster 16 main start
  ```
- Connection string (already in the gitignored `.env`, copied from `.env.example`):
  `postgresql://infra:infra@localhost:5432/infra_portal?schema=public`
- `.env` is gitignored, so recreate it if missing: `cp .env.example .env`.
- To reset/reseed demo data: `npm run db:push` then `npm run db:seed` (the seed script wipes all
  tables first).

### Running the app
- Dev server: `npm run dev` → http://localhost:3000 (this is the development command to use).
- The app will not render most pages without Postgres running (every page reads/writes via Prisma).

### Notes
- `prisma generate` is required after a fresh `npm install` (no `postinstall` hook). The update
  script handles this; `prisma db push` also re-runs generate.
- `npm run lint` uses `next lint` (deprecation warning is expected, not an error).
