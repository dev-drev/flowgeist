"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import MobileFadeIn from "@/components/MobileFadeIn";

type GalleryItem = {
  src: string;
  alt: string;
  frame: string;
  sizes: string;
  fit?: "cover" | "contain";
  position?: string;
};

const KANTINE_FILES = [
  "DSCF4977.jpg",
  "DSCF4750.jpg",
  "DSCF4782.jpg",
  "DSCF4792.jpg",
  "DSCF4803.jpg",
  "DSCF4810.jpg",
  "DSCF4821.jpg",
  "DSCF4875.jpg",
  "DSCF4884.jpg",
  "DSCF4892.jpg",
  "DSCF4907.jpg",
  "DSCF4915.jpg",
  "DSCF4936.jpg",
  "DSCF4953.jpg",
  "DSCF4974.jpg",
  "DSCF4980.jpg",
  "DSCF4993.jpg",
  "DSCF5002.jpg",
  "DSCF5018.jpg",
  "DSCF5021.jpg",
  "DSCF5046.jpg",
];

const KANTINE_PORTRAIT = new Set(["DSCF4792.jpg"]);

const kantineItems: GalleryItem[] = KANTINE_FILES.map((file, index) => {
  const portrait = KANTINE_PORTRAIT.has(file);
  const wide = !portrait && index % 5 === 0;
  return {
    src: `/pics-kantine/${file}`,
    alt: "Flowgeist, Kantine am Berghain",
    frame: portrait
      ? "col-span-1 aspect-[2/3] md:col-span-4"
      : wide
        ? "col-span-2 aspect-[3/2] md:col-span-8"
        : "col-span-1 aspect-[3/2] md:col-span-4",
    sizes: wide
      ? "(max-width: 768px) 100vw, 66vw"
      : "(max-width: 768px) 50vw, 34vw",
  };
});

const GALLERY: GalleryItem[] = kantineItems;

export default function GallerySection({
  active,
  limit,
}: {
  active: boolean;
  limit?: number;
}) {
  const items = limit ? GALLERY.slice(0, limit) : GALLERY;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") {
        setOpenIndex((current) =>
          current === null ? current : (current + 1) % items.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setOpenIndex((current) =>
          current === null
            ? current
            : (current - 1 + items.length) % items.length,
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, items.length]);

  const step = (direction: -1 | 1) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + direction + items.length) % items.length;
    });
  };

  const openItem = openIndex === null ? null : items[openIndex];

  return (
    <section id="gallery" aria-label="Gallery" className="pb-8">
      <MobileFadeIn active={active} className="w-full">
        <p className="ml-10 pt-8 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:ml-0 md:px-10 md:pt-10 md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
          [gallery]
        </p>
      </MobileFadeIn>
      <MobileFadeIn active={active} delay={40} className="w-full">
        <div className="mt-4 grid grid-cols-2 gap-1.5 px-4 sm:px-8 md:mt-6 md:grid-cols-12 md:gap-3 md:px-10">
          {items.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setOpenIndex(index)}
              className={`group relative cursor-pointer overflow-hidden bg-[#2a2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
                items.length === 1
                  ? "col-span-2 aspect-[3/2] md:col-span-12"
                  : item.frame
              }`}
              aria-label={`Open ${item.alt}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={item.sizes}
                className={`transition-opacity duration-500 group-hover:opacity-90 ${
                  item.fit === "contain" ? "object-contain p-6" : "object-cover"
                } ${item.position ?? ""}`}
              />
            </button>
          ))}
        </div>
      </MobileFadeIn>

      {mounted && openItem && openIndex !== null
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95"
              role="dialog"
              aria-modal="true"
              aria-label={openItem.alt}
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false;
                  return;
                }
                setOpenIndex(null);
              }}
              onTouchStart={(event) => {
                touchX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                if (touchX.current === null) return;
                const endX = event.changedTouches[0]?.clientX;
                if (endX === undefined) return;
                const delta = endX - touchX.current;
                if (delta > 48) {
                  swiped.current = true;
                  step(-1);
                } else if (delta < -48) {
                  swiped.current = true;
                  step(1);
                }
                touchX.current = null;
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Close gallery"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path
                    d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-white/70 transition hover:text-white sm:left-5"
                aria-label="Previous image"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path
                    d="M13.5 5.5L8 11l5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-white/70 transition hover:text-white sm:right-5"
                aria-label="Next image"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path
                    d="M8.5 5.5L14 11l-5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <figure
                className="relative h-[min(78vh,860px)] w-[min(92vw,1100px)]"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  key={openItem.src}
                  src={openItem.src}
                  alt={openItem.alt}
                  fill
                  sizes="92vw"
                  className="object-contain"
                  priority
                />
              </figure>

              <p
                className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 px-16 text-center font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75"
                onClick={(event) => event.stopPropagation()}
              >
                <span>
                  {String(openIndex + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </span>
                <span className="text-white/40">·</span>
                <span className="normal-case tracking-normal">{openItem.alt}</span>
              </p>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
