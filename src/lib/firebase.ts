import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
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
const db = getFirestore(app);

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
    // Prova prima nella root del bucket
    let storageRef = ref(storage, fileName);

    try {
      const url = await getDownloadURL(storageRef);

      return url;
    } catch (rootError) {
      // Se non trova nella root, prova nella cartella videos/
      storageRef = ref(storage, `videos/${fileName}`);

      const url = await getDownloadURL(storageRef);

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
    // Prova prima nella root del bucket
    let storageRef = ref(storage, fileName);

    try {
      const url = await getDownloadURL(storageRef);

      return url;
    } catch (rootError) {
      // Se non trova nella root, prova nella cartella audio/
      storageRef = ref(storage, `audio/${fileName}`);

      const url = await getDownloadURL(storageRef);

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


    const { listAll } = await import("firebase/storage");
    const allFiles: string[] = [];

    // Lista file nella root
    try {
      const rootRef = ref(storage, "");
      const rootResult = await listAll(rootRef);
      const rootFiles = rootResult.items.map((item) => item.name);

      allFiles.push(...rootFiles);
    } catch (error) {}

    // Lista file nella cartella audio/
    try {
      const audioRef = ref(storage, "audio/");
      const audioResult = await listAll(audioRef);
      const audioFiles = audioResult.items.map((item) => `audio/${item.name}`);

      allFiles.push(...audioFiles);
    } catch (error) {}

    // Rimuovi duplicati
    const uniqueFiles = [...new Set(allFiles)];


    return uniqueFiles;
  } catch (error) {
    console.error("❌ Error listing audio files:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
    }
    return [];
  }
};

// Export Firestore instance
export { db };

// Function to test Firebase Storage access
export const testFirebaseAccess = async (): Promise<{
  success: boolean;
  files: string[];
  error?: string;
}> => {
  try {
    // Test 1: List files
    const files = await listAudioFiles();

    if (files.length === 0) {
      return {
        success: false,
        files: [],
        error: "No files found in Firebase Storage",
      };
    }

    // Test 2: Try to get URL for first file
    const firstFile = files[0];

    const url = await getAudioURL(firstFile);

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
