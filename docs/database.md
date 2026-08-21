# Database

VELOCITY persists catalog, dealership settings, leads, and bookings in MySQL 8+ through Drizzle ORM. The customer UI never queries MySQL directly. Repositories keep the same domain types used by `/cars`, vehicle detail, enquiry, and booking flows.

## Architecture

```
UI / Server Components / Server Actions
        ↓
feature repositories (vehicle, dealership, lead, booking)
        ↓
mysql*Repository  ← if DATABASE_URL is set
local*Repository  ← development fallback when DATABASE_URL is absent
        ↓
Drizzle + mysql2  →  MySQL
```

Local catalog files under `src/features/vehicles/data/` remain the seed source of truth and the read fallback so the site still builds before MySQL is configured.

In production, enquiry and booking mutations require `DATABASE_URL`. They do not silently succeed.

## Schema overview

| Table | Purpose |
| --- | --- |
| `brands` | House marques. Unique `slug`. |
| `vehicle_models` | Models belonging to a brand. Unique `(brand_id, slug)`. |
| `categories` | SUV, Sedan, Sports, Coupe, Luxury, Electric. Unique `slug`. |
| `vehicles` | Listings. Integer `price` in INR (e.g. `15200000`). Availability enum. |
| `vehicle_images` | Gallery photography. `is_primary` marks the hero frame. Never mixed with 360 frames. |
| `vehicle_360_frames` | Optional spin-sequence photos. Ordered separately from the gallery. |
| `dealership_settings` | Single house record for phone, WhatsApp, email, address. |
| `leads` | Enquiries. Status: `new`, `contacted`, `qualified`, `won`, `lost`. |
| `lead_notes` | Internal desk notes on a lead. Never shown on the public site. |
| `bookings` | Viewing / test drive requests. Status: `pending`, `confirmed`, `completed`, `cancelled`. |

Vehicle `id` and `slug` values match the current demo catalog so public URLs such as `/cars/bmw-m4-competition` do not change.

## Local setup

1. Create a MySQL 8+ database named `velocity_showroom`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`.
4. Generate (already in repo) and apply migrations.
5. Seed the demo catalog.

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `mysql://USER:PASSWORD@HOST:3306/velocity_showroom` |
| `ADMIN_EMAIL` | Desk login email |
| `ADMIN_PASSWORD_HASH` | `saltHex:scryptHashHex` (preferred) or SHA-256 hex of the password |
| `ADMIN_SESSION_SECRET` | HMAC secret for the admin cookie |

Never commit `.env`.

Generate a scrypt hash:

```bash
node -e "const {scryptSync,randomBytes}=require('crypto'); const s=randomBytes(16).toString('hex'); const h=scryptSync('YOUR_PASSWORD', Buffer.from(s,'hex'), 64).toString('hex'); console.log(s+':'+h)"
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration commands

```bash
npm run db:generate
npm run db:migrate
```

`db:generate` writes SQL under `drizzle/` from the schema. `db:migrate` applies those files to MySQL.

`npm run db:push` syncs the schema without migration files. Prefer migrate in any shared or production environment.

`npm run db:studio` opens Drizzle Studio when `DATABASE_URL` is set.

## Seed commands

```bash
npm run db:seed
```

The seed upserts brands, models, categories, vehicles, images, and dealership settings from the existing demo data. It does not wipe leads or bookings. Safe to re-run during development.

## Backup strategy

Take logical dumps before migrate or deploy:

```bash
mysqldump -u USER -p velocity_showroom > backups/velocity-showroom-YYYYMMDD.sql
```

Restore:

```bash
mysql -u USER -p velocity_showroom < backups/velocity-showroom-YYYYMMDD.sql
```

Keep dumps off the web root and outside git.

## Production deployment

- Run MySQL on the same VPS or a private network. Do not expose 3306 publicly.
- Set `DATABASE_URL`, admin variables, and restart the Node process after env changes.
- Run `npm run db:migrate` then `npm run db:seed` on first deploy.
- `next build` still succeeds without MySQL because catalog reads fall back to local data. Live lead/booking capture in production requires MySQL.
- `mysql2` is marked as a server-only external package. Do not import `src/db` from client components.

## Repositories vs UI

Pages and server actions call:

- `vehicleRepository` / `catalogRepository`
- `dealershipRepository`
- `leadRepository`
- `bookingRepository`

Those modules choose MySQL when `DATABASE_URL` is present. Cards, filters, enquiry dialogs, and the 3D showroom do not contain SQL.

Local repositories are kept until MySQL is verified in your environment.

Vehicle photos uploaded from the desk are stored under `public/uploads/vehicles/{vehicleId}/` with generated filenames. The `mediaStorage` module is the swap point for Cloudinary or S3 later. Seeded placeholder images under `public/images/` are never deleted by admin image cleanup.

## Admin desk

`/admin` is a protected dealership desk: dashboard, vehicles, leads, viewings, brands/models/categories, and settings.

1. Configure the three `ADMIN_*` variables.
2. Open `/admin/login`.
3. Sign in.

There is no NextAuth and no user table. Every admin mutation checks the HMAC session cookie on the server. Lead notes live in MySQL (`lead_notes`) and are desk-only.

After `lead_notes` is added, run:

```bash
npm run db:generate
npm run db:migrate
```

Do not edit already-applied migration files.
