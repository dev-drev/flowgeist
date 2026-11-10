"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GallerySection from "@/components/GallerySection";
import LandingVideo from "@/components/LandingVideo";
import LinksList from "@/components/LinksList";
import MobileFadeIn from "@/components/MobileFadeIn";
import MobileMenu from "@/components/MobileMenu";
import SiteHeader from "@/components/SiteHeader";
import SiteNav from "@/components/SiteNav";
import { LINK_SECTIONS } from "@/lib/linksConfig";
import { useTracking } from "@/lib/useTracking";

const desktopGrid = "md:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]";
const hiddenTicketIds = new Set([
  "resident-advisor",
  "eventbrite",
  "bandsintown",
]);
const ticketSections = LINK_SECTIONS.filter((section) => section.id !== "album").map(
  (section) => ({
    ...section,
    links: section.links.filter((link) => !hiddenTicketIds.has(link.id)),
  }),
);
const albumSection = LINK_SECTIONS.find((section) => section.id === "album");
const musicSection = albumSection ? { ...albumSection, title: undefined } : null;
const ticketsSection = ticketSections[0];
const eventCardSection = ticketsSection
  ? {
      ...ticketsSection,
      title: undefined,
      links: ticketsSection.links.filter((link) => link.id === "berghain"),
    }
  : null;

const debutCopy =
  "Conceived by Berlin-based artists Marco Bruno and Velvet May, the project emerges from a shared inquiry into sound and aesthetics. Approaching electronic music as a cinematic field, Flowgeist moves through dense atmospheres, fractured rhythms and sculptural sound design. Its language develops through detail: genre remains peripheral, meaning is tethered to sensation, drawing the listener into a world shaped by an unfolding narrative.";

const tracesCopy =
  "Traces of trip hop, post punk, industrial electronics and breakbeat appear like residues within a wider dramaturgy, where rhythm, texture and voice carry the album's internal narrative into physical space. The performance marks the first live incarnation of the record, opening its layered studio architecture to the immediacy of the room.";

const desktopProse =
  "text-justify font-alte-haas-bold text-[20px] font-semibold leading-[1.16] text-[#5c5c5c] 2xl:text-[26px] 3xl:text-[32px]";

const desktopAboutProse =
  "text-justify font-alte-haas-bold text-[22px] font-semibold leading-[1.18] text-[#5c5c5c] xl:text-[26px] 2xl:text-[30px]";

const GALLERY_PREVIEW = 1;

function ContactsBlock() {
  return (
    <>
      <p className="ml-10 pt-4 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:ml-0 md:pt-0 md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
        [contacts]
      </p>
      <div className="b-6 font-pt-mono flex w-full flex-col flex-wrap bg-[#515151] pb-3 text-[12px] font-semibold tracking-[0.2em] text-black/65 sm:text-[13px] md:bg-transparent md:pb-0 md:text-[12px]">
        <div className="ml-8 flex h-full flex-col gap-6 bg-[#BABABA] p-4 md:ml-0 md:flex-row md:flex-wrap md:gap-x-16 md:gap-y-6 md:bg-transparent md:p-0 md:pt-6">
          <a
            href="mailto:flowgeistmusic@gmail.com"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            MAIL_ <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] font-semibold normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              flowgeistmusic@gmail.com
            </span>
          </a>
          <a
            href="https://www.instagram.com/flowgeistx/"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            _INSTAGRAM <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              @flowgeistx
            </span>
          </a>
          <a
            href="https://soundcloud.com/flowgeistx"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            SOUNDCLOUD --
            <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              @flowgeistx
            </span>
          </a>
        </div>
      </div>
    </>
  );
}

