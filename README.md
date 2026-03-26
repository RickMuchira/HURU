# HURU

> **Find your people. Find your safe place.**

HURU is a global, privacy-first community platform for LGBTQ+ people to find each other, connect, message, join spaces, and meet safely — without ever exposing their real identity.

No tracking. No real names required. No data sold. Ever.

[![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-orange)](https://buymeacoffee.com/huruapp)

---

## Mission

In many parts of the world, being yourself is dangerous. HURU was built with that reality at its core — not as an afterthought. Every decision, from how we store data to how we let you disappear instantly, is made with your safety first.

Built and maintained by one developer in Nairobi for the world.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 (REST API + Inertia SSR) |
| Real-time | Laravel Reverb (WebSockets) |
| Frontend | React 19 + TypeScript + Vite |
| Database | SQLite (dev) / MySQL (production) |
| Auth | Laravel Fortify + Sanctum |
| Styling | Tailwind CSS v4 |
| Fonts | Fraunces + Plus Jakarta Sans (Google Fonts) |
| File storage | Local disk (dev) / S3 (prod) — EXIF stripped on all uploads |
| Message encryption | Laravel `encrypt()` cast — messages never stored in plain text |

---

## Local Setup

### Prerequisites

- PHP 8.4+
- Composer
- Node.js 20+
- npm

### 1. Clone & install

```bash
git clone https://github.com/your-org/huru.git
cd huru
composer install
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 3. Migrate & seed

```bash
php artisan migrate --seed
```

This seeds one admin user: `admin@huru.app` / `Admin1234!`

> ⚠️ **Change this password immediately before going to production.**

### 4. Start development

```bash
composer run dev
# Starts: Laravel (8000) + Vite HMR (5173) + queue worker + log tail
```

For real-time messaging (Phase 3), also run:

```bash
php artisan reverb:start
```

Visit [http://localhost:8000](http://localhost:8000)

---

## Environment Variables

```dotenv
# App
APP_NAME="HURU"
APP_URL=http://localhost:8000

# Database (SQLite default)
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=huru
# DB_USERNAME=root
# DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000,yourdomain.com

# Reverb (WebSockets — Phase 3)
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"

# File storage
FILESYSTEM_DISK=local
# For S3:
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=
# AWS_BUCKET=
# AWS_URL=

# Safety alerts — trusted contact SMS (Phase 5)
# AFRICASTALKING_API_KEY=
# AFRICASTALKING_USERNAME=
# Or Twilio:
# TWILIO_SID=
# TWILIO_TOKEN=
# TWILIO_FROM=
```

---

## Admin Panel

```
http://localhost:8000/admin/login
```

> ⚠️ **Change `/admin` prefix before going to production.** Edit `routes/web.php` and replace `Route::prefix('admin')` with a secret path.

### Default credentials

| Field | Value |
|-------|-------|
| Email | `admin@huru.app` |
| Password | `Admin1234!` |

> ⚠️ **Change these immediately before going live.**

---

## Privacy & Safety Architecture

- **No real names** — username is the only public identity
- **Email encrypted** — for account recovery only, never shown to anyone
- **Messages encrypted at rest** — Laravel `encrypt()` cast, never stored in plain text
- **Ghost mode** — one toggle removes you from all discovery, hides online status
- **Auto-delete messages** — user-set expiry (1h / 24h / 7d / never)
- **Trusted contact check-in** — set a timer before a physical meetup; contact is alerted if you don't check in
- **Panic delete** — wipe all personal data immediately, or 30-day grace period hard delete
- **No cookies** for browsing history
- **Suspended / ghost users** excluded from all public API endpoints

---

## Phase Roadmap

| Phase | Status | What's included |
|-------|--------|-----------------|
| **1** | ✅ Done | Auth, onboarding (4 steps), landing page, profile, settings |
| **2** | 🔜 Next | Member discovery, profile view, connection requests, block system |
| **3** | Planned | Real-time messaging (Reverb), auto-delete, read receipts |
| **4** | Planned | Spaces — create, browse, join, post, moderate |
| **5** | Planned | Safety center — ghost mode enforcement, trusted contacts, check-in timer, account deletion |
| **6** | Planned | Admin panel — users, reports, spaces management |

---

## Support the Project

HURU is free, ad-free, and built in Nairobi for the world.

**☕ [Buy us a coffee](https://buymeacoffee.com/huruapp)** — M-Pesa and card accepted.

---

## License

MIT
