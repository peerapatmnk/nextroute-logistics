/**
 * NextRoute Logistics - Main Application Controller
 */

const App = {
  activeTab: "dashboard",
  selectedJobId: "JN-001",
  selectedDetailVehicleId: null,
  editingDriverId: null,
  editingVehicleId: null,
  _lastDetailStepKey: null,
  mapManagers: {},

  VEHICLE_STATUS_MAP: {
    running: { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", label: "กำลังวิ่งส่งสินค้า", dot: "bg-emerald-500" },
    resting: { cls: "bg-amber-100 text-amber-800 border border-amber-200", label: "จอดพัก / ด่านตรวจ", dot: "bg-amber-500" },
    idle: { cls: "bg-blue-100 text-blue-700 border border-blue-200", label: "พร้อมรับงาน", dot: "bg-blue-500" },
    ready: { cls: "bg-blue-100 text-blue-700 border border-blue-200", label: "พร้อมรับงาน", dot: "bg-blue-500" },
    assigned: { cls: "bg-purple-100 text-purple-700 border border-purple-200", label: "รอออกเดินทาง", dot: "bg-purple-500" },
    maintenance: { cls: "bg-rose-100 text-rose-700 border border-rose-200", label: "ตรวจเช็คสภาพ", dot: "bg-rose-500" },
    offline: { cls: "bg-slate-100 text-slate-600 border border-slate-200", label: "ออฟไลน์", dot: "bg-slate-400" }
  },

  DRIVER_STATUS_MAP: {
    on_duty: { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", label: "ปฏิบัติงาน" },
    ready: { cls: "bg-blue-100 text-blue-700 border border-blue-200", label: "พร้อมใช้งาน" },
    leave: { cls: "bg-amber-100 text-amber-800 border border-amber-200", label: "ลางาน" },
    offline: { cls: "bg-slate-100 text-slate-600 border border-slate-200", label: "พักกะ/ออฟไลน์" }
  },

  init() {
    this.updateUserHeader();
    this.bindEvents();
    this.renderActiveTab();
    this.initMaps();
    this.startLiveClock();

    // Subscribe to store updates
    window.store.subscribe(() => {
      this.updateKPICards();
      this.refreshCurrentView();
      if (window.SafetyAlerts && typeof window.SafetyAlerts.evaluate === "function") {
        window.SafetyAlerts.evaluate();
      }
    });

    this.updateKPICards();

    // Initialize Fleet Safety & Smart Alerts Service
    if (window.SafetyAlerts && typeof window.SafetyAlerts.init === "function") {
      window.SafetyAlerts.init();
    }
  },

  updateUserHeader() {
    if (window.Auth) {
      const u = window.Auth.getCurrentUser();
      if (u) {
        const elName = document.getElementById("header-user-name");
        const elRole = document.getElementById("header-user-role");
        const elAvatar = document.getElementById("header-user-avatar");
        if (elName) elName.textContent = u.name;
        if (elRole) elRole.textContent = u.title || "ศูนย์ควบคุม NextRoute";
        if (elAvatar) elAvatar.textContent = u.avatar || "AD";
      }
    }
  },

  copyCustomerTrackingLink(jobId) {
    const job = window.store.getJob(jobId || this.selectedJobId);
    if (!job) return;
    const origin = window.location.origin || "http://localhost:8080";
    const trackingUrl = `${origin}/track.html?job=${encodeURIComponent(job.code)}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(trackingUrl).then(() => {
        this.showToast(`คัดลอกลิงก์สำหรับลูกค้าเรียบร้อยแล้ว: ${job.code}`, "success");
      }).catch(() => {
        prompt(`คัดลอกลิงก์ด้านล่างเพื่อส่งให้ลูกค้าติดตามงาน ${job.code}:`, trackingUrl);
      });
    } else {
      prompt(`คัดลอกลิงก์ด้านล่างเพื่อส่งให้ลูกค้าติดตามงาน ${job.code}:`, trackingUrl);
    }
  },

  startLiveClock() {
    const update = () => {
      const el = document.getElementById("header-live-time");
      if (!el) return;
      const now = new Date();
      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const d = now.getDate();
      const m = thaiMonths[now.getMonth()];
      const y = now.getFullYear() + 543;
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      el.textContent = `${d} ${m} ${y} | ${hh}:${mm}:${ss} น.`;
    };
    update();
    setInterval(update, 1000);
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll("[data-nav-tab]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-nav-tab");
        this.switchTab(tab);
      });
    });

    // Reset Data button
    const btnReset = document.getElementById("btn-reset-data");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามสไลด์พรีเซนต์หรือไม่?")) {
          window.store.resetToDefault();
          this.showToast("รีเซ็ตข้อมูลเป็นค่าเริ่มต้นเรียบร้อยแล้ว", "success");
          location.reload();
        }
      });
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Sidebar Navigation UI
    document.querySelectorAll("[data-nav-tab]").forEach(btn => {
      const isTarget = btn.getAttribute("data-nav-tab") === tabId;
      if (isTarget) {
        btn.classList.add("bg-blue-600", "text-white", "shadow-sm");
        btn.classList.remove("text-slate-300", "hover:bg-slate-800", "hover:text-white");
      } else {
        btn.classList.remove("bg-blue-600", "text-white", "shadow-sm");
        btn.classList.add("text-slate-300", "hover:bg-slate-800", "hover:text-white");
      }
    });

    // Hide all tab sections, show active
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.add("hidden");
    });
    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) {
      activePane.classList.remove("hidden");
    }

    this.renderActiveTab();

    // Resize map when switching to map tabs
    setTimeout(() => {
      if (tabId === "dashboard" && this.mapManagers.dashboard) {
        this.mapManagers.dashboard.map.invalidateSize();
      }
      if (tabId === "gps-tracking" && this.mapManagers.gps) {
        this.mapManagers.gps.map.invalidateSize();
      }
    }, 150);
  },

  initMaps() {
    // Dashboard Map
    if (document.getElementById("dashboard-map")) {
      this.mapManagers.dashboard = new window.MapManager("dashboard-map", {
        center: [13.25, 101.10],
        zoom: 9
      });
      this.mapManagers.dashboard.startLiveSimulation();
    }

    // GPS Fullscreen Map
    if (document.getElementById("gps-fullscreen-map")) {
      this.mapManagers.gps = new window.MapManager("gps-fullscreen-map", {
        center: [13.40, 101.30],
        zoom: 8
      });
    }
  },

  renderActiveTab() {
    switch (this.activeTab) {
      case "dashboard":
        this.renderDashboard();
        break;
      case "status-tracking":
        this.renderStatusTracking();
        break;
      case "gps-tracking":
        this.renderGpsTracking();
        break;
      case "routes-tasks":
        this.renderRoutesAndTasks();
        break;
      case "fleet-management":
        this.renderFleetManagement();
        break;
      case "history-reports":
        this.renderHistoryReports();
        break;
      case "driver-view":
        this.renderDriverMobileView();
        break;
    }
  },

  refreshCurrentView() {
    this.renderActiveTab();
    if (this.mapManagers.dashboard) {
      this.mapManagers.dashboard.renderVehicles();
    }
    if (this.mapManagers.gps) {
      this.mapManagers.gps.renderVehicles();
    }
    const vdModal = document.getElementById("modal-vehicle-detail");
    if (vdModal && !vdModal.classList.contains("hidden") && this.selectedDetailVehicleId) {
      this.renderVehicleDetailModalData(this.selectedDetailVehicleId, true);
    }
  },

  updateKPICards() {
    const kpis = window.store.getKPIs();
    document.querySelectorAll("[data-kpi='total-vehicles']").forEach(el => el.textContent = kpis.totalVehicles);
    document.querySelectorAll("[data-kpi='running-vehicles']").forEach(el => el.textContent = kpis.runningVehicles);
    document.querySelectorAll("[data-kpi='resting-vehicles']").forEach(el => el.textContent = kpis.restingVehicles);
    document.querySelectorAll("[data-kpi='idle-vehicles']").forEach(el => el.textContent = kpis.idleVehicles);
    document.querySelectorAll("[data-kpi='offline-vehicles']").forEach(el => el.textContent = kpis.offlineVehicles);
    document.querySelectorAll("[data-kpi='active-jobs']").forEach(el => el.textContent = kpis.activeJobs);
    document.querySelectorAll("[data-kpi='completed-jobs']").forEach(el => el.textContent = kpis.completedJobs);
    document.querySelectorAll("[data-kpi='total-drivers']").forEach(el => el.textContent = kpis.totalDrivers);

    // Dynamic vehicle brand breakdown
    const brandCounts = {};
    window.store.getVehicles().forEach(v => {
      const b = v.brand || "อื่นๆ";
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    });
    const summaryText = Object.entries(brandCounts).map(([b, c]) => `${b} ${c}`).join(" | ");
    document.querySelectorAll("[data-kpi='brand-summary']").forEach(el => el.textContent = summaryText);
    const fleetDescText = `ข้อมูลรถบรรทุก ${Object.entries(brandCounts).map(([b, c]) => `${b} (${c} คัน)`).join(", ")} พร้อมทำเนียบพนักงานขับรถ`;
    document.querySelectorAll("[data-kpi='fleet-brand-desc']").forEach(el => el.textContent = fleetDescText);
  },

  /* =====================================================================
     1. Dashboard Render
  ===================================================================== */
  renderDashboard() {
    const jobs = window.store.getJobs();

    // Render Recent Jobs Cards Widget
    const recentCards = document.getElementById("dashboard-recent-jobs-cards");
    if (recentCards) {
      recentCards.innerHTML = jobs.slice(0, 3).map(job => {
        const v = window.store.getVehicle(job.vehicleId) || { plate: "-" };
        const d = window.store.getDriver(job.driverId) || { name: "-" };
        const pLoc = window.store.getLocation(job.pickupLocId) || { province: "-" };
        const dLoc = window.store.getLocation(job.dropoffLocId) || { province: "-" };
        const status = window.store.getStatusMeta(job.currentStatusId, job) || { name: job.currentStatusKey, key: "pending" };
        const isCB = job.isCrossBorder;
        return `
          <div class="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition cursor-pointer" onclick="App.openJobInTracker('${job.id}')">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-blue-700 font-mono">${job.id} (${job.code})</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isCB ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}">${status.name}</span>
            </div>
            <div class="text-xs font-semibold text-slate-800 mt-1">${pLoc.province} &rarr; ${dLoc.province} (${job.productType})</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${v.plate} | คนขับ: ${d.name}</div>
          </div>
        `;
      }).join("");
    }

    const tableBody = document.getElementById("dashboard-jobs-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = jobs.slice(0, 6).map(job => {
      const cust = window.store.getCustomer(job.customerId) || { name: "-" };
      const v = window.store.getVehicle(job.vehicleId) || { plate: "-" };
      const d = window.store.getDriver(job.driverId) || { name: "-" };
      const pLoc = window.store.getLocation(job.pickupLocId) || { name: "-" };
      const dLoc = window.store.getLocation(job.dropoffLocId) || { name: "-" };
      const status = window.store.getStatusMeta(job.currentStatusId, job) || { name: job.currentStatusKey, key: "pending" };
      const isCB = job.isCrossBorder;

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="py-3 px-4 font-bold text-blue-700 font-mono">
            ${job.id}
            ${isCB ? '<span class="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-700 font-bold border border-purple-200">ข้ามแดน</span>' : ''}
          </td>
          <td class="py-3 px-4 font-medium text-slate-800">${cust.name}</td>
          <td class="py-3 px-4 text-slate-600">
            <div class="flex items-center gap-1 font-medium">
              <span>${pLoc.province}</span>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              <span>${dLoc.province}</span>
            </div>
            <div class="text-[10px] text-slate-400">${job.productType}</div>
          </td>
          <td class="py-3 px-4 font-mono font-bold text-slate-700">${v.plate}</td>
          <td class="py-3 px-4 text-slate-600">${d.name}</td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-[11px] font-bold rounded-full badge-status-${status.key}">
              ${status.name}
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="App.openJobInTracker('${job.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 text-xs font-semibold transition">
              ดูสถานะ
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  /* =====================================================================
     2. Status Tracking Render
  ===================================================================== */
  renderStatusTracking() {
    const jobs = window.store.getJobs();
    const select = document.getElementById("select-track-job");
    if (select) {
      select.innerHTML = jobs.map(j => {
        const isCB = j.isCrossBorder;
        const statusMeta = window.store.getStatusMeta(j.currentStatusId, j);
        return `
          <option value="${j.id}" ${j.id === this.selectedJobId ? "selected" : ""}>
            ${j.id} (${j.code}) - ${j.productType} ${isCB ? "[🌐 ข้ามแดน]" : "[🇹🇭 ในประเทศ]"} [${statusMeta?.name || ""}]
          </option>
        `;
      }).join("");

      select.onchange = (e) => {
        this.selectedJobId = e.target.value;
        this.renderStatusTracking();
      };
    }

    const job = window.store.getJob(this.selectedJobId) || jobs[0];
    if (!job) return;
    this.selectedJobId = job.id;

    const cust = window.store.getCustomer(job.customerId) || { name: "-" };
    const v = window.store.getVehicle(job.vehicleId) || { plate: "-", model: "-", brand: "-" };
    const d = window.store.getDriver(job.driverId) || { name: "-", phone: "-" };
    const pLoc = window.store.getLocation(job.pickupLocId) || { name: "-", province: "-" };
    const dLoc = window.store.getLocation(job.dropoffLocId) || { name: "-", province: "-" };

    // Dynamic Header & Badge (Domestic vs. Cross-Border)
    const elMainTitle = document.getElementById("tracker-main-title");
    if (elMainTitle) {
      elMainTitle.textContent = job.isCrossBorder
        ? "ระบบติดตามสถานะงานขนส่งสินค้าข้ามแดน (8 ขั้นตอน)"
        : "ระบบติดตามสถานะงานขนส่ง 7 ขั้นตอน";
    }

    const elTransportBadge = document.getElementById("tracker-transport-badge");
    if (elTransportBadge) {
      if (job.isCrossBorder) {
        elTransportBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200";
        elTransportBadge.innerHTML = "🌐 ขนส่งข้ามแดน (8 ขั้นตอน)";
      } else {
        elTransportBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700";
        elTransportBadge.innerHTML = "🇹🇭 ขนส่งภายในประเทศ (7 ขั้นตอน)";
      }
    }

    const elStepperTitle = document.getElementById("stepper-title");
    if (elStepperTitle) {
      elStepperTitle.textContent = job.isCrossBorder
        ? "ลำดับขั้นตอนสถานะงาน (Status Flow 8 ขั้นตอน - รวมด่านข้ามแดน)"
        : "ลำดับขั้นตอนสถานะงาน (Status Flow 7 ขั้นตอน)";
    }

    // Fill Job Info Cards
    const elJobCode = document.getElementById("track-job-code");
    if (elJobCode) elJobCode.textContent = job.code;
    const elJobPlate = document.getElementById("track-job-plate");
    if (elJobPlate) elJobPlate.textContent = v.plate;
    const elJobDriver = document.getElementById("track-job-driver");
    if (elJobDriver) elJobDriver.textContent = `${d.name} (${d.phone})`;
    const elJobProduct = document.getElementById("track-job-product");
    if (elJobProduct) elJobProduct.textContent = `${job.productType} (${job.productQty})`;
    const elJobRoute = document.getElementById("track-job-route");
    if (elJobRoute) elJobRoute.textContent = `${pLoc.name} -> ${dLoc.name}`;
    const elJobEta = document.getElementById("track-job-eta");
    if (elJobEta) elJobEta.textContent = job.eta || "-";

    // Trip & Safety Rest Plan Compact Summary (via ETAEngine)
    const tripPlan = window.ETAEngine ? window.ETAEngine.getJobTripPlan(job) : null;
    const elDist = document.getElementById("track-job-distance");
    if (elDist) {
      const delivDist = job.routeDistanceKm || tripPlan?.deliveryDistanceKm || 0;
      const totalDist = job.totalDistanceKm || tripPlan?.totalDistanceKm || delivDist;
      elDist.textContent = `${delivDist} กม. / รวม ${totalDist} กม.`;
    }
    const elRest = document.getElementById("track-job-rest");
    if (elRest) {
      const restMins = job.restDurationMinutes ?? tripPlan?.totalRestMinutes ?? 0;
      const restCount = job.restCount ?? tripPlan?.restStopsCount ?? (job.hasRestStop ? 1 : 0);
      if (restCount > 0 || restMins > 0) {
        elRest.className = "text-amber-700 font-bold";
        elRest.textContent = `พัก ${restCount || 1} ครั้ง (${restMins || 30} นาที)`;
      } else {
        elRest.className = "text-emerald-700 font-semibold";
        elRest.textContent = "ไม่ต้องพักระหว่างทาง (< 4 ชม.)";
      }
    }
    const elReturnEta = document.getElementById("track-job-return-eta");
    if (elReturnEta) {
      elReturnEta.textContent = job.etaReturn || tripPlan?.etaReturnIso || "-";
    }

    // Cross-Border Compact Info in Job Details Card
    const cbRow = document.getElementById("track-cb-row");
    if (cbRow) {
      if (job.isCrossBorder) {
        cbRow.classList.remove("hidden");
        const elPermit = document.getElementById("track-job-permit");
        if (elPermit) elPermit.textContent = job.customsPermitNo || "CB-THKH-2026/0491";
        const elDec = document.getElementById("track-job-declaration");
        if (elDec) elDec.textContent = job.customsDeclarationNo || "กศก.120-690214";
      } else {
        cbRow.classList.add("hidden");
      }
    }

    // Render Dynamic Stepper Flow (7 or 8 Steps)
    const flow = window.store.getStatusFlow(job);
    const stepperContainer = document.getElementById("fsm-stepper-container");
    if (stepperContainer) {
      const activeIdx = job.currentStatusId;
      const progressPercent = Math.min(100, Math.max(0, ((activeIdx - 1) / (flow.length - 1)) * 100));

      const lineActive = stepperContainer.querySelector(".stepper-line-active");
      if (lineActive) {
        lineActive.style.width = `calc(${progressPercent}% * 0.92)`;
      }

      const nodesContainer = document.getElementById("stepper-nodes-wrapper");
      if (nodesContainer) {
        nodesContainer.innerHTML = flow.map(step => {
          const isCompleted = step.id < activeIdx;
          const isActive = step.id === activeIdx;
          const stateClass = isCompleted ? "completed" : isActive ? "active" : "";

          return `
            <div class="stepper-node ${stateClass} cursor-default select-none" title="${step.name}: ${step.desc}">
              <div class="stepper-circle">
                ${isCompleted ? `
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                ` : step.id}
              </div>
              <div class="mt-2 text-center">
                <div class="text-xs font-bold ${isActive ? (step.key === 'border_customs' ? 'text-purple-600' : 'text-blue-600') : isCompleted ? 'text-emerald-700' : 'text-slate-500'}">
                  ${step.name}
                </div>
                <div class="text-[10px] text-slate-400 hidden sm:block max-w-[85px] leading-tight mt-0.5">${step.desc}</div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Update Responsible Driver & Next Action Info
    const elResponsible = document.getElementById("tracker-driver-responsible");
    if (elResponsible) {
      elResponsible.textContent = `${d.name} (${v.plate})`;
    }

    const elWaitingAction = document.getElementById("tracker-waiting-action");
    if (elWaitingAction) {
      if (job.currentStatusId < flow.length) {
        const nextStatus = window.store.getStatusMeta(job.currentStatusId + 1, job);
        if (job.isCrossBorder && job.currentStatusId === 6) {
          elWaitingAction.innerHTML = `<span class="text-purple-700 font-bold">📍 ด่านศุลกากร:</span> คนขับกำลังยื่นใบขออนุญาตและตรวจสภาพซีลถัง รอการอนุมัติปล่อยผ่านด่านตรวจเพื่อเดินทางสู่ปลายทาง`;
        } else {
          elWaitingAction.innerHTML = `รอคนขับกดอัปเดตขั้นตอน <strong>"${nextStatus.name}"</strong> ผ่านหน้าจอ Driver Mobile App หรือรอระบบตรวจจับพิกัด GPS อัตโนมัติ`;
        }
      } else {
        elWaitingAction.innerHTML = `<span class="text-emerald-600 font-bold">✓ งานขนส่งรอบนี้เสร็จสิ้นสมบูรณ์แล้ว ไม่มีการดำเนินการคงค้าง</span>`;
      }
    }

    // Render Timeline Activity History with Proof Photos
    const timelineContainer = document.getElementById("job-timeline-list");
    if (timelineContainer && job.timeline) {
      const catBadges = {
        fuel: { label: "⛽ เติมน้ำมัน", bg: "bg-blue-100 text-blue-800" },
        customs: { label: "🛂 ด่านศุลกากร", bg: "bg-purple-100 text-purple-800" },
        seal: { label: "🔒 ซีลนิรภัย", bg: "bg-amber-100 text-amber-800" },
        inspection: { label: "🔍 ตรวจสภาพรถ", bg: "bg-emerald-100 text-emerald-800" },
        delivery: { label: "📝 ส่งมอบ/POD", bg: "bg-indigo-100 text-indigo-800" },
        other: { label: "📷 รูปหลักฐาน", bg: "bg-slate-100 text-slate-800" }
      };

      timelineContainer.innerHTML = job.timeline.map((entry, idx) => {
        const statusMeta = window.store.getStatusMeta(entry.statusId, job) || { name: entry.name, key: "pending" };
        const isLatest = idx === job.timeline.length - 1;
        const photos = entry.photos || [];

        return `
          <div class="relative pl-6 pb-5 ${idx === job.timeline.length - 1 ? "" : "border-l-2 border-slate-200"} ml-3">
            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${entry.isReverted ? 'bg-amber-500 ring-4 ring-amber-100' : isLatest ? (statusMeta.key === 'border_customs' ? 'bg-purple-600 ring-4 ring-purple-100' : 'bg-blue-600 ring-4 ring-blue-100') : 'bg-emerald-500'}"></div>
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-800 text-sm">${entry.name}</span>
              <span class="font-mono text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded">${entry.time} น.</span>
            </div>
            <div class="text-xs text-slate-600 mt-1">${entry.note}</div>
            <div class="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <div><span>ผู้บันทึก:</span> <span class="font-medium text-slate-500">${entry.by}</span></div>
              <button type="button" onclick="App.openUploadPhotoModal('admin', ${entry.statusId})" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                <span>+ แนบรูปเพิ่ม</span>
              </button>
            </div>

            ${photos.length > 0 ? `
              <div class="mt-2.5 pt-2 border-t border-slate-100">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span>ภาพถ่ายหลักฐาน (${photos.length} รูป):</span>
                  </span>
                  <span class="text-[10px] text-slate-400">คลิกที่รูปเพื่อเปิดดูขนาดใหญ่</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  ${photos.map((p, pIdx) => {
                    const catInfo = catBadges[p.category] || catBadges.other;
                    return `
                      <div onclick="App.openPhotoViewer('${job.id}', ${entry.statusId}, ${pIdx})" class="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-sm hover:shadow-md hover:border-blue-400 transition transform hover:-translate-y-0.5">
                        <img src="${p.url}" alt="${p.title || 'รูปหลักฐาน'}" class="w-full h-24 object-cover group-hover:scale-105 transition duration-300">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-between p-1.5 pointer-events-none">
                          <span class="self-start px-1.5 py-0.5 rounded text-[9px] font-bold ${catInfo.bg} shadow-sm backdrop-blur">
                            ${catInfo.label}
                          </span>
                          <div class="text-[10px] text-white truncate font-medium">
                            ${p.title || p.caption || "ดูรูปภาพ"}
                          </div>
                        </div>
                        <div class="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span class="w-7 h-7 rounded-full bg-white/95 text-blue-700 flex items-center justify-center shadow text-xs font-bold">🔍</span>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).reverse().join("");
    }
  },

  /* =====================================================================
     Photo Evidence Viewer & Upload Handlers
  ===================================================================== */
  openPhotoViewer(jobId, statusId, photoIndex = 0) {
    const job = window.store.getJob(jobId || this.selectedJobId);
    if (!job) return;
    const timelineEntry = (job.timeline || []).find(t => t.statusId === statusId);
    if (!timelineEntry || !timelineEntry.photos || !timelineEntry.photos[photoIndex]) return;

    const photo = timelineEntry.photos[photoIndex];
    const v = window.store.getVehicle(job.vehicleId) || { plate: "-" };
    const d = window.store.getDriver(job.driverId) || { name: "-" };

    const modal = document.getElementById("modal-photo-viewer");
    if (!modal) return;

    const catBadges = {
      fuel: { label: "⛽ เติมน้ำมัน", bg: "bg-blue-100 text-blue-800" },
      customs: { label: "🛂 ด่านศุลกากร", bg: "bg-purple-100 text-purple-800" },
      seal: { label: "🔒 ซีลนิรภัย", bg: "bg-amber-100 text-amber-800" },
      inspection: { label: "🔍 ตรวจสภาพรถ", bg: "bg-emerald-100 text-emerald-800" },
      delivery: { label: "📝 ส่งมอบ/POD", bg: "bg-indigo-100 text-indigo-800" },
      other: { label: "📷 รูปหลักฐาน", bg: "bg-slate-100 text-slate-800" }
    };
    const cat = catBadges[photo.category] || catBadges.other;

    const elImg = document.getElementById("pv-img");
    if (elImg) elImg.src = photo.url;

    const elCoords = document.getElementById("pv-coords-text");
    if (elCoords) elCoords.textContent = photo.coords || "13.7563° N, 100.5018° E";

    const elTime = document.getElementById("pv-timestamp");
    if (elTime) elTime.textContent = `${photo.timestamp || timelineEntry.time} น.`;

    const elBadge = document.getElementById("pv-category-badge");
    if (elBadge) {
      elBadge.className = `px-2.5 py-1 rounded-full text-xs font-bold ${cat.bg}`;
      elBadge.textContent = cat.label;
    }

    const elStep = document.getElementById("pv-step-name");
    if (elStep) elStep.textContent = `ขั้นตอนที่ ${statusId}: ${timelineEntry.name}`;

    const elTitle = document.getElementById("pv-title");
    if (elTitle) elTitle.textContent = photo.title || timelineEntry.name;

    const elJob = document.getElementById("pv-job-code");
    if (elJob) elJob.textContent = `${job.id} (${job.code})`;

    const elPlate = document.getElementById("pv-truck-plate");
    if (elPlate) elPlate.textContent = v.plate;

    const elDriver = document.getElementById("pv-driver-name");
    if (elDriver) elDriver.textContent = d.name;

    const elAuthor = document.getElementById("pv-author");
    if (elAuthor) elAuthor.textContent = photo.author || timelineEntry.by || "คนขับรถ (Driver Mobile App)";

    const elCaption = document.getElementById("pv-caption");
    if (elCaption) elCaption.textContent = photo.caption || timelineEntry.note || "ไม่มีบันทึกเพิ่มเติม";

    const elDownload = document.getElementById("pv-download-btn");
    if (elDownload) {
      elDownload.href = photo.url;
      elDownload.download = `Evidence_${job.id}_Step${statusId}_${photo.category}.jpg`;
    }

    modal.classList.remove("hidden");
  },

  closePhotoViewer() {
    const modal = document.getElementById("modal-photo-viewer");
    if (modal) modal.classList.add("hidden");
  },

  openUploadPhotoModal(source = "admin", preselectedStatusId = null) {
    const job = window.store.getJob(this.selectedJobId);
    if (!job) return;

    this.uploadSource = source;
    this.pendingUploadPhotoUrl = null;
    this.pendingUploadPhotoName = null;

    const modal = document.getElementById("modal-upload-photo");
    if (!modal) return;

    const flow = window.store.getStatusFlow(job);
    const selStep = document.getElementById("upload-photo-step");
    if (selStep) {
      const targetId = preselectedStatusId || job.currentStatusId;
      selStep.innerHTML = flow.map(s => `
        <option value="${s.id}" ${s.id === targetId ? "selected" : ""}>
          ${s.id}. ${s.name} ${s.id === job.currentStatusId ? "(ขั้นตอนปัจจุบัน)" : ""}
        </option>
      `).join("");
    }

    // Clear file input & preview
    const fileInput = document.getElementById("upload-photo-file");
    if (fileInput) fileInput.value = "";
    this.clearUploadPhotoPreview();

    // Default category & caption based on preselected step
    const targetStatusId = preselectedStatusId || job.currentStatusId;
    const targetMeta = window.store.getStatusMeta(targetStatusId, job);
    if (targetMeta?.key === "border_customs") {
      this.setUploadCategory("customs");
      this.selectMockPhotoPreset("customs");
    } else if (targetStatusId === 1 || targetStatusId === 3) {
      this.setUploadCategory("inspection");
      this.selectMockPhotoPreset("inspection");
    } else if (targetStatusId === 4) {
      this.setUploadCategory("fuel");
      this.selectMockPhotoPreset("fuel");
    } else if (targetStatusId >= 6) {
      this.setUploadCategory("delivery");
      this.selectMockPhotoPreset("pod");
    } else {
      this.setUploadCategory("fuel");
      this.selectMockPhotoPreset("fuel");
    }

    modal.classList.remove("hidden");
  },

  closeUploadPhotoModal() {
    const modal = document.getElementById("modal-upload-photo");
    if (modal) modal.classList.add("hidden");
    this.clearUploadPhotoPreview();
  },

  setUploadCategory(catKey) {
    const hiddenInput = document.getElementById("upload-photo-category");
    if (hiddenInput) hiddenInput.value = catKey;

    const buttons = document.querySelectorAll("#upload-category-buttons .cat-btn");
    buttons.forEach(btn => {
      if (btn.getAttribute("data-cat") === catKey) {
        btn.className = "cat-btn py-2 px-2 rounded-xl border text-xs font-bold text-center border-blue-500 bg-blue-50 text-blue-700 shadow-sm";
      } else {
        btn.className = "cat-btn py-2 px-2 rounded-xl border text-xs font-bold text-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
      }
    });
  },

  handlePhotoFileSelected(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.pendingUploadPhotoUrl = e.target.result;
      this.pendingUploadPhotoName = file.name;
      this.showUploadPreview(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  },

  selectMockPhotoPreset(presetKey) {
    const job = window.store.getJob(this.selectedJobId);
    const v = window.store.getVehicle(job?.vehicleId) || { plate: "ชบ.74-0549" };
    const curTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    let presetCfg = null;
    let captionText = "";
    let catKey = "other";

    if (presetKey === "fuel") {
      catKey = "fuel";
      captionText = "ภาพถ่ายใบเสร็จและมิเตอร์ตู้จ่ายน้ำมัน B7 จำนวน 32,000 ลิตร หัวจ่าย #04";
      presetCfg = {
        category: "fuel",
        title: "มิเตอร์ตู้จ่ายน้ำมันดีเซล B7",
        detail: "DIESEL B7 - 32,000 L / PUMP #04",
        plate: v.plate,
        coords: "13.1205° N, 100.9142° E",
        time: `${curTime} น.`,
        badge: "⛽ REFUEL METER"
      };
    } else if (presetKey === "customs") {
      catKey = "customs";
      captionText = "ภาพถ่ายจุดตรวจปล่อยด่านศุลกากรอรัญประเทศ พร้อมใบขนสินค้า กศก.120";
      presetCfg = {
        category: "customs",
        title: "จุดตรวจปล่อยด่านศุลกากรอรัญประเทศ (ขาออก)",
        detail: "กศก.120 / CB-PERMIT 2026",
        plate: v.plate,
        coords: "13.6624° N, 102.5082° E",
        time: `${curTime} น.`,
        badge: "🛂 CUSTOMS GATE"
      };
    } else if (presetKey === "seal") {
      catKey = "seal";
      captionText = "ภาพถ่ายตรวจสอบซีลนิรภัยล็อกวาล์วถังก๊าซ/ถังน้ำมัน สภาพสมบูรณ์ไม่มีรอยตัด";
      presetCfg = {
        category: "seal",
        title: "ตรวจสภาพซีลล็อกนิรภัยถังบรรทุก (Tamper Seal)",
        detail: `SEAL NO. TH-CUSTOMS-${Math.floor(1000 + Math.random() * 9000)}`,
        plate: v.plate,
        coords: "13.6620° N, 102.5075° E",
        time: `${curTime} น.`,
        badge: "🔒 TAMPER SEAL"
      };
    } else if (presetKey === "inspection") {
      catKey = "inspection";
      captionText = "ภาพถ่ายตรวจสภาพลมยาง ระบบเบรก และความพร้อมอุปกรณ์ความปลอดภัย DG";
      presetCfg = {
        category: "inspection",
        title: "ตรวจสภาพความพร้อมรถและอุปกรณ์ความปลอดภัย",
        detail: "TIRE / BRAKE / DG SAFETY PASS",
        plate: v.plate,
        coords: "13.1200° N, 100.9140° E",
        time: `${curTime} น.`,
        badge: "🔍 SAFETY PASS"
      };
    } else if (presetKey === "pod") {
      catKey = "delivery";
      captionText = "ภาพถ่ายใบส่งมอบสินค้า (POD) พร้อมลายเซ็นและประทับตราผู้รับสินค้าปลายทาง";
      presetCfg = {
        category: "delivery",
        title: "ใบส่งมอบสินค้าสำเร็จ (POD) มีลายเซ็น",
        detail: `POD SIGNED / METER DISCHARGE COMPLETED`,
        plate: v.plate,
        coords: "13.3611° N, 100.9847° E",
        time: `${curTime} น.`,
        badge: "📝 PROOF OF DELIVERY"
      };
    }

    if (presetCfg && window.buildEvidenceSvg) {
      const dataUri = window.buildEvidenceSvg(presetCfg);
      this.pendingUploadPhotoUrl = dataUri;
      this.pendingUploadPhotoName = `${presetKey}_evidence.svg`;
      this.showUploadPreview(dataUri, `ภาพจำลอง: ${presetCfg.title}`);
      this.setUploadCategory(catKey);

      const elCaption = document.getElementById("upload-photo-caption");
      if (elCaption) elCaption.value = captionText;
    }
  },

  showUploadPreview(url, name) {
    const box = document.getElementById("upload-preview-container");
    const img = document.getElementById("upload-preview-img");
    const label = document.getElementById("upload-preview-name");
    if (box && img) {
      img.src = url;
      if (label) label.textContent = name || "เลือกรูปภาพแล้ว";
      box.classList.remove("hidden");
    }
  },

  clearUploadPhotoPreview() {
    this.pendingUploadPhotoUrl = null;
    this.pendingUploadPhotoName = null;
    const box = document.getElementById("upload-preview-container");
    if (box) box.classList.add("hidden");
  },

  submitUploadPhoto(event) {
    if (event) event.preventDefault();

    const job = window.store.getJob(this.selectedJobId);
    if (!job) return;

    if (!this.pendingUploadPhotoUrl) {
      this.selectMockPhotoPreset("fuel");
    }

    const selStep = document.getElementById("upload-photo-step");
    const targetStatusId = selStep ? parseInt(selStep.value) : job.currentStatusId;
    const category = document.getElementById("upload-photo-category")?.value || "fuel";
    const caption = document.getElementById("upload-photo-caption")?.value || "บันทึกภาพถ่ายหลักฐาน";

    const catTitleMap = {
      fuel: "ภาพถ่ายใบเสร็จ/มิเตอร์เติมน้ำมัน",
      customs: "ภาพถ่ายด่านศุลกากร/ใบขนสินค้า กศก.120",
      seal: "ภาพถ่ายซีลล็อกนิรภัยถังบรรทุก",
      inspection: "ภาพถ่ายตรวจสภาพความพร้อมรถ",
      delivery: "ภาพถ่ายใบรับสินค้า POD / มิเตอร์จ่าย",
      other: "ภาพถ่ายหลักฐานการปฏิบัติงาน"
    };

    const curTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const author = this.uploadSource === "driver" ? "คนขับรถ (Driver Mobile App)" : "ผู้ดูแลระบบ (Admin)";

    const newPhoto = {
      id: "P-" + Date.now().toString(36),
      category: category,
      title: catTitleMap[category] || "ภาพถ่ายหลักฐาน",
      caption: caption,
      url: this.pendingUploadPhotoUrl,
      timestamp: `${curTime}`,
      coords: job.lastGpsCoords || "13.7563° N, 100.5018° E",
      author: author
    };

    window.store.addJobTimelinePhoto(this.selectedJobId, targetStatusId, newPhoto);
    this.closeUploadPhotoModal();
    this.showToast(`บันทึกและแนบรูปภาพหลักฐาน (${catTitleMap[category]}) สำเร็จ`, "success");

    // Refresh UI
    this.renderStatusTracking();
    this.renderDriverMobileView();
    if (job.vehicleId) {
      const modalVd = document.getElementById("modal-vehicle-detail");
      if (modalVd && !modalVd.classList.contains("hidden")) {
        this.renderVehicleDetailModalData(job.vehicleId);
      }
    }
  },

  /* =====================================================================
     Admin Emergency Override Functions (Option A)
  ===================================================================== */
  openAdminOverrideModal() {
    const job = window.store.getJob(this.selectedJobId);
    if (!job) return;

    const modal = document.getElementById("modal-admin-override");
    if (!modal) return;

    const currentMeta = window.store.getStatusMeta(job.currentStatusId, job);
    const v = window.store.getVehicle(job.vehicleId) || { plate: "-" };
    const d = window.store.getDriver(job.driverId) || { name: "-" };

    const elDisplay = document.getElementById("override-job-display");
    if (elDisplay) {
      elDisplay.textContent = `${job.id} (${job.code}) | รถ: ${v.plate} | คนขับ: ${d.name} | ปัจจุบัน: [${currentMeta.name}]`;
    }

    const selStatus = document.getElementById("override-target-status");
    if (selStatus) {
      const flow = window.store.getStatusFlow(job);
      selStatus.innerHTML = flow.map(s => `
        <option value="${s.id}" ${s.id === job.currentStatusId ? "selected" : ""}>
          ${s.id}. ${s.name} ${s.id === job.currentStatusId ? "(สถานะปัจจุบัน)" : ""}
        </option>
      `).join("");
    }

    modal.classList.remove("hidden");
  },

  closeAdminOverrideModal() {
    const modal = document.getElementById("modal-admin-override");
    if (modal) modal.classList.add("hidden");
  },

  showCustomsPermitModal() {
    const job = window.store.getJob(this.selectedJobId);
    if (!job) return;

    const modal = document.getElementById("modal-customs-permit");
    if (!modal) return;

    const body = document.getElementById("customs-permit-details-body");
    if (body) {
      const checklist = job.documentsChecklist || [
        { name: "ใบอนุญาตขนส่งสินค้าอันตรายข้ามแดน (Cross-Border DG Permit)", status: "approved", docNo: job.customsPermitNo || "CB-THKH-2026/0491" },
        { name: "ใบขนสินค้าขาออก กศก.120 พร้อมชำระภาษี", status: "approved", docNo: job.customsDeclarationNo || "กศก.120-690214" },
        { name: "หนังสือเดินทางคนขับ (Passport) & ใบขับขี่สากล ท.4", status: "verified", docNo: job.driverPassport || "PASSPORT-TH" },
        { name: "ซีลล็อกวาล์วถังก๊าซศุลกากร (Customs Tamper Seal)", status: "inspected", docNo: job.customsSealNo || "SEAL-CUSTOMS-8821" }
      ];

      body.innerHTML = `
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <div class="flex justify-between"><span>รหัสงาน:</span> <strong class="font-mono text-slate-800">${job.id} (${job.code})</strong></div>
          <div class="flex justify-between"><span>ด่านศุลกากรข้ามแดน:</span> <strong class="text-slate-800">${job.customsCheckpoint || "ด่านศุลกากรอรัญประเทศ"}</strong></div>
          <div class="flex justify-between"><span>ประเทศปลายทาง:</span> <strong class="text-purple-700 font-bold">${job.destinationCountry || "กัมพูชา"}</strong></div>
          <div class="flex justify-between"><span>เลขที่ใบอนุญาต:</span> <strong class="font-mono text-blue-700">${job.customsPermitNo || "CB-THKH-2026/0491"}</strong></div>
          <div class="flex justify-between"><span>เลขที่ใบขน กศก.120:</span> <strong class="font-mono text-emerald-700">${job.customsDeclarationNo || "กศก.120-690214"}</strong></div>
        </div>
        <div class="font-bold text-slate-800 mt-2">รายการตรวจสอบเอกสารประจำรถข้ามแดน (Clearance Checklist):</div>
        <div class="space-y-1.5">
          ${checklist.map(item => `
            <div class="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                <span class="font-medium text-slate-800">${item.name}</span>
              </div>
              <span class="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">${item.docNo || "อนุมัติแล้ว"}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    modal.classList.remove("hidden");
  },

  closeCustomsPermitModal() {
    const modal = document.getElementById("modal-customs-permit");
    if (modal) modal.classList.add("hidden");
  },

  openTransportManifestModal(jobId) {
    const job = window.store.getJob(jobId || this.selectedJobId);
    if (!job) return;

    const cust = window.store.getCustomer(job.customerId) || { name: "ลูกค้าผู้รับสินค้า", address: "-" };
    const v = window.store.getVehicle(job.vehicleId) || { plate: "ชบ.74-0549", model: "P360", dltUnitId: "2020001000NEXTROUTE00740549" };
    const d = window.store.getDriver(job.driverId) || { name: "นายสุเทพ โพธิ์ศรี", licenseNo: "ท.4-64000892", phone: "089-123-0007" };
    const pLoc = window.store.getLocation(job.pickupLocId) || { name: "คลังน้ำมันและปิโตรเคมีมาบตาพุด", province: "ระยอง" };
    const dLoc = window.store.getLocation(job.dropoffLocId) || { name: "โรงกลั่นน้ำมันศรีราชา (ไทยออยล์)", province: "ชลบุรี" };
    const statusMeta = window.store.getStatusMeta(job.currentStatusId, job) || { name: "กำลังขนส่ง" };
    const flow = window.store.getStatusFlow(job);

    const isDiesel = (job.productType || "").includes("ดีเซล") || (job.productType || "").includes("น้ำมัน");
    const unNumber = isDiesel ? "UN 1202" : "UN 1075";
    const hazmatName = isDiesel ? "DIESEL FUEL / GAS OIL (ของเหลวไวไฟ คลาส 3)" : "PETROLEUM GASES, LIQUEFIED (ก๊าซไวไฟ คลาส 2.1)";
    const hazardClass = isDiesel ? "CLASS 3 (ของเหลวไวไฟ)" : "CLASS 2.1 (ก๊าซไวไฟ)";
    const sealNo = job.customsSealNo || "SEAL-NRL-" + (job.id ? job.id.replace(/\D/g, "") : "8821");

    const container = document.getElementById("manifest-printable-content");
    if (!container) return;

    container.innerHTML = `
      <!-- Header -->
      <div class="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow">
            NR
          </div>
          <div>
            <div class="text-base font-black text-slate-900 tracking-tight">บริษัท เน็คท์รูท โลจิสติกส์ จำกัด (NextRoute Logistics Co., Ltd.)</div>
            <div class="text-xs text-slate-600">99/12 หมู่ 3 ต.ดอนหัวฬ่อ อ.เมืองชลบุรี จ.ชลบุรี 20000 • โทร 038-123-456</div>
            <div class="text-[11px] text-blue-700 font-semibold">ระบบบริหารงานขนส่งและติดตามวัตถุอันตรายมาตรฐานกรมการขนส่งทางบก (DLT GPS Certified)</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[10px] font-bold uppercase text-slate-400">เลขที่เอกสาร / Manifest No.</div>
          <div class="text-sm font-black font-mono text-slate-900">NRL-POD-${job.code || job.id}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">วันที่: ${job.departureDate || new Date().toISOString().split("T")[0]}</div>
        </div>
      </div>

      <!-- Title Banner -->
      <div class="bg-slate-900 text-white p-2.5 rounded-lg text-center">
        <h2 class="text-sm font-black tracking-wide uppercase">ใบกำกับการขนส่งวัตถุอันตรายและใบส่งมอบสินค้า (Dangerous Goods Manifest & Proof of Delivery)</h2>
        <div class="text-[10px] text-slate-300">ออกตามพระราชบัญญัติการขนส่งทางบก พ.ศ. 2522 และประกาศกรมการขนส่งทางบก</div>
      </div>

      <!-- Danger Class Hazard Box -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-amber-50/80 border border-amber-300 rounded-xl text-xs">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-rose-600 text-white rounded-lg flex flex-col items-center justify-center font-bold border-2 border-white shadow-sm shrink-0">
            <span class="text-[10px] leading-none">🔥</span>
            <span class="text-sm font-black leading-none mt-1">3</span>
          </div>
          <div>
            <div class="text-[10px] font-bold text-slate-500 uppercase">การจำแนกประเภท (Hazard Class)</div>
            <div class="font-black text-rose-700">${hazardClass}</div>
            <div class="font-mono font-bold text-slate-800 text-xs">${unNumber}</div>
          </div>
        </div>
        <div>
          <div class="text-[10px] font-bold text-slate-500 uppercase">ชื่อผลิตภัณฑ์ / Proper Shipping Name</div>
          <div class="font-bold text-slate-900">${job.productType}</div>
          <div class="text-[11px] text-slate-600">${hazmatName}</div>
        </div>
        <div>
          <div class="text-[10px] font-bold text-slate-500 uppercase">ปริมาณและหมายเลขซีลนิรภัย</div>
          <div class="font-black text-blue-700 font-mono text-sm">${job.productQty}</div>
          <div class="text-[11px] font-mono text-emerald-800 font-bold">🔒 Security Seal: ${sealNo}</div>
        </div>
      </div>

      <!-- Parties: Shipper vs Consignee -->
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-400">คลังต้นทางที่จ่ายสินค้า (Shipper / Terminal)</div>
          <div class="font-bold text-slate-900">${pLoc.name}</div>
          <div class="text-slate-600">จังหวัด: ${pLoc.province}</div>
          <div class="text-slate-500 text-[11px]">เวลาออกเดินทาง: ${job.departureTime || "09:00"} น.</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-400">ผู้รับสินค้า / จุดหมายปลายทาง (Consignee / Destination)</div>
          <div class="font-bold text-slate-900">${cust.name}</div>
          <div class="text-slate-600">จุดส่งมอบ: ${dLoc.name} (${dLoc.province})</div>
          <div class="text-emerald-700 font-bold text-[11px]">เวลาคาดการณ์ถึง (ETA): ${job.eta || "-"} น.</div>
        </div>
      </div>

      <!-- Carrier & Driver Details -->
      <div class="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">ทะเบียนรถบรรทุก:</span>
          <strong class="font-mono text-slate-900 text-sm">${v.plate}</strong>
          <span class="text-[10px] text-slate-500 block">${v.brand || "Scania"} ${v.model || "P360"}</span>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">รหัสเครื่อง DLT GPS (NWT):</span>
          <strong class="font-mono text-blue-700 text-[11px] block truncate">${v.dltUnitId || "2020001000NEXTROUTE00740549"}</strong>
          <span class="text-[10px] text-emerald-600 font-bold">🟢 เชื่อมต่อระบบกรมการขนส่งทางบก</span>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">พนักงานขับรถ:</span>
          <strong class="text-slate-900 text-xs block">${d.name}</strong>
          <span class="text-[10px] text-slate-500 block">ใบขับขี่ ท.4: ${d.licenseNo || "ท.4-64000892"}</span>
        </div>
      </div>

      <!-- Workflow Timeline Status -->
      <div class="space-y-1.5 text-xs">
        <div class="font-bold text-slate-800 flex items-center justify-between">
          <span>ความคืบหน้าสถานะการจัดส่ง (Status Audit Trail):</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">สถานะปัจจุบัน: ${statusMeta.name}</span>
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
          ${flow.map(s => {
            const isDone = s.id <= job.currentStatusId;
            return `
              <div class="p-1.5 rounded-lg border text-[10px] ${isDone ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}">
                <div>${s.id}. ${s.name}</div>
                <div class="text-[9px] mt-0.5">${isDone ? '✓ บันทึกแล้ว' : 'รอดำเนินการ'}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Signatures / Acceptance -->
      <div class="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
        <div class="p-3 border border-dashed border-slate-300 rounded-xl space-y-2">
          <div class="text-[10px] font-bold text-slate-500">ผู้จ่ายสินค้า / คลังต้นทาง</div>
          <div class="h-10 border-b border-slate-300"></div>
          <div class="text-[10px] text-slate-400">(เจ้าหน้าที่คลังน้ำมัน)</div>
          <div class="text-[9px] text-slate-400">วันที่: ...../...../..........</div>
        </div>
        <div class="p-3 border border-dashed border-slate-300 rounded-xl space-y-2">
          <div class="text-[10px] font-bold text-slate-500">พนักงานขับรถ / ผู้ขนส่ง</div>
          <div class="h-10 border-b border-slate-300 flex items-center justify-center font-serif text-slate-700 italic">
            ${d.name}
          </div>
          <div class="text-[10px] text-slate-600 font-bold">${d.name}</div>
          <div class="text-[9px] text-slate-400">เวลาออก: ${job.departureTime || "09:00"} น.</div>
        </div>
        <div class="p-3 border border-dashed border-slate-300 rounded-xl space-y-2">
          <div class="text-[10px] font-bold text-slate-500">ผู้รับมอบสินค้า / ปลายทาง</div>
          <div class="h-10 border-b border-slate-300"></div>
          <div class="text-[10px] text-slate-400">(ลงนามและประทับตรา)</div>
          <div class="text-[9px] text-slate-400">วันที่: ...../...../.......... เวลา: .....:..... น.</div>
        </div>
      </div>

      <!-- Official Footer Stamp -->
      <div class="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <div>NextRoute TMS Security & Compliance System • Tamper-proof GPS Verification</div>
        <div class="font-mono">VERIFIED BY NWT CLOUD GPS • CERTIFIED ACCURATE</div>
      </div>
    `;

    const modal = document.getElementById("modal-transport-manifest");
    if (modal) modal.classList.remove("hidden");
  },

  closeTransportManifestModal() {
    const modal = document.getElementById("modal-transport-manifest");
    if (modal) modal.classList.add("hidden");
  },

  submitAdminOverride() {
    const job = window.store.getJob(this.selectedJobId);
    if (!job) return;

    const targetStatusId = parseInt(document.getElementById("override-target-status")?.value || "1", 10);
    const reason = document.getElementById("override-reason-custom")?.value.trim() || "เกิดเหตุขัดข้องทางเทคนิค/คนขับไม่สามารถใช้อุปกรณ์ได้";
    const targetMeta = window.store.getStatusMeta(targetStatusId, job);

    window.store.updateJobStatus(
      job.id,
      targetStatusId,
      `⚠️ การแก้ไขกรณีฉุกเฉิน (Admin Override): ${reason}`,
      `ผู้ดูแลระบบ (Admin Override - ${reason})`
    );

    this.closeAdminOverrideModal();
    this.showToast(`บันทึกการ Override สถานะเป็น "${targetMeta.name}" สำเร็จ`, "success");
    this.renderStatusTracking();
  },

  confirmChangeStatus(jobId, targetStatusId) {
    const job = window.store.getJob(jobId);
    if (!job) return;
    const target = window.store.getStatusMeta(targetStatusId, job);
    if (!target) return;

    const note = prompt(`ยืนยันเปลี่ยนสถานะของ ${job.code} เป็น "${target.name}"\nกรุณากรอกบันทึกเพิ่มเติม (ถ้ามี):`, `อัปเดตขั้นตอนสู่ ${target.name}`);
    if (note !== null) {
      window.store.updateJobStatus(jobId, targetStatusId, note, "ผู้ดูแลระบบ (Admin)");
      this.showToast(`เปลี่ยนสถานะงาน ${job.code} เป็น "${target.name}" สำเร็จ`, "success");
      this.renderStatusTracking();
    }
  },

  openJobInTracker(jobId) {
    this.selectedJobId = jobId;
    this.switchTab("status-tracking");
  },

  /* =====================================================================
     3. GPS Tracking Render (ผสานการคำนวณระยะทางคงเหลือและ Live ETA)
  ===================================================================== */
  renderGpsTracking() {
    const vehicles = window.store.getVehicles();
    const jobs = window.store.getJobs();
    const listContainer = document.getElementById("gps-vehicle-list");
    if (!listContainer) return;

    listContainer.innerHTML = vehicles.map(v => {
      const driver = window.store.getDriver(v.driverId) || { name: "-" };
      const currentJob = jobs.find(j => j.vehicleId === v.id && !window.store.isJobCompleted(j));
      const dropoffLoc = currentJob ? window.store.getLocation(currentJob.dropoffLocId) : null;
      const liveEst = (currentJob && dropoffLoc && window.ETAEngine)
        ? window.ETAEngine.estimateLiveVehicleStatus(v, currentJob, dropoffLoc)
        : null;

      const statusBadge = {
        running: '<span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">กำลังวิ่ง</span>',
        resting: '<span class="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">จอดพัก</span>',
        idle: '<span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">พร้อมใช้</span>',
        ready: '<span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">พร้อมใช้</span>',
        maintenance: '<span class="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">ตรวจเช็ค</span>',
        offline: '<span class="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full">ออฟไลน์</span>'
      }[v.status] || v.status;

      return `
        <div onclick="App.focusVehicleOnMap('${v.id}')" class="p-3 bg-white hover:bg-blue-50 border border-slate-100 rounded-xl cursor-pointer transition shadow-sm mb-2">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-slate-800 font-mono text-sm">${v.plate}</span>
            ${statusBadge}
          </div>
          <div class="text-xs text-slate-600 flex justify-between">
            <span>${v.brand} ${v.model}</span>
            <span class="font-bold text-blue-600">${v.speed} กม./ชม.</span>
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex justify-between items-center">
            <span>คนขับ: ${driver.name} | น้ำมัน ${v.fuelLevel}%</span>
            <button onclick="event.stopPropagation(); App.openVehicleDetailModal('${v.id}')" class="text-[10px] font-bold text-blue-600 hover:underline shrink-0 ml-1">เจาะลึก &rarr;</button>
          </div>
          ${currentJob && liveEst ? `
            <div class="mt-2 pt-2 border-t border-slate-100 space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="font-semibold text-indigo-700">${currentJob.id} &rarr; ${dropoffLoc?.province || "-"}</span>
                <span class="font-mono font-bold text-emerald-700">ถึง ~${liveEst.liveEtaTimeOnly}</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-500">
                <span>เหลือ ~${liveEst.remainingDistKm} กม. (${liveEst.remainingText})</span>
                ${(currentJob.hasRestStop || liveEst.needsRest)
                  ? '<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">พักกฎ 4 ชม.</span>'
                  : ''}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  },

  focusVehicleOnMap(vehicleId) {
    if (this.mapManagers.gps) {
      this.mapManagers.gps.focusVehicle(vehicleId);
    }
  },

  /* =====================================================================
     4. Trip Milestones & Safety Schedule Modal (ฝังการทำงานแทนแท็บ ETA แยก)
  ===================================================================== */
  openMilestonesModal(jobId) {
    const job = window.store.getJob(jobId || this.selectedJobId);
    if (!job || !window.ETAEngine) return;

    const modal = document.getElementById("modal-trip-milestones");
    if (!modal) return;

    const plan = window.ETAEngine.getJobTripPlan(job);
    if (!plan) return;

    const pLoc = window.store.getLocation(job.pickupLocId);
    const dLoc = window.store.getLocation(job.dropoffLocId);

    const elTitle = document.getElementById("milestones-modal-title");
    if (elTitle) {
      elTitle.textContent = `${job.id} (${job.code}) : ${pLoc?.province || "-"} → ${dLoc?.province || "-"}`;
    }

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setEl("ms-res-dist", `${plan.totalDistanceKm} กม.`);
    setEl("ms-res-hours", `${plan.totalTripHours} ชม.`);
    setEl("ms-res-rest", plan.restStopsCount > 0 ? `${plan.restStopsCount} ครั้ง (${plan.totalRestMinutes} น.)` : "ไม่ต้องพัก (< 4 ชม.)");
    setEl("ms-res-eta", plan.etaDelivery);
    setEl("ms-res-return", plan.etaReturn);

    const tbody = document.getElementById("milestones-modal-tbody");
    if (tbody) {
      const dotColorMap = {
        safety_rest: "bg-amber-500 ring-2 ring-amber-200",
        border_customs: "bg-purple-600 ring-2 ring-purple-200",
        pickup: "bg-emerald-500",
        dropoff: "bg-rose-500"
      };
      tbody.innerHTML = plan.milestones.map(m => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs ${m.type === 'safety_rest' ? 'bg-amber-50/40' : m.type === 'border_customs' ? 'bg-purple-50/40' : ''}">
          <td class="py-2.5 px-3 font-bold text-center text-slate-500">${m.step}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 ${dotColorMap[m.type] || 'bg-blue-500'}"></span>
              <span>${m.title}</span>
            </div>
            <div class="text-[11px] text-slate-500 font-normal pl-4.5">${m.location}</div>
          </td>
          <td class="py-2.5 px-3 font-mono font-medium text-slate-600">${m.distanceKm} กม.</td>
          <td class="py-2.5 px-3 font-mono font-bold text-blue-700">${m.time}</td>
          <td class="py-2.5 px-3 text-slate-500 text-[11px]">${m.note}</td>
        </tr>
      `).join("");
    }

    modal.classList.remove("hidden");
  },

  closeMilestonesModal() {
    const modal = document.getElementById("modal-trip-milestones");
    if (modal) modal.classList.add("hidden");
  },

  /* =====================================================================
     5. Route Assignment Wizard (สร้างงานและจัดรอบรถ + คำนวณ ETA อัตโนมัติ)
  ===================================================================== */
  renderRoutesAndTasks() {
    const jobs = window.store.getJobs();
    const tableBody = document.getElementById("routes-jobs-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = jobs.map(j => {
      const cust = window.store.getCustomer(j.customerId) || { name: "-" };
      const v = window.store.getVehicle(j.vehicleId) || { plate: "-" };
      const d = window.store.getDriver(j.driverId) || { name: "-" };
      const pLoc = window.store.getLocation(j.pickupLocId) || { name: "-" };
      const dLoc = window.store.getLocation(j.dropoffLocId) || { name: "-" };
      const status = window.store.getStatusMeta(j.currentStatusId, j) || { name: j.currentStatusKey, key: "pending" };

      return `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
          <td class="py-3 px-4 font-bold text-blue-700 font-mono">
            ${j.id}
            ${j.isCrossBorder ? '<span class="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-700 font-bold border border-purple-200">ข้ามแดน</span>' : ''}
          </td>
          <td class="py-3 px-4 text-slate-600">${j.departureDate || "-"} ${j.departureTime || ""}</td>
          <td class="py-3 px-4 font-medium text-slate-800">${cust.name}</td>
          <td class="py-3 px-4 text-slate-600">
            <div>${pLoc.province} &rarr; ${dLoc.province}</div>
            ${j.routeDistanceKm ? `<div class="text-[10px] text-slate-400">ระยะส่ง ${j.routeDistanceKm} กม.</div>` : ''}
          </td>
          <td class="py-3 px-4 font-mono font-bold text-slate-700">${v.plate}</td>
          <td class="py-3 px-4 text-slate-600">${d.name}</td>
          <td class="py-3 px-4">
            <div class="font-mono font-semibold text-emerald-700">${j.eta || "-"}</div>
            ${j.hasRestStop ? `<span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">พักรถ ${j.restDurationMinutes || 30} นาที</span>` : ''}
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-[11px] font-bold rounded-full badge-status-${status.key}">
              ${status.name}
            </span>
          </td>
          <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
            <button onclick="App.openMilestonesModal('${j.id}')" class="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold transition" title="ดูแผนเวลาและจุดพักรถ">
              แผนเวลา
            </button>
            <button onclick="App.openJobInTracker('${j.id}')" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold transition">
              จัดการ
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  _computeWizardTripPlan() {
    if (!window.ETAEngine) return null;
    const pLocId = document.getElementById("wiz-pickup")?.value;
    const dLocId = document.getElementById("wiz-dropoff")?.value;
    const depDate = document.getElementById("wiz-dep-date")?.value || "2026-11-10";
    const depTime = document.getElementById("wiz-dep-time")?.value || "09:00";
    const returnToCompany = document.getElementById("wiz-return-company")?.checked ?? true;
    const isCrossBorder = Boolean(document.getElementById("wiz-type-crossborder")?.checked || dLocId === "LOC-007");

    const pickupLoc = window.store.getLocation(pLocId);
    const dropoffLoc = window.store.getLocation(dLocId);
    const depotLoc = window.store.getLocation("LOC-003");
    if (!pickupLoc || !dropoffLoc) return null;

    const departureDateTime = window.ETAEngine.parseDateTime(depDate, depTime);
    return window.ETAEngine.calculateTrip({
      pickupLoc,
      dropoffLoc,
      depotLoc,
      returnToCompany,
      isCrossBorder,
      avgSpeed: 65,
      restIntervalHours: 4.0,
      restDurationMinutes: 30,
      departureDateTime
    });
  },

  updateNewJobEtaPreview() {
    const plan = this._computeWizardTripPlan();
    if (!plan) return;

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setEl("wiz-eta-dist", `${plan.deliveryDistanceKm} / ${plan.totalDistanceKm} กม.`);
    setEl("wiz-eta-hours", `${plan.totalTripHours} ชม.`);
    setEl("wiz-eta-delivery", plan.etaDelivery);
    setEl("wiz-eta-return", plan.etaReturn);

    const restBadge = document.getElementById("wiz-eta-rest-badge");
    if (restBadge) {
      if (plan.restStopsCount > 0) {
        restBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200";
        restBadge.textContent = `⚠️ เกิน 4 ชม. พักรถ ${plan.restStopsCount} ครั้ง (+${plan.totalRestMinutes} นาที)`;
      } else {
        restBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700";
        restBadge.textContent = "✓ ขับไม่เกิน 4 ชม. (ไม่ต้องพักระหว่างทาง)";
      }
    }
  },

  openNewJobModal() {
    const modal = document.getElementById("modal-new-job");
    if (!modal) return;

    // Reset transport type to domestic by default
    const radDom = document.getElementById("wiz-type-domestic");
    const radCb = document.getElementById("wiz-type-crossborder");
    if (radDom) radDom.checked = true;

    // Populate dropdowns
    const custs = window.store.getCustomers();
    const locs = window.store.getLocations();
    const activeJobs = window.store.getJobs().filter(j => !window.store.isJobCompleted(j));
    const activeVehicleIds = new Set(activeJobs.map(j => j.vehicleId));
    const activeDriverIds = new Set(activeJobs.map(j => j.driverId));
    const vehicles = window.store.getVehicles().filter(v => v.status !== "maintenance" && v.status !== "offline" && !activeVehicleIds.has(v.id));
    const drivers = window.store.getDrivers().filter(d => d.status !== "leave" && !activeDriverIds.has(d.id));

    const selCust = document.getElementById("wiz-customer");
    if (selCust) {
      selCust.innerHTML = custs.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      selCust.onchange = (e) => {
        if (e.target.value === "CUS-005") {
          if (radCb) radCb.checked = true;
          const selD = document.getElementById("wiz-dropoff");
          if (selD) selD.value = "LOC-007";
        }
        this.updateNewJobEtaPreview();
      };
    }

    const selPickup = document.getElementById("wiz-pickup");
    if (selPickup) {
      selPickup.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.province})</option>`).join("");
      selPickup.value = "LOC-001";
      selPickup.onchange = () => this.updateNewJobEtaPreview();
    }

    const selDropoff = document.getElementById("wiz-dropoff");
    if (selDropoff) {
      selDropoff.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.province})</option>`).join("");
      selDropoff.value = "LOC-002";
      selDropoff.onchange = (e) => {
        if (e.target.value === "LOC-007") {
          if (radCb) radCb.checked = true;
        }
        this.updateNewJobEtaPreview();
      };
    }

    // Bind live ETA preview recalculation on time/mode fields
    ["wiz-dep-date", "wiz-dep-time", "wiz-return-company", "wiz-type-domestic", "wiz-type-crossborder"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onchange = () => this.updateNewJobEtaPreview();
    });

    const selVehicle = document.getElementById("wiz-vehicle");
    if (selVehicle) {
      if (vehicles.length > 0) {
        selVehicle.innerHTML = vehicles.map(v => `<option value="${v.id}">${v.plate} (${v.brand} ${v.model} - ${v.capacity})</option>`).join("");
      } else {
        selVehicle.innerHTML = window.store.getVehicles().map(v => `<option value="${v.id}">${v.plate} (${v.brand} ${v.model} - ${v.status})</option>`).join("");
      }
    }

    const selDriver = document.getElementById("wiz-driver");
    if (selDriver) {
      if (drivers.length > 0) {
        selDriver.innerHTML = drivers.map(d => `<option value="${d.id}">${d.name} (${d.phone})</option>`).join("");
      } else {
        selDriver.innerHTML = window.store.getDrivers().map(d => `<option value="${d.id}">${d.name} (${d.status})</option>`).join("");
      }
    }

    this.updateNewJobEtaPreview();
    modal.classList.remove("hidden");
  },

  closeNewJobModal() {
    const modal = document.getElementById("modal-new-job");
    if (modal) modal.classList.add("hidden");
  },

  submitNewJob() {
    const custId = document.getElementById("wiz-customer")?.value;
    const pLocId = document.getElementById("wiz-pickup")?.value;
    const dLocId = document.getElementById("wiz-dropoff")?.value;
    const vId = document.getElementById("wiz-vehicle")?.value;
    const dId = document.getElementById("wiz-driver")?.value;
    const prodType = document.getElementById("wiz-product-type")?.value || "น้ำมันดีเซล B7";
    const prodQty = document.getElementById("wiz-product-qty")?.value || "32,000 ลิตร";
    const depDate = document.getElementById("wiz-dep-date")?.value || new Date().toISOString().split("T")[0];
    const depTime = document.getElementById("wiz-dep-time")?.value || "09:00";
    const returnToCompany = document.getElementById("wiz-return-company")?.checked ?? true;
    const isCrossBorder = Boolean(document.getElementById("wiz-type-crossborder")?.checked || dLocId === "LOC-007" || custId === "CUS-005");

    const tripPlan = this._computeWizardTripPlan();
    const pLoc = window.store.getLocation(pLocId);
    const dLoc = window.store.getLocation(dLocId);
    const fallbackDist = window.ETAEngine.calculateDistance(pLoc.lat, pLoc.lng, dLoc.lat, dLoc.lng);

    const newJob = window.store.addJob({
      customerId: custId,
      pickupLocId: pLocId,
      dropoffLocId: dLocId,
      vehicleId: vId,
      driverId: dId,
      productType: prodType,
      productQty: prodQty,
      departureDate: depDate,
      departureTime: depTime,
      returnToCompany,
      routeDistanceKm: tripPlan ? tripPlan.deliveryDistanceKm : fallbackDist,
      totalDistanceKm: tripPlan ? tripPlan.totalDistanceKm : fallbackDist,
      estimatedDurationHours: tripPlan ? parseFloat(tripPlan.totalTripHours) : 2.0,
      hasRestStop: tripPlan ? tripPlan.restStopsCount > 0 : false,
      restCount: tripPlan ? tripPlan.restStopsCount : 0,
      restDurationMinutes: tripPlan ? tripPlan.totalRestMinutes : 0,
      isCrossBorder,
      transportType: isCrossBorder ? "cross_border" : "domestic",
      currentStatusId: 1, // รอรับงาน
      currentStatusKey: "pending",
      eta: tripPlan ? tripPlan.etaDeliveryIso : `${depDate} ${depTime}`,
      etaReturn: tripPlan ? tripPlan.etaReturnIso : "-"
    });

    this.closeNewJobModal();
    this.showToast(`สร้างงาน ${newJob.code} (${isCrossBorder ? "ข้ามแดน" : "ในประเทศ"}) | ETA: ${newJob.eta}`, "success");
    this.openJobInTracker(newJob.id);
  },

  /* =====================================================================
     6. Fleet Management Render (13 รถบรรทุก และ 13 คนขับ)
  ===================================================================== */
  resetFleetFilters() {
    const searchEl = document.getElementById("fleet-search-input");
    const filterEl = document.getElementById("fleet-status-filter");
    if (searchEl) searchEl.value = "";
    if (filterEl) filterEl.value = "all";
    this.renderFleetManagement();
  },

  _matchesVehicleFilter(v, driverName, activeJob, pLoc, dLoc, query, statusFilter) {
    const statusMap = {
      all: () => true,
      running: () => v.status === "running",
      resting: () => v.status === "resting",
      assigned: () => v.status === "assigned",
      ready: () => v.status === "ready" || v.status === "idle",
      maintenance: () => v.status === "maintenance",
      inactive: () => v.status === "offline"
    };
    const matchStatus = (statusMap[statusFilter] || statusMap.all)();
    if (!matchStatus) return false;
    if (!query) return true;

    const haystacks = [
      v.id, v.plate, v.brand, v.model, v.type, driverName,
      activeJob?.id, activeJob?.code, pLoc?.province, dLoc?.province
    ];
    return haystacks.some(txt => (txt || "").toLowerCase().includes(query));
  },

  _matchesDriverFilter(d, linkedVehicle, query, statusFilter) {
    const statusMap = {
      all: () => true,
      running: () => d.status === "on_duty" && (!linkedVehicle || linkedVehicle.status === "running"),
      resting: () => linkedVehicle?.status === "resting",
      assigned: () => linkedVehicle?.status === "assigned",
      ready: () => d.status === "ready",
      maintenance: () => linkedVehicle?.status === "maintenance",
      inactive: () => d.status === "leave" || d.status === "offline"
    };
    const matchStatus = (statusMap[statusFilter] || statusMap.all)();
    if (!matchStatus) return false;
    if (!query) return true;

    const haystacks = [
      d.id, d.name, d.phone, d.licenseType, d.licenseNo, d.vehiclePlate,
      linkedVehicle?.brand, linkedVehicle?.model
    ];
    return haystacks.some(txt => (txt || "").toLowerCase().includes(query));
  },

  renderFleetManagement() {
    const vehicles = window.store.getVehicles();
    const drivers = window.store.getDrivers();
    const jobs = window.store.getJobs();

    const query = (document.getElementById("fleet-search-input")?.value || "").trim().toLowerCase();
    const statusFilter = document.getElementById("fleet-status-filter")?.value || "all";

    const activeJobByVehicle = {};
    jobs.forEach(j => {
      if (j.vehicleId && !window.store.isJobCompleted(j) && !activeJobByVehicle[j.vehicleId]) {
        activeJobByVehicle[j.vehicleId] = j;
      }
    });

    const filteredVehicles = vehicles.filter(v => {
      const d = v.driverId ? window.store.getDriver(v.driverId) : null;
      const driverName = d ? d.name : "";
      const activeJob = activeJobByVehicle[v.id] || null;
      const pLoc = activeJob ? window.store.getLocation(activeJob.pickupLocId) : null;
      const dLoc = activeJob ? window.store.getLocation(activeJob.dropoffLocId) : null;
      return this._matchesVehicleFilter(v, driverName, activeJob, pLoc, dLoc, query, statusFilter);
    });

    const filteredDrivers = drivers.filter(d => {
      const linkedVehicle = (d.vehiclePlate && !d.vehiclePlate.includes("สำรอง"))
        ? window.store.getVehicle(d.vehiclePlate)
        : vehicles.find(v => v.driverId === d.id) || null;
      return this._matchesDriverFilter(d, linkedVehicle, query, statusFilter);
    });

    const summaryEl = document.getElementById("fleet-filter-summary");
    if (summaryEl) {
      summaryEl.textContent = (query || statusFilter !== "all")
        ? `แสดงรถ ${filteredVehicles.length}/${vehicles.length} คัน • คนขับ ${filteredDrivers.length}/${drivers.length} คน`
        : "";
    }

    const vehicleGrid = document.getElementById("fleet-vehicle-grid");
    if (vehicleGrid) {
      if (filteredVehicles.length === 0) {
        vehicleGrid.innerHTML = `
          <div class="col-span-full p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500 space-y-2">
            <div>ไม่พบรถบรรทุกที่ตรงกับเงื่อนไขการค้นหา</div>
            <button type="button" onclick="App.resetFleetFilters()" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50">
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        `;
      } else {
        vehicleGrid.innerHTML = filteredVehicles.map(v => {
          const driver = v.driverId ? window.store.getDriver(v.driverId) : null;
          const driverName = driver ? driver.name : "ยังไม่ระบุคนขับ";
          const vBadge = this.VEHICLE_STATUS_MAP[v.status] || { cls: "bg-slate-100 text-slate-700 border border-slate-200", label: v.status, dot: "bg-slate-400" };
          const activeJob = activeJobByVehicle[v.id] || null;
          const pLoc = activeJob ? window.store.getLocation(activeJob.pickupLocId) : null;
          const dLoc = activeJob ? window.store.getLocation(activeJob.dropoffLocId) : null;
          const jobPill = activeJob
            ? `<span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 truncate max-w-[165px]" title="${activeJob.id}: ${pLoc?.province || '-'} -> ${dLoc?.province || '-'}">${activeJob.id}${pLoc && dLoc ? ` • ${pLoc.province}&rarr;${dLoc.province}` : ""}</span>`
            : `<span class="text-[10px] text-slate-400 font-medium">ไม่มีงานค้าง</span>`;

          return `
            <div class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1.5 gap-2">
                  <span class="text-base font-bold text-slate-900 font-mono">${v.plate}</span>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 shrink-0">${v.brand} ${v.model}</span>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${vBadge.cls}">
                    <span class="w-1.5 h-1.5 rounded-full ${vBadge.dot}"></span>
                    ${vBadge.label}
                  </span>
                  ${jobPill}
                </div>
                <div class="text-xs text-slate-500 mb-2">ความจุ: ${v.capacity} | ${v.type}</div>
                <div class="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl mb-3">
                  <div class="flex justify-between gap-2"><span>คนขับประจำ:</span> <strong class="text-slate-800 truncate">${driverName}</strong></div>
                  <div class="flex justify-between mt-1"><span>ระดับน้ำมัน:</span> <strong class="text-blue-600">${v.fuelLevel}%</strong></div>
                </div>
              </div>
              <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
                <span class="text-slate-400 text-[11px] truncate">${v.lastUpdate}</span>
                <div class="flex items-center gap-2 shrink-0">
                  <button type="button" onclick="App.openEditVehicleModal('${v.id}')" class="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition">
                    แก้ไข
                  </button>
                  <button type="button" onclick="App.openVehicleDetailModal('${v.id}')" class="text-blue-600 hover:text-blue-800 font-bold">
                    ดูพิกัด GPS &rarr;
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    const driverGrid = document.getElementById("fleet-driver-grid");
    if (driverGrid) {
      if (filteredDrivers.length === 0) {
        driverGrid.innerHTML = `
          <div class="col-span-full p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500 space-y-2">
            <div>ไม่พบพนักงานขับรถที่ตรงกับเงื่อนไขการค้นหา</div>
            <button type="button" onclick="App.resetFleetFilters()" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50">
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        `;
      } else {
        driverGrid.innerHTML = filteredDrivers.map(d => {
          const badge = this.DRIVER_STATUS_MAP[d.status] || { cls: "bg-slate-100 text-slate-700", label: d.status };
          return `
            <div class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2 gap-2">
                  <span class="text-sm font-bold text-slate-800 truncate">${d.name}</span>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${badge.cls}">
                    ${badge.label}
                  </span>
                </div>
                <div class="text-xs text-slate-500">โทร: <a href="tel:${d.phone}" class="text-blue-600 font-medium">${d.phone}</a></div>
                <div class="text-xs text-slate-500 mt-1">ใบขับขี่: ${d.licenseType} (${d.licenseNo})</div>
                <div class="text-[11px] text-slate-400 mt-1">ประจำรถ: <strong class="text-slate-700">${d.vehiclePlate || "-"}</strong> | ประสบการณ์ ${d.expYears} ปี</div>
              </div>
              <div class="flex items-center justify-between text-[11px] pt-2.5 mt-3 border-t border-slate-100">
                <span class="font-mono text-slate-400">รหัส: ${d.id}</span>
                <button type="button" onclick="App.openEditDriverModal('${d.id}')" class="px-2.5 py-1 font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition">
                  แก้ไข / จัดการ
                </button>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  },

  /* Shared helpers for vehicle creation (used by both Add Driver & Add Vehicle modals) */
  _suggestNextPlate() {
    const vehicles = window.store.getVehicles();
    let num = 8910 + vehicles.length;
    while (vehicles.some(v => v.plate === `ชบ.73-${num}`)) {
      num += 1;
    }
    return `ชบ.73-${num}`;
  },

  _initVehicleFormFields(prefix, existingVehicle = null) {
    const elPlate = document.getElementById(`${prefix}-plate`);
    if (elPlate) elPlate.value = existingVehicle ? existingVehicle.plate : this._suggestNextPlate();

    const selBM = document.getElementById(`${prefix}-brand-model`);
    const customWrap = document.getElementById(`${prefix}-custom-brand-wrap`);
    const elCB = document.getElementById(`${prefix}-custom-brand`);
    const elCM = document.getElementById(`${prefix}-custom-model`);
    const syncCustomWrap = () => {
      if (!customWrap || !selBM) return;
      customWrap.classList.toggle("hidden", selBM.value !== "Other|Custom");
    };

    if (selBM) {
      const combo = existingVehicle ? `${existingVehicle.brand}|${existingVehicle.model}` : "Volvo|FM370";
      const hasPreset = Array.from(selBM.options).some(opt => opt.value === combo);
      if (hasPreset) {
        selBM.value = combo;
        if (elCB) elCB.value = "";
        if (elCM) elCM.value = "";
      } else {
        selBM.value = "Other|Custom";
        if (elCB) elCB.value = existingVehicle?.brand || "";
        if (elCM) elCM.value = existingVehicle?.model || "";
      }
      selBM.onchange = syncCustomWrap;
      syncCustomWrap();
    }

    const elType = document.getElementById(`${prefix}-type`);
    if (elType) elType.value = existingVehicle?.type || "น้ำมันและแก๊ส";
    const elCap = document.getElementById(`${prefix}-capacity`);
    if (elCap) {
      const targetCap = existingVehicle?.capacity || "32,000 ลิตร";
      if (!Array.from(elCap.options).some(opt => opt.value === targetCap)) {
        const opt = document.createElement("option");
        opt.value = targetCap;
        opt.textContent = targetCap;
        elCap.appendChild(opt);
      }
      elCap.value = targetCap;
    }
  },

  _readAndValidateVehicleForm(prefix, excludeVehicleId = null) {
    const elPlate = document.getElementById(`${prefix}-plate`);
    const plate = elPlate?.value.trim();
    if (!plate) {
      this.showToast("กรุณากรอกทะเบียนรถบรรทุก", "error");
      if (elPlate) elPlate.focus();
      return null;
    }

    if (window.store.getVehicles().some(v => v.id !== excludeVehicleId && v.plate.toLowerCase() === plate.toLowerCase())) {
      this.showToast(`ทะเบียนรถ "${plate}" มีอยู่ในระบบแล้ว`, "error");
      if (elPlate) elPlate.focus();
      return null;
    }

    const bmVal = document.getElementById(`${prefix}-brand-model`)?.value || "Volvo|FM370";
    let [brand, model] = bmVal.split("|");
    if (brand === "Other") {
      const elCB = document.getElementById(`${prefix}-custom-brand`);
      const elCM = document.getElementById(`${prefix}-custom-model`);
      brand = elCB?.value.trim() || "";
      model = elCM?.value.trim() || "";
      if (!brand || !model) {
        this.showToast("กรุณาระบุยี่ห้อและรุ่นรถ", "error");
        if (elCB && !brand) elCB.focus();
        else if (elCM) elCM.focus();
        return null;
      }
    }

    const type = document.getElementById(`${prefix}-type`)?.value.trim() || "น้ำมันและแก๊ส";
    const capacity = document.getElementById(`${prefix}-capacity`)?.value || "32,000 ลิตร";

    return { plate, brand, model, type, capacity };
  },

  _populateDriverVehicleSelect(selectedPlate = "สำรอง (รอจัดรถ)") {
    const selPlate = document.getElementById("drv-vehicle-plate");
    if (!selPlate) return;

    const vehicles = window.store.getVehicles();
    selPlate.innerHTML =
      `<option value="สำรอง (รอจัดรถ)">พนักงานขับรถสำรอง (ยังไม่ระบุรถประจำ)</option>` +
      `<option value="__NEW__">➕ + เพิ่มรถบรรทุกคันใหม่...</option>` +
      vehicles.map(v => {
        const curDrv = v.driverId ? window.store.getDriver(v.driverId) : null;
        const drvTag = curDrv ? ` - คนขับ: ${curDrv.name}` : " - ว่าง";
        return `<option value="${v.plate}">${v.plate} (${v.brand} ${v.model}${drvTag})</option>`;
      }).join("");

    selPlate.onchange = () => this._syncInlineNewVehicleVisibility();
    const hasMatch = Array.from(selPlate.options).some(o => o.value === selectedPlate);
    selPlate.value = hasMatch ? selectedPlate : "สำรอง (รอจัดรถ)";
    this._syncInlineNewVehicleVisibility();
  },

  _populateVehicleDriverSelect(selectedDriverId = "") {
    const selDrv = document.getElementById("veh-new-driver");
    if (!selDrv) return;

    const drivers = window.store.getDrivers();
    selDrv.innerHTML = `<option value="">ยังไม่ระบุคนขับประจำ</option>` +
      drivers.map(d => `<option value="${d.id}">${d.name} (${d.vehiclePlate || "สำรอง"})</option>`).join("");
    selDrv.value = drivers.some(d => d.id === selectedDriverId) ? selectedDriverId : "";
  },

  _syncInlineNewVehicleVisibility() {
    const selPlate = document.getElementById("drv-vehicle-plate");
    const newFields = document.getElementById("drv-new-vehicle-fields");
    const toggleBtn = document.getElementById("btn-toggle-inline-vehicle");
    if (!selPlate || !newFields) return;

    const isAddingNew = selPlate.value === "__NEW__";
    newFields.classList.toggle("hidden", !isAddingNew);
    if (toggleBtn) {
      toggleBtn.textContent = isAddingNew ? "ยกเลิกเพิ่มรถ" : "+ เพิ่มรถใหม่";
    }
    if (isAddingNew) {
      this._initVehicleFormFields("drv-new");
    }
  },

  toggleInlineNewVehicle() {
    const selPlate = document.getElementById("drv-vehicle-plate");
    if (!selPlate) return;
    selPlate.value = (selPlate.value === "__NEW__") ? "สำรอง (รอจัดรถ)" : "__NEW__";
    this._syncInlineNewVehicleVisibility();
  },

  _configureDriverModalChrome(driver = null) {
    const isEdit = Boolean(driver);
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setTxt("drv-modal-subtitle", isEdit ? `Edit Driver (${driver.id})` : "Driver Registration");
    setTxt("drv-modal-title", isEdit ? `แก้ไขข้อมูลพนักงาน: ${driver.name}` : "เพิ่มพนักงานขับรถใหม่");
    setTxt("drv-status-label", isEdit ? "สถานะพนักงาน" : "สถานะเริ่มต้น");
    setTxt("btn-submit-driver", isEdit ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มพนักงาน");

    const btnDel = document.getElementById("btn-delete-driver");
    if (btnDel) btnDel.classList.toggle("hidden", !isEdit);
  },

  openNewDriverModal() {
    const modal = document.getElementById("modal-new-driver");
    if (!modal) return;

    this.editingDriverId = null;
    this._configureDriverModalChrome(null);

    const drivers = window.store.getDrivers();
    const elName = document.getElementById("drv-name");
    if (elName) elName.value = "";
    const elPhone = document.getElementById("drv-phone");
    if (elPhone) elPhone.value = "";
    const elExp = document.getElementById("drv-exp-years");
    if (elExp) elExp.value = "4";
    const elLicType = document.getElementById("drv-license-type");
    if (elLicType) elLicType.value = "ท.4 (วัตถุอันตราย)";
    const elLicNo = document.getElementById("drv-license-no");
    if (elLicNo) elLicNo.value = `ท4-${1002345 + drivers.length}`;
    const elStatus = document.getElementById("drv-status");
    if (elStatus) elStatus.value = "ready";

    this._populateDriverVehicleSelect("สำรอง (รอจัดรถ)");

    modal.classList.remove("hidden");
    if (elName) elName.focus();
  },

  openEditDriverModal(driverId) {
    const modal = document.getElementById("modal-new-driver");
    const d = window.store.getDriver(driverId);
    if (!modal || !d) return;

    this.editingDriverId = d.id;
    this._configureDriverModalChrome(d);

    const elName = document.getElementById("drv-name");
    if (elName) elName.value = d.name || "";
    const elPhone = document.getElementById("drv-phone");
    if (elPhone) elPhone.value = d.phone || "";
    const elExp = document.getElementById("drv-exp-years");
    if (elExp) elExp.value = String(d.expYears ?? 1);
    const elLicType = document.getElementById("drv-license-type");
    if (elLicType) {
      if (!Array.from(elLicType.options).some(o => o.value === d.licenseType)) {
        const opt = document.createElement("option");
        opt.value = d.licenseType;
        opt.textContent = d.licenseType;
        elLicType.appendChild(opt);
      }
      elLicType.value = d.licenseType;
    }
    const elLicNo = document.getElementById("drv-license-no");
    if (elLicNo) elLicNo.value = d.licenseNo || "";
    const elStatus = document.getElementById("drv-status");
    if (elStatus) elStatus.value = d.status || "ready";

    this._populateDriverVehicleSelect(d.vehiclePlate || "สำรอง (รอจัดรถ)");

    modal.classList.remove("hidden");
    if (elName) elName.focus();
  },

  closeNewDriverModal() {
    const modal = document.getElementById("modal-new-driver");
    if (modal) modal.classList.add("hidden");
    this.editingDriverId = null;
  },

  submitNewDriver() {
    const nameEl = document.getElementById("drv-name");
    const phoneEl = document.getElementById("drv-phone");
    const name = nameEl?.value.trim();
    const phone = phoneEl?.value.trim();

    if (!name) {
      this.showToast("กรุณากรอกชื่อ-นามสกุลของพนักงานขับรถ", "error");
      if (nameEl) nameEl.focus();
      return;
    }
    if (!phone) {
      this.showToast("กรุณากรอกเบอร์โทรศัพท์ติดต่อ", "error");
      if (phoneEl) phoneEl.focus();
      return;
    }

    const licenseType = document.getElementById("drv-license-type")?.value || "ท.4 (วัตถุอันตราย)";
    const licenseNo = document.getElementById("drv-license-no")?.value.trim() || `ท4-${1002345 + window.store.getDrivers().length}`;
    const expYears = parseInt(document.getElementById("drv-exp-years")?.value || "1", 10);
    const plateChoice = document.getElementById("drv-vehicle-plate")?.value || "สำรอง (รอจัดรถ)";
    const status = document.getElementById("drv-status")?.value || "ready";

    let vehicleData = null;
    if (plateChoice === "__NEW__") {
      vehicleData = this._readAndValidateVehicleForm("drv-new");
      if (!vehicleData) return;
    }

    const safeExp = isNaN(expYears) ? 1 : expYears;

    if (this.editingDriverId) {
      const driverId = this.editingDriverId;
      let finalPlate = plateChoice;
      if (vehicleData) {
        const newVeh = window.store.addVehicle({
          ...vehicleData,
          driverId,
          status: (status === "leave" || status === "offline") ? "idle" : "ready"
        });
        finalPlate = newVeh.plate;
      }
      const updated = window.store.updateDriver(driverId, {
        name,
        phone,
        licenseNo,
        licenseType,
        expYears: safeExp,
        vehiclePlate: finalPlate,
        status
      });
      this.closeNewDriverModal();
      this.showToast(`บันทึกข้อมูลพนักงาน "${updated?.name || name}" สำเร็จ`, "success");
      return;
    }

    const assignedPlate = vehicleData ? vehicleData.plate : plateChoice;
    const newDriver = window.store.addDriver({
      name,
      phone,
      licenseNo,
      licenseType,
      expYears: safeExp,
      vehiclePlate: assignedPlate,
      status
    });

    if (vehicleData) {
      const newVehicle = window.store.addVehicle({
        ...vehicleData,
        driverId: newDriver.id,
        status: (status === "leave" || status === "offline") ? "idle" : "ready"
      });
      this.closeNewDriverModal();
      this.showToast(`เพิ่มพนักงาน "${newDriver.name}" และรถ "${newVehicle.plate}" (${newVehicle.brand} ${newVehicle.model}) สำเร็จ`, "success");
    } else {
      this.closeNewDriverModal();
      this.showToast(`เพิ่มพนักงานขับรถ "${newDriver.name}" (${newDriver.id}) สำเร็จ`, "success");
    }
  },

  deleteDriverFromModal() {
    if (!this.editingDriverId) return;
    const d = window.store.getDriver(this.editingDriverId);
    const label = d ? `${d.name} (${d.id})` : this.editingDriverId;
    if (!confirm(`ยืนยันลบพนักงานขับรถ "${label}" ออกจากระบบหรือไม่?`)) return;

    const res = window.store.deleteDriver(this.editingDriverId);
    if (!res.ok) {
      this.showToast(res.reason, "error");
      return;
    }
    this.closeNewDriverModal();
    this.showToast(`ลบพนักงาน "${label}" ออกจากระบบแล้ว`, "success");
  },

  _configureVehicleModalChrome(vehicle = null) {
    const isEdit = Boolean(vehicle);
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setTxt("veh-modal-subtitle", isEdit ? `Edit Vehicle (${vehicle.id})` : "Fleet Registration");
    setTxt("veh-modal-title", isEdit ? `แก้ไขข้อมูลรถ ${vehicle.plate}` : "เพิ่มรถบรรทุกเข้ากองรถ");
    setTxt("veh-status-label", isEdit ? "สถานะรถ" : "สถานะรถเริ่มต้น");
    setTxt("btn-submit-vehicle", isEdit ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มรถบรรทุก");

    const btnDel = document.getElementById("btn-delete-vehicle");
    if (btnDel) btnDel.classList.toggle("hidden", !isEdit);
  },

  openNewVehicleModal() {
    const modal = document.getElementById("modal-new-vehicle");
    if (!modal) return;

    this.editingVehicleId = null;
    this._configureVehicleModalChrome(null);
    this._initVehicleFormFields("veh-new", null);
    this._populateVehicleDriverSelect("");

    const elStatus = document.getElementById("veh-new-status");
    if (elStatus) elStatus.value = "ready";

    modal.classList.remove("hidden");
    const elPlate = document.getElementById("veh-new-plate");
    if (elPlate) elPlate.focus();
  },

  openEditVehicleModal(vehicleId) {
    const modal = document.getElementById("modal-new-vehicle");
    const v = window.store.getVehicle(vehicleId);
    if (!modal || !v) return;

    this.editingVehicleId = v.id;
    this._configureVehicleModalChrome(v);
    this._initVehicleFormFields("veh-new", v);
    this._populateVehicleDriverSelect(v.driverId || "");

    const elStatus = document.getElementById("veh-new-status");
    if (elStatus) {
      const normalized = (v.status === "idle") ? "ready" : v.status;
      elStatus.value = Array.from(elStatus.options).some(o => o.value === normalized) ? normalized : "ready";
    }

    modal.classList.remove("hidden");
    const elPlate = document.getElementById("veh-new-plate");
    if (elPlate) elPlate.focus();
  },

  closeNewVehicleModal() {
    const modal = document.getElementById("modal-new-vehicle");
    if (modal) modal.classList.add("hidden");
    this.editingVehicleId = null;
  },

  submitNewVehicle() {
    const vehicleData = this._readAndValidateVehicleForm("veh-new", this.editingVehicleId);
    if (!vehicleData) return;

    const driverId = document.getElementById("veh-new-driver")?.value || "";
    const status = document.getElementById("veh-new-status")?.value || "ready";

    if (this.editingVehicleId) {
      const updated = window.store.updateVehicle(this.editingVehicleId, {
        ...vehicleData,
        driverId,
        status
      });
      this.closeNewVehicleModal();
      this.showToast(`บันทึกข้อมูลรถ "${updated?.plate || vehicleData.plate}" สำเร็จ`, "success");
      return;
    }

    const newVehicle = window.store.addVehicle({
      ...vehicleData,
      driverId,
      status
    });

    this.closeNewVehicleModal();
    this.showToast(`เพิ่มรถบรรทุก "${newVehicle.plate}" (${newVehicle.brand} ${newVehicle.model}) เข้ากองรถสำเร็จ`, "success");
  },

  deleteVehicleFromModal() {
    if (!this.editingVehicleId) return;
    const vehicleId = this.editingVehicleId;
    const v = window.store.getVehicle(vehicleId);
    const label = v ? `${v.plate} (${v.id})` : vehicleId;
    if (!confirm(`ยืนยันลบรถบรรทุก "${label}" ออกจากกองรถหรือไม่?`)) return;

    const res = window.store.deleteVehicle(vehicleId);
    if (!res.ok) {
      this.showToast(res.reason, "error");
      return;
    }
    if (this.selectedDetailVehicleId === vehicleId) {
      this.closeVehicleDetailModal();
    }
    this.closeNewVehicleModal();
    this.showToast(`ลบรถบรรทุก "${label}" ออกจากกองรถแล้ว`, "success");
  },

  /* =====================================================================
     6.1 Single-Vehicle GPS & Job Detail Modal (Option B)
  ===================================================================== */
  openVehicleDetailModal(vehicleId) {
    const modal = document.getElementById("modal-vehicle-detail");
    if (!modal) return;

    this.selectedDetailVehicleId = vehicleId;
    this._lastDetailStepKey = null;

    // Populate quick vehicle switcher dropdown
    const sel = document.getElementById("vd-vehicle-select");
    if (sel) {
      sel.innerHTML = window.store.getVehicles().map(v => `
        <option value="${v.id}" ${v.id === vehicleId ? "selected" : ""}>
          ${v.plate} (${v.brand} ${v.model})
        </option>
      `).join("");
      sel.onchange = (e) => {
        this.selectedDetailVehicleId = e.target.value;
        this._lastDetailStepKey = null;
        this.renderVehicleDetailModalData(e.target.value, false);
      };
    }

    modal.classList.remove("hidden");

    if (!this.mapManagers.vehicleDetail) {
      this.mapManagers.vehicleDetail = new window.MapManager("vd-map", {
        skipInitialRender: true,
        zoom: 11
      });
    }

    this.renderVehicleDetailModalData(vehicleId, false);
    setTimeout(() => {
      if (this.selectedDetailVehicleId !== vehicleId) return;
      const mgr = this.mapManagers.vehicleDetail;
      if (mgr?.map) {
        mgr.map.invalidateSize({ animate: false });
        const v = window.store.getVehicle(vehicleId);
        if (v) {
          const jobs = window.store.getJobs();
          const activeJob = jobs.find(j => j.vehicleId === v.id && !window.store.isJobCompleted(j));
          const job = activeJob || jobs.find(j => j.vehicleId === v.id) || null;
          const pLoc = job ? window.store.getLocation(job.pickupLocId) : null;
          const dLoc = job ? window.store.getLocation(job.dropoffLocId) : null;
          mgr.renderSingleVehicleFocus(v, job, pLoc, dLoc);
        }
      }
    }, 90);
  },

  closeVehicleDetailModal() {
    const modal = document.getElementById("modal-vehicle-detail");
    if (modal) modal.classList.add("hidden");
    this.selectedDetailVehicleId = null;
    this._lastDetailStepKey = null;
  },

  openJobFromVehicleDetail(jobId) {
    this.closeVehicleDetailModal();
    this.openJobInTracker(jobId);
  },

  renderVehicleDetailModalData(vehicleId, liveTickOnly = false) {
    const v = window.store.getVehicle(vehicleId);
    if (!v) return;

    const drivers = window.store.getDrivers();
    const d = (v.driverId ? window.store.getDriver(v.driverId) : null) ||
              drivers.find(dr => dr.vehiclePlate === v.plate);

    const jobs = window.store.getJobs();
    const activeJob = jobs.find(j => j.vehicleId === v.id && !window.store.isJobCompleted(j));
    const latestCompletedJob = !activeJob ? jobs.find(j => j.vehicleId === v.id) : null;
    const job = activeJob || latestCompletedJob || null;

    const vBadge = this.VEHICLE_STATUS_MAP[v.status] || { cls: "bg-slate-100 text-slate-700", label: v.status };

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    // Header
    setEl("vd-plate", v.plate);
    setEl("vd-model", `${v.brand} ${v.model}`);
    const elVBadge = document.getElementById("vd-status-badge");
    if (elVBadge) {
      elVBadge.className = `px-2.5 py-0.5 text-[11px] font-bold rounded-full ${vBadge.cls}`;
      elVBadge.textContent = vBadge.label;
    }
    setEl("vd-meta-sub", `ความจุ: ${v.capacity} | ${v.type} | อัปเดตพิกัด: ${v.lastUpdate}`);

    // Lookup job locations & live telemetry
    const pLoc = job ? window.store.getLocation(job.pickupLocId) : null;
    const dLoc = job ? window.store.getLocation(job.dropoffLocId) : null;
    const liveEst = (activeJob && dLoc && window.ETAEngine)
      ? window.ETAEngine.estimateLiveVehicleStatus(v, activeJob, dLoc)
      : null;

    setEl("vd-speed", `${v.speed} กม./ชม.`);
    setEl("vd-fuel", `${v.fuelLevel}%`);
    setEl("vd-rem-dist", activeJob && liveEst ? `~${liveEst.remainingDistKm} กม.` : (activeJob ? `${activeJob.routeDistanceKm || "-"} กม.` : "-"));
    setEl("vd-live-eta", activeJob && liveEst ? liveEst.liveEtaTimeOnly : (activeJob?.eta || "-"));

    // Map update (smoothly updates marker + route polylines without resetting zoom on live tick)
    const mgr = this.mapManagers.vehicleDetail;
    if (mgr && mgr.map) {
      if (liveTickOnly && mgr.markers[v.id]) {
        mgr.updateSingleVehicleFocusPosition(v, job, pLoc, dLoc);
      } else {
        mgr.renderSingleVehicleFocus(v, job, pLoc, dLoc);
      }
    }

    // Avoid rebuilding driver/job/timeline DOM on 4s GPS ticks unless step, job, or driver assignment changed
    const stepKey = job
      ? `${v.id}|${d?.id || ""}|${d?.status || ""}|${job.id}|${job.currentStatusId}|${(job.timeline || []).length}`
      : `${v.id}|${d?.id || ""}|${d?.status || ""}|no-job`;
    if (liveTickOnly && this._lastDetailStepKey === stepKey) {
      return;
    }
    this._lastDetailStepKey = stepKey;

    // Driver card
    if (d) {
      setEl("vd-driver-name", d.name);
      const elPhone = document.getElementById("vd-driver-phone");
      if (elPhone) {
        elPhone.textContent = d.phone;
        elPhone.href = `tel:${d.phone}`;
      }
      setEl("vd-driver-license", `${d.licenseType} (${d.licenseNo}) • ${d.expYears} ปี`);
      const dBadge = this.DRIVER_STATUS_MAP[d.status] || { cls: "bg-slate-100 text-slate-700", label: d.status };
      const elDrvStatus = document.getElementById("vd-driver-status");
      if (elDrvStatus) {
        elDrvStatus.className = `px-2 py-0.5 rounded-full text-[10px] font-bold ${dBadge.cls}`;
        elDrvStatus.textContent = dBadge.label;
      }
    } else {
      setEl("vd-driver-name", "ยังไม่ระบุคนขับประจำ");
      const elPhone = document.getElementById("vd-driver-phone");
      if (elPhone) { elPhone.textContent = "-"; elPhone.href = "#"; }
      setEl("vd-driver-license", "-");
      setEl("vd-driver-status", "-");
    }

    // Job Details Card & Status Progress List
    const jobHeading = document.getElementById("vd-job-heading");
    const jobTypeBadge = document.getElementById("vd-job-type-badge");
    const jobBody = document.getElementById("vd-job-body");
    const jobActions = document.getElementById("vd-job-actions");
    const stepBadge = document.getElementById("vd-status-step-badge");
    const stepsContainer = document.getElementById("vd-status-steps");

    if (!job) {
      if (jobHeading) jobHeading.textContent = "รายละเอียดงานขนส่ง";
      if (jobTypeBadge) {
        jobTypeBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600";
        jobTypeBadge.textContent = "ว่าง / รอมอบหมายงาน";
      }
      if (jobBody) {
        jobBody.innerHTML = `<div class="p-3 bg-slate-50 rounded-xl text-slate-500 text-center">รถคันนี้ยังไม่มีงานขนส่งในรอบปัจจุบัน</div>`;
      }
      if (jobActions) {
        jobActions.classList.add("hidden");
        jobActions.innerHTML = "";
      }
      if (stepBadge) stepBadge.textContent = "-";
      if (stepsContainer) {
        stepsContainer.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">รอการมอบหมายใบงานจากฝ่ายจัดรอบรถ</div>`;
      }
      return;
    }

    const cust = window.store.getCustomer(job.customerId) || { name: "-" };
    const flow = window.store.getStatusFlow(job);
    const currentMeta = window.store.getStatusMeta(job.currentStatusId, job) || { name: "-", key: "pending" };

    if (jobHeading) {
      jobHeading.textContent = activeJob ? "งานที่กำลังดำเนินการ" : "งานล่าสุด (เสร็จสิ้นแล้ว)";
    }
    if (jobTypeBadge) {
      if (job.isCrossBorder) {
        jobTypeBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200";
        jobTypeBadge.textContent = "🌐 ข้ามแดน (8 ขั้นตอน)";
      } else {
        jobTypeBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700";
        jobTypeBadge.textContent = "🇹🇭 ในประเทศ (7 ขั้นตอน)";
      }
    }

    if (jobBody) {
      jobBody.innerHTML = `
        <div class="flex justify-between"><span>รหัสใบงาน:</span> <strong class="font-mono text-blue-700">${job.id} (${job.code})</strong></div>
        <div class="flex justify-between gap-2"><span>ลูกค้า:</span> <strong class="text-slate-900 text-right">${cust.name}</strong></div>
        <div class="flex justify-between"><span>สินค้า:</span> <strong class="text-indigo-700">${job.productType} (${job.productQty})</strong></div>
        <div class="flex justify-between gap-2"><span>เส้นทาง:</span> <strong class="text-slate-800 text-right">${pLoc?.province || "-"} &rarr; ${dLoc?.province || "-"} (${job.routeDistanceKm || "-"} กม.)</strong></div>
        <div class="flex justify-between"><span>เวลาออก / กำหนดถึง ETA:</span> <strong class="font-mono text-emerald-700">${job.departureTime || "-"} / ${job.eta || "-"}</strong></div>
        ${job.hasRestStop ? `<div class="flex justify-between text-amber-800"><span>กฎพักรถ 4 ชม.:</span> <strong>พัก ${job.restCount || 1} ครั้ง (${job.restDurationMinutes || 30} นาที)</strong></div>` : ''}
        ${job.isCrossBorder ? `<div class="flex justify-between text-purple-800 pt-1 border-t border-slate-100"><span>ใบอนุญาตข้ามแดน:</span> <strong class="font-mono">${job.customsPermitNo || "CB-THKH-2026/0491"}</strong></div>` : ''}
      `;
    }

    if (jobActions) {
      jobActions.classList.remove("hidden");
      jobActions.innerHTML = `
        <button type="button" onclick="App.openMilestonesModal('${job.id}')" class="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition text-center">
          🕒 ดูแผนเวลา / จุดพักรถ
        </button>
        <button type="button" onclick="App.openJobFromVehicleDetail('${job.id}')" class="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-xl text-[11px] font-bold transition text-center">
          เปิดหน้าติดตามสถานะงาน &rarr;
        </button>
      `;
    }

    if (stepBadge) {
      stepBadge.textContent = `ขั้นที่ ${job.currentStatusId}/${flow.length}: ${currentMeta.name}`;
    }

    if (stepsContainer) {
      const timelineByStep = {};
      (job.timeline || []).forEach(t => { timelineByStep[t.statusId] = t; });

      stepsContainer.innerHTML = flow.map(step => {
        const isDone = step.id < job.currentStatusId || window.store.isJobCompleted(job);
        const isCurrent = step.id === job.currentStatusId && !window.store.isJobCompleted(job);
        const log = timelineByStep[step.id];

        return `
          <div class="flex items-start justify-between gap-2 p-2 rounded-xl border text-xs ${isCurrent ? (step.key === 'border_customs' ? 'bg-purple-50 border-purple-300' : 'bg-blue-50 border-blue-300') : isDone ? 'bg-slate-50 border-slate-200/70' : 'bg-white border-slate-100 opacity-60'}">
            <div class="flex items-start gap-2.5">
              <div class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${isDone ? 'bg-emerald-500 text-white' : isCurrent ? (step.key === 'border_customs' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white') : 'bg-slate-200 text-slate-500'}">
                ${isDone ? '✓' : step.id}
              </div>
              <div>
                <div class="font-bold ${isCurrent ? (step.key === 'border_customs' ? 'text-purple-800' : 'text-blue-800') : 'text-slate-800'}">${step.name}</div>
                <div class="text-[10px] text-slate-500 leading-tight">${log ? log.note : step.desc}</div>
                ${log && log.photos && log.photos.length > 0 ? `
                  <div class="mt-1 flex items-center gap-1">
                    <button type="button" onclick="App.openPhotoViewer('${job.id}', ${step.id}, 0)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold transition">
                      📷 รูปหลักฐาน (${log.photos.length} รูป)
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
            <span class="font-mono text-[10px] text-slate-500 shrink-0">${log ? log.time + ' น.' : '-'}</span>
          </div>
        `;
      }).join("");
    }
  },

  /* =====================================================================
     7. History & Reports Render (สไลด์ 13)
  ===================================================================== */
  _getCompletedJobCompletionTime(job) {
    const targetId = job.isCrossBorder ? 8 : 7;
    const timeline = job.timeline || [];
    const exactLog = timeline.find(t => t.statusId === targetId) || timeline[timeline.length - 1];
    return exactLog?.time ? `${exactLog.time} น.` : (job.eta || "-");
  },

  _getFilteredCompletedJobs() {
    const query = (document.getElementById("history-search-input")?.value || "").trim().toLowerCase();
    const typeFilter = document.getElementById("history-type-filter")?.value || "all";

    const allCompleted = window.store.getJobs()
      .filter(j => window.store.isJobCompleted(j))
      .sort((a, b) => {
        const dCmp = (b.departureDate || "").localeCompare(a.departureDate || "");
        return dCmp !== 0 ? dCmp : b.id.localeCompare(a.id);
      })
      .map(j => ({
        job: j,
        cust: window.store.getCustomer(j.customerId) || { name: "-" },
        v: window.store.getVehicle(j.vehicleId) || { plate: "-" },
        d: window.store.getDriver(j.driverId) || { name: "-" },
        pLoc: window.store.getLocation(j.pickupLocId) || { name: "-", province: "-" },
        dLoc: window.store.getLocation(j.dropoffLocId) || { name: "-", province: "-" },
        completedTime: this._getCompletedJobCompletionTime(j)
      }));

    const filteredRows = allCompleted.filter(r => {
      const j = r.job;
      if (typeFilter === "domestic" && j.isCrossBorder) return false;
      if (typeFilter === "cross_border" && !j.isCrossBorder) return false;
      if (!query) return true;

      const haystacks = [
        j.id, j.code, r.cust.name, j.productType, j.productQty,
        r.pLoc.name, r.pLoc.province, r.dLoc.name, r.dLoc.province,
        r.v.plate, r.d.name
      ];
      return haystacks.some(txt => (txt || "").toLowerCase().includes(query));
    });

    return { allCompleted, filteredRows, query, typeFilter };
  },

  resetHistoryFilters() {
    const searchEl = document.getElementById("history-search-input");
    const typeEl = document.getElementById("history-type-filter");
    if (searchEl) searchEl.value = "";
    if (typeEl) typeEl.value = "all";
    this.renderHistoryReports();
  },

  _summarizeDeliveredQuantities(rows) {
    let liters = 0;
    let tons = 0;
    let others = 0;

    rows.forEach(r => {
      const raw = String(r.job.productQty || "").trim();
      const numMatch = raw.replace(/,/g, "").match(/\d+(\.\d+)?/);
      const val = numMatch ? parseFloat(numMatch[0]) : 0;
      if (!val) return;

      if (/ตัน|\btons?\b|\bt\b/i.test(raw)) {
        tons += val;
      } else if (/ลิตร|\bliters?\b|\blitres?\b|\bl\b/i.test(raw)) {
        liters += val;
      } else {
        others += val;
      }
    });

    const fmt = (n) => Number.isInteger(n)
      ? n.toLocaleString("en-US")
      : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

    const parts = [];
    if (liters > 0) parts.push(`${fmt(liters)} ลิตร`);
    if (tons > 0) parts.push(`${fmt(tons)} ตัน`);
    if (others > 0) parts.push(`${fmt(others)} หน่วย`);

    const headline = parts.length > 0 ? parts.join(" • ") : "0 ลิตร";
    const subtext = `น้ำมัน ${fmt(liters)} ลิตร • ก๊าซ ${fmt(tons)} ตัน${others > 0 ? ` • อื่นๆ ${fmt(others)}` : ""}`;
    return { headline, subtext };
  },

  renderHistoryReports() {
    const { allCompleted, filteredRows, query, typeFilter } = this._getFilteredCompletedJobs();
    const isFiltered = Boolean(query || typeFilter !== "all");

    const volSummary = this._summarizeDeliveredQuantities(filteredRows);
    const domCount = filteredRows.filter(r => !r.job.isCrossBorder).length;
    const cbCount = filteredRows.filter(r => r.job.isCrossBorder).length;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setTxt("rep-total-completed", `${allCompleted.length} งาน`);
    setTxt("rep-filtered-count", isFiltered ? `ตรงตามตัวกรอง ${filteredRows.length} จาก ${allCompleted.length} งาน` : "แสดงเฉพาะงานที่ปิดรอบสมบูรณ์แล้ว");
    const volEl = document.getElementById("rep-total-volume");
    if (volEl) {
      volEl.textContent = volSummary.headline;
      volEl.className = `${volSummary.headline.includes("•") ? "text-xl" : "text-2xl"} font-black text-blue-700 mt-1 font-mono`;
    }
    setTxt("rep-volume-breakdown", volSummary.subtext);
    setTxt("rep-route-breakdown", `🇹🇭 ในประเทศ ${domCount} • 🌐 ข้ามแดน ${cbCount}`);
    setTxt("history-filter-summary", isFiltered ? `แสดง ${filteredRows.length}/${allCompleted.length} รายการ` : "");

    const btnExport = document.getElementById("btn-export-history-csv");
    if (btnExport) btnExport.disabled = filteredRows.length === 0;

    const tableBody = document.getElementById("history-jobs-table-body");
    if (!tableBody) return;

    if (allCompleted.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="py-10 px-4 text-center text-xs text-slate-500">
            ยังไม่มีงานขนส่งที่เสร็จสิ้นแล้ว (เมื่อคนขับอัปเดตขั้นตอนสุดท้าย รายการรายงานจะแสดงที่นี่อัตโนมัติ)
          </td>
        </tr>
      `;
      return;
    }

    if (filteredRows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="py-10 px-4 text-center text-xs text-slate-500 space-y-2">
            <div>ไม่พบรายงานงานที่ตรงกับเงื่อนไขการค้นหา</div>
            <button type="button" onclick="App.resetHistoryFilters()" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-lg font-bold">
              ล้างตัวกรองทั้งหมด
            </button>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filteredRows.map(r => {
      const j = r.job;
      return `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
          <td class="py-3 px-4 font-mono font-bold text-blue-700 align-top">
            <div>${j.id}</div>
            ${j.isCrossBorder
              ? '<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-sans font-bold border border-purple-200">🌐 ข้ามแดน</span>'
              : '<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-sans font-semibold">ในประเทศ</span>'}
          </td>
          <td class="py-3 px-4 align-top">
            <div class="text-slate-700 font-medium font-mono">${j.departureDate || "-"}</div>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              ✓ เสร็จสิ้น ${r.completedTime}
            </span>
          </td>
          <td class="py-3 px-4 font-medium text-slate-800 align-top">${r.cust.name}</td>
          <td class="py-3 px-4 text-slate-600 align-top">
            <div class="font-medium text-slate-800">${r.pLoc.province || "-"} &rarr; ${r.dLoc.province || "-"}</div>
            <div class="text-[11px] text-slate-400 truncate max-w-[230px]" title="${r.pLoc.name} -> ${r.dLoc.name}">${r.pLoc.name} &rarr; ${r.dLoc.name}</div>
          </td>
          <td class="py-3 px-4 align-top">
            <div class="font-semibold text-indigo-700">${j.productType || "-"}</div>
            <div class="text-[11px] text-slate-500">${j.productQty || "-"}</div>
          </td>
          <td class="py-3 px-4 text-right font-mono font-bold text-slate-800 align-top">
            ${j.routeDistanceKm ? `${j.routeDistanceKm} กม.` : "-"}
          </td>
          <td class="py-3 px-4 align-top">
            <div class="font-mono font-bold text-slate-800">${r.v.plate}</div>
            <div class="text-[11px] text-slate-500">${r.d.name}</div>
          </td>
          <td class="py-3 px-4 text-right align-top whitespace-nowrap">
            <button type="button" onclick="App.openJobInTracker('${j.id}')" class="text-blue-600 hover:underline font-semibold">
              ดูไทม์ไลน์ &rarr;
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  exportCompletedJobsCsv() {
    const { filteredRows } = this._getFilteredCompletedJobs();
    if (filteredRows.length === 0) {
      this.showToast("ไม่มีข้อมูลงานที่เสร็จสิ้นสำหรับส่งออก", "error");
      return;
    }

    const esc = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const headers = [
      "เลขงาน",
      "รหัสอ้างอิง",
      "ประเภทเส้นทาง",
      "วันที่เริ่มงาน",
      "เวลาปิดงาน",
      "ลูกค้า",
      "จุดรับสินค้า",
      "จังหวัดต้นทาง",
      "จุดส่งสินค้า",
      "จังหวัดปลายทาง",
      "สินค้า",
      "ปริมาณ",
      "ระยะทาง(กม.)",
      "ทะเบียนรถ",
      "คนขับ"
    ];

    const lines = [headers.map(esc).join(",")];
    filteredRows.forEach(r => {
      const j = r.job;
      lines.push([
        j.id,
        j.code,
        j.isCrossBorder ? "ข้ามแดน" : "ในประเทศ",
        j.departureDate || "-",
        r.completedTime,
        r.cust.name,
        r.pLoc.name,
        r.pLoc.province || "-",
        r.dLoc.name,
        r.dLoc.province || "-",
        j.productType || "-",
        j.productQty || "-",
        j.routeDistanceKm || 0,
        r.v.plate,
        r.d.name
      ].map(esc).join(","));
    });

    const bom = "\uFEFF";
    const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `NextRoute-Completed-Jobs-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`ส่งออกรายงาน ${filteredRows.length} งานสำเร็จแล้ว`, "success");
  },

  /* =====================================================================
     8. Driver Mobile View Simulator (มุมมองคนขับบนมือถือ)
  ===================================================================== */
  renderDriverMobileView() {
    const jobs = window.store.getJobs().filter(j => !window.store.isJobCompleted(j));
    const activeJob = jobs.find(j => j.id === this.selectedJobId) || jobs[0] || window.store.getJobs()[0];

    const elJobCode = document.getElementById("driver-sim-job-code");
    if (elJobCode) elJobCode.textContent = activeJob ? activeJob.code : "-";

    const elPlate = document.getElementById("driver-sim-plate");
    if (elPlate) {
      const v = window.store.getVehicle(activeJob?.vehicleId);
      elPlate.textContent = v ? v.plate : "-";
    }

    if (!activeJob) return;

    const flow = window.store.getStatusFlow(activeJob);
    const list = document.getElementById("driver-sim-steps-list");
    if (list) {
      list.innerHTML = flow.map(step => {
        const isDone = step.id < activeJob.currentStatusId;
        const isCurrent = step.id === activeJob.currentStatusId;
        const isFuture = step.id > activeJob.currentStatusId;
        const log = (activeJob.timeline || []).find(t => t.statusId === step.id);
        const photos = log?.photos || [];

        return `
          <div class="flex flex-col p-3 rounded-xl border ${isCurrent ? (step.key === 'border_customs' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-100' : 'bg-blue-50 border-blue-300 ring-2 ring-blue-100') : isDone ? 'bg-slate-50 border-slate-200 opacity-85' : 'bg-white border-slate-100'}">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isDone ? 'bg-emerald-500 text-white' : isCurrent ? (step.key === 'border_customs' ? 'bg-purple-600 text-white shadow' : 'bg-blue-600 text-white shadow') : 'bg-slate-200 text-slate-500'}">
                  ${isDone ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>` : step.id}
                </div>
                <div>
                  <div class="text-xs font-bold ${isCurrent ? (step.key === 'border_customs' ? 'text-purple-800' : 'text-blue-800') : 'text-slate-700'}">${step.name}</div>
                  <div class="text-[10px] text-slate-400">${step.desc}</div>
                </div>
              </div>
              ${isCurrent ? `
                <div class="flex items-center gap-1.5">
                  <button type="button" onclick="App.openUploadPhotoModal('driver', ${step.id})" title="ถ่ายรูปแนบหลักฐาน" class="p-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 rounded-lg text-xs shadow-sm">
                    📷
                  </button>
                  <button onclick="App.advanceDriverStatus('${activeJob.id}')" class="px-3 py-1.5 ${step.key === 'border_customs' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white text-xs font-bold rounded-lg shadow-sm transition">
                    อัปเดตขั้นตอนนี้
                  </button>
                </div>
              ` : isDone ? `
                <div class="flex items-center gap-2">
                  <button type="button" onclick="App.openUploadPhotoModal('driver', ${step.id})" title="ถ่ายรูปแนบหลักฐานเพิ่มเติม" class="text-[11px] text-slate-400 hover:text-blue-600">
                    📷+
                  </button>
                  <span class="text-emerald-600 text-[11px] font-bold">สำเร็จ</span>
                </div>
              ` : `<span class="text-slate-300 text-[11px]">รอขั้นตอน</span>`}
            </div>

            ${photos.length > 0 ? `
              <div class="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <button type="button" onclick="App.openPhotoViewer('${activeJob.id}', ${step.id}, 0)" class="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                  📷 ภาพหลักฐาน (${photos.length} รูป) &rarr;
                </button>
                <span class="text-[10px] text-slate-400 font-mono">${log ? log.time + ' น.' : ''}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    }
  },

  advanceDriverStatus(jobId) {
    const job = window.store.getJob(jobId);
    if (!job) return;
    const flow = window.store.getStatusFlow(job);
    if (job.currentStatusId >= flow.length) return;

    const nextId = job.currentStatusId + 1;
    const nextStatus = window.store.getStatusMeta(nextId, job);
    window.store.updateJobStatus(jobId, nextId, `คนขับอัปเดตสถานะเป็น ${nextStatus.name} ผ่านมือถือ`, "คนขับรถ (Driver Mobile App)");
    this.showToast(`คนขับอัปเดตสถานะเป็น "${nextStatus.name}" เรียบร้อย`, "success");
    this.renderDriverMobileView();
  },

  /* =====================================================================
     Utilities: Toast Notifications
  ===================================================================== */
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container") || document.body;
    const toast = document.createElement("div");
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${
      type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-slate-800"
    }`;
    toast.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
