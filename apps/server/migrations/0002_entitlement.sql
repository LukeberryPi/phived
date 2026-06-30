-- One entitlement row per user, written by the Polar webhook handlers in
-- auth.ts. `isEntitled = status in ('active','past_due')` (ADR 0005). Cascades
-- on user deletion so account deletion ([010]) removes billing linkage too.
create table entitlement (
  user_id text primary key references "user" ("id") on delete cascade,
  status text not null default 'none',
  polar_customer_id text,
  polar_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
