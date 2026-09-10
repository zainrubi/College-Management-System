"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PublicPageContainer, Reveal, PublicCTA } from "@/components/public/PublicPage";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Building2,
  Compass,
  ExternalLink,
  ShieldCheck,
  User,
  Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    programOfInterest: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const contactFaqs = [
    {
      q: "What is the expected response time for online inquiries?",
      a: "Our admissions and administrative helpdesks respond to online inquiries within 24 business hours. For immediate assistance, we encourage telephone calls or WhatsApp messages during campus hours.",
    },
    {
      q: "Can prospective students and parents visit the campus without an appointment?",
      a: "Yes. Our admissions office is open Monday through Saturday from 8:00 AM to 4:00 PM for walk-in campus tours, faculty introductions, and program counseling.",
    },
    {
      q: "How do I connect directly with the admissions team via WhatsApp?",
      a: "You can click our 'Chat on WhatsApp' button to initiate an instant conversation with an admissions advisor regarding eligibility, fee vouchers, and admission procedures.",
    },
    {
      q: "Where is the main entrance of the campus located?",
      a: "Superior Colleges Kanganpur Campus is situated on the main campus access road in Kanganpur, District Kasur, easily reachable via public and college transport.",
    },
  ];

  const departmentalDesks = [
    {
      name: "Admissions Advisory Desk",
      lead: "Admissions & Outreach Directorate",
      contact: MOCK_COLLEGE.contactPhone,
      email: MOCK_COLLEGE.contactEmail,
      hours: "Mon - Sat: 8:00 AM - 4:00 PM",
      accent: "primary",
    },
    {
      name: "Academic & Examination Affairs",
      lead: "Office of the Academic Registrar",
      contact: "+92 300 4443322",
      email: "academics@superiorcolleges.edu.pk",
      hours: "Mon - Fri: 8:30 AM - 3:30 PM",
      accent: "gold",
    },
    {
      name: "Student Affairs & General Helpdesk",
      lead: "Directorate of Student Experience",
      contact: "+92 321 3332211",
      email: "studentaffairs@superiorcolleges.edu.pk",
      hours: "Mon - Sat: 9:00 AM - 3:00 PM",
      accent: "primary",
    },
  ];

  return (
    <PublicLayout>
      <div className="bg-white text-text-primary selection:bg-primary selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL CONTACT HERO                                                 */}
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
              <span className="text-text-primary font-semibold">Contact</span>
            </nav>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Eyebrow */}
              <Reveal variant="up">
                <div className="inline-flex items-center gap-3">
                  <span className="w-6 h-[1.5px] bg-accent-gold" />
                  <p className="text-accent-gold-dark font-extrabold uppercase tracking-[0.28em] text-xs sm:text-sm">
                    GET IN TOUCH
                  </p>
                </div>
              </Reveal>

              {/* Main Title */}
              <Reveal variant="up" className="delay-100">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tight leading-[1.04]">
                  We're Here <br className="hidden sm:inline" />
                  <span className="text-primary font-light">to</span> Help
                </h1>
              </Reveal>

              {/* Supporting Text */}
              <Reveal variant="up" className="delay-200">
                <div className="max-w-3xl pt-2">
                  <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                    Whether you're exploring admissions, looking for program details, or want to speak with our academic faculty, our team is ready to assist you.
                  </p>
                </div>
              </Reveal>

              {/* Four Direct Action Triggers */}
              <Reveal variant="up" className="delay-300 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-border">
                  
                  {/* Action 1: Call */}
                  <a
                    href={`tel:${MOCK_COLLEGE.contactPhone}`}
                    className="p-5 bg-white border border-border hover:border-primary hover:shadow-lg transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">Direct Call</p>
                      <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                        {MOCK_COLLEGE.contactPhone}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Action 2: WhatsApp */}
                  <a
                    href={`https://wa.me/923001234567?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20admissions%20at%20Superior%20Colleges%20Kanganpur`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-[#075E68] text-white hover:bg-primary-dark hover:shadow-lg transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-accent-gold-light uppercase tracking-wider">Instant Chat</p>
                      <p className="text-sm font-bold text-white">
                        Chat on WhatsApp
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-accent-gold-light group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Action 3: Email */}
                  <a
                    href={`mailto:${MOCK_COLLEGE.contactEmail}`}
                    className="p-5 bg-white border border-border hover:border-primary hover:shadow-lg transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">Email Inquiry</p>
                      <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate max-w-[170px]">
                        {MOCK_COLLEGE.contactEmail}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Action 4: Campus Visit */}
                  <a
                    href="#location"
                    className="p-5 bg-white border border-border hover:border-primary hover:shadow-lg transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">Visit Us</p>
                      <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                        Kanganpur Campus
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </a>

                </div>
              </Reveal>
            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 2. CONTACT FORM & ADMISSIONS BRIDGING (SPLIT EDITORIAL COMPOSITION)        */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F7F9F9] border-b border-border relative">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                
                {/* Left Column: Form Guidance & Admissions Bridging */}
                <div className="lg:col-span-5 space-y-8">
                  <Reveal variant="up">
                    <div className="inline-flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                        Direct Inquiry
                      </p>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mt-3 leading-tight">
                      Send Us a Message
                    </h2>
                    <p className="text-base text-text-secondary font-light mt-4 leading-relaxed">
                      Have specific questions about admissions, intermediate programs, fee structures, or campus facilities? Fill out the inquiry form and our advisory desk will get back to you promptly.
                    </p>
                  </Reveal>

                  {/* Admissions Bridge Box */}
                  <Reveal variant="up" className="delay-150">
                    <div className="p-6 bg-white border border-border border-l-4 border-l-primary space-y-3 shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-accent-gold-dark uppercase tracking-widest block">
                        ADMISSION ADVISING
                      </span>
                      <h4 className="text-lg font-bold text-text-primary">Questions About Admission?</h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">
                        Our admissions counselors are actively scheduling student counseling sessions for Fall 2026.
                      </p>
                      <Link 
                        href="/admissions" 
                        className="text-xs font-bold text-primary hover:text-accent-gold-dark inline-flex items-center gap-1.5 pt-1 transition-colors"
                      >
                        Explore Admissions Portal <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Reveal>

                  {/* Operating Hours Box */}
                  <Reveal variant="up" className="delay-200">
                    <div className="p-6 bg-white border border-border space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                        <Clock className="w-4 h-4 text-accent-gold" /> Campus Operating Hours
                      </div>
                      <div className="space-y-1.5 text-xs text-text-secondary font-light">
                        <div className="flex justify-between pb-1 border-b border-border">
                          <span className="font-medium text-text-primary">Monday - Friday:</span>
                          <span>8:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b border-border">
                          <span className="font-medium text-text-primary">Saturday:</span>
                          <span>8:00 AM - 2:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-text-primary">Sunday:</span>
                          <span className="text-text-muted italic">Closed</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* Right Column: Premium Contact Form */}
                <div className="lg:col-span-7">
                  <Reveal variant="up" className="delay-100">
                    <div className="bg-white border border-border p-8 sm:p-12 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent-gold" />
                      
                      {isSubmitted ? (
                        <div className="py-12 text-center space-y-4 animate-scale-in">
                          <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h3 className="text-2xl font-extrabold text-text-primary">Thank You for Reaching Out</h3>
                          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                            Your inquiry has been delivered to the Superior Colleges admissions desk. A counselor will review your message and reach out within 24 hours.
                          </p>
                          <button
                            onClick={() => {
                              setIsSubmitted(false);
                              setFormData({
                                fullName: "",
                                email: "",
                                phone: "",
                                programOfInterest: "",
                                subject: "",
                                message: "",
                              });
                            }}
                            className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                          >
                            Send Another Message
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Full Name */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                Full Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="e.g. Muhammad Ali"
                                className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors"
                              />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                Email Address <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="e.g. ali@example.com"
                                className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Phone */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                Mobile / WhatsApp <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+92 300 1234567"
                                className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors font-mono"
                              />
                            </div>

                            {/* Program */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                Program of Interest
                              </label>
                              <input
                                type="text"
                                value={formData.programOfInterest}
                                onChange={(e) => setFormData({ ...formData, programOfInterest: e.target.value })}
                                placeholder="e.g. FSc Pre-Medical / BSCS"
                                className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors"
                              />
                            </div>

                          </div>

                          {/* Subject */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                              Inquiry Subject
                            </label>
                            <input
                              type="text"
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              placeholder="e.g. Fee structure & merit threshold questions"
                              className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors"
                            />
                          </div>

                          {/* Message */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                              Message Content <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              placeholder="Write your specific question or inquiry here..."
                              className="w-full px-4 py-3 bg-[#FCFDFD] border border-border focus:border-primary text-xs text-text-primary outline-none transition-colors resize-none"
                            />
                          </div>

                          {/* Submit Action */}
                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                              <Send className="w-4 h-4" />
                              <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Message to Admissions Desk"}</span>
                            </button>
                          </div>

                        </form>
                      )}

                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 3. CAMPUS LOCATION & VISITOR MAP SECTION                                  */}
        {/* ========================================================================= */}
        <section id="location" className="py-24 md:py-36 bg-white relative overflow-hidden">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <Reveal variant="up">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">Find Us</p>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                      Visit Our Campus
                    </h2>
                  </div>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary max-w-md md:text-right font-light leading-relaxed">
                    Centrally situated in {MOCK_COLLEGE.city}, with accessible regional transit connections.
                  </p>
                </Reveal>
              </div>

              {/* Location Split Composition */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                
                {/* Location Specs Column */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                  <Reveal variant="up" className="space-y-6">
                    <div className="p-8 bg-[#FCFDFD] border border-border space-y-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-primary-light text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">Official Address</span>
                        <h3 className="text-xl font-bold text-text-primary">{MOCK_COLLEGE.name}</h3>
                        <p className="text-sm text-text-secondary font-light leading-relaxed pt-1">
                          {MOCK_COLLEGE.address}, {MOCK_COLLEGE.city}, {MOCK_COLLEGE.province}, Pakistan
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Compass className="w-4 h-4 text-primary" />
                        <span>Kanganpur Campus Main Admission Gate</span>
                      </div>
                    </div>

                    <div className="p-6 bg-background-secondary border border-border space-y-2">
                      <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Planning Your Visit?</p>
                      <p className="text-xs text-text-secondary font-light leading-relaxed">
                        Visitors can check in at the reception desk at the main gate. Parking facilities and student orientation desks are available on site.
                      </p>
                    </div>
                  </Reveal>

                  <Reveal variant="up" className="delay-150">
                    <a
                      href={`https://maps.google.com/?q=Superior+Group+of+Colleges+Kanganpur`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 bg-white hover:bg-primary hover:text-white text-text-primary text-xs font-bold uppercase tracking-wider border border-border hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Reveal>
                </div>

                {/* Stylized Map View Placeholder Box */}
                <div className="lg:col-span-7">
                  <Reveal variant="up" className="h-full delay-150">
                    <div className="relative h-full min-h-[360px] bg-[#075E68] text-white border border-border p-8 sm:p-12 flex flex-col justify-between overflow-hidden group">
                      {/* Background Map Graphic Accents */}
                      <div 
                        className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ 
                          backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", 
                          backgroundSize: "24px 24px" 
                        }} 
                      />
                      
                      <div className="relative space-y-3">
                        <span className="text-xs font-mono font-bold text-accent-gold-light bg-white/10 px-3 py-1 border border-white/20">
                          CAMPUS MAP &bull; KANGANPUR
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                          Superior Colleges Campus Grounds
                        </h3>
                        <p className="text-sm text-white/80 font-light max-w-md leading-relaxed">
                          Main instructional blocks, computer lab complexes, sports grounds, and admissions reception.
                        </p>
                      </div>

                      <div className="relative pt-8 mt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-0.5 text-xs text-white/90">
                          <p className="font-bold text-accent-gold-light">Accessible Transport</p>
                          <p className="font-light text-[11px]">Direct bus stop &amp; college coaster routes</p>
                        </div>

                        <a
                          href={`https://maps.google.com/?q=Superior+Group+of+Colleges+Kanganpur`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Get Driving Directions</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>

            </div>
          </PublicPageContainer>
        </section>


        {/* ========================================================================= */}
        {/* 4. DEPARTMENTAL DESK DIRECTORY                                            */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FCFDFD] border-t border-b border-border">
          <PublicPageContainer>
            <div className="max-w-6xl mx-auto space-y-16">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Institutional Desks
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Departmental Helpdesks
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed">
                    Connect directly with specialized academic, admissions, and student services offices.
                  </p>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {departmentalDesks.map((desk, idx) => (
                  <Reveal key={desk.name} variant="up" className={`delay-${idx * 100}`}>
                    <div className="h-full bg-white border border-border p-8 transition-all duration-300 hover:border-primary hover:shadow-xl flex flex-col justify-between group">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-primary bg-primary-light px-2.5 py-0.5 border border-primary/20">
                            DESK 0{idx + 1}
                          </span>
                          <Building2 className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                          {desk.name}
                        </h3>

                        <p className="text-xs text-text-muted font-medium">
                          {desk.lead}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-border space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-text-primary">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono font-semibold">{desk.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary truncate">
                          <Mail className="w-3.5 h-3.5 text-accent-gold" />
                          <span className="truncate">{desk.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-muted text-[11px] pt-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span>{desk.hours}</span>
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
        {/* 5. CONTACT & VISIT FAQ (ACCORDION)                                        */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-36 bg-white">
          <PublicPageContainer>
            <div className="max-w-4xl mx-auto space-y-16">
              
              <div className="text-center space-y-4">
                <Reveal variant="up">
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-accent-gold">
                    Communication Queries
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
                    Frequently Asked Questions
                  </h2>
                </Reveal>
                <Reveal variant="up" className="delay-100">
                  <p className="text-sm text-text-secondary font-light leading-relaxed">
                    Answers to common inquiries regarding communication channels, campus hours, and visits.
                  </p>
                </Reveal>
              </div>

              <div className="space-y-4">
                {contactFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;

                  return (
                    <Reveal key={faq.q} variant="up" className={`delay-${idx * 50}`}>
                      <div className="bg-[#FCFDFD] border border-border overflow-hidden transition-colors">
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
        {/* 6. FINAL CALL TO ACTION                                                   */}
        {/* ========================================================================= */}
        <PublicCTA
          title="Have a Question About Your Academic Future?"
          description="Whether you're a prospective student, parent, or visitor, we're ready to guide you at Superior Colleges Kanganpur Campus."
          href="/admissions"
          label="Explore Admissions"
        />

      </div>
    </PublicLayout>
  );
}
