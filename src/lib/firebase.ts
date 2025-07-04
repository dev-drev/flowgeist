import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API ||
    "AIzaSyCPQkfF3nr7rKnaqzpwfS_PvfaGfymVmhk",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH || "flowgeist-9b443.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "flowgeist-9b443",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "flowgeist-9b443.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "257769831802",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:257769831802:web:466d66201eb2ee43e02ac3",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0EHMNNRVCG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const storage = getStorage(app);

// Function to upload audio file to Firebase Storage
export const uploadAudioToFirebase = async (
  file: File,
  fileName: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `audio/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
};

// Function to get video URL from Firebase Storage
export const getVideoURL = async (fileName: string): Promise<string> => {
  try {
    console.log(`🔍 Trying to get video URL for: ${fileName}`);

    // Prova prima nella root del bucket
    let storageRef = ref(storage, fileName);
    console.log(`📁 Video storage reference (root):`, storageRef);

    try {
      const url = await getDownloadURL(storageRef);
      console.log(
        `✅ Successfully got video URL for ${fileName} (root):`,
        url.substring(0, 50) + "..."
      );
      return url;
    } catch (rootError) {
      console.log(`⚠️ Video not found in root, trying videos/ folder...`);

      // Se non trova nella root, prova nella cartella videos/
      storageRef = ref(storage, `videos/${fileName}`);
      console.log(`📁 Video storage reference (videos/):`, storageRef);

      const url = await getDownloadURL(storageRef);
      console.log(
        `✅ Successfully got video URL for ${fileName} (videos/):`,
        url.substring(0, 50) + "..."
      );
      return url;
    }
  } catch (error) {
    console.error(`❌ Failed to get video URL for ${fileName}:`, error);
    if (error && typeof error === "object" && "code" in error) {
      console.error(`   Error code:`, (error as { code: string }).code);
    }
    if (error instanceof Error) {
      console.error(`   Error message:`, error.message);
    }
    throw error;
  }
};

// Function to get audio URL from Firebase Storage
export const getAudioURL = async (fileName: string): Promise<string> => {
  try {
    console.log(`🔍 Trying to get URL for: ${fileName}`);

    // Prova prima nella root del bucket
    let storageRef = ref(storage, fileName);
    console.log(`📁 Storage reference (root):`, storageRef);

    try {
      const url = await getDownloadURL(storageRef);
      console.log(
        `✅ Successfully got URL for ${fileName} (root):`,
        url.substring(0, 50) + "..."
      );
      return url;
    } catch (rootError) {
      console.log(`⚠️ File not found in root, trying audio/ folder...`);

      // Se non trova nella root, prova nella cartella audio/
      storageRef = ref(storage, `audio/${fileName}`);
      console.log(`📁 Storage reference (audio/):`, storageRef);

      const url = await getDownloadURL(storageRef);
      console.log(
        `✅ Successfully got URL for ${fileName} (audio/):`,
        url.substring(0, 50) + "..."
      );
      return url;
    }
  } catch (error) {
    console.error(`❌ Failed to get URL for ${fileName}:`, error);
    if (error && typeof error === "object" && "code" in error) {
      console.error(`   Error code:`, (error as { code: string }).code);
    }
    if (error instanceof Error) {
      console.error(`   Error message:`, error.message);
    }
    throw error;
  }
};

// Function to check if a file exists in Firebase Storage
export const checkFileExists = async (fileName: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, `audio/${fileName}`);
    await getDownloadURL(storageRef);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to list all audio files in Firebase Storage
export const listAudioFiles = async (): Promise<string[]> => {
  try {
    console.log("🔍 Listing all files in Firebase Storage...");

    const { listAll } = await import("firebase/storage");
    const allFiles: string[] = [];

    // Lista file nella root
    try {
      const rootRef = ref(storage, "");
      const rootResult = await listAll(rootRef);
      const rootFiles = rootResult.items.map((item) => item.name);
      console.log("📋 Files found in root:", rootFiles);
      allFiles.push(...rootFiles);
    } catch (error) {
      console.log("⚠️ Could not list root files:", error);
    }

    // Lista file nella cartella audio/
    try {
      const audioRef = ref(storage, "audio/");
      const audioResult = await listAll(audioRef);
      const audioFiles = audioResult.items.map((item) => `audio/${item.name}`);
      console.log("📋 Files found in audio/ folder:", audioFiles);
      allFiles.push(...audioFiles);
    } catch (error) {
      console.log("⚠️ Could not list audio/ files:", error);
    }

    // Rimuovi duplicati
    const uniqueFiles = [...new Set(allFiles)];
    console.log("📊 Total unique files found:", uniqueFiles.length);
    console.log("📋 All files:", uniqueFiles);

    return uniqueFiles;
  } catch (error) {
    console.error("❌ Error listing audio files:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
    }
    return [];
  }
};

// Function to test Firebase Storage access
export const testFirebaseAccess = async (): Promise<{
  success: boolean;
  files: string[];
  error?: string;
}> => {
  try {
    console.log("🧪 Testing Firebase Storage access...");

    // Test 1: List files
    const files = await listAudioFiles();
    console.log("📋 Files found:", files);

    if (files.length === 0) {
      return {
        success: false,
        files: [],
        error: "No files found in Firebase Storage",
      };
    }

    // Test 2: Try to get URL for first file
    const firstFile = files[0];
    console.log("🔍 Testing URL access for:", firstFile);
    const url = await getAudioURL(firstFile);
    console.log("✅ URL test successful:", url.substring(0, 50) + "...");

    return { success: true, files };
  } catch (error) {
    console.error("❌ Firebase test failed:", error);
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export { analytics };
export default storage;
