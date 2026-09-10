import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border bg-white text-text-primary text-sm transition-colors",
          "p-3.5 outline-none placeholder:text-text-secondary/70 resize-y min-h-[80px]",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-70",
          error
            ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20"
            : "border-border",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
