import type { Metadata } from "next";
import Image from "next/image";
import AlbumPlayer from "@/components/AlbumPlayer";
import MobileMenu from "@/components/MobileMenu";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Music — Flowgeist",
  description: "Flowgeist music.",
};

const LISTEN = [
  {
    label: "Bandcamp",
    href: "https://flowgeist.bandcamp.com/album/flowgeist-evighet007",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/flowgeist/flowgeist-evighet007",
  },
];

const labelClass =
  "text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]";

const proseClass =
  "text-justify font-alte-haas-bold text-[14px] font-semibold leading-[1.2] text-[#5c5c5c] md:text-[18px]";

const linkClass =
  "font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70 transition hover:text-black";

const splitGrid =
  "mt-6 grid items-start gap-8 md:mt-8 md:grid-cols-2 md:gap-x-12 lg:gap-x-14";

export default function MusicPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 pt-1 text-black/80 md:px-0">
      <MobileMenu tone="dark" current="music" className="md:hidden" />
      <SiteHeader current="music" />

        <section aria-label="Music" className="px-4 pt-8 md:px-10 md:pt-12">
          <p className={labelClass}>[music]</p>

          <div className={splitGrid}>
            <div className="md:sticky md:top-40">
              <Image
                src="/news/evighet007.jpg"
                alt="Flowgeist [EVIGHET007] album cover"
                width={1200}
                height={1200}
                sizes="(min-width: 768px) 46vw, 100vw"
                className="h-auto w-full"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">
                Evighet Records · 06.11.2026
              </p>
              <h1 className="mt-3 font-alte-haas-bold text-[28px] leading-none text-black/85 md:text-[32px] xl:text-[36px]">
                Flowgeist [EVIGHET007]
              </h1>
              <p className={`mt-5 max-w-xl ${proseClass}`}>
                The debut album. Ten tracks, from Molecules to Meaningful Quest.
                A marbled heavyweight 12-inch, edition of 300, and digital in
                24-bit.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-b border-black/15 pb-5">
                {LISTEN.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    {item.label} →
                  </a>
                ))}
              </div>

              <AlbumPlayer />
            </div>
          </div>
        </section>

        <section
          aria-label="Short film"
          className="mt-16 border-t border-black/15 px-4 pb-24 pt-8 md:mt-20 md:px-10 md:pb-36 md:pt-12"
        >
          <p className={labelClass}>[short film]</p>
          <div className={splitGrid}>
            <div className="overflow-hidden bg-black">
              <iframe
                title="Flowgeist - A Short Film"
                src="https://www.youtube-nocookie.com/embed/U9zLkFAWaa4"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div>
              <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">
                Film
              </p>
              <h2 className="mt-3 font-alte-haas-bold text-[28px] leading-none text-black/85 md:text-[32px] xl:text-[36px]">
                A Short Film
              </h2>
              <p className={`mt-5 max-w-xl ${proseClass}`}>
                Image and sound carry the same narrative: dense atmospheres,
                fractured rhythm, and a voice that stays in the frame.
              </p>
            </div>
          </div>
        </section>
      <SiteFooter className="-mx-2 md:mx-0" />
    </main>
  );
}
