# Fundtrust Apps Script Backend

This project includes a Google Apps Script backend so Fundtrust can use Google Sheets without a paid backend service.

## Quick Setup

1. Open your Google Sheet.
2. Click `Extensions` -> `Apps Script`.
3. Replace the default code with the contents of `FundtrustBackend.gs`.
4. Set `CONFIG.SHARED_SECRET` to a strong secret.
5. If the script is not bound to the spreadsheet, set `CONFIG.SPREADSHEET_ID`.
6. Click `Deploy` -> `New deployment`.
7. Choose `Web app`.
8. Execute as: `Me`.
9. Who has access: `Anyone`.
10. Copy the Web App URL into `APPS_SCRIPT_WEB_APP_URL` in your `.env.local`.
11. Copy the same secret into `APPS_SCRIPT_SHARED_SECRET`.

## Sheet Tabs

Create these tabs and headers exactly:

### Customers

`id, name, address, sex, age, phone, email, weeklyPayment, balanceToComplete, totalAmount, dateJoined`

### Agents

`id, name, phone, address, gender, passwordHash, dateRegistered, status`

### Transactions

`id, date, customerId, customerName, agentId, agentName, amount, type`
