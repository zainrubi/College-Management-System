import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  badge?: string | number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      badge,
      children,
      disabled,
      type = "button",
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark border border-transparent",
      secondary:
        "bg-background-secondary text-text-primary hover:bg-primary-light border border-transparent",
      outline:
        "border border-border bg-white text-text-primary hover:bg-primary-light hover:border-primary",
      ghost:
        "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent",
    };

    const sizeStyles = {
      sm: "h-8 w-8 text-xs",
      md: "h-9 w-9 text-sm",
      lg: "h-11 w-11 text-base",
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
