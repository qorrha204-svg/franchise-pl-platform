-- 가맹손익원장 schema (spec section 3)
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- against a fresh project, then run seed.sql.

create extension if not exists pgcrypto;

-- ============================== brands ==============================
create table if not exists brands (
  id text primary key,
  name text not null
);

-- ============================== stores ==============================
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  brand_id text not null references brands(id),
  complex_type text not null check (complex_type in ('단독점', '복합점')),
  store_type text not null check (store_type in ('가마솥', '배달점', '일반')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_stores_brand on stores(brand_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_stores_updated_at on stores;
create trigger trg_stores_updated_at
  before update on stores
  for each row
  execute function set_updated_at();

-- ============================== accounts (계정과목 마스터) ==============================
create table if not exists accounts (
  code text primary key,
  name text not null,
  type text not null check (type in ('revenue', 'cost')),
  category text not null check (category in ('매출', '매출원가', '고정비', '변동비')),
  group_label text not null,
  sort_order int not null default 0
);

-- ============================== financial_entries (손익 원장) ==============================
create table if not exists financial_entries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  account_code text not null references accounts(code),
  amount numeric not null default 0,
  qty integer,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  source text not null default 'manual' check (source in ('manual')),
  writer text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uq_financial_entry unique (store_id, month, account_code)
);

create index if not exists idx_financial_entries_store_month on financial_entries(store_id, month);
create index if not exists idx_financial_entries_status on financial_entries(status);
create index if not exists idx_financial_entries_month on financial_entries(month);

-- ============================== Row Level Security ==============================
-- No auth yet: anyone with the anon key (i.e. anyone with the app URL) can
-- read and write everything. This is intentional per spec section 6 — role
-- based access is deliberately deferred to a later phase.
alter table brands enable row level security;
alter table stores enable row level security;
alter table accounts enable row level security;
alter table financial_entries enable row level security;

drop policy if exists "public read brands" on brands;
create policy "public read brands" on brands for select using (true);

drop policy if exists "public read accounts" on accounts;
create policy "public read accounts" on accounts for select using (true);

drop policy if exists "public all stores" on stores;
create policy "public all stores" on stores for all using (true) with check (true);

drop policy if exists "public all financial_entries" on financial_entries;
create policy "public all financial_entries" on financial_entries for all using (true) with check (true);
