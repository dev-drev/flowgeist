import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GallerySection from "@/components/GallerySection";
import MobileMenu from "@/components/MobileMenu";

export const metadata: Metadata = {
  title: "Gallery — Flowgeist",
  description: "Flowgeist gallery.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 pb-10 pt-1 text-black/80 md:px-0 md:pb-16">
      <MobileMenu tone="dark" current="gallery" />
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
      <GallerySection active />
    </main>
  );
}
