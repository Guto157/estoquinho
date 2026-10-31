-- PEGA 1 PAGA 2: pedidos Pix e crédito idempotente
create table if not exists public.pix_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  package_dolars integer not null check (package_dolars in (10,50,100,500)),
  amount_brl numeric(10,2) not null check (
    (package_dolars=10 and amount_brl=5.00) or
    (package_dolars=50 and amount_brl=20.00) or
    (package_dolars=100 and amount_brl=35.00) or
    (package_dolars=500 and amount_brl=150.00)
  ),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  mp_payment_id text unique,
  pix_copy_paste text,
  pix_qr_base64 text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.pix_orders enable row level security;
revoke all on public.pix_orders from public, anon, authenticated;
grant select on public.pix_orders to authenticated;
drop policy if exists "players read own pix orders" on public.pix_orders;
create policy "players read own pix orders" on public.pix_orders
for select to authenticated using (auth.uid() = user_id);

create or replace function public.credit_pix_order(p_order_id uuid, p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.pix_orders%rowtype;
begin
  select * into v_order
  from public.pix_orders
  where id = p_order_id
  for update;

  if not found then return false; end if;
  if v_order.status = 'approved' then return true; end if;
  if v_order.status <> 'pending' then return false; end if;
  if v_order.mp_payment_id is distinct from p_payment_id then return false; end if;

  update public.game_saves
  set game_data = jsonb_set(
        coalesce(game_data, '{}'::jsonb),
        '{dolar}',
        to_jsonb(
          coalesce((game_data->>'dolar')::numeric, 0) + v_order.package_dolars
        ),
        true
      ),
      version = coalesce(version, 0) + 1,
      updated_at = now()
  where user_id = v_order.user_id;

  if not found then
    raise exception 'Progresso do jogador não encontrado';
  end if;

  update public.pix_orders
  set status = 'approved', paid_at = now()
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.credit_pix_order(uuid,text) from public, anon, authenticated;
grant execute on function public.credit_pix_order(uuid,text) to service_role;
