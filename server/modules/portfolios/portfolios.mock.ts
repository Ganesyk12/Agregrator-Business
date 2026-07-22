import { Router } from 'express'
import type { Request, Response } from 'express'
import type { Portfolio } from './portfolios.types'

const pImg = (i: number) => {
  const seeds = [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360, 375, 390]
  const seed = seeds[i % seeds.length]
  return `https://picsum.photos/seed/${seed}/800/600`
}

const vendors = [
  { id_vendor: 1, business_name: 'Elsa Wedding Studio', category: 'Photography', location: 'Jakarta Selatan', description: 'Wedding & event photography specialist with over 8 years of experience capturing beautiful moments across Indonesia.', starting_price: 5000000, years_exp: 8, status: 'verified', average_rating: 4.8, _count: { portfolios: 3, reviews: 3 } },
  { id_vendor: 2, business_name: 'LensPro Photography', category: 'Videography', location: 'Bandung', description: 'Professional videography and cinematography for weddings, corporate events, and brand campaigns.', starting_price: 3500000, years_exp: 5, status: 'verified', average_rating: 4.5, _count: { portfolios: 3, reviews: 2 } },
  { id_vendor: 3, business_name: 'Rara Makeup Artistry', category: 'MUA', location: 'Jakarta Pusat', description: 'Professional makeup artist for bridal, graduation, and special occasions.', starting_price: 1500000, years_exp: 6, status: 'verified', average_rating: 4.9, _count: { portfolios: 3, reviews: 2 } },
  { id_vendor: 4, business_name: 'LensAce Photography', category: 'Photography', location: 'Tangerang', description: 'Creative photography studio specializing in engagement, pre-wedding, and portrait sessions with artistic flair.', starting_price: 3500000, years_exp: 4, status: 'verified', average_rating: 4.6, _count: { portfolios: 2, reviews: 1 } },
  { id_vendor: 5, business_name: 'Golden Hour Studio', category: 'Photography', location: 'Jakarta Barat', description: 'Specializing in golden hour and natural light photography for weddings, family, and personal branding.', starting_price: 4500000, years_exp: 7, status: 'verified', average_rating: 4.7, _count: { portfolios: 4, reviews: 2 } },
  { id_vendor: 6, business_name: 'Glamour Touch MUA', category: 'MUA', location: 'Jakarta Utara', description: 'Luxury makeup artistry for bridal, editorial, and special events. Certified by top international makeup academies.', starting_price: 2000000, years_exp: 5, status: 'verified', average_rating: 4.7, _count: { portfolios: 2, reviews: 1 } },
  { id_vendor: 7, business_name: 'Beauty by Sari', category: 'MUA', location: 'Depok', description: 'Expert makeup artist focusing on natural glam and traditional Indonesian bridal looks with modern touches.', starting_price: 1200000, years_exp: 4, status: 'verified', average_rating: 4.6, _count: { portfolios: 3, reviews: 2 } },
  { id_vendor: 8, business_name: 'Cinematic Dreams', category: 'Videography', location: 'Jakarta Selatan', description: 'High-end cinematic wedding and event videography. Award-winning team with international portfolio.', starting_price: 6000000, years_exp: 10, status: 'verified', average_rating: 4.9, _count: { portfolios: 5, reviews: 3 } },
  { id_vendor: 9, business_name: 'Motion Master Studio', category: 'Videography', location: 'Bekasi', description: 'Creative video production for weddings, corporate events, and brand storytelling. Fast turnaround guaranteed.', starting_price: 2800000, years_exp: 3, status: 'verified', average_rating: 4.4, _count: { portfolios: 2, reviews: 1 } },
]

