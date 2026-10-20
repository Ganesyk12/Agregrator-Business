# Pull Request — VendorDetail → main

## Summary
This PR consolidates the complete customer-facing feature set: vendor profile detail, favorites/wishlist, shopping cart, booking history, contact form, and Docker containerization with Nginx reverse proxy for `sigyn.biz.id`.

## Changes

### Frontend — New Views
| View | Route | Description |
|------|-------|-------------|
| `VendorProfileView.vue` | `/vendor/:slug` | Vendor detail page with portfolio, packages, company info |
| `WishlistView.vue` | `/wishlist` | Saved/favorited packages with remove functionality |
| `BookingHistoryView.vue` | `/booking-history` | Table of user bookings with detail modal & print invoice |
| `ServicesView.vue` | `/services` | Grid of all packages with wishlist & cart actions |
| `BookingView.vue` | `/booking` | Multi-package checkout form (reads from cart localStorage) |
| `ContactView.vue` | `/contact` | Contact form with backend submission |
| `LoginView.vue` | `/login` | JWT-based login page |

### Frontend — New Components
- **`PackageSection.vue`** — Reusable package card with wishlist heart, cart icon, and vendor info
- **`CartOffcanvas.vue`** — Slide-out cart panel with item list, remove button, checkout flow
- **`Footer.vue`** — Dynamic company info fetched from API
- **`BookingCard.vue`** — Portfolio card with save (wishlist) toggle

### Frontend — State & Routing
- **`src/stores/auth.ts`** — Pinia store with `wishlistCount`, `refreshWishlistCount()`, role-based redirects
- **`src/stores/cart.ts`** — Pinia store for cart state (`items`, `count`, `total`, CRUD actions)
- **`src/router/index.ts`** — All customer routes with auth guards; customer-role redirects away from dashboard
- **`src/main.ts`** — Global registration of cart store

### Backend — New Modules
| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Favorites** | `GET/POST /api/favorites`, `DELETE /api/favorites/:packageId`, `GET /api/favorites/check/:packageId` | Wishlist CRUD, auth-protected |
| **Cart** | `GET /api/cart`, `POST /api/cart/items`, `DELETE /api/cart/items/:itemId`, `DELETE /api/cart` | Cart CRUD, auth-protected. Models: `Cart` (1-to-1 User), `CartItem` (no quantity) |
| **Bookings** | `GET /api/bookings/user/me` | Customer booking history with payments included |
| **Contact Messages** | `POST /api/contact-messages` | Public contact form submission |
| **Packages** | `GET /api/packages` | Package listing endpoint |

### Database — Prisma Schema
- `UserFavorite` — wishlist junction table
- `Cart` / `CartItem` — cart with per-package items (no quantity)
- `ContactMessage` — contact form submissions
- All under `sigyn` schema namespace

### Infrastructure
| File | Description |
|------|-------------|
| `Dockerfile` | Node 22 Alpine, install deps, `prisma generate`, `mkdir public/uploads`, run via `tsx` |
| `docker-compose.yml` | Service `backend`, container name `sigyn-srv`, port 3000, env file, volume `sigyn-bucket` |
| `config/nginx/sigyn-nginx.conf` | Server name `sigyn.biz.id`, root `/var/www/html/sigyn/`, proxy `/api/` to `sigyn-srv:3000`, SPA fallback, gzip, HTTPS block |
| `.dockerignore` | Excludes `node_modules`, `dist`, `.env` |

### Navbar Enhancements
- Wishlist icon with badge count (reactive via `auth.wishlistCount`)
- Cart icon with badge count + shake animation on add
- User dropdown: "Booking History" (all users), "Dashboard" (non-customer only)

## Breaking Changes
- None. All additions are backward-compatible.

## Notes
- JWT stored in `localStorage` keys: `sigyn_token`, `sigyn_user`
- Cart checkout: packages stored in `sigyn_cart_checkout` (localStorage) before redirect to `/booking`
- Dashboard router guard now also blocks customer-role users (redirect to `/`)
- Uploaded files stored in Docker named volume `sigyn-bucket` at `/app/public/uploads`
