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
      "sigyn"."Payment",
      "sigyn"."Review",
      "sigyn"."Commission",
      "sigyn"."Payout",
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
  await prisma.payment.create({
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
  // PAYOUTS
  // ──────────────────────────────────────────────
  console.log('Seeding payouts...')
  await prisma.payout.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: 1,
      amount: vendor1PackagesTotal - (vendor1PackagesTotal * (commissionPct / 100)),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  await prisma.payout.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: 2,
      amount: vendor2PackagesTotal - (vendor2PackagesTotal * (commissionPct / 100)),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  console.log('Payouts created for both vendors')

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
