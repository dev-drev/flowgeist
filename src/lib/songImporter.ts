// Sistema per importare automaticamente i file audio da Cloudinary

export interface SongFile {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  originalName: string;
  size?: number;
}

// Lista dei file audio disponibili su Cloudinary
export const AVAILABLE_SONGS: SongFile[] = [
  {
    id: 1,
    title: "Void You Hide",
    duration: "4:32",
    audioFile:
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/flowgeist-audio/void-you-hide.mp3",
    originalName: "01 Flowgeist - Void You Hide (SSL Fusion Mix V1).wav",
    size: 69,
  },
  {
    id: 2,
    title: "Fatal Faith",
    duration: "5:18",
    audioFile:
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/flowgeist-audio/fatal-faith.mp3",
    originalName: "03. Flowgeist - Fatal Faith (SSL Fusion Mix V2).wav",
    size: 71,
  },
  {
    id: 3,
    title: "Amarcord",
    duration: "3:58",
    audioFile:
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/flowgeist-audio/amarcord.mp3",
    originalName: "06. Flowgeist - Amarcord (SSL Fusion Mix V1).wav",
    size: 61,
  },
  {
    id: 4,
    title: "Prophets of Lies",
    duration: "4:51",
    audioFile:
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/flowgeist-audio/prophets-of-lies.mp3",
    originalName: "Prophets of Lies.wav",
    size: 67,
  },
  {
    id: 5,
    title: "Meaningful Quest",
    duration: "7:12",
    audioFile:
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/flowgeist-audio/meaningful-quest.mp3",
    originalName: "09. Flowgeist - Meaningful Quest (SSL Fusion Mix V2).wav",
    size: 76,
  },
];

// Funzione per ottenere tutti i songs disponibili
export const getAllSongs = (): SongFile[] => {
  return AVAILABLE_SONGS;
};
