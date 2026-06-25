# Gym Management System

This project is now split into:

- `frontend/` for the React app
- `backend/` for the Node.js + Express API
- MongoDB as the database layer

Your previous single-file frontend has been preserved in `frontend/legacy/` so it can be migrated into React gradually.

## Project Structure

```text
gym management system/
  frontend/
    src/
    legacy/
  backend/
    src/
    data/
    .env.example
```

## Setup

Install dependencies separately for each app:

```bash
npm install --prefix frontend
npm install --prefix backend
```

Create your backend environment file:

```bash
copy backend\\.env.example backend\\.env
```

Update `backend/.env` if your MongoDB connection string, frontend URL, or cookie settings are different.

## Notification Setup

The reminders feature supports two modes:

- `console` mode for safe local testing
- live provider mode for real SMS and WhatsApp delivery

By default, `backend/.env.example` is configured for `console` mode. In this mode:

- reminder drafts can be created
- provider status is visible in the Reports screen
- "Send Now" works through the app flow, but uses sandbox providers for development/testing

### SMS Options

Use console mode:

```env
REMINDER_SMS_PROVIDER=console
```

Use Twilio SMS:

```env
REMINDER_SMS_PROVIDER=twilio
REMINDER_SMS_FROM=+1234567890
REMINDER_TWILIO_ACCOUNT_SID=your_account_sid
REMINDER_TWILIO_AUTH_TOKEN=your_auth_token
REMINDER_TWILIO_MESSAGING_SERVICE_SID=
```

Notes:

- Either `REMINDER_SMS_FROM` or `REMINDER_TWILIO_MESSAGING_SERVICE_SID` must be set for Twilio
- If you use a messaging service, you can leave `REMINDER_SMS_FROM` blank

### WhatsApp Options

Use console mode:

```env
REMINDER_WHATSAPP_PROVIDER=console
```

Use Meta WhatsApp Cloud API:

```env
REMINDER_WHATSAPP_PROVIDER=meta-cloud
REMINDER_WHATSAPP_ACCESS_TOKEN=your_access_token
REMINDER_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### What The App Does

- `Create WhatsApp Drafts` and `Create SMS Drafts` generate reminder records in the database
- `Send Now` sends a pending reminder through the configured provider
- delivery metadata such as provider, external id, sent time, and actor are stored and shown in Reports

### Recommended Local Flow

1. Keep both providers in `console` mode while building features
2. Verify reminder generation and delivery logs in the Reports screen
3. Switch one provider at a time to live mode when credentials are ready
4. Re-test using a small set of real numbers before broader usage

## Run

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open the React app at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:3000
```

## Notes

- The backend contains the Express + MongoDB API used by the React frontend.
- If `frontend/dist` exists, the backend can serve the built frontend automatically.
- Legacy import is optional: if you place an old JSON export at `backend/data/db.json`, the backend will import it on first boot.
- Integration tests cover auth, state persistence, trainer permissions, and reminder delivery flow.
