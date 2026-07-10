# Route Guide — Sigyn

Dokumentasi ini menjelaskan konfigurasi routing frontend untuk aplikasi Sigyn yang terbagi menjadi dua modul utama menggunakan arsitektur **Multi-Page Application (MPA)**:
1. **Homepage / Landing Page**: Berkas utama `index.html` (Bootstrap 5) yang melayani rute publik.
2. **Admin Dashboard**: Berkas `dashboard.html` (Bootstrap 3) yang melayani panel administrasi internal dengan URL ramah pengguna (`/dashboard`).

---

## Navigasi Antar Modul (MPA vs SPA)

Karena aplikasi menggunakan arsitektur MPA untuk mengisolasi stylesheet Bootstrap agar tidak berkonflik:
- **Navigasi Internal Modul (SPA)**: Gunakan `<router-link>` untuk navigasi antar halaman di dalam modul yang sama guna menjaga performa SPA yang cepat.
- **Navigasi Antar Modul (MPA)**: Gunakan tautan anchor biasa `<a href="...">` untuk berpindah antara Landing Page dan Dashboard Admin (yang memicu pemuatan ulang halaman untuk mengganti stylesheet).
  - Dari Landing Page ke Dashboard: `<a href="/dashboard">Dashboard</a>`
  - Dari Dashboard ke Landing Page: `<a href="/">Back to Home</a>`

---

## 1. Homepage / Landing Page (Public Routes)

Modul ini diatur oleh berkas [src/router/index.ts](file:///c:/Project/Agregrator-Business/src/router/index.ts) dan di-mount melalui `index.html`.

| Jalur Rute (Path) | Nama Rute (Name) | Komponen View | Keterangan |
| :--- | :--- | :--- | :--- |
| `/` | `home` | `HomeView.vue` | Halaman utama / landing page "Kaira" |
| `/shop` | `shop` | `BaseView.vue` | Katalog produk/jasa vendor |
| `/product/:id` | `product` | `BaseView.vue` | Detail produk/jasa berdasarkan ID |
| `/blog` | `blog` | `BaseView.vue` | Artikel dan berita terbaru |
| `/about` | `about` | `BaseView.vue` | Tentang platform Sigyn |
| `/contact` | `contact` | `BaseView.vue` | Formulir kontak hubungan pelanggan |
| `/cart` | `cart` | `BaseView.vue` | Keranjang belanja |
| `/checkout` | `checkout` | `BaseView.vue` | Halaman penyelesaian pembayaran |
| `/wishlist` | `wishlist` | `BaseView.vue` | Daftar keinginan produk/jasa |
| `/faqs` | `faqs` | `BaseView.vue` | Tanya jawab umum (FAQs) |
| `/404` | `404` | `BaseView.vue` | Halaman galat 404 (Tidak Ditemukan) |
| `/*` | — | — | Pengalihan otomatis (redirect) ke `/404` |

*Catatan: Halaman pendukung selain `HomeView.vue` saat ini menggunakan template placeholder `BaseView.vue` dengan data title yang dinamis.*

---

## 2. Admin Dashboard (Protected/Admin Routes)

Modul ini diatur oleh berkas [src/dashboard/router/index.ts](file:///c:/Project/Agregrator-Business/src/dashboard/router/index.ts) dan di-mount melalui `dashboard.html`. Semua rute di bawah menggunakan layout dasar [AppLayout.vue](file:///c:/Project/Agregrator-Business/src/dashboard/layouts/AppLayout.vue).

Karena di-mount dengan base path `/dashboard/`, URL-nya diakses melalui segmen `/dashboard`.

> [!IMPORTANT]
> Rute `/dashboard/login` bersifat **publik** agar pengguna dapat masuk ke akun mereka. Semua rute lainnya di bawah segmen `/dashboard` **dilindungi (protected)** dan akan mengalihkan pengguna ke halaman login jika token otentikasi tidak ditemukan.

| Jalur Rute (Path) | Nama Rute (Name) | Komponen View | Keterangan | Status Akses |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard/login` | `login` | `LoginView.vue` | Halaman masuk kustom bertema Kaira | Publik |
| `/dashboard` | `dashboard` | `DashboardView.vue` | Panel utama ringkasan statistik & metrik bisnis | Dilindungi (Protected) |
| `/dashboard/bookings` | `bookings` | `BookingView.vue` | Manajemen pesanan & pemesanan jasa | Dilindungi (Protected) |
| `/dashboard/vendors` | `vendors` | `VendorView.vue` | Manajemen profil & verifikasi vendor mitra | Dilindungi (Protected) |
| `/dashboard/packages` | `packages` | `PackageView.vue` | Manajemen paket layanan yang disediakan vendor | Dilindungi (Protected) |
| `/dashboard/users` | `users` | `UserView.vue` | Manajemen pengguna platform (Pelanggan/Vendor/Admin) | Dilindungi (Protected) |
| `/dashboard/roles` | `roles` | `RoleView.vue` | Pengaturan wewenang & hak akses peran (Roles) | Dilindungi (Protected) |
| `/dashboard/user-roles` | `user-roles` | `UserRoleView.vue` | Pemetaan peran ke setiap pengguna | Dilindungi (Protected) |

---

## Konfigurasi Server Pengembang (Vite Dev Server)

Agar URL `/dashboard` dapat secara dinamis memuat berkas `dashboard.html` di server lokal, sebuah middleware ditulis langsung di [vite.config.ts](file:///c:/Project/Agregrator-Business/vite.config.ts):

```typescript
  plugins: [
    vue(),
    {
      name: 'dashboard-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const urlPath = req.url.split('?')[0]
            if (urlPath === '/dashboard' || urlPath.startsWith('/dashboard/')) {
              req.url = '/dashboard.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '')
            }
          }
          next()
        })
      }
    }
  ],
```
