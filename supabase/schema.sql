-- Run this once in your Supabase project's SQL Editor
-- (Project dashboard -> SQL Editor -> New query -> paste -> Run)

create table public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  reward integer not null default 5,
  due_date timestamptz,
  completed_at timestamptz,
  archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "Owners manage their tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Run these if the table already existed before these columns were added:
-- alter table public.tasks add column if not exists due_date timestamptz;
-- alter table public.tasks add column if not exists completed_at timestamptz;
-- alter table public.tasks add column if not exists archived boolean not null default false;
-- alter table public.tasks add column if not exists archived_at timestamptz;

create table public.spend_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  redeemed boolean not null default false,
  cost integer not null default 5,
  created_at timestamptz not null default now()
);
alter table public.spend_items enable row level security;
create policy "Owners manage their spend items" on public.spend_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  amount integer not null default 0
);
alter table public.balances enable row level security;
create policy "Owners manage their balance" on public.balances
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.links (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.links enable row level security;
create policy "Owners manage their links" on public.links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic earn/spend: creates the row on first use, floors at 0 server-side
create or replace function public.adjust_balance(delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_amount integer;
begin
  insert into public.balances (user_id, amount)
  values (auth.uid(), greatest(delta, 0))
  on conflict (user_id) do update
    set amount = greatest(public.balances.amount + delta, 0)
  returning amount into new_amount;
  return new_amount;
end;
$$;
grant execute on function public.adjust_balance(integer) to authenticated;
