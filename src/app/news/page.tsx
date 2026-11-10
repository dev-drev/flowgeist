import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import NewsSection, { newsLabelClass } from "@/components/NewsSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "News — Flowgeist",
  description: "News and magazine from Flowgeist.",
};

const labelClass = newsLabelClass;

export default function NewsPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 text-black/80 md:px-0">
      <MobileMenu tone="dark" current="news" className="md:hidden" />
      <SiteHeader current="news" />

      <section aria-label="News">
        <NewsSection />
      </section>

      <section aria-label="Magazine" className="md:pb-8">
        <p className={labelClass}>[magazine]</p>
        <article className="mt-8 px-4 md:px-10">
          <div className="border-t border-black/15 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-x-16 md:pt-10">
            <div>
              <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">
                Feature
              </p>
              <h2 className="mt-4 font-alte-haas-bold text-[28px] leading-[1.05] text-black/85 md:text-[44px]">
                A world shaped by an unfolding narrative.
              </h2>
            </div>
            <div className="mt-6 space-y-5 text-justify font-alte-haas-bold text-[14px] font-semibold leading-[1.2] text-[#5c5c5c] md:mt-0 md:text-[18px]">
              <p>
                Flowgeist emerges from a shared inquiry into sound and
                aesthetics. Genre stays peripheral. Meaning stays tethered to
                sensation. The debut album establishes a language that is broad
                in reference and exact in purpose: each style appears because a
                feeling requires it.
              </p>
              <p>
                Trip hop, drum and bass, post punk, breakbeat, EBM, techno and
                modular electronics take their place in sequence. Acoustic
                instruments keep their grain inside the electronic production,
                and every track changes the terms set by the one before it.
                The record moves from matter to memory, giving passing states a
                place to stay.
              </p>
              <p>
                Conceived by Marco Bruno and Velvet May, the project treats
                electronic music as a cinematic field. The short film and the
                live debut at Kantine am Berghain extend that field out of the
                studio and into a room.
              </p>
              <Link
                href="/music"
                className="inline-block pt-2 font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70 transition hover:text-black"
              >
                Album and film →
              </Link>
            </div>
          </div>
        </article>
      </section>
      <SiteFooter className="-mx-2 md:mx-0" />
    </main>
  );
}
