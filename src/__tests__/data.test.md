## STEP 1

Login as Vendor : [
{
   "email": "junaedi@gmail.com",
   "password": "12345"
},
{
   Login as Vendor /dashboard/login,
   Buka Menu Product,
   Klik Detail Product,
   buka menu Orders,
   Buka Menu Settings,
   Ubah status active menjadi inactive,
   Save Changes,
   Cek Tampilan Di Web
}
]


## STEP 2

Login as Customer : 
[
   {
   "email": "customer@demo",
   "password": "12345"
},
{
   "FullName" : "Budi",
   "Phone" : "085890909090",
   "Email Address": "customer@demo",
   "EventType" : "Graduation",
   "EventName" : "Lulusan",
   "EventDate" : 16 Agustus 2026,
   "Start" : 10.00,
   "End" : 12.00,
   "Location" : BallRoom Jakarta,
   "Full Address" : Jl. Sudirman Kav. 52-53
   City : Jakarta
   Location Type : Indoor
},
{
   Pilih Jasa
   Klik Booking
   Klik Add Another Service
   Klik Bouquet
   Pilih Bouquet pertama
   Cek Modal Step Variasi
   User Pilih Variasi
   User Pilih Quantity
   User Klik Confirm & Add to Booking
   Tambah note special request
   klik proccess to payment
   Setelah Booking Berhasil Scroll untuk lihat full
   Klik MyBooking untuk lihat history booking
   klik Detail untuk cek booking detail
   Close modal Detail Booking
   Klik Print Invoice, tampil modal invoice
   Scroll untuk lihat detail
   close modal
},
{
   Buka Menu Explore,
   Pilih Bouquet,
   Klik View Product,
   Scroll,
   Klik View Detail pada product pertama,
   Pilih variasi,
   Checklist Extras,
   Klik Buy Now,
   Process to Payment,
   Cek My Booking untuk cek history booking,
   Klik Detail untuk cek booking detail,
   Close modal Detail Booking,
   Klik Print Invoice, tampil modal invoice
   Scroll untuk lihat detail
   close modal
}
]


## STEP 3 — Multi Order (Booking Jasa → Checkout Product)

Login as Customer :
[
{
   "email": "customer@demo",
   "password": "12345"
},
{
   "FullName"    : "Budi",
   "Phone"       : "085890909090",
   "Email Address": "customer@demo",
   "EventType"   : "Graduation",
   "EventName"   : "Lulusan",
   "EventDate"   : 16 Agustus 2026,
   "Start"       : 10.00,
   "End"         : 12.00,
   "Location"    : BallRoom Jakarta,
   "Full Address": Jl. Sudirman Kav. 52-53
   City          : Jakarta
   Location Type : Indoor
},

// --- PROSES 1 : Booking Jasa ---
{
   Pilih Jasa,
   Klik Booking,
   Klik Add Another Service,
   Klik Bouquet,
   Pilih Bouquet pertama,
   Cek Modal Step Variasi,
   User Pilih Variasi,
   User Pilih Quantity,
   User Klik Confirm & Add to Booking,
   Tambah note special request,
   Klik Process to Payment,
   Setelah Booking Berhasil Scroll untuk lihat full,
   Klik MyBooking untuk lihat history booking,
   Klik Detail untuk cek booking detail,
   Close modal Detail Booking,
   Klik Print Invoice – tampil modal invoice,
   Scroll untuk lihat detail invoice,
   Close modal invoice
},

// --- PROSES 2 : Checkout Product (lanjutan sesi yang sama) ---
{
   Buka Menu Explore,
   Pilih kategori Bouquet,
   Klik View Product,
   Scroll halaman product,
   Klik View Detail pada product pertama,
   Pilih variasi product,
   Checklist Extras (opsional),
   Klik Buy Now,
   Verifikasi Order Summary (item jasa + product tampil bersama),
   Klik Process to Payment,
   Konfirmasi pembayaran,
   Setelah Checkout Berhasil Scroll untuk lihat full,
   Buka My Booking untuk cek history multi-order,
   Klik Detail untuk cek booking detail (pastikan jasa & product ada),
   Close modal Detail Booking,
   Klik Print Invoice – tampil modal invoice multi-order,
   Scroll untuk lihat detail invoice,
   Close modal invoice
}
]