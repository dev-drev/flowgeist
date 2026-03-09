"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  useEffect(() => {
    document.documentElement.classList.add("home-page");
    document.body.classList.add("home-page");
    return () => {
      document.documentElement.classList.remove("home-page");
      document.body.classList.remove("home-page");
    };
  }, []);

  return (
    <main className="fixed inset-0 flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden">
      <div
        className="fixed inset-0 w-full h-full overflow-hidden z-0"
        style={{
          zIndex: 3,
          backgroundColor: "#121212f6",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 w-full h-full max-h-[100dvh] flip-container">
        <div className={`flip-inner h-full ${showAbout ? "is-flipped" : ""}`}>
          {/* Fronte: solo logo, centrato */}
          <div
            className="flip-face flex items-center justify-center w-full h-full min-h-0 px-6 sm:px-12 lg:px-20 animate-fade-in"
            aria-label="Landing"
          >
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg cursor-pointer flex items-center justify-center w-full h-full min-h-0"
              aria-label="Mostra about"
            >
              <Image
                src="/artists/icon.png"
                alt="flowgeist"
                width={500}
                height={700}
                quality={100}
                className="w-full max-w-[280px] h-auto object-contain object-center hover:opacity-90 transition-opacity"
                priority
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            </button>
          </div>

          {/* Retro: about — scroll solo qui dentro */}
          <div className="flip-face flip-face-back flex flex-col w-full h-full min-h-0 overflow-hidden" aria-label="About">
            <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain about-scroll">
              <div className="flex flex-col items-center justify-center min-h-full py-12 lg:py-16 px-4 sm:px-8 lg:px-20 max-w-4xl mx-auto">
              <div
                className="space-y-4 flex flex-col items-center justify-center gap-6 lg:gap-10 flex-1 pt-8 cursor-pointer"
                onClick={() => setShowAbout(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowAbout(false)}
                aria-label="Torna al logo"
              >
                <p className="text-white/90 font-grotesque text-[15px] sm:text-[17px] lg:text-[19px] leading-relaxed text-justify max-w-3xl text-center px-4 sm:px-8 lg:px-0 w-full">
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
                  <div className="flex items-center gap-2 lg:gap-3 pt-2" aria-label="Social links" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      </div>
    </main>
  );
}
