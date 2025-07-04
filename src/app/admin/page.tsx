"use client";

import { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import {
  listAudioFiles,
  checkFileExists,
  testFirebaseAccess,
} from "@/lib/firebase";

export interface Track {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  waveform?: string;
  file?: File; // Per i file caricati localmente
}

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [useLocalFiles] = useState(false);
  const [newTrack, setNewTrack] = useState({
    title: "",
    duration: "",
    audioFile: "",
    waveform: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [firebaseFiles, setFirebaseFiles] = useState<string[]>([]);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const response = await fetch("/api/tracks");
        const data = await response.json();
        setTracks(data.tracks || []);
      } catch (error) {
        console.error("Error loading tracks:", error);
        showMessage("error", "Errore nel caricamento delle tracce");
      }
    };

    if (!useLocalFiles) {
      loadTracks();
    }
  }, [useLocalFiles]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUploadError = (error: string) => {
    showMessage("error", `Errore upload: ${error}`);
  };

  const createTrack = async (trackData: Track) => {
    try {
      const response = await fetch("/api/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trackData.title,
          duration: trackData.duration,
          audio_file: trackData.audioFile,
          waveform: trackData.waveform,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTracks([...tracks, result.track]);
        setIsAdding(false);
        setNewTrack({ title: "", duration: "", audioFile: "", waveform: "" });
      }
    } catch (error) {
      console.error("Error creating track:", error);
    }
  };

  const updateTrack = async (trackData: Track) => {
    try {
      const response = await fetch("/api/tracks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: trackData.id,
          title: trackData.title,
          duration: trackData.duration,
          audio_file: trackData.audioFile,
          waveform: trackData.waveform,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedTracks = tracks.map((track) =>
          track.id === trackData.id ? result.track : track
        );
        setTracks(updatedTracks);
        setEditingTrack(null);
      }
    } catch (error) {
      console.error("Error updating track:", error);
    }
  };

  const deleteTrack = async (trackId: number) => {
    try {
      const response = await fetch(`/api/tracks?id=${trackId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedTracks = tracks.filter((track) => track.id !== trackId);
        setTracks(updatedTracks);
      }
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  const handleEdit = (track: Track) => {
    setEditingTrack(track);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (editingTrack) {
      updateTrack(editingTrack);
    } else if (isAdding) {
      const newTrackWithId = {
        ...newTrack,
        id: Math.max(...tracks.map((t) => t.id), 0) + 1,
      };
      createTrack(newTrackWithId);
    }
  };

  const handleDelete = (trackId: number) => {
    if (confirm("Are you sure you want to delete this track?")) {
      deleteTrack(trackId);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingTrack(null);
  };

  const checkFirebaseFiles = async () => {
    try {
      const files = await listAudioFiles();
      setFirebaseFiles(files);
      showMessage(
        "success",
        `Trovati ${files.length} file su Firebase Storage`
      );
    } catch (error) {
      showMessage(
        "error",
        `Errore nel controllo dei file Firebase: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testFirebase = async () => {
    try {
      const result = await testFirebaseAccess();
      if (result.success) {
        showMessage(
          "success",
          `Firebase test successful! Found ${result.files.length} files`
        );
        setFirebaseFiles(result.files);
      } else {
        showMessage("error", `Firebase test failed: ${result.error}`);
      }
    } catch (error) {
      showMessage(
        "error",
        `Firebase test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-grotesque">
              FLOWGEIST ADMIN
            </h1>
            <div className="flex gap-4">
              <button
                onClick={handleAdd}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-grotesque"
              >
                Add New Track
              </button>
              <button
                onClick={checkFirebaseFiles}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-grotesque"
              >
                Check Firebase Files
              </button>
              <button
                onClick={testFirebase}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-grotesque"
              >
                Test Firebase
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* File Upload Component */}
          <FileUpload onUploadError={handleUploadError} />

          {/* Firebase Files Status */}
          {firebaseFiles.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2 font-grotesque">
                File su Firebase Storage ({firebaseFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {firebaseFiles.map((fileName, index) => (
                  <div
                    key={index}
                    className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded"
                  >
                    {fileName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status indicator */}
          {useLocalFiles && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              <strong>Modalità file locali:</strong> I file vengono gestiti solo
              in memoria. Non vengono salvati sul server.
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingTrack) && (
            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4 font-grotesque">
                {isAdding ? "Add New Track" : "Edit Track"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={
                      isAdding ? newTrack.title : editingTrack?.title || ""
                    }
                    onChange={(e) => {
                      if (isAdding) {
                        setNewTrack({ ...newTrack, title: e.target.value });
                      } else if (editingTrack) {
                        setEditingTrack({
                          ...editingTrack,
                          title: e.target.value,
                        });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="4:32"
                    value={
                      isAdding
                        ? newTrack.duration
                        : editingTrack?.duration || ""
                    }
                    onChange={(e) => {
                      if (isAdding) {
                        setNewTrack({ ...newTrack, duration: e.target.value });
                      } else if (editingTrack) {
                        setEditingTrack({
                          ...editingTrack,
                          duration: e.target.value,
                        });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                {!useLocalFiles && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audio File Path
                      </label>
                      <input
                        type="text"
                        placeholder="/audio/track1.wav"
                        value={
                          isAdding
                            ? newTrack.audioFile
                            : editingTrack?.audioFile || ""
                        }
                        onChange={(e) => {
                          if (isAdding) {
                            setNewTrack({
                              ...newTrack,
                              audioFile: e.target.value,
                            });
                          } else if (editingTrack) {
                            setEditingTrack({
                              ...editingTrack,
                              audioFile: e.target.value,
                            });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waveform Path
                      </label>
                      <input
                        type="text"
                        placeholder="/waveforms/track1.png"
                        value={
                          isAdding
                            ? newTrack.waveform
                            : editingTrack?.waveform || ""
                        }
                        onChange={(e) => {
                          if (isAdding) {
                            setNewTrack({
                              ...newTrack,
                              waveform: e.target.value,
                            });
                          } else if (editingTrack) {
                            setEditingTrack({
                              ...editingTrack,
                              waveform: e.target.value,
                            });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-grotesque"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingTrack(null);
                    setNewTrack({
                      title: "",
                      duration: "",
                      audioFile: "",
                      waveform: "",
                    });
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-grotesque"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tracks List */}
          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 font-mono w-8">
                      {String(track.id).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 font-grotesque">
                        {track.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {track.duration} •{" "}
                        {track.file
                          ? `File: ${track.file.name}`
                          : track.audioFile}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(track)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-grotesque"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm font-grotesque"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {tracks.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {useLocalFiles ? "Loading..." : "Loading..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
