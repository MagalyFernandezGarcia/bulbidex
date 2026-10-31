import {
  addDays,
  CareTaskSchedule,
  getOccurrencesInRange,
  getSeasonOccurrences,
  getSeasonWindow,
  getToday,
  Occurrence,
} from "@/lib/care-schedule";

export type TaskWithCompletions = CareTaskSchedule & {
  completions: { dueDate: Date }[];
};

export const isOccurrenceDone = (task: TaskWithCompletions, occurrence: Occurrence) =>
  task.completions.some(
    (completion) => completion.dueDate.getTime() === occurrence.dueDate.getTime(),
  );

export const getCurrentOccurrence = (task: CareTaskSchedule, today: Date) =>
  getOccurrencesInRange(task, today, today).at(0);

export const isTaskDueNow = (task: TaskWithCompletions, today: Date) => {
  const currentOccurrence = getCurrentOccurrence(task, today);
  return currentOccurrence !== undefined && !isOccurrenceDone(task, currentOccurrence);
};

export const getOverdueOccurrence = (
  task: TaskWithCompletions & { createdAt: Date },
  today: Date,
) => {
  const creationDay = getToday(task.createdAt);
  const currentYear = today.getUTCFullYear();
  const latestStartedSeasonYear = [currentYear, currentYear - 1, currentYear - 2].find(
    (seasonYear) => getSeasonWindow(task, seasonYear).start.getTime() <= today.getTime(),
  );
  if (latestStartedSeasonYear === undefined) return undefined;

  const latestEndedOccurrence = getSeasonOccurrences(task, latestStartedSeasonYear)
    .filter(
      (occurrence) =>
        occurrence.windowEnd.getTime() < today.getTime() &&
        occurrence.windowEnd.getTime() >= creationDay.getTime(),
    )
    .at(-1);
  return latestEndedOccurrence && !isOccurrenceDone(task, latestEndedOccurrence)
    ? latestEndedOccurrence
    : undefined;
};

export const getUpcomingOccurrence = (
  task: TaskWithCompletions,
  today: Date,
  horizonInDays: number,
) =>
  getOccurrencesInRange(task, addDays(today, 1), addDays(today, horizonInDays)).find(
    (occurrence) =>
      occurrence.dueDate.getTime() > today.getTime() && !isOccurrenceDone(task, occurrence),
  );
