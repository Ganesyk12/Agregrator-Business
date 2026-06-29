# Development Guide — Sigyn

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vue 3 + Pinia + Vue Router + Vite |
| Backend | Express 5 (TypeScript) |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| API Docs | Swagger (OpenAPI 3) |

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment
cp .env.example .env
# Edit .env — isi DATABASE_URL sesuai PostgreSQL kamu

# 3. Buat database & sync schema
pnpm db:push

# 4. Generate Prisma client
pnpm db:generate

# 5. Jalankan dev server
pnpm dev:all         # Frontend + Backend
# atau pisah:
pnpm dev             # Frontend (Vite)
pnpm dev:server      # Backend (Express)
```

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (models, relations)
├── server/
│   ├── index.ts               # Entry point Express
│   ├── config/
│   │   ├── env.ts             # Environment variables
│   │   └── swagger.ts         # OpenAPI config
│   ├── db/
│   │   └── index.ts           # PrismaClient instance
│   ├── middleware/
│   │   └── error-handler.ts   # Global error handler
│   └── modules/
│       ├── auth/              # Register & login
│       ├── users/             # Manajemen user
│       ├── vendors/           # Manajemen vendor
│       ├── packages/          # Paket jasa vendor
│       ├── bookings/          # Pemesanan
│       ├── payments/          # Pembayaran (rekber)
│       ├── reviews/           # Rating & ulasan
│       ├── commissions/       # Komisi platform
│       └── payouts/           # Pencairan dana vendor
├── src/                       # Frontend Vue (existing)
├── .env                       # Local environment
├── .env.example               # Template environment
└── prisma.config.ts           # Prisma CLI config
```

Setiap module mengikuti pattern:

```
modules/xxx/
  xxx.routes.ts      # Route definitions + OpenAPI docs
  xxx.controller.ts  # Request handling
  xxx.service.ts     # Business logic + Prisma queries
  xxx.types.ts       # TypeScript types
```

## Scripts

| Script | Fungsi |
|--------|--------|
| `pnpm dev` | Frontend (Vite) |
| `pnpm dev:server` | Backend (Express, hot-reload via tsx) |
| `pnpm dev:all` | Frontend + Backend bersamaan |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema ke database |
| `pnpm db:migrate` | Buat migration baru |
| `pnpm db:studio` | Buka Prisma Studio (GUI database) |

## API Documentation

Jalanin server, lalu buka:

```
http://localhost:3000/api-docs/
```

Raw OpenAPI JSON:

```
http://localhost:3000/api-docs.json
```

Dokumentasi digenerate otomatis dari JSDoc `@openapi` di setiap file `*.routes.ts`.

## Database

### Schema

Lihat `prisma/schema.prisma` untuk detail model & relasi.

### Naming Convention

Semua primary key pakai prefix nama tabel:

| Tabel | PK | Contoh FK |
|-------|----|-----------|
| `users` | `id_user` | — |
| `vendors` | `id_vendor` | `id_user` → users |
| `bookings` | `id_booking` | `id_user`, `id_vendor`, `id_package` |
| ... | ... | ... |

### Management

```bash
# Lihat data via browser
pnpm db:studio

# Reset database (hapus semua data)
pnpm db:push --force-reset

# Buat migration setelah ubah schema
pnpm db:migrate dev --name nama_perubahan
```

## Convention

- TypeScript ketat (`strict: true`)
- Package manager: **pnpm** (jangan npm/yarn)
- Module pattern: routes → controller → service
- ID prefix sesuai nama tabel (`id_user`, `id_vendor`, dll)
- Error response selalu: `{ error: { message: "..." } }`
- Success response (list): `{ data: [...] }`
- Success response (single): `{ data: { ... } }`
