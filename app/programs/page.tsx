"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";
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
  Microscope,
  Cpu,
  Calculator,
  TrendingUp,
  Building2,
  X,
  Clock,
  Layers,
  ShieldCheck
} from "lucide-react";

interface ProgramDetail {
  id: string;
  number: string;
  name: string;
  code: string;
  level: "intermediate" | "undergraduate";
  subtitle: string;
  description: string;
  academicFocus: string;
  pathway: string;
  duration: string;
  semestersOrYears: string;
  eligibility: string;
  annualFee: number;
  keySubjects: string[];
  careerOutcomes: string[];
  iconName: "microscope" | "calculator" | "cpu" | "trending" | "building" | "grad";
  highlight: string;
  accent: "primary" | "gold";
}

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);

  const intermediatePrograms: ProgramDetail[] = [
    {
      id: "prog-fsc-med",
      number: "01",
      name: "FSc Pre-Medical",
      code: "FSC-MED",
      level: "intermediate",
      subtitle: "Foundation for Medicine & Life Sciences",
      description:
        "Comprehensive pre-medical curriculum integrating advanced biology, organic & inorganic chemistry, and applied physics, rigorously calibrated for top performance in national medical entrance exams (MDCAT).",
      academicFocus: "Biological Sciences & Bio-Chemistry",
      pathway: "MBBS • BDS • Pharm-D • Biotechnology • Allied Health Sciences",
      duration: "2 Years",
      semestersOrYears: "Annual Board System (Part-I & Part-II)",
      eligibility: "Matriculation / O-Levels in Science Group with Biology (Min. 60% Marks)",
      annualFee: 95000,
      keySubjects: [
        "Cell Biology & Genetics",
        "Organic & Physical Chemistry",
        "Mechanics & Thermodynamics",
        "Functional English & Urdu Literature",
        "Islamic & Pakistan Studies"
      ],
      careerOutcomes: [
        "Medical Practitioner & Dental Surgeon",
        "Clinical Pharmacist & Drug Researcher",
        "Biotechnologist & Genetic Scientist",
        "Public Health Specialist"
      ],
      iconName: "microscope",
      highlight: "Dedicated high-spec biology & chemistry laboratory suites",
      accent: "primary",
    },
    {
      id: "prog-fsc-eng",
      number: "02",
      name: "FSc Pre-Engineering",
      code: "FSC-ENG",
      level: "intermediate",
      subtitle: "Analytical Rigor & Mathematical Sciences",
      description:
        "Rigorous analytical curriculum emphasizing differential calculus, vector mechanics, electromagnetism, and chemical thermodynamics to prepare students for ECAT and premier engineering universities.",
      academicFocus: "Higher Mathematics & Applied Physics",
      pathway: "Civil • Electrical • Mechanical • Software • Aerospace Engineering",
      duration: "2 Years",
      semestersOrYears: "Annual Board System (Part-I & Part-II)",
      eligibility: "Matriculation / O-Levels in Science Group with Mathematics (Min. 60% Marks)",
      annualFee: 95000,
      keySubjects: [
        "Calculus & Analytical Geometry",
        "Electrodynamics & Modern Physics",
        "Industrial & Inorganic Chemistry",
        "Technical Communication & Languages",
        "Islamic & Pakistan Studies"
      ],
      careerOutcomes: [
        "Electrical & Electronics Engineer",
        "Mechanical & Robotics Specialist",
        "Civil & Infrastructure Designer",
        "Aerospace & Defense Technologist"
      ],
      iconName: "calculator",
      highlight: "Over 90% engineering university entrance placement rate",
      accent: "gold",
    },
    {
      id: "prog-ics",
      number: "03",
      name: "Intermediate in Computer Science (ICS)",
      code: "ICS",
      level: "intermediate",
      subtitle: "Software Logic & Computational Thinking",
      description:
        "A premier technical pathway bridging fundamental programming, database concepts, and algorithmic reasoning with higher mathematics and physical sciences.",
      academicFocus: "Computer Science & Analytical Logic",
      pathway: "BS Computer Science • Software Engineering • Artificial Intelligence • Data Science",
      duration: "2 Years",
      semestersOrYears: "Annual Board System (Part-I & Part-II)",
      eligibility: "Matriculation / O-Levels in Science or Computer Science (Min. 55% Marks)",
      annualFee: 90000,
      keySubjects: [
        "Programming in C/C++ & Algorithms",
        "Database Architecture & SQL",
        "Applied Physics or Mathematical Statistics",
        "Algebra & Trigonometry",
        "Islamic & Pakistan Studies"
      ],
      careerOutcomes: [
        "Full-Stack Web & Mobile Developer",
        "AI & Machine Learning Practitioner",
        "Data Architect & Cloud Engineer",
        "Cybersecurity & Network Analyst"
      ],
      iconName: "cpu",
      highlight: "State-of-the-art computer labs with gigabit fiber network",
      accent: "primary",
    },
    {
      id: "prog-icom",
      number: "04",
      name: "Intermediate in Commerce (I.Com)",
      code: "I.COM",
      level: "intermediate",
      subtitle: "Accounting, Enterprise & Market Economics",
      description:
        "Specialized foundation in double-entry bookkeeping, financial statements, commercial geography, business mathematics, and microeconomics for future corporate leaders.",
      academicFocus: "Commercial Accounting & Economic Principles",
      pathway: "BBA • BS Accounting & Finance • CA • ACCA • FinTech Leadership",
      duration: "2 Years",
      semestersOrYears: "Annual Board System (Part-I & Part-II)",
      eligibility: "Matriculation / O-Levels in any academic discipline (Min. 50% Marks)",
      annualFee: 85000,
      keySubjects: [
        "Principles of Financial Accounting",
        "Business Mathematics & Statistics",
        "Micro & Macro Economics",
        "Commercial Geography & Banking",
        "Business English & Communication"
      ],
      careerOutcomes: [
        "Chartered Accountant (CA/ACCA)",
        "Corporate Financial Analyst",
        "Investment & Commercial Banker",
        "Enterprise Operations Manager"
      ],
      iconName: "trending",
      highlight: "Direct mentorship pathways toward chartered accountancy (CA)",
      accent: "gold",
    },
  ];

  const undergraduatePrograms: ProgramDetail[] = [
    {
      id: "prog-bs-cs",
      number: "05",
      name: "BS Computer Science",
      code: "BSCS",
      level: "undergraduate",
      subtitle: "4-Year HEC & NCEAC Accredited Degree",
      description:
        "Comprehensive undergraduate degree immersing students in data structures, artificial intelligence, operating systems, cloud architecture, and modern full-stack development.",
      academicFocus: "Computational Theory, Software Design & AI Systems",
      pathway: "Enterprise Tech • Artificial Intelligence • Cloud Computing • Global Tech Roles",
      duration: "4 Years",
      semestersOrYears: "8 Academic Semesters (Semester System)",
      eligibility: "FSc Pre-Engineering / ICS / A-Levels with Mathematics (Min. 50% Marks)",
      annualFee: 180000,
      keySubjects: [
        "Data Structures & Algorithms",
        "Artificial Intelligence & Deep Learning",
        "Database Systems & Distributed Architecture",
        "Operating Systems & Network Protocols",
        "Capstone Industry Project"
      ],
      careerOutcomes: [
        "Senior Software Engineer",
        "AI / Machine Learning Engineer",
        "Cloud Systems Architect",
        "Tech Startup Founder"
      ],
      iconName: "cpu",
      highlight: "Capstone project incubation with corporate partner mentorship",
      accent: "primary",
    },
    {
      id: "prog-bs-se",
      number: "06",
      name: "BS Software Engineering",
      code: "BSSE",
      level: "undergraduate",
      subtitle: "4-Year Professional Engineering Track",
      description:
        "Specialized degree focusing on large-scale software engineering lifecycle, automated testing, DevOps pipelines, secure coding standards, and architectural design patterns.",
      academicFocus: "Enterprise Software Architecture & DevOps Engineering",
      pathway: "Software Architecture • QA Automation • DevOps • Product Engineering",
      duration: "4 Years",
      semestersOrYears: "8 Academic Semesters (Semester System)",
      eligibility: "FSc Pre-Engineering / ICS / A-Levels (Min. 50% Marks)",
      annualFee: 190000,
      keySubjects: [
        "Software Requirements & Architecture",
        "DevOps & CI/CD Pipelines",
        "Software Quality Assurance & Testing",
        "Cloud Native Application Design",
        "Agile Project Management"
      ],
      careerOutcomes: [
        "Principal Software Architect",
        "DevOps & Cloud Engineer",
        "QA Automation Director",
        "Enterprise Solutions Consultant"
      ],
      iconName: "building",
      highlight: "Industry-standard modern development & continuous deployment labs",
      accent: "gold",
    },
    {
      id: "prog-bba",
      number: "07",
      name: "Bachelor of Business Administration (BBA)",
      code: "BBA",
      level: "undergraduate",
      subtitle: "4-Year Executive Leadership & Strategy Degree",
      description:
        "Dynamic management degree integrating corporate finance, digital marketing, human capital management, and supply chain analytics for modern enterprise leadership.",
      academicFocus: "Executive Leadership, Corporate Finance & Market Strategy",
      pathway: "Corporate Management • Brand Strategy • Financial Consulting • Entrepreneurship",
      duration: "4 Years",
      semestersOrYears: "8 Academic Semesters (Semester System)",
      eligibility: "Intermediate (FA / FSc / ICS / I.Com) or A-Levels (Min. 45% Marks)",
      annualFee: 165000,
      keySubjects: [
        "Strategic Corporate Management",
        "Financial Modeling & Investment",
        "Digital Marketing & Consumer Insights",
        "Supply Chain & Operations Analytics",
        "Business Ethics & Corporate Law"
      ],
      careerOutcomes: [
        "Corporate Strategy Manager",
        "Investment & Portfolio Analyst",
        "Digital Marketing Strategist",
        "Operations & Supply Chain Director"
      ],
      iconName: "grad",
      highlight: "Executive guest lecture series with prominent corporate leaders",
      accent: "primary",
    },
  ];

  const getProgramIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "microscope":
        return <Microscope className={className} />;
      case "calculator":
        return <Calculator className={className} />;
      case "cpu":
        return <Cpu className={className} />;
      case "trending":
        return <TrendingUp className={className} />;
      case "building":
        return <Building2 className={className} />;
      case "grad":
      default:
        return <GraduationCap className={className} />;
    }
  };

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
              <span className="text-text-primary font-semibold">Programs</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    ACADEMIC PATHWAYS
                  </p>
                </div>
              </Reveal>

              {/* Main Title */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  Programs Designed <br className="hidden sm:inline" />
                  <span className="text-primary font-light">for the</span> Future
                </h1>
              </Reveal>

              {/* Supporting Text */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Superior Colleges Kanganpur Campus provides structured, accredited academic pathways calibrated to prepare students for top-tier university admissions, competitive professional careers, and leadership in an evolving world.
                  </p>
                </div>
              </Reveal>

              {/* Refined Feature Blocks (Editorial, Not Ordinary Cards) */}
              <Reveal variant="up" className="delay-300 pt-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-10 border-t border-border/80">
                  
                  {/* Block 1 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Higher Secondary</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Intermediate
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      FSc, ICS &amp; I.Com registered with BISE Lahore
                    </p>
                  </div>

                  {/* Block 2 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Higher Education</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-serif">
                      Undergraduate
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      4-Year BS degrees accredited by HEC &amp; NCEAC
                    </p>
                  </div>

                  {/* Block 3 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Methodology</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Student-Centered
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Experimental labs, seminars &amp; personal mentorship
                    </p>
                  </div>

                  {/* Block 4 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-none bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Competency</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-serif">
                      Future-Ready
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Technical fluency &amp; professional career preparation
                    </p>
                  </div>

                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. STORYTELLING SECTION ("CHOOSE YOUR PATH")                               */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              {/* Editorial Split: Left Title / Right Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                <div className="lg:col-span-5 space-y-4">
                  <Reveal variant="up">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        Strategic Orientation
                      </p>
                    </div>
                  </Reveal>
                  <Reveal variant="up" className="delay-100">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                      Choose Your <br className="hidden sm:inline" />
                      Academic Path
                    </h2>
                  </Reveal>
                  <div className="w-16 h-[2px] bg-accent-gold mt-2" />
                </div>

                <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                  <Reveal variant="up" className="delay-150">
                    <p>
                      Selecting an academic pathway is the foundational decision that shapes your intellectual trajectory and future profession. At Superior Colleges Kanganpur Campus, our curricula are structured around deliberate milestones—empowering students to match their innate strengths with market demand.
                    </p>
                  </Reveal>
                  
                  <Reveal variant="up" className="delay-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Criterion 01</span>
                        <h4 className="text-sm font-bold text-text-primary">Intellectual Aptitude &amp; Curiosity</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Tailoring coursework to natural affinities in biological sciences, mathematics, or commerce.
                        </p>
                      </div>

                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Criterion 02</span>
                        <h4 className="text-sm font-bold text-text-primary">University &amp; Professional Vision</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Direct alignments with medical colleges, engineering faculties, and multinational tech firms.
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

              {/* Journey Stepper Bar */}
              <Reveal variant="up" className="delay-200">
                <div className="p-6 md:p-8 bg-white border border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-widest block">Step 01</span>
                      <p className="text-sm font-bold text-text-primary">Foundational Inquiry</p>
                      <p className="text-[11px] text-text-muted">Assessment &amp; Course Selection</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">Step 02</span>
                      <p className="text-sm font-bold text-text-primary">Rigorous Study</p>
                      <p className="text-[11px] text-text-muted">Labs, Lectures &amp; Testing</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-widest block">Step 03</span>
                      <p className="text-sm font-bold text-text-primary">Test Preparation</p>
                      <p className="text-[11px] text-text-muted">MDCAT, ECAT &amp; Entry Prep</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">Step 04</span>
                      <p className="text-sm font-bold text-text-primary">Degree &amp; Career</p>
                      <p className="text-[11px] text-text-muted">Higher Placement &amp; Leadership</p>
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. INTERMEDIATE PATHWAYS (ASYMMETRIC EDITORIAL LAYOUT)                     */}
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
                      Higher Secondary Level
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    Intermediate Pathways
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    2-year recognized qualifications affiliated with the Board of Intermediate and Secondary Education (BISE) Lahore, laying the rigorous groundwork for elite university admissions.
                  </p>
                </Reveal>
              </div>

              {/* ASYMMETRIC INTERMEDIATE COMPOSITION */}
              <div className="space-y-12">
                
                {/* ------------------------------------------------------------- */}
                {/* PROGRAM 01: FSc Pre-Medical (Large Horizontal Flagship)       */}
                {/* ------------------------------------------------------------- */}
                <Reveal variant="up" className="delay-100">
                  <div className="group relative bg-[#FCFDFD] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 overflow-hidden">
                    <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                      
                      <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors duration-300 select-none leading-none">
                            {intermediatePrograms[0].number}
                          </span>
                          <div className="h-8 w-[1px] bg-border" />
                          <div>
                            <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold-light/60 px-2.5 py-0.5 border border-accent-gold/20">
                              {intermediatePrograms[0].code}
                            </span>
                            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
                              {intermediatePrograms[0].duration} &bull; BISE Lahore
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-2xl sm:text-4xl font-extrabold text-text-primary group-hover:text-primary transition-colors">
                            {intermediatePrograms[0].name}
                          </h3>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {intermediatePrograms[0].subtitle}
                          </p>
                        </div>

                        <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                          {intermediatePrograms[0].description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-background-secondary border border-border space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Academic Focus</p>
                            <p className="text-xs font-semibold text-text-primary">{intermediatePrograms[0].academicFocus}</p>
                          </div>
                          <div className="p-4 bg-background-secondary border border-border space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Target Trajectory</p>
                            <p className="text-xs font-semibold text-text-primary">{intermediatePrograms[0].pathway}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Detail Card & Actions */}
                      <div className="lg:col-span-4 bg-white p-6 sm:p-7 border border-border space-y-6 flex flex-col justify-between h-full shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-border">
                            <span className="text-xs text-text-secondary font-medium">Annual Academic Fee</span>
                            <span className="text-lg font-bold text-primary font-serif">{formatPKR(intermediatePrograms[0].annualFee)}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Key Disciplines</p>
                            <ul className="space-y-1.5 text-text-secondary font-light">
                              {intermediatePrograms[0].keySubjects.slice(0, 3).map((sub) => (
                                <li key={sub} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary" />
                                  {sub}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <button
                            onClick={() => setSelectedProgram(intermediatePrograms[0])}
                            className="w-full py-2.5 px-4 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border hover:border-primary transition-all flex items-center justify-center gap-2"
                          >
                            Explore Pathway Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <Link href="/register" className="block">
                            <button className="w-full py-2.5 px-4 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-all">
                              Apply for Admission
                            </button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </Reveal>

                {/* ------------------------------------------------------------- */}
                {/* PROGRAMS 02 & 03: FSc Pre-Engineering & ICS (Asymmetric Pair) */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Program 02: Pre-Engineering (Tall Gold Card) */}
                  <div className="lg:col-span-6">
                    <Reveal variant="up" className="h-full delay-150">
                      <div className="group relative bg-[#075E68] text-white p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#075E68]/25 h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                        
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-accent-gold-light bg-white/10 px-2.5 py-0.5 border border-white/20">
                                {intermediatePrograms[1].code}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                                {intermediatePrograms[1].name}
                              </h3>
                              <p className="text-xs font-medium text-accent-gold-light mt-1">
                                {intermediatePrograms[1].subtitle}
                              </p>
                            </div>
                            <span className="text-5xl sm:text-6xl font-serif font-extrabold text-white/20 group-hover:text-accent-gold/40 transition-colors select-none leading-none">
                              {intermediatePrograms[1].number}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                            {intermediatePrograms[1].description}
                          </p>

                          <div className="p-4 bg-white/10 border border-white/15 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-light">Engineering Pathway</p>
                            <p className="text-xs text-white/95 font-medium">{intermediatePrograms[1].pathway}</p>
                          </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] uppercase text-white/60 block">Annual Tuition</span>
                            <span className="text-lg font-bold text-accent-gold-light font-serif">{formatPKR(intermediatePrograms[1].annualFee)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedProgram(intermediatePrograms[1])}
                              className="px-3.5 py-2 bg-white/10 hover:bg-white hover:text-[#075E68] text-white text-xs font-bold uppercase tracking-wider border border-white/30 transition-colors"
                            >
                              Details
                            </button>
                            <Link href="/register">
                              <button className="px-3.5 py-2 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-colors">
                                Apply
                              </button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </Reveal>
                  </div>

                  {/* Program 03: ICS (Modern Technical Block) */}
                  <div className="lg:col-span-6">
                    <Reveal variant="up" className="h-full delay-200">
                      <div className="group relative bg-white border border-border p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 w-1.5 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
                        
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                                {intermediatePrograms[2].code}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors mt-3">
                                {intermediatePrograms[2].name}
                              </h3>
                              <p className="text-xs font-medium text-text-muted mt-1">
                                {intermediatePrograms[2].subtitle}
                              </p>
                            </div>
                            <span className="text-5xl sm:text-6xl font-serif font-extrabold text-border/70 group-hover:text-primary/30 transition-colors select-none leading-none">
                              {intermediatePrograms[2].number}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                            {intermediatePrograms[2].description}
                          </p>

                          <div className="p-4 bg-background-secondary border border-border space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Computing Trajectory</p>
                            <p className="text-xs text-text-primary font-medium">{intermediatePrograms[2].pathway}</p>
                          </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] uppercase text-text-muted block">Annual Tuition</span>
                            <span className="text-lg font-bold text-primary font-serif">{formatPKR(intermediatePrograms[2].annualFee)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedProgram(intermediatePrograms[2])}
                              className="px-3.5 py-2 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border transition-colors"
                            >
                              Details
                            </button>
                            <Link href="/register">
                              <button className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors">
                                Apply
                              </button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </Reveal>
                  </div>

                </div>

                {/* ------------------------------------------------------------- */}
                {/* PROGRAM 04: I.Com (Wide Commerce Anchor Block)                */}
                {/* ------------------------------------------------------------- */}
                <Reveal variant="up" className="delay-200">
                  <div className="group relative bg-[#F7F9F9] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40">
                    <div className="absolute left-0 bottom-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-5xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors leading-none">
                            {intermediatePrograms[3].number}
                          </span>
                          <div className="h-6 w-[1px] bg-border" />
                          <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold-light/60 px-2.5 py-0.5 border border-accent-gold/20">
                            {intermediatePrograms[3].code}
                          </span>
                          <span className="text-xs text-text-muted font-medium">Commerce &amp; Finance</span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors">
                          {intermediatePrograms[3].name}
                        </h3>

                        <p className="text-base text-text-secondary leading-relaxed font-light">
                          {intermediatePrograms[3].description}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-1">
                          <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                            {intermediatePrograms[3].highlight}
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-4 lg:text-right flex flex-col lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                        <div>
                          <span className="text-xs text-text-muted block">Annual Fee</span>
                          <span className="text-2xl font-bold text-primary font-serif">{formatPKR(intermediatePrograms[3].annualFee)}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                          <button
                            onClick={() => setSelectedProgram(intermediatePrograms[3])}
                            className="flex-1 lg:flex-initial px-4 py-2.5 bg-white hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border transition-colors"
                          >
                            Pathway Details
                          </button>
                          <Link href="/register" className="flex-1 lg:flex-initial">
                            <button className="w-full px-4 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-colors">
                              Apply
                            </button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </Reveal>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. UNDERGRADUATE DEGREES (ADVANCED EDITORIAL TRIO)                        */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">Higher Education Level</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Undergraduate Degree Tracks
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    4-Year Bachelor of Science degrees accredited by HEC and national councils, engineered for technical leadership and international competitiveness.
                  </p>
                </Reveal>
              </div>

              {/* Undergraduate Cards Trio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {undergraduatePrograms.map((prog, idx) => (
                  <Reveal key={prog.id} variant="up" className={`h-full delay-${(idx + 1) * 100}`}>
                    <div className="group h-full bg-white border border-border p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary flex flex-col justify-between relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-0 h-1.5 ${prog.accent === "gold" ? "bg-accent-gold" : "bg-primary"} transition-all duration-500 group-hover:w-full`} />
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-1">
                            {prog.code}
                          </span>
                          <span className="text-4xl font-serif font-extrabold text-border/70 group-hover:text-primary/30 transition-colors">
                            {prog.number}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-xl sm:text-2xl font-bold text-text-primary group-hover:text-primary transition-colors">
                            {prog.name}
                          </h3>
                          <p className="text-xs font-medium text-text-muted">
                            {prog.subtitle}
                          </p>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {prog.description}
                        </p>

                        <div className="p-3.5 bg-background-secondary border border-border space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Focus Area</p>
                          <p className="text-xs font-medium text-text-primary">{prog.academicFocus}</p>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted">Annual Tuition</span>
                          <span className="text-base font-bold text-primary font-serif">{formatPKR(prog.annualFee)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedProgram(prog)}
                            className="py-2 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-[11px] font-bold uppercase tracking-wider border border-border transition-colors"
                          >
                            Curriculum
                          </button>
                          <Link href="/register" className="block">
                            <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold uppercase tracking-wider transition-colors">
                              Enroll
                            </button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. WHY CHOOSE SUPERIOR PATHWAYS (INSTITUTIONAL METRICS & ADVANTAGES)       */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Institutional Distinction
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Why Choose Superior Pathways
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    Designed to bridge high-school fundamentals with international academic and professional standards.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Award className="w-6 h-6 text-primary" />,
                    title: "Accredited Rigor",
                    desc: "Full recognition by BISE Lahore, HEC, and national professional councils."
                  },
                  {
                    icon: <Users className="w-6 h-6 text-accent-gold" />,
                    title: "Distinguished Faculty",
                    desc: "Subject matter authorities with decades of pedagogical and research experience."
                  },
                  {
                    icon: <Target className="w-6 h-6 text-primary" />,
                    title: "Entrance Exam Focus",
                    desc: "Systematic test prep modules integrated directly into regular subject instruction."
                  },
                  {
                    icon: <BookOpen className="w-6 h-6 text-accent-gold" />,
                    title: "Advanced Facilities",
                    desc: "State-of-the-art computer networks, chemistry, physics, and biological labs."
                  }
                ].map((item, idx) => (
                  <Reveal key={item.title} variant="up" className={`delay-${(idx + 1) * 100}`}>
                    <div className="p-7 bg-background-secondary border border-border hover:border-primary hover:shadow-lg transition-all duration-300 space-y-3 h-full">
                      <div className="p-2.5 w-fit bg-white border border-border">{item.icon}</div>
                      <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 6. INTERACTIVE PROGRAM DETAIL MODAL / DRAWER                               */}
        {/* ========================================================================= */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-border shadow-2xl p-6 sm:p-10 space-y-8 animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary hover:bg-background-secondary border border-transparent hover:border-border transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                    {selectedProgram.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider">
                    Pathway {selectedProgram.number}
                  </span>
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    &bull; {selectedProgram.level.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  {selectedProgram.name}
                </h3>
                <p className="text-sm font-semibold text-primary">
                  {selectedProgram.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-base text-text-secondary leading-relaxed font-light">
                {selectedProgram.description}
              </p>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background-secondary border border-border text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Duration &amp; Structure</span>
                  <p className="font-semibold text-text-primary">{selectedProgram.duration} ({selectedProgram.semestersOrYears})</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Annual Tuition</span>
                  <p className="font-semibold text-primary font-serif text-sm">{formatPKR(selectedProgram.annualFee)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Academic Focus</span>
                  <p className="font-semibold text-text-primary">{selectedProgram.academicFocus}</p>
                </div>
              </div>

              {/* Subject Pillars & Career Outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Core Subject Pillars
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedProgram.keySubjects.map((subject) => (
                      <li key={subject} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                        <span>{subject}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark flex items-center gap-2">
                    <Target className="w-4 h-4" /> Professional Horizons
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedProgram.careerOutcomes.map((career) => (
                      <li key={career} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{career}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Entry Requirement Alert */}
              <div className="p-4 border-l-4 border-accent-gold bg-accent-gold-light/20 border-t border-r border-b border-border space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent-gold-dark">Eligibility &amp; Entry Requirement</p>
                <p className="text-xs text-text-secondary">{selectedProgram.eligibility}</p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="w-full sm:w-auto px-6 py-2.5 border border-border text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-background-secondary transition-colors"
                >
                  Close
                </button>
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    Proceed to Registration <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 7. PRESERVED CALL TO ACTION                                               */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Ready to Choose Your Academic Pathway?"
          description={`Take the next step in your scholastic journey at Superior Colleges ${MOCK_COLLEGE.city} Campus. Admissions for the upcoming session are actively open.`}
          href="/register"
          label="Apply for Fall 2026"
        />

      </div>
    </PublicLayout>
  );
}
