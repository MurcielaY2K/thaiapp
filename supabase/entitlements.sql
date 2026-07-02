-- Thai App — Premium entitlements (server-verified via Stripe webhook)
-- Run in Supabase: SQL Editor → New query → paste → Run
-- See docs/PAYMENTS_SETUP.md for the full deployment guide.

create table if not exists public.entitlements (
  auth_id                uuid primary key references auth.users(id) on delete cascade,
  status                 text not null default 'none'
                         check (status in ('none', 'active', 'past_due', 'canceled')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  updated_at             timestamptz default now()
);

-- Only the webhook (service role) writes; clients may read their own row.
alter table public.entitlements enable row level security;

create policy "owner read entitlement" on public.entitlements
  for select using (auth.uid() = auth_id);

-- No insert/update/delete policies on purpose: the Stripe webhook Edge
-- Function uses the service role key, which bypasses RLS. Clients cannot
-- grant themselves Premium.

-- Look up rows quickly by Stripe ids when subscription events arrive.
create index if not exists entitlements_subscription_idx
  on public.entitlements (stripe_subscription_id);
create index if not exists entitlements_customer_idx
  on public.entitlements (stripe_customer_id);
