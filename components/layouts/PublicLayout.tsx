"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import { GraduationCap, Menu, X, ArrowRight, Phone, Mail, LogIn } from "lucide-react";
import { Button } from "../ui/Button";
import { Footer } from "./Footer";
import { PortalSwitcher } from "./PortalSwitcher";

export interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigateRole?: (role: string) => void;
}

export function PublicLayout({ children, onNavigateRole }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Programs", href: "/programs" },
    { label: "Departments", href: "/departments" },
    { label: "Faculty", href: "/faculty" },
    {
      label: "Campus",
      submenu: [
        { label: "Campus Life", href: "/campus-life" },
        { label: "Facilities", href: "/facilities" },
      ],
    },
    { label: "Admissions", href: "/admissions" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      {/* Portal Switcher */}
      <PortalSwitcher />

      {/* Top Banner Contact Info */}
      <div className="bg-[#F7F9F9] text-text-secondary text-xs py-2 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              {MOCK_COLLEGE.contactPhone}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              {MOCK_COLLEGE.contactEmail}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-text-secondary font-medium">Admissions Open Fall 2026</span>
            <Link
              href="/register"
              className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Apply Online <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Navbar */}
      <header className="bg-white border-b border-border sticky top-0 z-30 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-text-primary leading-tight">
                {MOCK_COLLEGE.name}
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                {MOCK_COLLEGE.city} Campus
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-text-secondary">
            {navLinks.map((link) => {
              if ("submenu" in link) {
                return (
                  <div key={link.label} className="group relative">
                    <button className="nav-hover-underline hover:text-primary transition-colors py-1 flex items-center gap-1 cursor-pointer">
                      {link.label}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-40 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                      {link.submenu?.map((sublink) => {
                        const subactive = pathname === sublink.href;
                        return (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            className={cn(
                              "block px-4 py-2.5 text-sm hover:bg-background-secondary transition-colors",
                              subactive && "text-primary font-semibold bg-primary-light"
                            )}
                          >
                            {sublink.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    active
                      ? "text-primary font-semibold relative after:absolute after:w-full after:h-[2px] after:bottom-[-6px] after:left-0 after:bg-primary py-1"
                      : "nav-hover-underline hover:text-primary transition-colors py-1"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Apply Now
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-background-secondary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-border px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              {navLinks.map((link) => {
                if ("submenu" in link) {
                  return (
                    <details key={link.label} className="group">
                      <summary className="px-3 py-2 rounded-lg hover:bg-background-secondary text-text-secondary cursor-pointer">
                        {link.label}
                      </summary>
                      <div className="pl-4 space-y-2 mt-2">
                        {link.submenu?.map((sublink) => (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg hover:bg-background-secondary text-text-secondary"
                          >
                            {sublink.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-background-secondary text-text-secondary"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Public Page Main Content Slot */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <Footer variant="public" />
    </div>
  );
}
