const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const fs = require("fs");
const path = require("path");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_A,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Audio files to upload
const audioFiles = [
  { name: "void-you-hide.wav", path: "public/songs/Void You Hide.wav" },
  { name: "fatal-faith.wav", path: "public/songs/Fatal Faith.wav" },
  { name: "amarcord.wav", path: "public/songs/Amarcord.wav" },
  { name: "prophets-of-lies.wav", path: "public/songs/Prophets of Lies.wav" },
  { name: "meaningful-quest.wav", path: "public/songs/Meaningful Quest.wav" },
];

async function uploadAudioFiles() {
  console.log("🚀 Starting audio file upload to Firebase Storage...");

  const uploadedFiles = [];

  for (const file of audioFiles) {
    try {
      console.log(`📤 Uploading ${file.name}...`);

      const filePath = path.join(process.cwd(), file.path);
      const fileBuffer = fs.readFileSync(filePath);

      const storageRef = ref(storage, `audio/${file.name}`);
      const snapshot = await uploadBytes(storageRef, fileBuffer);
      const downloadURL = await getDownloadURL(snapshot.ref);

      uploadedFiles.push({
        name: file.name,
        url: downloadURL,
        size: fileBuffer.length,
      });

      console.log(`✅ Uploaded ${file.name}: ${downloadURL}`);
    } catch (error) {
      console.error(`❌ Error uploading ${file.name}:`, error);
    }
  }

  console.log("\n📋 Upload Summary:");
  uploadedFiles.forEach((file) => {
    console.log(`${file.name}: ${file.url}`);
  });

  // Generate updated songImporter.ts content
  const songImporterContent = generateSongImporterContent(uploadedFiles);
  fs.writeFileSync("src/lib/songImporter-updated.ts", songImporterContent);

  console.log(
    "\n📝 Generated updated songImporter-updated.ts with Firebase URLs"
  );
}

function generateSongImporterContent(uploadedFiles) {
  const songs = [
    {
      id: 1,
      title: "Void You Hide",
      duration: "4:32",
      originalName: "01 Flowgeist - Void You Hide (SSL Fusion Mix V1).wav",
    },
    {
      id: 2,
      title: "Fatal Faith",
      duration: "5:18",
      originalName: "03. Flowgeist - Fatal Faith (SSL Fusion Mix V2).wav",
    },
    {
      id: 3,
      title: "Amarcord",
      duration: "3:58",
      originalName: "06. Flowgeist - Amarcord (SSL Fusion Mix V1).wav",
    },
    {
      id: 4,
      title: "Prophets of Lies",
      duration: "4:51",
      originalName: "Prophets of Lies.wav",
    },
    {
      id: 5,
      title: "Meaningful Quest",
      duration: "7:12",
      originalName: "09. Flowgeist - Meaningful Quest (SSL Fusion Mix V2).wav",
    },
  ];

  let content = `// Sistema per importare automaticamente i file audio da Firebase Storage

export interface SongFile {
  id: number;
  title: string;
  duration: string;
  audioFile: string;
  originalName: string;
  size?: number;
}

// Lista dei file audio disponibili su Firebase Storage
export const AVAILABLE_SONGS: SongFile[] = [
`;

  songs.forEach((song, index) => {
    const uploadedFile = uploadedFiles.find((f) =>
      f.name.includes(song.title.toLowerCase().replace(/\s+/g, "-"))
    );
    content += `  {
    id: ${song.id},
    title: "${song.title}",
    duration: "${song.duration}",
    audioFile: "${uploadedFile ? uploadedFile.url : ""}",
    originalName: "${song.originalName}",
    size: ${uploadedFile ? Math.round(uploadedFile.size / 1024 / 1024) : 0},
  },
`;
  });

  content += `];

// Funzione per ottenere tutti i songs disponibili
export const getAllSongs = (): SongFile[] => {
  return AVAILABLE_SONGS;
};
`;

  return content;
}

// Run the upload
uploadAudioFiles().catch(console.error);
