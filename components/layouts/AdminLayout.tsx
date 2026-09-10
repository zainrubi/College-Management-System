"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { X, Building2 } from "lucide-react";
import { Footer } from "./Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export interface AdminLayoutProps {
  children: React.ReactNode;
  collegeName?: string;
  portalName?: string;
  adminName?: string;
  adminRole?: string;
  adminEmail?: string;
}

export function AdminLayout({
  children,
  collegeName = "Apex Institute",
  portalName = "Admin Console",
  adminName = "Kashif Shahzad",
  adminRole = "Administrator",
  adminEmail = "kashif.accounts@apex.edu.pk",
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Prevent background scrolling when mobile drawer is active
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileDrawerOpen]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen flex bg-background-secondary text-text-primary font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <AdminSidebar
        collegeName={collegeName}
        portalName={portalName}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex"
      />

      {/* Responsive Mobile Navigation Drawer (Off-Canvas) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-300 border-r border-border">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-bold text-xs text-text-primary">
                    {collegeName}
                  </h3>
                  <p className="text-[10px] text-text-secondary">{portalName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar
                collegeName={collegeName}
                portalName={portalName}
                collapsed={false}
                className="w-full border-r-0 h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          adminName={adminName}
          adminRole={adminRole}
          adminEmail={adminEmail}
          onOpenMobileNav={() => setMobileDrawerOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {children}
        </main>

        <Footer variant="dashboard" />
      </div>
      </div>
    </ProtectedRoute>
  );
}
