"use client";

import { useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";
import { getFeaturedArtists, Artist } from "@/lib/artistsConfig";

export default function Home() {
  const [videoSource, setVideoSource] = useState("");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
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
        <div
          className="absolute inset-0"
          style={{
            zIndex: 3,
            backgroundColor: "#121212f6",
            mixBlendMode: "multiply",
          }}
        ></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center w-full h-full min-h-screen">
        <div className="px-8 w-full max-w-7xl mx-auto py-20">
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

          {/* Immagini artisti piccole e arrotondate */}
          <div className="mt-10 lg:mt-24 flex items-center justify-center gap-4 lg:absolute bottom-15 left-0 right-0">
            {artists.map((artist, index) => (
              <button
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className="group relative overflow-hidden rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                aria-label={`View ${artist.name} bio`}
              >
                <Image
                  src={artist.image}
                  alt={artist.name}
                  width={50}
                  height={50}
                  className={`w-14 h-14 lg:w-16 lg:h-16 object-cover rounded-full grayscale ${
                    index === 0 ? "object-top" : ""
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="mt-12 lg:mt-24 text-center">
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

      {/* Modal Biografia Artista */}
      {selectedArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="relative bg-zinc-900/95 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
