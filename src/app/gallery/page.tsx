import type { Metadata } from "next";
import GallerySection from "@/components/GallerySection";
import MobileMenu from "@/components/MobileMenu";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Gallery — Flowgeist",
  description: "Flowgeist gallery.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 pb-10 pt-1 text-black/80 md:px-0 md:pb-16">
      <MobileMenu tone="dark" current="gallery" className="md:hidden" />
      <SiteHeader current="gallery" />
      <GallerySection active />
    </main>
  );
}
