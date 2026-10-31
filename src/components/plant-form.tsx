"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";
import { PlantFormState } from "@/actions/plants";
import { CareTaskDraft, CareTaskFields } from "@/components/care-task-fields";
import { FormField } from "@/components/form-field";
import { PhotoField } from "@/components/photo-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlantFormInput } from "@/lib/plant-form-schema";
import { preparePlantPhoto } from "@/lib/resize-image";

type PlantFormProps = {
  action: (previousState: PlantFormState, formData: FormData) => Promise<PlantFormState>;
  initialValues: PlantFormInput;
  initialPhotoUrl?: string | null;
  cancelHref: string;
  submitLabel: string;
};

type PlantTextField = Exclude<keyof PlantFormInput, "careTasks">;

const PLANT_TEXT_FIELDS: { field: PlantTextField; label: string; placeholder?: string }[] = [
  { field: "variety", label: "Variété", placeholder: "Pierre de Ronsard" },
  { field: "location", label: "Emplacement", placeholder: "Massif nord, potager…" },
  { field: "sunExposure", label: "Exposition", placeholder: "Plein soleil, mi-ombre…" },
  { field: "soil", label: "Sol", placeholder: "Drainé, argileux…" },
];

const createEmptyCareTask = (): CareTaskDraft => {
  const currentMonth = new Date().getMonth() + 1;
  return {
    key: crypto.randomUUID(),
    type: TaskType.PRUNING,
    title: "",
    instructions: "",
    startMonth: currentMonth,
    startPart: MonthPart.EARLY,
    endMonth: currentMonth,
    endPart: MonthPart.LATE,
    recurrence: Recurrence.ONCE,
    interval: null,
  };
};

const initialState: PlantFormState = {};

enum PhotoStatus {
  Unchanged = "unchanged",
  Processing = "processing",
  Selected = "selected",
  Removed = "removed",
}

type PhotoState =
  | { status: PhotoStatus.Unchanged | PhotoStatus.Processing | PhotoStatus.Removed }
  | { status: PhotoStatus.Selected; photo: Blob; thumbnail: Blob; previewUrl: string };

const getPhotoFileName = (name: string, blob: Blob) =>
  `${name}.${blob.type === "image/webp" ? "webp" : "jpg"}`;

export const PlantForm = ({
  action,
  initialValues,
  initialPhotoUrl = null,
  cancelHref,
  submitLabel,
}: PlantFormProps) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { careTasks: initialCareTasks, ...initialPlantValues } = initialValues;
  const [plantValues, setPlantValues] = useState(initialPlantValues);
  const [careTasks, setCareTasks] = useState<CareTaskDraft[]>(() =>
    initialCareTasks.map((task) => ({ ...task, key: task.id ?? crypto.randomUUID() })),
  );

  const [photoState, setPhotoState] = useState<PhotoState>({ status: PhotoStatus.Unchanged });
  const [photoError, setPhotoError] = useState<string>();

  const fieldErrors = state.fieldErrors ?? {};
  const isPhotoProcessing = photoState.status === PhotoStatus.Processing;
  const photoPreviewUrl =
    photoState.status === PhotoStatus.Selected
      ? photoState.previewUrl
      : photoState.status === PhotoStatus.Removed
        ? null
        : initialPhotoUrl;

  const replacePhotoState = (nextState: PhotoState) =>
    setPhotoState((previousState) => {
      if (previousState.status === PhotoStatus.Selected) {
        URL.revokeObjectURL(previousState.previewUrl);
      }
      return nextState;
    });

  const selectPhoto = async (file: File) => {
    setPhotoError(undefined);
    replacePhotoState({ status: PhotoStatus.Processing });
    try {
      const { photo, thumbnail } = await preparePlantPhoto(file);
      replacePhotoState({
        status: PhotoStatus.Selected,
        photo,
        thumbnail,
        previewUrl: URL.createObjectURL(photo),
      });
    } catch {
      replacePhotoState({ status: PhotoStatus.Unchanged });
      setPhotoError("Impossible de lire cette image. Essayez une photo au format JPEG ou PNG.");
    }
  };

  const removePhoto = () => {
    setPhotoError(undefined);
    replacePhotoState({ status: PhotoStatus.Removed });
  };

  const submit = (formData: FormData) => {
    if (photoState.status === PhotoStatus.Selected) {
      formData.set("photo", photoState.photo, getPhotoFileName("photo", photoState.photo));
      formData.set(
        "photoThumbnail",
        photoState.thumbnail,
        getPhotoFileName("thumbnail", photoState.thumbnail),
      );
    } else if (photoState.status === PhotoStatus.Removed && initialPhotoUrl) {
      formData.set("removePhoto", "true");
    }
    formAction(formData);
  };
  const payload = JSON.stringify({
    ...plantValues,
    careTasks: careTasks.map((task) => ({ ...task, key: undefined })),
  });

  const updatePlantValue = (field: PlantTextField, value: string) =>
    setPlantValues((previousValues) => ({ ...previousValues, [field]: value }));

  return (
    <form action={submit} className="flex flex-col gap-8">
      <input type="hidden" name="payload" value={payload} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Informations</h2>
        <PhotoField
          previewUrl={photoPreviewUrl}
          isProcessing={isPhotoProcessing}
          error={photoError ?? fieldErrors.photo}
          onSelectFile={selectPhoto}
          onRemove={removePhoto}
        />
        <FormField id="name" label="Nom" error={fieldErrors.name}>
          <Input
            id="name"
            required
            value={plantValues.name}
            placeholder="Rosier, tomate cerise…"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            onChange={(event) => updatePlantValue("name", event.target.value)}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANT_TEXT_FIELDS.map(({ field, label, placeholder }) => (
            <FormField key={field} id={field} label={label} error={fieldErrors[field]}>
              <Input
                id={field}
                value={plantValues[field]}
                placeholder={placeholder}
                onChange={(event) => updatePlantValue(field, event.target.value)}
              />
            </FormField>
          ))}
        </div>
        <FormField id="watering" label="Arrosage" error={fieldErrors.watering}>
          <Textarea
            id="watering"
            value={plantValues.watering}
            placeholder="Besoins en eau, fréquence en été…"
            onChange={(event) => updatePlantValue("watering", event.target.value)}
          />
        </FormField>
        <FormField id="notes" label="Notes" error={fieldErrors.notes}>
          <Textarea
            id="notes"
            value={plantValues.notes}
            className="min-h-24"
            onChange={(event) => updatePlantValue("notes", event.target.value)}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Entretien</h2>
        {careTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ajoutez les tâches à faire pour cette plante (taille, semis, arrosage…).
          </p>
        )}
        {careTasks.map((task, index) => (
          <CareTaskFields
            key={task.key}
            task={task}
            index={index}
            errors={fieldErrors}
            onChange={(updatedTask) =>
              setCareTasks((previousTasks) =>
                previousTasks.map((previousTask) =>
                  previousTask.key === updatedTask.key ? updatedTask : previousTask,
                ),
              )
            }
            onRemove={() =>
              setCareTasks((previousTasks) =>
                previousTasks.filter((previousTask) => previousTask.key !== task.key),
              )
            }
          />
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => setCareTasks((previousTasks) => [...previousTasks, createEmptyCareTask()])}
        >
          <Plus />
          Ajouter une tâche
        </Button>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        {state.message && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
            Annuler
          </Link>
          <Button type="submit" disabled={isPending || isPhotoProcessing}>
            {isPending ? "Enregistrement…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};
