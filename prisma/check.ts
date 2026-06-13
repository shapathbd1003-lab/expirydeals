import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DB = 'postgresql://neondb_owner:npg_EZiRk9cu2TDO@ep-tiny-recipe-adno0rnc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const adapter = new PrismaPg({ connectionString: DB })
const prisma = new PrismaClient({ adapter })

async function main() {
  const now = new Date()
  console.log('Now:', now.toISOString())
  const total = await prisma.listing.count()
  console.log('Total listings:', total)
  const active = await prisma.listing.count({ where: { status: 'active' } })
  console.log('Active:', active)
  const future = await prisma.listing.count({ where: { status: 'active', expiryDate: { gte: now } } })
  console.log('Active + not expired:', future)
  const sample = await prisma.listing.findFirst({ select: { title: true, status: true, expiryDate: true } })
  console.log('Sample listing:', JSON.stringify(sample))
}

main().catch(console.error).finally(() => prisma.$disconnect())
