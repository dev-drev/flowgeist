import type { Metadata } from "next";
import GallerySection from "@/components/GallerySection";
import MobileMenu from "@/components/MobileMenu";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Gallery — Flowgeist",
  description: "Flowgeist gallery.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#BABABA] px-2 pt-1 text-black/80 md:px-0">
      <MobileMenu tone="dark" current="gallery" className="md:hidden" />
      <SiteHeader current="gallery" />
      <GallerySection active />
      <SiteFooter className="-mx-2 md:mx-0" />
    </main>
  );
}
