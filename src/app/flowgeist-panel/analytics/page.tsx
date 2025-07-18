"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

interface TrackingData {
  id: string;
  trackId: number;
  trackTitle: string;
  action: string;
  userAgent: {
    browser: string;
    os: string;
    device: string;
  };
  geoInfo?: {
    country: string;
    countryCode: string;
    city: string;
    region: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    as?: string;
    mobile?: boolean;
    proxy?: boolean;
    hosting?: boolean;
    source?: string;
  };
  timestamp: Date | null;
  formattedTimestamp?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  userFingerprint?: string;
  sessionId?: string;
}

interface AnalyticsSummary {
  totalClicks: number;
  totalDownloads: number;
  totalViews: number;
  topTracks: Array<{ title: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

export default function FlowgeistAnalytics() {
  const [trackingData, setTrackingData] = useState<TrackingData[] | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [resetting, setResetting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      const data = await response.json();

      setTrackingData(data.trackingData || []);
      setSummary(
        data.summary || {
          totalClicks: 0,
          totalDownloads: 0,
          totalViews: 0,
          topTracks: [],
          topCountries: [],
          topBrowsers: [],
          topReferrers: [],
        }
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredData = (trackingData || []).filter((item) => {
    if (filter === "all") return true;
    return item.action === filter;
  });

  const resetEvents = async () => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare tutti gli eventi di tracking? Questa azione non può essere annullata."
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      const response = await fetch("/api/reset-events", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        // Ricarica i dati
        await fetchAnalytics();
      } else {
        alert(`❌ Errore: ${data.error}`);
      }
    } catch (error) {
      alert(
        `❌ Errore: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setResetting(false);
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getAuthenticityScore = (item: TrackingData) => {
    let score = 0;
    const reasons: string[] = [];

    // Punti positivi per indicatori di persona reale
    if (item.userAgent?.device && item.userAgent.device !== "Unknown")
      score += 2;
    if (
      item.userAgent?.device &&
      (item.userAgent.device === "Mobile" || item.userAgent.device === "Tablet")
    )
      score += 1;
    if (item.geoInfo?.city && item.geoInfo.city !== "Unknown") score += 1;
    if (item.geoInfo?.isp && !item.geoInfo.isp.includes("hosting")) score += 1;
    if (!item.geoInfo?.proxy && !item.geoInfo?.hosting) score += 2;
    if (item.screenResolution && item.screenResolution !== "Unknown")
      score += 1;
    if (item.timezone && item.timezone !== "Unknown") score += 1;

    // Punti negativi per indicatori di bot/proxy
    if (item.geoInfo?.proxy) {
      score -= 3;
      reasons.push("Usa proxy");
    }
    if (item.geoInfo?.hosting) {
      score -= 2;
      reasons.push("IP hosting");
    }
    if (!item.userAgent?.device || item.userAgent.device === "Unknown") {
      score -= 1;
      reasons.push("Dispositivo sconosciuto");
    }

    // Determina il livello di autenticità
    if (score >= 5)
      return { level: "Alta", color: "text-green-600", score, reasons };
    if (score >= 2)
      return { level: "Media", color: "text-yellow-600", score, reasons };
    return { level: "Bassa", color: "text-red-600", score, reasons };
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <ClipLoader color="#3B82F6" size={80} />
          <h2 className="text-2xl font-bold text-gray-700 mt-6">
            Caricamento analytics...
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center text-gray-800"
      >
        Flowgeist Analytics Dashboard
      </motion.h1>

      {!loading && (!trackingData || trackingData.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Nessun dato di tracking disponibile
          </h3>
          <p className="text-blue-600">
            I dati di tracking appariranno qui dopo che gli utenti interagiranno
            con le tracce. Assicurati che Firestore sia abilitato nel progetto
            Firebase per il tracking persistente.
          </p>
        </motion.div>
      )}

      {/* Filtri e Controlli */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap gap-4 justify-center items-center"
      >
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="1d">Ultime 24 ore</option>
          <option value="7d">Ultimi 7 giorni</option>
          <option value="30d">Ultimi 30 giorni</option>
          <option value="90d">Ultimi 90 giorni</option>
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Tutte le azioni</option>
          <option value="click">Click</option>
          <option value="download">Download</option>
          <option value="view">Visualizzazioni</option>
        </select>

        <button
          onClick={resetEvents}
          disabled={resetting}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          {resetting ? "Eliminando..." : "🗑️ Reset Eventi"}
        </button>
      </motion.div>

      {/* Detailed Data Table - PRIMA POSIZIONE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Dettagli Eventi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paese
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Città
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.slice(0, 50).map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleRowExpansion(item.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform ${
                              expandedRows.has(item.id) ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.trackTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.action === "download"
                              ? "bg-green-100 text-green-800"
                              : item.action === "click"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.geoInfo?.country || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.geoInfo?.city || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.formattedTimestamp}
                      </td>
                    </tr>
                    {expandedRows.has(item.id) && (
                      <tr key={`${item.id}-details`} className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Browser:
                              </span>
                              <p className="text-gray-600">
                                {item.userAgent?.browser || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Sistema Operativo:
                              </span>
                              <p className="text-gray-600">
                                {item.userAgent?.os || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Dispositivo:
                              </span>
                              <p className="text-gray-600">
                                {item.userAgent?.device || "Unknown"}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                Risoluzione:
                              </span>
                              <p className="text-gray-600">
                                {item.screenResolution || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Timezone:
                              </span>
                              <p className="text-gray-600">
                                {item.timezone || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Lingua:
                              </span>
                              <p className="text-gray-600">
                                {item.language || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Session ID:
                              </span>
                              <p className="text-gray-600 font-mono text-xs">
                                {item.sessionId || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                User Fingerprint:
                              </span>
                              <p className="text-gray-600 font-mono text-xs">
                                {item.userFingerprint || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                ISP:
                              </span>
                              <p className="text-gray-600">
                                {item.geoInfo?.isp || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Organizzazione:
                              </span>
                              <p className="text-gray-600">
                                {item.geoInfo?.org || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Proxy/Hosting:
                              </span>
                              <p className="text-gray-600">
                                {item.geoInfo?.proxy
                                  ? "Proxy"
                                  : item.geoInfo?.hosting
                                  ? "Hosting"
                                  : "No"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Autenticità:
                              </span>
                              <p
                                className={`font-semibold ${
                                  getAuthenticityScore(item).color
                                }`}
                              >
                                {getAuthenticityScore(item).level} (
                                {getAuthenticityScore(item).score}/8)
                              </p>
                              {getAuthenticityScore(item).reasons.length >
                                0 && (
                                <p className="text-xs text-gray-500">
                                  {getAuthenticityScore(item).reasons.join(
                                    ", "
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nessun dato disponibile
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Click Totali
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {summary.totalClicks}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Download
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {summary.totalDownloads}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Visualizzazioni
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {summary.totalViews}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Eventi Totali
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {summary.totalClicks +
                summary.totalDownloads +
                summary.totalViews}
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Tracks */}
        {summary && summary.topTracks.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Top Tracks
            </h3>
            <ul className="space-y-3">
              {summary.topTracks.map((track, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-600 truncate">{track.title}</span>
                  <span className="font-bold text-gray-800">{track.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Countries */}
        {summary && summary.topCountries.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Top Paesi
            </h3>
            <ul className="space-y-3">
              {summary.topCountries.map((country, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{country.country}</span>
                  <span className="font-bold text-gray-800">
                    {country.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Browser */}
        {summary && summary.topBrowsers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Top Browser
            </h3>
            <ul className="space-y-3">
              {summary.topBrowsers.map((browser, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{browser.browser}</span>
                  <span className="font-bold text-gray-800">
                    {browser.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Geolocation Details */}
      {trackingData && trackingData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Dettagli Geolocalizzazione
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackingData
              .filter((item) => item.geoInfo)
              .slice(0, 6)
              .map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Tracce:</strong> {item.trackTitle}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Paese:</strong> {item.geoInfo?.country} (
                    {item.geoInfo?.countryCode})
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Città:</strong> {item.geoInfo?.city}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Regione:</strong> {item.geoInfo?.region}
                  </div>
                  {item.geoInfo?.lat && item.geoInfo?.lon && (
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Coordinate:</strong> {item.geoInfo.lat.toFixed(4)}
                      , {item.geoInfo.lon.toFixed(4)}
                    </div>
                  )}
                  {item.geoInfo?.timezone && (
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Timezone:</strong> {item.geoInfo.timezone}
                    </div>
                  )}
                  {item.geoInfo?.isp && (
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>ISP:</strong> {item.geoInfo.isp}
                    </div>
                  )}
                  {item.geoInfo?.source && (
                    <div className="text-xs text-gray-500">
                      Fonte: {item.geoInfo.source}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </main>
  );
}
