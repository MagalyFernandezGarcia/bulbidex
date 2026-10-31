import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export const FormField = ({ id, label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-sm text-destructive">
        {error}
      </p>
    )}
  </div>
);
