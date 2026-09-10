"use client";

import React from "react";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import { GraduationCap, ArrowLeft, ShieldCheck } from "lucide-react";
import { Footer } from "./Footer";

export interface ApplicantLayoutProps {
  children: React.ReactNode;
  stepTitle?: string;
  stepSubtitle?: string;
  onBackToMain?: () => void;
}

export function ApplicantLayout({
  children,
  stepTitle = "Admission Application Portal",
  stepSubtitle = "Submit your academic credentials and register for Fall 2026 admissions.",
  onBackToMain,
}: ApplicantLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <header className="bg-white border-b border-border py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-text-primary leading-tight">
                {MOCK_COLLEGE.name}
              </h1>
              <p className="text-[11px] text-text-secondary">
                Online Applicant Portal
              </p>
            </div>
          </div>

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary border border-primary/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Official Admissions Portal 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {stepTitle}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {stepSubtitle}
          </p>
        </div>

        <div>{children}</div>
      </main>

      {/* Minimal Footer */}
      <Footer variant="dashboard" />
    </div>
  );
}
