-- Run using a trusted SQL connection; all fixtures and changes are rolled back.
begin;
insert into public.trip_members(email, traveller_id) values ('rls-member@example.invalid','traveller-1');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","email":"rls-member@example.invalid","role":"authenticated"}', true);
set local role authenticated;
do $$
declare n integer; original_user uuid;
begin
  if (select count(*) from public.trip_members) <> 1 then raise exception 'Member must only see their own membership'; end if;
  if (select count(*) from public.trip_travellers) <> 3 then raise exception 'Member should see travellers'; end if;
  begin
    insert into public.trip_members values ('intruder@example.invalid','traveller-2',true);
    raise exception 'FAIL: client can add members';
  exception when insufficient_privilege then null; end;
  begin
    update public.trip_members set active = false;
    raise exception 'FAIL: client can change membership';
  exception when insufficient_privilege then null; end;
  begin
    update public.trip_travellers set id='changed' where id='traveller-1';
    raise exception 'FAIL: client can change traveller IDs';
  exception when insufficient_privilege then null; end;
  update public.trip_travellers set display_name='Test nickname' where id='traveller-1';
  if not found then raise exception 'Member cannot update nickname'; end if;
  insert into public.trip_expenses(id,description,category,amount,currency,paid_by,date,participant_ids)
    values ('20000000-0000-4000-8000-000000000001','RLS test','food',9000,'JPY','traveller-1','2026-12-22',array['traveller-1','traveller-2','traveller-3']);
  select created_by into original_user from public.trip_expenses where id='20000000-0000-4000-8000-000000000001';
  if original_user <> auth.uid() then raise exception 'Creator not recorded'; end if;
  update public.trip_expenses set amount=12000,version=99,created_by='10000000-0000-4000-8000-000000000099'
    where id='20000000-0000-4000-8000-000000000001' and version=1;
  if not found then raise exception 'Member cannot update expense'; end if;
  if not exists(select 1 from public.trip_expenses where id='20000000-0000-4000-8000-000000000001' and version=2 and created_by=original_user) then
    raise exception 'Revision or creator can be forged';
  end if;
  update public.trip_expenses set amount=500 where id='20000000-0000-4000-8000-000000000001' and version=1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Stale edits must fail'; end if;
  begin
    update public.trip_expenses set amount=10.5 where id='20000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: fractional yen accepted';
  exception when check_violation then null; end;
  begin
    update public.trip_expenses set amount=1.234,currency='NZD' where id='20000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: fractional cents accepted';
  exception when check_violation then null; end;
  begin
    update public.trip_expenses set participant_ids=array['traveller-1','traveller-1'] where id='20000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: duplicate participants accepted';
  exception when check_violation then null; end;
  begin
    update public.trip_expenses set participant_ids=array['unknown'] where id='20000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: unknown participant accepted';
  exception when check_violation then null; end;
  begin
    update public.trip_expenses set shares='{"traveller-1":0}' where id='20000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: invalid split weights accepted';
  exception when check_violation then null; end;
end $$;

-- A different authenticated account cannot read or mutate any private data.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","email":"outsider@example.invalid","role":"authenticated","user_metadata":{"email":"rls-member@example.invalid","role":"admin"}}', true);
do $$
declare n integer;
begin
  if exists(select 1 from public.trip_expenses) or exists(select 1 from public.trip_travellers) or exists(select 1 from public.trip_members) then
    raise exception 'Nonmember can read private data';
  end if;
  update public.trip_expenses set amount=1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Nonmember can update expenses'; end if;
  delete from public.trip_expenses;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Nonmember can delete expenses'; end if;
  begin
    insert into public.trip_expenses(id,description,category,amount,currency,paid_by,date,participant_ids)
      values ('20000000-0000-4000-8000-000000000002','Denied','food',1,'JPY','traveller-1','2026-12-22',array['traveller-1']);
    raise exception 'FAIL: nonmember can add expenses';
  exception when insufficient_privilege or check_violation then null; end;
end $$;

-- Revocation takes effect on the next database request with the same token claims.
reset role;
update public.trip_members set active=false where email='rls-member@example.invalid';
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","email":"rls-member@example.invalid","role":"authenticated"}', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.trip_expenses) then raise exception 'Revoked member can read expenses'; end if;
end $$;
reset role;
update public.trip_members set active=true where email='rls-member@example.invalid';
set local role authenticated;
do $$ begin
  delete from public.trip_expenses where id='20000000-0000-4000-8000-000000000001' and version=2;
  if not found then raise exception 'Member cannot delete expense'; end if;
end $$;

set local role anon;
do $$ begin
  begin
    perform * from public.trip_expenses;
    raise exception 'FAIL: guest can read expenses';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.trip_members;
    raise exception 'FAIL: guest can read membership emails';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: member CRUD, validation, conflict protection, outsider isolation, revocation and guest denial; fixtures rolled back' as result;
