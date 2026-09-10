"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  CheckSquare,
  CreditCard,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  Lock,
  UserPlus,
  Compass,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Award,
  BookOpen
} from "lucide-react";

export default function AdmissionsPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const admissionSteps = [
    {
      step: "01",
      title: "Create Applicant Account",
      description: "Register with your full name, email, and phone number to access your dedicated personal applicant portal.",
      actionLabel: "Register Now",
      href: "/register",
    },
    {
      step: "02",
      title: "Choose Program & Pathway",
      description: "Select your desired discipline across Intermediate (FSc, ICS, I.Com) or 4-Year Undergraduate Degrees (BSCS, BSSE, BBA).",
      actionLabel: "View Programs",
      href: "/programs",
    },
    {
      step: "03",
      title: "Submit Academic Records",
      description: "Enter your matriculation or intermediate marks, upload required transcripts, and verify your personal information.",
      actionLabel: "Check Requirements",
      href: "#requirements",
    },
    {
      step: "04",
      title: "Merit Evaluation & Review",
      description: "The admissions committee reviews submitted credentials against board criteria and publishes departmental merit lists.",
      actionLabel: "Review Guidelines",
      href: "#eligibility",
    },
    {
      step: "05",
      title: "Enrollment & Orientation",
      description: "Pay the official admission fee voucher to secure your seat, receive your student ID, and attend campus orientation.",
      actionLabel: "Apply Online",
      href: "/register",
    },
  ];

  const eligibilityList = [
    {
      faculty: "Computing & Software Engineering",
      program: "BS Computer Science (BSCS) & BS Software Engineering (BSSE)",
      duration: "4 Years (8 Semesters)",
      criteria: "Minimum 50% marks in FSc Pre-Engineering / ICS / A-Levels with Mathematics or equivalent qualification recognized by IBCC.",
      code: "BSCS / BSSE",
    },
    {
      faculty: "Management Sciences & Commerce",
      program: "Bachelor of Business Administration (BBA)",
      duration: "4 Years (8 Semesters)",
      criteria: "Minimum 45% marks in Intermediate (FA, FSc, ICS, I.Com) or A-Levels in any discipline.",
      code: "BBA",
    },
    {
      faculty: "Faculty of Intermediate Sciences",
      program: "FSc Pre-Medical & FSc Pre-Engineering",
      duration: "2 Years (Annual BISE Lahore System)",
      criteria: "Minimum 60% marks in Matriculation (Science Group with Biology or Mathematics) or O-Levels equivalent.",
      code: "FSC",
    },
    {
      faculty: "Intermediate in Computer Science",
      program: "ICS (Physics/Statistics & Computer Science)",
      duration: "2 Years (Annual BISE Lahore System)",
      criteria: "Minimum 55% marks in Matriculation with Science or Computer Science subjects.",
      code: "ICS",
    },
    {
      faculty: "Intermediate in Commerce",
      program: "I.Com (Accounting, Economics & Business)",
      duration: "2 Years (Annual BISE Lahore System)",
      criteria: "Minimum 50% marks in Matriculation / O-Levels in any academic discipline.",
      code: "I.COM",
    },
  ];

  const requiredDocuments = [
    "Attested copy of Matriculation / O-Level result card & certificate",
    "Attested copy of Intermediate / HSSC transcript (for BS Degree applicants)",
    "Copy of National ID Card (CNIC) or official Nadra B-Form",
    "Parent / Guardian National ID Card (CNIC) copy",
    "4 Recent passport-sized color photographs (blue background)",
    "Original Character Certificate issued by previous school / college",
    "Equivalence Certificate from IBCC (for foreign / A-Level qualification holders)",
  ];

  const faqs = [
    {
      q: "How do I begin my application for Fall 2026?",
      a: "You can start by creating an applicant account on our portal using your email and mobile number. Once registered, log in to select your program, fill in your academic scores, and submit your application online.",
    },
    {
      q: "Do I need to visit the campus in person to submit the initial application?",
      a: "No. The initial application, program selection, and document upload can be completed entirely online. You only need to visit campus for document physical verification and fee voucher submission upon merit qualification.",
    },
    {
      q: "Can I apply for more than one academic program?",
      a: "Yes. You may specify up to two alternative program preferences in your online application (for example, applying for BS Computer Science with BS Software Engineering as your secondary preference).",
    },
    {
      q: "What is the procedure for fee payment after admission approval?",
      a: "Once your application is reviewed and merit-approved, an official bank fee voucher will be generated in your applicant portal. Fees can be paid at designated partner bank branches or via online banking.",
    },
    {
      q: "Are merit-based scholarships or financial assistance available?",
      a: "Yes. Superior Colleges Kanganpur Campus offers generous merit scholarships for high-achieving matriculation and intermediate position holders, as well as need-based financial installment arrangements.",
    },
    {
      q: "How will I be notified regarding my admission status?",
      a: "You will receive SMS and email notifications at each milestone. You can also log in to your applicant portal at any time to monitor your real-time application status.",
    },
  ];

  return (
    <PublicLayout>
      <div className="bg-white text-text-primary selection:bg-primary selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL ADMISSIONS HERO WITH ASYMMETRIC COMPOSITION                  */}
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
              <span className="text-text-primary font-semibold">Admissions</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-8">
                <Reveal variant="up">
                  <div className="inline-flex items-center gap-3">
                    <span className="w-6 h-[1.5px] bg-accent-gold" />
                    <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                      ADMISSIONS FALL 2026
                    </p>
                  </div>
                </Reveal>

                <Reveal variant="up" className="delay-100">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                    Your Next Chapter <br className="hidden sm:inline" />
                    <span className="text-primary font-light">Starts</span> Here
                  </h1>
                </Reveal>

                <Reveal variant="up" className="delay-200">
                  <p className="text-lg sm:text-xl text-text-secondary font-light leading-relaxed max-w-2xl">
                    Take the first step toward your academic future at Superior Colleges Kanganpur Campus. Explore structured pathways, check eligibility thresholds, and apply through our streamlined online portal.
                  </p>
                </Reveal>

                {/* Primary & Secondary Conversion Triggers */}
                <Reveal variant="up" className="delay-300">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <Link href="/register">
                      <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group">
                        <span>Apply for Admission</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>

                    <Link href="/programs">
                      <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-background-secondary text-text-primary text-xs font-bold uppercase tracking-wider border border-border transition-colors flex items-center justify-center gap-2">
                        Explore Programs
                      </button>
                    </Link>
                  </div>
                </Reveal>

                {/* Editorial Trust Badges */}
                <Reveal variant="up" className="delay-300 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-border">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">Status</span>
                      <p className="text-xs font-bold text-text-primary">Applications Active</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">Accreditation</span>
                      <p className="text-xs font-bold text-text-primary">BISE &amp; HEC Recognized</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">Support</span>
                      <p className="text-xs font-bold text-text-primary">Admissions Help Desk</p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right Column: Asymmetric Image Framing */}
              <div className="lg:col-span-5 relative">
                <Reveal variant="right" className="delay-150">
                  <div className="relative">
                    <div className="relative aspect-[4/5] bg-text-primary border border-border shadow-2xl overflow-hidden group">
                      <Image
                        src="/images/hero_pakistani_students.jpg"
                        alt="Prospective scholars applying to Superior Colleges"
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Floating Badge Strip */}
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-sm border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Fall 2026 Intake</p>
                            <p className="text-xs font-bold text-text-primary mt-0.5">Intermediate &amp; Undergraduate Tracks</p>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Decorative Geometric Gold Accent Frame */}
                    <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent-gold -z-10 hidden sm:block pointer-events-none" />
                  </div>
                </Reveal>
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. CHOOSE YOUR PATHWAY / BRIDGE TO PROGRAMS                                */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                <div className="lg:col-span-5 space-y-4">
                  <Reveal variant="up">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        Choose Your Path
                      </p>
                    </div>
                  </Reveal>
                  <Reveal variant="up" className="delay-100">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                      Find the Program <br className="hidden sm:inline" />
                      That Fits Your Future
                    </h2>
                  </Reveal>
                  <div className="w-16 h-[2px] bg-accent-gold mt-2" />
                </div>

                <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                  <Reveal variant="up" className="delay-150">
                    <p>
                      Choosing an academic discipline is the cornerstone of your professional trajectory. At Superior Colleges Kanganpur Campus, every program is calibrated to combine rigorous theoretical mastery with empirical laboratory practice and university entrance preparation.
                    </p>
                  </Reveal>

                  <Reveal variant="up" className="delay-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-6 bg-white border border-border space-y-3">
                        <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">Option 01</span>
                        <h4 className="text-base font-bold text-text-primary">Intermediate Programs</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          2-Year BISE Lahore affiliated pathways: FSc Pre-Medical, FSc Pre-Engineering, ICS, and I.Com.
                        </p>
                        <Link href="/programs" className="text-xs font-bold text-primary hover:text-accent-gold inline-flex items-center gap-1 transition-colors">
                          Explore Intermediate Tracks &rarr;
                        </Link>
                      </div>

                      <div className="p-6 bg-white border border-border space-y-3">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Option 02</span>
                        <h4 className="text-base font-bold text-text-primary">Undergraduate Degrees</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          4-Year HEC accredited degrees: BS Computer Science, BS Software Engineering, and BBA.
                        </p>
                        <Link href="/programs" className="text-xs font-bold text-primary hover:text-accent-gold inline-flex items-center gap-1 transition-colors">
                          Explore Degree Tracks &rarr;
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. STEP-BY-STEP ADMISSION PROCESS (EDITORIAL TIMELINE)                     */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
              
              <div className="max-w-3xl space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent-gold" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-accent-gold-dark">
                      Application Workflow
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    How Admission Works
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    A clear, 5-stage progression guiding prospective students from initial registration to official enrollment.
                  </p>
                </Reveal>
              </div>

              {/* 5-Step Editorial Process Flow */}
              <div className="space-y-6">
                {admissionSteps.map((s, idx) => (
                  <Reveal key={s.step} variant="up" className={`delay-${idx * 100}`}>
                    <div className="group bg-[#FCFDFD] border border-border p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-2 flex items-center gap-4">
                          <span className="text-4xl sm:text-5xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors leading-none">
                            {s.step}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block md:hidden">STAGE</span>
                        </div>

                        <div className="md:col-span-7 space-y-1.5">
                          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                            {s.title}
                          </h3>
                          <p className="text-sm text-text-secondary leading-relaxed font-light">
                            {s.description}
                          </p>
                        </div>

                        <div className="md:col-span-3 md:text-right">
                          <Link href={s.href}>
                            <button className="px-5 py-2.5 bg-white group-hover:bg-primary text-text-primary group-hover:text-white text-xs font-bold uppercase tracking-wider border border-border group-hover:border-primary transition-all inline-flex items-center gap-1.5">
                              <span>{s.actionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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
        {/* 4. READY TO APPLY? APPLICANT AUTHENTICATION CONNECTION                    */}
        {/* ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#075E68] text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl -z-0" />
          
          <PublicPageContainer className="relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              
              <Reveal variant="up">
                <span className="text-xs font-mono font-bold text-accent-gold-light uppercase tracking-[0.25em] block">
                  APPLICANT PORTAL ACCESS
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-3">
                  Ready to Start Your Application?
                </h2>
                <p className="text-base sm:text-lg text-white/90 font-light max-w-2xl mx-auto mt-4 leading-relaxed">
                  Join thousands of ambitious scholars. If you are a new applicant, create your account in seconds. Returning applicants can log in to track their application status.
                </p>
              </Reveal>

              <Reveal variant="up" className="delay-150">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/20">
                      <UserPlus className="w-4 h-4" />
                      <span>Create Applicant Account</span>
                    </button>
                  </Link>

                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white hover:text-[#075E68] text-white text-xs font-bold uppercase tracking-wider border border-white/30 transition-all duration-300 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Applicant Login</span>
                    </button>
                  </Link>
                </div>
              </Reveal>

              <Reveal variant="up" className="delay-200">
                <p className="text-xs text-white/60 font-medium">
                  Note: Student, Teacher, and Admin portals are accessed via their respective secure logins.
                </p>
              </Reveal>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. ACADEMIC ELIGIBILITY THRESHOLDS                                        */}
        {/* ========================================================================= */}
        <section id="eligibility" className="py-24 md:py-36 bg-[#FCFDFD] border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Before You Apply</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Eligibility &amp; Requirements
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Official academic thresholds compliant with BISE Lahore, HEC, and national accreditation councils.
                  </p>
                </Reveal>
              </div>

              {/* Eligibility Rows */}
              <div className="divide-y divide-border border-y border-border">
                {eligibilityList.map((item, idx) => (
                  <Reveal key={item.program} variant="up" className={`delay-${idx * 80}`}>
                    <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:bg-white px-4 transition-colors">
                      <div className="lg:col-span-4 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-primary bg-primary-light px-2 py-0.5 border border-primary/20">
                          {item.code}
                        </span>
                        <h3 className="text-lg font-bold text-text-primary pt-1">{item.program}</h3>
                        <p className="text-xs text-text-muted">{item.duration}</p>
                      </div>

                      <div className="lg:col-span-8 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark">Academic Threshold</p>
                        <p className="text-sm text-text-secondary leading-relaxed font-light">
                          {item.criteria}
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
        {/* 6. REQUIRED DOCUMENTS CHECKLIST                                           */}
        {/* ========================================================================= */}
        <section id="requirements" className="py-24 md:py-36 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Document Checklist
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Required Verification Documents
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    Ensure scanned soft copies are ready during online submission, and bring original credentials for final physical verification.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredDocuments.map((doc, idx) => (
                  <Reveal key={doc} variant="up" className={`delay-${(idx % 2) * 100 + 100}`}>
                    <div className="p-5 bg-background-secondary border border-border hover:border-primary transition-all duration-300 flex items-start gap-3.5 h-full group">
                      <div className="w-6 h-6 flex items-center justify-center bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                        {doc}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 7. ADMISSIONS FAQ (INTERACTIVE ACCORDION)                                  */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F7F9F9] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-4xl mx-auto space-y-16">
              
              <div className="text-center space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Applicant Inquiries
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Frequently Asked Questions
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary font-light leading-relaxed">
                    Clear answers to common questions about eligibility, application deadlines, and enrollment.
                  </p>
                </Reveal>
              </div>

              {/* Accordion Component */}
              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;

                  return (
                    <Reveal key={faq.q} variant="up" className={`delay-${idx * 50}`}>
                      <div className="bg-white border border-border overflow-hidden transition-colors">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-6 text-left flex items-center justify-between gap-4 hover:text-primary transition-colors"
                        >
                          <span className="text-base font-bold text-text-primary">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent-gold" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-6 pt-0 text-sm text-text-secondary leading-relaxed font-light border-t border-border/60 animate-fade-in">
                            <p className="pt-3">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 8. ADMISSION ADVISORY & SUPPORT                                           */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-white">
          <PublicPageContainer>
            <div className="max-w-5xl mx-auto space-y-12">
              
              <div className="text-center space-y-3">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Advisory Desk</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                    Need Help With Your Application?
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
                    Our admissions advisors are available on campus and via telephone to guide you through program choice and registration.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Reveal variant="up" className="delay-100">
                  <div className="p-6 bg-background-secondary border border-border text-center space-y-2 h-full">
                    <Phone className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Telephone Helpline</p>
                    <p className="text-sm font-bold text-text-primary font-mono">{MOCK_COLLEGE.contactPhone}</p>
                    <p className="text-[11px] text-text-secondary font-light">Mon - Sat: 8:00 AM - 4:00 PM</p>
                  </div>
                </Reveal>

                <Reveal variant="up" className="delay-150">
                  <div className="p-6 bg-background-secondary border border-border text-center space-y-2 h-full">
                    <Mail className="w-6 h-6 text-accent-gold mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Admissions Email</p>
                    <p className="text-sm font-bold text-text-primary font-mono">{MOCK_COLLEGE.contactEmail}</p>
                    <p className="text-[11px] text-text-secondary font-light">24-Hour Response Window</p>
                  </div>
                </Reveal>

                <Reveal variant="up" className="delay-200">
                  <div className="p-6 bg-background-secondary border border-border text-center space-y-2 h-full">
                    <Compass className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted">On-Campus Visit</p>
                    <p className="text-sm font-bold text-text-primary">Admissions Office</p>
                    <p className="text-[11px] text-text-secondary font-light">{MOCK_COLLEGE.city} Campus Main Gate</p>
                  </div>
                </Reveal>
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 9. FINAL CONVERSION-FOCUSED CALL TO ACTION                                */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Ready to Begin Your Future?"
          description="Take the first step toward scholastic excellence and professional leadership. Apply for Fall 2026 admission today."
          href="/register"
          label="Apply for Admission"
        />

      </div>
    </PublicLayout>
  );
}
