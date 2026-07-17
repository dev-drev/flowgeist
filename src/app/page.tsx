"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LinksList from "@/components/LinksList";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const headerGridCols = "md:grid-cols-[0.997fr_0.548fr_0.80fr]";
  const [showAbout, setShowAbout] = useState(false);
  const [showDesktopIntro, setShowDesktopIntro] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [linksModalMounted, setLinksModalMounted] = useState(false);
  const [linksModalClosing, setLinksModalClosing] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const { trackPageView } = useTracking();
  const aboutHeroEffectRef = useRef<HTMLDivElement | null>(null);
  const aboutColorBlockRef = useRef<HTMLDivElement | null>(null);
  const aboutScrollRef = useRef<HTMLDivElement | null>(null);
  const aboutHeroEffectPlayedRef = useRef(false);
  const aboutHeroInstanceRef = useRef<{
    next?: () => void;
    destroy?: () => void;
  } | null>(null);

  useEffect(() => {
    trackPageView("Website opened");
  }, [trackPageView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const onViewportChange = (event: MediaQueryListEvent) =>
      setIsDesktopLayout(event.matches);
    setIsDesktopLayout(mediaQuery.matches);
    mediaQuery.addEventListener("change", onViewportChange);
    return () => mediaQuery.removeEventListener("change", onViewportChange);
  }, []);

  useEffect(() => {
    if (!isDesktopLayout && showDesktopIntro) {
      setShowDesktopIntro(false);
    }
  }, [isDesktopLayout, showDesktopIntro]);

  useEffect(() => {
    if (showLinksModal) {
      setLinksModalClosing(false);
      setLinksModalMounted(true);
      return;
    }

    if (!linksModalMounted) return;

    setLinksModalClosing(true);
    const timeout = window.setTimeout(() => {
      setLinksModalMounted(false);
      setLinksModalClosing(false);
    }, 400);
    return () => window.clearTimeout(timeout);
    // Only react to open/close intent; mounted is read for the exit path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLinksModal]);

  const closeLinksModal = () => setShowLinksModal(false);

  useEffect(() => {
    if (!showLinksModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowLinksModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLinksModal]);

  useEffect(() => {
    if (showAbout || isDesktopLayout || showDesktopIntro) return;

    const SCROLL_THRESHOLD = 48;
    let touchStartY: number | null = null;

    const openAbout = () => setShowAbout(true);

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > SCROLL_THRESHOLD) {
        openAbout();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;
      if (touchStartY - currentY > SCROLL_THRESHOLD) {
        openAbout();
        touchStartY = null;
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [showAbout, isDesktopLayout, showDesktopIntro]);

  useEffect(() => {
    if (!showAbout || isDesktopLayout) return;

    const SCROLL_THRESHOLD = 35;
    const OPEN_GRACE_MS = 450;
    const openedAt = Date.now();
    let touchStartY: number | null = null;
    let canCloseOnPull = false;
    let lastScrollTop = 0;

    const closeAbout = () => {
      if (Date.now() - openedAt < OPEN_GRACE_MS) return;
      setShowAbout(false);
    };

    const isAtTop = () => {
      const scrollEl = aboutScrollRef.current;
      return scrollEl ? scrollEl.scrollTop <= 8 : false;
    };

    const onWheel = (event: WheelEvent) => {
      if (isAtTop() && event.deltaY < -SCROLL_THRESHOLD) {
        closeAbout();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      canCloseOnPull = isAtTop();
      if (!canCloseOnPull) return;
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!canCloseOnPull || touchStartY === null) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;
      if (currentY - touchStartY > SCROLL_THRESHOLD) {
        closeAbout();
        touchStartY = null;
        canCloseOnPull = false;
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
      canCloseOnPull = false;
    };

    const onScroll = () => {
      const scrollEl = aboutScrollRef.current;
      if (!scrollEl) return;

      const currentTop = scrollEl.scrollTop;

      if (currentTop <= 0 && lastScrollTop > 12) {
        closeAbout();
        return;
      }

      if (!isAtTop()) {
        canCloseOnPull = false;
        touchStartY = null;
      }

      lastScrollTop = currentTop;
    };

    const scrollEl = aboutScrollRef.current;
    if (scrollEl) scrollEl.scrollTop = 0;
    lastScrollTop = 0;
    scrollEl?.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchmove", onTouchMove, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchend", onTouchEnd, { capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { capture: true });

    return () => {
      scrollEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
    };
  }, [showAbout, isDesktopLayout]);

  useEffect(() => {
    document.documentElement.classList.toggle("home-page", !showAbout);
    document.body.classList.toggle("home-page", !showAbout);
    return () => {
      document.documentElement.classList.remove("home-page");
      document.body.classList.remove("home-page");
    };
  }, [showAbout]);

  useEffect(() => {
    if (!showAbout || aboutHeroEffectPlayedRef.current) return;

    let isUnmounted = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const runId = `about-hero-${Date.now()}`;

    const initAboutHeroEffect = async () => {
      const parent = aboutHeroEffectRef.current;
      if (!parent) return;
      const imgProbe = new window.Image();
      imgProbe.onload = () => {
        // #region agent log
        fetch(
          "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "d66309",
            },
            body: JSON.stringify({
              sessionId: "d66309",
              runId,
              hypothesisId: "H5",
              location: "src/app/page.tsx:initAboutHeroEffect:imageProbe",
              message: "Image intrinsic dimensions for artists.jpeg",
              data: {
                naturalWidth: imgProbe.naturalWidth,
                naturalHeight: imgProbe.naturalHeight,
                naturalRatio:
                  imgProbe.naturalHeight > 0
                    ? imgProbe.naturalWidth / imgProbe.naturalHeight
                    : null,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      };
      imgProbe.src = "/artists.jpeg";
      // #region agent log
      fetch(
        "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "d66309",
          },
          body: JSON.stringify({
            sessionId: "d66309",
            runId,
            hypothesisId: "H1",
            location: "src/app/page.tsx:initAboutHeroEffect:parentRect",
            message: "Parent rect before hover-effect init",
            data: {
              showAbout,
              parentRect: parent.getBoundingClientRect().toJSON(),
              parentClass: parent.className,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion

      const hoverEffectModule = await import("hover-effect");
      const HoverEffect = hoverEffectModule.default ?? hoverEffectModule;
      if (isUnmounted) return;

      parent.innerHTML = "";
      aboutHeroInstanceRef.current = new HoverEffect({
        parent,
        intensity: 0.32,
        image1: "/flowgeist.png",
        image2: "/artists.jpeg",
        displacementImage: "/flowgeist.png",
        hover: false,
        speedIn: 2.4,
        speedOut: 2.4,
        easing: "expo.out",
      });
      aboutHeroEffectPlayedRef.current = true;
      const canvas = parent.querySelector("canvas");
      // #region agent log
      fetch(
        "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "d66309",
          },
          body: JSON.stringify({
            sessionId: "d66309",
            runId,
            hypothesisId: "H2",
            location: "src/app/page.tsx:initAboutHeroEffect:canvasAfterInit",
            message: "Canvas sizing and computed styles after init",
            data: {
              canvasFound: Boolean(canvas),
              canvasRect: canvas?.getBoundingClientRect().toJSON() ?? null,
              parentRect: parent.getBoundingClientRect().toJSON(),
              canvasInlineStyles: canvas?.getAttribute("style") ?? null,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion

      timeoutId = setTimeout(() => {
        // #region agent log
        fetch(
          "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "d66309",
            },
            body: JSON.stringify({
              sessionId: "d66309",
              runId,
              hypothesisId: "H4",
              location: "src/app/page.tsx:initAboutHeroEffect:beforeNext",
              message: "Calling next() on hover-effect instance",
              data: {
                timeoutMs: 180,
                parentRect: parent.getBoundingClientRect().toJSON(),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
        aboutHeroInstanceRef.current?.next?.();
      }, 180);
    };

    initAboutHeroEffect();
    const onResize = () => {
      const parent = aboutHeroEffectRef.current;
      if (!parent) return;
      const canvas = parent.querySelector("canvas");
      // #region agent log
      fetch(
        "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "d66309",
          },
          body: JSON.stringify({
            sessionId: "d66309",
            runId,
            hypothesisId: "H3",
            location: "src/app/page.tsx:onResize:layout",
            message: "Layout after resize for parent and canvas",
            data: {
              parentRect: parent.getBoundingClientRect().toJSON(),
              canvasRect: canvas?.getBoundingClientRect().toJSON() ?? null,
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    };
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      isUnmounted = true;
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, [showAbout]);

  useEffect(() => {
    if (!showAbout) return;
    const runId = `bg-check-${Date.now()}`;
    const logColorStacking = () => {
      const parent = aboutHeroEffectRef.current?.parentElement;
      const webglHost = aboutHeroEffectRef.current;
      const colorBlock = aboutColorBlockRef.current;
      if (!parent || !webglHost || !colorBlock) return;
      const parentRect = parent.getBoundingClientRect();
      const webglRect = webglHost.getBoundingClientRect();
      const colorRect = colorBlock.getBoundingClientRect();
      const probeX = Math.floor(parentRect.left + parentRect.width / 2);
      const probeY = Math.floor(parentRect.top + parentRect.height / 2);
      const topElement = document.elementFromPoint(
        probeX,
        probeY,
      ) as HTMLElement | null;

      // #region agent log
      fetch(
        "http://127.0.0.1:7893/ingest/ba57b2af-0dca-4900-bc00-390f193e315b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "d66309",
          },
          body: JSON.stringify({
            sessionId: "d66309",
            runId,
            hypothesisId: "H6",
            location: "src/app/page.tsx:logColorStacking:layout",
            message: "Background block layout and stacking",
            data: {
              parentRect: parentRect.toJSON(),
              webglRect: webglRect.toJSON(),
              colorRect: colorRect.toJSON(),
              parentBg: getComputedStyle(parent).backgroundColor,
              webglBg: getComputedStyle(webglHost).backgroundColor,
              colorBg: getComputedStyle(colorBlock).backgroundColor,
              topElementTag: topElement?.tagName ?? null,
              topElementClass: topElement?.className ?? null,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    };

    requestAnimationFrame(logColorStacking);
  }, [showAbout]);

  useEffect(() => {
    return () => {
      aboutHeroInstanceRef.current?.destroy?.();
      if (aboutHeroEffectRef.current) aboutHeroEffectRef.current.innerHTML = "";
    };
  }, []);

  return (
    <main className="fixed inset-0 h-[100vh] max-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden">
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          zIndex: 3,
          backgroundColor: "#272727f6",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 mx-auto h-full w-full max-h-[100vh]">
        <div
          className={`absolute inset-0 hidden transition-opacity duration-700 md:block ${
            showAbout || showDesktopIntro ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src="/artists.jpeg"
            alt="Flowgeist artists background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <section
          className={`absolute inset-0 z-30 hidden cursor-auto transition-opacity duration-700 md:flex ${
            showDesktopIntro
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setShowDesktopIntro(false)}
        >
          <Image
            src="/artists.jpeg"
            alt="Flowgeist artists background"
            fill
            priority
            className="z-0 object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 z-[1] bg-black/65" />
          <div
            className="absolute inset-0 z-[2]"
            style={{ backgroundColor: "#272727f6", mixBlendMode: "multiply" }}
          />
          <div
            className={`relative z-[3] mx-auto flex h-full w-full max-w-[920px] cursor-auto flex-col items-center justify-center px-12 text-left transition-all duration-700 md:px-16 ${
              showDesktopIntro
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-2 scale-[0.985] opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-alte-haas-regular text-[18px] 2xl:text-[18px] 3xl:text-[20px] font-normal leading-[1.15] text-white/90 text-justify">
              <span className="font-alte-haas-bold">Flowgeist</span> makes its
              live debut at{" "}
              <span className="font-alte-haas-bold">Kantine am Berghain</span>{" "}
              alongside the release of its{" "}
              <span className="font-alte-haas-bold">
                first full-length album
              </span>
              . Conceived by Berlin-based artists{" "}
              <span className="font-alte-haas-bold">Marco Bruno</span> and{" "}
              <span className="font-alte-haas-bold">Velvet May</span>, the
              project emerges from a shared inquiry into sound and aesthetics.
              <br />
              <br />
              Approaching electronic music as a cinematic field, Flowgeist moves
              through dense atmospheres, fractured rhythms and sculptural sound
              design. Its language develops through detail: genre remains
              peripheral, meaning is tethered to sensation, drawing the listener
              into a world shaped by an unfolding narrative.
            </p>
            <Image
              src="/artists/flowhite.png"
              alt="Flowgeist white mark"
              width={560}
              height={346}
              className="mt-12 h-auto w-[min(48vw,420px)] object-contain"
              priority
            />
            <div className="mt-10 flex items-center gap-5">
              <a
                href="mailto:flowgeistmusic@gmail.com"
                className="flex h-7 w-7 cursor-pointer items-center justify-center text-white/85 transition-opacity hover:opacity-70"
                aria-label="Mail Flowgeist"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="3.5" y="6.5" width="17" height="11" rx="1.8" />
                  <path d="M4.5 8l7.5 5.6L19.5 8" />
                </svg>
              </a>
              <a
                href="https://instagram.com/flowgeistx"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 cursor-pointer items-center justify-center text-white/85 transition-opacity hover:opacity-70"
                aria-label="Instagram Flowgeist"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="4" y="4" width="16" height="16" rx="4.5" />
                  <circle cx="12" cy="12" r="3.8" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://soundcloud.com/flowgeistx"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 cursor-pointer items-center justify-center text-white/85 transition-opacity hover:opacity-70"
                aria-label="SoundCloud Flowgeist"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M4 16h12a3.5 3.5 0 1 0-.6-6.95A5 5 0 0 0 6.6 10" />
                  <path d="M5 16V11.8M7 16V10.8M9 16V10.2M11 16v-.6M13 16v-.5M15 16v-.2" />
                </svg>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setShowLinksModal(true)}
              className="mt-12 cursor-pointer font-pt-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 transition-opacity hover:opacity-100 hover:text-white"
            >
              Tickets &amp; links →
            </button>
          </div>
        </section>

        {linksModalMounted ? (
          <div
            className="absolute inset-0 z-40 hidden items-center justify-center px-6 md:flex"
            onClick={closeLinksModal}
            role="dialog"
            aria-modal="true"
            aria-label="Tickets and links"
          >
            <div
              className={`absolute inset-0 bg-black/50 ${
                linksModalClosing
                  ? "links-modal-backdrop-exit"
                  : "links-modal-backdrop-enter"
              }`}
              aria-hidden
            />
            <div
              className={`relative z-10 max-h-[85vh] w-full max-w-[440px] overflow-y-auto bg-[#f3f3f1] shadow-2xl ${
                linksModalClosing
                  ? "links-modal-panel-exit"
                  : "links-modal-panel-enter"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLinksModal}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center text-black/50 transition hover:bg-black/5 hover:text-black"
                aria-label="Close links"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <LinksList className="py-8" />
            </div>
          </div>
        ) : null}

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 sm:px-12 md:px-20 transition-all duration-500 ${
            showAbout || showDesktopIntro
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
          aria-label="Landing"
        >
          <button
            type="button"
            onClick={() => {
              if (isDesktopLayout) {
                setShowDesktopIntro(true);
                return;
              }
              setShowAbout(true);
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg cursor-pointer flex items-center justify-center w-full h-full min-h-0"
            aria-label="Apri schermata Flowgeist"
          >
            <Image
              src="/artists/icon.png"
              alt="flowgeist"
              width={500}
              height={700}
              quality={100}
              className="mx-auto h-auto w-full max-w-[280px] 2xl:max-w-[360px] object-contain object-center transition-opacity hover:opacity-90"
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
            <div
              ref={aboutScrollRef}
              className="mx-auto flex h-full w-full flex-col overflow-y-auto overflow-x-hidden about-scroll"
            >
              <header
                className={`w-full   bg-[#BABABA] pl-4  text-black/80 sm:px-l transition-all duration-500 ${
                  showAbout
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-3 scale-95"
                }`}
              >
                <div
                  className={`flex md:grid w-full grid-cols-1 ${headerGridCols}`}
                >
                  <button
                    type="button"
                    onClick={() => setShowAbout(false)}
                    className="inline-flex cursor-pointer items-center rounded-md pt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                    aria-label="Torna al logo iniziale"
                  >
                    <Image
                      src="/flowgeist.png"
                      alt="Flowgeist"
                      width={200}
                      height={56}
                      className="h-auto w-full max-w-[320px] sm:max-w-[550px] md:max-w-[700px] object-contain"
                    />
                  </button>
                  <div className="hidden h-full w-full items-end border-b-20 md:flex md:border-black/45">
                    <div className="mx-4 h-[56px] flex-1 border-black/40 sm:mx-8 sm:h-[72px] " />
                    <div className="flex h-full items-end justify-end bg-[#BABABA]">
                      <p className="px-5 py-4 text-[23px] font-semibold text-black/65"></p>
                    </div>
                  </div>
                  <div className="flex h-full w-full items-end border-r-20 border-l-5  md:border-black/45  ">
                    <div className="mx-4 h-[56px] flex-1  border-black/40 sm:mx-8 sm:h-[72px] md:block hidden" />
                    <div className="flex h-full items-end justify-end bg-[#BABABA] md:block hidden">
                      <p className="px-5 py-4 text-[23px] font-semibold text-black/65">
                        [Berlin, DE]
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div
                className={`bg-[#BABABA] text-black/85 transition-all duration-500 delay-100 ${
                  showAbout
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-4 scale-95"
                }`}
              >
                <section
                  className={`grid min-h-[60vh] grid-cols-1 ${headerGridCols}`}
                >
                  <div className="flex h-full flex-col gap-8 md:col-start-1 md:col-end-2">
                    <div className="relative md:space-y-6 ">
                      <p className="font-pt-mono text-[10px] md:text-[12px] font-semibold uppercase  text-black/65 p-5 sm:p-8">
                        A PROJECT CURATED BY /
                        <br />
                        <span className="font-alte-haas-bold normal-case text-xl tracking-[0.03px] pl-10 text-[16px] md:text-[20px] text-[#5c5c5c]">
                          Marco Bruno and Velvet May.
                        </span>
                      </p>
                      <div className="bg-[#5a5a5a] md:bg-[#ffffff] md:translate-x-2 hover-webgl-card relative z-20 md:h-[320px] md:col-start-2 md:col-end-4 md:h-[570px]  md:border-t-0 block md:hidden">
                        <img
                          src="/artists.jpeg"
                          style={{
                            objectFit: "contain",
                            objectPosition: "right top",
                          }}
                          className="h-[100%] w-[100%] object-contain ml-auto  "
                          alt="Flowgeist logo black"
                        />
                        <div
                          ref={aboutColorBlockRef}
                          className="w-full h-full md:bg-[#ffffff] md:mr-2 md:pr-4"
                        >
                          <div className="bg-[#BABABA] h-full md:mr-2 md:pr-4">
                            <p className="pb-5 md:pb-0 pt-6 text-[14px] font-semibold leading-[1.16] text-justify px-4 text-[#5c5c5c] font-alte-haas-bold">
                              Flowgeist makes its live debut at Kantine am
                              Berghain alongside the release of its first
                              full-length album. Conceived by Berlin-based
                              artists Marco Bruno and Velvet May, the project
                              emerges from a shared inquiry into sound and
                              aesthetics. Approaching electronic music as a
                              cinematic field, Flowgeist moves through dense
                              atmospheres, fractured rhythms and sculptural
                              sound design. Its language develops through
                              detail: genre remains peripheral, meaning is
                              tethered to sensation, drawing the listener into a
                              world shaped by an unfolding narrative.
                            </p>
                            <div className="md:hidden w-full">
                              <LinksList className="py-4" />
                            </div>
                            <p className="pb-5 pt-2 text-[14px] font-semibold leading-[1.16] text-justify px-4 text-[#5c5c5c] font-alte-haas-bold md:hidden">
                              Traces of trip hop, post punk, industrial
                              electronics and breakbeat appear like residues
                              within a wider dramaturgy, where rhythm, texture
                              and voice carry the album&apos;s internal
                              narrative into physical space. The performance
                              marks the first live incarnation of the record,
                              opening its layered studio architecture to the
                              immediacy of the room.
                            </p>
                            <div className="flex w-full max-w-full items-center justify-between gap-4 overflow-hidden px-4 md:hidden">
                              <Image
                                src="/artists/pic-negative.jpeg"
                                alt="Flowgeist logo grey"
                                width={520}
                                height={520}
                                className="h-auto w-full min-w-0 object-contain"
                              />
                            </div>
                            <div className="relative z-20 md:hidden">
                              <Image
                                src="/logo-grey.png"
                                alt=""
                                width={600}
                                height={600}
                                aria-hidden
                                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[75vh] w-[75vw] max-w-none -translate-x-[13%] -translate-y-[45.5%] object-contain opacity-40"
                              />
                              <p className="relative z-10 pb-2 pt-6 text-[14px] font-semibold leading-[1.16] text-justify px-4 text-[#5c5c5c] font-alte-haas-bold">
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
                          </div>
                        </div>
                      </div>

                      <div className="relative z-[1]">
                        <Image
                          src="/logo-grey.png"
                          alt="Flowgeist symbol"
                          width={150}
                          height={150}
                          className="h-auto w-[144px] sm:w-[190px] object-contain mt-0 pb-5 p-5 sm:p-8 mb-20 hidden md:block"
                        />
                        <p className="text-[12px] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px] font-semibold tracking-[0.10px] text-black/65 ml-10 pt-4 md:pt-10">
                          [contacts]
                        </p>
                        <div className="font-pt-mono b-6 flex flex-col flex-wrap text-[12px] sm:text-[13px] md:text-[12px] font-semibold tracking-[0.2em] text-black/65 bg-[#515151] w-full md:h-full pb-3 md:pb-0 ">
                          <div className="flex flex-col bg-[#BABABA] gap-6 ml-8 p-4 h-full">
                            <a
                              href="https://instagram.com"
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer transition-opacity hover:opacity-70 text-black/90"
                            >
                              MAIL_ <br />
                              <span className="font-alte-haas-bold text-[12px] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px] pl-10 normal-case tracking-normal text-[#5c5c5c] font-alte-haas-bold">
                                flowgeistmusic@gmail.com
                              </span>
                            </a>{" "}
                            <a
                              href="https://instagram.com"
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer transition-opacity hover:opacity-70 text-black/90"
                            >
                              _INSTAGRAM <br />
                              <span className="font-alte-haas-bold text-[12px] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px] pl-10 normal-case tracking-normal text-[#5c5c5c]">
                                @flowgeistx
                              </span>
                            </a>
                            <a
                              href="https://instagram.com"
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer transition-opacity hover:opacity-70 text-black/90"
                            >
                              SOUNDCLOUD --
                              <br />
                              <span className="font-alte-haas-bold text-[12px] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px] pl-10 normal-case tracking-normal text-[#5c5c5c]">
                                @flowgeistx{" "}
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] md:translate-x-2 hover-webgl-card relative h-[320px] md:col-start-2 md:col-end-4 md:h-[570px] md:border-t-0 hidden md:block">
                    <img
                      src="/artists.jpeg"
                      style={{
                        objectFit: "contain",
                        objectPosition: "right top",
                      }}
                      className="h-[100%] w-[100%] object-contain ml-auto"
                      alt="Flowgeist logo black"
                    />
                    <div
                      ref={aboutColorBlockRef}
                      className="w-full h-full bg-[#ffffff] mr-2 pr-4"
                    >
                      <div className="mr-2 pr-4 bg-[#BABABA] h-full">
                        <p
                          className="pb-5 pt-6 text-[20px] 2xl:text-[26px] 3xl:text-[32px] font-semibold leading-[1.16] text-justify pr-50 pl-4 text-[#5c5c5c] font-alte-haas-bold"
                          style={{ letterSpacing: "0.03px" }}
                        >
                          Flowgeist resonates across sound and form through
                          endless definition. Structures surface, loosen, and
                          fall away, allowing material to reorganise in real
                          time. Rhythm acts as a spatial force, contracting and
                          releasing density as tension gathers and dissolves.
                        </p>
                        <Image
                          src="/artists/art-white.png"
                          alt="Flowgeist logo grey"
                          width={520}
                          height={520}
                          className="mx-auto mt-12 h-auto w-[520px] object-contain p-2"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className=" border-black/15 px-5 py-0 md:py-6 sm:px-1 hidden md:block">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative h-[450px] overflow-hidden">
                      <Image
                        src="/artists/pic-negative.jpeg"
                        alt="Flowgeist logo black"
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-contain"
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
