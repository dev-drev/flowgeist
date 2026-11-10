"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GallerySection from "@/components/GallerySection";
import LandingVideo from "@/components/LandingVideo";
import LinksList from "@/components/LinksList";
import MobileFadeIn from "@/components/MobileFadeIn";
import MobileMenu from "@/components/MobileMenu";
import SiteFooter from "@/components/SiteFooter";
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

const marcoCopy =
  "Marco Bruno is a multidisciplinary storyteller whose releases span Helena Hauff's Return to Disorder, James Ruskin's Blueprint and Ben Sims' labels. His work has been presented on stages and platforms including TEDx and Tresor, and he is the founder of Evighet Records, a platform dedicated to identity, transformation and sonic evolution.";

const velvetCopy =
  "Velvet May is a live performer, singer and music producer whose practice moves through industrial textures, body-driven tension and rock-inflected intensity. Blending experimentation with meticulous sound design, his work is raw, detailed and sharply controlled. He has released music on labels including Veyl, Tears on Waves and She Lost Kontrol.";

const desktopProse =
  "text-justify font-alte-haas-bold text-[20px] font-semibold leading-[1.16] text-[#5c5c5c] 2xl:text-[26px] 3xl:text-[32px]";

const aboutEssay =
  "text-justify font-alte-haas-bold text-[20px] font-semibold leading-[1.2] text-[#5c5c5c] xl:text-[24px] 2xl:text-[26px]";

const aboutNote =
  "font-alte-haas-bold text-[16px] font-semibold leading-[1.28] text-[#5c5c5c] xl:text-[18px]";

const aboutMargin =
  "font-pt-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40";

const ABOUT_SECTIONS = [
  { id: "about-project", label: "01 Project" },
  { id: "about-live", label: "02 Live" },
  { id: "about-artists", label: "03 Artists" },
] as const;

const ABOUT_LINKS = [
  {
    label: "Email",
    href: "mailto:info@flowgeist.net",
    value: "info [at] flowgeist.net",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/flowgeistx/",
    value: "@flowgeistx",
    icon: "instagram",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/flowgeistx",
    value: "@flowgeistx",
    icon: "soundcloud",
  },
  {
    label: "Bandcamp",
    href: "https://flowgeist.bandcamp.com",
    value: "flowgeist.bandcamp.com",
    icon: "bandcamp",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/flowgeistx",
    value: "/flowgeistx",
    icon: "facebook",
  },
  {
    label: "Resident Advisor",
    href: "https://ra.co/dj/flowgeist",
    value: "ra.co/dj/flowgeist",
    icon: "resident",
  },
] as const;

function AboutLinkIcon({
  name,
  className = "h-4 w-4 shrink-0 text-black/70 transition-colors group-hover:text-black",
}: {
  name: "instagram" | "soundcloud" | "bandcamp" | "facebook" | "resident";
  className?: string;
}) {

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "soundcloud") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <rect x="1" y="13" width="1.35" height="4.2" rx="0.4" />
        <rect x="3.15" y="10.6" width="1.35" height="6.6" rx="0.4" />
        <rect x="5.3" y="8.4" width="1.35" height="8.8" rx="0.4" />
        <circle cx="11.1" cy="13.3" r="2.45" />
        <circle cx="14.3" cy="12.15" r="3.15" />
        <circle cx="17.6" cy="13.45" r="2.55" />
        <rect x="9" y="13.2" width="11.1" height="3.3" rx="1.5" />
      </svg>
    );
  }

  if (name === "bandcamp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <path d="M1.2 18.6 8.4 5.2H22.8l-7.2 13.4H1.2z" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <path d="M14.2 8.4V6.9c0-.7.4-.9 1.1-.9H17V3.4h-2c-2.5 0-3.6 1.4-3.6 3.4v1.6H9.2v2.7h2.2V20.6h3.3v-9.5h2.2l.4-2.7h-3.1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="10.5" fill="currentColor" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="#BABABA"
        fontSize="9"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
      >
        RA
      </text>
    </svg>
  );
}

