"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Layers,
  BookMarked,
  BookOpen,
  CalendarCheck,
  FolderDown,
  Wallet,
  Receipt,
  CreditCard,
  BadgePercent,
  BarChart3,
  Bell,
  Megaphone,
  Settings,
  ChevronLeft,
  LogOut,
  Building2,
} from "lucide-react";

export interface NavGroup {
  groupTitle: string;
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[];
}

export interface AdminSidebarProps {
  collegeName?: string;
  portalName?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function AdminSidebar({
  collegeName = "Apex Institute",
  portalName = "Admin Console",
  collapsed = false,
  onToggleCollapse,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupTitle: "MAIN",
      items: [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: "PEOPLE",
      items: [
        { label: "Students", href: "/admin/students", icon: <Users className="w-4 h-4" /> },
        { label: "Admissions", href: "/admin/admissions", icon: <FileText className="w-4 h-4" />, badge: "12" },
        { label: "Teachers & Staff", href: "/admin/teachers", icon: <UserCheck className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: "ACADEMICS",
      items: [
        { label: "Programs", href: "/admin/programs", icon: <Layers className="w-4 h-4" /> },
        { label: "Subjects", href: "/admin/subjects", icon: <BookMarked className="w-4 h-4" /> },
        { label: "Courses", href: "/admin/courses", icon: <BookOpen className="w-4 h-4" /> },
        { label: "Attendance", href: "/admin/attendance", icon: <CalendarCheck className="w-4 h-4" /> },
        { label: "Handouts", href: "/admin/handouts", icon: <FolderDown className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: "FINANCE",
      items: [
        { label: "Fee Management", href: "/admin/fees", icon: <Wallet className="w-4 h-4" /> },
        { label: "Fee Vouchers", href: "/admin/vouchers", icon: <Receipt className="w-4 h-4" /> },
        { label: "Payments", href: "/admin/payments", icon: <CreditCard className="w-4 h-4" /> },
        { label: "Concessions", href: "/admin/concessions", icon: <BadgePercent className="w-4 h-4" /> },
        { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: "COMMUNICATION",
      items: [
        { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-4 h-4" /> },
        { label: "Announcements", href: "/admin/announcements", icon: <Megaphone className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: "SYSTEM",
      items: [
        { label: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const isLinkActive = (href: string): boolean => {
    if (!pathname) return false;
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Admin Navigation Sidebar"
      className={cn(
        "flex flex-col bg-white border-r border-border transition-all duration-300 z-30 shrink-0 h-screen sticky top-0 shadow-[0_1px_2px_rgba(17,24,39,0.04)] select-none",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border shrink-0">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <Building2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="truncate leading-tight">
              <h2 className="text-xs font-bold text-text-primary tracking-tight truncate">
                {collegeName}
              </h2>
              <p className="text-[11px] font-medium text-text-secondary truncate">
                {portalName}
              </p>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation Group Items List */}
      <nav aria-label="Main Admin Navigation" className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-none">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {group.groupTitle}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group cursor-pointer",
                      active
                        ? "bg-primary-light text-primary font-semibold shadow-xs border border-primary/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-secondary"
                    )}
                  >
                    <span className={cn("shrink-0 transition-colors", active ? "text-primary" : "text-text-secondary group-hover:text-text-primary")}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                          active
                            ? "bg-primary text-white"
                            : "bg-background-secondary text-text-secondary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile Sign-Out */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
