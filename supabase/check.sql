-- Exercises the schema as two ordinary signed-in users. Every block that
-- must fail is wrapped so the failure is asserted rather than fatal.
\set ON_ERROR_STOP on
\pset pager off

create or replace function pg_temp.expect(cond boolean, what text) returns void
language plpgsql as $$
begin
  if cond then raise notice 'ok   %', what;
  else raise exception 'FAIL %', what; end if;
end $$;

-- Two accounts. The trigger should mint a profile for each.
delete from auth.users;
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '{"display_name":"Ailsa"}'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '{}');

do $$ begin perform pg_temp.expect(
  (select count(*) from public.profiles) = 2, 'signup trigger created both profiles'); end $$;
do $$ begin perform pg_temp.expect(
  (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'Ailsa',
  'display_name came through from user metadata'); end $$;
do $$ begin perform pg_temp.expect(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 'Explorer',
  'missing display_name falls back'); end $$;

-- Photographs for A, one for B.
insert into public.photos (id, user_id, trip_id, poi_id, storage_path)
select 'p' || g, '11111111-1111-1111-1111-111111111111', 'trip-1', 'poi-' || g,
       '11111111-1111-1111-1111-111111111111/p' || g || '.jpg'
from generate_series(1, 12) g;
insert into public.photos (id, user_id, trip_id, poi_id, storage_path)
values ('bee', '22222222-2222-2222-2222-222222222222', 'trip-b', 'poi-x',
        '22222222-2222-2222-2222-222222222222/bee.jpg');

-- ---------- now act as user A ----------
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$ begin perform pg_temp.expect(
  (select count(*) from public.profiles) = 1, 'A sees only their own profile'); end $$;
do $$ begin perform pg_temp.expect(
  (select count(*) from public.photos) = 12, 'A sees only their own photographs'); end $$;
do $$ begin perform pg_temp.expect(
  (select count(*) from public.products) = 4, 'the price list is readable'); end $$;

-- A must not be able to write the profile document directly.
do $$
begin
  update public.profiles set data = '{"xp":999999}'::jsonb;
  raise exception 'FAIL a client wrote profiles.data directly';
exception when insufficient_privilege then
  raise notice 'ok   profiles.data is not directly writable';
end $$;

-- ...but renaming is allowed.
update public.profiles set display_name = 'Ailsa NicLeòid';
do $$ begin perform pg_temp.expect(
  (select display_name from public.profiles) = 'Ailsa NicLeòid', 'renaming yourself is allowed'); end $$;

-- push_profile: happy path, then a stale revision.
do $$
declare r record;
begin
  select * into r from public.push_profile('{"xp": 120}'::jsonb, 0);
  perform pg_temp.expect(r.ok and r.revision = 1, 'first push accepted, revision 1');

  select * into r from public.push_profile('{"xp": 130}'::jsonb, 0);
  perform pg_temp.expect(not r.ok and r.revision = 1, 'stale push refused, current revision reported');

  select * into r from public.push_profile('{"xp": 130}'::jsonb, 1);
  perform pg_temp.expect(r.ok and r.revision = 2, 'retry at the right revision accepted');
end $$;

do $$ begin perform pg_temp.expect(
  (select data ->> 'xp' from public.profiles) = '130', 'the refused push did not land'); end $$;

-- Orders may not be inserted by hand.
do $$
begin
  insert into public.orders (ref, user_id, product_id, kind, total_pence)
  values ('BRAW-FREE44', '11111111-1111-1111-1111-111111111111', 'calendar-a4', 'calendar', 0);
  raise exception 'FAIL a client inserted its own order';
exception when insufficient_privilege then
  raise notice 'ok   orders cannot be inserted by a client';
end $$;

-- The real path.
do $$
declare o public.orders%rowtype; items jsonb;
begin
  select jsonb_agg(jsonb_build_object('photo_id', 'p' || g, 'month', g))
    into items from generate_series(1, 12) g;
  o := public.create_order('calendar-a4', items);
  perform pg_temp.expect(o.total_pence = 2400, 'the server priced the calendar, not the client');
  perform pg_temp.expect(o.status = 'draft', 'a new order starts as a draft');
  perform pg_temp.expect(o.ref ~ '^BRAW-[346789CDFHJKMNPR]{6}$', 'the reference avoids confusable characters');
end $$;

-- Wrong number of photographs.
do $$
declare items jsonb;
begin
  select jsonb_agg(jsonb_build_object('photo_id', 'p' || g)) into items from generate_series(1, 11) g;
  perform public.create_order('calendar-a4', items);
  raise exception 'FAIL an eleven-photograph calendar was accepted';
exception when sqlstate '22023' then
  raise notice 'ok   a calendar must carry twelve photographs';
end $$;

-- Referencing somebody else's photograph.
do $$
declare items jsonb;
begin
  select jsonb_agg(jsonb_build_object('photo_id', x)) into items
    from unnest(array['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','bee']) x;
  perform public.create_order('calendar-a4', items);
  raise exception 'FAIL an order referenced another users photograph';
exception when sqlstate '42501' then
  raise notice 'ok   you cannot put someone elses photograph in your calendar';
end $$;

-- The same photograph twice is a legitimate basket.
do $$
declare o public.orders%rowtype; items jsonb;
begin
  select jsonb_agg(jsonb_build_object('photo_id', 'p' || least(g, 6), 'month', g))
    into items from generate_series(1, 12) g;
  o := public.create_order('calendar-a4', items);
  perform pg_temp.expect(o.total_pence = 2400, 'repeating a photograph across months is allowed');
end $$;

-- Discounting yourself by PATCHing the total.
do $$
begin
  update public.orders set total_pence = 0;
  raise exception 'FAIL a client rewrote its own total';
exception when insufficient_privilege then
  raise notice 'ok   total_pence is not client-writable';
end $$;

-- Cancelling is.
update public.orders set status = 'cancelled' where status = 'draft';
do $$ begin perform pg_temp.expect(
  (select count(*) from public.orders where status = 'cancelled') = 2, 'an unpaid order can be cancelled'); end $$;

-- Marking your own order paid is not. Needs a live draft to act on:
-- everything above is cancelled by now, and an UPDATE that matches no
-- rows succeeds trivially, which would make this assertion vacuous.
do $$
declare items jsonb; o public.orders%rowtype;
begin
  select jsonb_agg(jsonb_build_object('photo_id', 'p' || g, 'month', g))
    into items from generate_series(1, 12) g;
  o := public.create_order('calendar-a4', items);
  perform pg_temp.expect(
    (select count(*) from public.orders where status = 'draft') = 1,
    'there is a live draft to attack');
  begin
    update public.orders set status = 'paid' where status = 'draft';
    raise exception 'FAIL a client marked its own order paid';
  exception when insufficient_privilege or check_violation then
    raise notice 'ok   a client cannot mark an order paid';
  end;
  perform pg_temp.expect(
    (select status from public.orders where id = o.id) = 'draft',
    'the order is still a draft afterwards');
end $$;

-- Submitting one, though, is the client's job.
update public.orders set status = 'submitted' where status = 'draft';
do $$ begin perform pg_temp.expect(
  (select count(*) from public.orders where status = 'submitted') = 1,
  'a draft can be submitted'); end $$;

-- ---------- and as user B ----------
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin perform pg_temp.expect(
  (select count(*) from public.orders) = 0, 'B cannot see As orders'); end $$;
do $$ begin perform pg_temp.expect(
  (select count(*) from public.photos) = 1, 'B cannot see As photographs'); end $$;
do $$ begin perform pg_temp.expect(
  (select count(*) from public.profiles) = 1, 'B cannot see As profile'); end $$;

do $$
declare r record;
begin
  select * into r from public.push_profile('{"stolen": true}'::jsonb, 2);
  perform pg_temp.expect(not r.ok, 'B cannot push into As profile by guessing a revision');
end $$;

-- ---------- signed out ----------
-- anon holds no privilege on the private tables at all, so these are
-- refused outright rather than filtered to nothing. That is the stronger
-- outcome of the two: it does not depend on a policy being correct.
set request.jwt.claim.sub = '';
set role anon;

do $$
declare tbl text;
begin
  foreach tbl in array array['profiles', 'photos', 'orders'] loop
    begin
      execute format('select count(*) from public.%I', tbl);
      raise exception 'FAIL a signed-out visitor could read %', tbl;
    exception when insufficient_privilege then
      raise notice 'ok   a signed-out visitor is refused %', tbl;
    end;
  end loop;
end $$;

do $$ begin perform pg_temp.expect(
  (select count(*) from public.products) = 4, 'but can still browse the shop'); end $$;

do $$
begin
  perform public.create_order('calendar-a4', '[]'::jsonb);
  raise exception 'FAIL a signed-out visitor placed an order';
exception when insufficient_privilege then
  raise notice 'ok   a signed-out visitor cannot place an order';
end $$;

reset role;
