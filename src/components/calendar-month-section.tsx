import Link from "next/link";
import { Recurrence } from "@/generated/prisma/enums";
import { OccurrenceCheckbox } from "@/components/occurrence-checkbox";
import { TaskTypeBadge } from "@/components/task-type-badge";
import { createDate, getOccurrencesInRange, toDateKey } from "@/lib/care-schedule";
import { CalendarCareTask } from "@/lib/data/calendar";
import { formatDateRange, formatDayMonth, formatRecurrence } from "@/lib/labels";
import { getCurrentOccurrence, isOccurrenceDone } from "@/lib/task-status";

type CalendarMonthSectionProps = {
  year: number;
  month: number;
  careTasks: CalendarCareTask[];
  today: Date;
};

export const CalendarMonthSection = ({
  year,
  month,
  careTasks,
  today,
}: CalendarMonthSectionProps) => {
  const monthStart = createDate(year, month, 1);
  const monthEnd = createDate(year, month + 1, 0);

  const rows = careTasks
    .map((task) => ({
      task,
      occurrences: getOccurrencesInRange(task, monthStart, monthEnd).filter(
        (occurrence) =>
          task.recurrence === Recurrence.ONCE ||
          (occurrence.dueDate.getTime() >= monthStart.getTime() &&
            occurrence.dueDate.getTime() <= monthEnd.getTime()),
      ),
    }))
    .filter((row) => row.occurrences.length > 0)
    .sort(
      (first, second) =>
        first.occurrences[0].windowStart.getTime() - second.occurrences[0].windowStart.getTime(),
    );

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Rien à faire ce mois-ci.</p>;
  }

  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {rows.map(({ task, occurrences }) => {
        const currentOccurrence = getCurrentOccurrence(task, today);
        return (
          <li key={task.id} className="flex flex-col gap-2 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <TaskTypeBadge type={task.type} />
              <Link
                href={`/plants/${task.plant.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {task.plant.name}
              </Link>
              {task.title && <span className="text-sm">· {task.title}</span>}
              {task.recurrence !== Recurrence.ONCE && (
                <span className="text-xs text-muted-foreground">{formatRecurrence(task)}</span>
              )}
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {occurrences.map((occurrence) => {
                const dueDateKey = toDateKey(occurrence.dueDate);
                return (
                  <li key={dueDateKey}>
                    <OccurrenceCheckbox
                      careTaskId={task.id}
                      dueDateKey={dueDateKey}
                      isDone={isOccurrenceDone(task, occurrence)}
                      isHighlighted={
                        currentOccurrence?.dueDate.getTime() === occurrence.dueDate.getTime()
                      }
                      label={
                        task.recurrence === Recurrence.ONCE
                          ? formatDateRange(occurrence.windowStart, occurrence.windowEnd)
                          : formatDayMonth(occurrence.dueDate)
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
};
