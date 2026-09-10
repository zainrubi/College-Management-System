import React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Divider({
  orientation = "horizontal",
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "w-px h-full bg-slate-200 dark:bg-slate-800 self-stretch shrink-0",
          className
        )}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center gap-3 w-full my-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider", className)}
        {...props}
      >
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span>{label}</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div
      className={cn("w-full h-px bg-slate-200 dark:bg-slate-800 my-2 shrink-0", className)}
      {...props}
    />
  );
}
