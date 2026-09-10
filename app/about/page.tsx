"use client";

import React from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE, MOCK_DEPARTMENTS } from "@/lib/mock-data";
import {
  ArrowRight,
  Heart,
  Lightbulb,
  Target,
  Users,
  Award,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Compass,
  GraduationCap
} from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      number: "01",
      title: "Academic Excellence",
      subtitle: "Rigorous Standards & Pedagogy",
      description:
        "Comprehensive curricula, distinguished faculty instruction, and continuous methodology innovation designed to foster genuine scholarly mastery.",
      icon: Award,
      accent: "primary",
      highlight: "Over 94% board distinction rate",
    },
    {
      number: "02",
      title: "Character Development",
      subtitle: "Integrity, Ethics & Moral Vision",
      description:
        "Nurturing ethical conviction, self-discipline, and enduring values alongside academic pursuit to develop leaders who act with principled responsibility.",
      icon: Heart,
      accent: "gold",
      highlight: "Ethical mentorship across all disciplines",
    },
    {
      number: "03",
      title: "Community Engagement",
      subtitle: "Social Purpose & Civic Impact",
      description:
        "Cultivating socially conscious graduates through active regional outreach, public service initiatives, and community-driven problem solving in Kanganpur.",
      icon: Users,
      accent: "primary",
      highlight: "Active grassroots community outreach",
    },
    {
      number: "04",
      title: "Innovation & Creativity",
      subtitle: "Applied Research & Critical Inquiry",
      description:
        "Encouraging analytical rigor, computational inquiry, and creative experimentation that transform theoretical knowledge into real-world solutions.",
      icon: Lightbulb,
      accent: "gold",
      highlight: "Dedicated modern science & computer labs",
    },
    {
      number: "05",
      title: "Continuous Learning",
      subtitle: "Intellectual Agility & Growth",
      description:
        "Instilling intellectual curiosity and adaptive lifelong habits, ensuring our scholars remain resilient and forward-thinking in evolving landscapes.",
      icon: BookOpen,
      accent: "primary",
      highlight: "Faculty development & student research programs",
    },
    {
      number: "06",
      title: "Career Success",
      subtitle: "Professional Leadership & Trajectory",
      description:
        "Equipping every student with competitive industry competencies, communicative confidence, and mentorship pathways for premier university and career placement.",
      icon: Target,
      accent: "gold",
      highlight: "Alumni network spanning top institutions",
    },
  ];

  const milestones = [
    {
      year: "2004",
      title: "Campus Foundation",
      description: "Superior Colleges established its Kanganpur Campus with an uncompromising commitment to educational accessibility and academic rigor.",
    },
    {
      year: "2008",
      title: "Academic Accreditations",
      description: "Attained comprehensive higher education board recognitions, cementing pedagogical quality across all core subject tracks.",
    },
    {
      year: "2012",
      title: "Intermediate Expansion",
      description: "Broadened curriculum to encompass pre-medical, pre-engineering, computer science, and commerce intermediate programs.",
    },
    {
      year: "2016",
      title: "Modern Infrastructure",
      description: "Inaugurated state-of-the-art laboratory complexes, multimedia lecture halls, and expanded research resource centers.",
    },
    {
      year: "2020",
      title: "Digital Integration",
      description: "Pioneered integrated digital learning systems, smart academic monitoring, and resilient hybrid educational infrastructure.",
    },
    {
      year: "2026",
      title: "Premier Regional Hub",
      description: "Celebrating over two decades of transformative excellence, educating 2,800+ ambitious students annually.",
    },
  ];

  return (
    <PublicLayout>
      <div className="bg-white text-text-primary selection:bg-primary selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL TEXT-BASED HERO (NO LARGE IMAGES)                            */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border bg-[#FCFDFD] overflow-hidden">
          {/* Subtle architectural grid pattern in background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
              backgroundImage: "radial-gradient(#087F8C 1px, transparent 1px)", 
              backgroundSize: "28px 28px" 
            }} 
          />

          <PublicPageContainer className="relative">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-text-muted mb-10 tracking-wide uppercase font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-text-primary font-semibold">About</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    HISTORY &bull; PURPOSE &bull; BELONGING
                  </p>
                </div>
              </Reveal>

              {/* Main Heading */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  Our Story <br className="hidden sm:inline" />
                  <span className="text-primary font-light">&amp;</span> Institutional Values
                </h1>
              </Reveal>

              {/* Lead Paragraph */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Superior Colleges Kanganpur Campus stands as a beacon of scholastic distinction and moral leadership. Over two decades, we have cultivated a legacy rooted in rigorous inquiry, ethical character, and lifelong empowerment.
                  </p>
                </div>
              </Reveal>

              {/* Refined Stat / Editorial Value Blocks (No Generic Cards) */}
              <Reveal variant="up" className="delay-300 pt-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-10 border-t border-border/80">
                  
                  {/* Block 1 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Established</p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-serif">
                      2004
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Rooted in two decades of heritage in Kanganpur
                    </p>
                  </div>

                  {/* Block 2 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Distinction</p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight font-serif">
                      20<span className="text-accent-gold text-3xl font-sans">+</span>
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Years of continuous academic excellence
                    </p>
                  </div>

                  {/* Block 3 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Community</p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-serif">
                      2,800<span className="text-primary text-3xl font-sans">+</span>
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Students educated annually across faculties
                    </p>
                  </div>

                  {/* Block 4 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Focus</p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight font-serif">
                      100<span className="text-accent-gold text-3xl font-sans">%</span>
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Student-centered &amp; future-ready learning
                    </p>
                  </div>

                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. MODERN STORYTELLING SECTION ("OUR JOURNEY")                            */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-5xl mx-auto space-y-20 md:space-y-28">
              
              {/* Section Header */}
              <div className="space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary" />
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                      Our Narrative &amp; Purpose
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight">
                    Our Journey
                  </h2>
                </Reveal>
                <div className="w-16 h-[2px] bg-accent-gold" />
              </div>

              {/* Editorial Narrative Flow */}
              <div className="space-y-16 md:space-y-24">
                
                {/* Story Block 1: Purpose & Foundation */}
                <Reveal variant="up">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                    <div className="md:col-span-4 border-l-2 border-primary pl-4 py-1">
                      <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block mb-1">Chapter 01</span>
                      <h3 className="text-2xl font-bold text-text-primary">The Foundational Purpose</h3>
                    </div>
                    <div className="md:col-span-8 space-y-4 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                      <p>
                        Established in {MOCK_COLLEGE.establishedYear}, <strong className="text-text-primary font-semibold">Superior Colleges Kanganpur Campus</strong> was envisioned not merely as an academic venue, but as an institutional catalyst for regional transformation. In a rapidly evolving world, our mandate remains clear: to provide unmatched educational depth that bridges foundational intellect with practical competence.
                      </p>
                      <p className="text-text-muted text-sm sm:text-base">
                        Every lecture hall, laboratory, and student initiative is calibrated to instill profound intellectual self-reliance, analytical sharpness, and lasting civic consciousness.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Story Block 2: Dual Focus (Academic & Character) */}
                <Reveal variant="up" className="delay-150">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start pt-8 border-t border-border/70">
                    <div className="md:col-span-4 border-l-2 border-accent-gold pl-4 py-1">
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mb-1">Chapter 02</span>
                      <h3 className="text-2xl font-bold text-text-primary">Scholarship &amp; Moral Character</h3>
                    </div>
                    <div className="md:col-span-8 space-y-4 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                      <p>
                        We firmly believe that academic rigor without ethical grounding produces incomplete leaders. Our pedagogical framework integrates <span className="text-text-primary font-medium bg-white px-2 py-0.5 border border-border">intellectual mastery with character formation</span>—ensuring students uphold honesty, empathy, and social responsibility throughout their careers.
                      </p>
                      <p className="text-text-muted text-sm sm:text-base">
                        From individual mentorship programs to group capstones, our educators model the very principles of integrity and dedication that define the Superior standard.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Story Block 3: Higher Ed & Career Readiness */}
                <Reveal variant="up" className="delay-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start pt-8 border-t border-border/70">
                    <div className="md:col-span-4 border-l-2 border-primary pl-4 py-1">
                      <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block mb-1">Chapter 03</span>
                      <h3 className="text-2xl font-bold text-text-primary">Pathways to Higher Education</h3>
                    </div>
                    <div className="md:col-span-8 space-y-4 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                      <p>
                        Whether preparing for medical entrances, top engineering universities, computer science innovation, or global commerce leadership, our students receive focused mentorship that turns ambition into verifiable achievement.
                      </p>
                      
                      {/* Pull Quote Highlight */}
                      <div className="p-6 md:p-8 bg-white border-l-4 border-primary border-t border-r border-b border-border my-6 shadow-sm">
                        <p className="text-lg md:text-xl font-serif italic text-text-primary leading-relaxed">
                          "Education is not merely the transmission of facts; it is the ignition of potential and the enduring architect of human character."
                        </p>
                        <p className="text-xs uppercase tracking-widest text-accent-gold font-bold mt-3">
                          — Institutional Philosophy, Superior Colleges
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>

              </div>

              {/* Progress Milestones Timeline */}
              <div className="pt-16 border-t border-border">
                <Reveal variant="up">
                  <div className="mb-12">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold mb-2">Historical Milestones</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Two Decades of Continuous Evolution</h3>
                  </div>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {milestones.map((m, idx) => (
                    <Reveal key={m.year} variant="up" className={`delay-${(idx % 3) * 100 + 100}`}>
                      <div className="h-full bg-white p-6 sm:p-7 border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-md flex flex-col justify-between group">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-serif font-extrabold text-primary group-hover:text-accent-gold transition-colors duration-300">
                              {m.year}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-text-muted bg-background-secondary px-2 py-0.5 border border-border">
                              STAGE 0{idx + 1}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
                            {m.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
                            {m.description}
                          </p>
                        </div>
                        <div className="w-full h-[2px] bg-border group-hover:bg-primary transition-colors duration-500 mt-6" />
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. COMPLETELY REDESIGNED "SIX PILLARS" (ADVANCED ASYMMETRIC COMPOSITION)   */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          
          {/* Subtle architectural background accents */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-gold/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
              
              {/* Section Header */}
              <div className="max-w-3xl space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent-gold" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-accent-gold-dark">
                      Guiding Principles
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    Six Pillars of Character &amp; Excellence
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    Our institutional ethos is founded upon six interlocking principles. Together, they shape an educational journey that prepares minds for leadership and hearts for service.
                  </p>
                </Reveal>
              </div>

              {/* ADVANCED ASYMMETRIC EDITORIAL CARD COMPOSITION */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                
                {/* ------------------------------------------------------------- */}
                {/* PILLAR 01: Academic Excellence (Wide Leader, Dark Cyan Theme) */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-12 lg:col-span-7">
                  <Reveal variant="up" className="h-full delay-100">
                    <div className="group relative bg-[#FCFDFD] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 h-full flex flex-col justify-between overflow-hidden">
                      {/* Top Animated Accent Line */}
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 flex items-center justify-center bg-primary text-white shadow-sm transition-transform duration-500 group-hover:scale-105">
                            <Award className="w-6 h-6" />
                          </div>
                          <span className="text-6xl sm:text-7xl font-serif font-extrabold text-border/70 group-hover:text-primary/20 transition-all duration-500 select-none tracking-tighter leading-none">
                            {pillars[0].number}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{pillars[0].subtitle}</p>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors duration-300">
                            {pillars[0].title}
                          </h3>
                        </div>

                        <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                          {pillars[0].description}
                        </p>
                      </div>

                      <div className="pt-8 mt-6 border-t border-border flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-text-primary">
                          <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                          {pillars[0].highlight}
                        </span>
                        <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
                          Pillar 01 &rarr;
                        </span>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PILLAR 02: Character Development (Tall Gold Accent Card)       */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-12 lg:col-span-5">
                  <Reveal variant="up" className="h-full delay-200">
                    <div className="group relative bg-[#075E68] text-white p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#075E68]/25 h-full flex flex-col justify-between overflow-hidden">
                      {/* Top Animated Gold Accent Line */}
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 flex items-center justify-center bg-accent-gold text-white shadow-sm transition-transform duration-500 group-hover:rotate-6">
                            <Heart className="w-6 h-6" />
                          </div>
                          <span className="text-6xl sm:text-7xl font-serif font-extrabold text-white/20 group-hover:text-accent-gold/40 transition-all duration-500 select-none tracking-tighter leading-none">
                            {pillars[1].number}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold-light">{pillars[1].subtitle}</p>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                            {pillars[1].title}
                          </h3>
                        </div>

                        <p className="text-base text-white/90 leading-relaxed font-light">
                          {pillars[1].description}
                        </p>
                      </div>

                      <div className="pt-8 mt-6 border-t border-white/15 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent-gold-light">
                          <Sparkles className="w-4 h-4 text-accent-gold" />
                          {pillars[1].highlight}
                        </span>
                        <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">
                          Pillar 02 &rarr;
                        </span>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PILLAR 03: Community Engagement (Offset Compact Clean Card)   */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-6 lg:col-span-4">
                  <Reveal variant="up" className="h-full delay-100">
                    <div className="group relative bg-white border border-border p-8 sm:p-9 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-1.5 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
                      
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-serif font-extrabold text-primary block leading-none">
                            {pillars[2].number}
                          </span>
                          <div className="w-10 h-10 flex items-center justify-center bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <Users className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-gold-dark">{pillars[2].subtitle}</p>
                          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                            {pillars[2].title}
                          </h3>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {pillars[2].description}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border">
                        <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-none" />
                          {pillars[2].highlight}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PILLAR 04: Innovation & Creativity (Medium Focus Block)       */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-6 lg:col-span-4">
                  <Reveal variant="up" className="h-full delay-200">
                    <div className="group relative bg-[#FCFDFD] border border-border p-8 sm:p-9 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent-gold h-full flex flex-col justify-between">
                      <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                      
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-serif font-extrabold text-accent-gold block leading-none">
                            {pillars[3].number}
                          </span>
                          <div className="w-10 h-10 flex items-center justify-center bg-accent-gold-light text-accent-gold-dark group-hover:scale-110 transition-transform duration-300">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{pillars[3].subtitle}</p>
                          <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-gold-dark transition-colors">
                            {pillars[3].title}
                          </h3>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {pillars[3].description}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border">
                        <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-accent-gold rounded-none" />
                          {pillars[3].highlight}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PILLAR 05: Continuous Learning (Clean Architectural Block)    */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-12 lg:col-span-4">
                  <Reveal variant="up" className="h-full delay-300">
                    <div className="group relative bg-white border border-border p-8 sm:p-9 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 h-full flex flex-col justify-between">
                      <div className="absolute top-0 left-0 w-1.5 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
                      
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-serif font-extrabold text-primary block leading-none">
                            {pillars[4].number}
                          </span>
                          <div className="w-10 h-10 flex items-center justify-center bg-background-secondary text-text-primary group-hover:text-primary transition-colors duration-300 border border-border">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{pillars[4].subtitle}</p>
                          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                            {pillars[4].title}
                          </h3>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {pillars[4].description}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border">
                        <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-none" />
                          {pillars[4].highlight}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PILLAR 06: Career Success (Wide Anchor Banner Card)           */}
                {/* ------------------------------------------------------------- */}
                <div className="md:col-span-12">
                  <Reveal variant="up" className="delay-200">
                    <div className="group relative bg-[#F7F9F9] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40">
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-gradient-to-r from-primary via-primary-dark to-accent-gold transition-all duration-500 group-hover:w-full" />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-5xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors duration-300 leading-none">
                              {pillars[5].number}
                            </span>
                            <div className="h-6 w-[1px] bg-border" />
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold-dark">
                              {pillars[5].subtitle}
                            </p>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors">
                            {pillars[5].title}
                          </h3>

                          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                            {pillars[5].description}
                          </p>
                        </div>

                        <div className="lg:col-span-4 lg:text-right flex flex-col lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                          <div className="w-12 h-12 flex items-center justify-center bg-primary text-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                            <Target className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold text-text-primary bg-white px-3 py-1.5 border border-border">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              {pillars[5].highlight}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. MISSION & VISION (ARCHITECTURAL SPLIT SECTION)                          */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-24">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                
                {/* Section Header Column */}
                <div className="lg:col-span-4 space-y-4">
                  <Reveal variant="up">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                      Core Institutional Charter
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
                      Mission &amp; Vision
                    </h2>
                    <div className="w-12 h-[2px] bg-primary mt-4" />
                    <p className="text-sm text-text-secondary pt-4 font-light leading-relaxed">
                      Our institutional charter establishes the benchmark for scholarly rigor, student development, and lasting societal leadership in Pakistan.
                    </p>
                  </Reveal>
                </div>

                {/* Mission & Vision Content Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Mission */}
                  <Reveal variant="up" className="delay-100">
                    <div className="p-8 sm:p-10 bg-white border border-border border-t-4 border-t-primary space-y-5 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-light text-primary text-xs font-bold uppercase tracking-wider">
                          <Compass className="w-3.5 h-3.5" />
                          Our Mission
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          Empowering Through Education
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base font-light">
                          To deliver rigorous, accessible, and values-centered education that develops academically competent, ethically grounded, and socially responsible graduates prepared to contribute meaningfully to regional and national prosperity.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-medium text-text-muted">
                        <span className="w-1.5 h-1.5 bg-primary" />
                        Pedagogy &bull; Ethics &bull; Impact
                      </div>
                    </div>
                  </Reveal>

                  {/* Vision */}
                  <Reveal variant="up" className="delay-200">
                    <div className="p-8 sm:p-10 bg-white border border-border border-t-4 border-t-accent-gold space-y-5 h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-accent-gold-light text-accent-gold-dark text-xs font-bold uppercase tracking-wider">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Our Vision
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          Leadership &amp; Global Impact
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-sm sm:text-base font-light">
                          To be recognized as the premier institution of higher learning in the district—celebrated for pedagogical excellence, visionary character building, and alumni who lead with intellect and conscience across industry and academia.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-medium text-text-muted">
                        <span className="w-1.5 h-1.5 bg-accent-gold" />
                        Leadership &bull; Innovation &bull; Legacy
                      </div>
                    </div>
                  </Reveal>

                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. DEPARTMENTS & ACADEMIC ORGANIZATION (EDITORIAL LISTING)               */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">Academic Structure</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                      Academic Departments
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Structured faculties ensuring specialized curricular depth, experimental inquiry, and dedicated faculty mentorship.
                  </p>
                </Reveal>
              </div>

              {/* Department Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_DEPARTMENTS.map((dept, idx) => (
                  <Reveal key={dept.id} variant="up" className={`delay-${(idx % 3) * 100 + 100}`}>
                    <div className="h-full bg-white p-8 border border-border transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-1">
                            {dept.code}
                          </span>
                          <span className="text-xs text-text-muted font-mono">0{idx + 1}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
                          {dept.name}
                        </h3>
                        
                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {dept.description}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Head of Faculty</p>
                          <p className="text-xs font-semibold text-text-primary">{dept.headOfDepartment}</p>
                        </div>
                        <Link 
                          href="/departments" 
                          className="text-xs font-bold text-primary group-hover:text-accent-gold transition-colors inline-flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 6. CALL TO ACTION (PRESERVED REUSABLE CTA)                                */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Build Your Future at Superior Colleges"
          description={`Discover transformative education, state-of-the-art facilities, and distinguished faculty at our ${MOCK_COLLEGE.city} campus. Admissions for the upcoming session are actively open.`}
          href="/admissions"
          label="Explore Admissions"
        />

      </div>
    </PublicLayout>
  );
}
