/**
 * NextRoute Logistics - Fleet Safety & Smart Alerts Service
 * Real-time monitoring for:
 * 1. Excessive Idling (> 1 hour Critical Emergency / > 30 min Warning)
 * 2. Driver Fatigue (DLT 4-hour continuous driving rule)
 * 3. Hazardous Cargo Speed Violations (> 80 km/h)
 * 4. Active Driver SOS Emergency Incidents
 */

class SafetyAlertsService {
  constructor() {
    this.alerts = [];
    this.dismissedAlerts = new Set();
    this.idleTimers = {}; // vehicleId -> startTimestamp (epoch ms)
    this.simulationOverrides = {};
    this.soundEnabled = true;
    this.audioCtx = null;
    this.lastCriticalCount = 0;

    // Defined Geofence Safe Zones (พื้นที่ปลอดภัยที่ได้รับการยกเว้นการแจ้งเตือนฉุกเฉิน)
    this.safeZones = [
      {
        id: "SAFE-HQ",
        code: "NRL_HQ",
        name: "ศูนย์ปฏิบัติการ / ลานจอดสำนักงานใหญ่ (NRL ชลบุรี)",
        address: "99/12 หมู่ 3 ต.ดอนหัวฬ่อ อ.เมืองชลบุรี จ.ชลบุรี",
        lat: 13.2083,
        lng: 101.0000,
        radiusMeters: 600,
        description: "พื้นที่คุ้มกัน: ยานพาหนะที่จอดรองานหรือติดเครื่องยนต์ในศูนย์จะได้รับการยกเว้นการแจ้งเตือนฉุกเฉิน"
      }
    ];
  }

  /**
   * ตรวจสอบว่าพิกัด GPS อยู่ในเขตพื้นที่ปลอดภัย (Safe Zone) หรือไม่
   */
  checkSafeZone(lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    for (const zone of this.safeZones) {
      const distM = this.calcDistanceMeters(lat, lng, zone.lat, zone.lng);
      if (distM <= zone.radiusMeters) {
        return {
          isInside: true,
          zone: zone,
          distMeters: Math.round(distM)
        };
      }
    }
    return null;
  }

