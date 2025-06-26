"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onUploadError: (error: string) => void;
}

export default function FileUpload({ onUploadError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validazione file
    if (!file.type.startsWith("audio/")) {
      onUploadError("Seleziona un file audio valido (MP3, WAV, etc.)");
      return;
    }

    // Validazione dimensione file (50MB limite Supabase gratuito)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      onUploadError(`File troppo grande: ${fileSizeMB}MB. Limite massimo: 50MB. 
      
Suggerimenti:
• Comprimi il file audio
• Usa un formato più piccolo (MP3 invece di WAV)
• Upgrading a Supabase Pro per file fino a 5GB`);
      return;
    }

    // Imposta il titolo dal nome del file se non specificato
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed("");
    setTimeRemaining("");

    // Simula progress bar per upload diretto
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      setTitle("");
      setDuration("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Reset progress dopo 3 secondi
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setUploadSpeed("");
        setTimeRemaining("");
      }, 3000);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSpeed("");
      setTimeRemaining("");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8">
      <h3 className="text-lg font-bold mb-4 font-grotesque">
        Upload Nuovo File Audio
      </h3>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Audio
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <button
            onClick={handleClick}
            disabled={isUploading}
            className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-300 font-grotesque ${
              isUploading
                ? "border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed"
                : "border-gray-300 hover:border-black hover:bg-gray-50"
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Upload in corso...</span>
              </div>
            ) : (
              "Seleziona file audio"
            )}
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titolo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo della traccia"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            disabled={isUploading}
          />
        </div>

        {/* Duration Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durata
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="4:32"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            disabled={isUploading}
          />
        </div>

        {/* Progress Bar with Details */}
        {isUploading && (
          <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">
                {uploadProgress.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {uploadSpeed}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Upload in corso...</span>
              {timeRemaining && <span>⏱️ {timeRemaining} rimanenti</span>}
            </div>

            {/* Progress indicator dots */}
            <div className="flex justify-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  uploadProgress > 0 ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  uploadProgress > 25 ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  uploadProgress > 50 ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  uploadProgress > 75 ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  uploadProgress === 100 ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
