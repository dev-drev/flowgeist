"use client";

import { useState } from "react";
import type { LinkItem, LinkSection } from "@/lib/linksConfig";
import { LINK_SECTIONS } from "@/lib/linksConfig";

interface LinksListProps {
  sections?: LinkSection[];
  className?: string;
  /** Use light section titles on dark backgrounds */
  dark?: boolean;
}

function CopyButton({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copyLink}
      aria-label={copied ? "Link copied" : `Copy link for ${label}`}
      className="relative z-10 ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
    >
      {copied ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
          OK
        </span>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      )}
    </button>
  );
}

function LinkIcon({ label, icon }: { label: string; icon?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (!icon || failed) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-100 text-[11px] font-semibold tracking-wide text-neutral-600"
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function FeaturedLinkCard({ item }: { item: LinkItem }) {
  const src = item.image ?? item.icon;
  const isSvg = src?.endsWith(".svg");

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.16)] active:scale-[0.99]"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={
            isSvg
              ? "aspect-[16/10] w-full object-contain bg-neutral-900 p-10"
              : "aspect-[16/10] w-full object-cover bg-neutral-900"
          }
        />
      ) : (
        <div className="aspect-[16/10] w-full bg-neutral-900" />
      )}

      <div className="relative flex items-center px-3 py-3.5">
        <span className="absolute inset-x-12 text-center text-[15px] font-semibold leading-tight text-black sm:text-base">
          {item.label}
        </span>
        <CopyButton label={item.label} href={item.href} />
      </div>
    </a>
  );
}

function LinkCard({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full items-center gap-3 bg-white px-3 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.16)] active:scale-[0.99]"
    >
      <LinkIcon label={item.label} icon={item.icon} />

      <span className="absolute inset-x-14 text-center text-[15px] font-semibold leading-tight text-black sm:text-base">
        {item.label}
      </span>

      <CopyButton label={item.label} href={item.href} />
    </a>
  );
}

export default function LinksList({
  sections = LINK_SECTIONS,
  className = "",
  dark = false,
}: LinksListProps) {
  return (
    <div className={`mx-auto w-full max-w-md py-2 px-4 ${className}`}>
      <div className="flex flex-col gap-3">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="flex flex-col gap-3">
            {section.title ? (
              <h2
                className={`mb-1 text-center text-lg font-bold ${
                  dark ? "text-white" : "text-black"
                } ${sectionIndex === 0 ? "mt-0" : "mt-4"}`}
              >
                {section.title}
              </h2>
            ) : null}

            {section.links.map((item) =>
              item.variant === "featured" ? (
                <FeaturedLinkCard key={item.id} item={item} />
              ) : (
                <LinkCard key={item.id} item={item} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
