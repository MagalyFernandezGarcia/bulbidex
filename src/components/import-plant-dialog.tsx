"use client";

import { ClipboardPaste } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { PlantFormInput } from "@/lib/plant-form-schema";
import { parsePlantImport, PlantImportResult } from "@/lib/plant-import";

type ImportPlantDialogProps = {
  onImport: (values: PlantFormInput) => void;
};

export const ImportPlantDialog = ({ onImport }: ImportPlantDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<Extract<PlantImportResult, { success: false }>>();

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) {
      setText("");
      setError(undefined);
    }
    setIsOpen(nextIsOpen);
  };

  const importText = () => {
    const result = parsePlantImport(text);
    if (!result.success) {
      setError(result);
      return;
    }
    onImport(result.values);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" className="w-fit" />}>
        <ClipboardPaste />
        Importer depuis Claude
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            importText();
          }}
        >
          <DialogHeader>
            <DialogTitle>Importer depuis Claude</DialogTitle>
            <DialogDescription>
              Collez la réponse de Claude. Le formulaire sera rempli et remplacera ce qui a déjà été
              saisi — vous pourrez tout vérifier avant d&apos;enregistrer.
            </DialogDescription>
          </DialogHeader>
          <FormField id="plant-import" label="Réponse de Claude">
            <Textarea
              id="plant-import"
              required
              value={text}
              className="min-h-48 font-mono text-xs"
              placeholder='{ "name": "Rosier", … }'
              aria-invalid={error ? true : undefined}
              onChange={(event) => setText(event.target.value)}
            />
          </FormField>
          {error && (
            <div role="alert" className="flex flex-col gap-1 text-sm text-destructive">
              <p>{error.message}</p>
              {error.details.length > 0 && (
                <ul className="list-disc pl-5">
                  {error.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Annuler</DialogClose>
            <Button type="submit">Remplir le formulaire</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
