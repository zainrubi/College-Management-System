import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

export function Avatar({
  src,
  alt = "Avatar",
  name = "",
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusSizeClasses = {
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-2.5 h-2.5 bottom-0 right-0",
    lg: "w-3 h-3 bottom-0.5 right-0.5",
    xl: "w-4 h-4 bottom-1 right-1",
  };

  const statusColorClasses = {
    online: "bg-emerald-500 ring-white dark:ring-slate-900",
    offline: "bg-slate-400 ring-white dark:ring-slate-900",
    busy: "bg-rose-500 ring-white dark:ring-slate-900",
    away: "bg-amber-500 ring-white dark:ring-slate-900",
  };

  const getInitials = (str: string): string => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            "rounded-full object-cover border border-slate-200 dark:border-slate-800",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-slate-900 text-white font-bold flex items-center justify-center border border-slate-800 shadow-xs select-none",
            sizeClasses[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            "absolute rounded-full ring-2 shrink-0",
            statusSizeClasses[size],
            statusColorClasses[status]
          )}
        />
      )}
    </div>
  );
}
