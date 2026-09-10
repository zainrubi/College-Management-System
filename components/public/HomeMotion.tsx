"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// 1. Scroll Reveal Wrapper
export function ScrollReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  threshold = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "down" | "left" | "right" | "scale" | "clip-up" | "clip-left";
  delay?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const variantClass = {
    up: "reveal",
    down: "reveal-down",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
    "clip-up": "reveal-clip-up",
    "clip-left": "reveal-clip-left",
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(
        variantClass,
        visible && "is-visible",
        className
      )}
    >
      {children}
    </div>
  );
}

// 2. Text Line Reveal (Masked vertical transition)
export function TextLineReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span ref={ref} className={cn("block overflow-hidden py-1", className)}>
      <span
        className={cn(
          "block transition-transform duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) transform",
          visible ? "translate-y-0" : "translate-y-[110%]"
        )}
      >
        {children}
      </span>
    </span>
  );
}

// 3. CountUp Stat Counter
export function CountUp({
  value,
  duration = 1800,
  className,
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const handle = requestAnimationFrame(() => {
        setCount(value);
      });
      return () => cancelAnimationFrame(handle);
    }

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// 4. Scroll Parallax Container
export function ScrollParallax({
  children,
  className,
  speed = 0.05,
  maxTranslate = 30,
}: {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  maxTranslate?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    // Disable on mobile/touch devices or reduced motion
    const isMobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 768px)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0);
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMobile || prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Only calculate if visible in viewport
            if (rect.top < viewHeight && rect.bottom > 0) {
              const elementCenter = rect.top + rect.height / 2;
              const viewCenter = viewHeight / 2;
              const offset = (elementCenter - viewCenter) * speed;
              const boundedOffset = Math.max(-maxTranslate, Math.min(maxTranslate, offset));
              setTranslateY(boundedOffset);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initial positioning
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, maxTranslate]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        transform: `translateY(${translateY}px)`,
        transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    >
      {children}
    </div>
  );
}

// 5. Staggered Entrance Parent Context
const StaggerContext = createContext<boolean>(false);

export function StaggerContainer({
  children,
  className,
  threshold = 0.05,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <StaggerContext.Provider value={visible}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

// 6. Staggered Entrance Item
export function StaggerItem({
  children,
  index,
  baseDelay = 80,
  staggerInterval = 100,
  variant = "up",
  className,
}: {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  staggerInterval?: number;
  variant?: "up" | "down" | "left" | "right" | "scale";
  className?: string;
}) {
  const visible = useContext(StaggerContext);
  const variantClass = {
    up: "reveal",
    down: "reveal-down",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
  }[variant];

  const delayMs = baseDelay + index * staggerInterval;

  return (
    <div
      className={cn(
        variantClass,
        visible && "is-visible",
        className
      )}
      style={{
        transitionDelay: visible ? `${delayMs}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
