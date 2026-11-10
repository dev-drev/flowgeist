import Image from "next/image";
import Link from "next/link";
import SiteNav, { type SitePage } from "@/components/SiteNav";

export default function SiteHeader({
  current,
  onHome,
  onAbout,
}: {
  current: SitePage;
  onHome?: () => void;
  onAbout?: () => void;
}) {
  const mark = (
    <Image
      src="/flowgeist.png"
      alt="Flowgeist"
      width={880}
      height={230}
      priority
      quality={100}
      className="h-auto w-full max-w-[300px] object-contain sm:max-w-[440px] md:max-w-[420px]"
    />
  );

  return (
    <header className="sticky top-0 z-40 bg-[#BABABA] pl-4 pr-16 md:px-10">
      <div className="flex flex-col items-start border-b border-black/10 pb-4 pt-6 md:pb-5 md:pt-8">
        {onHome ? (
          <button
            type="button"
            onClick={onHome}
            className="inline-flex min-w-0 max-w-[calc(100%-0.25rem)] cursor-pointer md:max-w-[420px]"
            aria-label="Back to landing"
          >
            {mark}
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex min-w-0 max-w-[calc(100%-0.25rem)] md:max-w-[420px]"
            aria-label="Back to landing"
          >
            {mark}
          </Link>
        )}
        <SiteNav
          current={current}
          tone="dark"
          onAbout={onAbout}
          className="mt-4 hidden md:flex"
        />
      </div>
    </header>
  );
}
