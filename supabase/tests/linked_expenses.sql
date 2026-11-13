begin;
insert into public.trip_members(email,traveller_id) values ('linked-test@example.invalid','traveller-1');
select set_config('request.jwt.claims','{"sub":"30000000-0000-4000-8000-000000000001","email":"linked-test@example.invalid","role":"authenticated"}',true);
set local role authenticated;
do $$
begin
  if not exists(select 1 from public.trip_expense_targets where id='stay:gracery:2026-12-19') then raise exception 'Stay target missing'; end if;
  begin
    insert into public.trip_expense_targets values ('stop:invalid:new','stop');
    raise exception 'FAIL: member can create arbitrary link targets';
  exception when insufficient_privilege then null; end;
  insert into public.trip_expenses(id,description,category,amount,currency,paid_by,date,participant_ids,linked_item_id)
    values ('40000000-0000-4000-8000-000000000001','Linked test deposit','accommodation',10000,'JPY','traveller-1','2026-11-13',array['traveller-1','traveller-2'],'stay:gracery:2026-12-19');
  if not exists(select 1 from public.trip_expenses where id='40000000-0000-4000-8000-000000000001' and not item_paid_in_full) then raise exception 'Deposit was automatically marked paid in full'; end if;
  update public.trip_expenses set item_paid_in_full=true where id='40000000-0000-4000-8000-000000000001' and version=1;
  if not exists(select 1 from public.trip_expenses where id='40000000-0000-4000-8000-000000000001' and version=2 and item_paid_in_full) then raise exception 'Cannot record full payment'; end if;
  begin
    update public.trip_expenses set linked_item_id='stop:does-not-exist' where id='40000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: invalid reference accepted';
  exception when foreign_key_violation then null; end;
  begin
    update public.trip_expenses set linked_item_id=null where id='40000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: unlinked expense can mark an item fully paid';
  exception when check_violation then null; end;
  update public.trip_expenses set linked_item_id='stop:dec-19:tv-tower',item_paid_in_full=false where id='40000000-0000-4000-8000-000000000001';
  if not exists(select 1 from public.trip_expenses where id='40000000-0000-4000-8000-000000000001' and amount=10000 and linked_item_id='stop:dec-19:tv-tower') then raise exception 'Relinking changed the amount or failed'; end if;
  update public.trip_expenses set linked_item_id=null,item_paid_in_full=false where id='40000000-0000-4000-8000-000000000001';
  if not exists(select 1 from public.trip_expenses where id='40000000-0000-4000-8000-000000000001' and linked_item_id is null and amount=10000) then raise exception 'Unlinking lost the expense'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"30000000-0000-4000-8000-000000000002","email":"outsider@example.invalid","role":"authenticated"}',true);
do $$ begin
  if exists(select 1 from public.trip_expenses) or exists(select 1 from public.trip_expense_targets) then raise exception 'Nonmember can read linked payments or targets'; end if;
end $$;
set local role anon;
do $$ begin
  begin
    perform * from public.trip_expense_targets;
    raise exception 'FAIL: anonymous target access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: valid links, deposits, explicit completion, revision integrity, relinking, unlinking, invalid references and private access; fixtures rolled back' as result;
