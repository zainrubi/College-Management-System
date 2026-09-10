"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE, MOCK_DEPARTMENTS, MOCK_PROGRAMS } from "@/lib/mock-data";
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Target,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Compass,
  GraduationCap,
  Building2,
  Microscope,
  Cpu,
  Calculator,
  TrendingUp,
  UserCheck,
  X,
  Layers,
  FlaskConical,
  Binary,
  Briefcase
} from "lucide-react";

interface DepartmentDetail {
  id: string;
  number: string;
  code: string;
  name: string;
  headOfDepartment: string;
  headTitle: string;
  description: string;
  academicFocus: string;
  keySubjects: string[];
  facilities: string[];
  relatedPrograms: { name: string; code: string; level: string }[];
  pathwayOutcome: string;
  accent: "primary" | "gold";
  iconName: "cs" | "business" | "science" | "general";
}

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState<DepartmentDetail | null>(null);

  const departmentsData: DepartmentDetail[] = [
    {
      id: "dept-cs",
      number: "01",
      code: "CS-IT",
      name: "Department of Computer Science & Information Technology",
      headOfDepartment: "Dr. Tariq Mahmood",
      headTitle: "Professor & Head of Department (Ph.D. Computer Science)",
      description:
        "A premier center for computing education, software engineering, and technological innovation. The department combines fundamental algorithmic theory with applied machine learning, cloud architecture, and modern full-stack development.",
      academicFocus: "Software Architecture, Computational Theory & AI Systems",
      keySubjects: [
        "Data Structures & Object-Oriented Design",
        "Artificial Intelligence & Machine Learning",
        "Full-Stack Web & Mobile Engineering",
        "Database Architecture & Cloud DevOps",
        "Network Security & Operating Systems"
      ],
      facilities: [
        "3 Advanced Computer Laboratory Suites (High-Spec Core-i7 Rigs)",
        "Dedicated Gigabit Fiber Local Network & Cloud Sandbox",
        "Robotics & Embedded Systems Research Workstation"
      ],
      relatedPrograms: [
        { name: "BS Computer Science", code: "BSCS", level: "Undergraduate (4-Year)" },
        { name: "BS Software Engineering", code: "BSSE", level: "Undergraduate (4-Year)" },
        { name: "ICS (Computer Science)", code: "ICS", level: "Intermediate (2-Year)" }
      ],
      pathwayOutcome: "Software Engineering, AI Architecture, Cloud DevOps & Global Tech Leadership",
      accent: "primary",
      iconName: "cs",
    },
    {
      id: "dept-pre-eng",
      number: "02",
      code: "FIS",
      name: "Faculty of Intermediate & Natural Sciences",
      headOfDepartment: "Prof. Muhammad Usman",
      headTitle: "Associate Professor & Dean of Sciences (M.Phil Physics)",
      description:
        "Delivering comprehensive foundational pedagogy across biological, physical, and mathematical sciences. The faculty maintains an exceptional distinction track record in BISE Lahore examinations and national university entrance assessments.",
      academicFocus: "Biological Sciences, Applied Physics & Higher Mathematics",
      keySubjects: [
        "Cellular Biology, Anatomy & Genetics",
        "Organic, Inorganic & Analytical Chemistry",
        "Classical Mechanics, Electrodynamics & Modern Physics",
        "Calculus, Differential Equations & Vector Geometry",
        "Integrated Laboratory Experimentation & Analysis"
      ],
      facilities: [
        "Separate Modern Biology & Physiology Laboratory",
        "Fully Equipped Chemical Experimentation Suite with Safety Chambers",
        "Optical, Wave & Mechanics Physics Laboratory"
      ],
      relatedPrograms: [
        { name: "FSc Pre-Medical", code: "FSC-MED", level: "Intermediate (2-Year)" },
        { name: "FSc Pre-Engineering", code: "FSC-ENG", level: "Intermediate (2-Year)" },
        { name: "ICS (Physics/Comp. Sci.)", code: "ICS", level: "Intermediate (2-Year)" }
      ],
      pathwayOutcome: "Medicine (MBBS/BDS), Engineering (Civil/Mech/Elec), Biotechnology & Applied Research",
      accent: "gold",
      iconName: "science",
    },
    {
      id: "dept-bus",
      number: "03",
      code: "FMS",
      name: "Faculty of Management Sciences & Commerce",
      headOfDepartment: "Prof. Aisha Rehman",
      headTitle: "Professor & Academic Director (M.Phil Management Sciences)",
      description:
        "Cultivating dynamic business leadership, financial acumen, strategic marketing, and corporate governance. The faculty bridges theoretical economic frameworks with modern enterprise problem-solving and entrepreneurial incubation.",
      academicFocus: "Corporate Strategy, Financial Markets & Enterprise Economics",
      keySubjects: [
        "Financial Accounting & Cost Management",
        "Microeconomics, Macroeconomics & Fiscal Policy",
        "Strategic Marketing & Brand Management",
        "Supply Chain, Logistics & Operations Analytics",
        "Business Law, Corporate Ethics & FinTech"
      ],
      facilities: [
        "Business Case Study & Executive Seminar Suite",
        "Financial Modeling & Digital Analytics Terminal",
        "Entrepreneurship Incubation Mentorship Lounge"
      ],
      relatedPrograms: [
        { name: "Bachelor of Business Administration", code: "BBA", level: "Undergraduate (4-Year)" },
        { name: "Intermediate in Commerce", code: "I.COM", level: "Intermediate (2-Year)" }
      ],
      pathwayOutcome: "Chartered Accountancy (CA/ACCA), Investment Banking, Brand Management & Enterprise Leadership",
      accent: "primary",
      iconName: "business",
    },
  ];

  return (
    <PublicLayout>
      <div className="bg-white text-text-primary selection:bg-primary selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL TEXT-BASED HERO (NO LARGE IMAGES)                            */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border bg-[#FCFDFD] overflow-hidden">
          {/* Subtle architectural grid pattern */}
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
              <span className="text-text-primary font-semibold">Departments</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    ACADEMIC EXCELLENCE
                  </p>
                </div>
              </Reveal>

              {/* Main Title */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  Academic <br className="hidden sm:inline" />
                  <span className="text-primary font-light">Departments</span>
                </h1>
              </Reveal>

              {/* Supporting Text */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Explore the academic disciplines, teaching expertise, and learning environments that shape the student experience at Superior Colleges Kanganpur Campus.
                  </p>
                </div>
              </Reveal>

              {/* Refined Academic Pillars (Editorial Numbers, NOT Generic Cards) */}
              <Reveal variant="up" className="delay-300 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 pt-10 border-t border-border/80">
                  
                  {/* Pillar 01 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-gold">01</span>
                      <span className="w-4 h-[1px] bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Specialized</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Academic Disciplines
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Structured curricula spanning computing, natural sciences, and commerce
                    </p>
                  </div>

                  {/* Pillar 02 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">02</span>
                      <span className="w-4 h-[1px] bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Leadership</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-serif">
                      Dedicated Faculty
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Expert educators, researchers, and mentors committed to student achievement
                    </p>
                  </div>

                  {/* Pillar 03 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-gold">03</span>
                      <span className="w-4 h-[1px] bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Pedagogy</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Student-Centered
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Modern laboratory practice, interactive seminars, and personalized guidance
                    </p>
                  </div>

                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. ACADEMIC ECOSYSTEM INTRODUCTION                                       */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              {/* Editorial Split: Left Title & Metric / Right Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                <div className="lg:col-span-5 space-y-4">
                  <Reveal variant="up">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        Our Academic Community
                      </p>
                    </div>
                  </Reveal>
                  <Reveal variant="up" className="delay-100">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                      Where Disciplines <br className="hidden sm:inline" />
                      Become Opportunities
                    </h2>
                  </Reveal>
                  <div className="w-16 h-[2px] bg-accent-gold mt-2" />
                </div>

                <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                  <Reveal variant="up" className="delay-150">
                    <p>
                      At Superior Colleges Kanganpur Campus, our academic departments do not operate in isolation. They function as an interconnected ecosystem where theoretical inquiry, experimental laboratory work, and professional mentorship converge to prepare students for top universities and global industries.
                    </p>
                  </Reveal>
                  
                  <Reveal variant="up" className="delay-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Dimension 01</span>
                        <h4 className="text-sm font-bold text-text-primary">Faculty Mentorship</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Close academic supervision, individualized counseling, and board exam optimization.
                        </p>
                      </div>

                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Dimension 02</span>
                        <h4 className="text-sm font-bold text-text-primary">Experimental Laboratories</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Hands-on empirical discovery in specialized physics, chemistry, biology, and computing labs.
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

              {/* Connected Academic Relationship Stepper */}
              <Reveal variant="up" className="delay-200">
                <div className="p-6 md:p-8 bg-white border border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">Level 01</span>
                      <p className="text-sm font-bold text-text-primary">Department</p>
                      <p className="text-[11px] text-text-muted">Faculty &amp; Resources</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-widest block">Level 02</span>
                      <p className="text-sm font-bold text-text-primary">Programs</p>
                      <p className="text-[11px] text-text-muted">Structured Pathways</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">Level 03</span>
                      <p className="text-sm font-bold text-text-primary">Subject Areas</p>
                      <p className="text-[11px] text-text-muted">Rigorous Curricula</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-widest block">Level 04</span>
                      <p className="text-sm font-bold text-text-primary">Future Horizons</p>
                      <p className="text-[11px] text-text-muted">University &amp; Career</p>
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. ASYMMETRIC DEPARTMENT SHOWCASE (NOT GENERIC CARDS)                     */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
              
              {/* Section Header */}
              <div className="max-w-3xl space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent-gold" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-accent-gold-dark">
                      Faculties &amp; Leadership
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    Explore Our Academic Departments
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    Each department unites seasoned faculty, dedicated laboratory facilities, and tailored program offerings to guarantee academic excellence.
                  </p>
                </Reveal>
              </div>

              {/* ASYMMETRIC DEPARTMENT COMPOSITIONS */}
              <div className="space-y-14">
                
                {/* ------------------------------------------------------------- */}
                {/* DEPARTMENT 01: Computer Science & IT (Wide Flagship Leader)   */}
                {/* ------------------------------------------------------------- */}
                <Reveal variant="up" className="delay-100">
                  <div className="group relative bg-[#FCFDFD] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 overflow-hidden">
                    <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                      
                      <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors duration-300 select-none leading-none">
                            {departmentsData[0].number}
                          </span>
                          <div className="h-8 w-[1px] bg-border" />
                          <div>
                            <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                              {departmentsData[0].code}
                            </span>
                            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
                              Computing &bull; AI &bull; Software Engineering
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-2xl sm:text-4xl font-extrabold text-text-primary group-hover:text-primary transition-colors">
                            {departmentsData[0].name}
                          </h3>
                          <p className="text-sm font-semibold text-text-muted mt-2 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" />
                            <strong>Head:</strong> {departmentsData[0].headOfDepartment} — <span className="font-normal text-xs">{departmentsData[0].headTitle}</span>
                          </p>
                        </div>

                        <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                          {departmentsData[0].description}
                        </p>

                        <div className="p-4 bg-background-secondary border border-border space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Curricular Focus</p>
                          <p className="text-xs font-semibold text-text-primary">{departmentsData[0].academicFocus}</p>
                        </div>

                        {/* Connected Programs Tags */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Connected Academic Programs</p>
                          <div className="flex flex-wrap gap-2">
                            {departmentsData[0].relatedPrograms.map((prog) => (
                              <Link 
                                key={prog.code} 
                                href="/programs"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border hover:border-primary text-xs font-semibold text-text-primary hover:text-primary transition-colors"
                              >
                                <span>{prog.name}</span>
                                <span className="text-[10px] font-mono text-primary font-bold">({prog.code})</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Detail Card & Actions */}
                      <div className="lg:col-span-4 bg-white p-6 sm:p-7 border border-border space-y-6 flex flex-col justify-between h-full shadow-sm">
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-border">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">Career Trajectory</span>
                            <span className="text-xs font-medium text-text-primary leading-relaxed block">{departmentsData[0].pathwayOutcome}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Key Laboratory Suites</p>
                            <ul className="space-y-1.5 text-text-secondary font-light">
                              {departmentsData[0].facilities.map((fac) => (
                                <li key={fac} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary shrink-0 mt-1.5" />
                                  <span>{fac}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <button
                            onClick={() => setSelectedDept(departmentsData[0])}
                            className="w-full py-2.5 px-4 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border hover:border-primary transition-all flex items-center justify-center gap-2"
                          >
                            Explore Department Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <Link href="/programs" className="block">
                            <button className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-all">
                              View Department Programs
                            </button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </Reveal>

                {/* ------------------------------------------------------------- */}
                {/* DEPARTMENTS 02 & 03: Sciences & Business (Asymmetric Pair)    */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Department 02: Sciences (Tall Deep Teal Card) */}
                  <div className="lg:col-span-6">
                    <Reveal variant="up" className="h-full delay-150">
                      <div className="group relative bg-[#075E68] text-white p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#075E68]/25 h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                        
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-accent-gold-light bg-white/10 px-2.5 py-0.5 border border-white/20">
                                {departmentsData[1].code}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                                {departmentsData[1].name}
                              </h3>
                              <p className="text-xs font-medium text-accent-gold-light mt-1 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-accent-gold" />
                                Head: {departmentsData[1].headOfDepartment}
                              </p>
                            </div>
                            <span className="text-5xl sm:text-6xl font-serif font-extrabold text-white/20 group-hover:text-accent-gold/40 transition-colors select-none leading-none">
                              {departmentsData[1].number}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                            {departmentsData[1].description}
                          </p>

                          <div className="p-4 bg-white/10 border border-white/15 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-light">Scientific Disciplines</p>
                            <p className="text-xs text-white/95 font-medium">{departmentsData[1].academicFocus}</p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-light">Connected Programs</p>
                            <div className="flex flex-wrap gap-1.5">
                              {departmentsData[1].relatedPrograms.map((prog) => (
                                <Link
                                  key={prog.code}
                                  href="/programs"
                                  className="text-[11px] font-semibold text-white bg-white/10 hover:bg-white hover:text-[#075E68] px-2.5 py-1 border border-white/20 transition-colors"
                                >
                                  {prog.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="text-xs text-accent-gold-light font-medium">BISE Lahore Affiliated</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDept(departmentsData[1])}
                              className="px-3.5 py-2 bg-white/10 hover:bg-white hover:text-[#075E68] text-white text-xs font-bold uppercase tracking-wider border border-white/30 transition-colors"
                            >
                              Details
                            </button>
                            <Link href="/programs">
                              <button className="px-3.5 py-2 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-colors">
                                Explore Programs
                              </button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </Reveal>
                  </div>

                  {/* Department 03: Business & Commerce (Modern Clean Block) */}
                  <div className="lg:col-span-6">
                    <Reveal variant="up" className="h-full delay-200">
                      <div className="group relative bg-white border border-border p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 w-1.5 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
                        
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold-light/60 px-2.5 py-0.5 border border-accent-gold/20">
                                {departmentsData[2].code}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors mt-3">
                                {departmentsData[2].name}
                              </h3>
                              <p className="text-xs font-medium text-text-muted mt-1 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-primary" />
                                Head: {departmentsData[2].headOfDepartment}
                              </p>
                            </div>
                            <span className="text-5xl sm:text-6xl font-serif font-extrabold text-border/70 group-hover:text-primary/30 transition-colors select-none leading-none">
                              {departmentsData[2].number}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                            {departmentsData[2].description}
                          </p>

                          <div className="p-4 bg-background-secondary border border-border space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Enterprise Focus</p>
                            <p className="text-xs text-text-primary font-medium">{departmentsData[2].academicFocus}</p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Connected Programs</p>
                            <div className="flex flex-wrap gap-1.5">
                              {departmentsData[2].relatedPrograms.map((prog) => (
                                <Link
                                  key={prog.code}
                                  href="/programs"
                                  className="text-[11px] font-semibold text-text-primary bg-background-secondary hover:bg-primary hover:text-white px-2.5 py-1 border border-border transition-colors"
                                >
                                  {prog.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="text-xs text-text-muted font-medium">BBA &amp; I.Com Curricula</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDept(departmentsData[2])}
                              className="px-3.5 py-2 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border transition-colors"
                            >
                              Details
                            </button>
                            <Link href="/programs">
                              <button className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors">
                                Explore Programs
                              </button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </Reveal>
                  </div>

                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. WHAT MAKES OUR DEPARTMENTS VALUABLE (EDITORIAL ASYMMETRIC SECTION)     */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Pedagogical Distinction</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Why Our Academic Departments Lead
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Designed to bridge high-school fundamentals with international academic and professional standards.
                  </p>
                </Reveal>
              </div>

              {/* Staggered Feature Composition (Not 4 identical boxes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Feature 01 */}
                <Reveal variant="up" className="delay-100">
                  <div className="space-y-4 border-l-2 border-primary pl-5 py-2 group">
                    <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Pillar 01</span>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                      Expert Teaching
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">
                      Learn from dedicated educators and researchers focused on scholastic depth and continuous intellectual growth.
                    </p>
                  </div>
                </Reveal>

                {/* Feature 02 */}
                <Reveal variant="up" className="delay-150">
                  <div className="space-y-4 border-l-2 border-accent-gold pl-5 py-2 group">
                    <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Pillar 02</span>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-gold-dark transition-colors">
                      Practical Learning
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">
                      Connect classroom concepts with practical laboratory understanding, empirical analysis, and capstones.
                    </p>
                  </div>
                </Reveal>

                {/* Feature 03 */}
                <Reveal variant="up" className="delay-200">
                  <div className="space-y-4 border-l-2 border-primary pl-5 py-2 group">
                    <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Pillar 03</span>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                      Student Guidance
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">
                      Receive personalized academic direction, entry test preparation (MDCAT/ECAT), and mentorship throughout.
                    </p>
                  </div>
                </Reveal>

                {/* Feature 04 */}
                <Reveal variant="up" className="delay-250">
                  <div className="space-y-4 border-l-2 border-accent-gold pl-5 py-2 group">
                    <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Pillar 04</span>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-gold-dark transition-colors">
                      Future Preparation
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">
                      Build the rigorous intellectual foundation needed for premier university placements and international careers.
                    </p>
                  </div>
                </Reveal>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. INTERACTIVE DEPARTMENT DETAIL MODAL / DRAWER                            */}
        {/* ========================================================================= */}
        {selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-border shadow-2xl p-6 sm:p-10 space-y-8 animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary hover:bg-background-secondary border border-transparent hover:border-border transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                    {selectedDept.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider">
                    Department {selectedDept.number}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {selectedDept.name}
                </h3>
                <p className="text-xs font-semibold text-primary flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {selectedDept.headOfDepartment} — {selectedDept.headTitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-base text-text-secondary leading-relaxed font-light">
                {selectedDept.description}
              </p>

              {/* Curricular Focus */}
              <div className="p-4 bg-background-secondary border border-border space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Academic Focus</span>
                <p className="font-semibold text-text-primary">{selectedDept.academicFocus}</p>
              </div>

              {/* Subjects & Labs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Key Subject Areas
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedDept.keySubjects.map((sub) => (
                      <li key={sub} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Laboratories &amp; Infrastructure
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedDept.facilities.map((fac) => (
                      <li key={fac} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Connected Programs */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Connected Academic Programs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDept.relatedPrograms.map((prog) => (
                    <div key={prog.code} className="p-3 bg-background-secondary border border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text-primary">{prog.name}</p>
                        <p className="text-[10px] text-text-muted">{prog.level}</p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-primary">{prog.code}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="w-full sm:w-auto px-6 py-2.5 border border-border text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-background-secondary transition-colors"
                >
                  Close
                </button>
                <Link href="/programs" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    Explore All Programs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 6. FINAL SOPHISTICATED CALL TO ACTION                                      */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Find the Path That Fits Your Future"
          description="Explore our academic programs and discover where your interests and ambition can take you at Superior Colleges Kanganpur Campus."
          href="/programs"
          label="Explore Programs"
        />

      </div>
    </PublicLayout>
  );
}
