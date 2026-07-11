create extension if not exists pgcrypto;

create table if not exists public.customers (
  id text primary key,
  name text not null,
  address text not null,
  sex text not null default 'Other',
  age integer not null default 0,
  phone text not null,
  email text not null,
  branch text not null,
  contribution_type text not null,
  savings_target numeric(12, 2) not null default 0,
  savings_duration integer not null default 0,
  weekly_payment numeric(12, 2) not null default 0,
  balance_to_complete numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  password_hash text not null default '',
  status text not null default 'Active',
  date_joined timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  login text not null,
  email text not null,
  password_hash text not null,
  status text not null default 'Active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  address text not null,
  branch text not null,
  gender text not null default 'Other',
  password_hash text not null,
  date_registered timestamptz not null default timezone('utc', now()),
  status text not null default 'Active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default timezone('utc', now()),
  customer_id text not null references public.customers(id) on delete cascade,
  customer_name text not null,
  agent_id uuid not null references public.agents(id) on delete restrict,
  agent_name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('cash', 'transfer'))
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  to_email text not null,
  subject text not null,
  text_body text not null,
  html_body text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempt_count integer not null default 0,
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.notification_events
  add column if not exists attempt_count integer not null default 0;

alter table if exists public.notification_events
  add column if not exists last_error text;

alter table if exists public.notification_events
  add column if not exists processed_at timestamptz;

alter table if exists public.notification_events
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table if exists public.customers
  add column if not exists password_hash text not null default '';

alter table if exists public.customers
  add column if not exists status text not null default 'Active';

create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_email_idx on public.customers (lower(email));
create index if not exists customers_branch_idx on public.customers (branch);
create unique index if not exists admins_login_idx on public.admins (lower(login));
create index if not exists admins_status_idx on public.admins (status);
create index if not exists agents_branch_idx on public.agents (branch);
create index if not exists transactions_customer_id_idx on public.transactions (customer_id);
create index if not exists transactions_agent_id_idx on public.transactions (agent_id);
create index if not exists transactions_date_idx on public.transactions (date desc);
create index if not exists notification_events_status_idx on public.notification_events (status, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
before update on public.agents
for each row
execute function public.set_updated_at();

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
before update on public.admins
for each row
execute function public.set_updated_at();

drop trigger if exists notification_events_set_updated_at on public.notification_events;
create trigger notification_events_set_updated_at
before update on public.notification_events
for each row
execute function public.set_updated_at();

create or replace function public.fundtrust_branch_code(branch_value text)
returns text
language sql
immutable
as $$
  select case trim(coalesce(branch_value, ''))
    when 'Onitsha' then '01'
    when 'Enugu' then '02'
    when 'Aba' then '03'
    when 'Nsukka' then '04'
    else ''
  end;
$$;

create or replace function public.fundtrust_contribution_code(contribution_value text)
returns text
language sql
immutable
as $$
  select case trim(coalesce(contribution_value, ''))
    when 'Daily contribution' then '01'
    when 'Loan' then '02'
    when 'Property purchase' then '03'
    else ''
  end;
$$;

create or replace function public.fundtrust_create_customer(customer_payload jsonb)
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  branch_value text;
  contribution_value text;
  branch_code text;
  contribution_code text;
  next_serial integer;
  generated_id text;
  savings_target_value numeric(12, 2);
  savings_duration_value integer;
  weekly_payment_value numeric(12, 2);
  created_customer public.customers;
begin
  branch_value := trim(coalesce(customer_payload ->> 'branch', ''));
  contribution_value := trim(coalesce(customer_payload ->> 'contributionType', ''));
  branch_code := public.fundtrust_branch_code(branch_value);
  contribution_code := public.fundtrust_contribution_code(contribution_value);

  if trim(coalesce(customer_payload ->> 'passwordHash', '')) = '' then
    raise exception 'A customer password is required.';
  end if;

  if branch_code = '' then
    raise exception 'A valid branch is required.';
  end if;

  if contribution_code = '' then
    raise exception 'A valid plan type is required.';
  end if;

  if exists (
    select 1
    from public.customers
    where regexp_replace(coalesce(phone, ''), '\s+', '', 'g') =
      regexp_replace(trim(coalesce(customer_payload ->> 'phone', '')), '\s+', '', 'g')
      or lower(coalesce(email, '')) = lower(trim(coalesce(customer_payload ->> 'email', '')))
  ) then
    raise exception 'A customer with that phone number or email already exists.';
  end if;

  select coalesce(max(right(id, 4)::integer), 0) + 1
    into next_serial
  from public.customers
  where left(id, 2) = branch_code
    and id ~ '^\d{8}$';

  if next_serial > 9999 then
    raise exception 'This branch has reached the maximum customer serial number.';
  end if;

  generated_id := branch_code || contribution_code || lpad(next_serial::text, 4, '0');
  savings_target_value := coalesce((customer_payload ->> 'savingsTarget')::numeric, 0);
  savings_duration_value := coalesce((customer_payload ->> 'savingsDuration')::integer, 0);
  weekly_payment_value :=
    case
      when savings_target_value > 0 and savings_duration_value > 0
        then savings_target_value / savings_duration_value
      else 0
    end;

  insert into public.customers (
    id,
    name,
    address,
    sex,
    age,
    phone,
    email,
    branch,
    contribution_type,
    savings_target,
    savings_duration,
    weekly_payment,
    balance_to_complete,
    total_amount,
    password_hash,
    status,
    date_joined
  )
  values (
    generated_id,
    trim(coalesce(customer_payload ->> 'name', '')),
    trim(coalesce(customer_payload ->> 'address', '')),
    coalesce(nullif(trim(coalesce(customer_payload ->> 'sex', '')), ''), 'Other'),
    coalesce((customer_payload ->> 'age')::integer, 0),
    trim(coalesce(customer_payload ->> 'phone', '')),
    trim(coalesce(customer_payload ->> 'email', '')),
    branch_value,
    contribution_value,
    savings_target_value,
    savings_duration_value,
    weekly_payment_value,
    0,
    0,
    trim(coalesce(customer_payload ->> 'passwordHash', '')),
    'Active',
    coalesce((customer_payload ->> 'dateJoined')::timestamptz, timezone('utc', now()))
  )
  returning * into created_customer;

  return created_customer;
end;
$$;

create or replace function public.fundtrust_record_deposit(
  p_customer_id text,
  p_amount numeric,
  p_agent_id uuid,
  p_agent_name text,
  p_payment_method text
)
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_customer public.customers;
  normalized_payment_method text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Deposit amount must be greater than zero.';
  end if;

  normalized_payment_method :=
    case lower(trim(coalesce(p_payment_method, '')))
      when 'transfer' then 'transfer'
      when 'bank transfer' then 'transfer'
      when 'bank-transfer' then 'transfer'
      else 'cash'
    end;

  update public.customers
  set
    total_amount = coalesce(total_amount, 0) + p_amount,
    balance_to_complete = greatest(0, coalesce(balance_to_complete, 0) - p_amount)
  where id = p_customer_id
  returning * into updated_customer;

  if updated_customer.id is null then
    raise exception 'Customer record not found.';
  end if;

  insert into public.transactions (
    customer_id,
    customer_name,
    agent_id,
    agent_name,
    amount,
    type
  )
  values (
    updated_customer.id,
    updated_customer.name,
    p_agent_id,
    trim(coalesce(p_agent_name, '')),
    p_amount,
    normalized_payment_method
  );

  return updated_customer;
end;
$$;
