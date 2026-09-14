import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BackToHomeProps {
  className?: string;
  variant?: "link" | "button";
}

export function BackToHome({ className, variant = "link" }: BackToHomeProps) {
  if (variant === "button") {
    return (
      <Link
        href="/"
        className={cn(
          "inline-flex min-h-11 items-center gap-2 px-3.5 rounded-lg text-xs font-semibold text-text-primary bg-background-secondary hover:bg-primary-light transition-colors shadow-xs",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors py-1",
        className
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Back to Home</span>
    </Link>
  );
}
