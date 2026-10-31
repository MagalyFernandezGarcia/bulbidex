"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addDays, getOccurrencesInRange, toDateKey } from "@/lib/care-schedule";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const completionInputSchema = z.object({
  careTaskId: z.string().min(1),
  dueDateKey: z.iso.date(),
  isDone: z.boolean(),
});

export const setTaskCompletion = async (
  careTaskId: string,
  dueDateKey: string,
  isDone: boolean,
) => {
  await requireSession();

  const input = completionInputSchema.parse({ careTaskId, dueDateKey, isDone });
  const dueDate = new Date(`${input.dueDateKey}T00:00:00.000Z`);

  if (input.isDone) {
    const careTask = await prisma.careTask.findUnique({ where: { id: input.careTaskId } });
    if (!careTask) throw new Error("Cette tâche n'existe plus.");

    const isScheduledDate = getOccurrencesInRange(careTask, dueDate, addDays(dueDate, 1)).some(
      (occurrence) => toDateKey(occurrence.dueDate) === input.dueDateKey,
    );
    if (!isScheduledDate) throw new Error("Cette date ne correspond pas à la tâche.");

    await prisma.taskCompletion.upsert({
      where: { careTaskId_dueDate: { careTaskId: input.careTaskId, dueDate } },
      create: { careTaskId: input.careTaskId, dueDate },
      update: {},
    });
  } else {
    await prisma.taskCompletion.deleteMany({ where: { careTaskId: input.careTaskId, dueDate } });
  }

  revalidatePath("/", "layout");
};
