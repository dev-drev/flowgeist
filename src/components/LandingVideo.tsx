"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP_SRC = "/landing/desktop.mp4?v=2";
const MOBILE_SRC = "/landing/mobile.mp4?v=2";
const POSTER_SRC = "/landing/poster.jpg";

type LandingVideoProps = {
  active: boolean;
};

function connectionBlocked() {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const saveData = connection?.saveData === true;
  const slow =
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  return motion || saveData || slow;
}

export default function LandingVideo({ active }: LandingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(connectionBlocked());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || blocked) return;
    video.disableRemotePlayback = true;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const syncPlayback = () => {
      video.muted = true;
      video.volume = 0;
      const shouldPlay = active && !document.hidden;
      if (!shouldPlay) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };

    const keepMuted = () => {
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };

    syncPlayback();
    video.addEventListener("volumechange", keepMuted);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      video.removeEventListener("volumechange", keepMuted);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [active, blocked]);

  return (
    <div className="absolute inset-0 bg-black" aria-hidden="true">
      <img
        src={POSTER_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      {blocked ? null : (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          poster={POSTER_SRC}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
          onVolumeChange={(event) => {
            const video = event.currentTarget;
            if (!video.muted || video.volume !== 0) {
              video.muted = true;
              video.volume = 0;
            }
          }}
        >
          <source src={MOBILE_SRC} type="video/mp4" media="(max-width: 767px)" />
          <source src={DESKTOP_SRC} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
