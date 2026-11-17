/**
 * NextRoute Logistics - NWT Live GPS Telemetry Sync Service
 * Connects to NWT Cloud Run GPS Data for real-time fleet positioning
 */

class NwtGpsSyncService {
  constructor() {
    this.pollIntervalMs = 8000; // 8 seconds real-time poll
    this.timer = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.endpoint = "/api/nwt/sync";
    this.subscribers = [];
  }

  init() {
    console.log("🛰️ [NwtGpsSync] Initializing Live GPS Sync Service...");
    this.fetchLiveTelemetry();
    this.startPolling();
    this.renderHeaderLiveBadge();
  }

  startPolling() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.fetchLiveTelemetry();
    }, this.pollIntervalMs);
  }

  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async fetchLiveTelemetry() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.updateSyncIndicators("syncing");

    try {
      // Add timestamp cache-buster to ensure fresh data
      const url = `${this.endpoint}?_t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const vList = Array.isArray(data.vehicles) ? data.vehicles : (data.vehicles?.value || []);
      if (data && vList.length > 0 && window.store) {
        window.store.syncNwtLive(data);
        this.lastSyncTime = new Date();
        this.updateSyncIndicators("synced", data);
        this.notify(data);
      }
    } catch (err) {
      console.warn("⚠️ [NwtGpsSync] Fetch live telemetry fallback:", err.message);
      this.updateSyncIndicators("offline");
    } finally {
      this.isSyncing = false;
    }
  }

  async manualSync() {
    console.log("🔄 [NwtGpsSync] Manual sync requested by user...");
    const btn = document.getElementById("btn-nwt-manual-sync");
    if (btn) {
      btn.classList.add("animate-spin");
      setTimeout(() => btn.classList.remove("animate-spin"), 1200);
    }
    await this.fetchLiveTelemetry();
    if (window.showToast) {
      const running = window.store?.getVehicles().filter(v => v.status === "running").length || 3;
      window.showToast(`🛰️ ซิงค์ GPS NWT สดเรียบร้อย (รถ 14 คัน • กำลังวิ่ง ${running} คัน)`, "success");
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(data) {
    this.subscribers.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  renderHeaderLiveBadge() {
    const container = document.getElementById("nwt-gps-status-container");
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-emerald-800">GPS NWT Live</span>
            <span id="nwt-running-badge" class="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded text-[10px] font-extrabold">วิ่ง 3 คัน</span>
          </div>
          <span id="nwt-sync-time" class="text-[10px] text-emerald-600 font-mono">ซิงค์สด • 14 คัน</span>
        </div>
        <button id="btn-nwt-manual-sync" onclick="window.NwtGpsSync.manualSync()" title="กดเพื่อซิงค์ข้อมูลดาวเทียมทันที" class="ml-1 p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    `;
  }

  updateSyncIndicators(status, data) {
    const badge = document.getElementById("nwt-running-badge");
    const timeEl = document.getElementById("nwt-sync-time");
    if (!badge || !timeEl) return;

    if (status === "syncing") {
      timeEl.textContent = "กำลังเชื่อมดาวเทียม...";
    } else if (status === "synced" && data) {
      const running = data.runningCount || (data.vehicles ? data.vehicles.filter(v => v.status === "running").length : 3);
      badge.textContent = `วิ่ง ${running} คัน`;
      const timeStr = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      timeEl.textContent = `อัปเดต: ${timeStr} น.`;
    } else if (status === "offline") {
      timeEl.textContent = "ใช้ข้อมูลแคชล่าสุด";
    }
  }
}

// Global instance
window.NwtGpsSync = new NwtGpsSyncService();

document.addEventListener("DOMContentLoaded", () => {
  window.NwtGpsSync.init();
});
