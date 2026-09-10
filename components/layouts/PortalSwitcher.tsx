"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GraduationCap, Users, BookOpen, Briefcase, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortalOption {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const portals: PortalOption[] = [
  {
    id: "public",
    label: "Public Site",
    href: "/",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    description: "Explore our public portal",
  },
  {
    id: "applicant",
    label: "Applicant Portal",
    href: "/login",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    description: "Applicant sign in / registration",
  },
  {
    id: "student",
    label: "Student Portal",
    href: "/student/login",
    icon: <Users className="w-3.5 h-3.5" />,
    description: "Student portal access",
  },
  {
    id: "teacher",
    label: "Teacher Portal",
    href: "/teacher/login",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    description: "Faculty & teacher access",
  },
  {
    id: "admin",
    label: "Admin Portal",
    href: "/admin/login",
    icon: <Lock className="w-3.5 h-3.5" />,
    description: "Administrative console login",
  },
];

export function PortalSwitcher() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Determine which portal we're currently on
  const getCurrentPortal = () => {
    if (pathname === "/") return "public";
    if (pathname.startsWith("/student")) return "student";
    if (pathname.startsWith("/teacher")) return "teacher";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname === "/login") return "applicant";
    if (pathname === "/register") return "applicant";
    return "public";
  };

  const currentPortal = getCurrentPortal();
  const currentPortalInfo = portals.find((p) => p.id === currentPortal);

  return (
    <div className="bg-[#064E56] text-white border-b border-[#043e45] z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop View */}
        <div className="hidden lg:flex items-center justify-between h-10 text-xs">
          <div className="font-semibold opacity-70 uppercase tracking-widest text-[10px]">
            Superior Colleges CMS / Portal Switcher
          </div>

          <div className="flex items-center">
            {portals.map((portal) => {
              const isActive = currentPortal === portal.id;
              return (
                <Link
                  key={portal.id}
                  href={portal.href}
                  className={cn(
                    "h-10 px-4 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold border-r border-[#085f69]/40 first:border-l",
                    isActive
                      ? "bg-white text-[#064E56] shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                  title={portal.description}
                >
                  {portal.icon}
                  <span>{portal.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet View - Dropdown */}
        <div className="lg:hidden flex items-center justify-between h-10">
          <div className="text-[10px] font-bold opacity-75 uppercase tracking-wider">
            Superior CMS
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/5 text-white hover:bg-white/10 transition-colors border border-[#085f69]/40"
              aria-label="Switch portal"
            >
              {currentPortalInfo?.icon}
              <span>{currentPortalInfo?.label}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white text-text-primary border border-border shadow-xl z-50 rounded-sm">
                <div className="py-1">
                  {portals.map((portal) => {
                    const isActive = currentPortal === portal.id;
                    return (
                      <Link
                        key={portal.id}
                        href={portal.href}
                        onClick={() => setDropdownOpen(false)}
                        className={cn(
                          "flex items-start gap-2.5 px-3 py-2 text-xs transition-colors",
                          isActive
                            ? "bg-primary-light text-[#064E56] font-bold border-l-2 border-primary"
                            : "hover:bg-background-secondary text-text-secondary"
                        )}
                      >
                        <div className={cn("mt-0.5", isActive ? "text-[#064E56]" : "text-text-muted")}>
                          {portal.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{portal.label}</span>
                          <span className="text-[9px] text-text-muted opacity-80 leading-tight">
                            {portal.description}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

