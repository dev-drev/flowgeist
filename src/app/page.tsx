"use client";

import { useEffect, useState, useRef } from "react";
import { PT_Mono } from "next/font/google";
import DynamicTitle from "@/components/DynamicTitle";
import { getAllSongs } from "@/lib/songImporter";

const ptMono = PT_Mono({ weight: "400", subsets: ["latin"] });

const description =
  "Artists, producers, free spirits, and sonic explorers. Welcome to our musical universe — a space where every beat speaks, every texture breathes, and every note is a portal to raw emotion, untold ideas, and vivid visions. We're a duo driven by instinct, guided by atmosphere, and inspired by the shadows between silence and sound. In our world, rhythm is language, melody is memory, and experimentation is a way of life. This is not just music. It's a journey — deep, immersive, unpredictable. Step inside. Feel the frequencies. Let go.";

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
            <img src="/play.png" alt="play" className="w-4 h-4" />
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
      />
    </div>
  );
};

// File Upload Component
const FileUpload = ({
  onFilesSelected,
}: {
  onFilesSelected: (files: File[]) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length > 0) {
      onFilesSelected(audioFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return <div></div>;
};

export default function Home() {
  const [typed, setTyped] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [useLocalFiles, setUseLocalFiles] = useState(false);

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

  // Typewriter effect for description
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(description.slice(0, i + 1));
      i++;
      if (i === description.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

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

  const handleFilesSelected = (files: File[]) => {
    const newTracks: Track[] = files.map((file, index) => ({
      id: index + 1,
      title: file.name.replace(/\.[^/.]+$/, ""), // Rimuove l'estensione
      duration: "0:00", // Sarà calcolata quando il file viene caricato
      audioFile: "",
      file: file,
    }));

    setTracks(newTracks);
    setUseLocalFiles(true);
    setIsPlaying(false);
    setCurrentTrackId(null);
  };

  const handleResetToDefault = () => {
    setUseLocalFiles(false);
    setTracks([]);
    setIsPlaying(false);
    setCurrentTrackId(null);
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
          <div className="lg:text-[150px] text-[50px] font-extrabold tracking-tight text-left text-black font-grotesque">
            _flowgeist
          </div>
          <div className="mt-8 text-justify lg:ml-28 pt-10 w-full lg:max-w-[600px] px-4 lg:px-0">
            <p className="text-lg leading-relaxed text-gray-800 font-grotesque">
              Flowgeist is a project guided by instinct and emotion, unfolding
              in that hazy space where structure softens into abstraction. With
              genre deliberately left aside, it merges polyhedral sonic ranges
              by letting feeling take the lead. Nothing is overly defined.
            </p>
          </div>
        </div>

        {/* Right side - Track List */}
        <div className="w-full lg:w-1/2 flex items-start justify-center lg:p-16 p-4">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-black uppercase font-grotesque mb-8 border-b-2 border-black pb-2">
              {useLocalFiles ? "I TUOI FILE" : "AD 93 | DEMOS"}
            </h2>

            {/* File Upload Controls */}
            <div className="mb-6 flex gap-2">
              {!useLocalFiles && (
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "audio/*";
                    input.onchange = (e) => {
                      const files = Array.from(
                        (e.target as HTMLInputElement).files || []
                      );
                      if (files.length > 0) {
                        handleFilesSelected(files);
                      }
                    };
                    input.click();
                  }}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-grotesque text-sm"
                >
                  Carica file audio
                </button>
              )}
              {useLocalFiles && (
                <button
                  onClick={handleResetToDefault}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors font-grotesque text-sm"
                >
                  Torna ai demo
                </button>
              )}
            </div>

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
