import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { addDays, getToday } from "@/lib/care-schedule";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const COMPLETION_HISTORY_IN_DAYS = 400;

const getCareTaskInclude = (today: Date) =>
  ({
    orderBy: [{ startMonth: "asc" }, { startPart: "asc" }],
    include: {
      completions: {
        where: { dueDate: { gte: addDays(today, -COMPLETION_HISTORY_IN_DAYS) } },
        select: { dueDate: true },
      },
    },
  }) satisfies Prisma.Plant$careTasksArgs;

export const getPlants = async (search?: string) => {
  await requireSession();
  const today = getToday();
  const searchFilter: Prisma.PlantWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { variety: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const plants = await prisma.plant.findMany({
    where: searchFilter,
    orderBy: { name: "asc" },
    include: { careTasks: getCareTaskInclude(today) },
  });
  return { plants, today };
};

export const getPlant = async (id: string) => {
  await requireSession();
  const today = getToday();
  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { careTasks: getCareTaskInclude(today) },
  });
  return { plant, today };
};
