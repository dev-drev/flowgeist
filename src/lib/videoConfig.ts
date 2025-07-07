// Configurazione per i video di background
export const VIDEO_CONFIG = {
  // Video principale
  mainVideo: {
    localPath: "/videos/output5.mp4",
    firebasePath: "output5.mp4",
    fallbackPath: "/videos/fallback.mp4",
  },

  // Altri video disponibili
  videos: {
    output1: {
      localPath: "/videos/output1.mp4",
      firebasePath: "output1.mp4",
    },
    output2: {
      localPath: "/videos/output2.mp4",
      firebasePath: "output2.mp4",
    },
    output3: {
      localPath: "/videos/output3.mp4",
      firebasePath: "output3.mp4",
    },
    output4: {
      localPath: "/videos/output4.mp4",
      firebasePath: "output4.mp4",
    },
    output5: {
      localPath: "/videos/output5.mp4",
      firebasePath: "output5.mp4",
    },
  },
};

// Funzione per ottenere il percorso del video con fallback intelligente
export const getVideoPath = async (
  videoName: string,
  useLocal: boolean = true
): Promise<string> => {
  if (useLocal) {
    const videoConfig =
      VIDEO_CONFIG.videos[videoName as keyof typeof VIDEO_CONFIG.videos];
    if (videoConfig) {
      return videoConfig.localPath;
    }
    // Fallback al video principale se non trovato
    return VIDEO_CONFIG.mainVideo.localPath;
  }

  // Se non si usa il locale, ritorna il percorso Firebase
  const videoConfig =
    VIDEO_CONFIG.videos[videoName as keyof typeof VIDEO_CONFIG.videos];
  if (videoConfig) {
    return videoConfig.firebasePath;
  }
  return VIDEO_CONFIG.mainVideo.firebasePath;
};

// Funzione per verificare se un video locale esiste
export const checkLocalVideoExists = async (
  videoPath: string
): Promise<boolean> => {
  try {
    const response = await fetch(videoPath, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};
