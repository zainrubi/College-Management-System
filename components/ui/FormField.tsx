import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id?: string;
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  helperText,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
