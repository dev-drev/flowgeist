"use client";

import { useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";
import { getFeaturedArtists, Artist } from "@/lib/artistsConfig";

export default function Home() {
  const [videoSource, setVideoSource] = useState("");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socialRailVisible, setSocialRailVisible] = useState(false);
  const [contentRevealed, setContentRevealed] = useState(false);
  const [textSectionVisible, setTextSectionVisible] = useState(false);
  const [imageSectionVisible, setImageSectionVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const { trackPageView } = useTracking();
  const artists = getFeaturedArtists();

  // Track page view on component mount
  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  // Load initial video
  useEffect(() => {
    // Use vd1.mp4 from public/artists folder
    setVideoURL("/artists/vd1.mp4");
    setVideoSource("vd1.mp4");
  }, []);

  // Hide loader after 3 seconds, then reveal social rail for entrance animation
  useEffect(() => {
    const hideLoader = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(hideLoader);
  }, []);
  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setContentRevealed(true), 250);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  useEffect(() => {
    const textEl = textSectionRef.current;
    const imageEl = imageSectionRef.current;
    if (!textEl || !imageEl) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === textEl && entry.isIntersecting) {
            setTextSectionVisible(true);
            setSocialRailVisible(true); // social nella stessa sezione
          }
          if (entry.target === imageEl && entry.isIntersecting)
            setImageSectionVisible(true);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    obs.observe(textEl);
    obs.observe(imageEl);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="flex min-h-screen w-full relative">
      {/* Loading Screen */}
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
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        <div
          className="absolute inset-0"
          style={{
            zIndex: 3,
            backgroundColor: "#121212f6",
            mixBlendMode: "multiply",
          }}
        ></div>
      </div>

      {/* Content overlay — due sezioni da 100vh */}
      <div className="relative z-10 flex flex-col w-full">
        {/* Sezione 1: Landing — 100vh, solo icona */}
        <section
          className={`min-h-[100vh] w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 ${
            contentRevealed ? "animate-fade-in" : "animate-on-reveal"
          }`}
          aria-label="Landing"
        >
          <Image
            src="/artists/icon.png"
            alt="flowgeist"
            width={500}
            height={700}
            quality={100}
            className="w-full max-w-[280px] h-auto object-contain"
            priority
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </section>

        {/* Sezione 2: Paragrafo + flowhite + artisti + social — 100vh, social a destra */}
        <section
          ref={textSectionRef}
          className={`min-h-[100vh] w-full flex items-center justify-center relative border-t border-white/10 ${
            textSectionVisible ? "animate-fade-up" : "animate-on-reveal"
          }`}
          aria-label="About"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-10 lg:gap-16 pt-40 px-6 sm:px-12 lg:px-20 py-16 max-w-4xl mx-auto">
            <p className="text-white/90 font-grotesque text-base sm:text-lg lg:text-[17px] leading-relaxed text-justify max-w-3xl text-center">
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
            <div
              ref={imageSectionRef}
              className="flex flex-col items-center justify-center gap-8"
            >
              <div
                className={`flex justify-center max-w-[300px] ${
                  imageSectionVisible
                    ? "animate-fade-in-image animate-delay-1"
                    : "animate-on-reveal"
                }`}
              >
                <Image
                  src="/artists/flowhite.png"
                  alt="flowgeist"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => artists[0] && setSelectedArtist(artists[0])}
                  className={`relative w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full border border-white/20 overflow-hidden hover:border-white/80 transition-all duration-300 cursor-pointer flex-shrink-0 group ${
                    imageSectionVisible
                      ? "animate-scale-in animate-delay-2"
                      : "animate-on-reveal"
                  }`}
                  aria-label={`View ${artists[0]?.name} bio`}
                >
                  <Image
                    src={artists[0].image}
                    alt={artists[0].name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
                <button
                  onClick={() => artists[1] && setSelectedArtist(artists[1])}
                  className={`relative w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full border border-white/20 overflow-hidden hover:border-white/80 transition-all duration-300 cursor-pointer flex-shrink-0 group ${
                    imageSectionVisible
                      ? "animate-scale-in animate-delay-3"
                      : "animate-on-reveal"
                  }`}
                  aria-label={`View ${artists[1]?.name} bio`}
                >
                  <Image
                    src={artists[1].image}
                    alt={artists[1].name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Social — stessa sezione, attaccati a destra */}
          <div
            className="absolute right-0 bottom-0 -translate-y-1/2 pr-4 lg:pr-8 flex flex-col items-center gap-5"
            aria-label="Social links"
          >
            <div
              className="absolute right-0 h-28 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent"
              aria-hidden
            />
            <a
              href="mailto:flowgeistmusic@gmail.com"
              className={`social-icon-link flex items-center justify-center text-white/80 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-1" : "opacity-0"}`}
              aria-label="Email flowgeistmusic@gmail.com"
            >
              <svg
                className="h-6 w-6 lg:h-8 lg:w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/flowgeistx"
              target="_blank"
              rel="noopener noreferrer"
              className={`social-icon-link flex items-center justify-center text-white/80 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-2" : "opacity-0"}`}
              aria-label="Instagram flowgeistmusic"
            >
              <svg
                className="h-6 w-6 lg:h-7 lg:w-7"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://soundcloud.com/flowgeist"
              target="_blank"
              rel="noopener noreferrer"
              className={`social-icon-link flex items-center justify-center text-white/80 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-3" : "opacity-0"}`}
              aria-label="SoundCloud flowgeist"
            >
              <Image
                src="/sc.png"
                alt="SoundCloud"
                width={24}
                height={24}
                style={{
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
                className="w-6 h-6 lg:w-7 lg:h-7 opacity-80 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </section>
      </div>

      {/* Modal Biografia Artista */}
      {selectedArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="relative bg-zinc-900/95 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedArtist(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Artist Image */}
            <div className="mb-6 flex justify-center">
              <Image
                src={selectedArtist.image}
                alt={selectedArtist.name}
                width={250}
                height={250}
                className="rounded-lg object-cover"
              />
            </div>

            {/* Artist Name */}
            <h3 className="text-3xl font-grotesque text-white mb-4 text-center">
              {selectedArtist.name}
            </h3>

            {/* Artist Description */}
            {selectedArtist.description && (
              <p className="text-white/80 font-grotesque leading-relaxed mb-6 text-justify">
                {selectedArtist.description}
              </p>
            )}

            {/* Links */}
            <div className="flex flex-col gap-3">
              <a
                href={selectedArtist.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors font-grotesque"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Visit Website
              </a>
              {selectedArtist.link2 && (
                <a
                  href={selectedArtist.link2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors font-grotesque"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  {selectedArtist.link2Label || "Visit Profile"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
