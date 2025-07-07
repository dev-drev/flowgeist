"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnalyticsWidgetProps {
  className?: string;
}

interface LiveStats {
  totalClicks: number;
  totalDownloads: number;
  totalViews: number;
  recentActivity: Array<{
    trackTitle: string;
    action: string;
    timestamp: string;
    country?: string;
  }>;
}

export default function AnalyticsWidget({
  className = "",
}: AnalyticsWidgetProps) {
  const [stats, setStats] = useState<LiveStats>({
    totalClicks: 0,
    totalDownloads: 0,
    totalViews: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Aggiorna ogni 30 secondi
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics?range=1d");
      const data = await response.json();

      if (data.summary) {
        setStats({
          totalClicks: data.summary.totalClicks,
          totalDownloads: data.summary.totalDownloads,
          totalViews: data.summary.totalViews,
          recentActivity: data.trackingData.slice(0, 5).map((item: any) => ({
            trackTitle: item.trackTitle,
            action: item.action,
            timestamp: new Date(
              item.timestamp?.toDate?.() || item.timestamp
            ).toLocaleString("it-IT"),
            country: item.geoInfo?.country,
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Live Analytics (24h)
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalClicks}
          </div>
          <div className="text-sm text-gray-600">Click</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalDownloads}
          </div>
          <div className="text-sm text-gray-600">Download</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalViews}
          </div>
          <div className="text-sm text-gray-600">Visualizzazioni</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Attività Recente
        </h4>
        <div className="space-y-2">
          {stats.recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activity.action === "download"
                      ? "bg-green-500"
                      : activity.action === "click"
                      ? "bg-blue-500"
                      : "bg-purple-500"
                  }`}
                ></span>
                <span className="font-medium text-gray-800">
                  {activity.trackTitle}
                </span>
                <span className="text-gray-500">({activity.action})</span>
              </div>
              <div className="text-right">
                <div className="text-gray-600">{activity.timestamp}</div>
                {activity.country && (
                  <div className="text-xs text-gray-400">
                    {activity.country}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchStats}
        className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
      >
        Aggiorna
      </button>
    </motion.div>
  );
}
