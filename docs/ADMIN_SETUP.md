# Weyvo admin dashboard setup

The dashboard lives at **/admin** and uses Supabase Auth. It is protected by the `public.profiles.role = 'admin'` check; do not make the dashboard public.

## 1. Create your admin login

In Supabase Dashboard → Authentication → Users, add a user with an email you control and set a strong password. You can also register through Supabase Auth if email/password sign-in is enabled.

## 2. Grant the admin role

Open Supabase Dashboard → SQL Editor and run this query after replacing the email with your own admin email:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Weyvo Admin', 'admin'
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (id) do update
set role = 'admin';
```

Verify that one row was inserted or updated. Do not share your password or service-role key.

## 3. Add the store environment variables

Set these in Vercel → Project → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the Supabase publishable key can be used as this value with the current client setup)

Redeploy after saving.

## 4. Upload the bracelet photos

Visit `/admin`, sign in, open **Products & imagery**, then use **Upload photo** on each bracelet. Files are stored in the public `product-images` Supabase Storage bucket and the product's `image_url` is updated to the public Storage URL automatically.

Supported formats: WEBP, JPG, PNG, up to 5 MB each.

## Dashboard features

- Overview of order count, order value, fulfilment queue, and product count
- Product price, stock, visibility, and photo management
- Recent orders and fulfilment status updates
- Admin-only data access enforced through Supabase Row Level Security

Before accepting real payments or high-volume orders, add server-side validation for prices, stock, and order creation.
