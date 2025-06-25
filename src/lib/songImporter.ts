// Sistema per importare automaticamente i file audio da public/songs

export interface SongFile {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  originalName: string;
  size?: number;
}

// Lista dei file audio disponibili nella cartella public/songs
export const AVAILABLE_SONGS: SongFile[] = [
  {
    id: 1,
    title: "Void You Hide",
    duration: "4:32",
    audioFile: "/songs/01 Flowgeist - Void You Hide (SSL Fusion Mix V1).wav",
    originalName: "01 Flowgeist - Void You Hide (SSL Fusion Mix V1).wav",
    size: 69,
  },
  {
    id: 2,
    title: "Fatal Faith",
    duration: "5:18",
    audioFile: "/songs/03. Flowgeist - Fatal Faith (SSL Fusion Mix V2).wav",
    originalName: "03. Flowgeist - Fatal Faith (SSL Fusion Mix V2).wav",
    size: 71,
  },
  {
    id: 3,
    title: "Amarcord",
    duration: "3:58",
    audioFile: "/songs/06. Flowgeist - Amarcord (SSL Fusion Mix V1).wav",
    originalName: "06. Flowgeist - Amarcord (SSL Fusion Mix V1).wav",
    size: 61,
  },
  {
    id: 4,
    title: "Prophets of Lies",
    duration: "4:51",
    audioFile:
      "/songs/07. Flowgeist - Prophets of Lies (SSL Fusion Mix V1).wav",
    originalName: "07. Flowgeist - Prophets of Lies (SSL Fusion Mix V1).wav",
    size: 67,
  },
  {
    id: 5,
    title: "Meaningful Quest",
    duration: "7:12",
    audioFile:
      "/songs/09. Flowgeist - Meaningful Quest (SSL Fusion Mix V2).wav",
    originalName: "09. Flowgeist - Meaningful Quest (SSL Fusion Mix V2).wav",
    size: 76,
  },
];

// Funzione per ottenere tutti i songs disponibili
export const getAllSongs = (): SongFile[] => {
  return AVAILABLE_SONGS;
};
