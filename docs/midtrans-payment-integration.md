# Midtrans Payment Integration — Update Summary

## Overview

Full payment gateway integration using Midtrans (VA, QRIS, Credit Card) with auto-polling, countdown timers, error handling, retry buttons, and simulate payment for development.

---

## Backend Changes

### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/midtrans/va` | Generate Virtual Account (8 banks) |
| `POST` | `/api/payments/midtrans/qris` | Generate QRIS QR code |
| `POST` | `/api/payments/midtrans/snap-token` | Generate Snap token for credit card |
| `GET` | `/api/payments/midtrans/status/:orderId` | Poll payment status (DB-first, fallback to Midtrans API) |
| `POST` | `/api/payments/midtrans/simulate/:orderId` | Simulate payment (dev only) |

### Files Modified

| File | Changes |
|------|---------|
| `server/modules/payments/payments.controller.ts` | Added 5 new endpoints (VA, QRIS, Snap, Status, Simulate) |
| `server/modules/payments/payments.service.ts` | Added `findByOrderId()`, `create()` with `order_id`, `updateByOrderId()` with auto booking confirmation |
| `server/modules/payments/payments.routes.ts` | Added 5 new routes |
| `server/modules/payments/payments.types.ts` | Added `order_id` to `BookingPayment` interface |
| `server/config/midtrans.ts` | Added `withTimeout()` wrapper for Midtrans API calls |
| `server/types/midtrans-client.d.ts` | Updated type declarations |
| `prisma/schema.prisma` | Added `order_id String?` with index to `BookingPayment` |

### Key Logic

#### `updateByOrderId()` — Auto Booking Confirmation

```
1. Find payment by order_id
2. Update payment status (paid/expired/cancelled)
3. Update term status if applicable
4. Check ALL payments for this booking
5. If ALL paid → auto-update Booking.status to "confirmed"
```

#### `checkMidtransStatus()` — DB-First with Fallback

```
1. Check DB first → if status is "paid", return is_paid: true immediately
2. Call Midtrans REST API (GET /v2/{orderId}/status)
3. If Midtrans API fails → fallback to DB status
4. Update DB based on Midtrans response
```

#### `withTimeout()` — 15s Timeout Wrapper

All Midtrans API calls wrapped with 15s timeout:
- `coreApi.charge()` — VA & QRIS generation
- `snap.createTransaction()` — Snap token
- QR image fetch
- Status check via REST API

#### QRIS QR Code Proxy

Midtrans QR URL requires Basic Auth. Server fetches QR image → converts to base64 data URL → frontend displays as `<img>`.

#### Status Check — REST API (not `coreApi.status()`)

`coreApi.status()` does not exist in `midtrans-client` library. Status is checked via direct REST API call:
```
GET {baseUrl}/v2/{orderId}/status
Authorization: Basic {base64(serverKey:)}
```

### Database Migration

Added `order_id` field to `BookingPayment`:
- `order_id String?` — Midtrans order ID (e.g., `BOOKING-33-FULL-1787277045423`)
- Indexed for fast lookups
- Used by `updateByOrderId()` and `findByOrderId()`

---

## Frontend Changes

### File Modified

| File | Changes |
|------|---------|
| `src/views/BookingView.vue` | Complete payment flow rewrite |
| `env.d.ts` | Added `VITE_MIDTRANS_CLIENT_KEY` |
| `.env` | Added Midtrans keys and sandbox config |

### Payment Flow

#### Bank Transfer (VA)
1. Select bank → `POST /midtrans/va` → VA number + countdown
2. Auto-poll every 5s → `GET /midtrans/status/:orderId`
3. On paid → auto-advance to step 3

#### QRIS
1. Click "Generate QRIS" → `POST /midtrans/qris` → QR code image
2. Auto-poll every 5s
3. On paid → auto-advance to step 3