function DesktopAbout({ liveHref }: { liveHref?: string }) {
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="px-6 pb-12 pt-8 md:px-10 md:pt-10">
      <div className="grid grid-cols-1 items-end gap-x-8 gap-y-8 lg:grid-cols-[9rem_minmax(16rem,20rem)_minmax(0,1fr)] lg:justify-start lg:gap-x-10 xl:grid-cols-[9rem_minmax(16rem,20rem)_minmax(0,40rem)] 2xl:grid-cols-[9rem_minmax(17rem,22rem)_minmax(0,46rem)]">
        <p className="text-[22px] font-semibold tracking-[0.10px] text-black/65 lg:pb-1">
          [about]
        </p>
        <div className="min-w-0 lg:pb-1">
          <p className={aboutMargin}>A project curated by</p>
          <h1 className="mt-3 font-alte-haas-bold text-[clamp(2.15rem,2.7vw,3.15rem)] leading-[0.94] tracking-[-0.02em] text-black/85">
            Marco Bruno
            <br />
            Velvet May
          </h1>
        </div>
        <figure className="min-w-0 lg:col-start-3">
          <img
            src="/artists.jpeg"
            alt="Marco Bruno and Velvet May"
            className="w-full object-contain"
          />
        </figure>
        <nav
          aria-label="Contents"
          className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-black/15 pt-3 lg:col-span-3"
        >
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {ABOUT_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => jump(section.id)}
                className={`${aboutMargin} transition-colors hover:text-black`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <p className={aboutMargin}>Berlin</p>
        </nav>
      </div>

      <section className="mt-14 grid grid-cols-1 gap-x-10 gap-y-6 lg:mt-20 lg:grid-cols-[9rem_minmax(0,66rem)] lg:items-start lg:justify-start">
        <h2 id="about-project" className={`${aboutMargin} scroll-mt-40`}>
          01 Project
        </h2>
        <p className={aboutEssay}>{debutCopy}</p>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-x-10 gap-y-6 lg:mt-20 lg:grid-cols-[9rem_minmax(0,36rem)_minmax(16rem,28rem)] lg:items-start lg:justify-start">
        <h2 id="about-live" className={`${aboutMargin} scroll-mt-40`}>
          02 Live
        </h2>
        <div className="min-w-0">
          <p className={aboutEssay}>{tracesCopy}</p>
          {liveHref ? (
            <a
              href={liveHref}
              target="_blank"
              rel="noreferrer"
              className={`${aboutMargin} mt-8 inline-block text-black/70 transition-colors hover:text-black`}
            >
              Kantine am Berghain →
            </a>
          ) : null}
        </div>
        <figure className="min-w-0">
          <img
            src="/artists/pic-negative.jpeg"
            alt="Marco Bruno and Velvet May"
            className="w-full object-contain"
          />
        </figure>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-x-10 gap-y-8 lg:mt-24 lg:grid-cols-[9rem_minmax(0,66rem)] lg:items-start lg:justify-start">
        <h2 id="about-artists" className={`${aboutMargin} scroll-mt-40`}>
          03 Artists
        </h2>
        <div className="min-w-0">
          <img
            src="/pics-kantine/DSCF4977.jpg"
            alt="Flowgeist, Kantine am Berghain"
            className="w-full object-contain"
          />
          <div className="mt-8 grid grid-cols-2 items-start gap-x-10">
            <article>
              <h3 className="font-alte-haas-bold text-[22px] leading-tight text-black/85 xl:text-[26px]">
                Marco Bruno
              </h3>
              <p className={`mt-4 ${aboutNote}`}>{marcoCopy}</p>
              <a
                href="https://www.marcobruno.net"
                target="_blank"
                rel="noreferrer"
                className={`${aboutMargin} mt-5 inline-block text-black/60 transition-colors hover:text-black`}
              >
                marcobruno.net
              </a>
            </article>
            <article>
              <h3 className="font-alte-haas-bold text-[22px] leading-tight text-black/85 xl:text-[26px]">
                Velvet May
              </h3>
              <p className={`mt-4 ${aboutNote}`}>{velvetCopy}</p>
              <a
                href="https://instagram.com/velvetxmay"
                target="_blank"
                rel="noreferrer"
                className={`${aboutMargin} mt-5 inline-block text-black/60 transition-colors hover:text-black`}
              >
                Instagram
              </a>
            </article>
          </div>
        </div>
      </section>

      <div className="mt-16 grid grid-cols-1 gap-y-6 border-t border-black/15 pt-8 lg:mt-20 lg:grid-cols-[9rem_minmax(0,66rem)] lg:justify-start lg:gap-x-10">
        <p className={aboutMargin}>Contact</p>
        <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="mailto:info@flowgeist.net"
            className="font-alte-haas-bold text-[22px] leading-tight text-black/85 transition-colors hover:text-black xl:text-[26px]"
          >
            info [at] flowgeist.net
          </a>
          <ul className="flex items-center gap-5 sm:ml-auto">
            {ABOUT_LINKS.filter((item) => "icon" in item).map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="group inline-flex"
                >
                  <AboutLinkIcon
                    name={item.icon}
                    className="h-7 w-7 shrink-0 text-black/70 transition-colors group-hover:text-black"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const GALLERY_PREVIEW = 1;

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
          <DesktopAbout liveHref={eventCardSection?.links[0]?.href} />
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

      <SiteFooter />
    </main>
    </>
  );
}
