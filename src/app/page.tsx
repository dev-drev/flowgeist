"use client";

import { useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentRevealed, setContentRevealed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  useEffect(() => {
    const hideLoader = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(hideLoader);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setContentRevealed(true), 250);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  return (
    <main className="flex min-h-screen h-screen w-full relative overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <ScaleLoader
                color="#ffffff"
                height={40}
                width={4}
                radius={2}
                margin={2}
              />
            </div>
            <p className="text-white text-lg font-grotesque">_flowgeist</p>
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 w-full h-full overflow-hidden z-0"
        style={{
          zIndex: 3,
          backgroundColor: "#121212f6",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 w-full h-full overflow-hidden">
        <motion.div
          className="flex h-full"
          style={{ width: "200%" }}
          animate={{ x: showAbout ? "-50%" : "0%" }}
          transition={{
            duration: 0.75,
            ease: [0, 0, 0.2, 1],
          }}
        >
          {/* Pannello logo */}
          <div
            className={`flex flex-shrink-0 w-1/2 items-center justify-center px-6 sm:px-12 lg:px-20 ${
              contentRevealed ? "animate-fade-in" : "animate-on-reveal"
            }`}
            style={{ minWidth: "50%" }}
            aria-label="Landing"
          >
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg cursor-pointer block"
              aria-label="Mostra about"
            >
              <Image
                src="/artists/icon.png"
                alt="flowgeist"
                width={500}
                height={700}
                quality={100}
                className="w-full max-w-[280px] h-auto object-contain hover:opacity-90 transition-opacity"
                priority
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            </button>
          </div>

          {/* Pannello about: entra da destra e si posiziona al centro */}
          <div
            className="flex flex-shrink-0 w-1/2 items-center justify-center overflow-y-auto"
            style={{ minWidth: "50%" }}
            aria-label="About"
          >
            <div className="relative w-full h-full min-h-0 flex flex-col items-center justify-center py-12 lg:py-16 px-4 sm:px-8 lg:px-20 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="absolute top-4 left-4 lg:top-8 lg:left-8 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-grotesque text-sm"
                aria-label="Torna alla home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                indietro
              </button>

              <div className="space-y-4 flex flex-col items-center justify-center gap-6 lg:gap-10 flex-1 pt-8">
                <p className="text-white/90 font-grotesque text-[15px] sm:text-[17px] lg:text-[19px] leading-relaxed text-justify max-w-3xl text-center w-full">
                  Flowgeist resonates across purest sound and form through endless
                  definition. Structures surface, loosen, and fall away, allowing
                  material to reorganise in real time. Forms are driven to the point
                  of wear: edges soften, outlines blur, and stylistic markers lose
                  stability. Rhythm functions as a spatial force, contracting and
                  releasing density as tension gathers and dissipates. Long-form
                  electronic construction intersects with physical intensity, where
                  restraint and impact remain closely linked and abstraction stays
                  tethered to sensation. Genre remains peripheral, treated as
                  material rather than structure. Sound leads the process, leaving
                  interpretation to emerge through listening, over time.
                </p>
                <div className="flex flex-col items-center justify-center gap-5 lg:gap-8">
                  <div className="flex justify-center w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[300px]">
                    <Image
                      src="/artists/flowhite.png"
                      alt="flowgeist"
                      width={500}
                      height={500}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 pt-2" aria-label="Social links">
                    <a
                      href="mailto:flowgeistmusic@gmail.com"
                      className="social-icon-link flex items-center justify-center text-white/80 hover:text-white w-10 h-10 lg:w-11 lg:h-11 transition-opacity duration-300 animate-scale-in"
                      aria-label="Email flowgeistmusic@gmail.com"
                    >
                      <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/flowgeistx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-link flex items-center justify-center text-white/80 hover:text-white w-10 h-10 lg:w-11 lg:h-11 transition-opacity duration-300 animate-scale-in animate-delay-1"
                      aria-label="Instagram flowgeistmusic"
                    >
                      <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a
                      href="https://soundcloud.com/flowgeist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-link flex items-center justify-center text-white/80 hover:text-white w-10 h-10 lg:w-11 lg:h-11 transition-opacity duration-300 animate-scale-in animate-delay-2"
                      aria-label="SoundCloud flowgeist"
                    >
                      <Image
                        src="/sc.png"
                        alt="SoundCloud"
                        width={24}
                        height={24}
                        style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
                        className="w-5 h-5 lg:w-6 lg:h-6 opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
