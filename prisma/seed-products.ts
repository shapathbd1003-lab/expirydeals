import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EZiRk9cu2TDO@ep-tiny-recipe-adno0rnc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const adapter = new PrismaPg({ connectionString: DB_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create test seller if not exists
  let seller = await prisma.user.findUnique({ where: { email: 'seller@test.com' } })
  if (!seller) {
    const passwordHash = await bcrypt.hash('Test@1234', 12)
    seller = await prisma.user.create({
      data: {
        email: 'seller@test.com',
        passwordHash,
        fullName: 'Rahim Superstore',
        role: 'seller',
        status: 'active',
        emailVerified: true,
        phone: '01711234567',
        businessName: 'Rahim Superstore',
        businessCity: 'Dhaka',
        businessRegion: 'Dhaka Division',
      },
    })
    console.log('Created seller: seller@test.com / Test@1234')
  }

  // Create test buyer if not exists
  let buyer = await prisma.user.findUnique({ where: { email: 'buyer@test.com' } })
  if (!buyer) {
    const passwordHash = await bcrypt.hash('Test@1234', 12)
    buyer = await prisma.user.create({
      data: {
        email: 'buyer@test.com',
        passwordHash,
        fullName: 'Karim Ahmed',
        role: 'buyer',
        status: 'active',
        emailVerified: true,
        phone: '01799887766',
      },
    })
    console.log('Created buyer: buyer@test.com / Test@1234')
  }

  // Get categories
  const cats = await prisma.category.findMany()
  const catMap: Record<string, number> = {}
  for (const c of cats) catMap[c.slug] = c.id

  const now = new Date()
  const d = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const products = [
    { title: 'Pran Mango Juice 1L (Pack of 12)', description: 'PRAN Mango Juice 1 litre pack of 12 bottles. Near expiry but perfectly fine to consume. Original price was 960 BDT. Selling at huge discount. Great for offices and households. All sealed. Contact seller for pickup from Mirpur-10, Dhaka. Phone: 01711234567', categorySlug: 'food-groceries', originalPrice: 960, discountedPrice: 480, quantity: 5, expiryDate: d(8), city: 'Dhaka', region: 'Dhaka Division', address: 'Mirpur-10, Dhaka' },
    { title: 'Fresh Basmati Rice 5kg (Imported)', description: 'Premium imported Basmati Rice 5kg bag. Best before date approaching. Grain quality is excellent, no damage. Ideal for restaurants and caterers looking for bulk discount. Cash on delivery available in Chittagong. Phone: 01711234567', categorySlug: 'food-groceries', originalPrice: 750, discountedPrice: 450, quantity: 20, expiryDate: d(14), city: 'Chittagong', region: 'Chittagong Division', address: 'Agrabad, Chittagong' },
    { title: 'Maggi Noodles 75g x 24 Pack', description: 'Maggi instant noodles 75g, box of 24 packets. Expiry approaching in 2 weeks. All packets sealed and in perfect condition. Sold as full box only. Pickup from Gulshan. Phone: 01711234567', categorySlug: 'food-groceries', originalPrice: 600, discountedPrice: 300, quantity: 10, expiryDate: d(12), city: 'Dhaka', region: 'Dhaka Division', address: 'Gulshan-2, Dhaka' },
    { title: 'RC Cola 250ml Cans x 24', description: 'RC Cola 250ml cans, carton of 24. Best before date is in 5 days. Taste is perfect — cans are sealed. Selling at 60% off original price. Pick up from Dhanmondi. Phone: 01711234567', categorySlug: 'beverages', originalPrice: 720, discountedPrice: 288, quantity: 8, expiryDate: d(5), city: 'Dhaka', region: 'Dhaka Division', address: 'Dhanmondi, Dhaka' },
    { title: 'Mineral Water 500ml x 24 Bottles', description: 'Sealed mineral water 500ml bottles, carton of 24. Near expiry stock. Ideal for events, offices, caterers. Multiple cartons available. Tejgaon industrial area. Phone: 01711234567', categorySlug: 'beverages', originalPrice: 480, discountedPrice: 240, quantity: 30, expiryDate: d(10), city: 'Dhaka', region: 'Dhaka Division', address: 'Tejgaon, Dhaka' },
    { title: 'Aarong Pasteurized Milk 1L Tetra x 12', description: 'Aarong pasteurized full cream milk 1 litre tetra pack. Box of 12. Expires in 3 days — still fresh and safe. Great deal for families. Dhaka delivery available. Phone: 01711234567', categorySlug: 'dairy-eggs', originalPrice: 840, discountedPrice: 420, quantity: 6, expiryDate: d(3), city: 'Dhaka', region: 'Dhaka Division', address: 'Uttara, Dhaka' },
    { title: 'Imported Greek Yogurt 400g x 6 Cups', description: 'Imported Greek yogurt 400g cups, pack of 6. Expires tomorrow — perfectly fine, sealed cups. Major supermarket clearance. Take all 6 at once. Pickup only from Banani. Phone: 01711234567', categorySlug: 'dairy-eggs', originalPrice: 900, discountedPrice: 270, quantity: 4, expiryDate: d(1), city: 'Dhaka', region: 'Dhaka Division', address: 'Banani, Dhaka' },
    { title: 'Paracetamol 500mg Tablets (100 pcs)', description: 'Paracetamol 500mg tablets, strip of 100 pieces. Pharmacy clearance stock. Expires in 6 months. Sealed original packaging. Suitable for clinics and families stocking up. Sylhet. Phone: 01711234567', categorySlug: 'pharmaceuticals', originalPrice: 200, discountedPrice: 120, quantity: 50, expiryDate: d(180), city: 'Sylhet', region: 'Sylhet Division', address: 'Zindabazar, Sylhet' },
    { title: 'Vitamin C 1000mg Effervescent Tablets 20s', description: 'Imported Vitamin C 1000mg effervescent tablets, tube of 20. Expires in 30 days. Sealed tubes, full potency. Ideal for boosting immunity. Bulk available. Phone: 01711234567', categorySlug: 'pharmaceuticals', originalPrice: 350, discountedPrice: 175, quantity: 100, expiryDate: d(30), city: 'Dhaka', region: 'Dhaka Division', address: 'Farmgate, Dhaka' },
    { title: 'Danish Butter Cookies 454g Tin', description: 'Imported Danish butter cookies in classic blue tin, 454g. Expires in 7 days. Tin is sealed, cookies are perfectly crisp. Great for gifting or personal use. 5 tins available. Phone: 01711234567', categorySlug: 'bakery-snacks', originalPrice: 650, discountedPrice: 325, quantity: 5, expiryDate: d(7), city: 'Dhaka', region: 'Dhaka Division', address: 'Mohammadpur, Dhaka' },
    { title: 'Pringles Original 165g x 6 Cans', description: 'Pringles original flavor 165g cans, pack of 6. Best before in 4 days. All cans sealed. Perfect for parties and gatherings. Selling at half price. Pickup Mirpur. Phone: 01711234567', categorySlug: 'bakery-snacks', originalPrice: 1200, discountedPrice: 600, quantity: 3, expiryDate: d(4), city: 'Dhaka', region: 'Dhaka Division', address: 'Mirpur-1, Dhaka' },
    { title: 'Ensure Nutrition Powder 400g Vanilla', description: 'Abbott Ensure complete nutrition powder 400g vanilla flavor. Expires in 45 days. Sealed tin. Perfect for elderly, patients, and health-conscious individuals. 10 tins available. Phone: 01711234567', categorySlug: 'health-wellness', originalPrice: 1200, discountedPrice: 720, quantity: 10, expiryDate: d(45), city: 'Rajshahi', region: 'Rajshahi Division', address: 'Shaheb Bazar, Rajshahi' },
    { title: 'Nivea Body Lotion 400ml x 3 Bottles', description: 'Nivea express hydration body lotion 400ml, pack of 3. Expiry in 60 days. Sealed bottles from supermarket clearance. Great moisturizer for daily use. New Market, Dhaka. Phone: 01711234567', categorySlug: 'cosmetics-beauty', originalPrice: 900, discountedPrice: 540, quantity: 15, expiryDate: d(60), city: 'Dhaka', region: 'Dhaka Division', address: 'New Market, Dhaka' },
    { title: 'Nestle Cerelac Rice Wheat 400g Stage 2', description: 'Nestle Cerelac rice and wheat stage 2 baby food 400g. Expires in 90 days. Sealed tin. Perfect for babies 6 months and above. Wholesale stock clearance. Phone: 01711234567', categorySlug: 'baby-kids', originalPrice: 580, discountedPrice: 350, quantity: 25, expiryDate: d(90), city: 'Dhaka', region: 'Dhaka Division', address: 'Bashundhara, Dhaka' },
    { title: 'Frozen Hilsa Fish 1kg Vacuum Packed', description: 'Premium frozen Hilsa fish, vacuum packed 1kg. Expires in 2 days — must sell today. Freshly frozen, no compromise on quality. Available at Karwan Bazar. Serious buyers only. Phone: 01711234567', categorySlug: 'meat-seafood', originalPrice: 1200, discountedPrice: 600, quantity: 20, expiryDate: d(2), city: 'Dhaka', region: 'Dhaka Division', address: 'Karwan Bazar, Dhaka' },
  ]

  let created = 0
  for (const p of products) {
    const catId = catMap[p.categorySlug]
    if (!catId) { console.log(`Category not found: ${p.categorySlug}`); continue }

    const slug = p.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .substring(0, 60) + '-' + Math.random().toString(36).substring(2, 7)

    const discountPct = ((p.originalPrice - p.discountedPrice) / p.originalPrice * 100)

    await prisma.listing.upsert({
      where: { slug },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: catId,
        title: p.title,
        slug,
        description: p.description,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        discountPct,
        quantity: p.quantity,
        expiryDate: p.expiryDate,
        city: p.city,
        region: p.region,
        address: p.address,
        status: 'active',
        viewCount: Math.floor(Math.random() * 80),
        contactCount: Math.floor(Math.random() * 15),
      },
    })
    created++
    console.log(`✓ ${p.title}`)
  }

  console.log(`\nDone! Created ${created} test listings.`)
  console.log('\nTest accounts:')
  console.log('  Seller: seller@test.com / Test@1234')
  console.log('  Buyer:  buyer@test.com  / Test@1234')
  console.log('  Admin:  admin@expirydeals.com / Admin@123456')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
