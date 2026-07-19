# cCarbon — GHG Accounting Platform

A regulatory-compliant carbon accounting application built with Next.js 16, Prisma 7, and SQLite.

## Regulatory Frameworks Supported

| Framework | Coverage | Verification Required |
|-----------|----------|-----------------------|
| GHG Protocol Corporate Standard | Scope 1, 2, 3 | No |
| ISO 14064-1:2018 | Scope 1, 2, 3 | Yes |
| TCFD | Scope 1, 2, 3 | No |
| EU CSRD / ESRS E1 | Scope 1, 2, 3 | Yes |
| SEC Climate Disclosure | Scope 1, 2 | Yes |
| CDP Climate Change | Scope 1, 2, 3 | No |
| SBTi | Scope 1, 2, 3 | Yes |

## Features

- Dashboard with KPI cards, monthly trend charts, scope breakdowns, regulatory compliance checklist
- Emission Records — Scope 1/2/3 data entry with verification, facility assignment
- Reports — Generate regulatory reports per framework
- Targets — Science-based targets (SBTi), net-zero commitments, pathway tracking
- Facilities — Multi-site inventory (operational control approach)
- Emission Factors — Built-in: DEFRA 2023, IPCC AR5 GWPs, EPA eGRID, IEA 2023
- Audit Trail — Full log for third-party verification

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
node prisma/seed-raw.mjs
npm run dev
```

Open http://localhost:3000

## Tech Stack

Next.js 16 · Prisma 7 · SQLite (libsql) · Tailwind CSS · Radix UI · Recharts · TypeScript
