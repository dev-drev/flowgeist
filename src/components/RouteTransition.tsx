"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

function isPublicPath(pathname: string) {
  return (
    !pathname.startsWith("/admin") && !pathname.startsWith("/flowgeist-panel")
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef(pathname);
  const viewTransition = useRef(false);
  const finishNavigation = useRef<(() => void) | null>(null);
  const [fade, setFade] = useState(false);

  if (previousPath.current !== pathname) {
    const shouldFade = !viewTransition.current && isPublicPath(pathname);
    previousPath.current = pathname;
    if (shouldFade !== fade) setFade(shouldFade);
  }

  useEffect(() => {
    finishNavigation.current?.();
    finishNavigation.current = null;
    viewTransition.current = false;
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (
        typeof document.startViewTransition !== "function" ||
        prefersReducedMotion()
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (!isPublicPath(url.pathname)) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      const next = `${url.pathname}${url.search}${url.hash}`;
      viewTransition.current = true;
      event.preventDefault();

      const finish = () => {
        finishNavigation.current = null;
        window.clearTimeout(timeout);
      };

      let timeout = 0;
      try {
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              let settled = false;
              const done = () => {
                if (settled) return;
                settled = true;
                finish();
                resolve();
              };
              finishNavigation.current = done;
              timeout = window.setTimeout(done, 2000);
              router.push(next);
            }),
        );
      } catch {
        viewTransition.current = false;
        router.push(next);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div key={pathname} className={fade ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