const vendorExtras = [
  { id: 'extra-photographer', name: 'Extra Photographer', price: 500000, category: 'Photography', icon: '📷' },
  { id: 'drone-photo', name: 'Drone', price: 750000, category: 'Photography', icon: '🛸' },
  { id: 'printed-album', name: 'Printed Album', price: 350000, category: 'Photography', icon: '📔' },
  { id: 'express-editing', name: 'Express Editing', price: 400000, category: 'Photography', icon: '⚡' },
  { id: 'live-streaming', name: 'Live Streaming', price: 1000000, category: 'Photography', icon: '📺' },
  { id: 'hairdo', name: 'Hairdo', price: 300000, category: 'MUA', icon: '💇' },
  { id: 'nail-art', name: 'Nail Art', price: 200000, category: 'MUA', icon: '💅' },
  { id: 'hijab-styling', name: 'Hijab Styling', price: 250000, category: 'MUA', icon: '🧕' },
  { id: 'touch-up', name: 'Touch Up During Event', price: 500000, category: 'MUA', icon: '✨' },
  { id: 'extra-camera', name: 'Extra Camera', price: 600000, category: 'Videography', icon: '🎥' },
  { id: 'drone-video', name: 'Drone', price: 750000, category: 'Videography', icon: '🛸' },
  { id: 'highlight-reel', name: 'Highlight Reel', price: 500000, category: 'Videography', icon: '🎬' },
  { id: 'live-stream-vid', name: 'Live Streaming', price: 1000000, category: 'Videography', icon: '📺' },
]

