"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTracking } from "@/lib/useTracking";

export default function Home() {
  const headerGridCols = "lg:grid-cols-[0.997fr_0.548fr_0.80fr]";
  const [showAbout, setShowAbout] = useState(false);
  const { trackPageView } = useTracking();
  const aboutHeroEffectRef = useRef<HTMLDivElement | null>(null);
  const aboutColorBlockRef = useRef<HTMLDivElement | null>(null);
  const aboutHeroEffectPlayedRef = useRef(false);
  const aboutHeroInstanceRef = useRef<{
    next?: () => void;
    destroy?: () => void;
  } | null>(null);

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
    const runId = `mobile-overflow-${Date.now()}`;
    const logHorizontalOverflow = (phase: string, hypothesisId: string) => {
      const viewportWidth = window.innerWidth;
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>("body *")
      )
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.right > viewportWidth + 1 || rect.left < -1;
        })
        .slice(0, 8)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: el.className,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        });

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
            hypothesisId,
            location: "src/app/page.tsx:logHorizontalOverflow",
            message: "Horizontal overflow snapshot",
            data: {
              phase,
              showAbout,
              viewportWidth,
              bodyClientWidth: document.body.clientWidth,
              bodyScrollWidth: document.body.scrollWidth,
              docClientWidth: document.documentElement.clientWidth,
              docScrollWidth: document.documentElement.scrollWidth,
              offenders: candidates,
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion
    };

    logHorizontalOverflow("effect-start", "H7");
    const raf = requestAnimationFrame(() => {
      logHorizontalOverflow("raf-after-layout", "H8");
    });
    const onResize = () => logHorizontalOverflow("resize", "H9");
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [showAbout]);

  useEffect(() => {
    return () => {
      aboutHeroInstanceRef.current?.destroy?.();
      if (aboutHeroEffectRef.current) aboutHeroEffectRef.current.innerHTML = "";
    };
  }, []);

  return (
    <main className="fixed inset-0 h-[100vh] max-h-[100dvh] w-full px-2 pt-1">
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          zIndex: 3,
          backgroundColor: "#272727f6",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 mx-auto h-full w-full max-h-[100vh] max-w-[1490px]">
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
            <div className="mx-auto flex h-full w-full flex-col overflow-y-auto about-scroll">
              <header
                className={`w-full   bg-[#BABABA] pl-4  text-black/80 sm:px-l transition-all duration-500 ${
                  showAbout
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-3 scale-95"
                }`}
              >
                <div
                  className={`flex lg:grid w-full grid-cols-1 ${headerGridCols}`}
                >
                  <button
                    type="button"
                    onClick={() => setShowAbout(false)}
                    className="inline-flex items-center rounded-md pt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                    aria-label="Torna al logo iniziale"
                  >
                    <Image
                      src="/flowgeist.png"
                      alt="Flowgeist"
                      width={200}
                      height={56}
                      className="h-auto w-[700px] sm:w-[550px] object-contain"
                    />
                  </button>
                  <div className="hidden h-full w-full items-end border-b-20 lg:flex lg:border-black/45">
                    <div className="mx-4 h-[56px] flex-1 border-black/40 sm:mx-8 sm:h-[72px] " />
                    <div className="flex h-full items-end justify-end bg-[#BABABA]">
                      <p className="px-5 py-4 text-[23px] font-semibold text-black/65"></p>
                    </div>
                  </div>
                  <div className="flex h-full w-full items-end border-r-20 border-l-5  lg:border-black/45  ">
                    <div className="mx-4 h-[56px] flex-1  border-black/40 sm:mx-8 sm:h-[72px] lg:block hidden" />
                    <div className="flex h-full items-end justify-end bg-[#BABABA] lg:block hidden">
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
                  <div className="flex h-full flex-col gap-8 lg:col-start-1 lg:col-end-2">
                    <div className="lg:space-y-6 ">
                      <p className="font-pt-mono text-[10px] lg:text-[12px] font-semibold uppercase  text-black/65 p-5 sm:p-8">
                        A PROJECT CURATED BY /
                        <br />
                        <span className="font-alte-haas-bold normal-case text-xl tracking-[0.03px] pl-10 text-[16px] lg:text-[20px] text-[#5c5c5c]">
                          Marco Bruno and Velvet May.
                        </span>
                      </p>
                      <div className="bg-[#5a5a5a] lg:bg-[#ffffff] translate-x-2 hover-webgl-card relative lg:h-[320px] lg:col-start-2 lg:col-end-4 lg:h-[570px]  lg:border-t-0 block lg:hidden">
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
                          className=" w-full h-full lg:bg-[#ffffff] mr-2 pr-4 "
                        >
                          <div className="mr-2 pr-4 bg-[#BABABA] h-full">
                            {" "}
                            <p className=" pb-5 md:pb-0 pt-6 text-[16px] font-semibold leading-[1.16] text-justify lg:pr-50 pr-2 pl-4 text-[#5c5c5c] font-alte-haas-bold">
                              Flowgeist resonates across sound and form through
                              endless definition. Structures surface, loosen,
                              and fall away, allowing material to reorganise in
                              real time. Rhythm acts as a spatial force,
                              contracting and releasing density as tension
                              gathers and dissolves.
                            </p>
                            <Image
                              src="/artists/pic-negative.jpeg"
                              alt="Flowgeist logo grey"
                              width={520}
                              height={520}
                              className="mx-auto  h-auto w-[520px] object-contain md:hidden"
                            />
                            <Image
                              src="/logo-grey.png"
                              alt="Flowgeist symbol"
                              width={150}
                              height={150}
                              className="h-auto w-[144px] sm:w-[190px] md:w-[150px] pt-12 md:pt-4 object-contain mt-0 pb-3 p-5 pr-2 md:pr-0 sm:p-8  float-right"
                            />
                            <p className=" pb-5 pt-8 md:pt-4 text-[18px] font-semibold leading-[1.16] text-justify pl-3 md:pl-4  pr-3 text-[#5c5c5c] font-alte-haas-bold">
                              Long-form electronic construction meets physical
                              intensity, where restraint and impact remain
                              closely linked, and abstraction stays tethered to
                              sensation. Genre remains peripheral, treated as
                              material rather than structure. Sound leads the
                              process, leaving meaning to emerge gradually
                              through listening.
                            </p>{" "}
                          </div>
                        </div>
                      </div>

                      <Image
                        src="/logo-grey.png"
                        alt="Flowgeist symbol"
                        width={150}
                        height={150}
                        className="h-auto w-[144px] sm:w-[190px] object-contain mt-0 pb-5 p-5 sm:p-8 mb-20 hidden lg:block"
                      />
                      <p className="text-[22px]  font-semibold  tracking-[0.10px] text-black/65 ml-10 pt-6 lg:pt-10 md:pt-4">
                        [contacts]
                      </p>
                      <div className="font-pt-mono b-6 flex flex-col flex-wrap text-[12px] font-semibold tracking-[0.2em] text-black/65 bg-[#515151] w-full lg:h-full pb-1 md:pb-0 ">
                        <div className="flex flex-col bg-[#BABABA] gap-16 ml-0 sm:ml-4 lg:ml-8 p-4 h-full">
                          <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-opacity hover:opacity-70 text-black/90"
                          >
                            MAIL_ <br />
                            <span className="font-alte-haas-bold text-[18px] lg:text-[22px] text-black/65 pl-10 normal-case tracking-normal text-[#5c5c5c] font-alte-haas-bold">
                              flowgeistmusic@gmail.com
                            </span>
                          </a>{" "}
                          <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-opacity hover:opacity-70 text-black/90"
                          >
                            _INSTAGRAM <br />
                            <span className="font-alte-haas-bold text-[18px] lg:text-[22px] text-black/65 pl-10 normal-case tracking-normal text-[#5c5c5c]">
                              @flowgeistx
                            </span>
                          </a>
                          <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-opacity hover:opacity-70 text-black/90"
                          >
                            SOUNDCLOUD --
                            <br />
                            <span className="font-alte-haas-bold text-[18px] lg:text-[22px] text-black/65 pl-10 normal-case tracking-normal text-[#5c5c5c]">
                              @flowgeistx{" "}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="translate-x-2 hover-webgl-card relative h-[320px] lg:col-start-2 lg:col-end-4 lg:h-[570px]  lg:border-t-0 hidden lg:block">
                    {/* <div
                      ref={aboutHeroEffectRef}
                      className="hover-webgl-host h-full w-full object-contain "
                    /> */}
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
                      className=" w-full h-full bg-[#ffffff] mr-2 pr-4 "
                    >
                      <div className="mr-2 pr-4 bg-[#BABABA] h-full">
                        {" "}
                        <p
                          className=" pb-5 pt-6 text-[20px] font-semibold leading-[1.16] text-justify pr-50  pl-4 text-[#5c5c5c] font-alte-haas-bold"
                          style={{ letterSpacing: "0.03px" }}
                        >
                          Flowgeist resonates across sound and form through
                          endless definition. Structures surface, loosen, and
                          fall away, allowing material to reorganise in real
                          time. Rhythm acts as a spatial force, contracting and
                          releasing density as tension gathers and dissolves.
                        </p>
                        <p
                          className=" pb-5 pt-4 text-[20px] font-semibold leading-[1.16] text-justify pl-50  pr-10 text-[#5c5c5c] font-alte-haas-bold"
                          style={{ letterSpacing: "0.03px" }}
                        >
                          Long-form electronic construction meets physical
                          intensity, where restraint and impact remain closely
                          linked, and abstraction stays tethered to sensation.
                          Genre remains peripheral, treated as material rather
                          than structure. Sound leads the process, leaving
                          meaning to emerge gradually through listening.
                        </p>{" "}
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

                <section className=" border-black/15 px-5 py-0 lg:py-6 sm:px-1 hidden lg:block">
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
