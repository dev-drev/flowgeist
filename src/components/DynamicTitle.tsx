"use client";

import { useEffect } from "react";

interface DynamicTitleProps {
  isPlaying: boolean;
  currentTrackTitle?: string;
  baseTitle?: string;
}

export default function DynamicTitle({
  isPlaying,
  currentTrackTitle,
  baseTitle = "_flowgeist",
}: DynamicTitleProps) {
  useEffect(() => {
    let title: string;

    if (isPlaying && currentTrackTitle) {
      // Quando sta riproducendo
      title = `▶ ${currentTrackTitle} - ${baseTitle}`;
    } else if (currentTrackTitle) {
      // Quando è selezionata ma non in riproduzione
      title = `⏸ ${currentTrackTitle} - ${baseTitle}`;
    } else {
      // Titolo di default
      title = baseTitle;
    }

    document.title = title;
  }, [isPlaying, currentTrackTitle, baseTitle]);

  return null; // Questo componente non renderizza nulla
}
