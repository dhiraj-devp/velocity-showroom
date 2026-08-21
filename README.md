# VELOCITY

Premium 3D car showroom and dealership platform.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

MySQL is optional for local browsing. Copy `.env.example` to `.env`, then:

```bash
npm run db:migrate
npm run db:seed
```

See [docs/database.md](docs/database.md) for schema, admin bootstrap, and production notes.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Upsert demo catalog |
| `npm run db:studio` | Drizzle Studio |
