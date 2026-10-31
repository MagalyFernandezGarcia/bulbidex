import { MonthPart, Recurrence } from "@/generated/prisma/enums";

export const APP_TIME_ZONE = "Europe/Brussels";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type CareTaskSchedule = {
  startMonth: number;
  startPart: MonthPart;
  endMonth: number;
  endPart: MonthPart;
  recurrence: Recurrence;
  interval: number | null;
};

export type Occurrence = {
  dueDate: Date;
  windowStart: Date;
  windowEnd: Date;
};

const PART_ORDER: Record<MonthPart, number> = {
  [MonthPart.EARLY]: 0,
  [MonthPart.MID]: 1,
  [MonthPart.LATE]: 2,
};

const PART_START_DAY: Record<MonthPart, number> = {
  [MonthPart.EARLY]: 1,
  [MonthPart.MID]: 11,
  [MonthPart.LATE]: 21,
};

export const createDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * MILLISECONDS_PER_DAY);

const getLastDayOfMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const getPartEndDay = (year: number, month: number, part: MonthPart) => {
  if (part === MonthPart.EARLY) return 10;
  if (part === MonthPart.MID) return 20;
  return getLastDayOfMonth(year, month);
};

export const getToday = (now: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return createDate(getPart("year"), getPart("month"), getPart("day"));
};

export const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const crossesYearEnd = (schedule: CareTaskSchedule) =>
  schedule.endMonth < schedule.startMonth ||
  (schedule.endMonth === schedule.startMonth &&
    PART_ORDER[schedule.endPart] < PART_ORDER[schedule.startPart]);

export const getSeasonWindow = (schedule: CareTaskSchedule, seasonYear: number) => {
  const endYear = crossesYearEnd(schedule) ? seasonYear + 1 : seasonYear;
  return {
    start: createDate(seasonYear, schedule.startMonth, PART_START_DAY[schedule.startPart]),
    end: createDate(
      endYear,
      schedule.endMonth,
      getPartEndDay(endYear, schedule.endMonth, schedule.endPart),
    ),
  };
};

const getStepInDays = (schedule: CareTaskSchedule) => {
  const interval = Math.max(1, schedule.interval ?? 1);
  if (schedule.recurrence === Recurrence.EVERY_DAYS) return interval;
  if (schedule.recurrence === Recurrence.EVERY_WEEKS) return interval * 7;
  return null;
};

export const getSeasonOccurrences = (
  schedule: CareTaskSchedule,
  seasonYear: number,
): Occurrence[] => {
  const season = getSeasonWindow(schedule, seasonYear);
  const stepInDays = getStepInDays(schedule);

  if (stepInDays === null) {
    return [{ dueDate: season.start, windowStart: season.start, windowEnd: season.end }];
  }

  const occurrences: Occurrence[] = [];
  for (
    let dueDate = season.start;
    dueDate.getTime() <= season.end.getTime();
    dueDate = addDays(dueDate, stepInDays)
  ) {
    const nextDueDate = addDays(dueDate, stepInDays);
    const windowEnd =
      nextDueDate.getTime() <= season.end.getTime() ? addDays(nextDueDate, -1) : season.end;
    occurrences.push({ dueDate, windowStart: dueDate, windowEnd });
  }
  return occurrences;
};

export const getOccurrencesInRange = (
  schedule: CareTaskSchedule,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const occurrences: Occurrence[] = [];
  for (
    let seasonYear = rangeStart.getUTCFullYear() - 1;
    seasonYear <= rangeEnd.getUTCFullYear();
    seasonYear++
  ) {
    for (const occurrence of getSeasonOccurrences(schedule, seasonYear)) {
      if (
        occurrence.windowEnd.getTime() >= rangeStart.getTime() &&
        occurrence.windowStart.getTime() <= rangeEnd.getTime()
      ) {
        occurrences.push(occurrence);
      }
    }
  }
  return occurrences;
};