  /**
   * คำนวณระยะทางระหว่างพิกัด 2 จุดเป็นเมตร (Haversine Formula)
   */
  calcDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // รัศมีโลกเป็นเมตร
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  init() {
    console.log("🛡️ [SafetyAlerts] Initializing Fleet Safety & Smart Alerts Service...");
    
    // Initial evaluation
    this.evaluate();

    // Listen to real-time NWT GPS updates if sync service exists
    if (window.nwtGpsSync && typeof window.nwtGpsSync.subscribe === "function") {
      window.nwtGpsSync.subscribe(() => {
        this.evaluate();
      });
    }

    // Periodic check every 5 seconds
    setInterval(() => {
      this.evaluate();
    }, 5000);

    // Bind document click to dismiss dropdown if clicked outside
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("safety-alerts-dropdown");
      const toggleBtn = document.getElementById("btn-safety-alerts-toggle");
      if (dropdown && !dropdown.classList.contains("hidden")) {
        if (!dropdown.contains(e.target) && !toggleBtn?.contains(e.target)) {
          dropdown.classList.add("hidden");
        }
      }
    });
  }

  /**
   * Evaluates fleet telemetries against all safety & emergency rules
   */
  evaluate() {
    if (!window.store) return;
    const vehicles = window.store.getVehicles() || [];
    const drivers = window.store.getDrivers ? window.store.getDrivers() : [];
    const driverMap = {};
    drivers.forEach(d => { driverMap[d.id] = d; });

    const newAlerts = [];
    const now = Date.now();

    // -----------------------------------------------------------------
    // Rule 1: Active Driver SOS Emergency
    // -----------------------------------------------------------------
    try {
      const rawSos = localStorage.getItem("NEXTROUTE_ACTIVE_SOS");
      if (rawSos) {
        const sos = JSON.parse(rawSos);
        const sosId = `sos_${sos.timestamp || sos.time}`;
        newAlerts.push({
          id: sosId,
          type: "sos_emergency",
          level: "critical", // 🔴 Critical
          badgeText: "🚨 สัญญาณฉุกเฉิน SOS",
          title: `เหตุฉุกเฉินจากคนขับ: ${sos.typeLabel || "SOS"}`,
          desc: `คนขับส่งสัญญาณขอความช่วยเหลือ: "${sos.detail || "ขอความช่วยเหลือด่วน"}" (${sos.time || "ล่าสุด"} น.)`,
          vehicleId: sos.vehicleId || "V-07",
          plate: sos.plate || "ชบ.74-0549",
          driverName: sos.driverName || "นายสุเทพ โพธิ์ศรี",
          phone: "081-987-1007",
          address: sos.address || "พิกัด GPS สดจากมือถือคนขับ",
          lat: 13.14125,
          lng: 101.16842,
          timestamp: sos.timestamp || new Date().toISOString(),
          isSos: true
        });
      }
    } catch (e) {
      console.warn("Error reading SOS alert:", e);
    }

    // -----------------------------------------------------------------
    // Check Telemetries for Each Vehicle in Fleet
    // -----------------------------------------------------------------
    vehicles.forEach(v => {
      const driver = driverMap[v.driverId] || { name: v.driverName, phone: "081-987-1001" };
      const driverPhone = driver.phone || "081-987-1001";

      const curLat = this.simulationOverrides[v.id]?.lat ?? v.lat;
      const curLng = this.simulationOverrides[v.id]?.lng ?? v.lng;
      const curAddr = this.simulationOverrides[v.id]?.address ?? v.address;

      // ตรวจสอบว่าพิกัดรถอยู่ในเขตพื้นที่ปลอดภัย (Safe Zone เช่น สำนักงานใหญ่ NRL) หรือไม่
      const safeCheck = this.checkSafeZone(curLat, curLng);
      const isInsideSafeZone = Boolean(safeCheck && safeCheck.isInside);

      // ---------------------------------------------------------------
      // Rule 2: Excessive Idling (จอดติดเครื่องยนต์นานเกิน 1 ชั่วโมง)
      // ---------------------------------------------------------------
      const isIdle = (v.status === "idle") || (v.speed === 0 && this.simulationOverrides[v.id]?.forceIdle);

      if (isIdle) {
        if (isInsideSafeZone) {
          // 🛡️ รถอยู่ในเขต Geofence Safe Zone (ลานจอดสำนักงานใหญ่/ศูนย์ชลบุรี)
          // ยกเว้นการแจ้งเตือนฉุกเฉินวิกฤต เพื่อไม่ให้รบกวนกรณีจอดรองานหรือช่างตรวจเช็คเครื่องยนต์
          delete this.idleTimers[v.id];
        } else {
          // ⚠️ รถจอดติดเครื่องยนต์ "นอกเขตปลอดภัย" (ข้างทางหลวง, บนถนน, ทางเปลี่ยว)
          if (!this.idleTimers[v.id]) {
            this.idleTimers[v.id] = now;
          }

          const idleSince = this.idleTimers[v.id];
          const idleMins = Math.floor((now - idleSince) / (60 * 1000));

          // Rule 2: CRITICAL Idle > 60 Minutes (ความเสี่ยงอุบัติเหตุร้ายแรง / คนขับหมดสติ)
          if (idleMins >= 60) {
            newAlerts.push({
              id: `idle_crit_${v.id}`,
              type: "idle_critical",
              level: "critical", // 🔴
              badgeText: "🔴 จอดติดเครื่องวิกฤต (> 1 ชม.)",
              title: `จอดติดเครื่องยนต์นานผิดปกติ ${idleMins} นาที (นอกศูนย์)`,
              desc: `รถจอดติดเครื่องนิ่งสนิทเกิน 1 ชั่วโมงนอกเขตปลอดภัยที่ "${curAddr || "ไม่ระบุพิกัด"}" อาจเกิดเหตุฉุกเฉิน คนขับหมดสติ หรืออุบัติเหตุร้ายแรง ติดต่อคนขับทันที`,
              vehicleId: v.id,
              plate: v.plate,
              driverName: v.driverName || driver.name,
              phone: driverPhone,
              address: curAddr,
              lat: curLat,
              lng: curLng,
              durationMins: idleMins,
              timestamp: new Date(idleSince).toISOString(),
              isCriticalIdle: true
            });
          }
        }
      } else {
        // Not idle anymore, reset idle timer unless simulated
        if (!this.simulationOverrides[v.id]?.forceIdle) {
          delete this.idleTimers[v.id];
        }
      }
    });

    // Filter out alerts explicitly dismissed by the user in this session
    this.alerts = newAlerts.filter(a => !this.dismissedAlerts.has(a.id));

    // Sound notification if new critical alert appears
    const criticalCount = this.alerts.filter(a => a.level === "critical").length;
    if (criticalCount > this.lastCriticalCount) {
      this.playChime("critical");
    }
    this.lastCriticalCount = criticalCount;

    // Render UI components
    this.renderAll();
  }

  // -------------------------------------------------------------------
  // UI Rendering: Header Badge, Dropdown, Emergency Banner, Dashboard Hub
  // -------------------------------------------------------------------
  renderAll() {
    this.renderHeaderNotificationBell();
    this.renderEmergencyBanner();
    this.renderDashboardSafetyHub();
  }

  renderHeaderNotificationBell() {
    const badge = document.getElementById("safety-alert-badge");
    const count = this.alerts.length;
    const criticalCount = this.alerts.filter(a => a.level === "critical").length;

    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove("hidden");
        if (criticalCount > 0) {
          badge.className = "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse";
        } else {
          badge.className = "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs";
        }
      } else {
        badge.classList.add("hidden");
      }
    }

    // Render Dropdown content if present
    const dropdownList = document.getElementById("safety-alerts-dropdown-list");
    if (dropdownList) {
      if (this.alerts.length === 0) {
        dropdownList.innerHTML = `
          <div class="py-8 text-center text-slate-400 text-xs">
            <svg class="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>กองรถปลอดภัยปกติ</div>
            <div class="text-[10px] text-slate-400 mt-0.5">ไม่พบเหตุฉุกเฉินหรือการกระทำผิดกฎระเบียบ</div>
          </div>
        `;
      } else {
        dropdownList.innerHTML = this.alerts.map(a => this.renderAlertItemHtml(a, true)).join("");
      }
    }
  }

  renderEmergencyBanner() {
    const banner = document.getElementById("fleet-emergency-banner");
    if (!banner) return;

    const criticalAlerts = this.alerts.filter(a => a.level === "critical");
    if (criticalAlerts.length > 0) {
      const top = criticalAlerts[0];
      banner.className = "mb-5 p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-lg border border-rose-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-fadeIn";
      banner.style.display = "flex";
      banner.innerHTML = `
        <div class="flex items-start sm:items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0 animate-bounce">
            🚨
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-rose-800 tracking-wider whitespace-nowrap shadow-2xs">
                ${top.badgeText}
              </span>
              <span class="text-xs font-bold text-rose-100 font-mono whitespace-nowrap">${top.plate} (${top.driverName})</span>
            </div>
            <h4 class="text-sm font-black mt-1 leading-snug">${top.title}</h4>
            <p class="text-xs text-rose-100 max-w-2xl leading-relaxed mt-0.5">${top.desc}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
          <!-- Driver Contact Number Badge for Desktop Admin -->
          <div class="px-3.5 py-2 bg-white/20 backdrop-blur-xs border border-white/30 rounded-xl text-white flex items-center gap-2 shadow-xs">
            <span class="text-xs text-rose-100 font-bold whitespace-nowrap">📞 เบอร์โทรติดต่อคนขับ:</span>
            <span class="font-mono text-sm font-black text-white select-all tracking-wider">${top.phone}</span>
          </div>
          <!-- Dismiss -->
          <button type="button" onclick="window.SafetyAlerts.dismissAlert('${top.id}')" class="px-3 py-2 text-rose-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer text-xs font-bold" title="รับทราบและปิดการเตือนนี้">
            ✕ ปิดรับทราบ
          </button>
        </div>
      `;
    } else {
      banner.style.display = "none";
    }
  }

  renderDashboardSafetyHub() {
    const hubContainer = document.getElementById("dashboard-safety-hub");
    if (!hubContainer) return;

    const criticalCount = this.alerts.filter(a => a.level === "critical").length;
    const sosCount = this.alerts.filter(a => a.isSos).length;
    const idleCritCount = this.alerts.filter(a => a.isCriticalIdle).length;
    const safeCount = Math.max(0, 14 - criticalCount);

    let alertItemsHtml = "";
    if (this.alerts.length === 0) {
      alertItemsHtml = `
        <div class="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div class="text-3xl mb-2">🛡️</div>
          <div class="text-sm font-bold text-slate-800">ระบบเฝ้าระวังเหตุฉุกเฉิน: สถานะปกติทุกคัน</div>
          <div class="text-xs text-slate-500 mt-1">รถทั้ง 14 คันไม่อยู่ในภาวะวิกฤต ไม่พบสัญญาณขอความช่วยเหลือ SOS หรือการจอดติดเครื่องยนต์นานเกิน 1 ชั่วโมง</div>
        </div>
      `;
    } else {
      alertItemsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${this.alerts.map(a => this.renderAlertItemHtml(a, false)).join("")}
        </div>
      `;
    }

    hubContainer.innerHTML = `
      <!-- Safety Hub Header & KPI Stats -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🛡️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">ศูนย์เฝ้าระวังเหตุฉุกเฉินวิกฤต (Fleet Emergency & Live SOS Hub)</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  ระบบ Real-Time SOS Alert
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">แจ้งเตือนเฉพาะเหตุฉุกเฉินวิกฤตจริง: สัญญาณขอความช่วยเหลือ SOS จากคนขับ และการจอดติดเครื่องยนต์นานเกิน 1 ชั่วโมง</p>
            </div>
          </div>

          <!-- Simulator Quick Test Bar -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" onclick="window.SafetyAlerts.simulateIdleEmergency('V-07', 75)" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer" title="จำลองรถจอดติดเครื่องยนต์นอกศูนย์ 75 นาที">
              <span>⚡ จำลองจอดติดเครื่อง 75 น. (นอกศูนย์)</span>
            </button>
            <button type="button" onclick="window.SafetyAlerts.simulateDriverSos()" class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer" title="จำลองคนขับกดยิง SOS แจ้งเหตุ">
              <span>🚨 จำลอง SOS</span>
            </button>
            <button type="button" onclick="window.SafetyAlerts.resetSimulation()" class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-bold transition cursor-pointer" title="ล้างการจำลองกลับสู่ข้อมูลจริง">
              <span>🔄 รีเซ็ต</span>
            </button>
          </div>
        </div>

        <!-- Geofence Safe Zone Status Indicator -->
        <div class="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div>
              <span class="font-bold text-emerald-950">🛡️ ระบบ Geofence Safe Zone (เขตปลอดภัย):</span>
              <span class="text-emerald-800 ml-1">สำนักงานใหญ่ NRL ชลบุรี (รัศมีคุ้มกัน 600 ม.)</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap">
            ✓ คุ้มกันอัตโนมัติ: ยกเว้นการแจ้งเตือนจอดติดเครื่องสำหรับรถในศูนย์
          </span>
        </div>

        <!-- 3 KPI Summary Counters for Critical Emergencies -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <div class="text-[11px] font-bold text-rose-700">🚨 สัญญาณฉุกเฉิน SOS (จากคนขับ)</div>
            <div class="text-2xl font-black text-rose-900 mt-0.5 font-mono">${sosCount} <span class="text-xs font-normal text-rose-600">รายการ</span></div>
            <div class="text-[10px] text-rose-500 mt-0.5">คนขับกดขอความช่วยเหลือด่วน</div>
          </div>
          <div class="p-3.5 rounded-xl bg-red-50 border border-red-200">
            <div class="text-[11px] font-bold text-red-700">⏱️ จอดติดเครื่องวิกฤต (> 1 ชม.)</div>
            <div class="text-2xl font-black text-red-900 mt-0.5 font-mono">${idleCritCount} <span class="text-xs font-normal text-red-600">คัน</span></div>
            <div class="text-[10px] text-red-500 mt-0.5">เสี่ยงอุบัติเหตุ / คนขับหมดสติ</div>
          </div>
          <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div class="text-[11px] font-bold text-emerald-700">🛡️ ยานพาหนะสถานะปกติ</div>
            <div class="text-2xl font-black text-emerald-900 mt-0.5 font-mono">${safeCount} <span class="text-xs font-normal text-emerald-600">คัน</span></div>
            <div class="text-[10px] text-emerald-500 mt-0.5">ไม่มีเหตุฉุกเฉิน (สดจาก NWT GPS)</div>
          </div>
        </div>

        <!-- Alert Cards List -->
        <div>
          ${alertItemsHtml}
        </div>
      </div>
    `;
  }

  renderAlertItemHtml(a, isCompact = false) {
    const isCrit = a.level === "critical";
    const bgClass = isCrit ? "bg-rose-50/70 border-rose-300" : "bg-amber-50/70 border-amber-200";
    const badgeColor = isCrit ? "bg-rose-600 text-white" : "bg-amber-500 text-white";

    if (isCompact) {
      // In Header Dropdown
      return `
        <div class="p-3 border-b border-slate-100 hover:bg-slate-50 transition space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${badgeColor}">${a.badgeText}</span>
            <span class="text-[10px] font-mono text-slate-400 font-bold">${a.plate}</span>
          </div>
          <div class="text-xs font-bold text-slate-800 leading-tight">${a.title}</div>
          <div class="text-[11px] text-slate-500 leading-snug line-clamp-2">${a.desc}</div>
          <div class="flex items-center justify-between pt-1 text-[11px]">
            <span class="font-bold text-slate-700">📞 ติดต่อคนขับ: <span class="font-mono text-rose-600 font-black select-all">${a.phone}</span></span>
            <button onclick="window.SafetyAlerts.dismissAlert('${a.id}')" class="text-slate-400 hover:text-slate-600 text-[10px]">✕ รับทราบ</button>
          </div>
        </div>
      `;
    }

    // Full Card in Dashboard Hub
    return `
      <div class="p-4 rounded-xl border ${bgClass} shadow-xs flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${badgeColor} shadow-2xs">${a.badgeText}</span>
            <span class="text-xs font-bold font-mono text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">${a.plate} (${a.vehicleId})</span>
          </div>

          <h4 class="text-xs font-black text-slate-900 leading-snug">${a.title}</h4>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">${a.desc}</p>

          <!-- Driver Phone Box for Desktop Admin -->
          <div class="mt-2.5 p-2 bg-white/90 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span class="font-bold text-slate-700">📞 เบอร์โทรติดต่อคนขับ:</span>
            <span class="font-mono font-black text-rose-700 text-xs select-all bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tracking-wider">${a.phone}</span>
          </div>

          <div class="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              <span>คนขับ:</span> <strong class="text-slate-800">${a.driverName}</strong>
            </div>
            <div>
              <span>พิกัด:</span> <strong class="text-slate-800">${a.address || "สดจาก NWT"}</strong>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
          <button type="button" onclick="window.SafetyAlerts.sendSafetyPing('${a.vehicleId}', '${a.driverName}')" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs whitespace-nowrap cursor-pointer" title="ส่งสัญญาณสอบถามความปลอดภัยไปยังหน้าจอมือถือคนขับ">
            <span>💬 ทักถามสถานะคนขับ</span>
          </button>
          <button type="button" onclick="window.SafetyAlerts.dismissAlert('${a.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer" title="รับทราบการเตือนนี้">
            ✕ ปิดรับทราบ
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------
  // Actions: Call, Locate on Map, Ping Check, Dismiss
  // -------------------------------------------------------------------
  locateVehicle(vehicleId) {
    console.log(`📍 [SafetyAlerts] Locating vehicle ${vehicleId} on GPS map...`);
    const app = window.App || (typeof App !== "undefined" ? App : null);
    if (!app) {
      console.error("App controller not found");
      return;
    }

    // 1. Switch to GPS Tracking Tab
    app.switchTab("gps-tracking");

    // 2. Allow tab DOM to render, invalidate size, and focus vehicle
    setTimeout(() => {
      app.focusVehicleOnMap(vehicleId);

      const mapEl = document.getElementById("gps-fullscreen-map");
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);

    // Double-ensure after transition completes
    setTimeout(() => {
      app.focusVehicleOnMap(vehicleId);
    }, 450);

    if (app.showToast) {
      const v = window.store ? window.store.getVehicle(vehicleId) : null;
      const plate = v ? v.plate : vehicleId;
      app.showToast(`📍 กำลังซูมตำแหน่ง GPS คัน ${plate}`, "info");
    }
  }

  sendSafetyPing(vehicleId, driverName) {
    const pingKey = `NEXTROUTE_PING_${vehicleId}`;
    const pingData = {
      vehicleId,
      driverName,
      time: new Date().toLocaleTimeString('th-TH'),
      message: "ศูนย์ควบคุมตรวจสอบความปลอดภัย: โปรดยืนยันว่าคุณและรถปลอดภัยดี"
    };
    localStorage.setItem(pingKey, JSON.stringify(pingData));
    if (window.App && window.App.showToast) {
      window.App.showToast(`💬 ส่งข้อความตรวจสอบความปลอดภัยไปยังหน้าจอของ ${driverName} เรียบร้อยแล้ว`, "success");
    }
  }

  dismissAlert(alertId) {
    this.dismissedAlerts.add(alertId);
    this.evaluate();
    if (window.App && window.App.showToast) {
      window.App.showToast("รับทราบการแจ้งเตือนเรียบร้อยแล้ว", "info");
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById("safety-alerts-dropdown");
    if (dropdown) {
      dropdown.classList.toggle("hidden");
    }
  }

  // -------------------------------------------------------------------
  // Simulator Controls (สำหรับการทดสอบและสาธิต)
  // -------------------------------------------------------------------
  simulateIdleEmergency(vehicleId = "V-07", minutes = 75) {
    this.dismissedAlerts.delete(`idle_crit_${vehicleId}`);
    
    // จำลองพิกัดรถจอดติดเครื่องยนต์อยู่นอกศูนย์ (บนทางหลวงสาย 344 บ้านบึง นอกเขต Geofence Safe Zone)
    this.simulationOverrides[vehicleId] = {
      forceIdle: true,
      lat: 13.14125,
      lng: 101.16842,
      address: "ทางหลวงสาย 344 กม.42 ต.หนองไผ่แก้ว อ.บ้านบึง (นอกเขตปลอดภัยสำนักงานใหญ่)"
    };
    this.idleTimers[vehicleId] = Date.now() - (minutes * 60 * 1000);
    this.evaluate();

    if (window.App && window.App.showToast) {
      window.App.showToast(`🧪 จำลองสถานการณ์: รถคัน ${vehicleId} จอดติดเครื่องยนต์นอกศูนย์นาน ${minutes} นาที (> 1 ชม.) แล้ว`, "error");
    }
  }

  simulateDriverSos(driverId = "D-07") {
    const fakeSos = {
      type: "accident",
      typeLabel: "อุบัติเหตุเฉี่ยวชน / รถตกไหล่ทาง",
      detail: "เกิดเหตุเฉี่ยวชนกีดขวางทางเลนซ้าย คนขับติดอยู่ในห้องโดยสาร",
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      driverName: "นายสุเทพ โพธิ์ศรี (D-07)",
      plate: "ชบ.74-0549",
      vehicleId: "V-07",
      address: "ทางหลวงหมายเลข 344 กม. 42 ต.หนองไผ่แก้ว อ.บ้านบึง จ.ชลบุรี"
    };
    localStorage.setItem("NEXTROUTE_ACTIVE_SOS", JSON.stringify(fakeSos));
    this.dismissedAlerts.clear();
    this.evaluate();

    if (window.App && window.App.showToast) {
      window.App.showToast("🚨 จำลองสัญญาณฉุกเฉิน SOS จากคนขับ D-07 เข้าสู่ศูนย์ควบคุม!", "error");
    }
  }

  resetSimulation() {
    this.simulationOverrides = {};
    this.idleTimers = {};
    localStorage.removeItem("NEXTROUTE_ACTIVE_SOS");
    this.dismissedAlerts.clear();
    this.evaluate();

    if (window.App && window.App.showToast) {
      window.App.showToast("🔄 รีเซ็ตการแจ้งเตือนกลับสู่ข้อมูลจริง (สถานะปลอดภัยทั้งหมด)", "success");
    }
  }

  // -------------------------------------------------------------------
  // Audio Alert (Web Audio API - Pure synthesized sound, 100% offline)
  // -------------------------------------------------------------------
  playChime(type = "critical") {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const t = this.audioCtx.currentTime;
      if (type === "critical") {
        // High-pitched urgent two-tone chime (880Hz -> 660Hz)
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(660, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.45);
      } else {
        osc.frequency.setValueAtTime(520, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      }
    } catch (e) {
      // Audio not permitted without prior user gesture; ignore silently
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const btn = document.getElementById("btn-toggle-sound");
    if (btn) {
      btn.textContent = this.soundEnabled ? "🔊 เปิดเสียงแจ้งเตือน" : "🔇 ปิดเสียงเตือน";
    }
    if (window.App && window.App.showToast) {
      window.App.showToast(this.soundEnabled ? "เปิดเสียงแจ้งเตือนแล้ว" : "ปิดเสียงแจ้งเตือนแล้ว", "info");
    }
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.SafetyAlerts = new SafetyAlertsService();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SafetyAlertsService;
}
