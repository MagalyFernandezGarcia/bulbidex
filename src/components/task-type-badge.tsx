import { TaskType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { TASK_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const TASK_TYPE_COLORS: Record<TaskType, string> = {
  [TaskType.PRUNING]: "bg-amber-100 text-amber-900",
  [TaskType.FERTILIZING]: "bg-lime-100 text-lime-900",
  [TaskType.SOWING]: "bg-emerald-100 text-emerald-900",
  [TaskType.PLANTING]: "bg-green-100 text-green-900",
  [TaskType.HARVESTING]: "bg-orange-100 text-orange-900",
  [TaskType.WATERING]: "bg-sky-100 text-sky-900",
  [TaskType.MULCHING]: "bg-stone-200 text-stone-900",
  [TaskType.TREATMENT]: "bg-violet-100 text-violet-900",
  [TaskType.OTHER]: "bg-neutral-100 text-neutral-900",
};

type TaskTypeBadgeProps = {
  type: TaskType;
  className?: string;
};

export const TaskTypeBadge = ({ type, className }: TaskTypeBadgeProps) => (
  <Badge className={cn(TASK_TYPE_COLORS[type], className)}>{TASK_TYPE_LABELS[type]}</Badge>
);
