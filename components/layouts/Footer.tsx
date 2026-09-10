import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowRight,
} from "lucide-react";

export interface FooterProps {
  variant?: "public" | "dashboard";
  className?: string;
}

/* ─── Reusable animated footer link ─────────────────────────────────── */
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";
  const inner = (
    <>
      <ArrowRight
        aria-hidden="true"
        className="w-3 h-3 shrink-0 text-[#C5A44D]/40 group-hover:text-[#C5A44D] group-hover:translate-x-0.5 transition-all duration-200"
      />
      <span className="group-hover:underline underline-offset-2 decoration-[#C5A44D]/30">
        {children}
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Footer({ variant = "dashboard", className }: FooterProps) {
  /* ─── Dashboard footer — unchanged ───────────────────────────────── */
  if (variant === "dashboard") {
    return (
      <footer
        className={cn(
          "py-4 px-6 border-t border-border text-xs text-text-secondary flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto bg-cyan-700 text-white",
          className
        )}
      >
        <p>
          &copy; {new Date().getFullYear()} {MOCK_COLLEGE.name}. All rights
          reserved.
        </p>
        <p className="flex items-center gap-2">
          <span>Institutional CMS v1.0</span>
          <span>•</span>
          <span className="text-primary font-medium">Kanganpur Campus</span>
        </p>
      </footer>
    );
  }

  /* ─── Public footer — premium redesign ───────────────────────────── */
  return (
    <footer
      className={cn("relative overflow-hidden bg-[#0a2d2b] text-white", className)}
      aria-label="Site footer"
    >
      {/* Oversized "S" watermark — barely visible depth element */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-12 -right-16 text-[360px] font-extrabold leading-none text-white/[0.018] tracking-tight"
      >
        S
      </div>

      {/* Very faint dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(197,164,77,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle warm radial glow in bottom-left corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#087F8C]/10 blur-3xl -z-0"
      />

      {/* Gold top-edge accent line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A44D]/50 to-transparent"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══════════════════════════════════════════════════════════════
            TOP INTRO STATEMENT — compact, typographic
        ══════════════════════════════════════════════════════════════ */}
        <div className="pt-16 pb-12 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-[#C5A44D] mb-3">
            Building Futures Through Education
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white/85 tracking-tight leading-snug max-w-2xl">
            Empowering the next generation to&nbsp;learn, grow and&nbsp;lead.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MAIN FOUR-COLUMN GRID
            Desktop  → 12 cols: Brand(4) | Programs(3) | Portals(3) | Contact(2)
            Tablet   → 2 cols
            Mobile   → 1 col
        ══════════════════════════════════════════════════════════════ */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 border-b border-white/[0.06]">

          {/* ── Col 1 · BRAND (wider) ──────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            {/* Logo + name as a unified brand block */}
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 flex items-center justify-center bg-[#087F8C] shrink-0"
                aria-hidden="true"
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-extrabold text-white tracking-tight leading-tight">
                  {MOCK_COLLEGE.name}
                </p>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#C5A44D] mt-0.5">
                  Est.&nbsp;{MOCK_COLLEGE.establishedYear}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {MOCK_COLLEGE.tagline}
            </p>

            {/* Small decorative rule */}
            <div className="flex items-center gap-2 pt-1">
              <span className="w-6 h-[1px] bg-[#C5A44D]/50" />
              <span className="w-3 h-[1px] bg-white/15" />
            </div>
          </div>

          {/* ── Col 2 · ACADEMIC PROGRAMS ──────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-white/35 mb-2">
                Academic Programs
              </p>
              <span className="block w-5 h-[1px] bg-[#C5A44D]/50" />
            </div>

            <ul className="space-y-3">
              {[
                { label: "BS Computer Science", href: "/programs" },
                { label: "BS Software Engineering", href: "/programs" },
                { label: "BBA Management", href: "/programs" },
                { label: "FSc Pre-Engineering", href: "/programs" },
                { label: "ICS Computer Science", href: "/programs" },
              ].map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 · CAMPUS PORTALS ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-white/35 mb-2">
                Campus Portals
              </p>
              <span className="block w-5 h-[1px] bg-[#087F8C]/70" />
            </div>

            <ul className="space-y-3">
              {[
                {
                  label: "Online Admission Application",
                  href: "/register",
                },
                { label: "Student Fee Portal Login", href: "/student/login" },
                { label: "Faculty Portal Login", href: "/teacher/login" },
                {
                  label: "Administration Console Login",
                  href: "/admin/login",
                },
              ].map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4 · CAMPUS CONTACT ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-white/35 mb-2">
                Campus Contact
              </p>
              <span className="block w-5 h-[1px] bg-[#C5A44D]/50" />
            </div>

            <ul className="space-y-4 text-sm text-white/50">
              {/* Address */}
              <li className="flex items-start gap-2.5">
                <MapPin
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#087F8C] shrink-0 mt-0.5"
                />
                <span className="leading-relaxed">
                  {MOCK_COLLEGE.address},&nbsp;{MOCK_COLLEGE.city},&nbsp;
                  {MOCK_COLLEGE.province}
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-2.5">
                <Phone
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#087F8C] shrink-0"
                />
                <a
                  href={`tel:${MOCK_COLLEGE.contactPhone}`}
                  className="hover:text-white transition-colors duration-200 font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  {MOCK_COLLEGE.contactPhone}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-start gap-2.5 min-w-0">
                <Mail
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#087F8C] shrink-0 mt-0.5"
                />
                <a
                  href={`mailto:${MOCK_COLLEGE.contactEmail}`}
                  className="hover:text-white transition-colors duration-200 break-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  {MOCK_COLLEGE.contactEmail}
                </a>
              </li>

              {/* Website */}
              <li className="flex items-center gap-2.5">
                <Globe
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#087F8C] shrink-0"
                />
                <a
                  href={MOCK_COLLEGE.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  {MOCK_COLLEGE.website.replace("https://", "")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════════════════════════════ */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 tracking-wide">
            &copy; {new Date().getFullYear()} {MOCK_COLLEGE.name}. All Rights
            Reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link
              href="/fee-structure"
              className="hover:text-white/80 hover:underline underline-offset-2 decoration-[#C5A44D]/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              Fee Structure Rules
            </Link>
            <span aria-hidden="true" className="text-white/15">
              /
            </span>
            <Link
              href="/contact"
              className="hover:text-white/80 hover:underline underline-offset-2 decoration-[#C5A44D]/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              Help &amp; Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
