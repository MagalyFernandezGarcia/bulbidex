"use client";

import { Trash2 } from "lucide-react";
import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { MONTH_NAMES, TASK_TYPE_LABELS } from "@/lib/labels";
import { CareTaskFormInput } from "@/lib/plant-form-schema";

export type CareTaskDraft = CareTaskFormInput & { key: string };

const MONTH_PART_OPTIONS: { value: MonthPart; label: string }[] = [
  { value: MonthPart.EARLY, label: "Début" },
  { value: MonthPart.MID, label: "Mi" },
  { value: MonthPart.LATE, label: "Fin" },
];

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: Recurrence.ONCE, label: "Une fois" },
  { value: Recurrence.EVERY_DAYS, label: "Tous les X jours" },
  { value: Recurrence.EVERY_WEEKS, label: "Toutes les X semaines" },
];

const TASK_TYPES = Object.values(TaskType);
const MONTH_PARTS = Object.values(MonthPart);
const RECURRENCES = Object.values(Recurrence);

const findOption = <Option extends string>(options: Option[], value: string) =>
  options.find((option) => option === value);

type CareTaskFieldsProps = {
  task: CareTaskDraft;
  index: number;
  errors: Record<string, string>;
  onChange: (task: CareTaskDraft) => void;
  onRemove: () => void;
};

export const CareTaskFields = ({
  task,
  index,
  errors,
  onChange,
  onRemove,
}: CareTaskFieldsProps) => {
  const idPrefix = `task-${task.key}`;
  const getError = (field: string) => errors[`careTasks.${index}.${field}`];
  const update = (changes: Partial<CareTaskDraft>) => onChange({ ...task, ...changes });

  const periodError =
    getError("startMonth") ?? getError("startPart") ?? getError("endMonth") ?? getError("endPart");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Tâche {index + 1}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={`Supprimer la tâche ${index + 1}`}
          >
            <Trash2 />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`${idPrefix}-type`} label="Type" error={getError("type")}>
            <NativeSelect
              id={`${idPrefix}-type`}
              className="w-full"
              value={task.type}
              onChange={(event) => {
                const type = findOption(TASK_TYPES, event.target.value);
                if (type) update({ type });
              }}
            >
              {TASK_TYPES.map((type) => (
                <NativeSelectOption key={type} value={type}>
                  {TASK_TYPE_LABELS[type]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>

          <FormField id={`${idPrefix}-title`} label="Titre (optionnel)" error={getError("title")}>
            <Input
              id={`${idPrefix}-title`}
              value={task.title}
              placeholder={TASK_TYPE_LABELS[task.type]}
              onChange={(event) => update({ title: event.target.value })}
            />
          </FormField>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Période</legend>
          <div className="grid grid-cols-[auto_1fr_2fr] items-center gap-2">
            <Label htmlFor={`${idPrefix}-start-part`} className="font-normal text-muted-foreground">
              Du
            </Label>
            <NativeSelect
              id={`${idPrefix}-start-part`}
              className="w-full"
              aria-label="Partie du mois de début"
              value={task.startPart}
              onChange={(event) => {
                const startPart = findOption(MONTH_PARTS, event.target.value);
                if (startPart) update({ startPart });
              }}
            >
              {MONTH_PART_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              className="w-full"
              aria-label="Mois de début"
              value={task.startMonth}
              onChange={(event) => update({ startMonth: Number(event.target.value) })}
            >
              {MONTH_NAMES.map((monthName, monthIndex) => (
                <NativeSelectOption key={monthName} value={monthIndex + 1}>
                  {monthName}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <Label htmlFor={`${idPrefix}-end-part`} className="font-normal text-muted-foreground">
              au
            </Label>
            <NativeSelect
              id={`${idPrefix}-end-part`}
              className="w-full"
              aria-label="Partie du mois de fin"
              value={task.endPart}
              onChange={(event) => {
                const endPart = findOption(MONTH_PARTS, event.target.value);
                if (endPart) update({ endPart });
              }}
            >
              {MONTH_PART_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              className="w-full"
              aria-label="Mois de fin"
              value={task.endMonth}
              onChange={(event) => update({ endMonth: Number(event.target.value) })}
            >
              {MONTH_NAMES.map((monthName, monthIndex) => (
                <NativeSelectOption key={monthName} value={monthIndex + 1}>
                  {monthName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {periodError && <p className="text-sm text-destructive">{periodError}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`${idPrefix}-recurrence`} label="Fréquence" error={getError("recurrence")}>
            <NativeSelect
              id={`${idPrefix}-recurrence`}
              className="w-full"
              value={task.recurrence}
              onChange={(event) => {
                const recurrence = findOption(RECURRENCES, event.target.value);
                if (!recurrence) return;
                update({
                  recurrence,
                  interval: recurrence === Recurrence.ONCE ? null : (task.interval ?? 1),
                });
              }}
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>

          {task.recurrence !== Recurrence.ONCE && (
            <FormField
              id={`${idPrefix}-interval`}
              label={
                task.recurrence === Recurrence.EVERY_DAYS
                  ? "Tous les … jours"
                  : "Toutes les … semaines"
              }
              error={getError("interval")}
            >
              <Input
                id={`${idPrefix}-interval`}
                type="number"
                inputMode="numeric"
                min={1}
                max={365}
                required
                value={task.interval ?? ""}
                aria-invalid={getError("interval") ? true : undefined}
                onChange={(event) =>
                  update({
                    interval: event.target.value === "" ? null : Number(event.target.value),
                  })
                }
              />
            </FormField>
          )}
        </div>

        <FormField
          id={`${idPrefix}-instructions`}
          label="Instructions (optionnel)"
          error={getError("instructions")}
        >
          <Textarea
            id={`${idPrefix}-instructions`}
            value={task.instructions}
            placeholder="Comment faire, matériel, conseils…"
            onChange={(event) => update({ instructions: event.target.value })}
          />
        </FormField>
      </CardContent>
    </Card>
  );
};
