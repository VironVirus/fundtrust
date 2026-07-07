# Fundtrust

Fundtrust is a production-ready daily contribution and thrift savings web app built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui-style components, Google Sheets through Google Apps Script, and Server Actions.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui component structure
- Lucide React
- Google Sheets through a Google Apps Script web app backend
- Server Actions for all write operations
- Resend or Nodemailer for email delivery
- Simple credentials authentication with signed sessions

## What's Included

- Public marketing pages: Home, About, How it Works, Contact
- Marketer portal: registration, login, dashboard, deposits, printable daily report
- Admin portal: login, dashboard, customers, marketers, transactions, editing
- Zod validation, sonner toasts, responsive layouts, CSV export, print views
- Email and optional WhatsApp customer alerts for registration and deposits

## Project Structure

```text
src/
  actions/              Server Actions for auth, deposits, customers, contact
  app/                  App Router pages, layouts, route handlers
  components/           UI primitives, layouts, forms, dashboard pieces
  lib/                  Auth, env parsing, Sheets access, email, formatting
```

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your values.

Important:

- `.env.local` is intentionally ignored by Git and should never be committed.
- Set the same values again in Netlify under `Site configuration -> Environment variables`.
- The checked-in Apps Script file now uses a placeholder secret. Keep your real deployed secret private and store it only in `.env.local` or Netlify env vars.

### Optional WhatsApp setup

Fundtrust supports WhatsApp alerts through the official Meta WhatsApp Business Platform.

To send automated alerts, your WhatsApp business phone number must be registered in Meta and connected to your business portfolio.

Fill these environment variables when you are ready:

- `WHATSAPP_PROVIDER=meta`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_PHONE`
- `WHATSAPP_TEMPLATE_LANGUAGE`
- `WHATSAPP_TEMPLATE_REGISTRATION`
- `WHATSAPP_TEMPLATE_DEPOSIT`

### Required WhatsApp templates

Because registration and deposit alerts are business-initiated outbound messages, Meta requires approved WhatsApp message templates before the app can send them.

Create and approve two templates in WhatsApp Manager:

- A registration template with 4 body parameters in this order: customer name, customer ID, branch, contribution type
- A deposit template with 5 body parameters in this order: customer name, marketer name, amount, payment method, transaction date/time

Then put those template names into:

- `WHATSAPP_TEMPLATE_REGISTRATION`
- `WHATSAPP_TEMPLATE_DEPOSIT`

### Required Google setup

1. Create or open your Google Sheet with the `Customers`, `Agents`, and `Transactions` tabs.
2. Open `Extensions` -> `Apps Script` from that sheet.
3. Paste the backend code from `apps-script/FundtrustBackend.gs`.
4. Set the `SHARED_SECRET` value in that Apps Script file.
5. Deploy the script as a Web App with access set to `Anyone`.
6. Copy the Web App URL into `APPS_SCRIPT_WEB_APP_URL` in `.env.local`.
7. Copy the same secret into `APPS_SCRIPT_SHARED_SECRET` in `.env.local`.

Note:

- The product UI refers to field staff as `Marketers`.
- The backing Google Sheet tab is still named `Agents` for compatibility with the current integration code.

### Required Google Sheets tabs

Create these exact sheet names and headers:

#### `Customers`

`id, name, address, sex, age, phone, email, branch, contributionType, savingsTarget, savingsDuration, weeklyPayment, balanceToComplete, totalAmount, dateJoined`

#### `Agents`

`id, name, phone, address, gender, passwordHash, dateRegistered, status, branch`

#### `Transactions`

`id, date, customerId, customerName, agentId, agentName, amount, type`

### Apps Script deployment

The project includes a ready-to-paste Apps Script backend in:

`apps-script/FundtrustBackend.gs`

You can optionally keep deployment notes beside it in:

`apps-script/README.md`

### Admin account

Set `ADMIN_LOGIN` and `ADMIN_PASSWORD_HASH`. To generate a hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('ChangeMe123!', 10))"
```

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## GitHub Handoff

Before pushing to GitHub:

1. Review `.env.local` and keep it local only.
2. Keep your real Apps Script shared secret, email credentials, and WhatsApp tokens out of Git.
3. Commit the source, not generated files. This repo now ignores `.next/`, `logs/`, local `.env` files, exported report files, and local Codex/runtime logs.
4. Push `package-lock.json` so the next machine gets the same dependency tree.

To continue on another system:

1. Clone the repo.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Re-enter your real secrets and service URLs.
5. Run `npm run dev`.

## Netlify Deployment

This project is ready for a Git-based Netlify deploy.

Important:

- Use GitHub import on Netlify, not drag-and-drop deploys.
- This app uses Next.js SSR, Server Actions, protected dashboards, and runtime environment variables, so it needs a full framework-aware deployment.

The repo includes `netlify.toml` with:

- build command: `npm run build`
- publish directory: `.next`
- Node version: `20`

Deployment steps:

1. Push the repo to GitHub.
2. In Netlify, choose `Add new site` -> `Import an existing project`.
3. Connect the GitHub repo.
4. Netlify should detect Next.js automatically and apply its current adapter.
5. Add all environment variables from your local `.env.local` into Netlify.
6. Trigger the first deploy.

Recommended Netlify environment variables:

- `APP_NAME`
- `APP_URL`
- `AUTH_SECRET`
- `APPS_SCRIPT_WEB_APP_URL`
- `APPS_SCRIPT_SHARED_SECRET`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_EMAIL`
- `EMAIL_PROVIDER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `WHATSAPP_PROVIDER`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_PHONE`
- `WHATSAPP_TEMPLATE_LANGUAGE`
- `WHATSAPP_TEMPLATE_REGISTRATION`
- `WHATSAPP_TEMPLATE_DEPOSIT`

If you do not want live email or WhatsApp on the first deploy, set:

- `EMAIL_PROVIDER=log`
- `WHATSAPP_PROVIDER=log`

## Build Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- Apps Script credentials and the shared secret never touch the client bundle.
- All mutations run through Server Actions.
- The original static prototype is preserved in `legacy-static/`.
