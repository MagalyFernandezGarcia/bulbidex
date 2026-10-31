"use client";

import { useOptimistic, useTransition } from "react";
import { setTaskCompletion } from "@/actions/task-completions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type OccurrenceCheckboxProps = {
  careTaskId: string;
  dueDateKey: string;
  isDone: boolean;
  label: string;
  isHighlighted?: boolean;
};

export const OccurrenceCheckbox = ({
  careTaskId,
  dueDateKey,
  isDone,
  label,
  isHighlighted = false,
}: OccurrenceCheckboxProps) => {
  const [optimisticIsDone, setOptimisticIsDone] = useOptimistic(isDone);
  const [isPending, startTransition] = useTransition();

  const toggle = (checked: boolean) =>
    startTransition(async () => {
      setOptimisticIsDone(checked);
      await setTaskCompletion(careTaskId, dueDateKey, checked);
    });

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors select-none hover:bg-muted",
        optimisticIsDone && "border-green-200 bg-green-50 text-green-900 hover:bg-green-100",
        isHighlighted && !optimisticIsDone && "border-green-700 font-medium",
        isPending && "opacity-70",
      )}
    >
      <Checkbox
        checked={optimisticIsDone}
        onCheckedChange={toggle}
        className="data-checked:border-green-700 data-checked:bg-green-700"
      />
      {label}
    </label>
  );
};
