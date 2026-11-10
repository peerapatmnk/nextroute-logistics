/**
 * NextRoute Logistics - Reactive Store & LocalStorage Manager
 */

class AppStore {
  constructor() {
    this.storageKey = "NEXTROUTE_LOGISTICS_DB_V1";
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration check for cross-border flows
        if (!parsed.crossBorderStatusFlow || !parsed.domesticStatusFlow) {
          parsed.crossBorderStatusFlow = window.DEFAULT_DATA?.crossBorderStatusFlow;
          parsed.domesticStatusFlow = window.DEFAULT_DATA?.domesticStatusFlow;
        }
        // Ensure JN-005 has isCrossBorder
        const defaultJN005 = window.DEFAULT_DATA?.jobs?.find(j => j.id === "JN-005");
        const storedJN005 = parsed.jobs?.find(j => j.id === "JN-005");
        if (storedJN005 && defaultJN005 && !storedJN005.isCrossBorder) {
          Object.assign(storedJN005, defaultJN005);
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using default", e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_DATA || {}));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
    this.notify();
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(window.DEFAULT_DATA || {}));
    this.saveState();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (e) {
        console.error("Listener error", e);
      }
    });
  }

  // Getters
  getCompany() { return this.state.company; }
  getVehicles() { return this.state.vehicles || []; }
  getDrivers() { return this.state.drivers || []; }
  getLocations() { return this.state.locations || []; }
  getCustomers() { return this.state.customers || []; }
  getJobs() { return this.state.jobs || []; }

  getStatusFlow(jobOrIsCrossBorder = false) {
    const isCross = (typeof jobOrIsCrossBorder === "boolean")
      ? jobOrIsCrossBorder
      : Boolean(jobOrIsCrossBorder && (jobOrIsCrossBorder.isCrossBorder === true || jobOrIsCrossBorder.transportType === "cross_border"));
    if (isCross) {
      return this.state.crossBorderStatusFlow || window.DEFAULT_DATA?.crossBorderStatusFlow || [];
    }
    return this.state.domesticStatusFlow || window.DEFAULT_DATA?.domesticStatusFlow || [];
  }

  getJob(id) {
    return this.getJobs().find(j => j.id === id || j.code === id);
  }

  getVehicle(id) {
    return this.getVehicles().find(v => v.id === id || v.plate === id);
  }

  getDriver(id) {
    return this.getDrivers().find(d => d.id === id);
  }

  getLocation(id) {
    return this.getLocations().find(l => l.id === id || l.code === id);
  }

  getCustomer(id) {
    return this.getCustomers().find(c => c.id === id);
  }

  getStatusMeta(statusIdOrKey, jobOrIsCrossBorder = null) {
    if (jobOrIsCrossBorder !== null && jobOrIsCrossBorder !== undefined) {
      const flow = this.getStatusFlow(jobOrIsCrossBorder);
      const found = flow.find(s => s.id === statusIdOrKey || s.key === statusIdOrKey);
      if (found) return found;
    }
    // Search domestic flow first
    const domFlow = this.getStatusFlow(false);
    const domFound = domFlow.find(s => s.id === statusIdOrKey || s.key === statusIdOrKey);
    if (domFound) return domFound;
    // Fallback to cross-border flow
    const cbFlow = this.getStatusFlow(true);
    return cbFlow.find(s => s.id === statusIdOrKey || s.key === statusIdOrKey);
  }

  isJobCompleted(job) {
    if (!job) return false;
    if (job.currentStatusKey === "completed") return true;
    return job.isCrossBorder ? job.currentStatusId >= 8 : job.currentStatusId >= 7;
  }

  // KPIs
  getKPIs() {
    const vehicles = this.getVehicles();
    const jobs = this.getJobs();
    const drivers = this.getDrivers();

    const runningVehicles = vehicles.filter(v => v.status === "running").length;
    const restingVehicles = vehicles.filter(v => v.status === "resting").length;
    const idleVehicles = vehicles.filter(v => v.status === "idle" || v.status === "ready").length;
    const offlineVehicles = vehicles.filter(v => v.status === "maintenance" || v.status === "offline").length;

    const activeJobs = jobs.filter(j => !this.isJobCompleted(j)).length;
    const completedJobs = jobs.filter(j => this.isJobCompleted(j)).length;

    return {
      totalVehicles: vehicles.length,
      runningVehicles,
      restingVehicles,
      idleVehicles,
      offlineVehicles,
      totalDrivers: drivers.length,
      onDutyDrivers: drivers.filter(d => d.status === "on_duty").length,
      readyDrivers: drivers.filter(d => d.status === "ready").length,
      activeJobs,
      completedJobs,
      totalJobs: jobs.length
    };
  }

  // Job Operations
  updateJobStatus(jobId, newStatusId, note = "", actor = "ระบบ") {
    const job = this.getJob(jobId);
    if (!job) return false;

    const statusObj = this.getStatusMeta(newStatusId, job);
    if (!statusObj) return false;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    job.currentStatusId = newStatusId;
    job.currentStatusKey = statusObj.key;

    if (!job.timeline) job.timeline = [];
    job.timeline.push({
      statusId: newStatusId,
      name: statusObj.name,
      time: timeStr,
      note: note || `เปลี่ยนสถานะเป็น ${statusObj.name}`,
      by: actor
    });

    // Update vehicle status accordingly
    if (job.vehicleId) {
      const v = this.getVehicle(job.vehicleId);
      if (v) {
        if (statusObj.key === "in_transit") {
          v.status = "running";
          v.speed = Math.floor(Math.random() * 20) + 65;
        } else if (statusObj.key === "border_customs") {
          v.status = "resting";
          v.speed = 0;
        } else if (statusObj.key === "delivered") {
          v.status = "resting";
          v.speed = 0;
        } else if (statusObj.key === "completed") {
          v.status = "ready";
          v.speed = 0;
        }
      }
    }

    this.saveState();
    return true;
  }

  addJob(jobData) {
    const jobs = this.getJobs();
    const newId = `JN-${String(jobs.length + 1).padStart(3, "0")}`;
    const newCode = `JN-2026-${String(jobs.length + 1).padStart(3, "0")}`;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const isCrossBorder = Boolean(
      jobData.isCrossBorder ||
      jobData.transportType === "cross_border" ||
      jobData.dropoffLocId === "LOC-007"
    );

    const newJob = {
      id: newId,
      code: newCode,
      ...jobData,
      isCrossBorder,
      transportType: isCrossBorder ? "cross_border" : "domestic",
      currentStatusId: jobData.currentStatusId || 1,
      currentStatusKey: jobData.currentStatusKey || "pending",
      timeline: [
        {
          statusId: 1,
          name: "รอรับงาน",
          time: timeStr,
          note: jobData.note || (isCrossBorder ? "สร้างใบงานใหม่เข้าระบบ (ขนส่งข้ามแดน)" : "สร้างใบงานใหม่เข้าระบบ"),
          by: "Admin Dispatcher"
        }
      ]
    };

    if (isCrossBorder) {
      newJob.customsPermitNo = jobData.customsPermitNo || `CB-THKH-2026/${String(Math.floor(Math.random() * 9000) + 1000)}`;
      newJob.customsDeclarationNo = jobData.customsDeclarationNo || `กศก.120-${String(Math.floor(Math.random() * 900000) + 100000)}`;
      newJob.customsCheckpoint = "ด่านศุลกากรอรัญประเทศ (สะพานมิตรภาพไทย-กัมพูชา)";
      newJob.destinationCountry = "ราชอาณาจักรกัมพูชา";
      newJob.documentsChecklist = [
        { name: "ใบอนุญาตขนส่งสินค้าอันตรายข้ามแดน (Cross-Border DG Permit)", status: "approved", docNo: newJob.customsPermitNo },
        { name: "ใบขนสินค้าขาออก กศก.120 พร้อมชำระภาษี", status: "approved", docNo: newJob.customsDeclarationNo },
        { name: "หนังสือเดินทางคนขับ (Passport) & ใบขับขี่ ท.4", status: "verified", docNo: "PASSPORT-TH" },
        { name: "ซีลล็อกวาล์วถังก๊าซศุลกากร (Customs Tamper Seal)", status: "inspected", docNo: `SEAL-${Math.floor(Math.random()*8000+1000)}` }
      ];
    }

    if (newJob.vehicleId) {
      const v = this.getVehicle(newJob.vehicleId);
      if (v) v.status = "assigned";
    }

    this.state.jobs.unshift(newJob);
    this.saveState();
    return newJob;
  }

  addVehicle(vehicleData) {
    const vehicles = this.getVehicles();
    const newId = `V-${String(vehicles.length + 1).padStart(2, "0")}`;
    const newV = {
      id: newId,
      ...vehicleData,
      lat: vehicleData.lat || 13.3611,
      lng: vehicleData.lng || 100.9847,
      speed: 0,
      fuelLevel: 100,
      lastUpdate: "เพิ่งเพิ่ม"
    };
    this.state.vehicles.push(newV);
    this.saveState();
    return newV;
  }

  addDriver(driverData) {
    const drivers = this.getDrivers();
    const newId = `D-${String(drivers.length + 1).padStart(2, "0")}`;
    const newD = {
      id: newId,
      ...driverData,
      status: driverData.status || "ready"
    };
    this.state.drivers.push(newD);
    this.saveState();
    return newD;
  }

  addLocation(locationData) {
    const locs = this.getLocations();
    const newId = `LOC-${String(locs.length + 1).padStart(3, "0")}`;
    const newLoc = {
      id: newId,
      ...locationData
    };
    this.state.locations.push(newLoc);
    this.saveState();
    return newLoc;
  }

  addCustomer(customerData) {
    const custs = this.getCustomers();
    const newId = `CUS-${String(custs.length + 1).padStart(3, "0")}`;
    const newC = {
      id: newId,
      ...customerData
    };
    this.state.customers.push(newC);
    this.saveState();
    return newC;
  }
}

// Global instance
window.store = new AppStore();
