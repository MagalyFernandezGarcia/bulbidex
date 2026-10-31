import "server-only";
import { addDays } from "@/lib/care-schedule";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const COMPLETION_LOOKBACK_IN_DAYS = 400;

export const getCalendarData = async (rangeStart: Date, rangeEnd: Date, plantId?: string) => {
  await requireSession();
  const [careTasks, plants] = await Promise.all([
    prisma.careTask.findMany({
      where: plantId ? { plantId } : {},
      orderBy: [{ plant: { name: "asc" } }, { startMonth: "asc" }],
      include: {
        plant: { select: { id: true, name: true } },
        completions: {
          where: {
            dueDate: { gte: addDays(rangeStart, -COMPLETION_LOOKBACK_IN_DAYS), lte: rangeEnd },
          },
          select: { dueDate: true },
        },
      },
    }),
    prisma.plant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { careTasks, plants };
};

export type CalendarCareTask = Awaited<ReturnType<typeof getCalendarData>>["careTasks"][number];
