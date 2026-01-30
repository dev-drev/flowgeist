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
  const [socialRailVisible, setSocialRailVisible] = useState(false);
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

  // Hide loader after 3 seconds, then reveal social rail for entrance animation
  useEffect(() => {
    const hideLoader = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(hideLoader);
  }, []);
  useEffect(() => {
    if (!isLoading) {
      const reveal = setTimeout(() => setSocialRailVisible(true), 150);
      return () => clearTimeout(reveal);
    }
  }, [isLoading]);

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

      {/* Social rail — destra, verticale, attaccata al bordo */}
      <div
        className="fixed right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-end gap-8 pr-4 lg:pr-6"
        aria-label="Social links"
      >
        <div className="flex flex-col items-center gap-8">
          <a
            href="mailto:flowgeistmusic@gmail.com"
            className={`social-icon-link flex items-center justify-center text-white/60 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-1" : "opacity-0"}`}
            aria-label="Email flowgeistmusic@gmail.com"
          >
            <svg
              className="h-6 w-6 lg:h-7 lg:w-7"
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
            href="https://www.instagram.com/flowgeistmusic"
            target="_blank"
            rel="noopener noreferrer"
            className={`social-icon-link flex items-center justify-center text-white/60 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-2" : "opacity-0"}`}
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
            className={`social-icon-link flex items-center justify-center text-white/60 hover:text-white ${socialRailVisible ? "social-rail-enter social-rail-enter-delay-3" : "opacity-0"}`}
            aria-label="SoundCloud flowgeist"
          >
            <svg
              className="h-6 w-6 lg:h-7 lg:w-7"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.054-.049-.1-.099-.1m-.899.098c-.06 0-.105.049-.105.11l-.188 2.154.188 2.104c0 .061.045.105.105.105.058 0 .104-.044.104-.105l.199-2.104-.199-2.154c0-.061-.046-.11-.104-.11m1.762-1.941c-.082 0-.152.063-.159.145l-.224 4.068.224 3.996c.007.082.077.145.159.145.079 0 .15-.063.156-.145l.248-3.996-.248-4.068c-.006-.082-.077-.145-.156-.145m.899 1.3c-.075 0-.135.06-.142.135l-.199 2.767.199 2.715c.007.075.067.135.142.135.073 0 .134-.06.141-.135l.211-2.715-.211-2.767c-.007-.075-.068-.135-.141-.135m.899.188c-.074 0-.135.06-.141.134l-.17 2.579.17 2.527c.006.074.067.134.141.134.073 0 .134-.06.14-.134l.181-2.527-.181-2.579c-.006-.074-.067-.134-.14-.134m.945-.188c-.091 0-.166.074-.174.165l-.157 2.767.157 2.715c.008.091.083.165.174.165.09 0 .165-.074.173-.165l.166-2.715-.166-2.767c-.008-.091-.083-.165-.173-.165m.899 0c-.09 0-.165.074-.173.165l-.148 2.767.148 2.715c.008.091.083.165.173.165.09 0 .165-.074.173-.165l.157-2.715-.157-2.767c-.008-.091-.083-.165-.173-.165m.944.188c-.082 0-.15.067-.157.149l-.14 2.579.14 2.527c.007.082.075.149.157.149.079 0 .149-.067.156-.149l.148-2.527-.148-2.579c-.007-.082-.077-.149-.156-.149m.899.093c-.082 0-.149.068-.156.15l-.131 2.486.131 2.434c.007.082.074.15.156.15.078 0 .148-.068.155-.15l.14-2.434-.14-2.486c-.007-.082-.077-.15-.155-.15m.945-.093c-.088 0-.158.072-.165.16l-.122 2.434.122 2.383c.007.088.077.16.165.16.086 0 .157-.072.164-.16l.131-2.383-.131-2.434c-.007-.088-.078-.16-.164-.16m.899 0c-.087 0-.157.072-.165.16l-.113 2.434.113 2.383c.008.088.078.16.165.16.086 0 .157-.072.164-.16l.122-2.383-.122-2.434c-.007-.088-.078-.16-.164-.16m4.39-2.434c-.166 0-.316.063-.431.165-.302.273-.494.65-.494 1.069 0 .418.192.795.494 1.068.115.102.265.165.431.165.166 0 .316-.063.431-.165.302-.273.494-.65.494-1.068 0-.419-.192-.796-.494-1.069-.115-.102-.265-.165-.431-.165m-.035.3c.098 0 .188.038.256.1.223.199.364.475.364.769 0 .295-.141.571-.364.769a.353.353 0 01-.256.1.353.353 0 01-.256-.1c-.223-.198-.364-.474-.364-.769 0-.294.141-.57.364-.769a.353.353 0 01.256-.1m.165 1.365c.33 0 .642.128.875.36.233.231.36.539.36.865 0 .326-.127.634-.36.865a1.226 1.226 0 01-.875.36 1.226 1.226 0 01-.875-.36 1.211 1.211 0 01-.36-.865c0-.326.128-.634.36-.865.233-.231.545-.36.875-.36m-.035.3c-.205 0-.395.08-.538.224a.756.756 0 00-.224.538c0 .205.08.395.224.538a.756.756 0 00.538.224.756.756 0 00.538-.224.756.756 0 00.224-.538.756.756 0 00-.224-.538.756.756 0 00-.538-.224m.634-2.676v-.002c-.264 0-.514.052-.75.152-.404.17-.75.427-1.006.75-.227.291-.36.634-.39.99-.007.086-.011.173-.011.26v.022c0 .086.004.173.011.259.03.357.163.7.39.991.256.323.602.58 1.006.75.236.1.486.152.75.152h.002c.263 0 .513-.052.749-.152.404-.17.75-.427 1.006-.75.227-.291.36-.634.39-.991.007-.086.011-.173.011-.259v-.022c0-.087-.004-.174-.011-.26-.03-.356-.163-.699-.39-.99-.256-.323-.602-.58-1.006-.75a2.195 2.195 0 00-.749-.152m.035 2.717c-.098 0-.188-.038-.256-.1a1.078 1.078 0 01-.364-.769c0-.294.141-.57.364-.769a.353.353 0 01.256-.1c.098 0 .188.038.256.1.223.199.364.475.364.769 0 .294-.141.57-.364.769a.353.353 0 01-.256.1" />
            </svg>
          </a>
        </div>
        <div
          className="absolute right-0 top-1/2 h-28 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/25 to-transparent"
          aria-hidden
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center w-full h-full min-h-screen py-16 lg:py-0">
        <div className="px-6 sm:px-12 lg:px-20 w-full max-w-4xl mx-auto">
          {/* Layout: icon → testo → flowhite — spaziatura uniforme */}
          <div className="flex flex-col items-center justify-center gap-16 lg:gap-20">
            {/* Prima immagine — occupa h-screen */}
            <div className="flex-shrink-0 w-full h-screen flex items-center justify-center">
              <Image
                src="/artists/icon.png"
                alt="flowgeist"
                width={500}
                height={700}
                quality={100}
                className="w-full h-full max-w-[280px] object-contain"
                priority
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            </div>

            {/* Testo centrato, più largo */}
            <div className="w-full max-w-3xl mx-auto text-center h-screen flex flex-col items-center justify-evenly  pt-10">
              <p className="text-white/90 font-grotesque text-base sm:text-lg lg:text-[17px] leading-relaxed text-justify">
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
              <div className="flex-shrink-0 w-full max-w-2xl flex flex-col items-center justify-center gap-16">
                <div className="flex-1 flex justify-center max-w-[300px]">
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
                    className="relative w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full border border-white/20 overflow-hidden hover:border-white/80 transition-all duration-300 cursor-pointer flex-shrink-0 group"
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
                    className="relative w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full border border-white/20 overflow-hidden hover:border-white/80 transition-all duration-300 cursor-pointer flex-shrink-0 group"
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

            {/* Terza immagine + quadrati artisti (X e triangolo) a destra */}
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
