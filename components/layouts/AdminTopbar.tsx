"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";
import { Dropdown } from "../ui/Dropdown";
import { BackToHome } from "../ui/BackToHome";

export interface AdminTopbarProps {
  adminName?: string;
  adminRole?: string;
  adminEmail?: string;
  onOpenMobileNav?: () => void;
  className?: string;
}

export function AdminTopbar({
  adminName = "Kashif Shahzad",
  adminRole = "Administrator",
  adminEmail = "kashif.accounts@apex.edu.pk",
  onOpenMobileNav,
  className,
}: AdminTopbarProps) {
  return (
    <header
      className={cn(
        "h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-[0_1px_0_rgba(17,24,39,0.03)]",
        className
      )}
    >
      {/* Left Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileNav && (
          <IconButton
            aria-label="Open navigation menu"
            onClick={onOpenMobileNav}
            className="lg:hidden shrink-0"
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </IconButton>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, staff, fee vouchers, courses..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background-secondary text-text-primary placeholder:text-text-secondary outline-none border border-border focus:border-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Header Controls: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <BackToHome className="hidden sm:inline-flex" />

        {/* Notification Icon Button */}
        <IconButton aria-label="Notifications" badge={3}>
          <Bell className="w-5 h-5" />
        </IconButton>

        <div className="h-5 w-px bg-border hidden sm:block mx-1" />

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-background-secondary transition-colors text-left cursor-pointer group">
              <Avatar name={adminName} size="md" status="online" />
              <div className="hidden md:block leading-tight pr-1">
                <p className="text-xs font-bold text-text-primary group-hover:text-text-secondary">
                  {adminName}
                </p>
                <p className="text-[11px] font-medium text-text-secondary">
                  {adminRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden md:block" />
            </button>
          }
          items={[
            {
              label: adminEmail,
              disabled: true,
              onClick: () => {},
            },
            {
              label: "Admin Settings",
              icon: <Settings className="w-4 h-4" />,
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
              icon: <LogOut className="w-4 h-4" />,
              onClick: () => {},
            },
          ]}
        />
      </div>
    </header>
  );
}
