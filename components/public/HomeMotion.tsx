"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "clip-up" | "clip-left";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  threshold?: number;
};

function getHiddenState(variant: RevealVariant) {
  switch (variant) {
    case "down":
      return { opacity: 0, y: -18 };
    case "left":
      return { opacity: 0, x: -18 };
    case "right":
      return { opacity: 0, x: 18 };
    case "scale":
      return { opacity: 0, scale: 0.98 };
    case "clip-up":
      return { opacity: 0, y: 14 };
    case "clip-left":
      return { opacity: 0, x: -14 };
    default:
      return { opacity: 0, y: 18 };
  }
}

export function ScrollReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  threshold = 0.12,
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : getHiddenState(variant)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: reducedMotion ? 0 : 0.48,
        delay: reducedMotion ? 0 : delay / 1000,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({
  children,
  className,
  delay = 0,
}: Omit<RevealProps, "variant" | "threshold">) {
  return (
    <ScrollReveal className={className} delay={delay} variant="up">
      {children}
    </ScrollReveal>
  );
}

export function CountUp({
  value,
  duration = 520,
  className,
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || reducedMotion) return;

    let frame = 0;
    let startTime: number | null = null;
    const animateCount = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) frame = window.requestAnimationFrame(animateCount);
    };

    frame = window.requestAnimationFrame(animateCount);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, inView, reducedMotion, value]);

  return (
    <span ref={ref} className={className}>
      {(reducedMotion ? value : count).toLocaleString()}{suffix}
    </span>
  );
}

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
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const distance = Math.min(maxTranslate, Math.abs(speed) * 1000);
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    speed < 0 ? [distance, -distance] : [-distance, distance],
  );

  return (
    <motion.div ref={ref} className={className} style={{ y: reducedMotion ? 0 : y }}>
      {children}
    </motion.div>
  );
}

export const ParallaxWrapper = ScrollParallax;

const StaggerContext = createContext(false);

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
  const inView = useInView(ref, { once: true, amount: threshold });
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!inView || delay <= 0 || reducedMotion) return;
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, inView, reducedMotion]);

  const isVisible = inView && (delay <= 0 || reducedMotion || visible);

  return (
    <StaggerContext.Provider value={isVisible}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

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
  const reducedMotion = useReducedMotion();
  const hiddenState = getHiddenState(variant);

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : hiddenState}
      animate={visible ? { opacity: 1, x: 0, y: 0, scale: 1 } : hiddenState}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        delay: reducedMotion ? 0 : (baseDelay + index * staggerInterval) / 1000,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
