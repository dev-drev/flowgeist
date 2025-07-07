import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing Firestore connection...");

    // Test 1: Prova a creare un documento di test
    const testData = {
      test: true,
      message: "Test document from API",
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    };

    console.log("📝 Creating test document...");
    const docRef = await addDoc(collection(db, "test"), testData);
    console.log("✅ Test document created with ID:", docRef.id);

    // Test 2: Prova a leggere i documenti dalla collezione tracking
    console.log("📖 Reading from tracking collection...");
    const trackingSnapshot = await getDocs(collection(db, "tracking"));
    const trackingCount = trackingSnapshot.size;
    console.log("📊 Found", trackingCount, "documents in tracking collection");

    // Test 3: Prova a leggere i documenti dalla collezione test
    console.log("📖 Reading from test collection...");
    const testSnapshot = await getDocs(collection(db, "test"));
    const testCount = testSnapshot.size;
    console.log("📊 Found", testCount, "documents in test collection");

    return NextResponse.json({
      success: true,
      testDocumentId: docRef.id,
      trackingDocumentsCount: trackingCount,
      testDocumentsCount: testCount,
      message: "Firestore connection successful",
    });
  } catch (error) {
    console.error("❌ Firestore test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Firestore connection failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, trackTitle, action } = body;

    console.log("🧪 Creating test tracking event...");

    const testTrackingData = {
      trackId: trackId || 999,
      trackTitle: trackTitle || "Test Track",
      action: action || "test",
      userAgent: {
        browser: "Test Browser",
        os: "Test OS",
        device: "Test Device",
      },
      referrer: "test",
      timestamp: serverTimestamp(),
      sessionId: "test-session-" + Date.now(),
      pageUrl: "test",
      test: true,
    };

    const docRef = await addDoc(collection(db, "tracking"), testTrackingData);
    console.log("✅ Test tracking event created with ID:", docRef.id);

    return NextResponse.json({
      success: true,
      trackingId: docRef.id,
      message: "Test tracking event created successfully",
    });
  } catch (error) {
    console.error("❌ Test tracking failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
