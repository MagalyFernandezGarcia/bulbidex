import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { environment } from "@/lib/environment";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

export const prisma = globalThis.prisma ?? createPrismaClient();

if (environment.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
