// Sistema di tracking temporaneo che funziona senza Firestore
// Usa localStorage per salvare i dati localmente

interface TrackingData {
  trackId: number;
  trackTitle: string;
  action: 'click' | 'download' | 'play' | 'view';
  userAgent: {
    browser: string;
    os: string;
    device: string;
  };
  referrer: string;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
}

class LocalTracking {
  private storageKey = 'flowgeist_tracking_data';
  private maxEntries = 1000; // Limita il numero di entry salvate

  private getStoredData(): TrackingData[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading tracking data:', error);
      return [];
    }
  }

  private saveData(data: TrackingData[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }

  async trackEvent(data: Omit<TrackingData, 'timestamp' | 'sessionId'>): Promise<{ success: boolean; id: string }> {
    try {
      const trackingData: TrackingData = {
        ...data,
        timestamp: Date.now(),
        sessionId: this.generateSessionId()
      };

      const existingData = this.getStoredData();
      existingData.push(trackingData);

      // Mantieni solo gli ultimi maxEntries
      if (existingData.length > this.maxEntries) {
        existingData.splice(0, existingData.length - this.maxEntries);
      }

      this.saveData(existingData);

      return {
        success: true,
        id: trackingData.sessionId
      };
    } catch (error) {
      console.error('Local tracking error:', error);
      return {
        success: false,
        id: ''
      };
    }
  }

  async getAnalytics(range: string = '7d'): Promise<{
    trackingData: TrackingData[];
    summary: {
      totalClicks: number;
      totalDownloads: number;
      totalViews: number;
      topTracks: Array<{ title: string; count: number }>;
      topBrowsers: Array<{ browser: string; count: number }>;
    };
  }> {
    try {
      const allData = this.getStoredData();
      
      // Filtra per range di date
      const now = Date.now();
      let startTime: number;
      
      switch (range) {
        case '1d':
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case '7d':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case '90d':
          startTime = now - 90 * 24 * 60 * 60 * 1000;
          break;
        default:
          startTime = now - 7 * 24 * 60 * 60 * 1000;
      }

      const filteredData = allData.filter(item => item.timestamp >= startTime);

      // Calcola le statistiche
      const summary = this.calculateSummary(filteredData);

      return {
        trackingData: filteredData,
        summary
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        trackingData: [],
        summary: {
          totalClicks: 0,
          totalDownloads: 0,
          totalViews: 0,
          topTracks: [],
          topBrowsers: []
        }
      };
    }
  }

  private calculateSummary(data: TrackingData[]) {
    const summary = {
      totalClicks: 0,
      totalDownloads: 0,
      totalViews: 0,
      topTracks: [] as Array<{ title: string; count: number }>,
      topBrowsers: [] as Array<{ browser: string; count: number }>
    };

    const trackCounts: { [key: string]: number } = {};
    const browserCounts: { [key: string]: number } = {};

    data.forEach(item => {
      // Conta le azioni
      switch (item.action) {
        case 'click':
          summary.totalClicks++;
          break;
        case 'download':
          summary.totalDownloads++;
          break;
        case 'view':
          summary.totalViews++;
          break;
      }

      // Conta le tracce
      const trackTitle = item.trackTitle || 'Unknown';
      trackCounts[trackTitle] = (trackCounts[trackTitle] || 0) + 1;

      // Conta i browser
      const browser = item.userAgent?.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    // Converti in array e ordina
    summary.topTracks = Object.entries(trackCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    summary.topBrowsers = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return summary;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  clearData(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing tracking data:', error);
    }
  }

  exportData(): string {
    try {
      const data = this.getStoredData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }
}

export const localTracking = new LocalTracking(); 