// script: npm run map-vendor-categories.js
// ==============================================
// Migration Script: Map Vendor Categories
// ==============================================

// This script maps existing vendor.category strings to new id_category IDs
// Run with: node scripts/map-vendor-categories.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function mapVendorCategories() {
  console.log('🔧 Starting Category Mapping...')

  try {
    // Step 1: Check existing categories
    console.log('\n📋 Step 1: Checking existing categories...')
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { sort_order: 'asc' }
    })

    console.log(`✅ Found ${categories.length} categories:`)
    categories.forEach(c => {
      console.log(`   - ${c.id_category}. ${c.name} (${c.slug})`)
    })

    // Step 2: Show vendors without categories
    console.log('\n📋 Step 2: Finding vendors without categories...')
    const vendorsWithoutCategory = await prisma.vendor.findMany({
      where: {
        category: { not: null },
        id_category: null
      },
      select: {
        id_vendor: true,
        business_name: true,
        category: true
      }
    })

    console.log(`⚠️  Found ${vendorsWithoutCategory.length} vendors without category mapping:`)
    vendorsWithoutCategory.forEach(v => {
      console.log(`   - ID: ${v.id_vendor}, Business: ${v.business_name}, Category: "${v.category}"`)
    })

    // Step 3: Map vendors to categories
    console.log('\n📋 Step 3: Mapping vendors to categories...')

    let mapped = 0
    let unmapped = 0

    for (const vendor of vendorsWithoutCategory) {
      // Find category by name
      const category = categories.find(c => c.name === vendor.category)

      if (category) {
        // Update vendor with category ID
        await prisma.vendor.update({
          where: { id_vendor: vendor.id_vendor },
          data: {
            id_category: category.id_category,
            // Keep category string for backup/reference
          }
        })
        mapped++
        console.log(`✅ Mapped: ${vendor.business_name} -> ${category.name} (ID: ${category.id_category})`)
      } else {
        unmapped++
        console.log(`❌ No match: ${vendor.business_name} has category "${vendor.category}" but no matching category in database`)
      }
    }

    // Step 4: Show unmapped vendors that need manual review
    console.log('\n📋 Step 4: Unmapped vendors (require manual attention):')
    const unmappedVendors = await prisma.vendor.findMany({
      where: {
        category: { not: null },
        id_category: null
      },
      select: {
        id_vendor: true,
        business_name: true,
        category: true
      }
    })

    if (unmappedVendors.length > 0) {
      console.log('\n⚠️  Please review these vendors:')
      unmappedVendors.forEach(v => {
        console.log(`   - ID: ${v.id_vendor}, Business: ${v.business_name}, Category: "${v.category}"`)
      })
    } else {
      console.log('✅ All vendors mapped successfully!')
    }

    // Step 5: Final statistics
    console.log('\n📊 Final Statistics:')
    const totalVendors = vendorsWithoutCategory.length
    console.log(`   Total with category: ${totalVendors}`)
    console.log(`   ✅ Successfully mapped: ${mapped}`)
    console.log(`   ❌ Needs manual fix: ${unmapped}`)

    // Step 6: Show vendor counts per category
    console.log('\n📊 Vendor counts per category:')
    const categoryCounts = await prisma.category.groupBy({
      by: ['id_category', 'name', 'slug'],
      _count: {
        vendors: true
      }
    })

    categoryCounts.forEach(c => {
      console.log(`   - ${c.name}: ${c._count.vendors} vendors`)
    })

    console.log('\n✅ Mapping complete!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error during mapping:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
mapVendorCategories()
