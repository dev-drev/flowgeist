const aboutMargin =
  "font-pt-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40";

const LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/flowgeistx/",
    icon: "instagram",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/flowgeist",
    icon: "soundcloud",
  },
  {
    label: "Bandcamp",
    href: "https://flowgeist.bandcamp.com",
    icon: "bandcamp",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/flowgeistx",
    icon: "facebook",
  },
  {
    label: "Resident Advisor",
    href: "https://ra.co/dj/flowgeist",
    icon: "resident",
  },
] as const;

const ICONS = {
  instagram: {
    viewBox: "0 0 24 24",
    d: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  },
  soundcloud: {
    viewBox: "0 6.625 24 10.75",
    d: "M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z",
  },
  bandcamp: {
    viewBox: "0 5.25 24 13.5",
    d: "M0 18.75l7.437-13.5H24l-7.438 13.5H0z",
  },
  facebook: {
    viewBox: "0 0.044 24 23.912",
    d: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  resident: {
    viewBox: "0 0 83 40",
    d: "M82.092 32.018c.556-.533.908-1.28.908-2.113 0-.802-.38-1.523-.9-2.051L58.665 4.3l-7.073 7.11 18.45 18.543h-26.14c-1.278-.038-2.29-.469-3.147-1.304l-11.73-11.788a6.828 6.828 0 00-4.689-1.888l-.017.001H10.004v-4.92h14.825c2.938.002 5.559 1.21 7.48 3.15l8.749 8.793 7.073-7.11-8.92-8.963C35.485 2.234 30.45 0 24.805 0H0v25.027h20.978v.002a4.919 4.919 0 013.486 1.48L35.95 38.053A6.74 6.74 0 0040.449 40h31.733a4.911 4.911 0 003.423-1.45l6.491-6.524-.004-.008",
  },
} as const;

function ContactIcon({
  name,
  className = "",
}: {
  name: keyof typeof ICONS;
  className?: string;
}) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      aria-hidden
      className={`block h-[22px] w-auto shrink-0 ${className}`}
      fill="currentColor"
    >
      <path d={icon.d} />
    </svg>
  );
}

export function SocialLogos({
  instagram,
  soundcloud,
  className = "",
}: {
  instagram: string;
  soundcloud: string;
  className?: string;
}) {
  const marks = [
    { label: "Instagram", href: instagram, icon: "instagram" as const },
    { label: "SoundCloud", href: soundcloud, icon: "soundcloud" as const },
  ];

  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {marks.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            className="group inline-flex"
          >
            <ContactIcon
              name={item.icon}
              className="text-black/70 transition-colors group-hover:text-black"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DesktopContact({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mt-8 grid grid-cols-1 gap-y-6 border-t border-black/15 pt-8 md:mt-16 lg:mt-20 lg:grid-cols-[9rem_minmax(0,66rem)] lg:justify-start lg:gap-x-10 ${className}`}
    >
      <p className={aboutMargin}>Contact</p>
      <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-10">
        <a
          href="mailto:info@flowgeist.net"
          className="font-alte-haas-bold text-[18px] leading-tight text-black/85 transition-colors hover:text-black sm:text-[22px] xl:text-[26px]"
        >
          info [at] flowgeist.net
        </a>
        <ul className="ml-auto flex items-center gap-4 sm:gap-5">
          {LINKS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="group inline-flex"
              >
                <ContactIcon
                  name={item.icon}
                  className="text-black/70 transition-colors group-hover:text-black"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`bg-[#BABABA] px-6 pb-[max(3rem,env(safe-area-inset-bottom))] md:px-10 md:pb-14 ${className}`}
    >
      <DesktopContact />
    </footer>
  );
}
