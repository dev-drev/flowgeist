"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  useEffect(() => {
    document.documentElement.classList.toggle("home-page", !showAbout);
    document.body.classList.toggle("home-page", !showAbout);
    return () => {
      document.documentElement.classList.remove("home-page");
      document.body.classList.remove("home-page");
    };
  }, [showAbout]);

  return (
    <main className="fixed inset-0 h-[100vh] max-h-[100dvh] w-full ">
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          zIndex: 3,
          backgroundColor: "#121212f6",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 w-full h-full max-h-[100vh]">
        <div
          className={`absolute inset-0 flex items-center justify-center px-6 sm:px-12 lg:px-20 transition-all duration-500 ${
            showAbout
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
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

        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showAbout ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="About"
        >
          <div className="flex h-full w-full overflow-hidden">
            <div className="mx-auto flex h-full w-full flex-col">
              <header
                className={`w-full   bg-[#d9d8d5] pl-4  text-black/80 sm:px-l transition-all duration-500 ${
                  showAbout
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-3 scale-95"
                }`}
              >
                <div className="grid w-full grid-cols-1 lg:grid-cols-[0.927fr_0.75fr_0.80fr]">
                  <button
                    type="button"
                    onClick={() => setShowAbout(false)}
                    className="inline-flex items-center rounded-md pt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                    aria-label="Torna al logo iniziale"
                  >
                    <Image
                      src="/flowgeist.png"
                      alt="Flowgeist"
                      width={200}
                      height={56}
                      className="h-auto  sm:w-[500px] object-contain"
                    />
                  </button>
                  <div className="flex h-full w-full items-end  border-b-20 lg:border-black/45">
                    <div className="mx-4 h-[56px] flex-1 border-black/40 sm:mx-8 sm:h-[72px]" />
                    <div className="flex h-full items-end justify-end bg-[#d9d8d5]">
                      <p className="px-5 py-4 text-[23px] font-semibold text-black/65"></p>
                    </div>
                  </div>
                  <div className="flex h-full w-full items-end border-r-20 border-l-5 lg:border-black/45">
                    <div className="mx-4 h-[56px] flex-1  border-black/40 sm:mx-8 sm:h-[72px]" />
                    <div className="flex h-full items-end justify-end bg-[#d9d8d5]">
                      <p className="px-5 py-4 text-[23px] font-semibold text-black/65">
                        [Berlin, DE]
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div
                className={`flex-1 overflow-y-auto about-scroll bg-[#d9d8d5] text-black/85 transition-all duration-500 delay-100 ${
                  showAbout
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-4 scale-95"
                }`}
              >
                <section className="grid min-h-[65vh] grid-cols-1 lg:grid-cols-[0.95fr_1.55fr]">
                  <div className="flex h-full flex-col gap-8 p-5 sm:p-8">
                    <div className="space-y-6">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/65">
                        A PROJECT CURATED BY /
                        <br />
                        Marco Bruno and Velvet May.
                      </p>
                      <Image
                        src="/logo-grey.png"
                        alt="Flowgeist symbol"
                        width={150}
                        height={150}
                        className="h-auto w-[84px] sm:w-[110px] object-contain pt-5 pb-5"
                      />
                      <div className="space-y-12 text-[18px] font-semibold leading-[1.16] text-black/55 text-justify">
                        <p className="pr-20">
                          Flowgeist resonates across sound and form through
                          endless definition. Structures surface, loosen, and
                          fall away, allowing material to reorganise in real
                          time. Rhythm acts as a spatial force, contracting and
                          releasing density as tension gathers and dissolves.
                        </p>
                        <p className="pl-0 pl-20">
                          Long-form electronic construction meets physical
                          intensity, where restraint and impact remain closely
                          linked, and abstraction stays tethered to sensation.
                          Genre remains peripheral, treated as material rather
                          than structure. Sound leads the process, leaving
                          meaning to emerge gradually through listening.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[320px] border-t border-white/20 lg:h-full lg:border-l lg:border-t-0">
                    <Image
                      src="/artists.jpeg"
                      alt="Flowgeist visual"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain object-top"
                    />
                  </div>
                </section>

                <section className="border-t border-black/15 px-5 py-8 sm:px-8">
                  <div className="mb-6 flex flex-wrap gap-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-black/65">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-70"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://soundcloud.com"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-70"
                    >
                      SoundCloud
                    </a>
                    <a
                      href="https://ra.co"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-70"
                    >
                      Resident Advisor
                    </a>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative h-[260px] bg-black/5">
                      <Image
                        src="/logo-black.png"
                        alt="Flowgeist logo black"
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="relative h-[260px] bg-black/5">
                      <Image
                        src="/logo-grey.png"
                        alt="Flowgeist logo grey"
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
