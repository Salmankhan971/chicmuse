create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('outfits', 'handbags', 'shoes', 'jewelry', 'accessories')),
  description text not null,
  price text not null,
  image_url text not null,
  affiliate_url text not null default '#',
  badge text default '',
  extra_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated admin can insert products" on public.products;
create policy "Authenticated admin can insert products"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admin can update products" on public.products;
create policy "Authenticated admin can update products"
on public.products for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admin can delete products" on public.products;
create policy "Authenticated admin can delete products"
on public.products for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Authenticated admin can upload product images" on storage.objects;
create policy "Authenticated admin can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated admin can update product images" on storage.objects;
create policy "Authenticated admin can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

insert into public.products (title, category, description, price, image_url, affiliate_url, badge, extra_images)
values
  ('Blush Satin Midi Dress', 'outfits', 'A soft occasion dress with an expensive-looking drape.', '$42.00', 'assets/images/dress.jpg', '#', 'NEW', '[]'::jsonb),
  ('Cream Quilted Shoulder Bag', 'handbags', 'Polished structure, gold-tone detail and everyday space.', '$34.99', 'assets/images/handbag.jpg', '#', 'BESTSELLER', '[]'::jsonb),
  ('Pearl Detail Ballet Flats', 'shoes', 'Pretty flats for denim, dresses and coffee-date outfits.', '$29.50', 'assets/images/shoes.jpg', '#', 'NEW', '[]'::jsonb),
  ('Dainty Layered Necklace Set', 'jewelry', 'Delicate gold layers that make basics feel intentional.', '$18.99', 'assets/images/jewelry.jpg', '#', '', '[]'::jsonb),
  ('Soft Knit Matching Set', 'outfits', 'Cozy, feminine and styled in seconds for off-duty days.', '$49.00', 'assets/images/knit-set.jpg', '#', 'BESTSELLER', '[]'::jsonb),
  ('Rose Gold Hoop Earrings', 'jewelry', 'Lightweight shine with a romantic everyday finish.', '$14.99', 'assets/images/jewelry.jpg', '#', '', '[]'::jsonb),
  ('Minimal Beige Crossbody', 'handbags', 'Clean lines and neutral color for every weekly outfit.', '$31.00', 'assets/images/hero.jpg', '#', 'NEW', '[]'::jsonb),
  ('Silky Hair Bow Clip', 'accessories', 'A soft finishing piece for ponytails, waves and buns.', '$9.99', 'assets/images/outfit.jpg', '#', '', '[]'::jsonb)
on conflict do nothing;
