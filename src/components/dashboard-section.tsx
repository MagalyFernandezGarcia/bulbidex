import Link from "next/link";
import { Recurrence } from "@/generated/prisma/enums";
import { OccurrenceCheckbox } from "@/components/occurrence-checkbox";
import { TaskTypeBadge } from "@/components/task-type-badge";
import { toDateKey } from "@/lib/care-schedule";
import { DashboardItem } from "@/lib/data/dashboard";
import { formatDateRange, formatDayMonth } from "@/lib/labels";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description: string;
  items: DashboardItem[];
  emptyMessage?: string;
  titleClassName?: string;
};

export const DashboardSection = ({
  title,
  description,
  items,
  emptyMessage,
  titleClassName,
}: DashboardSectionProps) => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <h2 className={cn("text-lg font-semibold", titleClassName)}>
        {title}
        {items.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
        )}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : (
      <ul className="flex flex-col divide-y rounded-xl border">
        {items.map(({ task, occurrence }) => (
          <li
            key={`${task.id}-${toDateKey(occurrence.dueDate)}`}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <TaskTypeBadge type={task.type} />
              <Link
                href={`/plants/${task.plant.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {task.plant.name}
              </Link>
              {task.title && <span className="text-sm">· {task.title}</span>}
            </div>
            <OccurrenceCheckbox
              careTaskId={task.id}
              dueDateKey={toDateKey(occurrence.dueDate)}
              isDone={false}
              label={
                task.recurrence === Recurrence.ONCE
                  ? formatDateRange(occurrence.windowStart, occurrence.windowEnd)
                  : formatDayMonth(occurrence.dueDate)
              }
            />
          </li>
        ))}
      </ul>
    )}
  </section>
);
