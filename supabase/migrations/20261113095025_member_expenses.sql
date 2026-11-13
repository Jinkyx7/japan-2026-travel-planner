-- One shared family trip. The allowlist is maintained through trusted administration,
-- never through a browser signup, user_metadata, or a client-editable role.
create schema if not exists private;

create table public.trip_travellers (
  id text primary key,
  display_name text not null check (length(btrim(display_name)) between 1 and 30),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$')
);
create table public.trip_members (
  email text primary key check (email = lower(btrim(email)) and position('@' in email) > 1),
  traveller_id text not null references public.trip_travellers(id),
  active boolean not null default true
);
create index trip_members_traveller_idx on public.trip_members(traveller_id);

create table public.trip_expenses (
  id uuid primary key,
  description text not null check (length(btrim(description)) between 1 and 120),
  category text not null check (category in ('food','transport','accommodation','shopping','activities','other')),
  -- Preserve exact original amounts. Do not let numeric rounding silently accept fractions.
  amount numeric not null check (amount > 0 and amount <= 1000000000 and amount = round(amount, 2)),
  currency text not null check (currency in ('JPY','NZD','CNY')),
  paid_by text not null references public.trip_travellers(id),
  date date not null,
  participant_ids text[] not null check (cardinality(participant_ids) between 1 and 100),
  shares jsonb,
  note text not null default '' check (length(note) <= 300),
  version integer not null default 1,
  created_by uuid not null default auth.uid(),
  updated_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (currency <> 'JPY' or amount = trunc(amount))
);
create index trip_expenses_paid_by_idx on public.trip_expenses(paid_by);
create index trip_expenses_date_idx on public.trip_expenses(date desc, id);

alter table public.trip_members enable row level security;
alter table public.trip_travellers enable row level security;
alter table public.trip_expenses enable row level security;

-- Auth's signed email claim follows a verified email login. User metadata is not trusted.
create policy own_active_membership on public.trip_members for select to authenticated
  using (active and (select auth.uid()) is not null and email = lower((select auth.jwt())->>'email'));

create policy members_read_travellers on public.trip_travellers for select to authenticated
  using ((select exists(select 1 from public.trip_members)));
create policy members_update_travellers on public.trip_travellers for update to authenticated
  using ((select exists(select 1 from public.trip_members)))
  with check ((select exists(select 1 from public.trip_members)));

create policy members_read_expenses on public.trip_expenses for select to authenticated
  using ((select exists(select 1 from public.trip_members)));
create policy members_add_expenses on public.trip_expenses for insert to authenticated
  with check ((select exists(select 1 from public.trip_members)) and created_by = (select auth.uid()));
create policy members_update_expenses on public.trip_expenses for update to authenticated
  using ((select exists(select 1 from public.trip_members)))
  with check ((select exists(select 1 from public.trip_members)));
create policy members_delete_expenses on public.trip_expenses for delete to authenticated
  using ((select exists(select 1 from public.trip_members)));

revoke all on public.trip_members, public.trip_travellers, public.trip_expenses from public, anon, authenticated;
grant select on public.trip_members, public.trip_travellers to authenticated;
grant update (display_name) on public.trip_travellers to authenticated;
grant select, insert, update, delete on public.trip_expenses to authenticated;
grant all on public.trip_members, public.trip_travellers, public.trip_expenses to service_role;

create function private.validate_trip_expense() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare participant_count integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in to record expenses' using errcode = '42501';
  end if;
  if array_ndims(new.participant_ids) <> 1 or array_position(new.participant_ids, null) is not null then
    raise exception 'Invalid participants' using errcode = '23514';
  end if;
  select count(distinct t.id) into participant_count
    from public.trip_travellers t where t.id = any(new.participant_ids);
  if participant_count <> cardinality(new.participant_ids) then
    raise exception 'Invalid or duplicate participants' using errcode = '23514';
  end if;
  if new.shares is not null then
    if jsonb_typeof(new.shares) <> 'object' then
      raise exception 'Invalid split weights' using errcode = '23514';
    end if;
    if exists (select 1 from jsonb_each(new.shares) as s
      where not (s.key = any(new.participant_ids)) or jsonb_typeof(s.value) <> 'number') then
      raise exception 'Invalid split weights' using errcode = '23514';
    end if;
    if exists (select 1 from jsonb_each_text(new.shares) as s
      where s.value::numeric <= 0 or s.value::numeric > 1000000000) then
      raise exception 'Invalid split weights' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if new.id <> old.id then raise exception 'Expense ID cannot change'; end if;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.version := old.version + 1;
  else
    new.created_by := auth.uid();
    new.created_at := now();
    new.version := 1;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.validate_trip_expense() from public, anon, authenticated;
create trigger validate_trip_expense before insert or update on public.trip_expenses
  for each row execute function private.validate_trip_expense();

insert into public.trip_travellers(id, display_name, color) values
  ('traveller-1','Traveller 1','#dce8ee'),
  ('traveller-2','Traveller 2','#f3e8d4'),
  ('traveller-3','Traveller 3','#e3e9df');
-- Personal email allowlists are seeded separately and must not be committed.
