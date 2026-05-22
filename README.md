# smelt — TLS Certificate Compliance Checker

> DECO3801 Project 15 — Team Crude Palm Oil

Web-based tool for detecting non-compliant TLS certificate attributes against the CA/Browser Forum Baseline Requirements.

## Tech Stack

| Layer         | Tool                        |
|---------------|-----------------------------|
| Framework     | Next.js 16 (App Router)     |
| Language      | TypeScript                  |
| Styling       | Tailwind CSS v4             |
| Icons         | Lucide React                |
| Data fetching | SWR + Next.js Server Actions|
| Auth          | Cookie-based JWT middleware |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/auth` if not logged in, otherwise to `/main/dashboard`.

## Environment Variables

| Variable                        | Default                 | Description                         |
|---------------------------------|-------------------------|-------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`      | `http://localhost:8000` | Smelt backend (scan, results, auth) |
| `NEXT_PUBLIC_API_SCAN_URL`      | `http://localhost:8000` | Scan submission endpoint            |
| `NEXT_PUBLIC_ANALYSIS_API_URL`  | `http://localhost:8080` | Go ZLint analysis service           |
| `NEXT_PUBLIC_REPORT_API_URL`    | `http://localhost:8008` | FastAPI report generation service   |
| `NEXT_PUBLIC_CONFIG_API_URL`    | `http://localhost:8002` | FastAPI configuration service       |

## Project Structure

```
├── app/
│   ├── layout.tsx                    # Root layout (html, body, global CSS)
│   ├── page.tsx                      # Root redirect → /main/dashboard
│   ├── globals.css                   # Theme variables + base styles
│   ├── auth/page.tsx                 # Login page
│   ├── api/
│   │   ├── generate/route.ts         # Report generation proxy
│   │   └── reports/[scan_id]/route.ts
│   └── main/                         # Protected route group (requires auth)
│       ├── layout.tsx                # Sidebar + Topbar wrapper
│       ├── dashboard/
│       │   ├── page.tsx
│       │   ├── compliance-pass-rate/page.tsx
│       │   ├── critical-findings/page.tsx
│       │   └── expiring-soon/page.tsx
│       ├── scan/page.tsx
│       ├── results/
│       │   ├── page.tsx
│       │   ├── [id]/page.tsx         # Scan result detail
│       │   ├── scan/[id]/page.tsx    # Per-scan lint detail
│       │   ├── target/[key]/page.tsx # Per-target history
│       │   └── certificate/[name]/page.tsx
│       ├── recurring/
│       │   ├── page.tsx              # Recurring scan list
│       │   └── [id]/page.tsx         # Recurring scan detail/edit
│       ├── monitoring/page.tsx
│       └── configuration/page.tsx
│
├── components/
│   ├── ui/                           # Shared UI primitives
│   │   ├── badge/, buttons/, cards/
│   │   ├── display/                  # Badge, SectionTitle, TabBar
│   │   ├── forms/                    # InputField, DropZone
│   │   ├── modal/
│   │   ├── tables/DataTable.tsx
│   │   └── AutoRefresh.tsx
│   ├── layout/                       # Sidebar, Topbar
│   ├── auth/                         # LoginForm
│   ├── dashboard/                    # StatsCards, RecentScansTable, AlertFeed, …
│   │   └── client/                   # SWR-powered client wrappers
│   ├── results/                      # ResultsTable, ScanResultDetail, …
│   ├── recurring/                    # RecurringTable, RecurringDetail
│   ├── monitoring/                   # MonitoringTable, AlertHistoryTable, …
│   └── configuration/
│
├── services/
│   └── api.ts                        # Server Actions — all backend API calls
│
├── lib/
│   ├── theme.ts                      # Design tokens
│   ├── constants.ts                  # Routes, nav items, app config
│   ├── scans.ts                      # Scan submission helpers
│   ├── MockData.ts                   # Fallback mock data
│   ├── mock-results-data.ts          # Types + mock data for results feature
│   └── mock-monitoring-data.ts       # Types + mock data for monitoring feature
│
├── middleware.ts                     # Auth guard — redirects to /auth if no token
├── hooks/                            # Custom React hooks
├── types/index.ts                    # Shared TypeScript interfaces
└── Dockerfile                        # Multi-stage production image
```

## Conventions

- **Imports**: use `@/` alias (e.g., `import { Badge } from "@/components/ui"`)
- **Components**: PascalCase filenames, one component per file
- **Pages**: only `page.tsx` in route folders — logic goes in `components/<feature>/`
- **Server vs client**: data fetching happens in Server Components or Server Actions (`services/api.ts`). Client components that need live data use SWR under `components/<feature>/client/`
- **Types**: shared interfaces in `types/index.ts` and `lib/mock-*-data.ts`; page-specific types can live in the component file

## Pages

| Route                           | Description                                          |
|---------------------------------|------------------------------------------------------|
| `/auth`                         | Login                                                |
| `/main/dashboard`               | Overview stats, recent scans, alerts, compliance     |
| `/main/scan`                    | Certificate input (domain/IP, DNS zone, file upload) |
| `/main/results`                 | All scan results — by scan, target, or certificate   |
| `/main/results/scan/[id]`       | Per-scan lint detail with per-rule findings          |
| `/main/results/target/[key]`    | Target history across scans                          |
| `/main/results/certificate/[name]` | Certificate history across scans                  |
| `/main/recurring`               | Recurring scan schedules list                        |
| `/main/recurring/[id]`          | Recurring scan detail and edit form                  |
| `/main/monitoring`              | Ongoing scans, alert history, scan history           |
| `/main/configuration`           | Policy profiles and BR rule overrides                |

## Backend Services

| Service           | Default Port | Tech           | Notes                          |
|-------------------|--------------|----------------|--------------------------------|
| Smelt Backend     | 8000         | FastAPI        | Auth, scan, results, recurring |
| Analysis API      | 8080         | Go + ZLint     | Per-rule lint findings (S3)    |
| Report API        | 8008         | FastAPI        | Report generation              |
| Configuration API | 8002         | FastAPI        | Policy profiles                |

## Deployment

On push to `main`, GitHub Actions builds and pushes a Docker image to GitHub Container Registry (`ghcr.io`), tagged with the short commit SHA and `latest`.

```bash
docker build -t smelt-frontend .
docker run -p 3000:3000 smelt-frontend
```
