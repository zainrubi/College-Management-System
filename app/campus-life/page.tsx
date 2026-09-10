"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE, MOCK_ACTIVITIES } from "@/lib/mock-data";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Users,
  Trophy,
  Globe,
  Heart,
  Compass,
  Calendar,
  Zap,
  Star,
  Building2,
  X,
  Smile,
  ShieldCheck,
  Target,
  Sun,
  BookOpen,
  Coffee,
  Activity,
  Award,
  Maximize2
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  caption: string;
}

export default function CampusLifePage() {
  const [activeGalleryModal, setActiveGalleryModal] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: "gal-1",
      title: "Collaborative Learning & Study Circles",
      category: "Academics & Community",
      image: "/images/hero_pakistani_students.jpg",
      caption: "Students collaborating on capstone projects and peer discussions in the central academic foyer.",
    },
    {
      id: "gal-2",
      title: "Interactive Classroom Discussions",
      category: "Instructional Moments",
      image: "/images/classroom.jpg",
      caption: "Focused classroom engagement where theoretical inquiry meets active debate and faculty mentorship.",
    },
    {
      id: "gal-3",
      title: "High-Tech Laboratory Exploration",
      category: "Technology & Research",
      image: "/images/computer_lab.jpg",
      caption: "Hands-on software development and algorithmic research in our modern computer suites.",
    },
    {
      id: "gal-4",
      title: "State-of-the-Art Science Complexes",
      category: "Empirical Sciences",
      image: "/images/advantages/modern_infrastructure.jpg",
      caption: "Empirical discovery and precision experimentation across chemistry, physics, and biology labs.",
    },
  ];

  const dailyStages = [
    {
      time: "08:00 AM",
      stage: "ARRIVE",
      title: "Morning Arrival & Campus Buzz",
      description: "Stepping onto campus as morning sunlight floods the green lawns, reconnecting with classmates before the day begins.",
      icon: Sun,
    },
    {
      time: "10:00 AM",
      stage: "LEARN",
      title: "Lectures, Seminars & Lab Inquiries",
      description: "Immersive lectures, active classroom questions, and hands-on lab experiments directed by dedicated faculty.",
      icon: BookOpen,
    },
    {
      time: "12:30 PM",
      stage: "CONNECT",
      title: "Dining, Courtyards & Friendships",
      description: "Gathering at the student cafeteria, open-air courtyards, and common lounges for lunch, laughter, and society meetings.",
      icon: Coffee,
    },
    {
      time: "02:00 PM",
      stage: "PARTICIPATE",
      title: "Clubs, Debates, Sports & Practice",
      description: "Joining student club initiatives, robotics tinkering, cricket practice on the grounds, or bilingual debate prep.",
      icon: Activity,
    },
    {
      time: "04:00 PM",
      stage: "GROW",
      title: "Mentorship, Reflection & Trajectory",
      description: "Reviewing assignments, consulting faculty during advising hours, and heading home with renewed purpose.",
      icon: Target,
    },
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
                className="text-primary border-b-2 border-primary pb-0.5"
              >
                Campus Life
              </Link>
              <Link 
                href="/facilities" 
                className="text-text-secondary hover:text-primary transition-colors pb-0.5"
              >
                Learning Facilities
              </Link>
            </div>
            <Link 
              href="/facilities" 
              className="text-xs font-bold text-accent-gold-dark hover:text-accent-gold transition-colors inline-flex items-center gap-1"
            >
              Explore Facilities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </PublicPageContainer>
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC EDITORIAL HERO WITH ASYMMETRIC IMAGE COMPOSITION                */}
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
              <span className="text-text-primary font-semibold">Campus Life</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Editorial Narrative */}
              <div className="lg:col-span-7 space-y-8">
                <Reveal variant="up">
                  <div className="inline-flex items-center gap-3">
                    <span className="w-6 h-[1.5px] bg-accent-gold" />
                    <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                      CAMPUS LIFE
                    </p>
                  </div>
                </Reveal>

                <Reveal variant="up" className="delay-100">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                    Life Beyond <br className="hidden sm:inline" />
                    <span className="text-primary font-light">the</span> Classroom
                  </h1>
                </Reveal>

                <Reveal variant="up" className="delay-200">
                  <p className="text-lg sm:text-xl text-text-secondary font-light leading-relaxed max-w-2xl">
                    Discover the experiences, friendships, activities, and everyday moments that make college life more than just academics at Superior Colleges Kanganpur Campus.
                  </p>
                </Reveal>

                {/* Editorial Metric Elements */}
                <Reveal variant="up" className="delay-300 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-border">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-accent-gold block">01 &bull; Community</span>
                      <p className="text-2xl font-extrabold text-text-primary font-serif">2,800+</p>
                      <p className="text-xs text-text-secondary">Students Active On Campus</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-primary block">02 &bull; Societies</span>
                      <p className="text-2xl font-extrabold text-primary font-serif">8 Active</p>
                      <p className="text-xs text-text-secondary">Student Clubs &amp; Circles</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-accent-gold block">03 &bull; Galas</span>
                      <p className="text-2xl font-extrabold text-text-primary font-serif">15+ Annual</p>
                      <p className="text-xs text-text-secondary">Events &amp; Competitions</p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right Asymmetric Overlapping Editorial Photo Composition */}
              <div className="lg:col-span-5 relative">
                <Reveal variant="right" className="delay-150">
                  <div className="relative">
                    {/* Primary Large Image */}
                    <div className="relative aspect-[4/5] bg-text-primary border border-border shadow-2xl overflow-hidden group">
                      <Image
                        src="/images/hero_pakistani_students.jpg"
                        alt="Students collaborating on Superior Colleges Campus"
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Floating Caption Strip */}
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-sm border border-border">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Student Community</p>
                        <p className="text-xs font-bold text-text-primary mt-0.5">Collaborative Learning &bull; Kanganpur Campus</p>
                      </div>
                    </div>

                    {/* Secondary Smaller Overlapping Image */}
                    <div className="absolute -bottom-8 -left-8 w-44 sm:w-52 aspect-video bg-white p-1.5 shadow-xl border border-border hidden sm:block">
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src="/images/classroom.jpg"
                          alt="Classroom discussion"
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
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
        {/* 3. INTRODUCTION — "MORE THAN A CLASSROOM"                                  */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              {/* Asymmetric Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                <div className="lg:col-span-5 space-y-4">
                  <Reveal variant="up">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        The Student Experience
                      </p>
                    </div>
                  </Reveal>
                  <Reveal variant="up" className="delay-100">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                      College Life Is About More Than What Happens in a Classroom.
                    </h2>
                  </Reveal>
                  <div className="w-16 h-[2px] bg-accent-gold mt-2" />
                </div>

                <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                  <Reveal variant="up" className="delay-150">
                    <p>
                      At Superior Colleges Kanganpur Campus, student life is designed as a catalyst for holistic growth. Beyond textbook mastery, students cultivate character, forge lifelong bonds, develop organizational leadership, and build the self-confidence needed to lead in society.
                    </p>
                  </Reveal>
                  
                  <Reveal variant="up" className="delay-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider block">01 &bull; Personal Growth</span>
                        <h4 className="text-sm font-bold text-text-primary">Friendships &amp; Belonging</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          A welcoming, respectful student culture where classmates support one another's ambitions.
                        </p>
                      </div>

                      <div className="p-5 bg-white border border-border space-y-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">02 &bull; Active Leadership</span>
                        <h4 className="text-sm font-bold text-text-primary">Confidence &amp; Responsibility</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Student-led governance, debating circles, and community impact drives.
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
        {/* 4. MAJOR STORYTELLING CHAPTERS (ASYMMETRIC, VARIED LAYOUTS)               */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-28 md:space-y-36">
              
              {/* ------------------------------------------------------------- */}
              {/* CHAPTER 01: Community — "Find Your People"                     */}
              {/* ------------------------------------------------------------- */}
              <Reveal variant="up" className="delay-100">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                  
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-serif font-extrabold text-primary/40 leading-none">01</span>
                      <div className="h-6 w-[1px] bg-border" />
                      <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-widest">Community</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                      Find Your People
                    </h2>

                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                      From your very first orientation week, you become part of an uplifting academic family. Group study circles in the library, lively lunchtime conversations in the cafeteria, and team capstones create bonds that endure far beyond graduation day.
                    </p>

                    <div className="p-4 bg-background-secondary border border-border flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-xs font-semibold text-text-primary">
                        Inclusive student body representing scholars from across Kanganpur and neighboring districts.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-6 relative aspect-[16/11] bg-text-primary border border-border shadow-xl overflow-hidden group">
                    <Image
                      src="/images/hero_pakistani_students.jpg"
                      alt="Students forming lifelong friendships at Superior Colleges"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                </div>
              </Reveal>

              {/* ------------------------------------------------------------- */}
              {/* CHAPTER 02: Events & Activities — "Make Every Moment Count"   */}
              {/* ------------------------------------------------------------- */}
              <Reveal variant="up" className="delay-100">
                <div className="group relative bg-[#075E68] text-white p-8 sm:p-12 md:p-16 overflow-hidden">
                  <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl font-serif font-extrabold text-white/30 leading-none">02</span>
                        <div className="h-6 w-[1px] bg-white/20" />
                        <span className="text-xs font-mono font-bold text-accent-gold-light uppercase tracking-widest">Events &amp; Activities</span>
                      </div>

                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        Make Every Moment Count
                      </h2>

                      <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light">
                        Our annual calendar is energized by traditional Galas, science expos, bilingual debates, creative festivals, and career fairs that transform theoretical potential into live public performance.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {["Annual Sports Gala", "Science & Innovation Fair", "Bilingual Debates", "Cultural Festivals"].map((item) => (
                          <span key={item} className="text-xs font-semibold text-white bg-white/15 px-3 py-1 border border-white/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 relative aspect-[4/3] bg-black/40 border border-white/20 overflow-hidden shadow-2xl">
                      <Image
                        src="/images/classroom.jpg"
                        alt="Campus event at Superior Colleges"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ------------------------------------------------------------- */}
              {/* CHAPTER 03: Sports & Wellness — "Balance, Energy & Wellbeing" */}
              {/* ------------------------------------------------------------- */}
              <Reveal variant="up" className="delay-100">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                  
                  <div className="lg:col-span-6 relative aspect-[16/11] bg-text-primary border border-border shadow-xl overflow-hidden group lg:order-1 order-2">
                    <Image
                      src="/images/advantages/modern_infrastructure.jpg"
                      alt="Sports and athletic facilities at Superior Colleges"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  <div className="lg:col-span-6 space-y-6 lg:order-2 order-1">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-serif font-extrabold text-primary/40 leading-none">03</span>
                      <div className="h-6 w-[1px] bg-border" />
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Sports &amp; Wellness</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                      Balance, Energy &amp; Wellbeing
                    </h2>

                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-light">
                      Physical recreation, sports championships, and outdoor activities balance intense academic studying. Our campus grounds support cricket, badminton, volleyball, and fitness training that cultivate endurance and sportsmanship.
                    </p>

                    <div className="p-4 bg-background-secondary border border-border flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-accent-gold shrink-0" />
                      <p className="text-xs font-semibold text-text-primary">
                        Inter-collegiate tournament champions across regional cricket and athletic meets.
                      </p>
                    </div>
                  </div>

                </div>
              </Reveal>

              {/* ------------------------------------------------------------- */}
              {/* CHAPTER 04 & 05: Collaboration & Leadership (Dual Grid)        */}
              {/* ------------------------------------------------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                
                {/* 04: Collaboration */}
                <Reveal variant="up" className="h-full delay-100">
                  <div className="group h-full bg-[#FCFDFD] border border-border p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-0 h-1.5 bg-primary transition-all duration-500 group-hover:w-full" />
                    
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-4xl font-serif font-extrabold text-primary/40">04</span>
                        <span className="text-xs font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                          COLLABORATION
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-text-primary">
                        Learning Doesn't Stop When the Class Ends
                      </h3>

                      <p className="text-sm text-text-secondary leading-relaxed font-light">
                        Peer study groups, laboratory hackathons, and collaborative research projects allow students to learn from one another's distinct strengths and perspectives.
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border">
                      <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> Group Study Rooms &bull; Tech Sandbox
                      </span>
                    </div>
                  </div>
                </Reveal>

                {/* 05: Leadership & Participation */}
                <Reveal variant="up" className="h-full delay-200">
                  <div className="group h-full bg-white border border-border p-8 sm:p-10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent-gold flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-0 h-1.5 bg-accent-gold transition-all duration-500 group-hover:w-full" />
                    
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-4xl font-serif font-extrabold text-accent-gold/40">05</span>
                        <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold-light/60 px-2.5 py-0.5 border border-accent-gold/20">
                          PARTICIPATION
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-text-primary">
                        Find Your Voice &amp; Lead
                      </h3>

                      <p className="text-sm text-text-secondary leading-relaxed font-light">
                        Develop the communicative confidence, civic responsibility, and organizational competence that distinguish great leaders through student societies and public speaking forums.
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border">
                      <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-accent-gold" /> Student Council &bull; Declamation Circle
                      </span>
                    </div>
                  </div>
                </Reveal>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 5. VISUAL CAMPUS LIFE GALLERY (EDITORIAL COLLAGE COMPOSITION)             */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Moments in Focus</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Campus Life in Pictures
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Everyday interactions, experimental discoveries, and lively celebrations captured across our Kanganpur grounds.
                  </p>
                </Reveal>
              </div>

              {/* Asymmetric Editorial Collage Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Large Dominant Image */}
                <div className="md:col-span-7">
                  <Reveal variant="up" className="h-full delay-100">
                    <div 
                      onClick={() => setActiveGalleryModal(galleryItems[0])}
                      className="group relative aspect-[16/11] md:h-full min-h-[300px] bg-text-primary border border-border shadow-lg overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={galleryItems[0].image}
                        alt={galleryItems[0].title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      
                      <div className="absolute bottom-6 left-6 right-6 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-accent-gold-light uppercase tracking-widest">{galleryItems[0].category}</span>
                        <h3 className="text-xl font-bold text-white">{galleryItems[0].title}</h3>
                        <p className="text-xs text-white/80 font-light line-clamp-2">{galleryItems[0].caption}</p>
                      </div>

                      <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* Stack of Two Smaller Images */}
                <div className="md:col-span-5 space-y-6">
                  {galleryItems.slice(1, 3).map((item, idx) => (
                    <Reveal key={item.id} variant="up" className={`delay-${(idx + 1) * 150}`}>
                      <div 
                        onClick={() => setActiveGalleryModal(item)}
                        className="group relative aspect-[16/10] bg-text-primary border border-border shadow-md overflow-hidden cursor-pointer"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        <div className="absolute bottom-4 left-4 right-4 space-y-0.5">
                          <span className="text-[10px] font-mono font-bold text-accent-gold-light uppercase tracking-wider">{item.category}</span>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        </div>

                        <div className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 6. "A DAY AT SUPERIOR" (STORYTELLING TIMELINE)                            */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Daily Cadence
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    A Day at Superior
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    From morning greetings at the campus gate to late-afternoon sports and research reviews, experience the daily rhythm of student life.
                  </p>
                </Reveal>
              </div>

              {/* Horizontal Timeline Flow on Desktop, Vertical on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                {dailyStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <Reveal key={stage.stage} variant="up" className={`delay-${idx * 100}`}>
                      <div className="h-full bg-[#FCFDFD] border border-border p-6 transition-all duration-300 hover:border-primary hover:shadow-lg flex flex-col justify-between group">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-border">
                            <span className="text-[11px] font-mono font-bold text-accent-gold uppercase tracking-wider">{stage.stage}</span>
                            <div className="w-7 h-7 flex items-center justify-center bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                            {stage.title}
                          </h3>

                          <p className="text-xs text-text-secondary leading-relaxed font-light">
                            {stage.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-6 border-t border-border/60">
                          <span className="text-[10px] font-mono text-text-muted block">Campus Daily Schedule</span>
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
        {/* 7. GALLERY ITEM DETAIL MODAL                                              */}
        {/* ========================================================================= */}
        {activeGalleryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div 
              className="relative w-full max-w-2xl bg-white border border-border shadow-2xl overflow-hidden animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => setActiveGalleryModal(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 text-text-primary hover:bg-white border border-border transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/10] bg-text-primary w-full">
                <Image
                  src={activeGalleryModal.image}
                  alt={activeGalleryModal.title}
                  fill
                  className="object-cover"
                  sizes="800px"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-3">
                <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider">{activeGalleryModal.category}</span>
                <h3 className="text-2xl font-bold text-text-primary">{activeGalleryModal.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">{activeGalleryModal.caption}</p>
                
                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => setActiveGalleryModal(null)}
                    className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 8. FINAL EMOTIONAL INSTITUTIONAL CALL TO ACTION                            */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Your College Experience Starts Here"
          description="Discover a place where learning, friendships, experiences and ambitions come together at Superior Colleges Kanganpur Campus. Fall 2026 admissions are actively open."
          href="/register"
          label="Apply for Admission"
        />

      </div>
    </PublicLayout>
  );
}
