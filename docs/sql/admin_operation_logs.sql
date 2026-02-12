-- 后台操作日志表：记录会员开通/撤销/恢复、订单核销
create table if not exists public.admin_operation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null check (action in ('member_activate', 'member_revoke', 'member_restore', 'order_verify')),
  target_user_id uuid null references auth.users(id) on delete set null,
  target_user_email text null,
  target_order_id text null,
  result text not null check (result in ('success', 'failed')),
  detail jsonb not null default '{}'::jsonb,
  operator_ip text null,
  operator_user_agent text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_admin_operation_logs_created_at on public.admin_operation_logs (created_at desc);
create index if not exists idx_admin_operation_logs_target_user_id on public.admin_operation_logs (target_user_id);
create index if not exists idx_admin_operation_logs_target_order_id on public.admin_operation_logs (target_order_id);

alter table public.admin_operation_logs enable row level security;

-- 生产环境建议只通过 service role 写入和读取。
-- 如需在 SQL 客户端调试，可临时创建更细粒度策略。
