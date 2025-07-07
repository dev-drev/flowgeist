import { NextRequest, NextResponse } from "next/server";
import { localTracking } from "@/lib/localTracking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, trackTitle, action, userAgent, referrer } = body;

    // Estrai informazioni dal User-Agent
    const userAgentInfo = parseUserAgent(userAgent);

    const trackingData = {
      trackId,
      trackTitle,
      action,
      userAgent: userAgentInfo,
      referrer: referrer || "direct",
      pageUrl: request.headers.get("referer") || "unknown",
    };

    // Salva usando il tracking locale
    const result = await localTracking.trackEvent(trackingData);

    return NextResponse.json({
      success: result.success,
      trackingId: result.id,
      method: "local",
    });
  } catch (error) {
    console.error("Local tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // localStorage non è disponibile lato server, restituiamo dati vuoti
    return NextResponse.json({
      trackingData: [],
      summary: {
        totalClicks: 0,
        totalDownloads: 0,
        totalViews: 0,
        topTracks: [],
        topCountries: [],
        topBrowsers: [],
        topReferrers: [],
      },
    });
  } catch (error) {
    console.error("Local analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string) {
  if (!userAgent)
    return { browser: "unknown", os: "unknown", device: "unknown" };

  const browser = getBrowser(userAgent);
  const os = getOS(userAgent);
  const device = getDevice(userAgent);

  return { browser, os, device };
}

function getBrowser(userAgent: string) {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  return "Unknown";
}

function getOS(userAgent: string) {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  return "Unknown";
}

function getDevice(userAgent: string) {
  if (userAgent.includes("Mobile")) return "Mobile";
  if (userAgent.includes("Tablet")) return "Tablet";
  return "Desktop";
}
