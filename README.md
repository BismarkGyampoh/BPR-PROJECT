# FreshCrate

A subscription-based fresh produce delivery service that connects smallholder farmers in the Greater Accra Region directly to urban households and small restaurants. Built with Next.js, Prisma, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Setup

```bash
npx prisma generate
npx prisma db push --skip-generate
npm run seed
```

Seeded credentials:
- **Admin**: `+233240000000` / `admin1234`
- **Customer**: `+233240000001` / `cust1234`

## Environment Variables

See `.env` for required configuration. In development, MoMo payments run in **simulated stub mode** (no real gateway credentials needed). Set `MTN_MOMO_SUBSCRIPTION_KEY` and related env vars to use the live MTN Mobile Money sandbox.

## Architecture

This application implements the Business Process Reengineering (BPR) to-be process for FreshCrate:

| BPR Step | Implementation |
|---|---|
| 1. Demand forecast & farm order | `/api/subscribe` aggregates confirmed orders into purchase orders |
| 2. Scheduled harvest & pickup | Order status `PICKED` → harvest confirmed |
| 3. Hub receiving & grading | Admin inventory system (`/admin/inventory`) with A/B/C grading |
| 4. Crate assembly | Order items compiled and packed at hub |
| 5. Route-optimized delivery | `/api/deliveries` batches orders by Accra zone |
| 6. Delivery & payment | MoMo auto-billing + order status `DELIVERED` |

## Key Pages

| Route | Description |
|---|---|
| `/` | Home with hero, benefits, and how-it-works |
| `/crates` | Browse subscription crate plans (Small, Family, Premium, Restaurant) |
| `/checkout?plan=<id>` | Customize crate and pay via Mobile Money |
| `/dashboard` | Customer dashboard: active subscription, next delivery, order history |
| `/customize` | Modify crate plan and item selections for existing subscriptions |
| `/track/[orderId]` | Real-time order tracking through the freshness journey |
| `/about` | Company story, mission, and the supply chain problem we solve |
| `/login` / `/register` | Authentication (Ghana phone numbers + password) |
| `/admin` | Operations console: farms, inventory, orders, deliveries, payments |

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with server actions
- **Prisma 6** ORM with SQLite (dev) / PostgreSQL (production)
- **Tailwind CSS 4** with custom design tokens
- **MTN Mobile Money** integration (sandbox stub mode for dev)
- **bcryptjs** for password hashing
- **libphonenumber-js** for Ghana phone number validation
- **Zod** for input validation

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run seed` | Seed the database with test data |
| `npm run prisma:studio` | Open Prisma Studio |
