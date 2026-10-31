"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { CareTaskFormState, deleteCareTask, updateCareTask } from "@/actions/care-tasks";
import { CareTaskDraft, CareTaskFieldset } from "@/components/care-task-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

enum DialogPhase {
  Editing = "editing",
  ConfirmingDelete = "confirming-delete",
}

type EditCareTaskDialogProps = {
  careTaskId: string;
  taskTitle: string;
  initialValues: CareTaskDraft;
};

const initialState: CareTaskFormState = { isSaved: false };

const DELETE_ERROR_MESSAGE = "La suppression a échoué. Réessayez.";

export const EditCareTaskDialog = ({
  careTaskId,
  taskTitle,
  initialValues,
}: EditCareTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState(DialogPhase.Editing);
  const [draft, setDraft] = useState(initialValues);
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) {
      setPhase(DialogPhase.Editing);
      setDraft(initialValues);
      setState(initialState);
    }
    setIsOpen(nextIsOpen);
  };

  const save = () =>
    startTransition(async () => {
      const result = await updateCareTask(careTaskId, draft);
      setState(result);
      if (result.isSaved) setIsOpen(false);
    });

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteCareTask(careTaskId);
        setIsOpen(false);
      } catch {
        setState({ isSaved: false, message: DELETE_ERROR_MESSAGE });
      }
    });

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Pencil />
        Modifier
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {phase === DialogPhase.Editing ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <DialogHeader>
              <DialogTitle>Modifier la tâche</DialogTitle>
              <DialogDescription>{taskTitle}</DialogDescription>
            </DialogHeader>
            <CareTaskFieldset
              task={draft}
              getError={(field) => fieldErrors[field]}
              onChange={setDraft}
            />
            {state.message && <p className="text-sm text-destructive">{state.message}</p>}
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                disabled={isPending}
                onClick={() => {
                  setState(initialState);
                  setPhase(DialogPhase.ConfirmingDelete);
                }}
              >
                <Trash2 />
                Supprimer la tâche
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Annuler
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Supprimer « {taskTitle} » ?</DialogTitle>
              <DialogDescription>
                La tâche et son historique seront définitivement supprimés.
              </DialogDescription>
            </DialogHeader>
            {state.message && <p className="text-sm text-destructive">{state.message}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setPhase(DialogPhase.Editing)}
              >
                Retour
              </Button>
              <Button type="button" variant="destructive" disabled={isPending} onClick={remove}>
                {isPending ? "Suppression…" : "Supprimer"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
