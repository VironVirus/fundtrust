# Hostinger Deployment

Fundtrust runs on Hostinger as a Next.js Node.js app backed by Supabase.

## Hostinger Settings

- Framework: `Next.js`
- Node.js version: `20.x`
- Root directory: `/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`

## Required Environment Variables

- `APP_NAME`
- `APP_URL`
- `AUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SCHEMA`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_EMAIL`

## Before Deploy

1. Create your Supabase project.
2. Run the SQL in [supabase/schema.sql](/Users/mac/Desktop/fundtrust/supabase/schema.sql:1).
3. Confirm these tables exist:
   - `customers`
   - `admins`
   - `agents`
   - `transactions`
   - `notification_events`
4. Confirm these RPC functions exist:
   - `fundtrust_create_customer`
   - `fundtrust_record_deposit`
5. Add your Supabase project URL and service role key to Hostinger.
6. Deploy `supabase/functions/process-notification-events`.
7. Add these Supabase function secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
8. Keep `supabase/config.toml` with `verify_jwt = false` for `process-notification-events`, because this function authorizes requests with the server key inside the handler.

## Where Each Env Comes From

- `APP_NAME`
  - Set this yourself. Example: `Fundtrust`.
- `APP_URL`
  - Set this to the final Hostinger URL for the app.
- `AUTH_SECRET`
  - Generate this yourself with a secure random string.
- `SUPABASE_URL`
  - Supabase Dashboard -> Project Settings -> API.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Supabase Dashboard -> Project Settings -> API -> Legacy API Keys -> `service_role`.
- `SUPABASE_SCHEMA`
  - Usually `public`.
- `ADMIN_LOGIN`
  - Choose this yourself for the bootstrap admin account.
- `ADMIN_PASSWORD_HASH`
  - Generate a bcrypt hash locally from the bootstrap admin password.
- `ADMIN_EMAIL`
  - Choose the email address for the bootstrap admin.

## Deploy

1. Push the repo to GitHub.
2. In Hostinger hPanel, go to `Websites`.
3. Click `Add website`.
4. Choose `Node.js Web App` or `Deploy Web App`, depending on the label shown in your dashboard.
5. Import the repository.
6. Set:
   - Node.js version: `20.x`
   - Install command: `npm install`
   - Build command: `npm run build`
   - Start command: `npm run start`
7. Add the environment variables.
8. Deploy.

## Hostinger Notes

- Hostinger's current Node.js deployment flow can auto-connect Supabase through its Database Connect Wizard, or you can add the variables manually in `Settings & Redeploy`.
- If you change environment variables later, use `Settings & Redeploy` so the next build receives the new values.

## Supabase Function Deploy Example

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_KEY" RESEND_API_KEY="re_xxx" EMAIL_FROM="Fundtrust <noreply@yourdomain.com>"
supabase functions deploy process-notification-events
```

## After Deploy

1. Open the site.
2. Log in with the bootstrap admin account from `ADMIN_LOGIN` and the original password used to create `ADMIN_PASSWORD_HASH`.
3. Create a marketer from `Admin -> Marketers`.
4. Create another admin from `Admin -> Admins` if needed.
5. Test customer registration from `/register`.
6. Test shared login from `/login` with a customer, marketer, and admin account.
7. Test one deposit.
8. Confirm data is written to Supabase.
9. Confirm notification rows are written to `notification_events`.
10. Confirm the Edge Function marks them as `sent`.
