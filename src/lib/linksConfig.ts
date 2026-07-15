export interface LinkItem {
  id: string;
  label: string;
  href: string;
  /** Path under /public or absolute URL. Falls back to initials if missing. */
  icon?: string;
  /** Large image for featured cards (defaults to icon). */
  image?: string;
  /** Featured = large image card (Berghain style). */
  variant?: "default" | "featured";
}

export interface LinkSection {
  id: string;
  /** Optional centered section title (e.g. "Album") */
  title?: string;
  links: LinkItem[];
}

/** Sourced from https://linktr.ee/flowgeist */
export const LINK_SECTIONS: LinkSection[] = [
  {
    id: "tickets",
    title: "Tickets - Kantine am Berghain",
    links: [
      {
        id: "berghain",
        label: "Flowgeist — Berghain",
        href: "https://www.berghain.berlin/de/event/82079",
        variant: "featured",
        image:
          "https://ugc.production.linktr.ee/86e41e4c-eaf0-4ac4-9f23-b7cc3fa10514_Screenshot-2026-07-15-alle-20.10.57.png",
      },
      {
        id: "resident-advisor",
        label: "Resident Advisor (Early Birds)",
        href: "https://ra.co/events/2421761",
        icon: "https://ugc.production.linktr.ee/9f774819-d4bb-48f3-a08c-ad1b4c663c80_20240301130827-ResidentAdvisor-logo.png",
      },
      {
        id: "eventbrite",
        label: "Eventbrite Promo 2x1",
        href: "https://www.eventbrite.com/e/flowgeist-live-in-berlin-tickets-1993937382386",
        icon: "https://ugc.production.linktr.ee/08e79389-b7ea-4d90-8992-0b5bd8615dfc_eventbrite.png",
      },
      {
        id: "bandsintown",
        label: "Bandsintown Tickets",
        href: "https://www.bandsintown.com/de/e/1038747477-flowgeist-at-kantine-am-berghain",
        icon: "https://ugc.production.linktr.ee/bd0f368b-44ae-4e20-b67e-dee4de98c834_bandsintown.png",
      },
    ],
  },
  {
    id: "album",
    title: "Album",
    links: [
      {
        id: "bandcamp",
        label: "Bandcamp",
        href: "https://flowgeist.bandcamp.com",
        icon: "https://assets.production.linktr.ee/tabler-icons/outline/brand-bandcamp.svg",
      },
      {
        id: "soundcloud",
        label: "SoundCloud",
        href: "https://www.soundcloud.com/flowgeist",
        icon: "https://assets.production.linktr.ee/tabler-icons/outline/brand-soundcloud.svg",
      },
    ],
  },
  {
    id: "connect",
    title: "Connect with us!",
    links: [
      {
        id: "website-booking",
        label: "Website / Booking",
        href: "https://flowgeist.net",
        icon: "https://ugc.production.linktr.ee/4d042f5c-205c-4ebb-8555-4c7d786b4932_Flowgeist-Logo-Square.png",
      },
    ],
  },
];
