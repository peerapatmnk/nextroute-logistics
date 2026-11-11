/**
 * NextRoute Logistics - Leaflet Map & GPS Tracking Manager
 */

class MapManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.map = null;
    this.markers = {};
    this.locationMarkers = {};
    this.routePolyline = null;
    this.routeLines = [];
    this.simulationTimer = null;
    this.init();
  }

  init() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === "undefined") return;

    // Center on Eastern Seaboard / Chonburi - Rayong - Bangkok area
    const center = this.options.center || [13.25, 101.10];
    const zoom = this.options.zoom || 9;

    this.map = L.map(this.containerId, {
      zoomControl: true,
      attributionControl: false
    }).setView(center, zoom);

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18
    }).addTo(this.map);

    if (!this.options.skipInitialRender) {
      this.renderLocations();
      this.renderVehicles();
    }
  }

  createVehicleIcon(status, speed, plate) {
    let colorClass = "bg-emerald-500 border-emerald-600";
    let pulseClass = "animate-ping";
    let iconColor = "#10b981";

    if (status === "resting") {
      colorClass = "bg-amber-500 border-amber-600";
      pulseClass = "";
      iconColor = "#f59e0b";
    } else if (status === "maintenance" || status === "offline") {
      colorClass = "bg-rose-500 border-rose-600";
      pulseClass = "";
      iconColor = "#ef4444";
    } else if (status === "idle" || status === "ready") {
      colorClass = "bg-blue-500 border-blue-600";
      pulseClass = "";
      iconColor = "#3b82f6";
    }

    const html = `
      <div class="relative flex items-center justify-center">
        ${status === "running" ? `<span class="absolute inline-flex h-8 w-8 rounded-full ${colorClass} opacity-40 ${pulseClass}"></span>` : ""}
        <div class="relative w-8 h-8 rounded-full ${colorClass} border-2 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m0 0l3 5m-3-5v8m-8 0V7m0 8h8m-8 0H5a2 2 0 01-2-2V7a2 2 0 012-2h3m8 8h2a2 2 0 002-2v-3.5L16 7M5 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </div>
        <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded whitespace-nowrap shadow pointer-events-none">
          ${plate}
        </div>
      </div>
    `;

    return L.divIcon({
      className: "custom-vehicle-marker",
      html: html,
      iconSize: [36, 42],
      iconAnchor: [18, 21],
      popupAnchor: [0, -20]
    });
  }

  createLocationIcon(type) {
    let bg = "bg-indigo-600";
    if (type === "pickup") bg = "bg-emerald-600";
    if (type === "dropoff") bg = "bg-rose-600";
    if (type === "cross_border") bg = "bg-purple-600";

    const html = `
      <div class="w-6 h-6 rounded-full ${bg} border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
    `;

    return L.divIcon({
      className: "custom-loc-marker",
      html: html,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  renderLocations() {
    if (!this.map || !window.store) return;
    const locations = window.store.getLocations();

    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: this.createLocationIcon(loc.type)
      }).addTo(this.map);

      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${loc.province}</div>
          <div class="text-sm font-bold text-slate-800">${loc.name}</div>
          <div class="mt-1 text-xs text-slate-600 flex items-center gap-1">
            <span>รหัส:</span> <span class="font-mono font-medium">${loc.code}</span>
          </div>
          <div class="text-xs text-slate-600 flex items-center gap-1">
            <span>โทร:</span> <span>${loc.contact || "-"}</span>
          </div>
        </div>
      `);

      this.locationMarkers[loc.id] = marker;
    });
  }

  renderVehicles(filterStatus = "all") {
    if (!this.map || !window.store) return;
    const vehicles = window.store.getVehicles();

    // Clear existing
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    this.markers = {};

    vehicles.forEach(v => {
      if (filterStatus !== "all" && v.status !== filterStatus) return;

      const driver = window.store.getDriver(v.driverId) || { name: "ยังไม่ระบุ" };
      const currentJob = window.store.getJobs().find(j => j.vehicleId === v.id && !window.store.isJobCompleted(j));
      const dropoffLoc = currentJob ? window.store.getLocation(currentJob.dropoffLocId) : null;
      const liveEst = (currentJob && dropoffLoc && window.ETAEngine)
        ? window.ETAEngine.estimateLiveVehicleStatus(v, currentJob, dropoffLoc)
        : null;

      const marker = L.marker([v.lat, v.lng], {
        icon: this.createVehicleIcon(v.status, v.speed, v.plate)
      }).addTo(this.map);

      const statusBadge = {
        running: '<span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">กำลังวิ่ง</span>',
        resting: '<span class="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">จอดพัก</span>',
        idle: '<span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">พร้อมปฏิบัติงาน</span>',
        ready: '<span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">พร้อมปฏิบัติงาน</span>',
        maintenance: '<span class="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">ตรวจเช็ค</span>',
        offline: '<span class="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full">ออฟไลน์</span>'
      }[v.status] || v.status;

      marker.bindPopup(`
        <div class="p-2 min-w-[260px]">
          <div class="flex items-center justify-between border-b pb-1.5 mb-2">
            <span class="font-bold text-base text-slate-800">${v.plate}</span>
            ${statusBadge}
          </div>
          <div class="text-xs space-y-1 text-slate-600">
            <div class="flex justify-between"><span>รุ่นรถ:</span> <span class="font-medium text-slate-800">${v.brand} ${v.model}</span></div>
            <div class="flex justify-between"><span>พนักงานขับรถ:</span> <span class="font-medium text-slate-800">${driver.name}</span></div>
            <div class="flex justify-between"><span>ความเร็วปัจจุบัน:</span> <span class="font-bold text-blue-600">${v.speed} กม./ชม.</span></div>
            <div class="flex justify-between"><span>ระดับน้ำมัน:</span> <span class="font-medium text-slate-800">${v.fuelLevel}%</span></div>
            ${currentJob ? `
              <div class="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-bold text-slate-700">งาน: ${currentJob.code}</span>
                  ${currentJob.isCrossBorder ? '<span class="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded font-bold">ข้ามแดน</span>' : ''}
                </div>
                <div class="text-xs text-indigo-700 font-medium">${currentJob.productType} (${currentJob.productQty})</div>
                ${dropoffLoc ? `<div class="text-[11px] text-slate-500">ปลายทาง: ${dropoffLoc.name}</div>` : ''}
                ${liveEst ? `
                  <div class="flex justify-between text-[11px] pt-1 text-emerald-700 font-semibold">
                    <span>เหลือ ~${liveEst.remainingDistKm} กม. (${liveEst.remainingText})</span>
                    <span>ถึง ~${liveEst.liveEtaTimeOnly}</span>
                  </div>
                ` : `<div class="text-[11px] text-slate-500">ETA: ${currentJob.eta || "-"}</div>`}
                ${(currentJob.hasRestStop || liveEst?.needsRest) ? `
                  <div class="mt-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 font-semibold">
                    ⚠️ เส้นทางมีพักรถตามกฎ 4 ชม. (${currentJob.restDurationMinutes || 30} นาที)
                  </div>
                ` : ''}
              </div>
            ` : '<div class="text-xs text-slate-400 italic mt-1">ไม่มีงานขนส่งในรอบนี้</div>'}
            <button onclick="App.openVehicleDetailModal('${v.id}')" class="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition">
              ดูเส้นทางและรายละเอียดเฉพาะคัน &rarr;
            </button>
          </div>
        </div>
      `);

      this.markers[v.id] = marker;
    });
  }

  /**
   * Render ONLY a single vehicle, its job pickup/dropoff markers, and live route trajectory
   */
  renderSingleVehicleFocus(vehicle, job, pLoc, dLoc) {
    if (!this.map || !vehicle) return;

    // Clear all previous markers & polylines cleanly
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    Object.values(this.locationMarkers).forEach(m => this.map.removeLayer(m));
    this.markers = {};
    this.locationMarkers = {};
    this.routeLines.forEach(line => this.map.removeLayer(line));
    this.routeLines = [];
    this._singleDoneLine = null;
    this._singleRemLine = null;
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }

    const boundsPoints = [[vehicle.lat, vehicle.lng]];

    // Render target vehicle marker
    const vMarker = L.marker([vehicle.lat, vehicle.lng], {
      icon: this.createVehicleIcon(vehicle.status, vehicle.speed, vehicle.plate)
    }).addTo(this.map);
    vMarker.bindPopup(`<div class="text-xs font-bold text-slate-800">${vehicle.plate} (${vehicle.brand} ${vehicle.model})</div><div class="text-[11px] text-blue-600">ความเร็ว: ${vehicle.speed} กม./ชม.</div>`);
    this.markers[vehicle.id] = vMarker;

    if (job && pLoc && dLoc) {
      const pMarker = L.marker([pLoc.lat, pLoc.lng], {
        icon: this.createLocationIcon("pickup")
      }).addTo(this.map);
      pMarker.bindPopup(`<div class="text-xs font-bold text-emerald-700">จุดรับสินค้า</div><div class="text-[11px]">${pLoc.name}</div>`);
      this.locationMarkers[pLoc.id] = pMarker;

      const dMarker = L.marker([dLoc.lat, dLoc.lng], {
        icon: this.createLocationIcon(job.isCrossBorder ? "cross_border" : "dropoff")
      }).addTo(this.map);
      dMarker.bindPopup(`<div class="text-xs font-bold text-rose-700">${job.isCrossBorder ? "ด่านข้ามแดน / ปลายทาง" : "จุดส่งสินค้า"}</div><div class="text-[11px]">${dLoc.name}</div>`);
      this.locationMarkers[dLoc.id] = dMarker;

      boundsPoints.push([pLoc.lat, pLoc.lng], [dLoc.lat, dLoc.lng]);

      const isEnRoute = job.currentStatusId >= 5 && !(window.store && window.store.isJobCompleted(job));
      const remColor = job.isCrossBorder ? "#7c3aed" : "#2563eb";

      if (isEnRoute) {
        // Solid emerald line: Pickup -> Current vehicle position
        const doneLine = L.polyline([[pLoc.lat, pLoc.lng], [vehicle.lat, vehicle.lng]], {
          color: "#10b981",
          weight: 5,
          opacity: 0.9
        }).addTo(this.map);

        // Dashed route line: Current vehicle position -> Dropoff
        const remLine = L.polyline([[vehicle.lat, vehicle.lng], [dLoc.lat, dLoc.lng]], {
          color: remColor,
          weight: 4,
          opacity: 0.9,
          dashArray: "8, 6"
        }).addTo(this.map);

        this._singleDoneLine = doneLine;
        this._singleRemLine = remLine;
        this.routeLines.push(doneLine, remLine);
      } else {
        // Planned route line: Pickup -> Dropoff
        const planLine = L.polyline([[pLoc.lat, pLoc.lng], [dLoc.lat, dLoc.lng]], {
          color: remColor,
          weight: 4,
          opacity: 0.85,
          dashArray: "6, 6"
        }).addTo(this.map);
        this.routeLines.push(planLine);
      }

      this.map.fitBounds(boundsPoints, { padding: [50, 50], maxZoom: 12 });
    } else {
      this.map.setView([vehicle.lat, vehicle.lng], 12);
    }
  }

  /**
   * Smoothly update marker & route trajectory on live GPS ticks without resetting user zoom
   */
  updateSingleVehicleFocusPosition(vehicle, job, pLoc, dLoc) {
    if (!this.map || !vehicle) return;
    const vMarker = this.markers[vehicle.id];
    if (vMarker) {
      vMarker.setLatLng([vehicle.lat, vehicle.lng]);
      vMarker.setPopupContent(`<div class="text-xs font-bold text-slate-800">${vehicle.plate} (${vehicle.brand} ${vehicle.model})</div><div class="text-[11px] text-blue-600">ความเร็ว: ${vehicle.speed} กม./ชม.</div>`);
    }
    if (job && pLoc && dLoc) {
      if (this._singleDoneLine) {
        this._singleDoneLine.setLatLngs([[pLoc.lat, pLoc.lng], [vehicle.lat, vehicle.lng]]);
      }
      if (this._singleRemLine) {
        this._singleRemLine.setLatLngs([[vehicle.lat, vehicle.lng], [dLoc.lat, dLoc.lng]]);
      }
    }
  }

  focusVehicle(vehicleId) {
    const v = window.store.getVehicle(vehicleId);
    if (!v || !this.map) return;

    this.map.setView([v.lat, v.lng], 13, { animate: true });
    if (this.markers[v.id]) {
      this.markers[v.id].openPopup();
    }
  }

  drawRoute(startLat, startLng, endLat, endLng, color = "#4f46e5") {
    if (!this.map) return;

    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    // Midpoint curve simulation
    const midLat = (startLat + endLat) / 2 + 0.05;
    const midLng = (startLng + endLng) / 2 - 0.05;

    const latlngs = [
      [startLat, startLng],
      [midLat, midLng],
      [endLat, endLng]
    ];

    this.routePolyline = L.polyline(latlngs, {
      color: color,
      weight: 5,
      opacity: 0.8,
      dashArray: "8, 6"
    }).addTo(this.map);

    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [40, 40] });
  }

  startLiveSimulation() {
    if (this.simulationTimer) clearInterval(this.simulationTimer);

    // Simulate gentle vehicle movement for running trucks every 4 seconds
    this.simulationTimer = setInterval(() => {
      const vehicles = window.store.getVehicles();
      let changed = false;

      vehicles.forEach(v => {
        if (v.status === "running") {
          // slight drift along trajectory
          v.lat += (Math.random() - 0.48) * 0.003;
          v.lng += (Math.random() - 0.48) * 0.003;
          v.speed = Math.min(85, Math.max(55, v.speed + Math.floor(Math.random() * 5) - 2));
          v.lastUpdate = "เมื่อสักครู่";
          changed = true;

          if (this.markers[v.id]) {
            this.markers[v.id].setLatLng([v.lat, v.lng]);
          }
        }
      });

      if (changed) {
        window.store.saveState();
      }
    }, 4000);
  }

  stopLiveSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }
}

if (typeof window !== "undefined") {
  window.MapManager = MapManager;
}
