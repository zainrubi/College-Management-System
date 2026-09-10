"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  FileText,
  Bell,
  BarChart3,
  LogOut,
  Calendar,
  Layers,
  UserCheck,
  CreditCard,
  ChevronLeft,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

export interface SidebarProps {
  role: UserRole;
  activePath?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  role,
  activePath = "",
  collapsed = false,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const getRoleNavItems = (): NavItem[] => {
    switch (role) {
      case "admin":
        return [
          { label: "Dashboard", href: "#admin-overview", icon: <LayoutDashboard className="w-5 h-5" />, active: activePath.includes("overview") || true },
          { label: "Students", href: "#students", icon: <Users className="w-5 h-5" /> },
          { label: "Teachers & Staff", href: "#teachers", icon: <UserCheck className="w-5 h-5" /> },
          { label: "Admissions", href: "#admissions", icon: <FileText className="w-5 h-5" />, badge: "12 New" },
          { label: "Fee Management", href: "#fee-mgmt", icon: <Receipt className="w-5 h-5" /> },
          { label: "Academic Courses", href: "#courses", icon: <BookOpen className="w-5 h-5" /> },
          { label: "Attendance", href: "#attendance", icon: <Calendar className="w-5 h-5" /> },
          { label: "Handouts & Docs", href: "#handouts", icon: <Layers className="w-5 h-5" /> },
          { label: "Notifications", href: "#notifications", icon: <Bell className="w-5 h-5" /> },
          { label: "Reports & Analytics", href: "#reports", icon: <BarChart3 className="w-5 h-5" /> },
        ];
      case "teacher":
        return [
          { label: "Dashboard", href: "#teacher-overview", icon: <LayoutDashboard className="w-5 h-5" />, active: true },
          { label: "Assigned Courses", href: "#my-courses", icon: <BookOpen className="w-5 h-5" /> },
          { label: "My Students", href: "#my-students", icon: <Users className="w-5 h-5" /> },
          { label: "Mark Attendance", href: "#attendance", icon: <Calendar className="w-5 h-5" /> },
          { label: "Course Handouts", href: "#handouts", icon: <Layers className="w-5 h-5" /> },
          { label: "Announcements", href: "#notifications", icon: <Bell className="w-5 h-5" /> },
        ];
      case "student":
        return [
          { label: "Dashboard", href: "#student-overview", icon: <LayoutDashboard className="w-5 h-5" />, active: true },
          { label: "Student Profile", href: "#profile", icon: <Users className="w-5 h-5" /> },
          { label: "Fee Vouchers & Pay", href: "#fees", icon: <CreditCard className="w-5 h-5" />, badge: "1 Unpaid" },
          { label: "Payment History", href: "#payments", icon: <Receipt className="w-5 h-5" /> },
          { label: "Attendance Record", href: "#attendance", icon: <Calendar className="w-5 h-5" /> },
          { label: "Study Handouts", href: "#handouts", icon: <BookOpen className="w-5 h-5" /> },
          { label: "Notifications", href: "#notifications", icon: <Bell className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getRoleNavItems();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white text-text-primary border-r border-border transition-all duration-300 z-30 shrink-0 h-screen sticky top-0",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h2 className="text-sm font-bold text-text-primary tracking-tight leading-tight">
                Superior Colleges
              </h2>
              <p className="text-[10px] text-text-secondary font-medium capitalize tracking-wider">
                {role} Portal
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation items list */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer group",
              item.active
                ? "bg-primary-light text-primary shadow-sm border border-primary/20"
                : "text-text-secondary hover:text-text-primary hover:bg-background-secondary"
            )}
          >
            <span className={cn("shrink-0", item.active ? "text-primary" : "text-text-secondary group-hover:text-text-primary")}>
              {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span
                className={cn(
                  "ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
                  item.active
                    ? "bg-primary text-white"
                    : "bg-background-secondary text-text-secondary border border-border"
                )}
              >
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Footer User Info / Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
