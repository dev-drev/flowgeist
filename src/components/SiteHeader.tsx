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
      className="h-12 w-auto object-contain md:h-auto md:w-full md:max-w-[420px]"
    />
  );

  const brandClass =
    "inline-flex min-w-0 max-w-[calc(100%-0.25rem)] shrink md:max-w-[420px]";

  return (
    <header className="sticky top-0 z-40 bg-[#BABABA] pl-4 pr-16 md:px-10">
      <div className="flex items-center justify-between gap-6 border-b border-black/10 py-[max(1.15rem,env(safe-area-inset-top))] md:gap-10 md:py-6">
        {onHome ? (
          <button
            type="button"
            onClick={onHome}
            className={`${brandClass} cursor-pointer`}
            aria-label="Back to landing"
          >
            {mark}
          </button>
        ) : (
          <Link href="/" className={brandClass} aria-label="Back to landing">
            {mark}
          </Link>
        )}
        <SiteNav
          current={current}
          tone="dark"
          onAbout={onAbout}
          className="hidden shrink-0 md:flex"
        />
      </div>
    </header>
  );
}
