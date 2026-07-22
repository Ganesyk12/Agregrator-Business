import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const CAT_PHOTOGRAPHY = 'Photography'
const CAT_MUA = 'MUA'
const CAT_BOUQUET = 'Bouquet Flowers'

const vendorsByCategory: Record<string, string[]> = {
  [CAT_PHOTOGRAPHY]: [
    'Lensa Abadi Photography', 'Cahaya Senja Visual', 'Frame Indah Photography',
    'Momen Abadi Photo', 'Golden Lens Studio', 'Shutter Paradise',
    'Pixel Indah Visual', 'Angkasa Fotografi', 'Biru Langit Photo',
    'Elok Visual Studio', 'Karya Lensa', 'Fokus Abadi', 'Pelangi Visual Art',
  ],
  [CAT_MUA]: [
    'Bidadari Makeup', 'Cantik Natural MUA', 'Pesona Rias Pengantin',
    'Glow Artistry', 'Ratu Rias Modern', 'Anggun Makeup Studio',
    'Berseri MUA', 'Dewi Rias Bridal', 'Elegan Makeup Art',
    'Flawless Beauty', 'MUA Impian', 'Cahaya Ayu Rias', 'Rias Pesona',
  ],
  [CAT_BOUQUET]: [
    'Bouquet Cantik', 'Floral Indah', 'Rangkaian Bunga Nusantara',
    'Blooming Flowers', 'Bouquet Pesona', 'Floral Harmony',
    'Bunga Indah Florist', 'Rose Petal Bouquet', 'Mekar Florist',
    'Bouquet Anggun', 'Floral Paradise', 'Segar Bunga Florist',
    'Bouquet Elok', 'Wonderful Blooms',
  ],
}

type VendorPkg = { name: string; price: number; duration: string; whats_included: string }

const pkgsByCategory: Record<string, VendorPkg[]> = {
  [CAT_PHOTOGRAPHY]: [
    { name: 'Paket Basic Photo', price: 1500000, duration: '2 Jam', whats_included: '1 Fotografer, 50+ foto edit, gallery online' },
    { name: 'Paket Standar Photo', price: 2500000, duration: '4 Jam', whats_included: '1 Fotografer, 100+ foto edit, album 8x12' },
    { name: 'Paket Premium Photo', price: 4000000, duration: '6 Jam', whats_included: '2 Fotografer, 200+ foto edit, album 10x14' },
    { name: 'Paket Video Basic', price: 2000000, duration: '3 Jam', whats_included: '1 Videografer, video highlight 3 menit' },
    { name: 'Paket Video Premium', price: 3500000, duration: '6 Jam', whats_included: '1 Videografer, video highlight 5 menit, full video' },
  ],
  [CAT_MUA]: [
    { name: 'Paket Makeup Basic', price: 800000, duration: '1 Sesi', whats_included: 'Makeup natural, touch-up kit, trial 1x' },
    { name: 'Paket Makeup Standar', price: 1500000, duration: '1 Sesi', whats_included: 'Makeup bridal, trial 1x, touch-up kit, lashes' },
    { name: 'Paket Makeup Premium', price: 2500000, duration: '2 Sesi', whats_included: 'Makeup bridal + ibu, trial 2x, hair do' },
    { name: 'Paket Makeup VIP', price: 3500000, duration: '2 Sesi', whats_included: 'Makeup bridal + ibu + 2 bridesmaid, trial 2x' },
    { name: 'Paket Makeup Eksklusif', price: 5000000, duration: 'Full Day', whats_included: 'Makeup seluruh keluarga, trial unlimited, on-site' },
  ],
  [CAT_BOUQUET]: [
    { name: 'Buket Basic', price: 150000, duration: '1 Ikat', whats_included: 'Bunga segar pilihan, wrapping kertas kraft' },
    { name: 'Buket Standar', price: 350000, duration: '1 Ikat', whats_included: 'Bunga segar premium, wrapping luxury, pita' },
    { name: 'Buket Premium', price: 600000, duration: '1 Ikat', whats_included: 'Bunga import, wrapping eksklusif, kartu ucapan' },
    { name: 'Arrangement Meja', price: 500000, duration: '1 Set', whats_included: 'Vas + rangkaian bunga segar untuk meja' },
    { name: 'Dekorasi Bunga', price: 2000000, duration: '1 Event', whats_included: 'Rangkaian bunga untuk panggung/pelaminan' },
  ],
}

