"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, Sparkles, Award } from "lucide-react";
import { MOCK_COLLEGE, MOCK_COLLEGE_STATS, MOCK_WHY_CHOOSE_US, MOCK_PROGRAMS } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ScrollReveal,
  CountUp,
  ScrollParallax,
  StaggerContainer,
  StaggerItem
} from "@/components/public/HomeMotion";

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <PublicLayout>
      <div className="bg-white overflow-hidden selection:bg-primary selection:text-white">
        {/* ==================== HERO SECTION - PREMIUM SPLIT LAYOUT ==================== */}
        <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-white via-primary-light/10 to-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
          {/* Subtle background graphics with parallax */}
          <ScrollParallax speed={-0.02} className="absolute top-1/4 left-10 w-72 h-72 bg-primary-light/35 rounded-full blur-3xl -z-10 pointer-events-none" />
          <ScrollParallax speed={-0.03} className="absolute bottom-10 right-10 w-96 h-96 bg-[#C5A44D]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-6">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 bg-primary-light text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-700 ease-out",
                  mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                )}>
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Excellence Since {MOCK_COLLEGE.establishedYear}</span>
                </div>

                <div className="space-y-2">
                  <div className="overflow-hidden">
                    <p className={cn(
                      "text-sm font-semibold tracking-widest text-[#C5A44D] uppercase transition-transform duration-1000 ease-out delay-100",
                      mounted ? "translate-y-0" : "translate-y-full"
                    )}>
                      Superior Colleges
                    </p>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-extrabold text-text-primary tracking-tight leading-none">
                    <span className="block overflow-hidden py-1">
                      <span className={cn(
                        "block transition-transform duration-1000 ease-out delay-200",
                        mounted ? "translate-y-0" : "translate-y-[110%]"
                      )}>
                        Kanganpur Campus
                      </span>
                    </span>
                  </h1>
                </div>

                <div className={cn(
                  "h-[3px] bg-[#C5A44D] transition-all duration-1000 ease-out delay-300",
                  mounted ? "w-16 opacity-100" : "w-0 opacity-0"
                )} />

                <p className={cn(
                  "text-lg text-text-secondary leading-relaxed max-w-xl transition-all duration-1000 ease-out delay-400 font-light",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  Empowering students through academic excellence, character development, and global opportunities. Experience education that transforms lives and shapes tomorrow&apos;s leaders.
                </p>
              </div>

              {/* Action Buttons */}
              <div className={cn(
                "flex flex-wrap gap-4 transition-all duration-1000 ease-out delay-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <Link href="/register">
                  <Button variant="primary" size="lg" className="rounded-sm shadow-md shadow-primary/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Apply Online
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button variant="outline" size="lg" className="rounded-sm border-2 border-primary hover:bg-primary-light/20 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    Explore Programs
                  </Button>
                </Link>
              </div>

              {/* Metadata Info */}
              <div className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-border/80 text-xs text-text-secondary transition-all duration-1000 ease-out delay-600",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-base">📍</span>
                  <span className="font-semibold">{MOCK_COLLEGE.city}, Pakistan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-base">📞</span>
                  <span>{MOCK_COLLEGE.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C5A44D] text-base">✓</span>
                  <span className="font-semibold uppercase tracking-wider text-[10px]">BISE &amp; HEC Accredited</span>
                </div>
              </div>
            </div>

            {/* Right Image Frame with Accents */}
            <div className="lg:col-span-6 flex justify-center">
              <ScrollParallax speed={0.04} className="relative w-full max-w-lg">
                <div className={cn(
                  "relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] bg-gradient-to-br from-primary-light/40 to-background-secondary p-2 border border-border shadow-2xl overflow-hidden transition-all duration-1000 ease-out delay-200",
                  mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}>
                  {/* Gold accent line decoration (absolute, outside/under the frame) */}
                  <div className={cn(
                    "absolute -top-3 -right-3 w-16 h-16 border-t-3 border-r-3 border-[#C5A44D] z-10 transition-all duration-[1200ms] ease-out delay-500",
                    mounted ? "translate-x-0 translate-y-0 opacity-100" : "translate-x-4 -translate-y-4 opacity-0"
                  )} />
                  <div className={cn(
                    "absolute -bottom-3 -left-3 w-16 h-16 border-b-3 border-l-3 border-[#C5A44D] z-10 transition-all duration-[1200ms] ease-out delay-500",
                    mounted ? "translate-x-0 translate-y-0 opacity-100" : "-translate-x-4 translate-y-4 opacity-0"
                  )} />
                  
                  {/* Main campus image container */}
                  <div className={cn(
                    "relative w-full h-full overflow-hidden group bg-text-primary transition-all duration-[1400ms] ease-out delay-300",
                    mounted ? "clip-path-full" : "clip-path-inset"
                  )}
                  style={{
                    clipPath: mounted ? "inset(0% 0% 0% 0%)" : "inset(12% 12% 12% 12%)",
                  }}
                  >
                    <Image
                      src="/images/hero_pakistani_students.jpg"
                      alt="Superior Colleges Kanganpur Campus Students"
                      fill
                      className={cn(
                        "object-cover transition-all duration-[1500ms] ease-out",
                        mounted ? "scale-100 rotate-0" : "scale-115 rotate-1"
                      )}
                      sizes="(max-w-768px) 100vw, 50vw"
                      priority
                    />
                    
                    {/* Cyan geometric overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-40 mix-blend-multiply transition-opacity duration-500 pointer-events-none group-hover:opacity-20" />

                    {/* Floating Badge */}
                    <div className={cn(
                      "absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs border-l-4 border-primary px-4 py-2.5 shadow-lg select-none transition-all duration-1000 ease-out delay-700",
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    )}>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-none">Scholarships</p>
                      <p className="text-sm font-bold text-primary leading-tight">Up to 100% Merit</p>
                    </div>
                  </div>
                </div>
              </ScrollParallax>
            </div>
          </div>
        </section>

        {/* ==================== PREMIUM STATISTICS SECTION ==================== */}
        <section className="py-16 bg-white border-b border-border relative overflow-hidden">
          <ScrollReveal variant="scale" threshold={0.1}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-border">
                {MOCK_COLLEGE_STATS.map((stat, idx) => (
                  <StaggerItem
                    key={stat.label}
                    index={idx}
                    variant="up"
                    className="text-center pt-6 lg:pt-0 lg:px-6 first:pt-0 flex flex-col justify-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <CountUp
                        value={stat.value}
                        suffix="+"
                        className="text-5xl sm:text-6xl font-extrabold text-[#075E68] font-serif leading-none tracking-tight"
                      />
                    </div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mt-3 select-none">
                      {stat.label}
                    </p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>
        </section>

        {/* ==================== ABOUT INTRODUCTION - ASYMMETRIC SPLIT ==================== */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 bg-background-secondary/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image column — two stacked images for visual richness */}
            <div className="lg:col-span-5 order-last lg:order-first">
              <ScrollReveal variant="left">
                <div className="relative">
                  {/* Decorative corner brackets */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 border-t-[3px] border-l-[3px] border-primary z-10" />
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-[3px] border-r-[3px] border-primary z-10" />

                  {/* Main large image */}
                  <div className="relative w-full h-72 sm:h-96 overflow-hidden border border-border shadow-2xl bg-primary-dark group">
                    <Image
                      src="/images/classroom.jpg"
                      alt="Superior Colleges Classroom Learning"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                    {/* Image caption overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-dark/80 to-transparent px-5 py-4">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Lecture Hall</p>
                      <p className="text-white/80 text-[11px] font-light">Interactive Smart Classrooms</p>
                    </div>
                  </div>

                  {/* Smaller secondary image + BISE badge side-by-side */}
                  <div className="flex gap-3 mt-3">
                    <div className="relative flex-1 h-44 overflow-hidden border border-border shadow-lg bg-primary-dark group">
                      <Image
                        src="/images/hero_pakistani_students.jpg"
                        alt="Superior College students on campus"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-dark/70 to-transparent px-3 py-2">
                        <p className="text-white text-[10px] font-bold uppercase tracking-wider">Student Life</p>
                      </div>
                    </div>

                    {/* BISE Badge panel */}
                    <ScrollReveal variant="scale" delay={300} className="w-36 h-44 bg-primary-dark text-white flex flex-col justify-center items-center shadow-xl border border-primary/30">
                      <Award className="w-8 h-8 text-accent-gold mb-2" />
                      <span className="text-2xl font-extrabold leading-none font-serif">BISE</span>
                      <span className="text-[9px] text-white/70 uppercase tracking-widest font-semibold mt-1 text-center px-2">Board Affiliated</span>
                      <div className="mt-3 w-8 h-[1px] bg-accent-gold/60" />
                      <span className="text-[9px] text-accent-gold mt-2 font-bold uppercase tracking-wider">HEC Recognized</span>
                    </ScrollReveal>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right text column */}
            <StaggerContainer className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <StaggerItem index={0}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-accent-gold" />
                    <p className="text-[#C5A44D] font-bold uppercase tracking-widest text-xs">About Our Institution</p>
                  </div>
                </StaggerItem>
                
                <StaggerItem index={1}>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
                    Education That Transforms Lives, Builds Careers &amp; Shapes Values
                  </h2>
                </StaggerItem>
                
                <StaggerItem index={2}>
                  <div className="h-[2px] w-12 bg-primary" />
                </StaggerItem>
              </div>

              <StaggerItem index={3} className="space-y-4 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                <p>
                  Since {MOCK_COLLEGE.establishedYear}, Superior Colleges Kanganpur Campus has been at the forefront of academic excellence in the region. We promote a comprehensive teaching philosophy that equips students with both academic rigor and real-world skills.
                </p>
                <p className="text-sm sm:text-base text-text-muted">
                  Our modern learning methodologies, dedicated faculty, and vibrant student community prepare our students to successfully navigate the future and excel in their chosen paths.
                </p>
              </StaggerItem>

              <StaggerItem index={4} className="pt-2">
                <Link href="/about">
                  <Button variant="primary" className="rounded-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore Our History
                  </Button>
                </Link>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ==================== WHY CHOOSE US - IMAGE EDITORIAL GRID ==================== */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white relative">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-8 border-b border-border">
              <ScrollReveal variant="up" className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-accent-gold" />
                  <p className="text-[#C5A44D] font-bold uppercase tracking-widest text-xs">Why Choose Us</p>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
                  The Superior Advantage
                </h2>
                <p className="text-text-secondary text-base sm:text-lg font-light">
                  Providing students with a modern and supportive ecosystem to achieve excellence.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="scale" className="lg:col-span-5 lg:text-right">
                <Link href="/register">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 font-bold rounded-sm shadow-sm transition-all duration-300">
                    Start Admission Account
                  </Button>
                </Link>
              </ScrollReveal>
            </div>

            {/* Image-based editorial grid — one photo per advantage */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { ...MOCK_WHY_CHOOSE_US[0], img: "/images/advantages/academic_excellence.jpg",   alt: "Students studying in a university classroom" },
                { ...MOCK_WHY_CHOOSE_US[1], img: "/images/advantages/modern_infrastructure.jpg", alt: "Modern university computer lab" },
                { ...MOCK_WHY_CHOOSE_US[2], img: "/images/advantages/experienced_faculty.jpg",   alt: "Professor teaching students in a lecture hall" },
                { ...MOCK_WHY_CHOOSE_US[3], img: "/images/classroom.jpg",                        alt: "Students collaborating in a university classroom" },
                { ...MOCK_WHY_CHOOSE_US[4], img: "/images/hero_pakistani_students.jpg",          alt: "University students on campus" },
                { ...MOCK_WHY_CHOOSE_US[5], img: "/images/computer_lab.jpg",                     alt: "Students working together in a computer lab" },
              ].map((reason, idx) => (
                <StaggerItem
                  key={reason.id}
                  index={idx}
                  variant="up"
                  className="group flex flex-col bg-white border border-border overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
                >
                  {/* Image panel */}
                  <div className="relative w-full aspect-[3/2] overflow-hidden bg-primary-dark">
                    <Image
                      src={reason.img}
                      alt={reason.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                    />
                    {/* Dark-cyan overlay — slightly stronger on hover */}
                    <div className="absolute inset-0 bg-[#075E68]/20 group-hover:bg-[#075E68]/45 transition-colors duration-500 pointer-events-none" />
                    
                    {/* Sliding top gold accent line */}
                    <div className="absolute top-0 left-0 w-0 h-[3px] bg-accent-gold group-hover:w-full transition-all duration-500 z-10" />
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-border/40" />
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col flex-1 p-6 space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-accent-gold uppercase font-serif tracking-widest block">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-text-primary tracking-tight leading-snug group-hover:text-primary transition-colors duration-300">
                        {reason.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed flex-1 font-light">
                        {reason.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs font-bold text-primary uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-accent-gold" />
                        <span>Quality Verified</span>
                      </div>
                      <ArrowRight className="w-4 h-4 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-accent-gold" />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ==================== FEATURED PROGRAMS - EDITORIAL CATALOG ==================== */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 bg-background-secondary/30 border-t border-b border-border relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <ScrollReveal variant="up">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-[1px] bg-accent-gold" />
                  <p className="text-[#C5A44D] font-bold uppercase tracking-widest text-xs">Academic Portfolios</p>
                  <span className="w-6 h-[1px] bg-accent-gold" />
                </div>
              </ScrollReveal>
              <ScrollReveal variant="up" delay={100}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
                  Featured Fields of Study
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="up" delay={200}>
                <p className="text-text-secondary max-w-xl mx-auto font-light">
                  Discover HEC and Board-accredited programs structured to ensure academic depth and career preparedness.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="scale" delay={300}>
                <div className="h-[2px] w-12 bg-primary mx-auto mt-4" />
              </ScrollReveal>
            </div>

            {/* Staggered Column Presentation */}
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {MOCK_PROGRAMS.slice(0, 3).map((prog, idx) => (
                <StaggerItem
                  key={prog.id}
                  index={idx}
                  variant="up"
                  className="bg-white border border-border hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group relative"
                >
                  {/* Sliding gold border highlight on hover */}
                  <div className="absolute top-0 left-0 w-0 h-[3px] bg-accent-gold group-hover:w-full transition-all duration-500" />
                  
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary py-1 px-3 bg-primary-light rounded-sm">
                        {prog.level}
                      </span>
                      <span className="text-xs text-text-muted font-mono font-semibold">
                        {prog.durationYears} Years
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300 leading-snug">
                        {prog.name}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed font-light">
                        {prog.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    <div className="h-px bg-border/60 mb-6" />
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-6">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Annual Tuition</span>
                      <span className="font-serif font-bold text-[#075E68] text-base">{formatPKR(prog.annualFeePKR)}</span>
                    </div>
                    <Link href="/programs">
                      <Button variant="outline" size="sm" className="w-full text-xs rounded-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 cursor-pointer" rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal variant="scale" className="text-center pt-4">
              <Link href="/programs">
                <Button variant="primary" size="lg" className="rounded-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  See All Academic Offerings
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ==================== FACILITIES SHOWCASE - FULL-WIDTH GRID ==================== */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <StaggerContainer className="lg:col-span-6 space-y-6">
                <StaggerItem index={0}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-accent-gold" />
                    <p className="text-[#C5A44D] font-bold uppercase tracking-widest text-xs">Learning Environment</p>
                  </div>
                </StaggerItem>
                <StaggerItem index={1}>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
                    State-of-the-Art Infrastructure &amp; Labs
                  </h2>
                </StaggerItem>
                <StaggerItem index={2}>
                  <div className="h-[2px] w-12 bg-primary" />
                </StaggerItem>
                <StaggerItem index={3}>
                  <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-light">
                    We believe that student growth requires top-notch learning spaces. Kanganpur Campus provides highly equipped technical labs, sports areas, and library portals that foster research and practical execution.
                  </p>
                </StaggerItem>
                <StaggerItem index={4} className="pt-2">
                  <Link href="/facilities">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-sm font-semibold transition-all duration-300 shadow-sm">
                      Explore Facilities
                    </Button>
                  </Link>
                </StaggerItem>
              </StaggerContainer>

              {/* Asymmetric Highlight Image — rich two-image collage */}
              <div className="lg:col-span-6">
                <ScrollReveal variant="right">
                  <div className="relative">
                    {/* Gold corner bracket decorations */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 border-t-[3px] border-r-[3px] border-accent-gold z-10" />
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-[3px] border-l-[3px] border-accent-gold z-10" />

                    {/* Main large computer lab image */}
                    <div className="relative w-full h-72 sm:h-96 overflow-hidden border border-border shadow-2xl bg-primary-dark group">
                      <Image
                        src="/images/computer_lab.jpg"
                        alt="Superior Campus Computer Science Lab"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-primary/15 mix-blend-multiply pointer-events-none" />
                      {/* Floating label */}
                      <ScrollReveal variant="scale" delay={300} className="absolute bottom-5 left-5 bg-white/95 border-l-4 border-accent-gold px-4 py-3 shadow-lg">
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none">Featured Lab</p>
                        <p className="text-sm font-bold text-text-primary mt-1 leading-tight">CS &amp; IT Digital Development Arena</p>
                      </ScrollReveal>
                    </div>

                    {/* Secondary smaller image row */}
                    <div className="flex gap-3 mt-3">
                      <div className="relative flex-1 h-40 overflow-hidden border border-border shadow-lg bg-primary-dark group">
                        <Image
                          src="/images/advantages/modern_infrastructure.jpg"
                          alt="Modern university infrastructure"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-dark/70 to-transparent px-3 py-2">
                          <p className="text-white text-[10px] font-bold uppercase tracking-wider">Labs</p>
                        </div>
                      </div>
                      <div className="relative flex-1 h-40 overflow-hidden border border-border shadow-lg bg-primary-dark group">
                        <Image
                          src="/images/advantages/academic_excellence.jpg"
                          alt="Students studying together"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-dark/70 to-transparent px-3 py-2">
                          <p className="text-white text-[10px] font-bold uppercase tracking-wider">Classrooms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PREMIUM CTA AND INQUIRY ==================== */}
        <section className="py-32 px-4 bg-gradient-to-br from-primary-dark via-[#053e45] to-[#043339] text-white relative overflow-hidden">
          {/* Subtle parallax background details */}
          <ScrollParallax speed={-0.02} className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <ScrollParallax speed={-0.01} className="absolute bottom-10 right-10 w-64 h-64 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <StaggerContainer className="space-y-6">
              <StaggerItem index={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-accent-gold-light border border-white/15 text-xs font-bold uppercase tracking-[0.2em] rounded-sm">
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Fall Admissions 2026</span>
                </div>
              </StaggerItem>
              
              <StaggerItem index={1}>
                <h2 className="text-3.5xl sm:text-4.5xl lg:text-5.5xl font-extrabold tracking-tight leading-tight">
                  Begin Your Academic Journey
                </h2>
              </StaggerItem>

              <StaggerItem index={2}>
                <div className="h-[2px] w-12 bg-accent-gold mx-auto" />
              </StaggerItem>
              
              <StaggerItem index={3}>
                <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto font-light leading-relaxed">
                  Applications for Fall 2026 are open. Register your account online, verify your intermediate records, and join Superior Colleges.
                </p>
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal variant="scale" delay={400} className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-accent-gold text-white hover:bg-accent-gold-dark border-0 rounded-sm font-bold shadow-lg shadow-accent-gold/20 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Register Application Account
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="bg-white/10 text-white border-2 border-white/20 hover:bg-white hover:text-primary-dark rounded-sm font-bold hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  Contact Admissions Office
                </Button>
              </Link>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={500} className="space-y-6 pt-4">
              <div className="h-px bg-white/10 max-w-md mx-auto" />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/70">
                <a href={`tel:${MOCK_COLLEGE.contactPhone}`} className="hover:text-[#C5A44D] transition-colors flex items-center gap-2">
                  <span>📞</span>
                  <span>{MOCK_COLLEGE.contactPhone}</span>
                </a>
                <span className="hidden sm:inline text-white/30">|</span>
                <a href={`mailto:${MOCK_COLLEGE.contactEmail}`} className="hover:text-[#C5A44D] transition-colors flex items-center gap-2">
                  <span>✉️</span>
                  <span>{MOCK_COLLEGE.contactEmail}</span>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
