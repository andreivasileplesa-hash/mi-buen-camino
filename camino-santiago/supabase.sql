-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase.
-- Sustituye e6c1023c5a951f58c4ab59e490ba9aa16f6cc0ef048dee61cd3a5730c4f3cb80 por el SHA-256 hex de la clave
-- privada que solo llevarás en el enlace de edición (después de #editar=).
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.camino_state (
  id integer primary key check (id = 1),
  data jsonb not null default '{"stages": [], "days": {}}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.camino_state (id) values (1) on conflict (id) do nothing;
alter table public.camino_state enable row level security;
drop policy if exists "lectura publica camino" on public.camino_state;
create policy "lectura publica camino" on public.camino_state for select using (true);
grant select on public.camino_state to anon, authenticated;
revoke insert, update, delete on public.camino_state from anon, authenticated;

create table if not exists private.camino_editor_secret (
  id integer primary key check (id = 1),
  secret_hash text not null
);
revoke all on private.camino_editor_secret from public, anon, authenticated;
insert into private.camino_editor_secret (id, secret_hash)
values (1, 'e6c1023c5a951f58c4ab59e490ba9aa16f6cc0ef048dee61cd3a5730c4f3cb80')
on conflict (id) do update set secret_hash = excluded.secret_hash;

create or replace function public.guardar_camino(p_clave text, p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare esperado text;
begin
  select secret_hash into esperado from private.camino_editor_secret where id = 1;
  if esperado is null or encode(extensions.digest(convert_to(coalesce(p_clave, ''), 'UTF8'), 'sha256'), 'hex') <> esperado then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update public.camino_state set data = p_data, updated_at = now() where id = 1;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.guardar_camino(text, jsonb) from public;
grant execute on function public.guardar_camino(text, jsonb) to anon, authenticated;
