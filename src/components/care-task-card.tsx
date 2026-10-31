import { Repeat } from "lucide-react";
import { Recurrence, TaskType } from "@/generated/prisma/enums";
import { OccurrenceCheckbox } from "@/components/occurrence-checkbox";
import { TaskTypeBadge } from "@/components/task-type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { createDate, getOccurrencesInRange, toDateKey } from "@/lib/care-schedule";
import { formatDateRange, formatDayMonth, formatPeriod, formatRecurrence } from "@/lib/labels";
import { getCurrentOccurrence, isOccurrenceDone, TaskWithCompletions } from "@/lib/task-status";

type CareTaskCardProps = {
  task: TaskWithCompletions & {
    id: string;
    type: TaskType;
    title: string | null;
    instructions: string | null;
  };
  today: Date;
};

export const CareTaskCard = ({ task, today }: CareTaskCardProps) => {
  const year = today.getUTCFullYear();
  const occurrences = getOccurrencesInRange(task, createDate(year, 1, 1), createDate(year, 12, 31));
  const currentOccurrence = getCurrentOccurrence(task, today);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TaskTypeBadge type={task.type} />
          {task.title && <p className="font-medium">{task.title}</p>}
        </div>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span className="first-letter:uppercase">{formatPeriod(task)}</span>
          <span className="flex items-center gap-1">
            <Repeat className="size-3.5" />
            {formatRecurrence(task)}
          </span>
        </p>
        {task.instructions && <p className="text-sm whitespace-pre-line">{task.instructions}</p>}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">En {year}</p>
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
        </div>
      </CardContent>
    </Card>
  );
};
