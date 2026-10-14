# Weyvo — Bracelet Store

A Next.js 14 storefront for Weyvo, backed by Supabase.

## Features
- Responsive bracelet storefront with search and category filters
- Product cards, cart, and guest cash-on-delivery checkout
- Supabase product catalogue and order persistence
- SQL migration with row-level security policies

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the Supabase project URL and publishable key.
4. Run `npm install` and `npm run dev`.
5. Open http://localhost:3000.

## Important production note
This is a starter storefront, not yet a production-hardened checkout. Before accepting real orders, implement server-side price and stock validation, rate limits, reliable order-item transactions and confirmation emails. Never put a Supabase service-role key in public client environment variables.
