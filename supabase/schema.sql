-- Le Coin Mosaab POS — schema, RPC, and seed data
-- Run this in the Supabase SQL editor on a fresh project.

create table if not exists staff (
  id text primary key,
  name text not null,
  role text not null,
  login_role text not null check (login_role in ('cashier', 'admin')),
  pin text not null,
  clocked_in boolean not null default false
);

create table if not exists menu_items (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null,
  available boolean not null default true
);
alter table menu_items add column if not exists image_url text;

create table if not exists orders (
  id bigint generated always as identity primary key,
  table_label text not null,
  server_name text not null,
  status text not null default 'open' check (status in ('open', 'paid')),
  covers int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists tables (
  id bigint generated always as identity primary key,
  label text not null unique
);

create table if not exists categories (
  id bigint generated always as identity primary key,
  label text not null unique
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders (id) on delete cascade,
  menu_item_id text references menu_items (id) on delete set null,
  name text not null,
  price numeric(10, 2) not null,
  qty int not null
);

-- Optional extras shared by every item in a category (e.g. "Frites" +5 MAD
-- on every item under Plats), managed from the Catégories admin screen.
create table if not exists category_addons (
  id bigint generated always as identity primary key,
  category_id bigint not null references categories (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null
);

-- Cash register ledger. 'in' transactions are auto-created when an order is
-- marked paid (order_id set); 'out' (and manual 'in') transactions are added
-- by admin directly (order_id null) — e.g. paying an expense out of the till.
create table if not exists caisse_transactions (
  id bigint generated always as identity primary key,
  type text not null check (type in ('in', 'out')),
  amount numeric(10, 2) not null check (amount > 0),
  description text not null,
  order_id bigint references orders (id) on delete set null,
  created_by text,
  created_at timestamptz not null default now()
);

-- Staff list without the pin column, safe to expose to the client for the login screen.
create or replace view staff_public as
  select id, name, role, login_role, clocked_in from staff;

-- Verifies a PIN server-side so raw pins never reach the browser.
create or replace function check_staff_pin(p_staff_id text, p_pin text)
returns table (id text, name text, role text, login_role text)
language sql
security definer
set search_path = public
as $$
  select id, name, role, login_role
  from staff
  where id = p_staff_id and pin = p_pin;
$$;

-- Updates only clocked_in (never exposes/updates pin) — used by the admin Staff toggle.
create or replace function set_staff_clocked_in(p_staff_id text, p_clocked_in boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update staff set clocked_in = p_clocked_in where id = p_staff_id;
$$;

alter table staff enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tables enable row level security;
alter table categories enable row level security;
alter table caisse_transactions enable row level security;
alter table category_addons enable row level security;

-- Staff writes are allowed (admin CRUD) but reads stay off-limits (pins live here) — only the view/RPC above can be read.
drop policy if exists "staff insert" on staff;
create policy "staff insert" on staff for insert with check (true);
drop policy if exists "staff update" on staff;
create policy "staff update" on staff for update using (true);
drop policy if exists "staff delete" on staff;
create policy "staff delete" on staff for delete using (true);

drop policy if exists "menu_items read" on menu_items;
create policy "menu_items read" on menu_items for select using (true);
drop policy if exists "menu_items write" on menu_items;
create policy "menu_items write" on menu_items for insert with check (true);
drop policy if exists "menu_items update" on menu_items;
create policy "menu_items update" on menu_items for update using (true);
drop policy if exists "menu_items delete" on menu_items;
create policy "menu_items delete" on menu_items for delete using (true);

drop policy if exists "orders read" on orders;
create policy "orders read" on orders for select using (true);
drop policy if exists "orders write" on orders;
create policy "orders write" on orders for insert with check (true);
drop policy if exists "orders update" on orders;
create policy "orders update" on orders for update using (true);
drop policy if exists "orders delete" on orders;
create policy "orders delete" on orders for delete using (true);

drop policy if exists "order_items read" on order_items;
create policy "order_items read" on order_items for select using (true);
drop policy if exists "order_items write" on order_items;
create policy "order_items write" on order_items for insert with check (true);
drop policy if exists "order_items delete" on order_items;
create policy "order_items delete" on order_items for delete using (true);

drop policy if exists "tables read" on tables;
create policy "tables read" on tables for select using (true);
drop policy if exists "tables write" on tables;
create policy "tables write" on tables for insert with check (true);
drop policy if exists "tables delete" on tables;
create policy "tables delete" on tables for delete using (true);

drop policy if exists "categories read" on categories;
create policy "categories read" on categories for select using (true);
drop policy if exists "categories write" on categories;
create policy "categories write" on categories for insert with check (true);
drop policy if exists "categories delete" on categories;
create policy "categories delete" on categories for delete using (true);

drop policy if exists "caisse_transactions read" on caisse_transactions;
create policy "caisse_transactions read" on caisse_transactions for select using (true);
drop policy if exists "caisse_transactions write" on caisse_transactions;
create policy "caisse_transactions write" on caisse_transactions for insert with check (true);
drop policy if exists "caisse_transactions delete" on caisse_transactions;
create policy "caisse_transactions delete" on caisse_transactions for delete using (true);

drop policy if exists "category_addons read" on category_addons;
create policy "category_addons read" on category_addons for select using (true);
drop policy if exists "category_addons write" on category_addons;
create policy "category_addons write" on category_addons for insert with check (true);
drop policy if exists "category_addons update" on category_addons;
create policy "category_addons update" on category_addons for update using (true);
drop policy if exists "category_addons delete" on category_addons;
create policy "category_addons delete" on category_addons for delete using (true);

grant select on staff_public to anon, authenticated;
grant execute on function check_staff_pin(text, text) to anon, authenticated;
grant execute on function set_staff_clocked_in(text, boolean) to anon, authenticated;
grant insert, update, delete on staff to anon, authenticated;
grant select, insert, update, delete on menu_items to anon, authenticated;
grant select, insert, update, delete on orders to anon, authenticated;
grant select, insert, delete on order_items to anon, authenticated;
grant select, insert, delete on tables to anon, authenticated;
grant select, insert, delete on categories to anon, authenticated;
grant select, insert, delete on caisse_transactions to anon, authenticated;
grant select, insert, update, delete on category_addons to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Storage bucket for menu item photos, uploaded by admin from the Articles du menu screen.
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "menu-images public read" on storage.objects;
create policy "menu-images public read" on storage.objects
  for select using (bucket_id = 'menu-images');
drop policy if exists "menu-images insert" on storage.objects;
create policy "menu-images insert" on storage.objects
  for insert with check (bucket_id = 'menu-images');
drop policy if exists "menu-images update" on storage.objects;
create policy "menu-images update" on storage.objects
  for update using (bucket_id = 'menu-images');
drop policy if exists "menu-images delete" on storage.objects;
create policy "menu-images delete" on storage.objects
  for delete using (bucket_id = 'menu-images');

-- Seed data

insert into staff (id, name, role, login_role, pin, clocked_in) values
  ('cash1', 'Caissier', 'Serveur', 'cashier', '1234', true),
  ('admin1', 'Admin', 'Gérant', 'admin', '9999', true)
on conflict (id) do nothing;

insert into tables (label) values
  ('Table 1'), ('Table 2'), ('Table 3'), ('Table 4'),
  ('Table 5'), ('Table 6'), ('Table 7'), ('Table 8'), ('À Emporter')
on conflict (label) do nothing;

insert into categories (label) values
  ('Entrées'), ('Plats'), ('Accompagnements'), ('Boissons'), ('Desserts')
on conflict (label) do nothing;

insert into menu_items (id, name, category, price, available) values
  ('i1', 'Salade de betteraves rôties', 'Entrées', 12, true),
  ('i2', 'Soupe à l''oignon', 'Entrées', 10, true),
  ('i3', 'Poulpe grillé', 'Entrées', 18, true),
  ('i4', 'Plateau de burrata', 'Entrées', 15, false),
  ('i5', 'Joue de bœuf braisée', 'Plats', 32, true),
  ('i6', 'Poulet rôti', 'Plats', 26, true),
  ('i7', 'Saumon poêlé', 'Plats', 29, true),
  ('i8', 'Risotto aux champignons', 'Plats', 24, true),
  ('i9', 'Burger au bœuf fermier', 'Plats', 19, true),
  ('i10', 'Frites à la truffe', 'Accompagnements', 9, true),
  ('i11', 'Asperges grillées', 'Accompagnements', 8, true),
  ('i12', 'Macaronis au fromage', 'Accompagnements', 8, true),
  ('i13', 'Vin rouge maison', 'Boissons', 12, true),
  ('i14', 'Vin blanc maison', 'Boissons', 12, true),
  ('i15', 'Bière pression', 'Boissons', 7, true),
  ('i16', 'Espresso', 'Boissons', 4, true),
  ('i17', 'Eau pétillante', 'Boissons', 5, true),
  ('i18', 'Tarte au chocolat', 'Desserts', 11, true),
  ('i19', 'Crème brûlée', 'Desserts', 10, true),
  ('i20', 'Affogato', 'Desserts', 8, false)
on conflict (id) do nothing;
