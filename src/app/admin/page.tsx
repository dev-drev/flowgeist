"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [systemInfo, setSystemInfo] = useState({
    timestamp: new Date().toLocaleString(),
    status: "operational",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemInfo({
        timestamp: new Date().toLocaleString(),
        status: "operational",
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const adminSections = [
    {
      title: "Flowgeist Panel",
      description: "Gestisci tracce audio e file",
      href: "/flowgeist-panel",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Analytics",
      description: "Visualizza statistiche e metriche",
      href: "/flowgeist-panel/analytics",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Music",
      description: "Pagina musica principale",
      href: "/music",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Home",
      description: "Torna alla homepage",
      href: "/",
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 font-grotesque">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-400 text-lg">
              Sistema {systemInfo.status} • {systemInfo.timestamp}
            </p>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className={`${section.color} rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
            >
              <h2 className="text-2xl font-bold text-white mb-3 font-grotesque">
                {section.title}
              </h2>
              <p className="text-white/80 text-base">{section.description}</p>
            </Link>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2 font-grotesque">
              Ambiente
            </h3>
            <p className="text-3xl font-bold text-white">
              {process.env.NODE_ENV || "development"}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2 font-grotesque">
              Framework
            </h3>
            <p className="text-3xl font-bold text-white">Next.js 15</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2 font-grotesque">
              Versione
            </h3>
            <p className="text-3xl font-bold text-white">v0.1.0</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Flowgeist Admin Panel • Accesso locale
          </p>
        </div>
      </div>
    </div>
  );
}
