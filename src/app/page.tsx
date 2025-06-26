"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import DynamicTitle from "@/components/DynamicTitle";
import { getAllSongs } from "@/lib/songImporter";

// TypeScript interfaces
interface Track {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  waveform?: string;
  file?: File; // Per i file caricati localmente
}

interface AudioPlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: (trackId: number | null) => void;
  currentTrackId: number | null;
}

// Audio Player Component
const AudioPlayer = ({
  track,
  isPlaying,
  onTogglePlay,
  currentTrackId,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isCurrentTrack = currentTrackId === track.id;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && isCurrentTrack) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isCurrentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, []);

  const handleTogglePlay = () => {
    if (isCurrentTrack && isPlaying) {
      onTogglePlay(null);
    } else {
      onTogglePlay(track.id);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 group hover:bg-gray-100 p-3 lg:p-2 pl-0 rounded transition-colors w-full">
        <button
          onClick={handleTogglePlay}
          className="cursor-pointer w-8 h-8 text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          {isPlaying && isCurrentTrack ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <Image src="/play.png" alt="play" width={16} height={16} />
          )}
        </button>

        {/* Track title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg lg:text-lg font-medium text-black font-grotesque truncate">
            {track.title}
          </h3>
        </div>

        {/* Duration */}
        <div className="text-sm text-gray-500 font-mono flex-shrink-0">
          {isCurrentTrack ? formatTime(currentTime) : track.duration}
        </div>
      </div>

      {/* Progress Bar - Only show for current track */}
      {isCurrentTrack && (
        <div className="px-12 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-mono w-8">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #000 0%, #000 ${
                  (currentTime / (duration || 1)) * 100
                }%, #e5e7eb ${
                  (currentTime / (duration || 1)) * 100
                }%, #e5e7eb 100%)`,
              }}
            />
            <span className="text-xs text-gray-500 font-mono w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={track.file ? URL.createObjectURL(track.file) : track.audioFile}
        preload="metadata"
        onEnded={() => onTogglePlay(null)}
        onError={(e) => {
          console.error("Audio error for:", track.title, e);
          console.error("Audio src:", track.audioFile);
        }}
        onLoadStart={() => {
          console.log("Loading audio:", track.title, track.audioFile);
        }}
        onCanPlay={() => {
          console.log("Audio can play:", track.title);
        }}
      />
    </div>
  );
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [useLocalFiles] = useState(false);

  // Get current track title for dynamic title
  const currentTrack = tracks.find((track) => track.id === currentTrackId);

  // Load tracks from public/songs folder
  useEffect(() => {
    if (!useLocalFiles) {
      loadSongsFromPublic();
    }
  }, [useLocalFiles]);

  const loadSongsFromPublic = async () => {
    try {
      // Importa tutti i songs disponibili
      const songFiles = getAllSongs();
      setTracks(songFiles);
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  };

  const handleTogglePlay = (trackId: number | null) => {
    if (currentTrackId === trackId) {
      // Stop current track
      setIsPlaying(false);
      setCurrentTrackId(null);
    } else {
      // Play new track
      setIsPlaying(true);
      setCurrentTrackId(trackId);
    }
  };

  return (
    <main className="flex min-h-screen w-full relative">
      {/* Dynamic Title Component */}
      <DynamicTitle
        isPlaying={isPlaying}
        currentTrackTitle={currentTrack?.title}
        baseTitle="_flowgeist"
      />

      {/* Background Image */}

      {/* Content overlay */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left side - Title and About */}
        <div className="lg:w-1/2 flex items-start justify-left lg:p-8 p-4 flex-col">
          <div className="lg:text-[8vw] xl:text-[10vw] text-[60px] font-extrabold tracking-tight text-left text-black font-grotesque">
            _flowgeist
          </div>
          <div className="mt-4 lg:mt-8 text-justify lg:ml-[2vw] xl:ml-[3vw] pt-2 lg:pt-10 w-full lg:max-w-[40vw] xl:max-w-[45vw] px-4 lg:pl-16">
            <p className="text-lg lg:text-[1.2vw] xl:text-[1.3vw] leading-relaxed text-gray-800 font-grotesque">
              Flowgeist is a project guided by instinct and emotion, unfolding
              in that hazy space where structure softens into abstraction. With
              genre deliberately left aside, it merges polyhedral sonic ranges
              by letting feeling take the lead. Nothing is overly defined.
            </p>
          </div>
        </div>

        {/* Right side - Track List */}
        <div className="w-full lg:w-1/2 flex items-start justify-center lg:p-16 p-4">
          <div className="w-full max-w-md px-4 lg:px-0">
            <h2 className="text-2xl font-bold text-black uppercase font-grotesque mb-8 border-b-2 border-black pb-2">
              {useLocalFiles ? "I TUOI FILE" : "AD 93 | DEMOS"}
            </h2>

            {/* File Upload Controls */}

            <div className="space-y-4">
              {tracks.map((track) => (
                <AudioPlayer
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  currentTrackId={currentTrackId}
                />
              ))}

              {tracks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {useLocalFiles
                    ? "Nessun file caricato"
                    : "Caricamento tracce..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
