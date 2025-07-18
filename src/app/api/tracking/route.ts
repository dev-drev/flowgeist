import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Tracking API called");
    const body = await request.json();
    console.log("📦 Request body:", body);

    const {
      trackId,
      trackTitle,
      action,
      userAgent,
      referrer,
      ip,
      timestamp,
      screenResolution,
      timezone,
      language,
    } = body;

    // Estrai informazioni dal User-Agent
    const userAgentInfo = parseUserAgent(userAgent);

    // Ottieni informazioni geografiche dall'IP (se disponibile)
    const geoInfo = await getGeoInfo(ip);

    const trackingData = {
      trackId,
      trackTitle,
      action, // 'click', 'download', 'play', etc.
      userAgent: userAgentInfo,
      referrer: referrer || "direct",
      ip: ip || "unknown",
      geoInfo,
      timestamp: serverTimestamp(),
      sessionId: generateSessionId(),
      pageUrl: request.headers.get("referer") || "unknown",
      utmSource: extractUTMParams(request.headers.get("referer") || ""),
      utmMedium: extractUTMParams(
        request.headers.get("referer") || "",
        "utm_medium"
      ),
      utmCampaign: extractUTMParams(
        request.headers.get("referer") || "",
        "utm_campaign"
      ),
      // Dati aggiuntivi per identificazione più precisa
      screenResolution,
      timezone,
      language,
      userFingerprint: generateUserFingerprint(
        userAgentInfo,
        screenResolution,
        timezone,
        language
      ),
    };

    // Salva nel database
    console.log("💾 Saving to Firestore:", trackingData);
    const docRef = await addDoc(collection(db, "tracking"), trackingData);
    console.log("✅ Saved to Firestore with ID:", docRef.id);

    return NextResponse.json({
      success: true,
      trackingId: docRef.id,
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string) {
  if (!userAgent)
    return {
      browser: "unknown",
      os: "unknown",
      device: "unknown",
      deviceModel: "unknown",
    };

  const browser = getBrowser(userAgent);
  const os = getOS(userAgent);
  const device = getDevice(userAgent);
  const deviceModel = getDeviceModel(userAgent);

  return { browser, os, device, deviceModel };
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

function getDeviceModel(userAgent: string) {
  // iPhone detection
  if (userAgent.includes("iPhone")) {
    if (userAgent.includes("iPhone OS 17")) return "iPhone 15/15 Pro";
    if (userAgent.includes("iPhone OS 16")) return "iPhone 14/14 Pro";
    if (userAgent.includes("iPhone OS 15")) return "iPhone 13/13 Pro";
    if (userAgent.includes("iPhone OS 14")) return "iPhone 12/12 Pro";
    if (userAgent.includes("iPhone OS 13")) return "iPhone 11/11 Pro";
    return "iPhone (Altro)";
  }

  // iPad detection
  if (userAgent.includes("iPad")) {
    if (userAgent.includes("iPad OS 17")) return "iPad Pro/Air (2023)";
    if (userAgent.includes("iPad OS 16")) return "iPad Pro/Air (2022)";
    if (userAgent.includes("iPad OS 15")) return "iPad Pro/Air (2021)";
    return "iPad (Altro)";
  }

  // Android detection
  if (userAgent.includes("Android")) {
    // Samsung
    if (userAgent.includes("SM-G")) return "Samsung Galaxy S";
    if (userAgent.includes("SM-A")) return "Samsung Galaxy A";
    if (userAgent.includes("SM-N")) return "Samsung Galaxy Note";
    if (userAgent.includes("SM-T")) return "Samsung Galaxy Tab";

    // Google Pixel
    if (userAgent.includes("Pixel")) return "Google Pixel";

    // OnePlus
    if (userAgent.includes("OnePlus")) return "OnePlus";

    // Xiaomi
    if (userAgent.includes("Mi ")) return "Xiaomi";
    if (userAgent.includes("Redmi")) return "Xiaomi Redmi";

    // Huawei
    if (userAgent.includes("HUAWEI")) return "Huawei";

    // Generic Android
    return "Android (Altro)";
  }

  // Desktop detection
  if (userAgent.includes("Macintosh")) {
    if (userAgent.includes("Mac OS X 10_15")) return "Mac (Catalina+)";
    if (userAgent.includes("Mac OS X 10_14")) return "Mac (Mojave)";
    return "Mac";
  }

  if (userAgent.includes("Windows NT 10")) return "Windows 10/11";
  if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1";
  if (userAgent.includes("Windows NT 6.1")) return "Windows 7";

  if (userAgent.includes("Linux")) return "Linux";

  return "Unknown";
}

async function getGeoInfo(ip: string) {
  if (!ip || ip === "unknown") return null;

  try {
    console.log("🌍 Getting geo info for IP:", ip);

    // Prova prima ip-api.com (gratuito)
    try {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`
      );
      const data = await response.json();

      if (data.status === "success") {
        console.log("✅ Geo info from ip-api.com:", data);
        return {
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
          zip: data.zip,
          lat: data.lat,
          lon: data.lon,
          timezone: data.timezone,
          isp: data.isp,
          org: data.org,
          as: data.as,
          mobile: data.mobile,
          proxy: data.proxy,
          hosting: data.hosting,
          source: "ip-api.com",
        };
      }
    } catch (error) {
      console.log("❌ ip-api.com failed, trying ipapi.co...");
    }

    // Fallback a ipapi.co
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (data.country_name) {
        console.log("✅ Geo info from ipapi.co:", data);
        return {
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          city: data.city,
          zip: data.postal,
          lat: data.latitude,
          lon: data.longitude,
          timezone: data.timezone,
          isp: data.org,
          source: "ipapi.co",
        };
      }
    } catch (error) {
      console.log("❌ ipapi.co also failed");
    }
  } catch (error) {
    console.error("❌ Geo IP error:", error);
  }

  return null;
}

function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function generateUserFingerprint(
  userAgent: {
    browser: string;
    os: string;
    device: string;
    deviceModel: string;
  },
  screenResolution?: string,
  timezone?: string,
  language?: string
) {
  const fingerprint = [
    userAgent.browser,
    userAgent.os,
    userAgent.device,
    screenResolution,
    timezone,
    language,
  ]
    .filter(Boolean)
    .join("|");

  // Crea un hash semplice del fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function extractUTMParams(url: string, param?: string) {
  try {
    const urlObj = new URL(url);
    if (param) {
      return urlObj.searchParams.get(param) || null;
    }
    return urlObj.searchParams.get("utm_source") || null;
  } catch {
    return null;
  }
}
