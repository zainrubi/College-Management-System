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
  Building2,
  Microscope,
  Cpu,
  BookOpen,
  Trophy,
  Utensils,
  ShieldCheck,
  Zap,
  Layers,
  X,
  Compass,
  GraduationCap
} from "lucide-react";

interface FacilityItem {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
  equipment: string[];
  accessHours: string;
  highlight: string;
}

export default function FacilitiesPage() {
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  const facilities: FacilityItem[] = [
    {
      id: "fac-1",
      number: "01",
      name: "High-Performance Computer Laboratories",
      category: "Computing & Technology",
      description: "Three dedicated, climate-controlled computer laboratory suites equipped with high-performance Core-i7 workstations, gigabit local fiber connectivity, and specialized software environments for software engineering, data science, and AI development.",
      image: "/images/computer_lab.jpg",
      specs: [
        "120+ Dedicated Core-i7 Workstation Terminals",
        "High-Speed Gigabit Fiber Optic Network & Campus Wi-Fi",
        "Configured with Linux, Windows, Python, Java, C++, and SQL IDEs",
        "Uninterruptible Power Supply (UPS) & Backup Power Generator"
      ],
      equipment: [
        "Development IDEs (VS Code, Android Studio, IntelliJ)",
        "Database Engines (MySQL, PostgreSQL, MongoDB)",
        "AI / Data Science Frameworks (Python, NumPy, TensorFlow)",
        "Cloud Deployment Sandboxes"
      ],
      accessHours: "Mon - Sat: 8:00 AM - 4:00 PM (Supervised Access)",
      highlight: "State-of-the-art gigabit computing suites for BSCS, BSSE, and ICS tracks",
    },
    {
      id: "fac-2",
      number: "02",
      name: "Specialized Science & Empirical Laboratories",
      category: "Natural & Physical Sciences",
      description: "Separate, fully equipped laboratory complexes for Physics, Chemistry, and Biology compliant with Board of Intermediate (BISE) Lahore experimental standards and national safety regulations.",
      image: "/images/advantages/modern_infrastructure.jpg",
      specs: [
        "Independent Physics, Chemistry, and Biology Laboratory Halls",
        "High-Precision Optical Microscopes & Spectrometers",
        "Chemical Fume Safety Hoods & Emergency Eye-Wash Stations",
        "Full Complement of Glassware, Reagents & Measurement Rigs"
      ],
      equipment: [
        "Optical & Compound Biological Microscopes",
        "Analytical Balances & Titration Assemblies",
        "Electromagnetic & Vector Mechanics Apparatus",
        "Biological Specimen & Slide Archives"
      ],
      accessHours: "Daily Structured Practical Sessions + After-Hours Guided Labs",
      highlight: "Dedicated empirical research spaces for FSc Pre-Medical & Pre-Engineering scholars",
    },
    {
      id: "fac-3",
      number: "03",
      name: "Central Academic & Digital Library",
      category: "Research & Scholarly Resources",
      description: "A serene, well-curated intellectual sanctuary housing over 10,000 physical volumes, reference encyclopedias, peer-reviewed journals, and networked research terminals connected to national academic databases.",
      image: "/images/classroom.jpg",
      specs: [
        "10,000+ Cataloged Physical Books & Research Journals",
        "Digital Research Terminals with HEC E-Library Portal Access",
        "Dedicated Silent Reading Zones & Collaborative Group Study Rooms",
        "Full-Time Professional Librarian & Research Consultation Support"
      ],
      equipment: [
        "Automated Library Catalog & Book Borrowing System",
        "Digital Periodicals & Academic Journal Repositories",
        "High-Speed Printing & Scanning Stations",
        "Comfortable Ergonomic Individual Study Carrels"
      ],
      accessHours: "Mon - Sat: 8:00 AM - 5:00 PM",
      highlight: "Extensive physical collection & digital repository supporting all faculties",
    },
    {
      id: "fac-4",
      number: "04",
      name: "Multimedia Smart Lecture Halls",
      category: "Instructional Spaces",
      description: "Acoustically engineered, amphitheater-style lecture halls outfitted with high-resolution digital projection systems, audio amplification, climate control, and ergonomic seating designed to foster active classroom dialogue.",
      image: "/images/hero_pakistani_students.jpg",
      specs: [
        "Capacities Ranging from 45 to 120 Students per Hall",
        "Ceiling-Mounted HD Multimedia Projectors & Smart Screen Integration",
        "Tiered Tiered Seating Ensuring Clear Line-of-Sight for All Students",
        "Fully Air-Conditioned with Energy-Efficient Climate Control"
      ],
      equipment: [
        "Interactive Digital Pointer & Presentation Systems",
        "Acoustic Wall Paneling for Optimal Vocal Clarity",
        "Multi-Zone Audio Systems with Wireless Instructor Microphones",
        "High-Speed Presentation Wi-Fi Node"
      ],
      accessHours: "Scheduled Academic Class Hours & Evening Seminar Sessions",
      highlight: "Designed for focused pedagogy, dynamic presentations, and guest lectures",
    },
  ];

  const campusAmenities = [
    { name: "24/7 Security & CCTV Surveillance", desc: "Trained security personnel and comprehensive perimeter monitoring" },
    { name: "Uninterrupted Power Backup", desc: "Dedicated heavy-duty generators ensuring zero instructional downtime" },
    { name: "Clean & Green Landscaped Grounds", desc: "Lush green lawns and open outdoor courtyards for relaxation" },
    { name: "Dedicated Student Cafeteria", desc: "Hygienic dining facility providing fresh, nutritious meals and beverages" },
    { name: "First-Aid & Medical Care Center", desc: "Equipped medical room with first-responder equipment and basic health support" },
    { name: "Spacious Multi-Faith Prayer Rooms", desc: "Quiet, pristine prayer and contemplation spaces on campus" },
    { name: "Outdoor Sports & Athletic Grounds", desc: "Cricket pitch, volleyball court, and badminton facilities" },
    { name: "Transportation & Parking Facility", desc: "Secure vehicular parking and designated college transit routes" },
  ];

  return (
    <PublicLayout>
      <div className="bg-white text-text-primary selection:bg-primary selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. CAMPUS NAVIGATION SUB-BAR                                              */}
        {/* ========================================================================= */}
        <div className="border-b border-border bg-[#F7F9F9] py-3">
          <PublicPageContainer className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              <span className="text-text-muted hidden sm:inline">Campus Navigation:</span>
              <Link 
                href="/campus-life" 
                className="text-text-secondary hover:text-primary transition-colors pb-0.5"
              >
                Campus Life
              </Link>
              <Link 
                href="/facilities" 
                className="text-primary border-b-2 border-primary pb-0.5"
              >
                Learning Facilities
              </Link>
            </div>
            <Link 
              href="/campus-life" 
              className="text-xs font-bold text-accent-gold-dark hover:text-accent-gold transition-colors inline-flex items-center gap-1"
            >
              Explore Campus Life <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </PublicPageContainer>
        </div>

        {/* ========================================================================= */}
        {/* 2. EDITORIAL FACILITIES HERO                                              */}
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
              <span className="text-text-muted">Campus</span>
              <ChevronRight className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-text-primary font-semibold">Facilities</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    LEARNING SPACES &amp; INFRASTRUCTURE
                  </p>
                </div>
              </Reveal>

              {/* Main Title */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  Spaces Designed <br className="hidden sm:inline" />
                  <span className="text-primary font-light">for</span> Learning
                </h1>
              </Reveal>

              {/* Supporting Text */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Explore the specialized laboratories, smart multimedia classrooms, digital libraries, and student spaces that empower academic rigor and personal discovery at Superior Colleges Kanganpur Campus.
                  </p>
                </div>
              </Reveal>

              {/* Metric Pillars */}
              <Reveal variant="up" className="delay-300 pt-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-10 border-t border-border/80">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-accent-gold block">01 &bull; Computing</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-text-primary font-serif">120+ Rigs</p>
                    <p className="text-xs text-text-secondary">High-Spec Workstations</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-primary block">02 &bull; Sciences</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary font-serif">3 Complex</p>
                    <p className="text-xs text-text-secondary">Physics, Chem &amp; Bio Labs</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-accent-gold block">03 &bull; Library</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-text-primary font-serif">10,000+</p>
                    <p className="text-xs text-text-secondary">Books &amp; Digital Journals</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-primary block">04 &bull; Continuity</span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary font-serif">100%</p>
                    <p className="text-xs text-text-secondary">Backup Power &amp; Security</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. FEATURED FACILITY: "THE HEART OF CAMPUS" (MAGAZINE EDITORIAL)          */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                
                <div className="lg:col-span-6 space-y-6">
                  <Reveal variant="up">
                    <div className="inline-flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-accent-gold" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-gold-dark">
                        Featured Learning Complex
                      </p>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mt-4 leading-tight">
                      The Heart of Campus: <br />
                      Technology &amp; Sciences
                    </h2>
                  </Reveal>

                  <Reveal variant="up" className="delay-100">
                    <p className="text-base sm:text-lg text-text-secondary font-light leading-relaxed">
                      Superior Colleges Kanganpur Campus has purpose-built facilities specifically designed to bridge theoretical concepts with empirical, practical execution. From advanced computing clusters to precision chemical apparatus, our students master the tools of their future trade.
                    </p>
                  </Reveal>

                  <Reveal variant="up" className="delay-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-white border border-border space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Hands-On Immersion</p>
                        <p className="text-xs text-text-secondary leading-relaxed">Dedicated lab hours integrated into everyday schedules.</p>
                      </div>
                      <div className="p-4 bg-white border border-border space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-dark">Safety Standards</p>
                        <p className="text-xs text-text-secondary leading-relaxed">Strict protocols, certified assistants, and eye-wash chambers.</p>
                      </div>
                    </div>
                  </Reveal>
                </div>

                <div className="lg:col-span-6 relative">
                  <Reveal variant="right" className="delay-150">
                    <div className="relative aspect-[16/10] bg-text-primary border border-border shadow-2xl overflow-hidden group">
                      <Image
                        src="/images/advantages/modern_infrastructure.jpg"
                        alt="Superior Colleges modern learning facilities"
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-sm border border-border">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Advanced Infrastructure</p>
                        <p className="text-xs font-bold text-text-primary mt-0.5">Empirical Science &amp; Computing Suites &bull; Kanganpur</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary -z-10 hidden sm:block pointer-events-none" />
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. ALTERNATING ASYMMETRIC FACILITY SHOWCASE (NO BASIC RECTANGULAR CARDS)   */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-24 md:space-y-36">
              
              <div className="max-w-3xl space-y-4">
                <Reveal variant="up">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent-gold" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-accent-gold-dark">
                      Detailed Facility Walkthrough
                    </p>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08]">
                    Explore Our Academic Infrastructure
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-200">
                  <p className="text-base sm:text-lg text-text-secondary font-light max-w-2xl leading-relaxed">
                    Review specifications, capacity, and student access guidelines for our major learning and research environments.
                  </p>
                </Reveal>
              </div>

              {/* Alternating Showcase Items */}
              <div className="space-y-20 md:space-y-28">
                {facilities.map((fac, idx) => {
                  const isImageRight = idx % 2 === 0;

                  return (
                    <Reveal key={fac.id} variant="up" className="delay-100">
                      <div className="group bg-[#FCFDFD] border border-border p-8 sm:p-10 md:p-12 transition-all duration-500 hover:shadow-2xl hover:border-primary/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                        
                        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isImageRight ? "" : "lg:flex-row-reverse"}`}>
                          
                          {/* Text Information Column */}
                          <div className={`lg:col-span-7 space-y-6 ${isImageRight ? "" : "lg:order-2"}`}>
                            <div className="flex items-center gap-4">
                              <span className="text-5xl sm:text-6xl font-serif font-extrabold text-primary/40 group-hover:text-primary transition-colors leading-none select-none">
                                {fac.number}
                              </span>
                              <div className="h-8 w-[1px] bg-border" />
                              <div>
                                <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                                  {fac.category}
                                </span>
                                <p className="text-xs text-accent-gold-dark font-bold mt-1">
                                  {fac.accessHours}
                                </p>
                              </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-primary transition-colors">
                              {fac.name}
                            </h3>

                            <p className="text-base text-text-secondary leading-relaxed font-light">
                              {fac.description}
                            </p>

                            {/* Core Specs Bullet List */}
                            <div className="space-y-2 pt-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Key Architectural Specifications</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                                {fac.specs.slice(0, 4).map((spec) => (
                                  <div key={spec} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-primary shrink-0 mt-1.5" />
                                    <span>{spec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 flex flex-wrap items-center gap-4">
                              <button
                                onClick={() => setSelectedFacility(fac)}
                                className="py-2.5 px-5 bg-background-secondary hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border hover:border-primary transition-all flex items-center gap-2"
                              >
                                View Complete Specifications <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Column */}
                          <div className={`lg:col-span-5 relative aspect-[16/11] bg-text-primary border border-border overflow-hidden shadow-md ${isImageRight ? "" : "lg:order-1"}`}>
                            <Image
                              src={fac.image}
                              alt={fac.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>

                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. CAMPUS AMENITIES & SUPPORT INFRASTRUCTURE                             */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Campus Support</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Essential Amenities &amp; Safety
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Designed for comfort, security, well-being, and continuous academic flow.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {campusAmenities.map((amenity, idx) => (
                  <Reveal key={amenity.name} variant="up" className={`delay-${(idx % 4) * 80 + 100}`}>
                    <div className="p-6 bg-white border border-border hover:border-primary hover:shadow-lg transition-all duration-300 space-y-2.5 h-full group">
                      <div className="w-8 h-8 flex items-center justify-center bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                        {amenity.name}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">
                        {amenity.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 6. CAMPUS LIFE + FACILITIES CONNECTION ("EVERYTHING YOU NEED...")          */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    The Complete Superior Standard
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Everything You Need to Make College Meaningful
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    Physical infrastructure and student life experiences work hand in hand, turning academic potential into verifiable leadership and career success.
                  </p>
                </Reveal>
              </div>

              {/* Integrated Horizontal Flow Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {[
                  { step: "01", name: "Campus Life", desc: "Societies & Galas" },
                  { step: "02", name: "Learning", desc: "Rigorous Study" },
                  { step: "03", name: "Community", desc: "Peer Mentorship" },
                  { step: "04", name: "Facilities", desc: "State-of-Art Labs" },
                  { step: "05", name: "Future", desc: "University Placement" },
                ].map((item, idx) => (
                  <Reveal key={item.step} variant="up" className={`delay-${idx * 80}`}>
                    <div className="p-6 bg-background-secondary border border-border space-y-2">
                      <span className="text-xs font-mono font-bold text-accent-gold block">{item.step}</span>
                      <p className="text-base font-bold text-text-primary">{item.name}</p>
                      <p className="text-[11px] text-text-muted">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 7. INTERACTIVE FACILITY DETAIL MODAL                                       */}
        {/* ========================================================================= */}
        {selectedFacility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-border shadow-2xl p-6 sm:p-10 space-y-8 animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => setSelectedFacility(null)}
                className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary hover:bg-background-secondary border border-transparent hover:border-border transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                    {selectedFacility.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider">
                    Facility {selectedFacility.number}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {selectedFacility.name}
                </h3>
                <p className="text-xs font-bold text-accent-gold-dark">{selectedFacility.accessHours}</p>
              </div>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                {selectedFacility.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Technical Specifications
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedFacility.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Configured Tools &amp; Hardware
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {selectedFacility.equipment.map((eq) => (
                      <li key={eq} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{eq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-background-secondary border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Student Access Policy</span>
                <p className="text-xs text-text-secondary">
                  Open to all enrolled students with supervisor accompaniment during practical slots and project periods.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                >
                  Close Specifications
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 8. FINAL CALL TO ACTION                                                   */}
        {/* ========================================================================= */}
        <PublicCTA
          title="See Where Your Next Chapter Begins"
          description="Explore our campus facilities firsthand, consult with faculty advisors, and take the first step toward your academic future at Superior Colleges Kanganpur Campus."
          href="/admissions"
          label="Schedule Campus Visit"
        />

      </div>
    </PublicLayout>
  );
}
