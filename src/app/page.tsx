"use client";

import { useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CircularProgress from "@/components/CircularProgress";
import DynamicTitle from "@/components/DynamicTitle";
import { getAllSongs } from "@/lib/songImporter";
import { getVideoURL } from "@/lib/firebase";

// TypeScript interfaces
interface Track {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  waveform?: string;
  file?: File; // Per i file caricati localmente
  isFirebase?: boolean; // Indica se il file viene da Firebase Storage
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
  isPreloaded,
}: AudioPlayerProps & { isPreloaded: boolean }) => {
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
        // Reset position to 0 when switching tracks
        if (!isCurrentTrack) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
      }
    }
  }, [isPlaying, isCurrentTrack]);

  // Reset position when track becomes current
  useEffect(() => {
    if (isCurrentTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [isCurrentTrack]);

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
    <motion.div
      className="w-full"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-4 group p-3 lg:p-2 pl-0 rounded transition-colors w-full">
        <button
          onClick={handleTogglePlay}
          disabled={!isPreloaded}
          className={`cursor-pointer w-8 h-8 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0 ${
            !isPreloaded ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {!isPreloaded ? (
            <ScaleLoader
              color="#ffffff"
              height={16}
              width={2}
              radius={2}
              margin={1}
            />
          ) : isPlaying && isCurrentTrack ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Track title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg lg:text-lg font-medium text-white font-grotesque truncate">
            {track.title}
          </h3>
        </div>

        {/* Duration */}
        <div className="text-sm text-white/80 font-mono flex-shrink-0">
          {isCurrentTrack ? formatTime(currentTime) : track.duration}
        </div>
      </div>

      {/* Progress Bar - Only show for current track */}
      {isCurrentTrack && (
        <div className="px-12 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/80 font-mono w-8">
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
            <span className="text-xs text-white/80 font-mono w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={track.file ? URL.createObjectURL(track.file) : track.audioFile}
        preload="metadata"
        onEnded={() => {
          // Reset position when track ends
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
          onTogglePlay(null);
        }}
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
    </motion.div>
  );
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [useLocalFiles] = useState(false);
  const [isLoadingFromFirebase, setIsLoadingFromFirebase] = useState(false);
  const [preloadedTracks, setPreloadedTracks] = useState<Set<number>>(
    new Set()
  );
  const [videoSource, setVideoSource] = useState("");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState("normal");

  // Get current track title for dynamic title
  const currentTrack = tracks.find((track) => track.id === currentTrackId);

  // Track page view on component mount
  useEffect(() => {
    // Removed useAnalytics hook, so no tracking here
  }, []);

  // Load initial video from Firebase Storage
  useEffect(() => {
    const loadInitialVideo = async () => {
      try {
        const url = await getVideoURL("output4.mp4");
        setVideoURL(url);
        setVideoSource("output4.mp4");
      } catch (error) {
        console.error("Error loading initial video:", error);
        // Fallback to local file if Firebase fails
        setVideoURL("/output4.mp4");
        setVideoSource("output4.mp4");
      }
    };

    loadInitialVideo();
  }, []);

  // Change video source to output.mp4 and activate red color after 15 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const url = await getVideoURL("output.mp4");
        setVideoURL(url);
        setVideoSource("output.mp4");
        setColorScheme("red");
      } catch (error) {
        console.error("Error loading second video:", error);
        // Fallback to local file if Firebase fails
        setVideoURL("/output.mp4");
        setVideoSource("output.mp4");
        setColorScheme("red");
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Disable color filters after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setColorScheme("normal");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Load tracks from public/songs folder
  useEffect(() => {
    if (!useLocalFiles) {
      loadSongsFromFirebase();
    }
  }, [useLocalFiles]);

  // Preload audio files for better performance
  useEffect(() => {
    if (tracks.length > 0) {
      preloadAudioFiles();
    }
  }, [tracks]);

  const preloadAudioFiles = async () => {
    const audioElements: HTMLAudioElement[] = [];

    tracks.forEach((track) => {
      const audio = new Audio();
      audio.src = track.audioFile;
      audio.preload = "metadata";

      audio.addEventListener("loadedmetadata", () => {
        setPreloadedTracks((prev) => new Set([...prev, track.id]));
      });

      audioElements.push(audio);
    });
  };

  const loadSongsFromFirebase = async () => {
    try {
      setIsLoadingFromFirebase(true);
      // Carica i songs da Firebase Storage
      const songFiles = await getAllSongs();

      if (songFiles.length > 0) {
        // Mostra subito le tracce, anche se non sono ancora preloadate
        setTracks(songFiles);
        console.log("✅ Songs loaded from Firebase Storage");
      } else {
        // Fallback ai file locali se Firebase non funziona
        console.log("⚠️ No songs from Firebase, using local files as fallback");
        const { getSongsLocal } = await import("@/lib/songImporter");
        const localSongs = getSongsLocal();
        setTracks(localSongs);
      }
    } catch (error) {
      console.error("Error loading songs from Firebase:", error);
      // Fallback ai file locali
      console.log("🔄 Falling back to local files");
      const { getSongsLocal } = await import("@/lib/songImporter");
      const localSongs = getSongsLocal();
      setTracks(localSongs);
    } finally {
      setIsLoadingFromFirebase(false);
    }
  };

  const handleTogglePlay = (trackId: number | null) => {
    if (currentTrackId === trackId) {
      // Stop current track
      setIsPlaying(false);
      // Removed useAnalytics hook, so no tracking here
      setCurrentTrackId(null);
    } else {
      // Play new track - always reset position
      const newTrack = tracks.find((track) => track.id === trackId);
      if (newTrack) {
        // Removed useAnalytics hook, so no tracking here
      }
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

      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        {videoURL && (
          <video
            key={videoSource}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter:
                colorScheme === "red"
                  ? "hue-rotate(0deg) saturate(1.8) brightness(0.9) contrast(1.2) sepia(0.1)"
                  : "none",
              transform: "scaleY(-1)",
            }}
            ref={(el) => {
              if (el) {
                try {
                  el.playbackRate = 0.1; // Rallenta il video al 10% della velocità normale
                } catch (error) {
                  console.log("Playback rate adjustment failed:", error);
                }
              }
            }}
          >
            <source src={videoURL} type="video/mp4" />
          </video>
        )}
        {/* Overlay condizionale per colorare il video e migliorare la leggibilità del testo */}
        {colorScheme === "red" ? (
          <>
            <div className="absolute inset-0 bg-red-900/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-red-950/40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-black/30"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-black/10"></div>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left side - Title and About */}
        <div className="lg:w-1/2 flex items-start justify-left lg:p-16 p-4 flex-col">
          <div className="lg:text-[8vw] xl:text-[3vw] text-[60px] font-extrabold tracking-tight text-left text-white font-grotesque lg:pl-8">
            _flowgeist
          </div>
          <div className="mt-4 lg:mt-8 text-justify pt-2 lg:pt-10 w-full lg:max-w-[40vw] xl:max-w-[45vw] px-4 lg:pl-8">
            <p className="text-lg lg:text-[1.2vw] xl:text-[1.3vw] leading-relaxed text-white font-grotesque">
              Flowgeist is an interdisciplinary project unfolding through the
              space where structure blurs into abstraction, allowing polyhedral
              sonic textures to merge and momentum to lead. Nothing is overly
              defined.
            </p>
          </div>
        </div>

        {/* Right side - Track List */}
        <div className="w-full lg:w-1/2 flex items-start justify-center lg:p-16 p-4">
          <div className="w-full max-w-md px-4 lg:px-0">
            <h2 className="text-2xl font-bold text-white uppercase font-grotesque mb-8 border-b-2 border-white pb-2">
              {useLocalFiles ? "I TUOI FILE" : "AD 93 | DEMOS"}
            </h2>

            {/* Loading indicator for individual tracks */}
            {!useLocalFiles && isLoadingFromFirebase && tracks.length === 0 && (
              <div className="mb-4 text-center">
                <p className="text-sm text-white">Loading...</p>
              </div>
            )}

            {/* File Upload Controls */}

            <div className="space-y-4">
              <AnimatePresence>
                {tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1, // Delay progressivo per effetto cascade
                      ease: "easeOut",
                    }}
                  >
                    <AudioPlayer
                      track={track}
                      isPlaying={isPlaying}
                      onTogglePlay={handleTogglePlay}
                      currentTrackId={currentTrackId}
                      isPreloaded={preloadedTracks.has(track.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
