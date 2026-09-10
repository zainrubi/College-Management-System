"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  id?: string;
  title: string;
  message?: string;
  variant?: "success" | "error" | "info";
  durationMs?: number;
  onClose?: () => void;
}

export function Toast({
  title,
  message,
  variant = "success",
  durationMs = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (durationMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [durationMs, onClose]);

  if (!visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 text-sm max-w-sm transition-all animate-in slide-in-from-bottom-2 duration-300"
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        <h5 className="font-semibold text-slate-100">{title}</h5>
        {message && <p className="text-xs text-slate-400 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
