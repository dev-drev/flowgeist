"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Squash } from "hamburger-react";
import Link from "next/link";

type MobileMenuProps = {
  tone?: "light" | "dark";
  current?: "home" | "about" | "music" | "gallery" | "news";
  onAbout?: () => void;
  onHome?: () => void;
  className?: string;
};

const SOCIAL = [
  {
    label: "Mail",
    href: "mailto:info@flowgeist.net",
    external: false,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/flowgeistx/",
    external: true,
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/flowgeist",
    external: true,
  },
];

export default function MobileMenu({
  tone = "dark",
  current = "home",
  onAbout,
  className = "",
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.removeAttribute("data-mobile-menu-open");
      return;
    }

    document.documentElement.setAttribute("data-mobile-menu-open", "");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.removeAttribute("data-mobile-menu-open");
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  const handleAbout = () => {
    close();
    if (current === "about") return;
    onAbout?.();
  };

  if (!mounted) return null;

  const itemClass =
    "text-left font-alte-haas-bold text-[40px] leading-none tracking-[0.01em] text-white transition-opacity hover:opacity-70";

  return createPortal(
    <>
      <div
        className={`fixed right-[max(0.85rem,env(safe-area-inset-right))] top-[max(1.15rem,env(safe-area-inset-top))] z-[80] md:right-10 md:top-7 ${className}`}
      >
        <Squash
          toggled={open}
          toggle={setOpen}
          size={22}
          distance="sm"
          rounded
          duration={reduceMotion ? 0 : 0.45}
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          color={open || tone === "light" ? "#ffffff" : "rgba(0,0,0,0.8)"}
          label={open ? "Close menu" : "Open menu"}
        />
      </div>

      {open ? (
        <div
          id="mobile-menu"
          data-mobile-menu
          className="mobile-menu-in fixed inset-0 z-[70] flex flex-col bg-[#141414] text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="pt-[max(1.15rem,env(safe-area-inset-top))]">
            <div className="flex h-12 items-center pl-6 pr-16">
              <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                [menu]
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-7 px-8">
            {current === "about" || onAbout ? (
              <button type="button" onClick={handleAbout} className={itemClass}>
                {current === "about" ? "[about]" : "About"}
              </button>
            ) : (
              <Link href="/#about" onClick={close} className={itemClass}>
                About
              </Link>
            )}

            {current === "music" ? (
              <button type="button" onClick={close} className={itemClass}>
                [music]
              </button>
            ) : (
              <Link href="/music" onClick={close} className={itemClass}>
                Music
              </Link>
            )}

            {current === "gallery" ? (
              <button type="button" onClick={close} className={itemClass}>
                [gallery]
              </button>
            ) : (
              <Link href="/gallery" onClick={close} className={itemClass}>
                Gallery
              </Link>
            )}

            {current === "news" ? (
              <button type="button" onClick={close} className={itemClass}>
                [news]
              </button>
            ) : (
              <Link href="/news" onClick={close} className={itemClass}>
                News
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-6 px-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {SOCIAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
