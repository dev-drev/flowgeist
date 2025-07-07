import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calcola la data di inizio basata sul range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    console.log("📊 Fetching analytics from Firestore for range:", range);
    console.log("📅 Start date:", startDate);

    // Query per ottenere i dati di tracking da Firestore
    const trackingRef = collection(db, "tracking");
    const q = query(
      trackingRef,
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "desc"),
      limit(1000)
    );

    const querySnapshot = await getDocs(q);
    const trackingData: Record<string, unknown>[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>;

      // Converti il timestamp di Firestore in una data JavaScript
      let timestamp: Date | null = null;
      if (data.timestamp) {
        const timestampData = data.timestamp as
          | { toDate?: () => Date }
          | Date
          | number;
        if (
          timestampData &&
          typeof timestampData === "object" &&
          "toDate" in timestampData &&
          timestampData.toDate
        ) {
          // È un Timestamp di Firestore
          timestamp = timestampData.toDate();
        } else if (timestampData instanceof Date) {
          // È già una Date
          timestamp = timestampData;
        } else if (typeof timestampData === "number") {
          // È un timestamp numerico
          timestamp = new Date(timestampData);
        }
      }

      trackingData.push({
        id: doc.id,
        ...data,
        timestamp: timestamp,
        // Aggiungi anche una versione formattata per facilità di visualizzazione
        formattedTimestamp: timestamp ? timestamp.toISOString() : null,
      });
    });

    console.log("📈 Found", trackingData.length, "tracking records");

    // Debug: mostra il primo record per vedere la struttura del timestamp
    if (trackingData.length > 0) {
      console.log("🔍 First record timestamp:", trackingData[0].timestamp);
      console.log(
        "🔍 First record formattedTimestamp:",
        trackingData[0].formattedTimestamp
      );
    }

    // Calcola le statistiche
    const summary = calculateSummary(trackingData);

    return NextResponse.json({
      trackingData,
      summary,
      method: "firestore",
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

interface TrackingDataItem {
  action?: string;
  trackTitle?: string;
  geoInfo?: {
    country?: string;
  };
  userAgent?: {
    browser?: string;
  };
  referrer?: string;
}

function calculateSummary(data: TrackingDataItem[]) {
  const summary = {
    totalClicks: 0,
    totalDownloads: 0,
    totalViews: 0,
    topTracks: [] as Array<{ title: string; count: number }>,
    topCountries: [] as Array<{ country: string; count: number }>,
    topBrowsers: [] as Array<{ browser: string; count: number }>,
    topReferrers: [] as Array<{ referrer: string; count: number }>,
  };

  const trackCounts: { [key: string]: number } = {};
  const countryCounts: { [key: string]: number } = {};
  const browserCounts: { [key: string]: number } = {};
  const referrerCounts: { [key: string]: number } = {};

  data.forEach((item) => {
    // Conta le azioni
    switch (item.action) {
      case "click":
        summary.totalClicks++;
        break;
      case "download":
        summary.totalDownloads++;
        break;
      case "view":
        summary.totalViews++;
        break;
    }

    // Conta le tracce
    const trackTitle = item.trackTitle || "Unknown";
    trackCounts[trackTitle] = (trackCounts[trackTitle] || 0) + 1;

    // Conta i paesi
    const country = item.geoInfo?.country || "Unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    // Conta i browser
    const browser = item.userAgent?.browser || "Unknown";
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;

    // Conta i referrer
    const referrer = item.referrer || "direct";
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });

  // Converti in array e ordina
  summary.topTracks = Object.entries(trackCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  summary.topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  summary.topBrowsers = Object.entries(browserCounts)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  summary.topReferrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return summary;
}
