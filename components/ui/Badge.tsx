import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-background-secondary text-text-primary border-transparent",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning:
      "bg-amber-50 text-amber-800 border-amber-200",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200",
    info:
      "bg-primary-light text-primary border-primary/20",
    secondary:
      "bg-primary-light text-primary-dark border-primary/20",
    outline:
      "bg-transparent text-text-primary border-border",
  };

  const dotColors = {
    default: "bg-slate-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    secondary: "bg-primary",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border tracking-wide uppercase font-semibold transition-colors shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
