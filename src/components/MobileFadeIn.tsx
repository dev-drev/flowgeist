"use client";

import { useEffect, useRef, useState } from "react";

interface MobileFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  active?: boolean;
}

export default function MobileFadeIn({
  children,
  className = "",
  delay = 0,
  active = true,
}: MobileFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 20% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={ref}
      className={`mobile-fade-in md:opacity-100 md:[animation:none] ${
        visible ? "mobile-fade-in--visible" : ""
      } ${className}`}
      style={
        visible && delay > 0 ? { animationDelay: `${delay}ms` } : undefined
      }
    >
      {children}
    </div>
  );
}
