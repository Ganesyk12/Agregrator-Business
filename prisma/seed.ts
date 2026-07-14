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
  // ── Roles ──
  console.log('Seeding database roles...')
  const roles = [
    { role_code: 'eUser-Admin', name: 'Admin' },
    { role_code: 'eUser-Vendor', name: 'Vendor' },
    { role_code: 'eUser-Customer', name: 'Customer' },
    { role_code: 'eUser-Finance', name: 'Finance' },
    { role_code: 'eUser-SuperAdmin', name: 'Super Admin' },
  ]
  for (const r of roles) {
    await prisma.role.upsert({
      where: { role_code: r.role_code },
      update: {},
      create: r,
    })
  }
  console.log('Database roles seeded successfully.')
  // ── Categories ──
  console.log('Seeding categories...')
  const categoryData = [
    { category_name: 'Fotografi' },
    { category_name: 'Videografi' },
    { category_name: 'Tata Rias' },
    { category_name: 'Dekorasi' },
    { category_name: 'Katering' },
  ]
  const categories: Record<string, any> = {}
  for (const c of categoryData) {
    categories[c.category_name] = await prisma.category.upsert({
      where: { category_name: c.category_name },
      update: {},
      create: c,
    })
  }
  console.log('Categories seeded successfully.')

  // ── Users ──
  console.log('Seeding users...')
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      email: 'customer@demo.com',
      password: '123456',
      full_name: 'Budi Santoso',
      phone: '081234567890',
    },
  })

  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'vendor1@demo.com' },
    update: {},
    create: {
      email: 'vendor1@demo.com',
      password: '123456',
      full_name: 'Sari Wedding Photography',
      phone: '081298765432',
    },
  })

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'vendor2@demo.com' },
    update: {},
    create: {
      email: 'vendor2@demo.com',
      password: '123456',
      full_name: 'Indah Catering',
      phone: '081234567891',
    },
  })

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@sigyn.com' },
    update: {},
    create: {
      email: 'superadmin@sigyn.com',
      password: '123456',
      full_name: 'Super Admin',
      phone: '081234567892',
    },
  })
  console.log('Users seeded successfully.')

  // ── User Roles ──
  console.log('Seeding user roles...')
  await prisma.user_Role.upsert({
    where: { email_role_code: { email: customerUser.email, role_code: 'eUser-Customer' } },
    update: {},
    create: { email: customerUser.email, role_code: 'eUser-Customer' },
  })
  await prisma.user_Role.upsert({
    where: { email_role_code: { email: vendorUser1.email, role_code: 'eUser-Vendor' } },
    update: {},
    create: { email: vendorUser1.email, role_code: 'eUser-Vendor' },
  })
  await prisma.user_Role.upsert({
    where: { email_role_code: { email: vendorUser2.email, role_code: 'eUser-Vendor' } },
    update: {},
    create: { email: vendorUser2.email, role_code: 'eUser-Vendor' },
  })
  await prisma.user_Role.upsert({
    where: { email_role_code: { email: superAdminUser.email, role_code: 'eUser-SuperAdmin' } },
    update: {},
    create: { email: superAdminUser.email, role_code: 'eUser-SuperAdmin' },
  })
  console.log('User roles seeded successfully.')

  // ── Vendors ──
  console.log('Seeding vendors...')
  const vendor1 = await prisma.vendor.upsert({
    where: { id_user: vendorUser1.id_user },
    update: {},
    create: {
      id_user: vendorUser1.id_user,
      business_name: 'Sari Wedding Photography',
      description: 'Vendor fotografi & videografi pernikahan profesional',
      category: 'Fotografi',
      location: 'Jakarta Selatan',
      years_exp: 8,
      status: 'verified',
      verified_at: new Date('2024-06-01'),
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { id_user: vendorUser2.id_user },
    update: {},
    create: {
      id_user: vendorUser2.id_user,
      business_name: 'Indah Catering',
      description: 'Katering pernikahan dengan menu prasmanan & fine dining',
      category: 'Katering',
      location: 'Jakarta Pusat',
      years_exp: 5,
      status: 'verified',
      verified_at: new Date(),
    },
  })
  console.log('Vendors seeded successfully.')

  // ── Portfolios ──
  console.log('Seeding portfolios...')
  const vendorPortfolios: { vendorId: number; name: string; cat: string }[] = [
    { vendorId: vendor1.id_vendor, name: 'Akbar & Sarah Wedding', cat: 'Wedding' },
    { vendorId: vendor1.id_vendor, name: 'Rina Graduation Photos', cat: 'Graduation' },
    { vendorId: vendor1.id_vendor, name: 'Budi Family Session', cat: 'Family' },
    { vendorId: vendor2.id_vendor, name: 'TechCorp Annual Event', cat: 'Corporate' },
    { vendorId: vendor2.id_vendor, name: 'Dian & Adi Wedding Video', cat: 'Wedding' },
  ]

  for (let i = 0; i < vendorPortfolios.length; i++) {
    const vp = vendorPortfolios[i]
    const code = `PRT-${String(i + 1).padStart(4, '0')}`
    const coverIdx = (i * 3) % portfolioImages.length

    const existing = await prisma.portfolio.findUnique({ where: { code } })
    if (existing) {
      await prisma.portfolioImage.deleteMany({ where: { id_portfolio: existing.id_portfolio } })
      await prisma.portfolio.delete({ where: { code } })
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        id_vendor: vp.vendorId,
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

  // ── Packages ──
  console.log('Seeding packages...')
  const pkg1 = await prisma.package.upsert({
    where: { id_package: 1 },
    update: {},
    create: {
      id_vendor: vendor1.id_vendor,
      id_category: categories['Fotografi'].id_category,
      name: 'Paket Foto Basic',
      description: 'Paket foto pernikahan basic dengan 1 fotografer',
      price: 2500000,
      duration: '4 Jam',
      whats_included: '1 Fotografer, 100+ foto edit, album 8x12',
    },
  })
  const pkg2 = await prisma.package.upsert({
    where: { id_package: 2 },
    update: {},
    create: {
      id_vendor: vendor1.id_vendor,
      id_category: categories['Videografi'].id_category,
      name: 'Paket Video Cinematic',
      description: 'Video sinematik pernikahan full ceremony',
      price: 3500000,
      duration: '6 Jam',
      whats_included: '1 Videografer, video highlight 3-5 menit, video full duration',
    },
  })
  const pkg3 = await prisma.package.upsert({
    where: { id_package: 3 },
    update: {},
    create: {
      id_vendor: vendor1.id_vendor,
      id_category: categories['Tata Rias'].id_category,
      name: 'Paket Makeup Bridal',
      description: 'Makeup pengantin dengan trial session',
      price: 1500000,
      duration: '1 Sesi',
      whats_included: 'Trial makeup, makeup on the day, retouch touch-up',
    },
  })
  const pkg4 = await prisma.package.upsert({
    where: { id_package: 4 },
    update: {},
    create: {
      id_vendor: vendor2.id_vendor,
      id_category: categories['Katering'].id_category,
      name: 'Paket Catering Prasmanan',
      description: 'Menu prasmanan untuk 100 tamu',
      price: 5000000,
      duration: '1 Hari',
      whats_included: 'Menu prasmanan 5 menu, dessert, minuman',
    },
  })
  const pkg5 = await prisma.package.upsert({
    where: { id_package: 5 },
    update: {},
    create: {
      id_vendor: vendor2.id_vendor,
      id_category: categories['Dekorasi'].id_category,
      name: 'Paket Dekorasi Pelaminan',
      description: 'Dekorasi pelaminan dan tenda resepsi',
      price: 3000000,
      duration: '1 Hari',
      whats_included: 'Pelaminan, dekorasi tenda, lighting, backdrop',
    },
  })
  console.log('Packages seeded successfully.')

  // ── Booking ──
  console.log('Seeding booking with multi-vendor packages...')
  const totalPrice = pkg1.price + pkg2.price + pkg3.price + pkg4.price + pkg5.price
  const booking = await prisma.booking.create({
    data: {
      customer: { connect: { id_user: customerUser.id_user } },
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
      { id_booking: booking.id_booking, id_package: pkg1.id_package, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: pkg2.id_package, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: pkg3.id_package, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: pkg4.id_package, user_created: 'SYSTEM' },
      { id_booking: booking.id_booking, id_package: pkg5.id_package, user_created: 'SYSTEM' },
    ],
  })
  console.log(`Booking #${booking.id_booking} created with 5 packages from 2 vendors (total: Rp${totalPrice.toLocaleString()})`)

  // ── Payment ──
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

  // ── Commissions ──
  console.log('Seeding commissions...')
  const commissionPct = 10
  const vendor1PackagesTotal = pkg1.price + pkg2.price + pkg3.price
  const vendor2PackagesTotal = pkg4.price + pkg5.price

  await prisma.commission.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: vendor1.id_vendor,
      percentage: commissionPct,
      amount: vendor1PackagesTotal * (commissionPct / 100),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  await prisma.commission.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: vendor2.id_vendor,
      percentage: commissionPct,
      amount: vendor2PackagesTotal * (commissionPct / 100),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  console.log(`Commissions created for both vendors (${commissionPct}% each)`)

  // ── Payouts ──
  console.log('Seeding payouts...')
  await prisma.payout.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: vendor1.id_vendor,
      amount: vendor1PackagesTotal - (vendor1PackagesTotal * (commissionPct / 100)),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  await prisma.payout.create({
    data: {
      id_booking: booking.id_booking,
      id_vendor: vendor2.id_vendor,
      amount: vendor2PackagesTotal - (vendor2PackagesTotal * (commissionPct / 100)),
      status: 'pending',
      user_created: 'SYSTEM',
    },
  })
  console.log('Payouts created for both vendors')

  // ── Company Info ──
  console.log('Seeding company info...')
  await prisma.companyInfo.upsert({
    where: { id_company: 1 },
    update: {},
    create: {
      id_company: 1,
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
>>>>>>> main
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
