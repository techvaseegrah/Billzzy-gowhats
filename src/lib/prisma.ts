import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientOptions = {
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
};

// Initialize client with error handling
function createPrismaClient() {
  try {
    return new PrismaClient(prismaClientOptions);
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;