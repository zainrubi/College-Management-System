"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";

export interface TeacherLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  teacherName?: string;
  teacherEmail?: string;
}

export function TeacherLayout({
  children,
  activePath = "/teacher",
  teacherName = "Dr. Muhammad Shahbaz",
  teacherEmail = "shahbaz@apex.edu.pk",
}: TeacherLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background-secondary text-text-primary">
      {/* Desktop Left Sidebar */}
      <Sidebar
        role="teacher"
        activePath={activePath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Nav */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role="teacher"
        activePath={activePath}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role="teacher"
          userName={teacherName}
          userEmail={teacherEmail}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <Footer variant="dashboard" />
      </div>
    </div>
  );
}
