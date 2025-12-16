"use client";

import { useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const [videoSource, setVideoSource] = useState("");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { trackPageView } = useTracking();

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

  // Hide loader after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
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
        {/* Background Video */}
        {videoURL && (
          <video
            key={`${videoSource}-${Date.now()}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(0.5)",
              transform: "scaleY(-1)",
              zIndex: 2,
            }}
            onLoadStart={() => {}}
            onLoadedMetadata={() => {}}
            onCanPlay={() => {}}
            onError={(e) => {}}
            ref={(el) => {
              if (el) {
                try {
                  // Imposta la velocità e forza il play dopo che il video è caricato
                  el.addEventListener("loadedmetadata", () => {
                    el.playbackRate = 0.1; // Rallenta il video al 10% della velocità normale
                    el.play().catch(() => {}); // Forza il play
                  });
                  // Forza il play anche quando può essere riprodotto
                  el.addEventListener("canplay", () => {
                    el.play().catch(() => {});
                  });
                } catch (error) {}
              }
            }}
          >
            <source src={videoURL} type="video/mp4" />
          </video>
        )}
        {/* Overlay con colore #121212 */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 3,
            backgroundColor: "#121212D7",
            mixBlendMode: "multiply",
          }}
        ></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center w-full h-full min-h-screen">
        <div className="px-4 w-full max-w-7xl mx-auto py-20">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-[200px]">
            {/* Immagine a sinistra */}
            <div className="flex-shrink-0">
              <Image
                src="/artists/flowgeist.svg"
                alt="flowgeist"
                width={500}
                height={700}
                className="w-full max-w-md lg:max-w-md"
                priority
              />
            </div>

            {/* Testo in una colonna a destra */}
            <div className="flex-1 max-w-xl text-white/90 font-grotesque">
              <p className="text-lg lg:text-lg leading-relaxed text-justify">
                Flowgeist resonates across purest sound and form through endless
                definition. Structures surface, loosen, and fall away, allowing
                material to reorganise in real time. Forms are driven to the
                point of wear: edges soften, outlines blur, and stylistic
                markers lose stability. Rhythm functions as a spatial force,
                contracting and releasing density as tension gathers and
                dissipates. Long-form electronic construction intersects with
                physical intensity, where restraint and impact remain closely
                linked and abstraction stays tethered to sensation. Genre
                remains peripheral, treated as material rather than structure.
                Sound leads the process, leaving interpretation to emerge
                through listening, over time.
              </p>
            </div>
          </div>

          {/* Email link */}
          <div className="mt-8 lg:mt-24 text-center">
            <a
              href="mailto:flowgeistmusic@gmail.com"
              className="inline-flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Email flowgeistmusic@gmail.com"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
