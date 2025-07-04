// Sistema per importare automaticamente i file audio da Firebase Storage

import { getAudioURL } from "./firebase";

export interface SongFile {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  originalName: string;
  size?: number;
  isFirebase?: boolean;
}

// Lista dei file audio disponibili su Firebase Storage
export const AVAILABLE_SONGS: SongFile[] = [
  {
    id: 1,
    title: "Void You Hide",
    duration: "4:32",
    audioFile: "", // Sarà popolato dinamicamente da Firebase
    originalName: "Void You Hide.wav",
    size: 69,
  },
  {
    id: 2,
    title: "The Scarecrow",
    duration: "7:12",
    audioFile: "",
    originalName: "The Scarecrow.wav",
    size: 76,
  },
  {
    id: 3,
    title: "Fatal Faith",
    duration: "5:18",
    audioFile: "",
    originalName: "Fatal Faith.wav",
    size: 71,
  },
  {
    id: 4,
    title: "Like a Bug",
    duration: "5:18",
    audioFile: "",
    originalName: "Like a Bug.wav",
    size: 71,
  },
  {
    id: 5,
    title: "Veiled Strophes",
    duration: "6:23",
    audioFile: "",
    originalName: "Veiled Strophes.wav",
    size: 76,
  },
  {
    id: 6,
    title: "Amarcord",
    duration: "3:58",
    audioFile: "",
    originalName: "Amarcord.wav",
    size: 61,
  },
  {
    id: 7,
    title: "Prophets of Lies",
    duration: "4:51",
    audioFile: "",
    originalName: "Prophets of Lies.wav",
    size: 67,
  },
  {
    id: 8,
    title: "Vanished Swan",
    duration: "5:34",
    audioFile: "",
    originalName: "Vanished Swan.wav",
    size: 71,
  },
  {
    id: 9,
    title: "Meaningful Quest",
    duration: "7:12",
    audioFile: "",
    originalName: "Meaningful Quest.wav",
    size: 76,
  },
];

// Funzione per ottenere tutti i songs da Firebase Storage
export const getAllSongs = async (): Promise<SongFile[]> => {
  try {
    console.log("🚀 Starting to load songs from Firebase Storage...");

    // Timeout di 15 secondi per evitare caricamento infinito
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Timeout: Firebase request took too long")),
        15000
      );
    });

    const loadPromise = async () => {
      const songsWithUrls: SongFile[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const song of AVAILABLE_SONGS) {
        try {
          console.log(`📡 Fetching URL for: ${song.originalName}`);
          const firebaseURL = await getAudioURL(song.originalName);
          songsWithUrls.push({
            ...song,
            audioFile: firebaseURL,
            isFirebase: true,
          });
          successCount++;
          console.log(
            `✅ Loaded ${song.title} from Firebase: ${firebaseURL.substring(
              0,
              50
            )}...`
          );
        } catch (error) {
          errorCount++;
          console.error(`❌ Error loading ${song.title} from Firebase:`, error);
          console.error(`   File name: ${song.originalName}`);
          // Continua con le altre tracce invece di fermarsi
          continue;
        }
      }

      // Ordina le tracce per ID per mantenere l'ordine corretto
      songsWithUrls.sort((a, b) => a.id - b.id);

      console.log(
        `🎵 Loading complete: ${successCount} successful, ${errorCount} failed`
      );
      console.log(
        `📋 Songs loaded in order:`,
        songsWithUrls.map((s) => `${s.id}. ${s.title}`)
      );

      if (songsWithUrls.length === 0) {
        console.warn("⚠️ No songs could be loaded from Firebase");
      }

      return songsWithUrls;
    };

    return await Promise.race([loadPromise(), timeoutPromise]);
  } catch (error) {
    console.error("💥 Error loading songs from Firebase:", error);
    console.error("🔄 Falling back to empty array");
    return [];
  }
};

// Funzione per ottenere i songs da Firebase Storage (alias)
export const getSongsFromFirebase = async (): Promise<SongFile[]> => {
  return getAllSongs();
};

// Funzione per ottenere i songs (versione ibrida - solo Firebase per ora)
export const getSongsHybrid = async (): Promise<SongFile[]> => {
  return getAllSongs();
};

// Funzione per ottenere i songs locali (fallback)
export const getSongsLocal = (): SongFile[] => {
  // I file sono solo su Firebase Storage, non localmente
  console.log(
    "⚠️ No local files available - files are only on Firebase Storage"
  );
  return [];
};
