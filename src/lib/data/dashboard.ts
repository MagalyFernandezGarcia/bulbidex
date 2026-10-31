import "server-only";
import { addDays, Occurrence } from "@/lib/care-schedule";
import { prisma } from "@/lib/prisma";
import { getRequestToday } from "@/lib/request-today";
import { requireSession } from "@/lib/session";
import {
  getCurrentOccurrence,
  getOverdueOccurrence,
  getUpcomingOccurrence,
  isOccurrenceDone,
} from "@/lib/task-status";

const COMPLETION_LOOKBACK_IN_DAYS = 800;
const UPCOMING_HORIZON_IN_DAYS = 14;

export const getDashboard = async () => {
  await requireSession();
  const today = await getRequestToday();

  const careTasks = await prisma.careTask.findMany({
    orderBy: [{ plant: { name: "asc" } }, { startMonth: "asc" }],
    include: {
      plant: { select: { id: true, name: true } },
      completions: {
        where: { dueDate: { gte: addDays(today, -COMPLETION_LOOKBACK_IN_DAYS) } },
        select: { dueDate: true },
      },
    },
  });

  const toItems = (getOccurrence: (task: (typeof careTasks)[number]) => Occurrence | undefined) =>
    careTasks.flatMap((task) => {
      const occurrence = getOccurrence(task);
      return occurrence ? [{ task, occurrence }] : [];
    });

  const overdue = toItems((task) => getOverdueOccurrence(task, today));
  const dueNow = toItems((task) => {
    const occurrence = getCurrentOccurrence(task, today);
    return occurrence && !isOccurrenceDone(task, occurrence) ? occurrence : undefined;
  });
  const upcoming = toItems((task) => getUpcomingOccurrence(task, today, UPCOMING_HORIZON_IN_DAYS));

  const byDueDate = (first: { occurrence: Occurrence }, second: { occurrence: Occurrence }) =>
    first.occurrence.dueDate.getTime() - second.occurrence.dueDate.getTime();

  return {
    today,
    hasTasks: careTasks.length > 0,
    overdue: overdue.sort(byDueDate),
    dueNow: dueNow.sort(byDueDate),
    upcoming: upcoming.sort(byDueDate),
  };
};

export type DashboardItem = Awaited<ReturnType<typeof getDashboard>>["dueNow"][number];
