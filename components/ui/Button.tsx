import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm border border-transparent",
      secondary:
        "bg-background-secondary text-text-primary hover:bg-primary-light active:bg-primary-light border border-transparent",
      outline:
        "border border-primary/50 bg-white text-primary hover:bg-primary-light hover:text-primary-dark hover:border-primary",
      ghost:
        "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent",
      link: "text-primary-dark hover:underline p-0 h-auto bg-transparent",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-11 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0 text-sm justify-center",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          size !== "icon" || variant === "link" ? sizeStyles[size] : sizeStyles.icon,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
