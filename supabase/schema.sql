-- Ember & Oak POS — schema, RPC, and seed data
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

create table if not exists orders (
  id bigint generated always as identity primary key,
  table_label text not null,
  server_name text not null,
  status text not null default 'open' check (status in ('open', 'paid')),
  covers int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders (id) on delete cascade,
  menu_item_id text references menu_items (id),
  name text not null,
  price numeric(10, 2) not null,
  qty int not null
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

-- No direct anon access to the staff table (pins live here) — only the view/RPC above.
drop policy if exists "menu_items read" on menu_items;
create policy "menu_items read" on menu_items for select using (true);
drop policy if exists "menu_items write" on menu_items;
create policy "menu_items write" on menu_items for update using (true);

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

grant select on staff_public to anon, authenticated;
grant execute on function check_staff_pin(text, text) to anon, authenticated;
grant execute on function set_staff_clocked_in(text, boolean) to anon, authenticated;
grant select, update on menu_items to anon, authenticated;
grant select, insert, update, delete on orders to anon, authenticated;
grant select, insert, delete on order_items to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Seed data (matches the "Ember & Oak" design mock)

insert into staff (id, name, role, login_role, pin, clocked_in) values
  ('c1', 'Maria Lopez', 'Server', 'cashier', '1234', true),
  ('c2', 'James Chen', 'Server', 'cashier', '2345', true),
  ('c3', 'Ana Rivera', 'Bartender', 'cashier', '3456', false),
  ('c4', 'Devon Wright', 'Host', 'cashier', '4567', true),
  ('a1', 'Sam Okafor', 'Owner', 'admin', '9001', true),
  ('a2', 'Rosa Martinez', 'Manager', 'admin', '9002', true)
on conflict (id) do nothing;

insert into menu_items (id, name, category, price, available) values
  ('i1', 'Roasted Beet Salad', 'Starters', 12, true),
  ('i2', 'French Onion Soup', 'Starters', 10, true),
  ('i3', 'Charred Octopus', 'Starters', 18, true),
  ('i4', 'Burrata Board', 'Starters', 15, false),
  ('i5', 'Braised Short Rib', 'Mains', 32, true),
  ('i6', 'Roast Chicken', 'Mains', 26, true),
  ('i7', 'Pan-Seared Salmon', 'Mains', 29, true),
  ('i8', 'Wild Mushroom Risotto', 'Mains', 24, true),
  ('i9', 'Grass-Fed Burger', 'Mains', 19, true),
  ('i10', 'Truffle Fries', 'Sides', 9, true),
  ('i11', 'Grilled Asparagus', 'Sides', 8, true),
  ('i12', 'Mac & Cheese', 'Sides', 8, true),
  ('i13', 'House Red', 'Drinks', 12, true),
  ('i14', 'House White', 'Drinks', 12, true),
  ('i15', 'Draft Lager', 'Drinks', 7, true),
  ('i16', 'Espresso', 'Drinks', 4, true),
  ('i17', 'Sparkling Water', 'Drinks', 5, true),
  ('i18', 'Chocolate Torte', 'Desserts', 11, true),
  ('i19', 'Crème Brûlée', 'Desserts', 10, true),
  ('i20', 'Affogato', 'Desserts', 8, false)
on conflict (id) do nothing;