#### Credit Card
1. Click "Pay with Credit Card" → `POST /midtrans/snap-token` → Snap.js popup
2. User fills card in Snap popup
3. On success → auto-advance to step 3

#### Simulate (Development Only)
1. Click "Simulate Payment" button (dashed yellow)
2. `POST /midtrans/simulate/:orderId` → marks as paid in DB
3. Auto-advance to step 3 with "Payment Confirmed!" view

### UI Components

| Component | Description |
|-----------|-------------|
| VA Card | VA number, amount, countdown timer, copy button, status bar, simulate button |
| QRIS Card | QR code image, amount, countdown, polling status, simulate button |
| Credit Card | Snap.js popup integration |
| Error Card | Red card with error message + "Try Again" retry button |
| Toast Notifications | SweetAlert2 toasts (success/error/warning) — replaces all `alert()` calls |
| Step 3 Confirmation | Dynamic view: "Payment Confirmed!" (paid) vs "VA Generated" (pending) |

### Key Refs

| Ref | Type | Description |
|-----|------|-------------|
| `vaData` | `{ order_id, va_number, bank, amount, expiry_time }` | VA details |
| `qrisData` | `{ order_id, qr_code_url, amount, expiry_time }` | QRIS details |
| `snapData` | `{ order_id, token, redirect_url }` | Snap token |
| `paymentStatus` | `'idle' \| 'polling' \| 'paid' \| 'expired' \| 'failed'` | Payment state |
| `countdown` | `string` | Timer `HH:MM:SS` |
| `vaError` | `string` | VA error message |
| `qrisError` | `string` | QRIS error message |

### Countdown & Polling

- Countdown: real-time timer from Midtrans `expiry_time`
- Polling: every 5 seconds, auto-stops on paid/expired/cancelled
- Cleanup: `onUnmounted` clears both timers
- Status bar: spinner + "Waiting for payment..." / green "Payment confirmed!"

---

## Error Handling

### Server

| Scenario | Behavior |
|----------|----------|
| Midtrans API timeout (>15s) | Returns 500 with error message |
| Midtrans API error (400/502) | Returns error message from Midtrans |
| Status check API fails | Fallback to DB status |
| Invalid bank code | 400 with supported banks list |
| Booking not found | 404 |
| Simulate in production | 403 blocked |

### Frontend

| Scenario | Behavior |
|----------|----------|
| VA/QRIS generation fails | Toast error + red error card + "Try Again" button |
| Credit card payment fails | Toast error |
| Network error | Toast "Network error or Midtrans API timeout" |
| Simulate fails | Toast error |
| Polling detects paid | Auto-advance to step 3 |

---

## Configuration

### `.env`

```env
MIDTRANS_MERCHANT_ID=M254410367
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
NODE_ENV=development
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
```

### Env Exports (`server/config/env.ts`)

```ts
midtransServerKey: req('MIDTRANS_SERVER_KEY'),
midtransClientKey: req('MIDTRANS_CLIENT_KEY'),
midtransIsProduction: req('MIDTRANS_IS_PRODUCTION') === 'true',
```

---

## Testing

1. Generate VA → select bank → VA displayed with countdown
2. Click "Simulate Payment" → payment marked paid → auto-advance to step 3
3. Generate QRIS → QR code displayed → simulate → auto-advance
4. Credit Card → Snap.js popup → (sandbox card test) → auto-advance
5. Verify `Booking.status` = `confirmed` when all payments paid
6. Verify `BookingPayment.status` = `paid` after simulate

### Type Checking

```bash
npx vue-tsc --build --noEmit    # Frontend
npx tsc --noEmit -p tsconfig.node.json  # Server
```

---

## Known Limitations

- Sandbox QRIS codes cannot be scanned with real e-wallets
- Sandbox VA cannot receive real transfers
- Simulate is blocked in production (`NODE_ENV !== 'development'`)
- Midtrans status check uses REST API (not `coreApi.status()` which doesn't exist)
