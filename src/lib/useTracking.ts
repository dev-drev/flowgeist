import { useCallback } from "react";

interface TrackingData {
  trackId: number;
  trackTitle: string;
  action: "click" | "download" | "play" | "view";
  userAgent?: string;
  referrer?: string;
  ip?: string;
  timestamp?: number;
}

export const useTracking = () => {
  const trackEvent = useCallback(async (data: TrackingData) => {
    try {
      console.log("🎯 Tracking event started:", data);

      // Ottieni l'IP dell'utente
      let userIP = "unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
      } catch (error) {
        console.log("Could not get IP address:", error);
      }

      // Raccogli informazioni automatiche
      const trackingData = {
        ...data,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: Date.now(),
        ip: userIP,
        // Dati aggiuntivi per identificazione più precisa
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      };

      console.log("📊 Tracking data prepared:", trackingData);

      // Salva in Firestore
      console.log("🔥 Sending tracking data to Firestore...");
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackingData),
      });

      console.log("📡 Firestore response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Firestore tracking successful:", result);
        return result;
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Firestore tracking failed:",
          response.status,
          errorText
        );
        throw new Error(`Tracking failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Tracking error:", error);
    }
  }, []);

  const trackClick = useCallback(
    (trackId: number, trackTitle: string) => {
      console.log("🖱️ Track click called:", { trackId, trackTitle });
      return trackEvent({
        trackId,
        trackTitle,
        action: "click",
      });
    },
    [trackEvent]
  );

  const trackDownload = useCallback(
    (trackId: number, trackTitle: string) => {
      console.log("⬇️ Track download called:", { trackId, trackTitle });
      return trackEvent({
        trackId,
        trackTitle,
        action: "download",
      });
    },
    [trackEvent]
  );

  const trackPlay = useCallback(
    (trackId: number, trackTitle: string) => {
      console.log("▶️ Track play called:", { trackId, trackTitle });
      return trackEvent({
        trackId,
        trackTitle,
        action: "play",
      });
    },
    [trackEvent]
  );

  const trackView = useCallback(
    (trackId: number, trackTitle: string) => {
      console.log("👁️ Track view called:", { trackId, trackTitle });
      return trackEvent({
        trackId,
        trackTitle,
        action: "view",
      });
    },
    [trackEvent]
  );

  const trackExternalLink = useCallback(
    (linkType: string, linkUrl: string) => {
      console.log("🔗 External link clicked:", { linkType, linkUrl });
      return trackEvent({
        trackId: 0, // Special ID for external links
        trackTitle: `${linkType} Link`,
        action: "click",
      });
    },
    [trackEvent]
  );

  const trackPageView = useCallback(
    (pageTitle: string) => {
      console.log("📄 Page view:", { pageTitle });
      return trackEvent({
        trackId: 0, // Using 0 as it's not a real track
        trackTitle: pageTitle,
        action: "view",
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackClick,
    trackDownload,
    trackPlay,
    trackView,
    trackExternalLink,
    trackPageView,
  };
};
