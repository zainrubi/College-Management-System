import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  label?: string;
  type?: "spinner" | "skeleton";
  className?: string;
}

export function LoadingState({
  label = "Loading data...",
  type = "spinner",
  className,
}: LoadingStateProps) {
  if (type === "skeleton") {
    return (
      <div className={cn("space-y-3 animate-pulse w-full", className)}>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 gap-3",
        className
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
