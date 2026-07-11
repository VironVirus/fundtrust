# Fundtrust

Fundtrust is a daily savings web app built with Next.js 15, TypeScript, Tailwind CSS, Server Actions, and Supabase.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase for application data
- Supabase notification queue for email events
- Simple signed-session authentication

## Features

- Shared login for customer, marketer, and admin accounts
- Customer self-service account creation
- Admin-managed marketer and admin account creation
- Deposit recording
- Admin dashboards and exports
- Notification events queued in Supabase for customer emails

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `APP_NAME`
- `APP_URL`
- `AUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SCHEMA`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_EMAIL`

The `ADMIN_*` values are for the bootstrap admin account used for the first admin login. After that, admins can create additional admins inside the app.

## Auth Model

- Guests can access the marketing pages plus `/login` and `/register`.
- Customers create their own accounts and set a password.
- Marketers are created by admins inside the admin portal.
- Admins can create other admins inside the admin portal.
- The shared `/login` page detects whether the credentials belong to a customer, marketer, or admin and routes the user to the right dashboard.

## Supabase Setup

Run the SQL in [supabase/schema.sql](/Users/mac/Desktop/fundtrust/supabase/schema.sql:1).

That creates:

- `customers`
- `admins`
- `agents`
- `transactions`
- `notification_events`
- `fundtrust_create_customer`
- `fundtrust_record_deposit`

The app now stores all operational data in Supabase.

It also queues email events in `notification_events` for:

- customer welcome emails
- deposit receipt emails
- contact form notifications

Your Supabase-side worker or Edge Function should process pending notification rows and send the actual emails.

The included Edge Function is:

- `supabase/functions/process-notification-events`
- `supabase/config.toml` sets `verify_jwt = false` for that function so the app can invoke it with the server key and the function can verify the request internally.

Set these Supabase function secrets before deploying it:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Admin Password Hash

Generate a hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('ChangeMe123!', 10))"
```

## Local Development

```bash
npm install
npm run dev
```

## Build Checks

```bash
npm run typecheck
npm run build
```

## Deployment

Deploy on Hostinger as a Node.js Web App with:

- Node.js `20.x`
- install command: `npm install`
- build command: `npm run build`
- start command: `npm run start`

See [HOSTINGER_DEPLOYMENT.md](/Users/mac/Desktop/fundtrust/HOSTINGER_DEPLOYMENT.md:1) for deployment details.
