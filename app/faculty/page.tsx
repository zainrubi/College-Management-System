"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Target,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Mail,
  Phone,
  Search,
  UserCheck,
  X,
  Compass,
  Building2,
  Layers,
  Calendar,
  Briefcase
} from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  qualification: string;
  almaMater: string;
  email: string;
  phone: string;
  experienceYears: number;
  specialization: string[];
  bio: string;
  featured?: boolean;
  assignedCourses: string[];
  officeHours: string;
  image?: string;
}

export default function FacultyPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFacultyModal, setActiveFacultyModal] = useState<FacultyMember | null>(null);

  const facultyList: FacultyMember[] = [
    {
      id: "tch-101",
      name: "Dr. Muhammad Shahbaz",
      designation: "Associate Professor",
      departmentId: "cs",
      departmentName: "Department of Computer Science & IT",
      qualification: "Ph.D. Computer Science",
      almaMater: "FAST-NUCES Lahore",
      email: "shahbaz@apex.edu.pk",
      phone: "+92 300 4443322",
      experienceYears: 12,
      specialization: ["Data Structures & Algorithms", "Artificial Intelligence", "Object-Oriented Architecture"],
      bio: "Dr. Shahbaz leads computing pedagogy with deep research in algorithmic optimization and machine learning. He has mentored over 800 students into premier university programs and multinational software engineering roles.",
      featured: true,
      assignedCourses: ["Programming Fundamentals (CS-101)", "Object Oriented Programming (CS-102)", "AI Capstone"],
      officeHours: "Mon - Thu: 10:00 AM - 1:00 PM",
      image: "/images/advantages/experienced_faculty.jpg",
    },
    {
      id: "tch-104",
      name: "Dr. Tariq Mahmood",
      designation: "Professor & Head of Department",
      departmentId: "cs",
      departmentName: "Department of Computer Science & IT",
      qualification: "Ph.D. Software Engineering",
      almaMater: "University of the Punjab",
      email: "tariq.cs@apex.edu.pk",
      phone: "+92 300 1122334",
      experienceYears: 18,
      specialization: ["Cloud Infrastructure", "Distributed Systems", "Software Architecture"],
      bio: "Dr. Tariq is an acclaimed academician and tech advisor with nearly two decades of pedagogical leadership. He directs curriculum alignment with modern industrial tech stacks.",
      assignedCourses: ["Database Systems", "Cloud Computing & DevOps", "Advanced Software Engineering"],
      officeHours: "Tue & Thu: 11:00 AM - 2:00 PM",
    },
    {
      id: "tch-102",
      name: "Prof. Aisha Rehman",
      designation: "Professor & Academic Director",
      departmentId: "business",
      departmentName: "Faculty of Management Sciences",
      qualification: "M.Phil Management Sciences",
      almaMater: "LUMS (Lahore University of Management Sciences)",
      email: "aisha.rehman@apex.edu.pk",
      phone: "+92 321 3332211",
      experienceYears: 15,
      specialization: ["Strategic Corporate Management", "Consumer Economics", "Enterprise Leadership"],
      bio: "Prof. Aisha brings executive consulting and corporate strategy acumen to management education. Her case-study approach prepares aspiring managers for national and international business challenges.",
      featured: true,
      assignedCourses: ["Principles of Management (MGT-201)", "Corporate Governance", "Strategic Marketing"],
      officeHours: "Mon, Wed, Fri: 9:00 AM - 12:00 PM",
    },
    {
      id: "tch-105",
      name: "Prof. Saima Malik",
      designation: "Assistant Professor",
      departmentId: "business",
      departmentName: "Faculty of Management Sciences",
      qualification: "MS Management & Accounting",
      almaMater: "LUMS",
      email: "saima.malik@apex.edu.pk",
      phone: "+92 322 7788990",
      experienceYears: 9,
      specialization: ["Corporate Financial Accounting", "Microeconomics", "Business Statistics"],
      bio: "Prof. Saima mentors students across intermediate commerce and undergraduate administration, specializing in financial accounting systems and commercial law.",
      assignedCourses: ["Financial Accounting", "Business Economics", "Managerial Finance"],
      officeHours: "Mon - Thu: 11:30 AM - 1:30 PM",
    },
    {
      id: "tch-103",
      name: "Prof. Muhammad Usman",
      designation: "Associate Professor & Dean of Sciences",
      departmentId: "sciences",
      departmentName: "Faculty of Intermediate Sciences",
      qualification: "M.Phil Physics",
      almaMater: "UET Lahore",
      email: "usman.physics@apex.edu.pk",
      phone: "+92 334 8887766",
      experienceYears: 16,
      specialization: ["Classical Mechanics", "Electrodynamics", "Quantum & Solid State Physics"],
      bio: "Prof. Usman oversees science education at Superior Colleges Kanganpur Campus. His rigorous conceptual methodology has yielded hundreds of board distinctions in BISE Lahore FSc examinations.",
      featured: true,
      assignedCourses: ["Physics Part-I (PHY-11)", "Physics Part-II (PHY-12)", "Applied Mechanics Lab"],
      officeHours: "Mon - Fri: 8:30 AM - 11:30 AM",
      image: "/images/classroom.jpg",
    },
    {
      id: "tch-106",
      name: "Engr. Rashid Minhas",
      designation: "Senior Lecturer",
      departmentId: "sciences",
      departmentName: "Faculty of Intermediate Sciences",
      qualification: "M.Sc. Applied Physics",
      almaMater: "UET Lahore",
      email: "rashid.minhas@apex.edu.pk",
      phone: "+92 333 4455667",
      experienceYears: 10,
      specialization: ["Vector Mechanics", "Optics & Wave Physics", "Experimental Instrumentation"],
      bio: "Engr. Rashid is a passionate experimental educator directing student laboratory inquiry and ECAT entrance preparation modules.",
      assignedCourses: ["Engineering Physics", "Physics Practical Laboratory", "ECAT Prep Series"],
      officeHours: "Tue, Wed, Thu: 12:00 PM - 2:30 PM",
    },
    {
      id: "tch-107",
      name: "Dr. Farhan Ali",
      designation: "Assistant Professor",
      departmentId: "sciences",
      departmentName: "Faculty of Intermediate Sciences",
      qualification: "Ph.D. Chemistry",
      almaMater: "University of the Punjab",
      email: "farhan.chemistry@apex.edu.pk",
      phone: "+92 301 5566778",
      experienceYears: 11,
      specialization: ["Organic Chemistry", "Bio-Chemistry", "MDCAT Preparation"],
      bio: "Dr. Farhan specializes in organic reaction mechanisms and biochemistry pathways, serving as senior advisor for pre-medical scholars entering medical universities.",
      assignedCourses: ["Organic Chemistry", "Physical Chemistry", "MDCAT Chemistry Seminar"],
      officeHours: "Mon - Thu: 9:00 AM - 12:00 PM",
    },
    {
      id: "tch-108",
      name: "Prof. Noman Siddiqui",
      designation: "Senior Lecturer",
      departmentId: "sciences",
      departmentName: "Faculty of Intermediate Sciences",
      qualification: "M.Phil Mathematics",
      almaMater: "GC University Lahore",
      email: "noman.math@apex.edu.pk",
      phone: "+92 321 8899001",
      experienceYears: 13,
      specialization: ["Differential Calculus", "Analytical Geometry", "Algebraic Vectors"],
      bio: "Prof. Noman is celebrated for simplifying complex calculus and analytical mathematics, cultivating unmatched analytical confidence among engineering and computing students.",
      assignedCourses: ["Calculus & Analytical Geometry", "Algebra & Trigonometry", "Discrete Mathematics"],
      officeHours: "Mon - Fri: 10:00 AM - 1:00 PM",
    },
  ];

  const departmentsFilter = [
    { id: "all", label: "All Faculty" },
    { id: "cs", label: "Computer Science & IT" },
    { id: "sciences", label: "Natural & Intermediate Sciences" },
    { id: "business", label: "Management Sciences & Commerce" },
  ];

  const filteredFaculty = useMemo(() => {
    return facultyList.filter((faculty) => {
      const matchesDept = selectedDepartment === "all" || faculty.departmentId === selectedDepartment;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDept && matchesSearch;
    });
  }, [selectedDepartment, searchQuery]);

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
              <span className="text-text-primary font-semibold">Faculty</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    THE PEOPLE BEHIND THE CLASSROOM
                  </p>
                </div>
              </Reveal>

              {/* Main Title */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  Meet the <br className="hidden sm:inline" />
                  <span className="text-primary font-light">Faculty</span>
                </h1>
              </Reveal>

              {/* Supporting Text */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Dedicated educators who bring knowledge, experience, and mentorship into every student's academic journey at Superior Colleges Kanganpur Campus.
                  </p>
                </div>
              </Reveal>

              {/* Refined Feature Blocks (Editorial Numbers, NOT Generic Cards) */}
              <Reveal variant="up" className="delay-300 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 pt-10 border-t border-border/80">
                  
                  {/* Block 01 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-gold">01</span>
                      <span className="w-4 h-[1px] bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Faculty Rigor</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Experienced Educators
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Ph.D., M.Phil, and master's qualified scholars from Pakistan's top universities
                    </p>
                  </div>

                  {/* Block 02 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">02</span>
                      <span className="w-4 h-[1px] bg-primary" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Guidance</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-serif">
                      Student Mentorship
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Personalized academic coaching, career direction, and entry test preparation
                    </p>
                  </div>

                  {/* Block 03 */}
                  <div className="group space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-gold">03</span>
                      <span className="w-4 h-[1px] bg-accent-gold" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">Standards</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-serif">
                      Academic Excellence
                    </p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      Unmatched track record of BISE Lahore board positions and university placements
                    </p>
                  </div>

                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. INTRODUCTION SECTION                                                   */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              {/* Asymmetric Two-Column Composition */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                <div className="lg:col-span-5 space-y-4">
                  <Reveal variant="up">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        Our Faculty
                      </p>
                    </div>
                  </Reveal>
                  <Reveal variant="up" className="delay-100">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                      Knowledge Is Powerful. <br className="hidden sm:inline" />
                      Great Teaching Makes It Transformative.
                    </h2>
                  </Reveal>
                  <div className="w-16 h-[2px] bg-accent-gold mt-2" />
                </div>

                <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                  <Reveal variant="up" className="delay-150">
                    <p>
                      At Superior Colleges Kanganpur Campus, great education begins with great educators. Our professors and lecturers are more than subject matter authorities—they are dedicated mentors who ignite intellectual ambition and cultivate ethical character.
                    </p>
                  </Reveal>
                  
                  <Reveal variant="up" className="delay-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Pedagogical Value 01</span>
                        <h4 className="text-sm font-bold text-text-primary">Critical Thinking &amp; Discipline</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Challenging students to think analytically, formulate logical proofs, and defend arguments.
                        </p>
                      </div>

                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Pedagogical Value 02</span>
                        <h4 className="text-sm font-bold text-text-primary">Confidence &amp; Future Preparation</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Equipping scholars with communicative ease, moral conviction, and university readiness.
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. LEADERS IN LEARNING (FEATURED ACADEMIC DEANS)                           */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
              
              {/* Header */}
              <div className="max-w-3xl space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent-gold" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-accent-gold-dark">
                      Leaders in Learning
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    Distinguished Academic Leadership
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    Senior faculty members shaping the academic direction, research culture, and pedagogical standards of Superior Colleges.
                  </p>
                </Reveal>
              </div>

              {/* Featured Leadership Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                
                {/* Leader 01: Dr. Muhammad Shahbaz (Computing Dean) */}
                <div className="lg:col-span-7">
                  <Reveal variant="up" className="h-full delay-100">
                    <div className="group relative bg-[#FCFDFD] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 h-full flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                              COMPUTER SCIENCE &amp; IT
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-text-primary group-hover:text-primary transition-colors mt-3">
                              {facultyList[0].name}
                            </h3>
                            <p className="text-sm font-semibold text-text-muted mt-1">
                              {facultyList[0].designation} &bull; {facultyList[0].qualification}
                            </p>
                          </div>
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold text-border/70 group-hover:text-primary/30 transition-colors select-none leading-none">
                            01
                          </span>
                        </div>

                        <p className="text-base text-text-secondary leading-relaxed font-light">
                          {facultyList[0].bio}
                        </p>

                        <div className="p-4 bg-background-secondary border border-border space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Areas of Specialization</p>
                          <div className="flex flex-wrap gap-1.5">
                            {facultyList[0].specialization.map((spec) => (
                              <span key={spec} className="text-xs font-semibold text-text-primary bg-white px-2.5 py-1 border border-border">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 mt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Alma Mater</span>
                          <p className="text-xs font-semibold text-text-primary">{facultyList[0].almaMater}</p>
                        </div>

                        <button
                          onClick={() => setActiveFacultyModal(facultyList[0])}
                          className="px-4 py-2.5 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border hover:border-primary transition-all flex items-center justify-center gap-2"
                        >
                          View Academic Profile <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </Reveal>
                </div>

                {/* Leader 02: Prof. Aisha Rehman (Management Dean) */}
                <div className="lg:col-span-5">
                  <Reveal variant="up" className="h-full delay-200">
                    <div className="group relative bg-[#075E68] text-white p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#075E68]/25 h-full flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-accent-gold-light bg-white/10 px-2.5 py-0.5 border border-white/20">
                              MANAGEMENT SCIENCES
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                              {facultyList[2].name}
                            </h3>
                            <p className="text-xs font-medium text-accent-gold-light mt-1">
                              {facultyList[2].designation} &bull; {facultyList[2].qualification}
                            </p>
                          </div>
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold text-white/20 group-hover:text-accent-gold/40 transition-colors select-none leading-none">
                            02
                          </span>
                        </div>

                        <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                          {facultyList[2].bio}
                        </p>

                        <div className="p-4 bg-white/10 border border-white/15 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-light">Executive Focus</p>
                          <div className="flex flex-wrap gap-1.5">
                            {facultyList[2].specialization.map((spec) => (
                              <span key={spec} className="text-xs font-semibold text-white bg-white/15 px-2.5 py-1 border border-white/20">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 mt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase text-white/60 block">Alma Mater</span>
                          <span className="text-xs font-bold text-accent-gold-light">{facultyList[2].almaMater}</span>
                        </div>

                        <button
                          onClick={() => setActiveFacultyModal(facultyList[2])}
                          className="px-4 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                          View Profile <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. FACULTY DIRECTORY & DISCOVERY                                          */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F7F9F9] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-14">
              
              {/* Header & Filter Controls */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                  <Reveal variant="up">
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">Academic Directory</p>
                      <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                        Explore Our Faculty
                      </h2>
                    </div>
                  </Reveal>
                  
                  {/* Minimal Search Bar */}
                  <Reveal variant="up" className="delay-100">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, subject, or department..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </Reveal>
                </div>

                {/* Minimal Department Filter Tabs */}
                <Reveal variant="up" className="delay-150">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
                    {departmentsFilter.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDepartment(dept.id)}
                        className={`text-xs font-bold uppercase tracking-wider py-2 px-3.5 transition-all relative ${
                          selectedDepartment === dept.id
                            ? "text-primary border-b-2 border-primary bg-white shadow-sm"
                            : "text-text-secondary hover:text-primary hover:bg-white/50"
                        }`}
                      >
                        {dept.label}
                      </button>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* Faculty Cards Grid (Editorial Rectangular Panels) */}
              {filteredFaculty.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredFaculty.map((faculty, idx) => (
                    <Reveal key={faculty.id} variant="up" className={`delay-${(idx % 3) * 100 + 100}`}>
                      <div className="group h-full bg-white border border-border p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                        
                        <div className="space-y-5">
                          <div className="flex items-start justify-between">
                            <span className="text-[11px] font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                              {faculty.departmentId.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-text-muted">
                              {faculty.experienceYears}+ Yrs Exp.
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                              {faculty.name}
                            </h3>
                            <p className="text-xs font-semibold text-accent-gold-dark mt-0.5">
                              {faculty.designation}
                            </p>
                            <p className="text-xs text-text-muted font-light mt-1">
                              {faculty.qualification} &bull; {faculty.almaMater}
                            </p>
                          </div>

                          <p className="text-xs text-text-secondary leading-relaxed font-light line-clamp-3">
                            {faculty.bio}
                          </p>

                          {/* Specialization Tags */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Areas of Teaching</p>
                            <div className="flex flex-wrap gap-1">
                              {faculty.specialization.slice(0, 2).map((spec) => (
                                <span key={spec} className="text-[11px] font-medium text-text-secondary bg-background-secondary px-2 py-0.5 border border-border">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                          <a
                            href={`mailto:${faculty.email}`}
                            className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            <span>Contact</span>
                          </a>

                          <button
                            onClick={() => setActiveFacultyModal(faculty)}
                            className="text-xs font-bold text-primary group-hover:text-accent-gold transition-colors inline-flex items-center gap-1"
                          >
                            Profile Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white border border-border space-y-3">
                  <p className="text-lg font-bold text-text-primary">No faculty members found</p>
                  <p className="text-sm text-text-secondary">Try adjusting your search query or selecting another department.</p>
                  <button
                    onClick={() => {
                      setSelectedDepartment("all");
                      setSearchQuery("");
                    }}
                    className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. COLLECTIVE ACADEMIC EXPERTISE                                          */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Faculty Competencies</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Academic Expertise
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Multidisciplinary teaching authority spanning computer science, natural sciences, commerce, and humanistic inquiry.
                  </p>
                </Reveal>
              </div>

              {/* Numbered Discipline Rows */}
              <div className="divide-y divide-border">
                {[
                  {
                    num: "01",
                    title: "Computer Science, AI & Software Architecture",
                    desc: "Algorithmic thinking, full-stack programming, cloud architecture, deep learning, and cybersecurity.",
                    depts: "CS-IT Department & Undergraduate BSCS/BSSE"
                  },
                  {
                    num: "02",
                    title: "Higher Mathematics & Analytical Mechanics",
                    desc: "Differential calculus, analytical geometry, linear algebra, and mathematical statistics.",
                    depts: "Faculty of Intermediate Sciences (Pre-Engineering & ICS)"
                  },
                  {
                    num: "03",
                    title: "Biological, Medical & Life Sciences",
                    desc: "Cellular biology, genetics, physiology, bio-chemistry, and national MDCAT preparation.",
                    depts: "Faculty of Intermediate Sciences (Pre-Medical)"
                  },
                  {
                    num: "04",
                    title: "Corporate Strategy, Finance & Accountancy",
                    desc: "Financial accounting, cost modeling, macroeconomics, marketing analytics, and CA pathways.",
                    depts: "Faculty of Management Sciences (BBA & I.Com)"
                  },
                  {
                    num: "05",
                    title: "Languages, Communication & Civic Ethics",
                    desc: "Functional English, Urdu literature, Pakistan studies, and Islamic ethical philosophy.",
                    depts: "Core General Academic Curriculum"
                  }
                ].map((item, idx) => (
                  <Reveal key={item.num} variant="up" className={`delay-${idx * 100}`}>
                    <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center group hover:bg-[#FCFDFD] px-4 transition-colors">
                      <div className="lg:col-span-1">
                        <span className="text-3xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors">
                          {item.num}
                        </span>
                      </div>
                      <div className="lg:col-span-5">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs font-mono text-accent-gold-dark mt-1">{item.depts}</p>
                      </div>
                      <div className="lg:col-span-6">
                        <p className="text-sm text-text-secondary font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 6. BEYOND THE CLASSROOM (FACULTY IMPACT)                                   */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Beyond The Classroom
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Educators Who Shape Lives
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    Faculty involvement at Superior Colleges extends far beyond scheduled lectures, fostering holistic character and life readiness.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    num: "01",
                    title: "Mentorship",
                    desc: "Guiding students beyond academic requirements with individual counsel and goal setting."
                  },
                  {
                    num: "02",
                    title: "Student Support",
                    desc: "Helping scholars build self-confidence, academic resilience, and moral conviction."
                  },
                  {
                    num: "03",
                    title: "Academic Growth",
                    desc: "Creating an environment focused on continuous inquiry, debate, and intellectual growth."
                  },
                  {
                    num: "04",
                    title: "Future Readiness",
                    desc: "Preparing students for admission into prestigious medical, engineering, and tech universities."
                  }
                ].map((item, idx) => (
                  <Reveal key={item.title} variant="up" className={`delay-${(idx + 1) * 100}`}>
                    <div className="p-7 bg-white border border-border hover:border-primary hover:shadow-lg transition-all duration-300 space-y-3 h-full">
                      <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Pillar {item.num}</span>
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
        {/* 7. INTERACTIVE FACULTY DETAIL MODAL                                       */}
        {/* ========================================================================= */}
        {activeFacultyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-border shadow-2xl p-6 sm:p-10 space-y-8 animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFacultyModal(null)}
                className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary hover:bg-background-secondary border border-transparent hover:border-border transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                    {activeFacultyModal.departmentId.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    {activeFacultyModal.experienceYears}+ Years Teaching Experience
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {activeFacultyModal.name}
                </h3>
                <p className="text-sm font-semibold text-primary">
                  {activeFacultyModal.designation} &bull; {activeFacultyModal.departmentName}
                </p>
              </div>

              {/* Academic Biography */}
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                {activeFacultyModal.bio}
              </p>

              {/* Credentials & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background-secondary border border-border text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Highest Qualification</span>
                  <p className="font-semibold text-text-primary">{activeFacultyModal.qualification}</p>
                  <p className="text-[11px] text-text-secondary">{activeFacultyModal.almaMater}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Office &amp; Advising Hours</span>
                  <p className="font-semibold text-text-primary">{activeFacultyModal.officeHours}</p>
                </div>
              </div>

              {/* Teaching Specialization & Assigned Courses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Areas of Specialization
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {activeFacultyModal.specialization.map((spec) => (
                      <li key={spec} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Courses &amp; Seminars
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {activeFacultyModal.assignedCourses.map((crs) => (
                      <li key={crs} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{crs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Contact Links */}
              <div className="p-4 bg-[#FCFDFD] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-text-primary">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-mono">{activeFacultyModal.email}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-4 h-4 text-accent-gold" />
                  <span>{activeFacultyModal.phone}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveFacultyModal(null)}
                  className="px-6 py-2.5 border border-border text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-background-secondary transition-colors"
                >
                  Close
                </button>
                <Link href="/programs">
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    Explore Department Programs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 8. FINAL INSTITUTIONAL CALL TO ACTION                                      */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Learn With People Who Care"
          description="Discover the educators who help our students turn academic potential into meaningful opportunities at Superior Colleges Kanganpur Campus."
          href="/admissions"
          label="Explore Admissions"
        />

      </div>
    </PublicLayout>
  );
}
