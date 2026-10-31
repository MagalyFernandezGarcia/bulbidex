import { CareTaskSchedule, getOccurrencesInRange, Occurrence } from "@/lib/care-schedule";

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
