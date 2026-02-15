-- 卡密兑换表（会员卡密）
create table if not exists public.redeem_codes (
  code text primary key,
  status text not null default 'unused' check (status in ('unused', 'used', 'disabled')),
  source text,
  used_by uuid references auth.users(id) on delete set null,
  used_by_email text,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists redeem_codes_status_idx on public.redeem_codes(status);
create index if not exists redeem_codes_used_by_idx on public.redeem_codes(used_by);
create index if not exists redeem_codes_expires_at_idx on public.redeem_codes(expires_at);
