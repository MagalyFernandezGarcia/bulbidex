import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const getGardenTools = async () => {
  await requireSession();
  return prisma.gardenTool.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, notes: true },
  });
};