const portfolioData: Portfolio[] = [
  {
    id_portfolio: 1, id_vendor: 1,
    title: 'Akbar & Sarah Wedding', code: 'PRT-0001', category: 'Wedding',
    description: 'A beautiful wedding project captured by our talented team. Akbar & Sarah wedding was a memorable event filled with joy and laughter at the Grand Ballroom.',
    cover_url: pImg(0), created_at: new Date('2025-01-15'),
    vendor: vendors[0],
    images: [
      { id_image: 1, id_portfolio: 1, image_url: pImg(1), caption: 'First look', sort_order: 0, created_at: new Date() },
      { id_image: 2, id_portfolio: 1, image_url: pImg(2), caption: 'Ceremony moment', sort_order: 1, created_at: new Date() },
      { id_image: 3, id_portfolio: 1, image_url: pImg(3), caption: 'Reception decoration', sort_order: 2, created_at: new Date() },
      { id_image: 4, id_portfolio: 1, image_url: pImg(4), caption: 'Couple portrait', sort_order: 3, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 2, id_vendor: 1,
    title: 'Rina Graduation Photos', code: 'PRT-0002', category: 'Graduation',
    description: 'Rina celebrated her graduation with a stunning photoshoot at the university campus.',
    cover_url: pImg(5), created_at: new Date('2025-02-20'),
    vendor: vendors[0],
    images: [
      { id_image: 5, id_portfolio: 2, image_url: pImg(6), caption: 'Campus shoot', sort_order: 0, created_at: new Date() },
      { id_image: 6, id_portfolio: 2, image_url: pImg(7), caption: 'With family', sort_order: 1, created_at: new Date() },
      { id_image: 7, id_portfolio: 2, image_url: pImg(8), caption: 'Formal portrait', sort_order: 2, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 3, id_vendor: 1,
    title: 'Budi Family Session', code: 'PRT-0003', category: 'Family',
    description: 'A heartwarming family photoshoot at the park capturing genuine interactions.',
    cover_url: pImg(9), created_at: new Date('2025-03-10'),
    vendor: vendors[0],
    images: [
      { id_image: 8, id_portfolio: 3, image_url: pImg(10), caption: 'Family portrait', sort_order: 0, created_at: new Date() },
      { id_image: 9, id_portfolio: 3, image_url: pImg(11), caption: 'Kids playing', sort_order: 1, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 4, id_vendor: 2,
    title: 'TechCorp Annual Event', code: 'PRT-0004', category: 'Corporate',
    description: 'Full coverage of TechCorp annual company event with multi-camera setup.',
    cover_url: pImg(12), created_at: new Date('2025-01-25'),
    vendor: vendors[1],
    images: [
      { id_image: 10, id_portfolio: 4, image_url: pImg(13), caption: 'Keynote stage', sort_order: 0, created_at: new Date() },
      { id_image: 11, id_portfolio: 4, image_url: pImg(14), caption: 'Panel discussion', sort_order: 1, created_at: new Date() },
      { id_image: 12, id_portfolio: 4, image_url: pImg(15), caption: 'Networking session', sort_order: 2, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 5, id_vendor: 2,
    title: 'Dian & Adi Wedding Video', code: 'PRT-0005', category: 'Wedding',
    description: 'Cinematic wedding video production from morning preparation to after-party.',
    cover_url: pImg(16), created_at: new Date('2025-03-05'),
    vendor: vendors[1],
    images: [
      { id_image: 13, id_portfolio: 5, image_url: pImg(17), caption: 'Preparation', sort_order: 0, created_at: new Date() },
      { id_image: 14, id_portfolio: 5, image_url: pImg(18), caption: 'Ceremony', sort_order: 1, created_at: new Date() },
      { id_image: 15, id_portfolio: 5, image_url: pImg(19), caption: 'Reception', sort_order: 2, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 6, id_vendor: 2,
    title: 'Product Launch Campaign', code: 'PRT-0006', category: 'Product',
    description: 'Commercial video production for a new product launch campaign.',
    cover_url: pImg(20), created_at: new Date('2025-04-12'),
    vendor: vendors[1],
    images: [
      { id_image: 16, id_portfolio: 6, image_url: pImg(0), caption: 'Product showcase', sort_order: 0, created_at: new Date() },
      { id_image: 17, id_portfolio: 6, image_url: pImg(1), caption: 'Behind the scenes', sort_order: 1, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 7, id_vendor: 3,
    title: 'Sari Bridal Makeover', code: 'PRT-0007', category: 'Wedding',
    description: 'Complete bridal makeup transformation with traditional Balinese wedding look.',
    cover_url: pImg(2), created_at: new Date('2025-02-14'),
    vendor: vendors[2],
    images: [
      { id_image: 18, id_portfolio: 7, image_url: pImg(3), caption: 'Bridal look', sort_order: 0, created_at: new Date() },
      { id_image: 19, id_portfolio: 7, image_url: pImg(4), caption: 'Close up', sort_order: 1, created_at: new Date() },
      { id_image: 20, id_portfolio: 7, image_url: pImg(5), caption: 'Accessory detail', sort_order: 2, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 8, id_vendor: 3,
    title: 'Dita Graduation Glam', code: 'PRT-0008', category: 'Graduation',
    description: 'Graduation makeup look with natural glam style and soft neutral tones.',
    cover_url: pImg(6), created_at: new Date('2025-03-22'),
    vendor: vendors[2],
    images: [
      { id_image: 21, id_portfolio: 8, image_url: pImg(7), caption: 'Final look', sort_order: 0, created_at: new Date() },
      { id_image: 22, id_portfolio: 8, image_url: pImg(8), caption: 'Makeup process', sort_order: 1, created_at: new Date() },
    ],
  },
  {
    id_portfolio: 9, id_vendor: 3,
    title: 'Nina Birthday Look', code: 'PRT-0009', category: 'Birthday',
    description: 'Sweet 17 birthday makeup with glamorous yet age-appropriate look.',
    cover_url: pImg(9), created_at: new Date('2025-04-05'),
    vendor: vendors[2],
    images: [
      { id_image: 23, id_portfolio: 9, image_url: pImg(10), caption: 'Birthday glam', sort_order: 0, created_at: new Date() },
      { id_image: 24, id_portfolio: 9, image_url: pImg(11), caption: 'With friends', sort_order: 1, created_at: new Date() },
    ],
  },
]

const reviews = [
  { id_review: 1, id_vendor: 1, rating: 5, comment: 'Amazing photography! The results exceeded our expectations.', event_type: 'Wedding', created_at: '2025-02-01T00:00:00Z', user: { id_user: 4, full_name: 'Sarah Akbar', avatar_url: null } },
  { id_review: 2, id_vendor: 1, rating: 4, comment: 'Great service and very professional.', event_type: 'Graduation', created_at: '2025-03-15T00:00:00Z', user: { id_user: 5, full_name: 'Rina Wijaya', avatar_url: null } },
  { id_review: 3, id_vendor: 1, rating: 5, comment: 'Captured our family moments beautifully.', event_type: 'Family', created_at: '2025-04-10T00:00:00Z', user: { id_user: 6, full_name: 'Budi Santoso', avatar_url: null } },
  { id_review: 4, id_vendor: 2, rating: 5, comment: 'Incredible videography! The cinematic quality was outstanding.', event_type: 'Corporate', created_at: '2025-02-20T00:00:00Z', user: { id_user: 7, full_name: 'Dian Permata', avatar_url: null } },
  { id_review: 5, id_vendor: 2, rating: 4, comment: 'Very creative and professional team.', event_type: 'Product', created_at: '2025-05-01T00:00:00Z', user: { id_user: 8, full_name: 'Agus Hartono', avatar_url: null } },
  { id_review: 6, id_vendor: 3, rating: 5, comment: 'Best MUA I have ever worked with!', event_type: 'Wedding', created_at: '2025-03-01T00:00:00Z', user: { id_user: 9, full_name: 'Sari Dewi', avatar_url: null } },
  { id_review: 7, id_vendor: 3, rating: 4, comment: 'Beautiful graduation look! Highly recommend.', event_type: 'Graduation', created_at: '2025-04-15T00:00:00Z', user: { id_user: 10, full_name: 'Dita Ayu', avatar_url: null } },
]

const packages = [
  { id_package: 1, id_vendor: 1, name: 'Silver', price: 5000000, duration: '4 Jam', status: 'active' },
  { id_package: 2, id_vendor: 1, name: 'Gold', price: 8500000, duration: '8 Jam', status: 'active' },
  { id_package: 3, id_vendor: 1, name: 'Platinum', price: 15000000, duration: '12 Jam', status: 'active' },
  { id_package: 4, id_vendor: 2, name: 'Basic', price: 3500000, duration: '3 Jam', status: 'active' },
  { id_package: 5, id_vendor: 2, name: 'Premium', price: 7500000, duration: '6 Jam', status: 'active' },
  { id_package: 6, id_vendor: 2, name: 'Cinematic', price: 12000000, duration: 'Full Day', status: 'active' },
  { id_package: 7, id_vendor: 3, name: 'Basic Makeup', price: 1500000, duration: '1 Sesi', status: 'active' },
  { id_package: 8, id_vendor: 3, name: 'Bridal Package', price: 3500000, duration: '3 Sesi', status: 'active' },
  { id_package: 9, id_vendor: 3, name: 'Premium Glam', price: 5500000, duration: 'Full Day', status: 'active' },
  { id_package: 10, id_vendor: 4, name: 'Standard', price: 3500000, duration: '4 Jam', status: 'active' },
  { id_package: 11, id_vendor: 4, name: 'Premium', price: 6500000, duration: '8 Jam', status: 'active' },
  { id_package: 12, id_vendor: 5, name: 'Gold Hour', price: 4500000, duration: '3 Jam', status: 'active' },
  { id_package: 13, id_vendor: 5, name: 'Full Day', price: 9000000, duration: 'Full Day', status: 'active' },
  { id_package: 14, id_vendor: 6, name: 'Signature Look', price: 2000000, duration: '1 Sesi', status: 'active' },
  { id_package: 15, id_vendor: 6, name: 'Bridal Luxe', price: 4500000, duration: 'Full Day', status: 'active' },
  { id_package: 16, id_vendor: 7, name: 'Natural Glam', price: 1200000, duration: '1 Sesi', status: 'active' },
  { id_package: 17, id_vendor: 7, name: 'Complete Bridal', price: 3500000, duration: 'Full Day', status: 'active' },
  { id_package: 18, id_vendor: 8, name: 'Cinematic', price: 6000000, duration: '6 Jam', status: 'active' },
  { id_package: 19, id_vendor: 8, name: 'Ultimate', price: 12000000, duration: 'Full Day', status: 'active' },
  { id_package: 20, id_vendor: 9, name: 'Essential', price: 2800000, duration: '4 Jam', status: 'active' },
  { id_package: 21, id_vendor: 9, name: 'Pro', price: 5500000, duration: '8 Jam', status: 'active' },
]

const allVendors = vendors.map((v) => ({
  ...v,
  cover_url: pImg(v.id_vendor * 3),
  logo_url: null,
  completed_projects: v._count.portfolios + Math.floor(Math.random() * 10),
  availability: (['available', 'limited', 'booked'] as const)[v.id_vendor % 3],
  extras: vendorExtras.filter((e) => e.category === v.category),
}))

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({ data: portfolioData })
})

router.get('/vendors', (req: Request, res: Response) => {
  let result = [...allVendors]
  const { category, q, city, minRating, maxPrice } = req.query as Record<string, string | undefined>
  if (category && category !== 'all') result = result.filter((v) => v.category === category)
  if (q) result = result.filter((v) => v.business_name.toLowerCase().includes(q.toLowerCase()))
  if (city) result = result.filter((v) => v.location.toLowerCase().includes(city.toLowerCase()))
  if (minRating) result = result.filter((v) => v.average_rating >= Number(minRating))
  if (maxPrice) result = result.filter((v) => v.starting_price <= Number(maxPrice))
  res.json({ data: result })
})

router.get('/vendors/categories', (_req: Request, res: Response) => {
  const cats = [...new Set(allVendors.map((v) => v.category))]
  res.json({ data: cats.map((name) => ({ name })) })
})

router.get('/vendors/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const vendor = allVendors.find((v) => v.id_vendor === id)
  if (!vendor) { res.status(404).json({ error: { message: 'Vendor not found' } }); return }
  res.json({ data: vendor })
})

router.get('/vendors/:id/extras', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const vendor = allVendors.find((v) => v.id_vendor === id)
  if (!vendor) { res.status(404).json({ error: { message: 'Vendor not found' } }); return }
  res.json({ data: vendorExtras.filter((e) => e.category === vendor.category) })
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const portfolio = portfolioData.find((p) => p.id_portfolio === id)
  if (!portfolio) { res.status(404).json({ error: { message: 'Portfolio not found' } }); return }
  res.json({ data: portfolio })
})

router.get('/:id/related', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const portfolio = portfolioData.find((p) => p.id_portfolio === id)
  if (!portfolio) { res.status(404).json({ error: { message: 'Portfolio not found' } }); return }
  const related = portfolioData.filter((p) => p.id_vendor === portfolio.id_vendor && p.id_portfolio !== id)
  res.json({ data: related })
})

router.get('/vendor/:vendorId/info', (req: Request, res: Response) => {
  const vendorId = Number(req.params.vendorId)
  const vendor = vendors.find((v) => v.id_vendor === vendorId)
  if (!vendor) { res.status(404).json({ error: { message: 'Vendor not found' } }); return }
  const vendorReviews = reviews.filter((r) => r.id_vendor === vendorId)
  const vendorPackages = packages.filter((p) => p.id_vendor === vendorId)
  const availability = vendorId === 1 ? { date: new Date().toISOString(), is_available: true } : null
  res.json({ data: { vendor, reviews: vendorReviews, packages: vendorPackages, availability } })
})

export default router
