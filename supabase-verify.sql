-- Run this ONCE in Supabase: SQL Editor -> New query -> paste ALL of it -> Run.
-- Result should say "Success". If it shows a red error, send me that error text.
-- (Safe to run again. It also removes the older version that needed a code.)
-- It lets the public website look up ONE person by ID number and returns only:
-- name, role, ID, city, joining date, status, termination date, photo.
-- Your tables stay private (RLS untouched). Mobile, address and documents are never exposed.

drop function if exists public.verify_person(text, text);
drop function if exists public.verify_person(text);

create function public.verify_person(p_eid text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'name',   (data::jsonb)->>'name',
    'role',   (data::jsonb)->>'role',
    'eid',    (data::jsonb)->>'eid',
    'city',   (data::jsonb)->>'city',
    'join',   (data::jsonb)->>'join',
    'status', case when (data::jsonb)->'del' is not null then 'Inactive'
                   else coalesce(nullif((data::jsonb)->>'status',''), 'Active') end,
    'term',   (data::jsonb)->>'termDate',
    'photo',  (data::jsonb)->>'photo'
  )
  from public.vault_people
  where length(trim(coalesce(p_eid,''))) > 0
    and lower((data::jsonb)->>'eid') = lower(trim(p_eid))
  limit 1;
$$;

revoke all on function public.verify_person(text) from public;
grant execute on function public.verify_person(text) to anon, authenticated;

-- Reload the API so the new function is visible immediately
notify pgrst, 'reload schema';
