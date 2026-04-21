"use client";

import Image from "next/image";
import { useState } from "react";

export default function DesktopLandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const overlayContent: Record<
    string,
    { title: string; description: string; secondaryDescription?: string; image: string }
  > = {
    About: {
      title: "About",
      description:
        "Flowgeist resonates across sound and form through endless definition. Structures surface, loosen, and fall away, allowing material to reorganise in real time. Rhythm acts as a spatial force, contracting and releasing density as tension gathers and dissolves.",
      secondaryDescription:
        "Long-form electronic construction meets physical intensity, where restraint and impact remain closely linked, and abstraction stays tethered to sensation.",
      image: "/artists/pic-negative.jpeg",
    },
    Music: {
      title: "Music",
      description:
        "Long-form electronic construction where rhythm, pressure and release stay in motion.",
      image: "/artists/pic-negative.jpeg",
    },
    Contact: {
      title: "Contact",
      description: "[contacts]",
      image: "/artists/artist3.jpeg",
    },
    Projects: {
      title: "Projects",
      description:
        "Cross-media experiments where image, structure and sound become one spatial language.",
      image: "/artists/art4.jpeg",
    },
  };

  const boxWidth = activeLabel === "About" ? 560 : 420;
  const boxHeight = activeLabel === "About" ? 560 : 420;
  const gap = 18;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : boxWidth + gap * 2;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : boxHeight + gap * 2;
  const boxLeft = Math.min(
    Math.max(gap, mousePosition.x + gap),
    viewportWidth - boxWidth - gap,
  );
  const shouldShiftUp = mousePosition.y + boxHeight / 2 + gap > viewportHeight;
  const preferredTop = shouldShiftUp
    ? mousePosition.y - boxHeight - gap
    : mousePosition.y - boxHeight / 2;
  const boxTop = Math.min(
    Math.max(gap, preferredTop),
    viewportHeight - boxHeight - gap,
  );

  return (
    <main
      className="relative h-screen w-full overflow-hidden bg-black"
      onMouseMove={(event) =>
        setMousePosition({ x: event.clientX, y: event.clientY })
      }
    >
      <Image
        src="/artists.jpeg"
        alt="Flowgeist artists background"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-black/60" />

      {activeLabel && (
        <div
          className="pointer-events-none absolute z-30 border border-white/35 bg-black/70 p-4 backdrop-blur-sm transition-transform duration-75"
          style={{
            width: `${boxWidth}px`,
            left: `${boxLeft}px`,
            top: `${boxTop}px`,
          }}
        >
          <p className="font-pt-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
            {overlayContent[activeLabel].title}
          </p>
          {activeLabel === "Contact" ? (
            <div className="mt-3 border border-black/20 bg-[#BABABA] p-4 text-black/80">
              <p className="text-[19px] font-semibold tracking-[0.03em] text-black/65">
                [contacts]
              </p>
              <div className="mt-5 space-y-5 font-pt-mono text-[12px] font-semibold uppercase tracking-[0.17em]">
                <p>
                  MAIL_
                  <br />
                  <span className="font-alte-haas-bold normal-case tracking-normal text-[19px] text-[#5c5c5c]">
                    flowgeistmusic@gmail.com
                  </span>
                </p>
                <p>
                  _INSTAGRAM
                  <br />
                  <span className="font-alte-haas-bold normal-case tracking-normal text-[19px] text-[#5c5c5c]">
                    @flowgeistx
                  </span>
                </p>
                <p>
                  SOUNDCLOUD --
                  <br />
                  <span className="font-alte-haas-bold normal-case tracking-normal text-[19px] text-[#5c5c5c]">
                    @flowgeistx
                  </span>
                </p>
              </div>
              <Image
                src="/logo-grey.png"
                alt="Flowgeist logo"
                width={170}
                height={170}
                className="ml-auto mt-4 h-auto w-[150px] object-contain"
              />
            </div>
          ) : (
            <>
              <p className="mt-2 font-alte-haas-bold text-[20px] leading-[1.15] text-white/90">
                {overlayContent[activeLabel].description}
              </p>
              {overlayContent[activeLabel].secondaryDescription && (
                <p className="mt-3 font-alte-haas-bold text-[20px] leading-[1.15] text-white/90">
                  {overlayContent[activeLabel].secondaryDescription}
                </p>
              )}
              <Image
                src={overlayContent[activeLabel].image}
                alt={`${overlayContent[activeLabel].title} visual`}
                width={700}
                height={460}
                className="mt-4 h-auto w-full object-cover"
              />
            </>
          )}
        </div>
      )}

      <section className="relative z-10 hidden h-full w-full items-center justify-center md:flex">
        <div className="relative flex h-[420px] w-[420px] items-center justify-center">
          <button
            type="button"
            onMouseEnter={() => setActiveLabel("Music")}
            onMouseLeave={() => setActiveLabel(null)}
            className="absolute left-1/2 top-0 -translate-x-1/2 font-pt-mono text-[11px] uppercase tracking-[0.2em] text-white/85 transition-opacity hover:opacity-100"
          >
            Music
          </button>

          <button
            type="button"
            onMouseEnter={() => setActiveLabel("Contact")}
            onMouseLeave={() => setActiveLabel(null)}
            className="absolute left-0 top-1/2 -translate-y-1/2 font-pt-mono text-[11px] uppercase tracking-[0.2em] text-white/85 transition-opacity hover:opacity-100"
          >
            Contact
          </button>

          <button
            type="button"
            onMouseEnter={() => setActiveLabel("Projects")}
            onMouseLeave={() => setActiveLabel(null)}
            className="absolute right-0 top-1/2 -translate-y-1/2 font-pt-mono text-[11px] uppercase tracking-[0.2em] text-white/85 transition-opacity hover:opacity-100"
          >
            Projects
          </button>

          <Image
            src="/artists/icon.png"
            alt="Flowgeist logo"
            width={500}
            height={700}
            priority
            className="h-auto w-full max-w-[220px] object-contain object-center"
          />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onMouseEnter={() => setActiveLabel("About")}
              onMouseLeave={() => setActiveLabel(null)}
              className="font-pt-mono text-[11px] uppercase tracking-[0.2em] text-white/85 transition-opacity hover:opacity-100"
            >
              About
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center md:hidden">
        <p className="font-pt-mono text-xs uppercase tracking-[0.18em] text-white/85">
          Desktop only
        </p>
      </section>
    </main>
  );
}
