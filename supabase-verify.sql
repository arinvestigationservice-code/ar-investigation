-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- It lets the public website check ONE person (ID number + verification code)
-- and returns only: name, role, ID, city, joining date, status, photo.
-- Your tables stay private (RLS untouched). Mobile, address and documents are never exposed.

create or replace function public.verify_person(p_eid text, p_code text)
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
    and length(trim(coalesce(p_code,''))) >= 6
    and lower(data->>'eid') = lower(trim(p_eid))
    and upper(coalesce(data->>'code','')) = upper(trim(p_code))
  limit 1;
$$;

revoke all on function public.verify_person(text, text) from public;
grant execute on function public.verify_person(text, text) to anon, authenticated;
