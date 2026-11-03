"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { deleteGardenTool, GardenToolFormState, saveGardenTool } from "@/actions/garden-tools";
import { FormField } from "@/components/form-field";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GardenToolFormInput } from "@/lib/garden-tool-schema";

enum DialogPhase {
  Editing = "editing",
  ConfirmingDelete = "confirming-delete",
}

type GardenTool = {
  id: string;
  name: string;
  notes: string | null;
};

type GardenToolDialogProps = {
  gardenTool?: GardenTool;
};

const initialState: GardenToolFormState = { isSaved: false };

const DELETE_ERROR_MESSAGE = "La suppression a échoué. Réessayez.";

const toDraft = (gardenTool?: GardenTool): GardenToolFormInput => ({
  name: gardenTool?.name ?? "",
  notes: gardenTool?.notes ?? "",
});

export const GardenToolDialog = ({ gardenTool }: GardenToolDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState(DialogPhase.Editing);
  const [draft, setDraft] = useState(() => toDraft(gardenTool));
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const fieldIdPrefix = useId();
  const nameFieldId = `${fieldIdPrefix}-name`;
  const notesFieldId = `${fieldIdPrefix}-notes`;

  const isEditing = gardenTool !== undefined;

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) {
      setPhase(DialogPhase.Editing);
      setDraft(toDraft(gardenTool));
      setState(initialState);
    }
    setIsOpen(nextIsOpen);
  };

  const save = () =>
    startTransition(async () => {
      const result = await saveGardenTool(gardenTool?.id ?? null, draft);
      setState(result);
      if (result.isSaved) setIsOpen(false);
    });

  const remove = () => {
    if (!gardenTool) return;
    startTransition(async () => {
      try {
        await deleteGardenTool(gardenTool.id);
        setIsOpen(false);
      } catch {
        setState({ isSaved: false, message: DELETE_ERROR_MESSAGE });
      }
    });
  };

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {isEditing ? (
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
          <Pencil />
          Modifier
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>
          <Plus />
          Ajouter un outil
        </DialogTrigger>
      )}
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
              <DialogTitle>{isEditing ? "Modifier l'outil" : "Ajouter un outil"}</DialogTitle>
              <DialogDescription>
                Claude s&apos;appuie sur cette liste pour vous conseiller l&apos;outil adapté à
                chaque tâche.
              </DialogDescription>
            </DialogHeader>
            <FormField id={nameFieldId} label="Nom" error={fieldErrors.name}>
              <Input
                id={nameFieldId}
                required
                value={draft.name}
                placeholder="Sécateur, bêche, scie d'élagage…"
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? `${nameFieldId}-error` : undefined}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </FormField>
            <FormField id={notesFieldId} label="Notes" error={fieldErrors.notes}>
              <Textarea
                id={notesFieldId}
                value={draft.notes}
                placeholder="Marque, taille, état, à aiguiser…"
                className="min-h-24"
                aria-invalid={fieldErrors.notes ? true : undefined}
                aria-describedby={fieldErrors.notes ? `${notesFieldId}-error` : undefined}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              />
            </FormField>
            {state.message && <p className="text-sm text-destructive">{state.message}</p>}
            <DialogFooter className={isEditing ? "sm:justify-between" : undefined}>
              {isEditing && (
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
                  Supprimer l&apos;outil
                </Button>
              )}
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
              <DialogTitle>Supprimer « {gardenTool?.name} » ?</DialogTitle>
              <DialogDescription>L&apos;outil sera définitivement supprimé.</DialogDescription>
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