function DesktopLanding() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const [showAbout, setShowAbout] = useState(false);

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "about" || window.location.hash === "#about") {
      setShowAbout(true);
    }
  }, []);

  useEffect(() => {
    if (!showAbout && aboutRef.current) aboutRef.current.scrollTop = 0;
  }, [showAbout]);

  const openHome = () => {
    setShowAbout(false);
    if (window.location.search || window.location.hash) {
      window.history.replaceState(null, "", "/");
    }
  };

  const openAbout = () => {
    setShowAbout(true);
    window.history.replaceState(null, "", "/?view=about");
  };

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!showAbout && event.deltaY > 28) setShowAbout(true);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [showAbout]);

  return (
    <div className="fixed inset-0 z-30 hidden bg-black md:block">
      <LandingVideo active />
      <div className="absolute inset-0 bg-black/50" />
      <div
        aria-hidden={showAbout}
        className={`absolute inset-0 z-10 flex items-center justify-center px-8 transition-opacity duration-300 ease-out ${
          showAbout ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="grid h-full w-full grid-rows-[1fr_auto_1fr] justify-items-center">
          <div />
          <button
            type="button"
            onClick={openAbout}
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Open about"
          >
            <Image
              src="/artists/icon.png"
              alt="Flowgeist"
              width={500}
              height={700}
              priority
              className="h-auto w-[min(30vw,340px)] object-contain transition-opacity hover:opacity-90"
            />
          </button>
          <SiteNav
            tone="light"
            current="home"
            onAbout={openAbout}
            className="justify-center self-center"
          />
        </div>
      </div>
      <div
        ref={aboutRef}
        aria-label="About"
        aria-hidden={!showAbout}
        className={`absolute inset-0 z-20 bg-[#BABABA] text-black/80 transition-opacity duration-300 ease-out ${
          showAbout
            ? "pointer-events-auto overflow-y-auto opacity-100"
            : "pointer-events-none overflow-hidden opacity-0"
        }`}
      >
        <div className="flex min-h-full flex-col">
          <SiteHeader current="about" onHome={openHome} onAbout={openAbout} />
          <div className="px-4 pb-20 pt-10 md:px-10 md:pb-24 md:pt-12">
            <p className="text-[22px] font-semibold tracking-[0.10px] text-black/65 2xl:text-[28px]">
              [about]
            </p>
            <div className="mt-8 grid items-start gap-x-16 gap-y-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(26rem,40rem)]">
              <img
                src="/artists.jpeg"
                alt="Marco Bruno and Velvet May"
                className="w-full object-contain"
              />
              <div className="min-w-0 xl:pt-1">
                <p className="font-pt-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-black/45">
                  A project curated by
                </p>
                <p className="mt-3 font-alte-haas-bold text-[18px] leading-tight text-black/85 xl:text-[20px]">
                  Marco Bruno and Velvet May
                </p>
                <p className={`mt-8 ${desktopAboutProse}`}>{debutCopy}</p>
                <p className={`mt-8 ${desktopAboutProse}`}>{tracesCopy}</p>
                {eventCardSection?.links[0] ? (
                  <a
                    href={eventCardSection.links[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-12 inline-block font-pt-mono text-[12px] font-semibold uppercase tracking-[0.26em] text-black/70 transition hover:text-black"
                  >
                    Kantine am Berghain →
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [onHero, setOnHero] = useState(true);
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnHero(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.45));
      },
      { threshold: [0, 0.45, 1] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("view");
    const id =
      fromQuery === "about" || fromQuery === "gallery" || fromQuery === "music"
        ? fromQuery
        : window.location.hash.replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
    if (fromQuery) {
      window.history.replaceState(null, "", `/#${id}`);
    }
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
    <DesktopLanding />
    <main className="w-full bg-[#BABABA] text-black/80 md:hidden">
      <MobileMenu
        tone={onHero ? "light" : "dark"}
        current="home"
        className="md:hidden"
        onHome={() => scrollTo("top")}
        onAbout={() => scrollTo("about")}
      />

      <section
        id="top"
        ref={heroRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-black"
        aria-label="Landing"
      >
        <LandingVideo active />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.42),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8">
          <Image
            src="/artists/icon.png"
            alt="Flowgeist"
            width={500}
            height={700}
            priority
            className="h-auto w-[min(62vw,280px)] object-contain md:w-[min(30vw,340px)]"
          />
        </div>
      </section>

      <section id="about" aria-label="About" className="scroll-mt-6 bg-[#BABABA]">
        <header className="w-full bg-[#BABABA] pl-4 pr-16 text-black/80 md:border-b md:border-black/25 md:px-10">
          <MobileFadeIn className="w-full md:contents">
            <div className={`flex w-full grid-cols-1 items-end md:grid ${desktopGrid}`}>
              <a
                href="#top"
                className="inline-flex min-w-0 max-w-[calc(100%-3.25rem)] items-center rounded-md pt-6 md:max-w-none md:py-8"
                aria-label="Back to landing"
              >
                <Image
                  src="/flowgeist.png"
                  alt="Flowgeist"
                  width={200}
                  height={56}
                  className="h-auto w-full max-w-[320px] object-contain sm:max-w-[550px] md:max-w-[440px]"
                />
              </a>
              <div className="hidden h-full items-end justify-end pb-5 pr-16 md:flex">
                <p className="text-[23px] font-semibold text-black/65">
                  [Berlin, DE]
                </p>
              </div>
            </div>
          </MobileFadeIn>
        </header>

        <div className="bg-[#BABABA] text-black/85">
          <section className={`grid grid-cols-1 items-start md:gap-x-12 md:px-10 md:pt-10 ${desktopGrid}`}>
            <div className="flex h-full flex-col gap-8 md:col-start-1 md:col-end-2">
              <div className="relative">
                <MobileFadeIn className="w-full md:contents">
                  <p className="p-5 font-pt-mono text-[10px] font-semibold uppercase text-black/65 sm:p-8 md:p-0 md:text-[12px]">
                    A PROJECT CURATED BY /
                    <br />
                    <span className="pl-10 font-alte-haas-bold text-[16px] normal-case tracking-[0.03px] text-[#5c5c5c] md:text-[20px]">
                      Marco Bruno and Velvet May.
                    </span>
                  </p>
                </MobileFadeIn>
                <MobileFadeIn delay={30} className="block w-full md:contents">
                  <div className="relative z-20 block bg-[#5a5a5a] md:hidden">
                    <img
                      src="/artists.jpeg"
                      style={{
                        objectFit: "contain",
                        objectPosition: "right top",
                      }}
                      className="ml-auto h-[100%] w-[100%] object-contain"
                      alt="Flowgeist"
                    />
                    <div className="h-full w-full">
                      <div className="h-full bg-[#BABABA]">
                        <MobileFadeIn delay={50} className="w-full">
                          <p className="px-4 pb-5 pt-6 text-justify font-alte-haas-bold text-[14px] font-semibold leading-[1.16] text-[#5c5c5c]">
                            {debutCopy}
                          </p>
                        </MobileFadeIn>
                        <MobileFadeIn delay={70} className="w-full">
                          <div className="w-full md:hidden">
                            <LinksList sections={ticketSections} className="py-4" />
                          </div>
                        </MobileFadeIn>
                        <MobileFadeIn delay={90} className="w-full">
                          <p className="px-4 pb-5 pt-2 text-justify font-alte-haas-bold text-[14px] font-semibold leading-[1.16] text-[#5c5c5c] md:hidden">
                            {tracesCopy}
                          </p>
                        </MobileFadeIn>
                        <MobileFadeIn delay={110} className="w-full">
                          <div className="flex w-full max-w-full items-center justify-between gap-4 overflow-hidden px-4 md:hidden">
                            <Image
                              src="/artists/pic-negative.jpeg"
                              alt="Flowgeist"
                              width={520}
                              height={520}
                              className="h-auto w-full min-w-0 object-contain"
                            />
                          </div>
                        </MobileFadeIn>
                        <MobileFadeIn delay={130} className="w-full">
                          <div className="relative z-20 md:hidden">
                            <Image
                              src="/logo-grey.png"
                              alt=""
                              width={600}
                              height={600}
                              aria-hidden
                              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[75vh] w-[75vw] max-w-none -translate-x-[13%] -translate-y-[45.5%] object-contain opacity-40"
                            />
                            <p className="relative z-10 px-4 pb-2 pt-6 text-justify font-alte-haas-bold text-[14px] font-semibold leading-[1.16] text-[#5c5c5c]">
                              Marco Bruno is a multidisciplinary storyteller
                              whose releases span Helena Hauff&apos;s Return
                              to Disorder, James Ruskin&apos;s Blueprint and
                              Ben Sims&apos; labels. His work has been
                              presented on stages and platforms including TEDx
                              and Tresor, and he is the founder of Evighet
                              Records, a platform dedicated to identity,
                              transformation and sonic evolution.
                              <br />
                              <br />
                              Velvet May is a live performer, singer and music
                              producer whose practice moves through industrial
                              textures, body-driven tension and rock-inflected
                              intensity. Blending experimentation with
                              meticulous sound design, his work is raw,
                              detailed and sharply controlled. He has released
                              music on labels including Veyl, Tears on Waves
                              and She Lost Kontrol.
                            </p>
                          </div>
                        </MobileFadeIn>
                      </div>
                    </div>
                  </div>
                </MobileFadeIn>

                <div className="relative z-[1] hidden md:block">
                  <Image
                    src="/logo-grey.png"
                    alt="Flowgeist symbol"
                    width={150}
                    height={150}
                    className="mb-8 mt-8 hidden h-auto w-[112px] object-contain md:block"
                  />
                  <p className={desktopProse} style={{ letterSpacing: "0.03px" }}>
                    Marco Bruno is a multidisciplinary storyteller whose
                    releases span Helena Hauff&apos;s Return to Disorder, James
                    Ruskin&apos;s Blueprint and Ben Sims&apos; labels. His work
                    has been presented on stages and platforms including TEDx
                    and Tresor, and he is the founder of Evighet Records, a
                    platform dedicated to identity, transformation and sonic
                    evolution.
                  </p>
                  <p
                    className={`mt-6 ${desktopProse}`}
                    style={{ letterSpacing: "0.03px" }}
                  >
                    Velvet May is a live performer, singer and music producer
                    whose practice moves through industrial textures,
                    body-driven tension and rock-inflected intensity. Blending
                    experimentation with meticulous sound design, his work is
                    raw, detailed and sharply controlled. He has released music
                    on labels including Veyl, Tears on Waves and She Lost
                    Kontrol.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative hidden min-w-0 md:col-start-2 md:col-end-3 md:block">
              <img
                src="/artists.jpeg"
                className="aspect-[3/2] w-full object-cover object-center"
                alt="Flowgeist"
              />
              <p className={`pt-6 ${desktopProse}`} style={{ letterSpacing: "0.03px" }}>
                Flowgeist resonates across sound and form through endless
                definition. Structures surface, loosen, and fall away, allowing
                material to reorganise in real time. Rhythm acts as a spatial
                force, contracting and releasing density as tension gathers and
                dissolves.
              </p>
              <p className={`mt-6 ${desktopProse}`} style={{ letterSpacing: "0.03px" }}>
                {tracesCopy}
              </p>
            </div>
          </section>

          <section className="hidden px-10 pb-4 pt-12 md:block">
            <div className="relative aspect-[3/2] max-h-[78vh] w-full overflow-hidden">
              <Image
                src="/artists/pic-negative.jpeg"
                alt="Flowgeist"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </section>
        </div>
      </section>

      <section id="gallery" aria-label="Gallery" className="scroll-mt-6 bg-[#BABABA]">
        <GallerySection active limit={GALLERY_PREVIEW} />
        <div className="flex justify-center px-4 pb-14 md:justify-start md:px-10 md:pb-16 md:pt-2">
          <Link
            href="/gallery"
            className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-black/70 transition hover:text-black"
          >
            See full gallery →
          </Link>
        </div>
      </section>

      <section id="music" aria-label="Music" className="scroll-mt-6 bg-[#BABABA] pb-10 md:pb-16">
        <div className="md:hidden">
          <p className="ml-10 pt-4 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px]">
            [music]
          </p>
          {musicSection ? (
            <LinksList sections={[musicSection]} className="mt-4 py-2" />
          ) : null}
        </div>

        <div className="hidden md:grid md:grid-cols-2 md:items-start md:gap-x-12 md:px-10 md:pt-4">
          <div>
            <p className="text-[22px] font-semibold tracking-[0.10px] text-black/65 2xl:text-[28px] 3xl:text-[34px]">
              [music]
            </p>
            {musicSection ? (
              <LinksList
                sections={[musicSection]}
                align="start"
                className="mt-6 px-0 py-0 md:max-w-xl"
              />
            ) : null}
          </div>
          <div>
            <p className="text-[22px] font-semibold tracking-[0.10px] text-black/65 2xl:text-[28px] 3xl:text-[34px]">
              [events]
            </p>
            <p className={`mt-6 ${desktopProse}`} style={{ letterSpacing: "0.03px" }}>
              {debutCopy}
            </p>
            {eventCardSection ? (
              <LinksList
                sections={[eventCardSection]}
                align="start"
                className="mt-8 px-0 py-0 md:max-w-[520px]"
              />
            ) : null}
          </div>
        </div>
      </section>

      <footer className="border-black/20 bg-[#BABABA] pb-[max(2rem,env(safe-area-inset-bottom))] md:border-t md:px-10 md:pb-14 md:pt-10">
        <ContactsBlock />
      </footer>
    </main>
    </>
  );
}
