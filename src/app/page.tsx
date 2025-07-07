"use client";

import { useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CircularProgress from "@/components/CircularProgress";
import DynamicTitle from "@/components/DynamicTitle";
import { getAllSongs } from "@/lib/songImporter";
import { getVideoURL } from "@/lib/firebase";
import { getVideoPath, checkLocalVideoExists } from "@/lib/videoConfig";
import { getFeaturedArtists, Artist } from "@/lib/artistsConfig";

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
  const [isLoading, setIsLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [artists] = useState(getFeaturedArtists());
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isArtistPanelOpen, setIsArtistPanelOpen] = useState(false);

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
        console.log("🎬 Loading video with smart fallback...");

        // Prima prova il video locale
        const localVideoPath = await getVideoPath("output5", true);
        const localVideoExists = await checkLocalVideoExists(localVideoPath);

        if (localVideoExists) {
          setVideoURL(localVideoPath);
          setVideoSource("output5.mp4");
          console.log("✅ Video loaded from local storage (fast)");
        } else {
          console.log("⚠️ Local video not found, trying Firebase...");
          // Fallback a Firebase
          const url = await getVideoURL("output5.mp4");
          setVideoURL(url);
          setVideoSource("output5.mp4");
          console.log("🔄 Video loaded from Firebase Storage");
        }
      } catch (error) {
        console.error("❌ Error loading video:", error);
        // Ultimo fallback
        setVideoURL("/videos/output5.mp4");
        setVideoSource("output5.mp4");
      }
    };

    loadInitialVideo();
  }, []);

  // Hide loader after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

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

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsArtistPanelOpen(true);
  };

  const closeArtistModal = () => {
    setIsArtistModalOpen(false);
    setSelectedArtist(null);
  };

  const closeArtistPanel = () => {
    setIsArtistPanelOpen(false);
    setSelectedArtist(null);
  };

  // Close modal and panel with ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isArtistModalOpen) {
          closeArtistModal();
        }
        if (isArtistPanelOpen) {
          closeArtistPanel();
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isArtistModalOpen, isArtistPanelOpen]);

  return (
    <main className="flex min-h-screen w-full relative">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <ScaleLoader
                color="#ffffff"
                height={40}
                width={4}
                radius={2}
                margin={2}
              />
            </div>
            <p className="text-white text-lg font-grotesque">_flowgeist</p>
          </div>
        </div>
      )}

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
            key={`${videoSource}-${Date.now()}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter:
                colorScheme === "red"
                  ? "hue-rotate(0deg) saturate(1.8) brightness(0.9) contrast(1.2) sepia(0.1)"
                  : "none",
              transform: "scaleY(-1)",
            }}
            onLoadStart={() => {
              console.log("Video loading started");
            }}
            onLoadedMetadata={() => {
              console.log("Video metadata loaded");
              setVideoLoaded(true);
            }}
            onCanPlay={() => {
              console.log("Video can play");
            }}
            onError={(e) => {
              console.error("Video error:", e);
            }}
            ref={(el) => {
              if (el) {
                try {
                  // Imposta la velocità dopo che il video è caricato
                  el.addEventListener("loadedmetadata", () => {
                    el.playbackRate = 0.1; // Rallenta il video al 10% della velocità normale
                  });
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
          <div className="lg:text-[8vw] xl:text-[3vw] text-[30px] font-extrabold tracking-tight text-left text-white font-grotesque pl-4 lg:pl-8">
            _flowgeist
          </div>
          <div className="mt-4 lg:mt-8 text-justify pt-2 lg:pt-10 w-full lg:max-w-[40vw] xl:max-w-[45vw] px-4 lg:pl-8">
            <p className="text-lg lg:text-[1.2vw] xl:text-[1.3vw] leading-relaxed text-white font-grotesque">
              Flowgeist is an interdisciplinary project unfolding through the
              space where structure blurs into abstraction, allowing polyhedral
              sonic textures to merge and momentum to lead. Nothing is overly
              defined.
            </p>

            {/* Artists Section */}
            <div className="mt-8 lg:mt-12 pt-6 border-t border-white/20">
              <h3 className="text-sm lg:text-base font-medium text-white/80 uppercase tracking-wider mb-4 font-grotesque">
                Featured Artists
              </h3>
              <div className="flex space-x-6">
                {artists.map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                    className="flex flex-col items-center group"
                  >
                    <button
                      onClick={() => handleArtistClick(artist)}
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden mb-3 border-2 border-white/20 group-hover:border-white/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className={`w-full h-full object-cover ${
                          artist.id === "artist1" ? "grayscale" : ""
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='.3em'%3E${artist.name.charAt(
                            0
                          )}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </button>
                    <span className="text-xs lg:text-sm text-white/70 font-grotesque text-center">
                      {artist.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Track List */}
        <div className="w-full lg:w-1/2 flex items-start justify-center lg:p-16 p-4">
          <div className="w-full max-w-md p-6 relative">
            {/* Blurry background behind tracks */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-md rounded-lg -z-10"></div>

            <div className="flex items-center justify-between mb-8 border-b-1 pb-4">
              <h2 className="text-2xl font-bold text-white uppercase font-grotesque">
                {useLocalFiles ? "I TUOI FILE" : "AD 93 | DEMOS"}
              </h2>
              <a
                href="https://soundcloud.com/flowgeist"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-full transition-colors border border-white/20 shadow-sm"
              >
                <svg
                  viewBox="0 0 32 32"
                  width="22"
                  height="22"
                  fill="currentColor"
                  className="text-orange-400"
                >
                  <path d="M25.6 18.667c-0.267 0-0.533 0.027-0.8 0.08-0.267-2.987-2.773-5.28-5.867-5.28-0.64 0-1.28 0.107-1.92 0.32-0.267 0.093-0.427 0.373-0.373 0.64v8.213c0 0.267 0.213 0.48 0.48 0.48h8.48c2.027 0 3.68-1.653 3.68-3.68s-1.653-3.68-3.68-3.68zM7.573 22.507c0.267 0 0.48-0.213 0.48-0.48v-6.507c0-0.267-0.213-0.48-0.48-0.48s-0.48 0.213-0.48 0.48v6.507c0 0.267 0.213 0.48 0.48 0.48zM10.293 22.507c0.267 0 0.48-0.213 0.48-0.48v-7.36c0-0.267-0.213-0.48-0.48-0.48s-0.48 0.213-0.48 0.48v7.36c0 0.267 0.213 0.48 0.48 0.48zM13.013 22.507c0.267 0 0.48-0.213 0.48-0.48v-8.213c0-0.267-0.213-0.48-0.48-0.48s-0.48 0.213-0.48 0.48v8.213c0 0.267 0.213 0.48 0.48 0.48z"></path>
                </svg>
                <span className="hidden sm:inline text-[10px]">SOUNDCLOUD</span>
              </a>
            </div>

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

      {/* Expandable Artist Panel */}
      <AnimatePresence>
        {isArtistPanelOpen && (
          <>
            {/* Backdrop for clicking outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-transparent z-30"
              onClick={closeArtistPanel}
            />
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/20 backdrop-blur-md z-40 overflow-hidden"
            >
              {/* Panel Header */}
              <div
                className="flex items-center justify-between p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-white font-grotesque">
                  Featured Artists
                </h3>
                <button
                  onClick={closeArtistPanel}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <motion.div
                initial={false}
                animate={{ opacity: isArtistPanelOpen ? 1 : 0 }}
                transition={{
                  duration: 0.3,
                  delay: isArtistPanelOpen ? 0.2 : 0,
                }}
                className="px-4 pb-6"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedArtist && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex items-start space-x-6 p-6 bg-white/5 rounded-lg border border-white/10"
                  >
                    {/* Artist Image */}
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                      <img
                        src={selectedArtist.image}
                        alt={selectedArtist.name}
                        className={`w-full h-full object-cover ${
                          selectedArtist.id === "artist1" ? "grayscale" : ""
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='.3em'%3E${selectedArtist.name.charAt(
                            0
                          )}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </div>

                    {/* Artist Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl lg:text-3xl font-bold text-white font-grotesque mb-3">
                        {selectedArtist.name}
                      </h4>
                      {selectedArtist.description && (
                        <p className="text-white/80 text-base lg:text-lg leading-relaxed font-grotesque mb-4">
                          {selectedArtist.description}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <a
                          href={selectedArtist.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors font-medium font-grotesque flex items-center space-x-2"
                        >
                          <span>Visit Profile</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Artist Modal */}
      <AnimatePresence>
        {isArtistModalOpen && selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeArtistModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-black/90 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeArtistModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Artist Info */}
              <div className="text-center">
                {/* Artist Image */}
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden mx-auto mb-6 border-2 border-white/30">
                  <img
                    src={selectedArtist.image}
                    alt={selectedArtist.name}
                    className={`w-full h-full object-cover ${
                      selectedArtist.id === "artist1" ? "grayscale" : ""
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='.3em'%3E${selectedArtist.name.charAt(
                        0
                      )}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>

                {/* Artist Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 font-grotesque">
                  {selectedArtist.name}
                </h2>

                {/* Artist Description */}
                {selectedArtist.description && (
                  <p className="text-white/80 text-sm lg:text-base mb-6 leading-relaxed font-grotesque">
                    {selectedArtist.description}
                  </p>
                )}

                {/* Social Links */}
                <div className="space-y-3">
                  <a
                    href={selectedArtist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors font-medium font-grotesque"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                      </svg>
                      <span>View Profile</span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
