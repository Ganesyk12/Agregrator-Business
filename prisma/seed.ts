import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const portfolioImages = [
  'banner-image-1.jpg', 'banner-image-2.jpg', 'banner-image-3.jpg',
  'banner-image-4.jpg', 'banner-image-5.jpg', 'banner-image-6.jpg',
  'collection-banner.jpg', 'newsletter-image.jpg', 'bg-newsletter.jpg',
  'single-image-2.jpg', 'post-image1.jpg', 'post-image2.jpg',
  'post-image3.jpg', 'post-image4.jpg', 'post-image5.jpg',
  'post-image6.jpg', 'post-image7.jpg', 'post-image8.jpg',
  'post-image9.jpg', 'post-image1.jpg', 'post-image2.jpg',
]

function img(file: string) {
  return `/src/assets/kaira/images/${file}`
}

async function main() {
  console.log('Clearing existing data...')
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "sigyn"."Role",
      "sigyn"."User",
      "sigyn"."User_Role",
      "sigyn"."Category",
      "sigyn"."Vendor",
      "sigyn"."Package",
      "sigyn"."Portfolio",
      "sigyn"."PortfolioImage",
      "sigyn"."VendorAvailability",
      "sigyn"."Booking",
      "sigyn"."BookingPackage",
      "sigyn"."BookingPayment",
      "sigyn"."PaymentRequest",
      "sigyn"."PaymentRequestItem",
      "sigyn"."PaymentTransaction",
      "sigyn"."PaymentRequestTerm",
      "sigyn"."RfpPayment",
      "sigyn"."Review",
      "sigyn"."Commission",
      "sigyn"."UserFavorite",
      "sigyn"."Cart",
      "sigyn"."CartItem",
      "sigyn"."CompanyInfo",
      "sigyn"."ContactMessage"
    RESTART IDENTITY CASCADE
  `)

  // ──────────────────────────────────────────────
  // ROLES (id_role: 1–5)
  // ──────────────────────────────────────────────
  console.log('Seeding roles...')
  const roles = [
    { id_role: 1, role_code: 'eUser-Admin', name: 'Admin' },
    { id_role: 2, role_code: 'eUser-Vendor', name: 'Vendor' },
    { id_role: 3, role_code: 'eUser-Customer', name: 'Customer' },
    { id_role: 4, role_code: 'eUser-Finance', name: 'Finance' },
    { id_role: 5, role_code: 'eUser-SuperAdmin', name: 'Super Admin' },
  ]
  for (const r of roles) {
    await prisma.role.create({ data: r })
  }
  console.log('Roles seeded successfully.')

  // ──────────────────────────────────────────────
  // CATEGORIES (id_category: 1–6)
  // ──────────────────────────────────────────────
  console.log('Seeding categories...')
  const categoryData = [
    { id_category: 1, category_name: 'Photography' },
    { id_category: 2, category_name: 'Videography' },
    { id_category: 3, category_name: 'Bouquet' },
    { id_category: 4, category_name: 'Make Up Artist' },
    { id_category: 5, category_name: 'Decoration' },
    { id_category: 6, category_name: 'Catering' },
  ]
  for (const c of categoryData) {
    await prisma.category.create({ data: c })
  }
  const catMap: Record<string, number> = {
    Photography: 1,
    Videography: 2,
    Bouquet: 3,
    'Make Up Artist': 4,
    Decoration: 5,
    Catering: 6,
  }
  console.log('Categories seeded successfully.')

  // ──────────────────────────────────────────────
  // USERS (id_user: 1–6)
  // ──────────────────────────────────────────────
  console.log('Seeding users...')
  const users = [
    { id_user: 1, email: 'customer@demo.com', password: '123456', full_name: 'Budi Santoso', phone: '081234567890' },
    { id_user: 2, email: 'vendor1@demo.com', password: '123456', full_name: 'Sari Wedding Photography', phone: '081298765432' },
    { id_user: 3, email: 'vendor2@demo.com', password: '123456', full_name: 'Indah Catering', phone: '081234567891' },
    { id_user: 4, email: 'admin@demo.com', password: '123456', full_name: 'Admin User', phone: '081234567892' },
    { id_user: 5, email: 'superadmin@sigyn.com', password: '123456', full_name: 'Super Admin', phone: '081234567893' },
    { id_user: 6, email: 'finance@demo.com', password: '123456', full_name: 'Finance User', phone: '081234567894' },
  ]
  for (const u of users) {
    await prisma.user.create({ data: u })
  }
  console.log('Users seeded successfully.')

  // ──────────────────────────────────────────────
  // USER ROLES (role-access)
  // Links each email to its role_code
  // ──────────────────────────────────────────────
  console.log('Seeding user roles...')
  const userRoles = [
    { email: 'customer@demo.com', role_code: 'eUser-Customer' },
    { email: 'vendor1@demo.com', role_code: 'eUser-Vendor' },
    { email: 'vendor2@demo.com', role_code: 'eUser-Vendor' },
    { email: 'admin@demo.com', role_code: 'eUser-Admin' },
    { email: 'superadmin@sigyn.com', role_code: 'eUser-SuperAdmin' },
    { email: 'finance@demo.com', role_code: 'eUser-Finance' },
  ]
  for (const ur of userRoles) {
    await prisma.user_Role.create({ data: ur })
  }
  console.log('User roles seeded successfully.')

  // ──────────────────────────────────────────────
  // VENDORS (id_vendor: 1–2)
  // ──────────────────────────────────────────────
  console.log('Seeding vendors...')
  const vendor1 = await prisma.vendor.create({
    data: {
      id_vendor: 1,
      id_user: 2,
      business_name: 'Sari Wedding Photography',
      description: 'Vendor fotografi & videografi pernikahan profesional',
      category: 'Photography',
      location: 'Jakarta Selatan',
      years_exp: 8,
      status: 'verified',
      verified_at: new Date('2024-06-01'),
    },
  })

  const vendor2 = await prisma.vendor.create({
    data: {
      id_vendor: 2,
      id_user: 3,
      business_name: 'Indah Catering',
      description: 'Katering pernikahan dengan menu prasmanan & fine dining',
      category: 'Catering',
      location: 'Jakarta Pusat',
      years_exp: 5,
      status: 'verified',
      verified_at: new Date(),
    },
  })
  console.log('Vendors seeded successfully.')

  // ──────────────────────────────────────────────
  // PACKAGES (id_package: 1–5)
  // ──────────────────────────────────────────────
  console.log('Seeding packages...')
  const pkg1 = await prisma.package.create({
    data: {
      id_package: 1,
      id_vendor: 1,
      id_category: catMap['Photography'],
      name: 'Paket Foto Basic',
      description: 'Paket foto pernikahan basic dengan 1 fotografer',
      price: 2500000,
      duration: '4 Jam',
      whats_included: '1 Fotografer, 100+ foto edit, album 8x12',
    },
  })
  const pkg2 = await prisma.package.create({
    data: {
      id_package: 2,
      id_vendor: 1,
      id_category: catMap['Videography'],
      name: 'Paket Video Cinematic',
      description: 'Video sinematik pernikahan full ceremony',
      price: 3500000,
      duration: '6 Jam',
      whats_included: '1 Videografer, video highlight 3-5 menit, video full duration',
    },
  })
  const pkg3 = await prisma.package.create({
    data: {
      id_package: 3,
      id_vendor: 1,
      id_category: catMap['Make Up Artist'],
      name: 'Paket Makeup Bridal',
      description: 'Makeup pengantin dengan trial session',
      price: 1500000,
      duration: '1 Sesi',
      whats_included: 'Trial makeup, makeup on the day, retouch touch-up',
    },
  })
  const pkg4 = await prisma.package.create({
    data: {
      id_package: 4,
      id_vendor: 2,
      id_category: catMap['Catering'],
      name: 'Paket Catering Prasmanan',
      description: 'Menu prasmanan untuk 100 tamu',
      price: 5000000,
      duration: '1 Hari',
      whats_included: 'Menu prasmanan 5 menu, dessert, minuman',
    },
  })
  const pkg5 = await prisma.package.create({
    data: {
      id_package: 5,
      id_vendor: 2,
      id_category: catMap['Decoration'],
      name: 'Paket Dekorasi Pelaminan',
      description: 'Dekorasi pelaminan dan tenda resepsi',
      price: 3000000,
      duration: '1 Hari',
      whats_included: 'Pelaminan, dekorasi tenda, lighting, backdrop',
    },
  })
  console.log('Packages seeded successfully.')

  // ──────────────────────────────────────────────
  // PORTFOLIOS
  // ──────────────────────────────────────────────
  console.log('Seeding portfolios...')
  const vendorPortfolios: { vendorId: number; name: string; cat: string; catId: number }[] = [
    { vendorId: 1, name: 'Akbar & Sarah Wedding', cat: 'Wedding', catId: catMap['Photography'] },
    { vendorId: 1, name: 'Rina Graduation Photos', cat: 'Graduation', catId: catMap['Photography'] },
    { vendorId: 1, name: 'Budi Family Session', cat: 'Family', catId: catMap['Photography'] },
    { vendorId: 2, name: 'TechCorp Annual Event', cat: 'Corporate', catId: catMap['Catering'] },
    { vendorId: 2, name: 'Dian & Adi Wedding Video', cat: 'Wedding', catId: catMap['Videography'] },
  ]

  for (let i = 0; i < vendorPortfolios.length; i++) {
    const vp = vendorPortfolios[i]
    const code = `PRT-${String(i + 1).padStart(4, '0')}`
    const coverIdx = (i * 3) % portfolioImages.length

    const portfolio = await prisma.portfolio.create({
      data: {
        id_vendor: vp.vendorId,
        id_category: vp.catId,
        title: vp.name,
        code,
        cover_url: img(portfolioImages[coverIdx]),
        description: `A beautiful ${vp.cat.toLowerCase()} project captured by our talented team.`,
      },
    })

    const imageIndices = [
      (coverIdx + 1) % portfolioImages.length,
      (coverIdx + 2) % portfolioImages.length,
      (coverIdx + 3) % portfolioImages.length,
      (coverIdx + 4) % portfolioImages.length,
    ]

    for (let j = 0; j < imageIndices.length; j++) {
      await prisma.portfolioImage.create({
        data: {
          id_portfolio: portfolio.id_portfolio,
          image_url: img(portfolioImages[imageIndices[j]]),
          caption: j === 0 ? 'Main highlight' : j === 1 ? 'Behind the scenes' : `Photo ${j + 1}`,
          sort_order: j,
        },
      })
    }
  }
  console.log('Portfolios seeded successfully.')

  // ──────────────────────────────────────────────
  // BOOKING
  // ──────────────────────────────────────────────
  console.log('Seeding booking with multi-vendor packages...')
  const totalPrice = pkg1.price + pkg2.price + pkg3.price + pkg4.price + pkg5.price
  const booking = await prisma.booking.create({
    data: {
      id_user: 1,
      event_date: new Date('2026-08-17T09:00:00Z'),
      event_location: 'Hotel Indonesia Kempinski, Jakarta',
      total_price: totalPrice,
      dp_amount: totalPrice * 0.3,
      status: 'confirmed',
      notes: 'Mohon persiapan maksimal untuk hari H',
      user_created: 'SYSTEM',
    },
  })
  await prisma.bookingPackage.createMany({
    data: [
      { id_booking: booking.id_booking, id_package: 1, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: 2, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: 3, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: 4, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: 5, user_created: 'SYSTEM' },
    ],
  })
  console.log(`Booking #${booking.id_booking} created with 5 packages from 2 vendors (total: Rp${totalPrice.toLocaleString()})`)

  // ──────────────────────────────────────────────
  // PAYMENT
  // ──────────────────────────────────────────────
  console.log('Seeding payment...')
  const dpAmount = totalPrice * 0.3
  await prisma.bookingPayment.create({
    data: {
      id_booking: booking.id_booking,
      amount: dpAmount,
      payment_type: 'dp',
      status: 'paid',
      paid_at: new Date(),
      user_created: 'SYSTEM',
    },
  })
  console.log(`Payment created for booking #${booking.id_booking} (DP: Rp${dpAmount.toLocaleString()})`)

  // ──────────────────────────────────────────────
  // PAYMENT TERMS (Milestone)
  // ──────────────────────────────────────────────
  console.log('Seeding payment terms...')
  const remainingAmount = totalPrice - dpAmount
  await prisma.paymentTerm.createMany({
    data: [
      {
        id_booking: booking.id_booking,
        term_order: 1,
        term_name: 'DP (Down Payment)',
        amount: dpAmount,
        status: 'paid',
        paid_amount: dpAmount,
        notes: 'Pembayaran awal 30%',
        user_created: 'SYSTEM',
      },
      {
        id_booking: booking.id_booking,
        term_order: 2,
        term_name: 'Termin 1 (30%)',
        amount: Math.round(totalPrice * 0.3),
        due_date: new Date('2026-07-01'),
        status: 'unpaid',
        paid_amount: 0,
        notes: 'Pembayaran termin pertama sebelum acara',
        user_created: 'SYSTEM',
      },
      {
        id_booking: booking.id_booking,
        term_order: 3,
        term_name: 'Pelunasan (40%)',
        amount: remainingAmount - Math.round(totalPrice * 0.3),
        due_date: new Date('2026-08-01'),
        status: 'unpaid',
        paid_amount: 0,
        notes: 'Sisa pelunasan sebelum acara',
        user_created: 'SYSTEM',
      },
    ],
  })
  console.log(`3 payment terms created for booking #${booking.id_booking}`)

  // Link payment to first term
  const firstTerm = await prisma.paymentTerm.findFirst({
    where: { id_booking: booking.id_booking, term_order: 1 },
  })
  if (firstTerm) {
    await prisma.bookingPayment.update({
      where: { id_payment: 1 },
      data: { id_term: firstTerm.id_term },
    })
  }

  // Partial payment demo: pay Rp2.000.000 of Term 2 (status -> partial)
  const term2 = await prisma.paymentTerm.findFirst({
    where: { id_booking: booking.id_booking, term_order: 2 },
  })
  if (term2) {
    await prisma.bookingPayment.create({
      data: {
        id_booking: booking.id_booking,
        id_term: term2.id_term,
        amount: 2000000,
        payment_type: 'installment',
        status: 'paid',
        paid_at: new Date('2026-07-01'),
        user_created: 'SYSTEM',
      },
    })
    await prisma.paymentTerm.update({
      where: { id_term: term2.id_term },
      data: { status: 'partial', paid_amount: 2000000 },
    })
    console.log(`  Partial payment Rp2.000.000 created for term #${term2.id_term} (Termin 1 → partial)`)
  }

  // ──────────────────────────────────────────────
  // COMMISSIONS
  // ──────────────────────────────────────────────
  console.log('Seeding commissions...')
  const commissionPct = 10
  const vendor1PackagesTotal = pkg1.price + pkg2.price + pkg3.price
  const vendor2PackagesTotal = pkg4.price + pkg5.price

  await prisma.commission.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: 1,
      percentage: commissionPct,
      amount: vendor1PackagesTotal * (commissionPct / 100),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  await prisma.commission.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: 2,
      percentage: commissionPct,
      amount: vendor2PackagesTotal * (commissionPct / 100),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  console.log(`Commissions created for both vendors (${commissionPct}% each)`)

  // ──────────────────────────────────────────────
  // PAYMENT REQUESTS
  // ──────────────────────────────────────────────
  console.log('Seeding payment requests...')

  // Request 1: Draft
  const draftReq = await prisma.paymentRequest.create({
    data: {
      request_number: 'PR-2026-0001',
      title: 'Pembayaran Dokumentasi Tambahan',
      request_date: new Date('2026-06-01'),
      requested_by: 2,
      notes: 'Dokumentasi tambahan untuk resepsi',
      payment_method: 'Transfer Bank',
      bank_account_number: '987-654-3210',
      payment_to: 'Sari Wedding Photography',
      status: 'draft',
      user_created: 'vendor1@demo.com',
    },
  })
  await prisma.paymentRequestItem.createMany({
    data: [
      { id_request: draftReq.id_request, description: 'Pre-wedding foto tambahan (10 lembar)', quantity: 1, unit_price: 500000, amount: 500000, sort_order: 1 },
      { id_request: draftReq.id_request, description: 'Cetak album ukuran 8x12', quantity: 2, unit_price: 350000, amount: 700000, sort_order: 2 },
    ],
  })
  console.log(`  PR #${draftReq.request_number} (Draft) created`)

  // Request 2: Pending (submitted, waiting approval)
  const pendingReq = await prisma.paymentRequest.create({
    data: {
      request_number: 'PR-2026-0002',
      title: 'Pelunasan Dekorasi Pelaminan',
      request_date: new Date('2026-06-10'),
      requested_by: 3,
      payment_method: 'Transfer Bank',
      bank_account_number: '111-222-3333',
      payment_to: 'Indah Catering',
      status: 'pending',
      user_created: 'vendor2@demo.com',
    },
  })
  await prisma.paymentRequestItem.createMany({
    data: [
      { id_request: pendingReq.id_request, description: 'Dekorasi pelaminan adat', quantity: 1, unit_price: 3000000, amount: 3000000, sort_order: 1 },
      { id_request: pendingReq.id_request, description: 'Tambahan ornamen bunga', quantity: 5, unit_price: 150000, amount: 750000, sort_order: 2 },
    ],
  })
  await prisma.paymentTransaction.create({
    data: {
      id_request: pendingReq.id_request,
      transaction_type: 'submitted',
      description: 'Payment request submitted by vendor',
      created_by: 'vendor2@demo.com',
    },
  })
  console.log(`  PR #${pendingReq.request_number} (Pending) created`)

  // Request 3: Approved (ready for release)
  const approvedReq = await prisma.paymentRequest.create({
    data: {
      request_number: 'PR-2026-0003',
      title: 'Pembayaran Katering untuk Acara',
      request_date: new Date('2026-06-15'),
      requested_by: 3,
      reviewed_by: 6,
      reviewed_at: new Date('2026-06-16'),
      approval_notes: 'Disetujui, segera diproses',
      notes: 'Katering untuk 200 pax',
      payment_method: 'Transfer Bank',
      bank_account_number: '111-222-3333',
      payment_to: 'Indah Catering',
      status: 'approved',
      user_created: 'vendor2@demo.com',
      user_modified: 'finance@demo.com',
    },
  })
  await prisma.paymentRequestItem.createMany({
    data: [
      { id_request: approvedReq.id_request, description: 'Paket katering pernikahan (200 pax)', quantity: 200, unit_price: 75000, amount: 15000000, sort_order: 1 },
      { id_request: approvedReq.id_request, description: 'Minuman ringan & sirup', quantity: 200, unit_price: 15000, amount: 3000000, sort_order: 2 },
    ],
  })
  await prisma.paymentTransaction.createMany({
    data: [
      { id_request: approvedReq.id_request, transaction_type: 'submitted', description: 'Payment request submitted', created_by: 'vendor2@demo.com' },
      { id_request: approvedReq.id_request, transaction_type: 'approved', description: 'Approved by Finance', created_by: 'finance@demo.com' },
    ],
  })
  console.log(`  PR #${approvedReq.request_number} (Approved) created`)

  // Request 4: Released (with receipt)
  const releasedReq = await prisma.paymentRequest.create({
    data: {
      request_number: 'PR-2026-0004',
      title: 'Pembayaran Fotografi Pre-wedding',
      request_date: new Date('2026-05-20'),
      requested_by: 2,
      reviewed_by: 6,
      reviewed_at: new Date('2026-05-22'),
      approval_notes: 'Setuju',
      receipt_number: 'RCP-2026-0001',
      released_by: 6,
      released_at: new Date('2026-05-23'),
      notes: 'Sesi pre-wedding outdoor',
      payment_method: 'Transfer Bank',
      bank_account_number: '987-654-3210',
      payment_to: 'Sari Wedding Photography',
      status: 'released',
      user_created: 'vendor1@demo.com',
      user_modified: 'finance@demo.com',
    },
  })
  await prisma.paymentRequestItem.createMany({
    data: [
      { id_request: releasedReq.id_request, description: 'Paket pre-wedding outdoor', quantity: 1, unit_price: 2500000, amount: 2500000, sort_order: 1 },
      { id_request: releasedReq.id_request, description: 'Cetak foto ukuran 12R (5 lembar)', quantity: 5, unit_price: 50000, amount: 250000, sort_order: 2 },
    ],
  })
  await prisma.paymentTransaction.createMany({
    data: [
      { id_request: releasedReq.id_request, transaction_type: 'submitted', description: 'Payment request submitted', created_by: 'vendor1@demo.com' },
      { id_request: releasedReq.id_request, transaction_type: 'approved', description: 'Approved by Finance', created_by: 'finance@demo.com' },
      { id_request: releasedReq.id_request, transaction_type: 'released', description: 'Receipt released', created_by: 'finance@demo.com' },
    ],
  })
  console.log(`  PR #${releasedReq.request_number} (Released) created`)

  // ──────────────────────────────────────────────
  // COMPANY INFO
  // ──────────────────────────────────────────────
  console.log('Seeding company info...')
  await prisma.companyInfo.create({
    data: {
      company_name: 'Agregrator Business',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      phone: '(021) 1234-5678',
      email: 'hello@agregrator.com',
      bank_name: 'Bank Central Asia (BCA)',
      bank_account: '123-456-7890',
      bank_holder: 'PT Agregrator Business',
      footer_text: 'Terima kasih telah menggunakan layanan kami.',
    },
  })
  console.log('Company info seeded successfully.')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
