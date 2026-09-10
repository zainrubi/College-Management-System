"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicPageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("public-container", className)}>{children}</div>;
}

export function Reveal({
  children,
  className,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("public-reveal", `public-reveal-${variant}`, visible && "is-visible", className)}>
      {children}
    </div>
  );
}

interface PublicHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  image?: string;
  imageAlt?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PublicHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  image = "/images/hero_pakistani_students.jpg",
  imageAlt = "Students learning together",
  badge,
  actions,
}: PublicHeroProps) {
  return (
    <section className="public-hero">
      <div className="public-container">
        <nav className="public-breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </React.Fragment>
          ))}
        </nav>
        <div className="public-hero-grid">
          <div className="public-hero-copy">
            <Reveal>
              <p className="public-eyebrow">{eyebrow}</p>
              <div className="public-gold-rule" />
              <div className="flex flex-wrap items-center gap-3">
                <h1>{title}</h1>
                {badge}
              </div>
              <p className="public-hero-description">{description}</p>
              {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
            </Reveal>
          </div>
          <Reveal variant="right" className="public-hero-media">
            <Image src={image} alt={imageAlt} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
            <div className="public-hero-stamp">SUPERIOR<br /><span>COLLEGES</span></div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function PublicSectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <Reveal className="public-section-intro">
      <p className="public-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      <div className="public-gold-rule" />
    </Reveal>
  );
}

export function PublicCTA({ title, description, href = "/register", label = "Apply Now" }: { title: string; description: string; href?: string; label?: string }) {
  return (
    <section className="public-cta">
      <PublicPageContainer className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="public-eyebrow text-accent-gold-light">Next Chapter</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link href={href} className="public-cta-link">{label} <ArrowRight className="h-4 w-4" /></Link>
      </PublicPageContainer>
    </section>
  );
}
