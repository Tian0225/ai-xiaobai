-- 代币流水表：记录代币发放与消耗
create table if not exists public.token_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  order_id text null,
  biz_type text not null check (biz_type in ('token_basic', 'token_pro', 'token_consume')),
  change_amount integer not null,
  balance_after integer not null default 0,
  note text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_token_ledger_user_id_created_at on public.token_ledger (user_id, created_at desc);
create index if not exists idx_token_ledger_order_id on public.token_ledger (order_id);
create unique index if not exists idx_token_ledger_user_biz_order_unique
  on public.token_ledger (user_id, biz_type, order_id)
  where order_id is not null;

alter table public.token_ledger enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'token_ledger'
      and policyname = 'Users can view own token ledger'
  ) then
    create policy "Users can view own token ledger"
      on public.token_ledger for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- 写入建议通过 service role 完成（如订单核销发放）