const portfolioTitles: Record<string, string[]> = {
  [CAT_PHOTOGRAPHY]: [
    'Prewedding Outdoor Classic', 'Wedding Ceremony Indoor', 'Engagement Session',
    'Family Portrait Studio', 'Graduation Photoshoot', 'Maternity Photo Session',
    'Birthday Celebration', 'Corporate Event Coverage', 'Product Photography',
    'Couple Romantic Session',
  ],
  [CAT_MUA]: [
    'Bridal Makeup Traditional', 'Modern Wedding Look', 'Natural Glam Makeup',
    'Makeup Ibu Pengantin', 'Bridesmaid Makeup Set', 'Makeup Wisuda Natural',
    'Party Glam Look', 'Engagement Makeup Look', 'Makeup Prewedding',
    'Editorial Makeup Shoot',
  ],
  [CAT_BOUQUET]: [
    'Buket Bunga Mawar Merah', 'Buket Bunga Tulip', 'Buket Bunga Campuran',
    'Rangkaian Meja Minimalis', 'Dekorasi Pelaminan Bunga', 'Buket Wisuda',
    'Buket Bunga Kering', 'Rangkaian Bunga Meja Tamu', 'Buket Pernikahan Putih',
    'Arrangement Bunga Import',
  ],
}

const locations = [
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
  'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan',
  'Makassar', 'Denpasar', 'Palembang', 'Bogor', 'Tangerang',
  'Bekasi', 'Depok', 'Malang', 'Solo', 'Balikpapan',
]

