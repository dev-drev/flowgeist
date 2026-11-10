"use client";

import Link from "next/link";

export type SitePage = "home" | "about" | "music" | "gallery" | "news";

const ITEMS: { id: SitePage; label: string; href: string }[] = [
  { id: "about", label: "About", href: "/?view=about" },
  { id: "music", label: "Music", href: "/music" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "news", label: "News", href: "/news" },
];

type SiteNavProps = {
  current: SitePage;
  tone?: "light" | "dark";
  className?: string;
  onAbout?: () => void;
};

export default function SiteNav({
  current,
  tone = "dark",
  className = "",
  onAbout,
}: SiteNavProps) {
  const light = tone === "light";

  return (
    <nav
      aria-label="Site"
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 lg:gap-x-9 ${className}`}
    >
      {ITEMS.map((item) => {
        const active = item.id === current;
        const itemClass = [
          "font-pt-mono text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors duration-300",
          light
            ? active
              ? "nav-on-video text-white"
              : "nav-on-video text-white/65 hover:text-white"
            : active
              ? "text-black"
              : "text-black/45 hover:text-black",
        ].join(" ");

        if (item.id === "about" && onAbout) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={onAbout}
              className={itemClass}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={itemClass}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
