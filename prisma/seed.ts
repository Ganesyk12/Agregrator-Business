import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const portfolioImages = [
  'banner-image-1.jpg', 'banner-image-2.jpg', 'banner-image-3.jpg',
  'banner-image-4.jpg', 'banner-image-5.jpg', 'banner-image-6.jpg',
  'collection-banner.jpg', 'newsletter-image.jpg', 'bg-newsletter.jpg',
  'single-image-2.jpg', 'post-image1.jpg', 'post-image2.jpg',
  'post-image3.jpg', 'post-image4.jpg', 'post-image5.jpg',
  'post-image6.jpg', 'post-image7.jpg', 'post-image8.jpg',
  'post-image9.jpg', 'post-image1.jpg', 'post-image2.jpg'
]

function img(file: string) {
  return `/src/assets/kaira/images/${file}`
}

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: 'weddingstudio@sigyn.com' },
    update: {},
    create: {
      email: 'weddingstudio@sigyn.com',
      password: '$2b$10$dummy',
      full_name: 'Elsa Widjaja',
      phone: '08123456789',
      role: 'vendor',
      is_active: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'lenspro@sigyn.com' },
    update: {},
    create: {
      email: 'lenspro@sigyn.com',
      password: '$2b$10$dummy',
      full_name: 'Dimas Aditya',
      phone: '08198765432',
      role: 'vendor',
      is_active: true,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'makeupbyrara@sigyn.com' },
    update: {},
    create: {
      email: 'makeupbyrara@sigyn.com',
      password: '$2b$10$dummy',
      full_name: 'Rara Sekar',
      phone: '08234567890',
      role: 'vendor',
      is_active: true,
    },
  })

  const user4 = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: '$2b$10$dummy',
      full_name: 'Budi Santoso',
      phone: '08765432100',
      role: 'customer',
      is_active: true,
    },
  })

  const vendor1 = await prisma.vendor.upsert({
    where: { id_user: user1.id_user },
    update: {},
    create: {
      id_user: user1.id_user,
      business_name: 'Elsa Wedding Studio',
      description: 'Wedding & event photography specialist with over 8 years of experience capturing beautiful moments across Indonesia.',
      category: 'Photography',
      location: 'Jakarta Selatan',
      starting_price: 5000000,
      years_exp: 8,
      status: 'verified',
      verified_at: new Date('2024-06-01'),
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { id_user: user2.id_user },
    update: {},
    create: {
      id_user: user2.id_user,
      business_name: 'LensPro Photography',
      description: 'Professional videography and cinematography for weddings, corporate events, and brand campaigns.',
      category: 'Videography',
      location: 'Bandung',
      starting_price: 3500000,
      years_exp: 5,
      status: 'verified',
      verified_at: new Date('2024-07-15'),
    },
  })

  const vendor3 = await prisma.vendor.upsert({
    where: { id_user: user3.id_user },
    update: {},
    create: {
      id_user: user3.id_user,
      business_name: 'Rara Makeup Artistry',
      description: 'Professional makeup artist for bridal, graduation, and special occasions. Specializing in natural glam look.',
      category: 'MUA',
      location: 'Jakarta Pusat',
      starting_price: 1500000,
      years_exp: 6,
      status: 'verified',
      verified_at: new Date('2024-05-20'),
    },
  })

  for (const vendorId of [vendor1.id_vendor, vendor2.id_vendor, vendor3.id_vendor]) {
    const existingPortfolios = await prisma.portfolio.findMany({ where: { id_vendor: vendorId } })
    for (const p of existingPortfolios) {
      await prisma.portfolioImage.deleteMany({ where: { id_portfolio: p.id_portfolio } })
      await prisma.portfolio.delete({ where: { id_portfolio: p.id_portfolio } })
    }
  }

  const categories = ['Wedding', 'Graduation', 'Family', 'Corporate', 'Birthday', 'Product']
  const vendorPortfolios: { vendorId: number; name: string; cat: string }[] = [
    { vendorId: vendor1.id_vendor, name: 'Akbar & Sarah Wedding', cat: 'Wedding' },
    { vendorId: vendor1.id_vendor, name: 'Rina Graduation Photos', cat: 'Graduation' },
    { vendorId: vendor1.id_vendor, name: 'Budi Family Session', cat: 'Family' },
    { vendorId: vendor2.id_vendor, name: 'TechCorp Annual Event', cat: 'Corporate' },
    { vendorId: vendor2.id_vendor, name: 'Dian & Adi Wedding Video', cat: 'Wedding' },
    { vendorId: vendor2.id_vendor, name: 'Product Launch Campaign', cat: 'Product' },
    { vendorId: vendor3.id_vendor, name: 'Sari Bridal Makeover', cat: 'Wedding' },
    { vendorId: vendor3.id_vendor, name: 'Dita Graduation Glam', cat: 'Graduation' },
    { vendorId: vendor3.id_vendor, name: 'Nina Birthday Look', cat: 'Birthday' },
  ]

  const createdPortfolios: { id: number; vendorId: number }[] = []

  for (let i = 0; i < vendorPortfolios.length; i++) {
    const vp = vendorPortfolios[i]
    const code = `PRT-${String(i + 1).padStart(4, '0')}`
    const coverIdx = (i * 3) % portfolioImages.length

    const portfolio = await prisma.portfolio.create({
      data: {
        id_vendor: vp.vendorId,
        title: vp.name,
        code,
        category: vp.cat,
        description: `A beautiful ${vp.cat.toLowerCase()} project captured by our talented team. ${vp.name} was a memorable event filled with joy and laughter. We documented every precious moment with care and creativity.`,
        cover_url: img(portfolioImages[coverIdx]),
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

    createdPortfolios.push({ id: portfolio.id_portfolio, vendorId: vp.vendorId })
  }

  const packages = [
    { vendorId: vendor1.id_vendor, name: 'Silver', price: 5000000, duration: '4 Jam' },
    { vendorId: vendor1.id_vendor, name: 'Gold', price: 8500000, duration: '8 Jam' },
    { vendorId: vendor1.id_vendor, name: 'Platinum', price: 15000000, duration: '12 Jam' },
    { vendorId: vendor2.id_vendor, name: 'Basic', price: 3500000, duration: '3 Jam' },
    { vendorId: vendor2.id_vendor, name: 'Premium', price: 7500000, duration: '6 Jam' },
    { vendorId: vendor2.id_vendor, name: 'Cinematic', price: 12000000, duration: 'Full Day' },
    { vendorId: vendor3.id_vendor, name: 'Basic Makeup', price: 1500000, duration: '1 Sesi' },
    { vendorId: vendor3.id_vendor, name: 'Bridal Package', price: 3500000, duration: '3 Sesi' },
    { vendorId: vendor3.id_vendor, name: 'Premium Glam', price: 5500000, duration: 'Full Day' },
  ]

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({
      where: { id_vendor: pkg.vendorId, name: pkg.name },
    })
    if (!existing) {
      await prisma.package.create({
        data: {
          id_vendor: pkg.vendorId,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          description: `${pkg.name} package for ${pkg.duration}`,
          status: 'active',
        },
      })
    }
  }

  const reviewData = [
    { vendorId: vendor1.id_vendor, userId: user4.id_user, rating: 5, comment: 'Amazing photography! The results exceeded our expectations. Every shot was perfectly composed.', eventType: 'Wedding' },
    { vendorId: vendor1.id_vendor, userId: user4.id_user, rating: 4, comment: 'Great service and very professional. Would recommend to friends and family.', eventType: 'Graduation' },
    { vendorId: vendor1.id_vendor, userId: user4.id_user, rating: 5, comment: 'Captured our special day beautifully. Thank you for the wonderful memories!', eventType: 'Wedding' },
    { vendorId: vendor2.id_vendor, userId: user4.id_user, rating: 5, comment: 'Incredible videography! The cinematic quality was outstanding.', eventType: 'Corporate' },
    { vendorId: vendor2.id_vendor, userId: user4.id_user, rating: 4, comment: 'Very creative and professional team. Our brand video turned out amazing.', eventType: 'Product' },
    { vendorId: vendor3.id_vendor, userId: user4.id_user, rating: 5, comment: 'Best MUA I have ever worked with! The makeup lasted all day and looked flawless.', eventType: 'Wedding' },
    { vendorId: vendor3.id_vendor, userId: user4.id_user, rating: 4, comment: 'Beautiful graduation look! Highly recommend for any special occasion.', eventType: 'Graduation' },
  ]

  for (let i = 0; i < reviewData.length; i++) {
    const r = reviewData[i]
    const existing = await prisma.review.findFirst({
      where: { id_vendor: r.vendorId, comment: r.comment },
    })
    if (!existing) {
      const pkg = await prisma.package.findFirst({ where: { id_vendor: r.vendorId } })
      if (pkg) {
        const booking = await prisma.booking.create({
          data: {
            id_user: r.userId,
            id_vendor: r.vendorId,
            id_package: pkg.id_package,
            event_date: new Date('2025-01-15'),
            total_price: pkg.price,
            status: 'completed',
          },
        })
        await prisma.review.create({
          data: {
            id_booking: booking.id_booking,
            id_user: r.userId,
            id_vendor: r.vendorId,
            rating: r.rating,
            comment: r.comment,
            event_type: r.eventType,
          },
        })
      }
    }
  }

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
