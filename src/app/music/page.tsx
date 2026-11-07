import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LinksList from "@/components/LinksList";
import MobileMenu from "@/components/MobileMenu";
import { LINK_SECTIONS } from "@/lib/linksConfig";

export const metadata: Metadata = {
  title: "Music — Flowgeist",
  description: "Flowgeist music.",
};

const albumSection = LINK_SECTIONS.find((section) => section.id === "album");
const musicSection = albumSection ? { ...albumSection, title: undefined } : null;

export default function MusicPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 pb-10 pt-1 text-black/80 md:px-0 md:pb-16">
      <MobileMenu tone="dark" current="music" />
      <header className="flex w-full items-start justify-between bg-[#BABABA] pl-4 pr-4 md:px-10 md:pt-2">
        <Link
          href="/"
          className="inline-flex min-w-0 max-w-[calc(100%-3.25rem)] items-center rounded-md pt-6 md:max-w-[440px] md:py-6"
          aria-label="Back to home"
        >
          <Image
            src="/flowgeist.png"
            alt="Flowgeist"
            width={200}
            height={56}
            className="h-auto w-full max-w-[320px] object-contain sm:max-w-[550px] md:max-w-[440px]"
            priority
          />
        </Link>
      </header>
      <section aria-label="Music" className="pb-8">
        <p className="ml-10 pt-8 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:ml-0 md:px-10 md:pt-8 md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
          [music]
        </p>
        {musicSection ? (
          <LinksList
            sections={[musicSection]}
            className="mt-4 py-2 md:mx-0 md:mt-6 md:max-w-xl md:px-10"
          />
        ) : null}
      </section>
    </main>
  );
}
