import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  subtext?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtext,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] flex flex-col justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </div>

        {(trend || subtext) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold px-1.5 py-0.5 rounded-md",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
            <span className="text-text-secondary">
              {trend?.label || subtext}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
