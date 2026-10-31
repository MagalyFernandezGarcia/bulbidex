import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";
import { CareTaskSchedule } from "@/lib/care-schedule";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.PRUNING]: "Taille",
  [TaskType.FERTILIZING]: "Fertilisation",
  [TaskType.SOWING]: "Semis",
  [TaskType.PLANTING]: "Plantation",
  [TaskType.HARVESTING]: "Récolte",
  [TaskType.WATERING]: "Arrosage",
  [TaskType.MULCHING]: "Paillage",
  [TaskType.TREATMENT]: "Traitement",
  [TaskType.OTHER]: "Autre",
};

export const MONTH_PART_LABELS: Record<MonthPart, string> = {
  [MonthPart.EARLY]: "début",
  [MonthPart.MID]: "mi-",
  [MonthPart.LATE]: "fin",
};

export const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const getMonthName = (month: number) => MONTH_NAMES[month - 1] ?? "";

export const formatMonthPart = (month: number, part: MonthPart) => {
  const monthName = getMonthName(month);
  return part === MonthPart.MID ? `mi-${monthName}` : `${MONTH_PART_LABELS[part]} ${monthName}`;
};

export const formatPeriod = (schedule: CareTaskSchedule) =>
  `${formatMonthPart(schedule.startMonth, schedule.startPart)} – ${formatMonthPart(schedule.endMonth, schedule.endPart)}`;

export const formatRecurrence = (schedule: CareTaskSchedule) => {
  const interval = schedule.interval ?? 1;
  if (schedule.recurrence === Recurrence.EVERY_DAYS) {
    return interval === 1 ? "tous les jours" : `tous les ${interval} jours`;
  }
  if (schedule.recurrence === Recurrence.EVERY_WEEKS) {
    return interval === 1 ? "toutes les semaines" : `toutes les ${interval} semaines`;
  }
  return "une fois";
};

const dayMonthFormatter = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export const formatDayMonth = (date: Date) => dayMonthFormatter.format(date);

const dayMonthYearFormatter = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDateRange = (start: Date, end: Date) => {
  if (start.getTime() === end.getTime()) return formatDayMonth(start);
  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    return `${dayMonthYearFormatter.format(start)} – ${dayMonthYearFormatter.format(end)}`;
  }
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`;
};

export const getTaskTitle = (task: { type: TaskType; title: string | null }) =>
  task.title || TASK_TYPE_LABELS[task.type];
