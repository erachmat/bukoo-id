import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let connectionString = `${process.env.DATABASE_URL || ''}`

// Replace legacy pg sslmode aliases to satisfy pg-connection-string and eliminate deprecation security warnings
if (connectionString.includes('sslmode=require')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=verify-full')
} else if (connectionString.includes('sslmode=prefer')) {
  connectionString = connectionString.replace('sslmode=prefer', 'sslmode=verify-full')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
