"use client";

import { Camera, ImageIcon, Sprout, Trash2 } from "lucide-react";
import Image from "next/image";
import { ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

type PhotoFieldProps = {
  previewUrl: string | null;
  isProcessing: boolean;
  error?: string;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
};

export const PhotoField = ({
  previewUrl,
  isProcessing,
  error,
  onSelectFile,
  onRemove,
}: PhotoFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelectFile(file);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-green-700">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Photo de la plante"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <Sprout className="size-10" />
        )}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm">
            Préparation…
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label className={buttonVariants({ variant: "outline" })}>
            <Camera />
            Prendre une photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={isProcessing}
              onChange={handleChange}
            />
          </label>
          <label className={buttonVariants({ variant: "outline" })}>
            <ImageIcon />
            Choisir dans la galerie
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isProcessing}
              onChange={handleChange}
            />
          </label>
          {previewUrl && (
            <Button type="button" variant="ghost" onClick={onRemove} disabled={isProcessing}>
              <Trash2 />
              Retirer
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
};
