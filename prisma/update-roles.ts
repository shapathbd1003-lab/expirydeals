import 'dotenv/config'
import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })

async function main() {
  await client.connect()
  // Alter enum to add 'user' value first
  await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'user'`)
  console.log('Added user to Role enum')
  // Update all existing buyer/seller to user
  await client.query(`UPDATE users SET role = 'user' WHERE role IN ('buyer', 'seller')`)
  console.log('Updated all existing users to role=user')
  await client.end()
}

main().catch(console.error)
