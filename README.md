# smelt — TLS Certificate Compliance Checker

> DECO3801 Project 15 — Team Crude Palm Oil

Web-based tool for detecting non-compliant TLS certificate attributes against the CA/Browser Forum Baseline Requirements.

## Tech Stack

| Layer         | Tool                  |
|---------------|-----------------------|
| Framework     | Next.js (App Router)  |
| Language      | TypeScript            |
| Styling       | Tailwind CSS          |
| Icons         | Lucide React          |
| State         | React hooks (for now) |

## Getting Started
```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Project Structure
```
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (html, body, global CSS)
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── globals.css               # Theme variables + base styles
│   └── (main)/                   # Route group — all pages share sidebar layout
│       ├── layout.tsx            # Sidebar + Topbar wrapper
│       ├── dashboard/page.tsx
│       ├── scan/page.tsx
│       ├── results/page.tsx
│       ├── reports/page.tsx
│       ├── configuration/page.tsx
│       └── monitoring/page.tsx
│
├── components/
│   ├── ui/                       # Shared UI primitives (Badge, Card, Button...)
│   │   └── index.ts              # Barrel export
│   ├── layout/                   # Sidebar, Topbar
│   │   └── index.ts              # Barrel export
│   ├── dashboard/                # Components only used by /dashboard
│   ├── scan/                     # Components only used by /scan
│   ├── results/                  # ...
│   ├── reports/
│   ├── configuration/
│   └── monitoring/
│
├── lib/
│   ├── theme.ts                  # Design tokens (colors)
│   ├── constants.ts              # Routes, nav items, app config
│   ├── mock-data.ts              # Fake data for design phase
│   └── utils.ts                  # Shared helper functions
│
├── hooks/                        # Custom React hooks
├── services/
│   └── api.ts                    # Backend API calls (stubs for now)
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
└── public/
    └── icons/                    # Static assets
```

## Conventions

- **Imports**: use `@/` alias (e.g., `import { Badge } from "@/components/ui"`)
- **Components**: PascalCase filenames, one component per file
- **Pages**: only `page.tsx` in route folders — extract logic into `components/<feature>/`
- **Data**: during scaffold phase, import from `@/lib/mock-data`. When backend is ready, swap for `@/services/api`
- **Types**: shared interfaces go in `types/index.ts`. Page-specific types can live in the component file

## Pages

| Route             | Description                                      |
|-------------------|--------------------------------------------------|
| `/dashboard`      | Overview stats, recent scans, alerts, compliance  |
| `/scan`           | Certificate input (domain/IP, DNS zone, upload)   |
| `/results`        | Per-certificate compliance analysis detail        |
| `/reports`        | Generated compliance reports list                 |
| `/configuration`  | Policy profiles and BR rule overrides             |
| `/monitoring`     | Monitored domains and alert history               |

## Backend APIs (not yet integrated)

| Service           | Port  | Tech       |
|-------------------|-------|------------|
| Analysis API      | 8080  | Go + ZLint |
| Report API        | 8001  | FastAPI    |
| Configuration API | 8002  | FastAPI    |
