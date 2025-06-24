"use client";

import { useEffect, useState } from "react";
import { PT_Mono } from "next/font/google";

const ptMono = PT_Mono({ weight: "400", subsets: ["latin"] });

const description =
  "Artists, producers, free spirits, and sonic explorers. Welcome to our musical universe — a space where every beat speaks, every texture breathes, and every note is a portal to raw emotion, untold ideas, and vivid visions. We're a duo driven by instinct, guided by atmosphere, and inspired by the shadows between silence and sound. In our world, rhythm is language, melody is memory, and experimentation is a way of life. This is not just music. It's a journey — deep, immersive, unpredictable. Step inside. Feel the frequencies. Let go.";

// Track list data
const tracks = [
  { id: 1, title: "Void You Hide", duration: "4:32" },
  { id: 2, title: "The Scarecrow", duration: "3:45" },
  { id: 3, title: "Fatal Faith", duration: "5:18" },
  { id: 4, title: "Like a Bug", duration: "4:07" },
  { id: 5, title: "Veiled Strophes", duration: "6:23" },
  { id: 6, title: "Amarcord", duration: "3:58" },
  { id: 7, title: "Prophets of Lies", duration: "4:51" },
  { id: 8, title: "Vanished Swan", duration: "5:34" },
  { id: 9, title: "Meaningful Quest", duration: "7:12" },
];

export default function Home() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(description.slice(0, i + 1));
      i++;
      if (i === description.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen w-full relative">
      {/* Background Image */}

      {/* Content overlay */}
      <div className="relative z-10 flex w-full">
        {/* Left side - Title and About */}
        <div className="w-1/2 flex items-start justify-left p-16 flex-col">
          <div className="text-[150px] font-extrabold tracking-tight text-left text-black font-grotesque">
            _flowgeist
          </div>
          <div className="mt-8 text-justify  ml-28 pt-10 w-full">
            <p className="text-lg leading-relaxed text-gray-800 font-grotesque">
              Artists, producers, free spirits, and sonic explorers. Welcome to
              our musical universe — a space where every beat speaks, every
              texture breathes, and every note is a portal to raw emotion,
              untold ideas, and vivid visions.
            </p>
            <p className="text-lg leading-relaxed text-gray-800 font-grotesque mt-4">
              We're a duo driven by instinct, guided by atmosphere, and inspired
              by the shadows between silence and sound. In our world, rhythm is
              language, melody is memory, and experimentation is a way of life.
            </p>
            <p className="text-lg leading-relaxed text-gray-800 font-grotesque mt-4">
              This is not just music. It's a journey — deep, immersive,
              unpredictable. Step inside. Feel the frequencies. Let go.
            </p>
          </div>
        </div>

        {/* Right side - Track List */}
        <div className="w-1/2 flex items-start justify-center p-16">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-black uppercase font-grotesque mb-8 border-b-2 border-black pb-2">
              AD 93 | DEMOS
            </h2>
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center space-x-4 group hover:bg-gray-100 p-2 pl-0 rounded transition-colors"
                >
                  {/* Play button */}
                  <button className="cursor-pointer w-8 h-8 text-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <img src="/play.png" alt="play" className="w-4 h-4" />
                  </button>

                  {/* Track title */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black font-grotesque">
                      {track.title}
                    </h3>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-gray-500 font-mono">
                    {track.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
