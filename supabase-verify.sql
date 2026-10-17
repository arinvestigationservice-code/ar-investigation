-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- (Safe to run again. It also removes the older version that needed a code.)
-- It lets the public website look up ONE person by ID number and returns only:
-- name, role, ID, city, joining date, status, termination date, photo.
-- Your tables stay private (RLS untouched). Mobile, address and documents are never exposed.

drop function if exists public.verify_person(text, text);

create or replace function public.verify_person(p_eid text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'name',   data->>'name',
    'role',   data->>'role',
    'eid',    data->>'eid',
    'city',   data->>'city',
    'join',   data->>'join',
    'status', case when data ? 'del' then 'Inactive'
                   else coalesce(nullif(data->>'status',''), 'Active') end,
    'term',   data->>'termDate',
    'photo',  data->>'photo'
  )
  from public.vault_people
  where length(trim(coalesce(p_eid,''))) > 0
    and lower(data->>'eid') = lower(trim(p_eid))
  limit 1;
$$;

revoke all on function public.verify_person(text) from public;
grant execute on function public.verify_person(text) to anon, authenticated;
