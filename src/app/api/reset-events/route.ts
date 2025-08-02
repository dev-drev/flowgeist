import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    // Ottieni tutti i documenti dalla collezione tracking
    const trackingRef = collection(db, "tracking");
    const querySnapshot = await getDocs(trackingRef);

    let deletedCount = 0;

    // Elimina ogni documento
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
      deletedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} tracking events`,
      deletedCount,
    });
  } catch (error) {
    console.error("❌ Error resetting events:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 