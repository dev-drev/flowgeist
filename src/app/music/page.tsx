"use client";

import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import { useTracking } from "@/lib/useTracking";

interface Track {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  waveform: string;
}

export default function Music() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(
    new Set()
  );
  const [filter, setFilter] = useState("all");
  const { trackClick, trackDownload, trackView } = useTracking();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/data/tracks.json");
        const data = await response.json();
        setTracks(data.tracks);

        // Simula caricamento di 5 secondi
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const handleDownload = async (track: Track) => {
    setDownloadingTracks((prev) => new Set(prev).add(track.id));

    try {
      // Track the download event
      await trackDownload(track.id, track.title);

      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = track.audioFile;
      link.download = `${track.title}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingTracks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  };

  const filteredTracks =
    filter === "all"
      ? tracks
      : tracks.filter((track) =>
          track.title.toLowerCase().includes(filter.toLowerCase())
        );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <ClipLoader color="#3B82F6" size={80} />
          <h2 className="text-2xl font-bold text-gray-700 mt-6">Loading...</h2>
          <p className="text-gray-500 mt-2">Preparazione della musica per te</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center text-gray-800"
      >
        Music
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 flex justify-center"
      >
        <div className="relative">
          <input
            id="filter"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Cerca tracce..."
            className="border-2 border-gray-300 p-3 rounded-lg w-80 text-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.4 + index * 0.1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            onViewportEnter={() => trackView(track.id, track.title)}
            className="border border-gray-200 p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="font-bold text-xl text-gray-800 mb-1">
                  {track.title}
                </h2>
                <p className="text-gray-600">Durata: {track.duration}</p>
              </div>
            </div>

            {track.waveform && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="mb-4"
              >
                <img
                  src={track.waveform}
                  alt={`Waveform for ${track.title}`}
                  className="w-full h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </motion.div>
            )}

            <motion.button
              onClick={() => {
                trackClick(track.id, track.title);
                handleDownload(track);
              }}
              disabled={downloadingTracks.has(track.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-3 font-semibold transition-all duration-200"
            >
              {downloadingTracks.has(track.id) ? (
                <>
                  <ClipLoader color="#ffffff" size={20} />
                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-16 text-gray-500"
        >
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <p className="text-xl">Nessuna traccia trovata</p>
        </motion.div>
      )}
    </main>
  );
}
