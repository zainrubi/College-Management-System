"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { ArrowRight } from "lucide-react";

export interface StudentLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  studentName?: string;
  studentRollNumber?: string;
  unpaidVoucherCount?: number;
}

export function StudentLayout({
  children,
  activePath = "/student",
  studentName = "Ali Hasan Siddiqui",
  studentRollNumber = "BCS-F24-014",
  unpaidVoucherCount = 1,
}: StudentLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background-secondary text-text-primary">
      {/* Desktop Left Sidebar */}
      <Sidebar
        role="student"
        activePath={activePath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile Nav */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role="student"
        activePath={activePath}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role="student"
          userName={`${studentName} (${studentRollNumber})`}
          userEmail="ali.siddiqui@student.apex.edu.pk"
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        {/* Optional Student Fee Notice Banner */}
        {unpaidVoucherCount > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <span>
                <strong>Notice:</strong> You have {unpaidVoucherCount} active fee voucher pending. Please review your fee schedule to prevent late payment surcharges.
              </span>
              <a href="#fees" className="font-semibold underline flex items-center gap-1 hover:text-amber-900 dark:hover:text-amber-200">
                View Voucher <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <Footer variant="dashboard" />
      </div>
    </div>
  );
}