function img(category: string, vendorIdx: number, portfolioIdx: number, w = 800, h = 600) {
  const seed = `${category.toLowerCase().replace(/\s+/g, '-')}-${vendorIdx}-${portfolioIdx}`
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

async function main() {
  console.log('Cleaning existing data...')
  await prisma.payout.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingPackageExtra.deleteMany()
  await prisma.bookingPackage.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.packageExtra.deleteMany()
  await prisma.portfolioImage.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.package.deleteMany()
  await prisma.vendorAvailability.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.user_Role.deleteMany({ where: { email: { not: 'rivanapta53@gmail.com' } } })
  await prisma.user.deleteMany({ where: { id_user: { gt: 1 } } })
  console.log('Cleaned.\n')

  console.log('Seeding roles...')
  const roleData = [
    { role_code: 'eUser-SuperAdmin', name: 'Super Admin' },
    { role_code: 'eUser-Admin', name: 'Admin' },
    { role_code: 'eUser-Vendor', name: 'Vendor' },
    { role_code: 'eUser-Customer', name: 'Customer' },
    { role_code: 'eUser-Finance', name: 'Finance' },
  ]
  for (const r of roleData) {
    await prisma.role.upsert({
      where: { role_code: r.role_code },
      update: { name: r.name },
      create: r,
    })
  }
  console.log('Roles seeded.\n')

  console.log('Seeding categories...')
  const catNames = [CAT_PHOTOGRAPHY, CAT_MUA, CAT_BOUQUET]
  const catMap: Record<string, any> = {}
  for (const name of catNames) {
    catMap[name] = await prisma.category.upsert({
      where: { category_name: name },
      update: {},
      create: { category_name: name },
    })
  }
  console.log(`Categories: ${Object.keys(catMap).join(', ')}\n`)

  console.log('Seeding vendors...')
  const vendorEntries: Array<{
    vendor: any
    categoryName: string
  }> = []

  let vendorIdx = 0
  for (const catName of catNames) {
    const names = vendorsByCategory[catName]
    for (let vi = 0; vi < names.length; vi++) {
      const bizName = names[vi]
      const catVal = catName === CAT_BOUQUET ? 'Bouquet' : catName
      const email = `${catVal.toLowerCase().replace(/\s+/g, '')}${vi + 1}@demo.com`
      const loc = locations[vendorIdx % locations.length]

      const user = await prisma.user.create({
        data: {
          email,
          password: '123456',
          full_name: bizName,
          phone: `081${String(100000000 + vendorIdx).slice(0, 10)}`,
          user_created: 'SYSTEM',
        },
      })

      await prisma.user_Role.create({
        data: { email: user.email, role_code: 'eUser-Vendor', user_created: 'SYSTEM' },
      })

      const vendor = await prisma.vendor.create({
        data: {
          id_user: user.id_user,
          business_name: bizName,
          description: `${bizName} adalah vendor ${catVal} profesional dan berpengalaman di ${loc}.`,
          category: catVal,
          location: loc,
          years_exp: Math.floor(Math.random() * 15) + 1,
          status: 'verified',
          verified_at: new Date(),
          user_created: 'SYSTEM',
        },
      })

      vendorEntries.push({ vendor, categoryName: catName })
      vendorIdx++
    }
  }
  console.log(`Total ${vendorEntries.length} vendors created.\n`)

  console.log('Seeding packages...')
  for (const { vendor, categoryName } of vendorEntries) {
    const pkgList = pkgsByCategory[categoryName]
    for (const p of pkgList) {
      await prisma.package.create({
        data: {
          id_vendor: vendor.id_vendor,
          id_category: catMap[categoryName].id_category,
          name: p.name,
          description: `${p.name} - ${p.duration}`,
          price: p.price,
          duration: p.duration,
          whats_included: p.whats_included,
          user_created: 'SYSTEM',
        },
      })
    }
  }
  console.log('Packages created.\n')

  console.log('Seeding package extras...')
  const extraTemplates: Record<string, Array<{ name: string; price: number; icon: string }>> = {
    'Paket Basic Photo': [
      { name: 'Extra Photographer', price: 500000, icon: '📷' },
      { name: 'Printed Album', price: 350000, icon: '📔' },
    ],
    'Paket Standar Photo': [
      { name: 'Extra Photographer', price: 500000, icon: '📷' },
      { name: 'Printed Album', price: 350000, icon: '📔' },
      { name: 'Express Editing', price: 400000, icon: '⚡' },
    ],
    'Paket Premium Photo': [
      { name: 'Extra Photographer', price: 500000, icon: '📷' },
      { name: 'Drone', price: 750000, icon: '🛸' },
      { name: 'Printed Album', price: 350000, icon: '📔' },
      { name: 'Express Editing', price: 400000, icon: '⚡' },
    ],
    'Paket Video Basic': [
      { name: 'Extra Camera', price: 600000, icon: '🎥' },
      { name: 'Highlight Reel', price: 500000, icon: '🎬' },
    ],
    'Paket Video Premium': [
      { name: 'Extra Camera', price: 600000, icon: '🎥' },
      { name: 'Drone', price: 750000, icon: '🛸' },
      { name: 'Highlight Reel', price: 500000, icon: '🎬' },
      { name: 'Live Streaming', price: 1000000, icon: '📺' },
    ],
    'Paket Makeup Basic': [
      { name: 'Hairdo', price: 300000, icon: '💇' },
      { name: 'Nail Art', price: 200000, icon: '💅' },
    ],
    'Paket Makeup Standar': [
      { name: 'Hairdo', price: 300000, icon: '💇' },
      { name: 'Nail Art', price: 200000, icon: '💅' },
      { name: 'Hijab Styling', price: 250000, icon: '🧕' },
    ],
    'Paket Makeup Premium': [
      { name: 'Hairdo', price: 300000, icon: '💇' },
      { name: 'Nail Art', price: 200000, icon: '💅' },
      { name: 'Hijab Styling', price: 250000, icon: '🧕' },
      { name: 'Touch Up During Event', price: 500000, icon: '✨' },
    ],
    'Paket Makeup VIP': [
      { name: 'Hairdo', price: 300000, icon: '💇' },
      { name: 'Nail Art', price: 200000, icon: '💅' },
      { name: 'Hijab Styling', price: 250000, icon: '🧕' },
      { name: 'Touch Up During Event', price: 500000, icon: '✨' },
    ],
    'Paket Makeup Eksklusif': [
      { name: 'Hairdo', price: 300000, icon: '💇' },
      { name: 'Nail Art', price: 200000, icon: '💅' },
      { name: 'Hijab Styling', price: 250000, icon: '🧕' },
      { name: 'Touch Up During Event', price: 500000, icon: '✨' },
    ],
    'Buket Basic': [
      { name: 'Premium Wrapping', price: 150000, icon: '🎀' },
      { name: 'Custom Greeting Card', price: 50000, icon: '💌' },
    ],
    'Buket Standar': [
      { name: 'Premium Wrapping', price: 150000, icon: '🎀' },
      { name: 'Custom Greeting Card', price: 50000, icon: '💌' },
      { name: 'Same Day Delivery', price: 100000, icon: '🚚' },
    ],
    'Buket Premium': [
      { name: 'Premium Wrapping', price: 150000, icon: '🎀' },
      { name: 'Custom Greeting Card', price: 50000, icon: '💌' },
      { name: 'Extra Florist', price: 400000, icon: '🌸' },
    ],
    'Arrangement Meja': [
      { name: 'Extra Florist', price: 400000, icon: '🌸' },
      { name: 'Premium Wrapping', price: 150000, icon: '🎀' },
    ],
    'Dekorasi Bunga': [
      { name: 'Extra Florist', price: 400000, icon: '🌸' },
      { name: 'Weekly Flower Subscription', price: 200000, icon: '🌷' },
    ],
  }

  const allPackages = await prisma.package.findMany()
  for (const pkg of allPackages) {
    const extras = extraTemplates[pkg.name] || extraTemplates['Paket Basic Photo']
    for (const ex of extras) {
      await prisma.packageExtra.create({
        data: {
          id_package: pkg.id_package,
          name: ex.name,
          price: ex.price,
          icon: ex.icon,
          user_created: 'SYSTEM',
        },
      })
    }
  }
  console.log('Package extras created.\n')

  console.log('Seeding portfolios with category-specific images...')
  let portfolioCode = 1
  for (const { vendor, categoryName } of vendorEntries) {
    const vendorPackages = await prisma.package.findMany({
      where: { id_vendor: vendor.id_vendor },
    })
    const titles = portfolioTitles[categoryName]

    for (let pi = 0; pi < 10; pi++) {
      const pkg = vendorPackages[pi % vendorPackages.length]
      const code = `PRT-${String(portfolioCode).padStart(4, '0')}`
      const title = titles[pi % titles.length]
      const coverUrl = img(categoryName, vendor.id_vendor, pi)

      const portfolio = await prisma.portfolio.create({
        data: {
          id_vendor: vendor.id_vendor,
          id_package: pkg.id_package,
          id_category: catMap[categoryName].id_category,
          title,
          code,
          cover_url: coverUrl,
          description: `Proyek ${title.toLowerCase()} oleh ${vendor.business_name}.`,
          location: vendor.location,
          label: categoryName,
          sort_order: pi,
          user_created: 'SYSTEM',
        },
      })

      const imageData = Array.from({ length: 4 }, (_, i) => ({
        id_portfolio: portfolio.id_portfolio,
        image_url: img(categoryName, vendor.id_vendor, pi * 10 + i),
        caption: i === 0 ? 'Main highlight' : i === 1 ? 'Behind the scenes' : `Photo ${i + 1}`,
        sort_order: i,
      }))
      await prisma.portfolioImage.createMany({ data: imageData })
      portfolioCode++
    }
  }
  console.log(`${portfolioCode - 1} portfolios created.\n`)

  console.log('Seeding company info...')
  await prisma.companyInfo.upsert({
    where: { id_company: 1 },
    update: {},
    create: {
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
  console.log('Company info seeded.\n')

  console.log('=== SEED COMPLETED ===')
  console.log(`Vendors: ${vendorEntries.length}`)
  console.log(`Portfolios: ${portfolioCode - 1}`)
  console.log('')
  console.log('Login credentials (password: 123456):')
  for (const catName of catNames) {
    const names = vendorsByCategory[catName]
    const catVal = catName === CAT_BOUQUET ? 'Bouquet' : catName
    console.log(`  ${catName}: ${catVal.toLowerCase()}1@demo.com - ${catVal.toLowerCase()}${names.length}@demo.com`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
