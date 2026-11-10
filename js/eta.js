/**
 * NextRoute Logistics - ETA & Safety Rest Calculation Engine
 * Complies with Heavy Vehicle Safety Regulations:
 * "ขับรถติดต่อกัน 4 ชั่วโมง ต้องหยุดพักรถไม่น้อยกว่า 30 นาที"
 */

const ETAEngine = {
  // Haversine formula for distance in km
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    // Factor in actual road winding curvature in Thailand (approx 1.28x straight line)
    return Math.round(straightDist * 1.28);
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },

  /**
   * Parse YYYY-MM-DD and HH:mm strings into a Date object
   */
  parseDateTime(dateStr, timeStr) {
    if (dateStr && timeStr) {
      const parsed = new Date(`${dateStr}T${timeStr}:00`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  },

  formatThaiDateTime(d) {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const yr = d.getFullYear() + 543;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${mon}/${yr} ${hh}:${mm} น.`;
  },

  formatIsoDateTime(d) {
    const yr = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${yr}-${mon}-${day} ${hh}:${mm}`;
  },

  /**
   * Drive a single leg, inserting safety rest stops whenever continuous driving reaches restIntervalHours
   */
  _simulateDrivingLeg(state, legDistKm, legAvgSpeed, restIntervalMins, restDurationMins, startCumulativeDist) {
    const totalLegMins = Math.round((legDistKm / legAvgSpeed) * 60);
    let drivenInLegMins = 0;

    while (drivenInLegMins < totalLegMins) {
      const minsUntilRest = restIntervalMins - state.continuousDriveMins;
      const remainingLegMins = totalLegMins - drivenInLegMins;

      if (remainingLegMins >= minsUntilRest && minsUntilRest > 0) {
        // Drive up to the 4-hour mark, then take mandatory safety rest
        state.curTime = new Date(state.curTime.getTime() + minsUntilRest * 60000);
        drivenInLegMins += minsUntilRest;
        state.continuousDriveMins = 0;
        state.restStopsCount += 1;

        const progressRatio = drivenInLegMins / Math.max(1, totalLegMins);
        state.milestones.push({
          step: state.milestones.length + 1,
          title: `จุดพักรถตามกฎความปลอดภัย ครั้งที่ ${state.restStopsCount} (พัก ${restDurationMins} นาที)`,
          location: "จุดพักรถทางหลวง / ปั๊มน้ำมันมาตรฐาน",
          type: "safety_rest",
          distanceKm: startCumulativeDist + Math.round(legDistKm * progressRatio),
          time: this.formatThaiDateTime(state.curTime),
          note: `ขับต่อเนื่องครบ ${restIntervalMins / 60} ชม. ตามกฎความปลอดภัย หยุดพัก ${restDurationMins} นาที`
        });

        state.curTime = new Date(state.curTime.getTime() + restDurationMins * 60000);
      } else {
        // Finish remaining leg without hitting another 4h mark
        state.curTime = new Date(state.curTime.getTime() + remainingLegMins * 60000);
        state.continuousDriveMins += remainingLegMins;
        drivenInLegMins += remainingLegMins;
      }
    }
  },

  /**
   * Calculate complete trip details with rest stops & optional cross-border customs clearance
   * @param {Object} options
   */
  calculateTrip(options) {
    const {
      pickupLoc,
      dropoffLoc,
      depotLoc,
      returnToCompany = true,
      isCrossBorder = false,
      avgSpeed = 65,
      restIntervalHours = 4.0,
      restDurationMinutes = 30,
      departureDateTime = new Date()
    } = options;

    if (!pickupLoc || !dropoffLoc) {
      return null;
    }

    const startDateTime = new Date(departureDateTime);

    // Leg 1: Depot to Pickup
    const distDepotToPickup = depotLoc
      ? this.calculateDistance(depotLoc.lat, depotLoc.lng, pickupLoc.lat, pickupLoc.lng)
      : 0;

    // Leg 2: Pickup to Dropoff (Main delivery leg)
    const distPickupToDropoff = this.calculateDistance(pickupLoc.lat, pickupLoc.lng, dropoffLoc.lat, dropoffLoc.lng);

    // Leg 3: Dropoff to Depot (Return leg)
    const distDropoffToDepot = (returnToCompany && depotLoc)
      ? this.calculateDistance(dropoffLoc.lat, dropoffLoc.lng, depotLoc.lat, depotLoc.lng)
      : 0;

    const totalDistance = distDepotToPickup + distPickupToDropoff + distDropoffToDepot;
    const rawDrivingHours = totalDistance / avgSpeed;

    const loadingTimeMins = 45;
    const unloadingTimeMins = 45;
    const borderClearanceMins = isCrossBorder ? 45 : 0;
    const restIntervalMins = Math.round(restIntervalHours * 60);

    const simState = {
      curTime: new Date(startDateTime),
      continuousDriveMins: 0,
      restStopsCount: 0,
      milestones: []
    };

    // 1. Depart Depot
    if (depotLoc && distDepotToPickup > 0) {
      simState.milestones.push({
        step: 1,
        title: "ออกจากบริษัท (จุดเริ่มต้น)",
        location: depotLoc.name,
        type: "depart_depot",
        distanceKm: 0,
        time: this.formatThaiDateTime(simState.curTime),
        note: isCrossBorder
          ? "ตรวจสภาพรถ ซีล และเอกสารขออนุญาตข้ามแดนเรียบร้อย"
          : "ตรวจสภาพรถและเอกสารขนส่งวัตถุอันตรายเรียบร้อย"
      });

      this._simulateDrivingLeg(simState, distDepotToPickup, avgSpeed, restIntervalMins, restDurationMinutes, 0);
    }

    // 2. Arrive & Load at Pickup
    simState.milestones.push({
      step: simState.milestones.length + 1,
      title: "จุดรับสินค้า (โหลดผลิตภัณฑ์)",
      location: pickupLoc.name,
      type: "pickup",
      distanceKm: distDepotToPickup,
      time: this.formatThaiDateTime(simState.curTime),
      note: `เข้าจุดโหลดสินค้า (เวลาโหลดประมาณ ${loadingTimeMins} นาที)`
    });

    simState.curTime = new Date(simState.curTime.getTime() + loadingTimeMins * 60000);
    // Station stop >= 30 mins resets continuous driving counter
    simState.continuousDriveMins = 0;

    // Drive Delivery Leg
    this._simulateDrivingLeg(simState, distPickupToDropoff, avgSpeed, restIntervalMins, restDurationMinutes, distDepotToPickup);

    // Optional Cross-Border Checkpoint Step
    if (isCrossBorder) {
      simState.milestones.push({
        step: simState.milestones.length + 1,
        title: "ส่งเอกสารข้ามแดน (ด่านศุลกากร)",
        location: dropoffLoc.name,
        type: "border_customs",
        distanceKm: distDepotToPickup + distPickupToDropoff,
        time: this.formatThaiDateTime(simState.curTime),
        note: `ยื่นใบขออนุญาตขนส่งข้ามแดน กศก.120 และตรวจซีลศุลกากร (ประมาณ ${borderClearanceMins} นาที)`
      });
      simState.curTime = new Date(simState.curTime.getTime() + borderClearanceMins * 60000);
      simState.continuousDriveMins = 0;
    }

    // 3. Arrive & Unload at Dropoff (ETA Delivery)
    const etaDeliveryTime = new Date(simState.curTime);
    simState.milestones.push({
      step: simState.milestones.length + 1,
      title: "จุดส่งสินค้า (ETA ถึงปลายทาง)",
      location: isCrossBorder ? "ปลายทางต่างประเทศ (หลังผ่านด่าน)" : dropoffLoc.name,
      type: "dropoff",
      distanceKm: distDepotToPickup + distPickupToDropoff,
      time: this.formatThaiDateTime(simState.curTime),
      note: `ถึงปลายทาง ถ่ายเทผลิตภัณฑ์ (ประมาณ ${unloadingTimeMins} นาที)`
    });

    simState.curTime = new Date(simState.curTime.getTime() + unloadingTimeMins * 60000);
    simState.continuousDriveMins = 0;

    // 4. Return to Depot
    if (returnToCompany && depotLoc) {
      this._simulateDrivingLeg(simState, distDropoffToDepot, avgSpeed, restIntervalMins, restDurationMinutes, distDepotToPickup + distPickupToDropoff);

      simState.milestones.push({
        step: simState.milestones.length + 1,
        title: "เดินทางกลับถึงบริษัท",
        location: depotLoc.name,
        type: "return_depot",
        distanceKm: totalDistance,
        time: this.formatThaiDateTime(simState.curTime),
        note: "เข้าสำนักงานใหญ่ ส่งเอกสารและปิดรอบงาน"
      });
    }

    const totalTripMinutes = Math.round((simState.curTime.getTime() - startDateTime.getTime()) / 60000);
    const totalTripHours = (totalTripMinutes / 60).toFixed(1);
    const totalRestMinutes = simState.restStopsCount * restDurationMinutes;

    return {
      totalDistanceKm: totalDistance,
      deliveryDistanceKm: distPickupToDropoff,
      rawDrivingHours: rawDrivingHours.toFixed(1),
      totalTripHours,
      restStopsCount: simState.restStopsCount,
      totalRestMinutes,
      etaDelivery: this.formatThaiDateTime(etaDeliveryTime),
      etaDeliveryIso: this.formatIsoDateTime(etaDeliveryTime),
      etaReturn: (returnToCompany && depotLoc) ? this.formatThaiDateTime(simState.curTime) : "-",
      etaReturnIso: (returnToCompany && depotLoc) ? this.formatIsoDateTime(simState.curTime) : "-",
      milestones: simState.milestones
    };
  },

  /**
   * Build complete trip plan directly from a Job object using window.store
   */
  getJobTripPlan(job) {
    if (!job || !window.store) return null;
    const pickupLoc = window.store.getLocation(job.pickupLocId);
    const dropoffLoc = window.store.getLocation(job.dropoffLocId);
    const depotLoc = window.store.getLocation("LOC-003");
    if (!pickupLoc || !dropoffLoc) return null;

    const depDT = this.parseDateTime(job.departureDate, job.departureTime);
    return this.calculateTrip({
      pickupLoc,
      dropoffLoc,
      depotLoc,
      returnToCompany: job.returnToCompany !== false,
      isCrossBorder: Boolean(job.isCrossBorder),
      avgSpeed: 65,
      restIntervalHours: 4.0,
      restDurationMinutes: 30,
      departureDateTime: depDT
    });
  },

  /**
   * Estimate live remaining distance and dynamic ETA based on vehicle GPS coordinates & speed
   */
  estimateLiveVehicleStatus(vehicle, job, dropoffLoc) {
    if (!vehicle || !job || !dropoffLoc) return null;
    if (window.store && window.store.isJobCompleted(job)) {
      return {
        remainingDistKm: 0,
        remainingMins: 0,
        remainingText: "ถึงปลายทางแล้ว",
        liveEtaTimeOnly: "-",
        needsRest: false
      };
    }

    const remainingDistKm = this.calculateDistance(vehicle.lat, vehicle.lng, dropoffLoc.lat, dropoffLoc.lng);
    const effectiveSpeed = vehicle.speed > 5 ? vehicle.speed : 65;
    const drivingHours = remainingDistKm / effectiveSpeed;
    const extraRestCount = Math.floor(drivingHours / 4.0);
    const totalRemainingMins = Math.max(5, Math.round(drivingHours * 60 + extraRestCount * 30));

    const hrs = Math.floor(totalRemainingMins / 60);
    const mins = totalRemainingMins % 60;
    const remainingText = hrs > 0 ? `${hrs} ชม. ${mins} น.` : `${mins} นาที`;

    const etaDate = new Date(Date.now() + totalRemainingMins * 60000);
    const liveEtaTimeOnly = `${String(etaDate.getHours()).padStart(2, "0")}:${String(etaDate.getMinutes()).padStart(2, "0")} น.`;

    return {
      remainingDistKm,
      remainingMins: totalRemainingMins,
      remainingText,
      liveEtaTimeOnly,
      needsRest: extraRestCount > 0 || Boolean(job.hasRestStop)
    };
  }
};

if (typeof window !== "undefined") {
  window.ETAEngine = ETAEngine;
}
