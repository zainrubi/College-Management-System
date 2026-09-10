"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Search, Bell, Menu, User, Sparkles } from "lucide-react";
import { Dropdown } from "../ui/Dropdown";
import { BackToHome } from "../ui/BackToHome";

export interface TopbarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  onOpenMobileNav?: () => void;
  className?: string;
}

export function Topbar({
  role,
  userName = "User",
  userEmail = "user@apex.edu.pk",
  onOpenMobileNav,
  className,
}: TopbarProps) {
  const roleDisplayNames: Record<UserRole, string> = {
    public_visitor: "Public Visitor",
    applicant: "Applicant Portal",
    student: "Student Portal",
    teacher: "Faculty Portal",
    admin: "System Administrator",
  };

  return (
    <header
      className={cn(
        "h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-[0_1px_0_rgba(17,24,39,0.03)]",
        className
      )}
    >
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-background-secondary transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, courses, vouchers, records..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background-secondary text-text-primary outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        <BackToHome className="hidden sm:inline-flex" />

        {/* Mock Environment Indicator */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Demo Mode
        </span>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-text-secondary hover:bg-background-secondary transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-border" />

        {/* User Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-3 p-1 rounded-xl hover:bg-background-secondary transition-colors text-left cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block leading-tight pr-1">
                <p className="text-xs font-semibold text-text-primary">
                  {userName}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {roleDisplayNames[role]}
                </p>
              </div>
            </button>
          }
          items={[
            {
              label: `Signed in as ${userEmail}`,
              disabled: true,
              onClick: () => {},
            },
            {
              label: "My Profile",
              icon: <User className="w-4 h-4" />,
              onClick: () => {},
            },
            {
              label: "Sign Out",
              danger: true,
              onClick: () => {},
            },
          ]}
        />
      </div>
    </header>
  );
}
