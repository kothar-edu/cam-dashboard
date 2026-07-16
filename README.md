# CAM Dashboard

Tenant-aware web admin for CAM Cricket. Rebuilt on Vite + React 18 + TypeScript with
`pages → hooks → api → axios` architecture.

## Prerequisites

- Node.js 18+
- Local `cam-backend` running on port **3030** (see `cam-backend` README)

## Local development

```bash
cd cam-dashboard
npm install
VITE_URL=http://127.0.0.1:3030/ npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_URL` | `http://127.0.0.1:3030/` | Django API base URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Vitest unit tests |
| `npm run preview` | Preview production build |

## Auth & tenancy

1. Log in with a staff or tenant-admin account.
2. Pick an organization from the header tenant picker.
3. Tenant-scoped pages (teams, fixtures, etc.) require an active tenant.

Global administrators (`is_staff` / `is_superuser`) see the **Tenants** nav item for
organization creation and tenant-admin assignment.

## Architecture

```
src/
  api/          # Typed HTTP functions (no React)
  hooks/        # React Query hooks (only layer that imports api/)
  pages/        # Route components (call hooks only)
  components/   # Shared UI (DataTable, shell, shadcn-style primitives)
  contexts/     # AuthContext, TenantContext
```
