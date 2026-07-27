import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Helpers ───────────────────────────────────────────────────────────────
function rupiah(n: number) { return n }

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Cleaning existing data...')
  await prisma.review.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingPackageExtra.deleteMany()
  await prisma.bookingPackage.deleteMany()
  await prisma.rfpPayment.deleteMany()
  await prisma.paymentRequestTerm.deleteMany()
  await prisma.paymentTransaction.deleteMany()
  await prisma.paymentRequestItem.deleteMany()
  await prisma.paymentRequest.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.packageExtra.deleteMany()
  await prisma.portfolioImage.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.package.deleteMany()
  await prisma.vendorAvailability.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.sizeConfigImage.deleteMany()
  await prisma.sizeConfig.deleteMany()
  await prisma.valueImage.deleteMany()
  await prisma.optionValue.deleteMany()
  await prisma.optionGroup.deleteMany()
  await prisma.optionalExtra.deleteMany()
  await prisma.productAddon.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productTemplate.deleteMany()
  await prisma.productSize.deleteMany()
  await prisma.productType.deleteMany()
  await prisma.productOccasion.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.user_Role.deleteMany({ where: { email: { not: 'rivanapta53@gmail.com' } } })
  await prisma.user.deleteMany({ where: { id_user: { gt: 1 } } })
  console.log('Cleaned.\n')

  // ── Roles ──────────────────────────────────────────────────────────────
  console.log('Seeding roles…')
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

  console.log('Assigning Super Admin role…')
  const superAdmin = await prisma.user.findUnique({ where: { email: 'rivanapta53@gmail.com' } })
  if (superAdmin) {
    await prisma.user_Role.upsert({
      where: { email_role_code: { email: 'rivanapta53@gmail.com', role_code: 'eUser-SuperAdmin' } },
      update: {},
      create: { email: 'rivanapta53@gmail.com', role_code: 'eUser-SuperAdmin', user_created: 'SYSTEM' },
    })
    console.log('Done.\n')
  }

  // ── Categories ─────────────────────────────────────────────────────────
  console.log('Seeding categories…')
  const catNames = ['Photography', 'MUA', 'Bouquet Flowers']
  for (const name of catNames) {
    await prisma.category.upsert({
      where: { category_name: name },
      update: {},
      create: { category_name: name },
    })
  }
  console.log(`Categories: ${catNames.join(', ')}\n`)

  // ── Product Lookups ────────────────────────────────────────────────────
  console.log('Seeding product lookups…')

  const occasions = await Promise.all(
    [
      { name: 'Wedding', slug: 'wedding', sort_order: 1 },
      { name: 'Graduation', slug: 'graduation', sort_order: 2 },
      { name: 'Birthday', slug: 'birthday', sort_order: 3 },
      { name: 'Engagement', slug: 'engagement', sort_order: 4 },
      { name: 'Anniversary', slug: 'anniversary', sort_order: 5 },
      { name: 'Formal Event', slug: 'formal', sort_order: 6 },
    ].map(o => prisma.productOccasion.upsert({ where: { slug: o.slug }, update: {}, create: o })),
  )

  const types = await Promise.all(
    [
      { name: 'Flower Bouquet', slug: 'flower-bouquet', sort_order: 1 },
      { name: 'Money Bouquet', slug: 'money-bouquet', sort_order: 2 },
      { name: 'Snack Bouquet', slug: 'snack-bouquet', sort_order: 3 },
      { name: 'Chocolate Bouquet', slug: 'chocolate-bouquet', sort_order: 4 },
      { name: 'Mixed Bouquet', slug: 'mixed-bouquet', sort_order: 5 },
    ].map(t => prisma.productType.upsert({ where: { slug: t.slug }, update: {}, create: t })),
  )

  const sizes = await Promise.all(
    [
      { name: 'Small', slug: 'small', sort_order: 1 },
      { name: 'Medium', slug: 'medium', sort_order: 2 },
      { name: 'Large', slug: 'large', sort_order: 3 },
    ].map(s => prisma.productSize.upsert({ where: { slug: s.slug }, update: {}, create: s })),
  )

  console.log('Product lookups seeded.\n')

  // ── Product Templates ────────────────────────────────────────────────
  console.log('Seeding product templates…')

  const templates = await Promise.all(
    [
      {
        name: 'Flower Bouquet',
        slug: 'flower-bouquet',
        description: 'Classic fresh flower arrangements with various flower types and wrapping styles.',
        icon: '🌹',
        short_desc: 'Fresh flower arrangements',
        recommended_use: 'Perfect for weddings, birthdays, anniversaries, and everyday gifting.',
        suggested_config: {
          option_groups: [
            { name: 'Flower Type', display_type: 'select', is_required: true },
            { name: 'Wrapping Color', display_type: 'color', is_required: true },
            { name: 'Ribbon', display_type: 'select', is_required: false },
            { name: 'Greeting Card', display_type: 'select', is_required: false },
          ],
          sizes: ['Small', 'Medium', 'Large'],
        },
        sort_order: 1,
      },
      {
        name: 'Money Bouquet',
        slug: 'money-bouquet',
        description: 'Creative money arrangements — a unique and memorable gift for any occasion.',
        icon: '💵',
        short_desc: 'Creative money arrangements',
        recommended_use: 'Ideal for graduations, weddings, birthdays, and corporate gifts.',
        suggested_config: {
          option_groups: [
            { name: 'Money Nominal', display_type: 'select', is_required: true },
            { name: 'Wrapping', display_type: 'select', is_required: true },
            { name: 'Ribbon', display_type: 'select', is_required: false },
            { name: 'Greeting Card', display_type: 'select', is_required: false },
          ],
          sizes: ['Small', 'Medium', 'Large'],
        },
        sort_order: 2,
      },
      {
        name: 'Snack Bouquet',
        slug: 'snack-bouquet',
        description: 'Fun and delicious snack bouquets made with your favorite treats and goodies.',
        icon: '🍟',
        short_desc: 'Fun snack arrangements',
        recommended_use: 'Great for birthdays, graduations, movie nights, and casual gifting.',
        suggested_config: {
          option_groups: [
            { name: 'Snack Brand', display_type: 'select', is_required: true },
            { name: 'Wrapping', display_type: 'select', is_required: true },
            { name: 'Ribbon', display_type: 'select', is_required: false },
            { name: 'Greeting Card', display_type: 'select', is_required: false },
          ],
          sizes: ['Small', 'Medium', 'Large'],
        },
        sort_order: 3,
      },
      {
        name: 'Chocolate Bouquet',
        slug: 'chocolate-bouquet',
        description: 'Decadent chocolate arrangements featuring premium chocolate brands and elegant packaging.',
        icon: '🍫',
        short_desc: 'Premium chocolate arrangements',
        recommended_use: 'Perfect for Valentine\'s Day, anniversaries, romantic gestures, and sweet surprises.',
        suggested_config: {
          option_groups: [
            { name: 'Chocolate Brand', display_type: 'select', is_required: true },
            { name: 'Wrapping', display_type: 'select', is_required: true },
            { name: 'Ribbon', display_type: 'select', is_required: false },
            { name: 'Greeting Card', display_type: 'select', is_required: false },
          ],
          sizes: ['Small', 'Medium', 'Large'],
        },
        sort_order: 4,
      },
      {
        name: 'Mixed Bouquet',
        slug: 'mixed-bouquet',
        description: 'Creative mixed arrangements combining flowers, snacks, money, and more in one gift.',
        icon: '🎁',
        short_desc: 'Mixed gift arrangements',
        recommended_use: 'Best for special occasions where you want to give a little bit of everything.',
        suggested_config: {
          option_groups: [
            { name: 'Bouquet Type', display_type: 'select', is_required: true },
            { name: 'Wrapping', display_type: 'select', is_required: true },
            { name: 'Ribbon', display_type: 'select', is_required: false },
            { name: 'Greeting Card', display_type: 'select', is_required: false },
          ],
          sizes: ['Medium', 'Large', 'Premium'],
        },
        sort_order: 5,
      },
      {
        name: 'Custom Product',
        slug: 'custom-product',
        description: 'Build your own unique creation from scratch. Full freedom to design any product.',
        icon: '✨',
        short_desc: 'Build your own creation',
        recommended_use: 'For vendors who want full creative control over their product configuration.',
        suggested_config: {
          option_groups: [],
          sizes: [],
        },
        sort_order: 6,
      },
    ].map(t => prisma.productTemplate.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    })),
  )

  console.log('Product templates seeded.\n')

  // ── Company Info ───────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════
  //  USERS & VENDORS
  // ═══════════════════════════════════════════════════════════════════════

  const vendorSeed = [
    // ── Photography ──────────────────────────────────────────────────────
    {
      email: 'lensa.abadi@vendor.com',
      full_name: 'Dimas Prayoga',
      business_name: 'Lensa Abadi Photography',
      category: 'Photography',
      location: 'Jakarta Selatan, DKI Jakarta',
      description: 'Kami adalah tim fotografer profesional yang telah berpengalaman lebih dari 8 tahun dalam mengabadikan momen pernikahan, pre-wedding, dan acara spesial lainnya. Dengan pendekatan candid dan artistik, setiap foto yang kami hasilkan bercerita tentang cinta dan kebahagiaan.',
      years_exp: 8,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/lensa.abadi.photo',
    },
    {
      email: 'cahaya.senja@vendor.com',
      full_name: 'Rina Wulandari',
      business_name: 'Cahaya Senja Visual',
      category: 'Photography',
      location: 'Bandung, Jawa Barat',
      description: 'Spesialis fotografi pernikahan dan gaya hidup dengan sentuhan sinematografis. Kami percaya setiap pasangan memiliki cerita unik yang layak diabadikan dengan cara terindah. Didukung peralatan full-frame dan editing profesional.',
      years_exp: 6,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/cahayasenja.visual',
    },
    // ── MUA ──────────────────────────────────────────────────────────────
    {
      email: 'glow.anastasia@vendor.com',
      full_name: 'Anastasia Putri',
      business_name: 'Glow by Anastasia',
      category: 'MUA',
      location: 'Jakarta Pusat, DKI Jakarta',
      description: 'Makeup artist profesional spesialis bridal, pesta, dan editorial. Dengan pengalaman 7 tahun dan sertifikasi internasional, saya menghadirkan riasan yang flawless dan tahan lama. Menggunakan produk premium seperti Huda Beauty, NARS, dan Charlotte Tilbury.',
      years_exp: 7,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/glow.by.anastasia',
    },
    {
      email: 'rias.pesona@vendor.com',
      full_name: 'Sari Dewi Lestari',
      business_name: 'Rias Pesona Nusantara',
      category: 'MUA',
      location: 'Yogyakarta, DI Yogyakarta',
      description: 'Menggabungkan keindahan riasan tradisional Nusantara dengan sentuhan modern. Spesialisasi pada riasan pengantin adat Jawa, Sunda, Bali, dan riasan modern. Setiap riasan dirancang untuk memperkuat kecantikan alami dan kepribadian klien.',
      years_exp: 10,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/riaspesona.nusantara',
    },
    // ── Bouquet Flowers ──────────────────────────────────────────────────
    {
      email: 'bloom.garden@vendor.com',
      full_name: 'Maya Indah Sari',
      business_name: 'Bloom Garden Florist',
      category: 'Bouquet Flowers',
      location: 'Jakarta Barat, DKI Jakarta',
      description: 'Florist premium yang menyediakan rangkaian bunga segar untuk berbagai acara: pernikahan, ulang tahun, wisuda, hingga acara korporat. Bunga-bunga kami didatangkan langsung dari petani pilihan di Bogor, Malang, dan Belanda. Setiap rangkaian dirancang oleh florist berpengalaman.',
      years_exp: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/bloomgarden.florist',
    },
    {
      email: 'fresh.petals@vendor.com',
      full_name: 'Nadia Kusuma',
      business_name: 'Fresh Petals Studio',
      category: 'Bouquet Flowers',
      location: 'Tangerang, Banten',
      description: 'Studio bunga yang menghadirkan keindahan alam dalam setiap rangkaian. Dari hand-bouquet harian hingga dekorasi bunga skala besar untuk acara. Kami mengutamakan kesegaran, kualitas, dan desain yang kekinian. Free delivery untuk area Tangerang & Jakarta.',
      years_exp: 4,
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      cover: 'https://images.unsplash.com/photo-1490750967868-88aa9116d967?w=1600&h=600&fit=crop',
      instagram: 'https://instagram.com/freshpetals.studio',
    },
  ]

  // ── Unsplash image pools ──────────────────────────────────────────────
  const photoPortfolioPics = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519933045053-c95e0501004d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464696899206-1016b7431a4c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&h=600&fit=crop',
  ]

  const muaPortfolioPics = [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485875437342-9b39470b3ef8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549236177-3d8e9b18eb02?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566218246426-f234337f3d74?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1554344728-77cf90d9ed26?w=800&h=600&fit=crop',
  ]

  const bouquetPics = [
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88aa9116d967?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1491147334572-6c867f5e3475?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582794543139-8ac9cb41f9a8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1559561853-084c0b137b7d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602872030210-0b024a6bbf34?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1567696153798-91191f9213b4?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=800&fit=crop',
  ]

  const celebrationLabels = ['wedding', 'graduation', 'birthday', 'engagement', 'anniversary', 'formal']

  function getLabel(): string {
    const count = Math.floor(Math.random() * 3) + 1
    const shuffled = [...celebrationLabels].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).join(',')
  }

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  CREATE VENDORS
  // ═══════════════════════════════════════════════════════════════════════
  console.log('Seeding vendors…')

  let userCounter = 2
  const createdVendors: any[] = []

  for (const vs of vendorSeed) {
    // Create user
    const user = await prisma.user.create({
      data: {
        id_user: userCounter,
        email: vs.email,
        password: 'vendor123',
        full_name: vs.full_name,
        phone: `0812${String(10000000 + Math.floor(Math.random() * 80000000)).padStart(8, '0')}`,
        status: 'active',
        is_active: true,
      },
    })

    // Assign Vendor role
    await prisma.user_Role.create({
      data: {
        email: vs.email,
        role_code: 'eUser-Vendor',
        user_created: 'SYSTEM',
      },
    })

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        id_user: user.id_user,
        vendor_code: `VND-${String(userCounter).padStart(3, '0')}`,
        business_name: vs.business_name,
        description: vs.description,
        category: vs.category,
        location: vs.location,
        years_exp: vs.years_exp,
        avatar_url: vs.avatar,
        instagram: vs.instagram,
        status: 'verified',
        verified_at: new Date('2025-01-01'),
      },
    })

    createdVendors.push({ ...vendor, avatar: vs.avatar, cover: vs.cover, instagram: vs.instagram })
    userCounter++
    console.log(`  ✓ ${vs.business_name} (${vs.category})`)
  }

  console.log('Vendors seeded.\n')

  // ═══════════════════════════════════════════════════════════════════════
  //  PACKAGES (Photography & MUA)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('Seeding packages…')

  const packageTemplates: Array<{
    vendorIdx: number
    name: string
    description: string
    price: number
    duration: string
    whatsIncluded: string
    extras: Array<{ name: string; description: string; price: number; icon: string }>
  }> = [
    // Photography packages
    {
      vendorIdx: 0,
      name: 'Silver',
      description: 'Paket dasar fotografi pernikahan untuk Anda yang mengingankan dokumentasi esensial tanpa ribet.',
      price: 3500000,
      duration: '4 Jam',
      whatsIncluded: '1 Fotografer, 200+ foto edit, Album 10x10 (20 halaman), Flashdisk, Preview 1x1 minggu',
      extras: [
        { name: 'Second Photographer', description: 'Fotografer tambahan', price: 750000, icon: 'fa-camera' },
        { name: 'Photo Booth', description: 'Sewa photobox + props', price: 500000, icon: 'fa-camera-retro' },
        { name: 'Cetak Tambahan', description: 'Cetak foto ukuran 4R per lembar', price: 5000, icon: 'fa-print' },
      ],
    },
    {
      vendorIdx: 0,
      name: 'Gold',
      description: 'Paket lengkap dengan pre-wedding dan dokumentasi penuh acara pernikahan Anda.',
      price: 7500000,
      duration: '8 Jam',
      whatsIncluded: '2 Fotografer, 400+ foto edit, Pre-wedding session (1 lokasi), Album 12x12 (30 halaman), Flashdisk eksklusif, Gallery online, Preview 1 minggu',
      extras: [
        { name: 'Drone Aerial', description: 'Video sinematik dari udara', price: 1500000, icon: 'fa-drone' },
        { name: 'Extra Album', description: 'Album tambahan untuk orang tua', price: 750000, icon: 'fa-book' },
        { name: 'Cetak Canvas', description: 'Cetak canvas 24x36', price: 350000, icon: 'fa-picture-o' },
      ],
    },
    {
      vendorIdx: 0,
      name: 'Platinum',
      description: 'Paket premium all-in-one dengan videografi, pre-wedding, dan fotografer terbaik kami.',
      price: 15000000,
      duration: '12 Jam (Full Day)',
      whatsIncluded: '3 Fotografer, 1 Videografer, 600+ foto edit, Video highlights 3-5 menit, Pre-wedding (2 lokasi, 2 outfit), Album 12x12 (40 halaman), Album 8x8 untuk orang tua, Gallery online, Flashdisk, Cetak 20 foto 4R',
      extras: [
        { name: 'Same Day Edit', description: 'Video highlights selesai di hari H', price: 3000000, icon: 'fa-film' },
        { name: 'Live Streaming', description: 'Siaran langsung akad nikah', price: 2000000, icon: 'fa-video-camera' },
        { name: 'Foto & Video Booth 360', description: 'Photo booth 360 derajat', price: 2500000, icon: 'fa-cube' },
      ],
    },
    {
      vendorIdx: 1,
      name: 'Basic Event',
      description: 'Paket fotografi dasar untuk acara ulang tahun, gathering, atau acara kecil.',
      price: 2500000,
      duration: '3 Jam',
      whatsIncluded: '1 Fotografer, 150+ foto edit, Flashdisk, Gallery online, Cetak 5 foto 4R',
      extras: [
        { name: 'Extra Jam', description: 'Tambahan jam shooting', price: 500000, icon: 'fa-clock-o' },
        { name: 'Cetak Polaroid', description: 'Cetak instan untuk tamu', price: 150000, icon: 'fa-camera' },
      ],
    },
    {
      vendorIdx: 1,
      name: 'Corporate',
      description: 'Paket fotografi profesional untuk event korporat, company gathering, dan annual dinner.',
      price: 5500000,
      duration: '6 Jam',
      whatsIncluded: '2 Fotografer, 300+ foto edit, Gallery online private, Flashdisk eksklusif, Cetak 10 foto 5R, Dokumentasi quick edit dalam 2 hari',
      extras: [
        { name: 'Live Streaming', description: 'Siaran langsung event', price: 2000000, icon: 'fa-video-camera' },
        { name: 'Photo Booth', description: 'Sewa photobox + props + print', price: 750000, icon: 'fa-camera-retro' },
      ],
    },
    {
      vendorIdx: 1,
      name: 'Cinematic Wedding',
      description: 'Paket fotografi wedding dengan gaya sinematografis dan artistic editing.',
      price: 12000000,
      duration: '10 Jam',
      whatsIncluded: '2 Fotografer, 1 Videografer, 500+ foto, Video cinematic 3-5 menit, Pre-wedding (1 lokasi), Album 12x12 (30 halaman), Gallery online, Flashdisk',
      extras: [
        { name: 'Drone', description: 'Aerial footage', price: 1500000, icon: 'fa-drone' },
        { name: 'Extra Album', description: 'Album tambahan', price: 750000, icon: 'fa-book' },
        { name: 'Cetak Kanvas Premium', description: 'Kanvas 30x40', price: 500000, icon: 'fa-picture-o' },
      ],
    },
    // MUA packages
    {
      vendorIdx: 2,
      name: 'Natural Glow',
      description: 'Riasan natural sehari-hari untuk wisuda, pesta, atau foto profil profesional.',
      price: 750000,
      duration: '1 Jam',
      whatsIncluded: 'Makeup natural, Touch-up kit, Setting spray, Konsultasi warna',
      extras: [
        { name: 'Hair Styling', description: 'Penataan rambut sederhana', price: 250000, icon: 'fa-scissors' },
        { name: 'Eyelash Extension', description: 'Pasang bulu mata premium', price: 100000, icon: 'fa-eye' },
      ],
    },
    {
      vendorIdx: 2,
      name: 'Semi-Glam',
      description: 'Riasan semi-glam untuk pesta ulang tahun, anniversary dinner, atau acara semi-formal.',
      price: 1500000,
      duration: '2 Jam',
      whatsIncluded: 'Makeup full coverage, False lashes, Contouring & highlighting, Hair styling, Touch-up kit',
      extras: [
        { name: 'Trial Session', description: 'Sesi coba riasan sebelum H-1', price: 500000, icon: 'fa-calendar-check-o' },
        { name: 'On-site Service', description: 'Rias di lokasi acara', price: 300000, icon: 'fa-map-marker' },
      ],
    },
    {
      vendorIdx: 2,
      name: 'Bridal Glam',
      description: 'Riasan pengantin lengkap dengan trial session dan aksesoris. Cocok untuk akad & resepsi.',
      price: 4000000,
      duration: '3 Jam (termasuk trial)',
      whatsIncluded: 'Trial session (1x), Makeup akad & resepsi, Hair styling 2 look, Aksesoris (tiara, veil, earring), Foundation premium, Setting spray, Touch-up kit, THR untuk MUA (1 orang)',
      extras: [
        { name: 'Extra MUA', description: 'Tambahan MUA untuk keluarga', price: 1500000, icon: 'fa-user-plus' },
        { name: 'Fake Eyelashes Premium', description: 'Bulu mata premium imported', price: 200000, icon: 'fa-eye' },
        { name: 'Hair Extension', description: 'Sambung rambut temporary', price: 750000, icon: 'fa-scissors' },
      ],
    },
    {
      vendorIdx: 2,
      name: 'Bridal Plus',
      description: 'Paket riasan pengantin super lengkap untuk akad, resepsi, dan sesi foto, plus rias ibu & pager ayu.',
      price: 7000000,
      duration: 'Full Day (termasuk trial)',
      whatsIncluded: 'Trial session (2x), Makeup akad & resepsi (2 look berbeda), Hair styling 3 look, Rias ibu (1 org), Rias pager ayu (1 org), Aksesoris premium, Foundation premium, Setting spray, Touch-up kit, THR untuk 2 MUA, FREE on-site service',
      extras: [
        { name: 'Rias Tambahan', description: 'Rias untuk tambahan 1 org', price: 750000, icon: 'fa-user-plus' },
        { name: 'Fotografer Makeup', description: 'Dokumentasi proses riasan', price: 500000, icon: 'fa-camera' },
      ],
    },
    {
      vendorIdx: 3,
      name: 'Traditional Basic',
      description: 'Riasan pengantin tradisional (Jawa/Sunda/Bali) dengan busana dan aksesoris adat.',
      price: 3000000,
      duration: '3 Jam',
      whatsIncluded: 'Makeup adat, Hair styling sesuai tradisi, Aksesoris adat, Konsultasi busana',
      extras: [
        { name: 'Sewa Kebaya', description: 'Sewa kebaya + batik', price: 500000, icon: 'fa-female' },
        { name: 'Extra Hair Ornament', description: 'Tambahan ornamen rambut', price: 200000, icon: 'fa-star' },
      ],
    },
    {
      vendorIdx: 3,
      name: 'Modern Nusantara',
      description: 'Perpaduan riasan tradisional与现代 yang elegan untuk pengantin masa kini.',
      price: 5000000,
      duration: '4 Jam (termasuk trial)',
      whatsIncluded: 'Trial session (1x), Makeup akad & resepsi, Hair styling 2 look, Aksesoris adat + modern, Rias ibu (1 org), THR 1 MUA',
      extras: [
        { name: 'Rias Tambahan', description: 'Rias untuk 1 org tambahan', price: 750000, icon: 'fa-user-plus' },
        { name: 'Sewa Kebaya Premium', description: 'Sewa kebaya + aksesoris', price: 1000000, icon: 'fa-female' },
        { name: 'Fotografer', description: 'Dokumentasi riasan', price: 500000, icon: 'fa-camera' },
      ],
    },
    {
      vendorIdx: 3,
      name: 'Paket Lengkap Adat & Resepsi',
      description: 'Paket all-in-one untuk pernikahan adat lengkap dari akad hingga resepsi.',
      price: 10000000,
      duration: 'Full Day',
      whatsIncluded: 'Trial session (2x), Makeup akad, Makeup resepsi (2 look), Hair styling 3 look, Rias ibu (2 org), Rias pager ayu/pager putri (2 org), Aksesoris adat lengkap, THR untuk 3 MUA, FREE on-site, FREE konsultasi busana',
      extras: [
        { name: 'Makeup Tambahan', description: 'Rias untuk tambahan 1 org', price: 600000, icon: 'fa-user-plus' },
        { name: 'Sewa Busana Adat', description: 'Paket sewa busana adat lengkap', price: 2500000, icon: 'fa-suitcase' },
      ],
    },
  ]

  const categories = await prisma.category.findMany()
  const photoCat = categories.find(c => c.category_name === 'Photography')!
  const muaCat = categories.find(c => c.category_name === 'MUA')!

  for (const pt of packageTemplates) {
    const vendor = createdVendors[pt.vendorIdx]
    const cat = vendor.category === 'Photography' ? photoCat : muaCat

    const pkg = await prisma.package.create({
      data: {
        id_vendor: vendor.id_vendor,
        id_category: cat.id_category,
        name: pt.name,
        description: pt.description,
        price: rupiah(pt.price),
        duration: pt.duration,
        whats_included: pt.whatsIncluded,
        status: 'active',
      },
    })

    for (const ex of pt.extras) {
      await prisma.packageExtra.create({
        data: {
          id_package: pkg.id_package,
          name: ex.name,
          description: ex.description,
          price: rupiah(ex.price),
          icon: ex.icon,
          status: 'active',
        },
      })
    }
  }

  console.log('Packages seeded.\n')

  // ═══════════════════════════════════════════════════════════════════════
  //  PORTFOLIOS (Photography & MUA)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('Seeding portfolios…')

  const photoPortfolioItems = [
    { title: 'Pernikahan Rina & Bagas', description: 'Dokumentasi pernikahan adat Jawa di Yogyakarta. Mengusung tema hijau emas yang elegan. Akad di pagi hari dilanjut resepsi di malam hari.', cover: photoPortfolioPics[0], labels: 'wedding', pics: photoPortfolioPics.slice(0, 4) },
    { title: 'Pre-wedding Dina & Raka', description: 'Sesi pre-wedding di Bandung dengan konsep vintage Eropa. Mengambil lokasi di bangunan kolonial dan kebun teh.', cover: photoPortfolioPics[4], labels: 'wedding', pics: photoPortfolioPics.slice(4, 8) },
    { title: 'Graduation Shoot — Alumni UI', description: 'Sesi foto wisuda di Universitas Indonesia. Mengabadikan momen kebahagiaan setelah 4 tahun perjuangan.', cover: photoPortfolioPics[8], labels: 'graduation', pics: photoPortfolioPics.slice(8, 11) },
    { title: 'Anniversary Session — 10 Tahun', description: 'Sesi foto anniversary untuk pasangan yang merayakan 10 tahun pernikahan. Lokasi di Pantai Indah Kapuk.', cover: photoPortfolioPics[3], labels: 'anniversary', pics: [photoPortfolioPics[3], photoPortfolioPics[6], photoPortfolioPics[9]] },
    { title: 'Birthday Party — Sarah 17th', description: 'Dokumentasi pesta ulang tahun ke-17 dengan tema fairytale garden. Indoor-outdoor party di Jakarta.', cover: photoPortfolioPics[5], labels: 'birthday', pics: [photoPortfolioPics[5], photoPortfolioPics[7], photoPortfolioPics[10]] },
    { title: 'Corporate Event — Annual Gathering', description: 'Fotografi event gathering perusahaan tech di Jakarta Convention Center. Mencakup sesi keynote, booth, dan gala dinner.', cover: photoPortfolioPics[1], labels: 'formal', pics: [photoPortfolioPics[1], photoPortfolioPics[2], photoPortfolioPics[11]] },
  ]

  const muaPortfolioItems = [
    { title: 'Bridal Look — Evita', description: 'Riasan pengantin dengan konsep soft glam. Menggunakan palet warna rose gold dengan aksen bunga segar di sanggul.', cover: muaPortfolioPics[0], labels: 'wedding', pics: muaPortfolioPics.slice(0, 3) },
    { title: 'Editorial Makeup — Fashion Week', description: 'Riasan editorial untuk Jakarta Fashion Week. Konsep avant-garde dengan warna bold dan aksesoris unik.', cover: muaPortfolioPics[3], labels: 'formal', pics: muaPortfolioPics.slice(3, 6) },
    { title: 'Graduation Glam — Dinda', description: 'Riasan natural glam untuk foto wisuda dan pesta kelulusan. Flawless base dengan soft contouring.', cover: muaPortfolioPics[6], labels: 'graduation', pics: [muaPortfolioPics[6], muaPortfolioPics[7]] },
    { title: 'Engagement Look — Maya & Adit', description: 'Riasan engagement dengan gaya fresh dan natural. Tampil anggun tanpa terkesan berat.', cover: muaPortfolioPics[8], labels: 'engagement', pics: [muaPortfolioPics[8], muaPortfolioPics[9]] },
    { title: 'Bridal Tradisional — Jawa', description: 'Riasan pengantin adat Jawa lengkap dengan paes, sanggul, dan aksesoris emas. Bekerja sama dengan sinden.', cover: muaPortfolioPics[1], labels: 'wedding', pics: [muaPortfolioPics[1], muaPortfolioPics[4], muaPortfolioPics[5]] },
    { title: 'Birthday Party Look — Keyla 21st', description: 'Riasan party dengan gliter dan bold lip untuk ulang tahun ke-21 di klub malam Jakarta.', cover: muaPortfolioPics[2], labels: 'birthday', pics: [muaPortfolioPics[2], muaPortfolioPics[7], muaPortfolioPics[9]] },
  ]

  // Helper to map vendor index to portfolio items
  const photoVendorIndices = [0, 1] // Lensa Abadi = idx0, Cahaya Senja = idx1
  const muaVendorIndices = [2, 3]

  const portfolioMap: Array<{ vendorIdx: number; items: typeof photoPortfolioItems }> = [
    { vendorIdx: 0, items: photoPortfolioItems.slice(0, 3) },
    { vendorIdx: 1, items: photoPortfolioItems.slice(3, 6) },
    { vendorIdx: 2, items: muaPortfolioItems.slice(0, 3) },
    { vendorIdx: 3, items: muaPortfolioItems.slice(3, 6) },
  ]

  for (const pm of portfolioMap) {
    const vendor = createdVendors[pm.vendorIdx]
    for (const item of pm.items) {
      const portfolio = await prisma.portfolio.create({
        data: {
          id_vendor: vendor.id_vendor,
          title: item.title,
          code: `PF-${String(vendor.id_vendor)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: item.description,
          cover_url: item.cover,
          label: item.labels,
          status: 'active',
          sort_order: 0,
        },
      })

      for (let pi = 0; pi < item.pics.length; pi++) {
        await prisma.portfolioImage.create({
          data: {
            id_portfolio: portfolio.id_portfolio,
            image_url: item.pics[pi],
            caption: `${item.title} — Foto ${pi + 1}`,
            sort_order: pi,
          },
        })
      }
    }
  }

  console.log('Portfolios seeded.\n')

  // ═══════════════════════════════════════════════════════════════════════
  //  PRODUCTS (Bouquet Flowers)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('Seeding products…')

  const bouquetVendorIndices = [4, 5] // Bloom Garden, Fresh Petals
  const bouquetTypes = await prisma.productType.findMany()
  const bouquetSizes = await prisma.productSize.findMany()
  const bouquetOccasions = await prisma.productOccasion.findMany()

  const productTemplates = [
    // Bloom Garden (idx 4)
    {
      vendorIdx: 4,
      name: 'Bridal Rose Bouquet',
      description: 'Buket pengantin premium dengan 24 tangkai mawar merah Belanda, dibalut lace dan satin putih. Cocok untuk akad dan resepsi.',
      price: 850000,
      stock: 15,
      occasionSlug: 'wedding',
      typeSlug: 'bridal-bouquet',
      sizeSlug: 'medium',
      estimatedDelivery: '1-2 hari',
      deliveryInfo: 'Free delivery Jakarta, COD tersedia. Pengiriman menggunakan kendaraan berpendingin untuk menjaga kesegaran.',
      images: [bouquetPics[0], bouquetPics[1], bouquetPics[2]],
      variants: [
        { name: '24 Tangkai', priceAdj: 0, stock: 10 },
        { name: '48 Tangkai', priceAdj: 750000, stock: 5 },
      ],
      addons: [
        { name: 'Kartu Ucapan Premium', price: 35000, description: 'Kartu ucapan custom dengan pita' },
        { name: 'Bubble Wrap Protection', price: 25000, description: 'Lapisan pelindung ekstra' },
        { name: 'Same Day Delivery', price: 100000, description: 'Pengiriman hari yang sama (Jakarta)' },
      ],
    },
    {
      vendorIdx: 4,
      name: 'Sunshine Hand Bouquet',
      description: 'Rangkaian bunga matahari segar dipadukan dengan baby breath dan eucalyptus. Memberikan kesan ceria dan hangat.',
      price: 350000,
      stock: 25,
      occasionSlug: 'birthday',
      typeSlug: 'hand-bouquet',
      sizeSlug: 'small',
      estimatedDelivery: '1-2 hari',
      deliveryInfo: 'Free delivery Jakarta & Tangerang.',
      images: [bouquetPics[3], bouquetPics[4], bouquetPics[5]],
      variants: [
        { name: 'Small', priceAdj: 0, stock: 20 },
        { name: 'Medium', priceAdj: 150000, stock: 10 },
      ],
      addons: [
        { name: 'Kartu Ucapan', price: 20000, description: 'Kartu ucapan standar' },
        { name: 'Balon Latex', price: 50000, description: 'Balon helium + pita' },
      ],
    },
    {
      vendorIdx: 4,
      name: 'Elegant Orchid Table Arrangement',
      description: 'Rangkaian meja dengan anggrek bulan ungu dan putih dalam vas keramik premium. Cocok untuk dekorasi acara formal dan meja resepsi.',
      price: 1200000,
      stock: 10,
      occasionSlug: 'formal',
      typeSlug: 'table-arrangement',
      sizeSlug: 'large',
      estimatedDelivery: '2-3 hari',
      deliveryInfo: 'Pengiriman khusus area Jakarta. Konsultasi dekorasi via WA.',
      images: [bouquetPics[6], bouquetPics[7], bouquetPics[8]],
      variants: [],
      addons: [
        { name: 'Vas Pengganti', price: 200000, description: 'Vas kristal premium' },
        { name: 'Lilin Aromaterapi', price: 75000, description: 'Lilin soy wax lavender' },
      ],
    },
    {
      vendorIdx: 4,
      name: 'Graduation Flower Box',
      description: 'Flower box bunga segar dengan komposisi mawar, krisan, dan lily. Dilengkapi pita kuning emas. Hadiah wisuda yang sempurna.',
      price: 450000,
      stock: 30,
      occasionSlug: 'graduation',
      typeSlug: 'flower-box',
      sizeSlug: 'medium',
      estimatedDelivery: '1-2 hari',
      deliveryInfo: 'Free delivery Jabodetabek. Tersedia wrapping eksklusif.',
      images: [bouquetPics[9], bouquetPics[10], bouquetPics[11]],
      variants: [
        { name: 'Box Kecil', priceAdj: 0, stock: 20 },
        { name: 'Box Besar', priceAdj: 250000, stock: 10 },
      ],
      addons: [
        { name: 'Pita Custom', price: 25000, description: 'Pita dengan inisial nama' },
        { name: 'Toples Kaca', price: 100000, description: 'Box kaca premium' },
      ],
    },
    {
      vendorIdx: 4,
      name: 'Romantic Corsage',
      description: 'Corsage mawar putih dan baby breath untuk pengantin pria dan keluarga. Set terdiri dari 4 buah.',
      price: 200000,
      stock: 40,
      occasionSlug: 'wedding',
      typeSlug: 'corsage',
      sizeSlug: 'small',
      estimatedDelivery: '1 hari',
      deliveryInfo: 'Tersedia pengiriman kilat Jakarta.',
      images: [bouquetPics[12], bouquetPics[13]],
      variants: [
        { name: 'Set 4 pcs', priceAdj: 0, stock: 30 },
        { name: 'Set 8 pcs', priceAdj: 180000, stock: 15 },
      ],
      addons: [
        { name: 'Box Eksklusif', price: 50000, description: 'Box velvet + pita' },
      ],
    },
    // Fresh Petals (idx 5)
    {
      vendorIdx: 5,
      name: 'Pastel Dream Hand Bouquet',
      description: 'Buket tangan dengan bunga peony, ranunculus, dan lisianthus dalam nuansa pastel pink dan krem. Cocok untuk sesi foto maupun hadiah.',
      price: 280000,
      stock: 20,
      occasionSlug: 'birthday',
      typeSlug: 'hand-bouquet',
      sizeSlug: 'small',
      estimatedDelivery: '1-2 hari',
      deliveryInfo: 'Free delivery Tangerang & Jakarta Barat. GRATIS kartu ucapan.',
      images: [bouquetPics[14], bouquetPics[15], bouquetPics[0]],
      variants: [
        { name: 'Small', priceAdj: 0, stock: 15 },
        { name: 'Large', priceAdj: 170000, stock: 8 },
      ],
      addons: [
        { name: 'Chocolate Gift', price: 75000, description: 'Cokelat premium box' },
        { name: 'Boneka Teddy Bear', price: 100000, description: 'Boneka 30cm' },
      ],
    },
    {
      vendorIdx: 5,
      name: 'White Lily Standing Wreath',
      description: 'Karangan bunga berdiri dengan lily putih, mawar putih, dan daun palem. Cocok untuk ucapan duka cita atau dekorasi acara.',
      price: 1800000,
      stock: 8,
      occasionSlug: 'formal',
      typeSlug: 'standing-wreath',
      sizeSlug: 'extra-large',
      estimatedDelivery: '2-3 hari',
      deliveryInfo: 'Pengiriman menggunakan mobil box. Gratis ongkir Jakarta & Tangerang.',
      images: [bouquetPics[1], bouquetPics[2], bouquetPics[3]],
      variants: [],
      addons: [
        { name: 'Pita Ucapan', price: 50000, description: 'Pita ukuran besar + teks custom' },
      ],
    },
    {
      vendorIdx: 5,
      name: 'Classic Red Rose Bouquet',
      description: 'Buket mawar merah klasik 12 tangkai dengan aksen eucalyptus dan baby breath. Hadiah romantis yang timeless.',
      price: 380000,
      stock: 35,
      occasionSlug: 'anniversary',
      typeSlug: 'hand-bouquet',
      sizeSlug: 'medium',
      estimatedDelivery: '1 hari',
      deliveryInfo: 'Free delivery + gratis kartu ucapan. Tersedia pengiriman tengah malam.',
      images: [bouquetPics[4], bouquetPics[5], bouquetPics[6]],
      variants: [
        { name: '12 Tangkai', priceAdj: 0, stock: 25 },
        { name: '24 Tangkai', priceAdj: 350000, stock: 10 },
        { name: '99 Tangkai', priceAdj: 2500000, stock: 2 },
      ],
      addons: [
        { name: 'Kartu Ucapan Premium', price: 35000, description: 'Kartu custom + amplop' },
        { name: 'Cokelat Belgia', price: 150000, description: 'Cokelat imported box' },
        { name: 'Balon Hati', price: 75000, description: 'Balon foil heart shape' },
      ],
    },
    {
      vendorIdx: 5,
      name: 'Enchanted Engagement Box',
      description: 'Flower box eksklusif berisi 24 mawar merah, dikelilingi baby breath dan LED string light. Kado lamaran yang sempurna.',
      price: 950000,
      stock: 12,
      occasionSlug: 'engagement',
      typeSlug: 'flower-box',
      sizeSlug: 'large',
      estimatedDelivery: '2-3 hari',
      deliveryInfo: 'Pengiriman khusus area Jabodetabek. Dilengkapi surat ucapan personal.',
      images: [bouquetPics[7], bouquetPics[8], bouquetPics[9]],
      variants: [
        { name: 'Box Premium', priceAdj: 0, stock: 8 },
        { name: 'Box Deluxe + Cincin Box', priceAdj: 400000, stock: 4 },
      ],
      addons: [
        { name: 'LED String Light', price: 50000, description: 'Tambahan lampu LED' },
        { name: 'Mini Bouquet Tambahan', price: 120000, description: 'Bouquet kecil tambahan' },
      ],
    },
    {
      vendorIdx: 5,
      name: 'Tropical Table Centerpiece',
      description: 'Rangkaian meja tropis dengan monsterra, anthurium, dan heliconia. Cocok untuk dekorasi acara outdoor dan resort.',
      price: 650000,
      stock: 15,
      occasionSlug: 'formal',
      typeSlug: 'table-arrangement',
      sizeSlug: 'medium',
      estimatedDelivery: '2-3 hari',
      deliveryInfo: 'Free delivery area Tangerang & Jakarta. Konsultasi gratis via WhatsApp.',
      images: [bouquetPics[10], bouquetPics[11], bouquetPics[12]],
      variants: [],
      addons: [
        { name: 'Tambahan Bunga Segar', price: 200000, description: 'Tambahan 5 tangkai' },
        { name: 'Vase Rental', price: 150000, description: 'Sewa vas keramik' },
      ],
    },
  ]

  const productCategory = categories.find(c => c.category_name === 'Bouquet Flowers')!

  for (const pt of productTemplates) {
    const vendor = createdVendors[pt.vendorIdx]
    const occasion = bouquetOccasions.find(o => o.slug === pt.occasionSlug)
    const type = bouquetTypes.find(t => t.slug === pt.typeSlug)
    const size = bouquetSizes.find(s => s.slug === pt.sizeSlug)

    const product = await prisma.product.create({
      data: {
        id_vendor: vendor.id_vendor,
        id_occasion: occasion?.id_occasion || null,
        type_name: type?.name || null,
        size_name: size?.name || null,
        name: pt.name,
        description: pt.description,
        price: rupiah(pt.price),
        stock: pt.stock,
        estimated_delivery: pt.estimatedDelivery,
        delivery_info: pt.deliveryInfo,
        status: 'active',
      },
    })

    // Product images
    for (let i = 0; i < pt.images.length; i++) {
      await prisma.productImage.create({
        data: {
          id_product: product.id_product,
          image_url: pt.images[i],
          caption: `${pt.name} — Foto ${i + 1}`,
          sort_order: i,
        },
      })
    }

    // Variants
    for (const v of pt.variants) {
      await prisma.productVariant.create({
        data: {
          id_product: product.id_product,
          name: v.name,
          price_adjust: rupiah(v.priceAdj),
          stock: v.stock,
          status: 'active',
        },
      })
    }

    // Add-ons
    for (const a of pt.addons) {
      await prisma.productAddon.create({
        data: {
          id_product: product.id_product,
          name: a.name,
          price: rupiah(a.price),
          description: a.description,
          status: 'active',
        },
      })
    }
  }

  console.log('Products seeded.\n')

  // ═══════════════════════════════════════════════════════════════════════
  //  REVIEWS
  // ═══════════════════════════════════════════════════════════════════════
  console.log('Seeding reviews…')

  const reviewTemplates = [
    { vendorIdx: 0, rating: 5, comment: 'Hasil fotonya luar biasa! Semua momen terabadikan dengan sempurna. Timnya profesional dan sangat ramah. Highly recommended untuk wedding!' },
    { vendorIdx: 0, rating: 4, comment: 'Kualitas foto bagus, editing sesuai request. Sayangnya agak telat 30 menit pas acara. Tapi overall puas.' },
    { vendorIdx: 0, rating: 5, comment: 'Album pernikahan kami jadi seperti majalah! Setiap foto punya cerita. Makasih Lensa Abadi!' },
    { vendorIdx: 1, rating: 5, comment: 'Fotografer event keren banget! Cepat, rapi, dan hasil fotonya aesthetic. Pasti pesan lagi untuk acara kantor berikutnya.' },
    { vendorIdx: 1, rating: 4, comment: 'Dokumentasi gathering perusahaan sangat baik. Foto candidnya natural. Edit cepat dalam 2 hari.' },
    { vendorIdx: 2, rating: 5, comment: 'Makeupnya flawless! Tahan dari pagi sampai malam tanpa touch-up. Anastasia benar-benar ahli. Makasih ya!' },
    { vendorIdx: 2, rating: 5, comment: 'Sudah 3x pakai Glow by Anastasia untuk berbagai acara. Never disappoint! Glowing natural, recommended banget.' },
    { vendorIdx: 2, rating: 4, comment: 'Riasannya bagus, cuma sayang trial sessionnya terpisah lokasi. Tapi hasil akhirnya memuaskan.' },
    { vendorIdx: 3, rating: 5, comment: 'Riasan adat Jawanya sangat detail! Saya dapat banyak pujian dari tamu. Sari benar-benar mengerti tradisi.' },
    { vendorIdx: 3, rating: 5, comment: 'Makeup traditional modernnya pas banget. Tidak menor tapi tetap terlihat anggun. Saya suka!' },
  ]

  // Simple customer seeding for reviews
  const custUsers: any[] = []
  const custNames = ['Budi Santoso', 'Siti Nurhaliza', 'Ahmad Fauzi', 'Dewi Lestari', 'Rudi Hartono', 'Mega Putri', 'Agus Wijaya', 'Rina Mariana', 'Hendra Gunawan', 'Fitri Handayani']
  for (let i = 0; i < custNames.length; i++) {
    const cu = await prisma.user.create({
      data: {
        id_user: userCounter,
        email: `customer${userCounter}@email.com`,
        password: 'customer123',
        full_name: custNames[i],
        phone: `0813${String(70000000 + Math.floor(Math.random() * 20000000)).padStart(8, '0')}`,
        status: 'active',
        is_active: true,
      },
    })
    custUsers.push(cu)
    userCounter++
  }

  // Create bookings with reviewed status for the reviews (minimum: 1 booking per review)
  for (let ri = 0; ri < reviewTemplates.length; ri++) {
    const rt = reviewTemplates[ri]
    const vendor = createdVendors[rt.vendorIdx]
    const customer = custUsers[ri]

    // Create a dummy booking so review can reference it
    const booking = await prisma.booking.create({
      data: {
        id_user: customer.id_user,
        event_date: randomDate(new Date('2025-03-01'), new Date('2025-06-01')),
        event_location: vendor.location || 'Jakarta',
        total_price: rupiah(500000 + Math.floor(Math.random() * 5000000)),
        dp_amount: rupiah(500000),
        status: 'completed',
        notes: 'Booking from seed data',
      },
    })

    await prisma.review.create({
      data: {
        id_booking: booking.id_booking,
        id_user: customer.id_user,
        id_vendor: vendor.id_vendor,
        rating: rt.rating,
        comment: rt.comment,
        status: 'active',
      },
    })
  }

  console.log('Reviews seeded.\n')

  // ═══════════════════════════════════════════════════════════════════════
  //  DONE
  // ═══════════════════════════════════════════════════════════════════════
  console.log('=== SEED COMPLETED ===')
  console.log(`  → ${createdVendors.length} vendors (verified)`)
  console.log(`  → Packages & portfolios for Photography & MUA vendors`)
  console.log(`  → Bouquet products with variants, addons & images`)
  console.log(`  → ${reviewTemplates.length} reviews`)
  console.log(`\n📧 Login credentials:`)
  console.log(`  Super Admin  → rivanapta53@gmail.com / existing password`)
  console.log(`  All vendors  → <email> / vendor123`)
  console.log(`  Customers    → customer2@email.com / customer123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
