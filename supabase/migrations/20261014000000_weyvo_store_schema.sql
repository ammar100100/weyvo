create extension if not exists pgcrypto;
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
 description text not null default '', price numeric(10,2) not null check(price>=0),
 compare_at_price numeric(10,2) check(compare_at_price is null or compare_at_price>=price),
 image_url text not null default '', category text not null default 'Bracelets',
 material text not null default 'Stainless steel', stock integer not null default 0 check(stock>=0),
 featured boolean not null default false, active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, full_name text,
 role text not null default 'customer' check(role in ('customer','admin')), created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number text unique not null default ('WY-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
 user_id uuid references auth.users(id) on delete set null, customer_name text not null, email text not null,
 phone text, shipping_address jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
 payment_method text not null default 'cash_on_delivery',
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid','refunded')),
 subtotal numeric(10,2) not null default 0 check(subtotal>=0), shipping_cost numeric(10,2) not null default 0 check(shipping_cost>=0),
 total numeric(10,2) not null default 0 check(total>=0), created_at timestamptz not null default now()
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null, product_name text not null, product_image text,
 unit_price numeric(10,2) not null check(unit_price>=0), quantity integer not null check(quantity>0),
 line_total numeric(10,2) not null check(line_total>=0)
);
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "Anyone can view active products" on public.products for select using(active=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Users view own profile" on public.profiles for select to authenticated using(id=auth.uid() or exists(select 1 from public.profiles a where a.id=auth.uid() and a.role='admin'));
create policy "Users create own profile" on public.profiles for insert to authenticated with check(id=auth.uid() and role='customer');
create policy "Admins manage products" on public.products for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Customers create orders" on public.orders for insert to anon,authenticated with check(user_id is null or user_id=auth.uid());
create policy "Customers view own orders" on public.orders for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Admins update orders" on public.orders for update to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Create items for guest checkout" on public.order_items for insert to anon,authenticated with check(exists(select 1 from public.orders o where o.id=order_id and (o.user_id is null or o.user_id=auth.uid())));
create policy "Customers view own order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'))));
create index if not exists products_active_featured_idx on public.products(active,featured);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
insert into public.products(slug,name,description,price,image_url,category,material,stock,featured,active) values
('weyvo-silver-link','Weyvo Silver Link Bracelet','A clean stainless-steel link bracelet with a polished silver finish, made for everyday wear',899,'/images/weyvo-bracelet-1.webp','Classic','Stainless steel',20,true,true),
('weyvo-geo-link','Weyvo Geo Link Bracelet','Geometric textured accents meet a brushed silver finish',999,'/images/weyvo-bracelet-2.webp','Modern','Stainless steel',15,true,true),
('weyvo-everyday-silver','Weyvo Everyday Silver','A versatile silver-tone bracelet with a comfortable linked design',799,'/images/weyvo-bracelet-3.webp','Everyday','Stainless steel',25,false,true),
('weyvo-signature','Weyvo Signature Bracelet','A refined silver bracelet designed for casual and formal looks',1099,'/images/weyvo-bracelet-4.webp','Signature','Stainless steel',10,true,true)
on conflict(slug) do nothing;
