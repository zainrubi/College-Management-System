"use client";

import React, { useEffect } from "react";
import { UserRole } from "@/types";
import { X, GraduationCap } from "lucide-react";
import { Sidebar } from "./Sidebar";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  activePath?: string;
}

export function MobileNav({ isOpen, onClose, role, activePath }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-text-primary text-sm">Superior Colleges</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar role={role} activePath={activePath} collapsed={false} className="w-full border-r-0 h-auto" />
        </div>
      </div>
    </div>
  );
}
