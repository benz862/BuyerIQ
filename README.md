# BuyerIQ V2

BuyerIQ is a buy-once real estate due diligence platform for buyers, renters, and relocators.

Tagline: Stop Guessing. Start Buying Smarter.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Supabase Auth and PostgreSQL
- Stripe one-time purchases
- Vercel hosting target

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STANDARD_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Verification

```bash
npm run lint
npm run build
```

## Supabase

The v2 schema is in `supabase/migrations/20260624000000_buyeriq_v2_schema.sql`.
