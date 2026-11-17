# DARMON — backend

NestJS API for the DARMON medical booking platform. Data lives in PostgreSQL (Drizzle ORM);
uploaded files are stored on disk and served from `/files/…`.

## Run

```bash
npm install
docker compose up -d   # local PostgreSQL (optional, see below)
npm run dev            # watch mode on http://localhost:3001
npm test               # unit tests (schedule, phone numbers)
npm run test:e2e       # HTTP tests on an in-memory database
```

Without `DATABASE_URL` the API starts on an embedded PGlite database in `./data/pglite` — fine for
development, **not for production**. Migrations in `drizzle/` are applied automatically on start.

### Moving from `db.json`

```bash
npm run db:import -- db.json   # into an empty database; keeps ids, moves inline images to UPLOAD_DIR
```

### Before going live

```bash
npm run db:cleanup-demo          # dry run: lists demo accounts (example.com etc. or DEMO_EMAILS)
npm run db:cleanup-demo -- --yes # deletes them and their data (admins are never touched)
```

### Schema changes

Edit `src/db/schema.ts`, then `npm run db:generate` to create a new migration in `drizzle/`.

## Environment

Copy `.env.example` to `.env` (it is loaded automatically on start).

| Variable             | Default               | Purpose                                                          |
| -------------------- | --------------------- | ---------------------------------------------------------------- |
| `JWT_SECRET`         | insecure dev value    | **Set in production.** Signs auth tokens.                        |
| `DATABASE_URL`       | — (embedded PGlite)   | **Set in production.** PostgreSQL connection string.             |
| `UPLOAD_DIR`         | `./uploads`           | Where uploaded files are stored                                  |
| `PUBLIC_URL`         | `http://localhost:PORT` | Public base URL of the API, used for file links               |
| `PORT`               | `3001`                | HTTP port                                                        |
| `FRONTEND_URL`       | any origin            | Allowed CORS origin(s), comma-separated                          |
| `APP_UTC_OFFSET`     | `+05:00`              | Time zone of appointment dates/times                             |
| `GROQ_API_KEY`       | —                     | AI diploma verification                                          |
| `TELEGRAM_BOT_TOKEN` | —                     | Notifications, reminders and password reset codes                |
| `SMS_PROVIDER`       | — (off)               | `console` (log only) or `http` (see `src/notify/sms.service.ts`) |
| `SMS_HTTP_URL`, `SMS_HTTP_TOKEN`, `SMS_SENDER` | — | SMS gateway endpoint, token and sender name             |

## Roles

| Role        | Created by        | Can                                                                              |
| ----------- | ----------------- | -------------------------------------------------------------------------------- |
| `admin`     | database          | create clinics, set public holidays                                              |
| `clinic`    | admin             | add doctors and registrars, edit its doctors, reports + CSV, front desk          |
| `registrar` | its clinic        | front desk: book patients by phone / walk-in, approve, mark came / no-show, paid |
| `doctor`    | its clinic        | schedule, visit length, time off, approve visits, medical records of its patients |
| `client`    | self-registration | book, cancel, reschedule, review after a completed visit, own medical card       |

Login works with an email or a phone number (local 9-digit numbers get `+992`).

## Appointments

- Slots come from `GET /doctors/:id/slots?date=YYYY-MM-DD`: working hours, the doctor's visit length
  (`slotMinutes`), time off, public holidays and existing bookings are all applied on the server.
- Statuses: `pending → approved | rejected`, `approved → completed | no_show | cancelled`.
  Approving declines overlapping pending requests. Patients may cancel or reschedule upcoming visits
  (a reschedule goes back to `pending`).
- Bookings made by the front desk are approved immediately and linked to an existing patient account by phone.

## Notifications

Telegram first (if the user linked it in their profile), SMS as a fallback for patients. Texts are sent
in the user's language (Tajik or Russian, saved when they switch the site language).
Reminders go out 24 h and 1 h before approved visits (checked every minute, each sent once).
The bot uses long polling, so no webhook is needed — run a single backend instance per bot token.

## Backups

`scripts/backup.sh` dumps PostgreSQL and archives `UPLOAD_DIR` into `BACKUP_DIR`, keeping `BACKUP_KEEP` days.
Run it nightly from cron (see the header of the script for the cron line and restore commands) and copy
`backups/` to another machine or storage. Test a restore before relying on it.

## Security model

- Every route requires `Authorization: Bearer <token>` except the public catalogue (`/category`,
  `/users?role=doctor`, doctor/clinic profiles, `/clinics`, `/doctors/:id/slots`, `/holidays`),
  registration, login and password reset.
- Passwords and reset codes are hashed with scrypt; reset codes expire after 15 minutes and 5 attempts.
  The reset endpoint does not reveal whether an account exists.
- Registration requires consent to personal data processing (stored as `consent_at`).
- Medical records are visible only to the patient and to doctors the patient booked; every view and change
  is written to `access_log`, and patients see it on their medical card page. Admins and registrars have no access.
- Uploaded files get random names; there is no directory listing.
