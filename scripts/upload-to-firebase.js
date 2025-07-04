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

// Function to upload a file to Firebase Storage
async function uploadFile(filePath, fileName) {
  try {
    console.log(`Uploading ${fileName}...`);

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Create a reference to Firebase Storage
    const storageRef = ref(storage, `audio/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: "audio/wav",
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`✅ ${fileName} uploaded successfully!`);
    console.log(`URL: ${downloadURL}\n`);

    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error);
    throw error;
  }
}

// Main function to upload all WAV files
async function uploadAllSongs() {
  const songsDir = path.join(__dirname, "../public/songs");
  const files = fs
    .readdirSync(songsDir)
    .filter((file) => file.endsWith(".wav"));

  console.log(`Found ${files.length} WAV files to upload:\n`);

  const results = {};

  for (const file of files) {
    const filePath = path.join(songsDir, file);
    try {
      const url = await uploadFile(filePath, file);
      results[file] = url;
    } catch (error) {
      console.error(`Failed to upload ${file}`);
    }
  }

  console.log("\n📋 Upload Summary:");
  console.log("===================");
  for (const [fileName, url] of Object.entries(results)) {
    console.log(`${fileName}: ${url}`);
  }

  // Generate songImporter update
  console.log("\n🔄 Updated songImporter.ts content:");
  console.log("===================================");
  generateSongImporterContent(results);
}

function generateSongImporterContent(uploadResults) {
  const songs = [
    {
      file: "Void You Hide.wav",
      title: "Void You Hide",
      duration: "4:32",
      size: 69,
    },
    {
      file: "Fatal Faith.wav",
      title: "Fatal Faith",
      duration: "5:18",
      size: 71,
    },
    { file: "Like a Bug.wav", title: "Like a Bug", duration: "5:18", size: 71 },
    { file: "Amarcord.wav", title: "Amarcord", duration: "3:58", size: 61 },
    {
      file: "Prophets of Lies.wav",
      title: "Prophets of Lies",
      duration: "4:51",
      size: 67,
    },
    {
      file: "Meaningful Quest.wav",
      title: "Meaningful Quest",
      duration: "7:12",
      size: 76,
    },
    {
      file: "The Scarecrow.wav",
      title: "The Scarecrow",
      duration: "7:12",
      size: 76,
    },
    {
      file: "Veiled Strophes.wav",
      title: "Veiled Strophes",
      duration: "7:12",
      size: 76,
    },
  ];

  console.log(`export const AVAILABLE_SONGS: SongFile[] = [`);

  songs.forEach((song, index) => {
    const url = uploadResults[song.file];
    if (url) {
      console.log(`  {`);
      console.log(`    id: ${index + 1},`);
      console.log(`    title: "${song.title}",`);
      console.log(`    duration: "${song.duration}",`);
      console.log(`    audioFile: "${url}",`);
      console.log(`    originalName: "${song.file}",`);
      console.log(`    size: ${song.size},`);
      console.log(`  },`);
    }
  });

  console.log(`];`);
}

// Run the upload
uploadAllSongs().catch(console.error);
