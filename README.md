# Weyvo — Bracelet Store

Next.js 14 storefront for Weyvo, backed by Supabase.

## Included
- Premium-style responsive bracelet storefront with product search and category filters
- Shopping bag and guest cash-on-delivery checkout UI
- Supabase catalogue and order schema migration with row-level security policies
- Four supplied `.webp` bracelet photos are available in the [starter ZIP](https://github.com/ammar100100/weyvo) via the ChatGPT download. Place them in `public/images/` as `weyvo-bracelet-1.webp` through `weyvo-bracelet-4.webp`.

## Local setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Set the Supabase URL and publishable key in `.env.local`.
4. Run `npm install` and `npm run dev`.
5. Open http://localhost:3000.

## Database
The Supabase project is already initialized. The schema migration is at `supabase/migrations/20261014000000_weyvo_store_schema.sql`.

## Deploy
Import this repository into Vercel and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project's environments. The current connected Vercel integration does not have permission to create a Vercel project automatically.

## Production security note
This is a starter storefront, not a production-hardened checkout. Before accepting real orders, add server-side checkout validation of prices and stock, rate limits, transactional order/order-item creation, order confirmation emails, and explicit admin bootstrap. Client-supplied totals must not be treated as authoritative. Never expose a Supabase service-role key in client-side variables.
