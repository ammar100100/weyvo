# Weyvo — Bracelet Store

A Next.js 14 storefront for Weyvo, backed by Supabase.

## Features
- Responsive premium-style bracelet storefront
- Search, category filters, product cards, cart and guest checkout
- Supabase product catalogue and order/order-item persistence
- Database schema with row-level security policies
- Cash-on-delivery order flow (no card payments are processed)

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Set the Supabase URL and publishable/anon key in `.env.local`.
4. Run `npm install` and `npm run dev`.
5. Open http://localhost:3000.

## Database
The schema migration is at `supabase/migrations/20261014000000_weyvo_store_schema.sql`. The Supabase project has already been initialized.

## Bracelet images
The four supplied `.webp` images are included in the downloadable starter ZIP. Upload the files into `public/images/` in this repository before deploying; the image files could not be uploaded using the connected GitHub file actions.

## Deploy
Import this repository into Vercel and add the two `NEXT_PUBLIC_SUPABASE_*` environment variables. Never add a Supabase service-role key to client-side environment variables.

## Production security
This is a starter storefront, not a production-hardened checkout. Before accepting real orders at scale, implement server-side checkout that recalculates prices and stock, rate-limit public order creation, add order confirmation emails, and set an explicit admin bootstrap procedure. Do not treat client-supplied totals as authoritative.
