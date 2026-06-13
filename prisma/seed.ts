import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/expirydeals' })
const prisma = new PrismaClient({ adapter })

const CATEGORIES = [
  { name: 'Food & Groceries', slug: 'food-groceries', icon: '🥫', sortOrder: 1 },
  { name: 'Beverages', slug: 'beverages', icon: '🥤', sortOrder: 2 },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', sortOrder: 3 },
  { name: 'Meat & Seafood', slug: 'meat-seafood', icon: '🥩', sortOrder: 4 },
  { name: 'Bakery & Snacks', slug: 'bakery-snacks', icon: '🍞', sortOrder: 5 },
  { name: 'Pharmaceuticals', slug: 'pharmaceuticals', icon: '💊', sortOrder: 6 },
  { name: 'Health & Wellness', slug: 'health-wellness', icon: '🌿', sortOrder: 7 },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: '👶', sortOrder: 8 },
  { name: 'Cosmetics & Beauty', slug: 'cosmetics-beauty', icon: '💄', sortOrder: 9 },
  { name: 'Cleaning Products', slug: 'cleaning-products', icon: '🧹', sortOrder: 10 },
  { name: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾', sortOrder: 11 },
  { name: 'Other', slug: 'other', icon: '📦', sortOrder: 12 },
]

async function main() {
  console.log('Seeding categories...')
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { ...cat, isActive: true },
    })
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`)

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@expirydeals.com'
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminExists) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'Admin',
        role: 'admin',
        status: 'active',
        emailVerified: true,
      },
    })
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log(`Admin user already exists: ${adminEmail}`)
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
