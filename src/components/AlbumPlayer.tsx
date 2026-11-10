"use client";

import { useState } from "react";

const TRACKS = [
  ["Molecules (Feat. Zainab J Lascandri)", "03:40"],
  ["Like A Bug", "04:38"],
  ["Fatal Faith", "04:09"],
  ["The Scarecrow", "03:31"],
  ["Prophet Of Lies", "03:42"],
  ["Think U Know", "04:20"],
  ["Void You Hide", "04:13"],
  ["Lost Mankind", "04:46"],
  ["Crystal Muse", "03:19"],
  ["Meaningful Quest", "04:47"],
] as const;

// Bandcamp's large player is a white panel we can't restyle. These offsets
// hide its title / buy / share bar and line our type up with its track rows,
// which stay clickable underneath. Rows start at 126px and are 33px tall.
const CROP = 54;
const LIST_TOP = 126;
const ROW = 33;
const IFRAME_HEIGHT = 520;

const SRC =
  "https://bandcamp.com/EmbeddedPlayer/album=928316097/size=large/bgcol=bababa/linkcol=333333/tracklist=true/artwork=none/transparent=true/";

export default function AlbumPlayer() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className="relative mt-8 overflow-hidden"
      style={{ height: LIST_TOP - CROP + TRACKS.length * ROW }}
      onClick={(event) => {
        const list = event.currentTarget.querySelector("ol");
        if (!list) return;
        const index = Math.floor(
          (event.clientY - list.getBoundingClientRect().top) / ROW,
        );
        if (index >= 0 && index < TRACKS.length) setActive(index);
      }}
    >
      <iframe
        title="Play Flowgeist [EVIGHET007] on Bandcamp"
        src={SRC}
        allow="autoplay"
        className="absolute border-0 bg-transparent mix-blend-multiply"
        style={{
          top: -CROP,
          left: -3,
          width: "calc(100% + 6px)",
          height: IFRAME_HEIGHT,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 bg-[#BABABA]"
        style={{ top: 40, left: 64, right: 0 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bg-[#BABABA]"
        style={{ top: LIST_TOP - CROP - 18 }}
      >
        <div style={{ height: 18 }} />
        <ol>
          {TRACKS.map(([title, time], index) => (
            <li
              key={title}
              className={`flex items-center border-b border-black/15 ${
                active === index ? "text-black/90" : "text-[#5c5c5c]"
              }`}
              style={{ height: ROW }}
            >
              <span className="w-9 shrink-0 font-pt-mono text-[11px] font-semibold tracking-[0.14em] text-black/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-alte-haas-bold text-[15px] leading-none md:text-[17px]">
                {title}
              </span>
              <span className="pl-4 font-pt-mono text-[11px] font-semibold tabular-nums text-black/45">
                {time}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
