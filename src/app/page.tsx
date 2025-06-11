"use client";

import { useEffect, useState } from "react";
import { PT_Mono } from "next/font/google";

const ptMono = PT_Mono({ weight: "400", subsets: ["latin"] });

const description =
  "Artists, producers, free spirits, and sonic explorers. Welcome to our musical universe — a space where every beat speaks, every texture breathes, and every note is a portal to raw emotion, untold ideas, and vivid visions. We're a duo driven by instinct, guided by atmosphere, and inspired by the shadows between silence and sound. In our world, rhythm is language, melody is memory, and experimentation is a way of life. This is not just music. It's a journey — deep, immersive, unpredictable. Step inside. Feel the frequencies. Let go.";

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
    <main className="flex min-h-[80vh] w-full">
      <div className="w-1/2 flex items-center justify-center">
        <div className="text-[200px] font-extrabold tracking-tight uppercase leading-[0.8] text-left">
          <div>.FLOW</div>
          <div className="-mt-2 text-[215px]">GEIST.</div>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <div className="flex flex-col items-center w-full">
          <p className={"text-lg max-w-md text-black mb-8 " + ptMono.className}>
            {typed}
            <span className="animate-pulse">|</span>
          </p>
          <div className="w-full max-w-md mt-8">
            <iframe
              width="100%"
              height="120"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/marcobruno_evighet/sets/discography&color=%23000000&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
              title="SoundCloud Player"
              className="rounded-xl"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
