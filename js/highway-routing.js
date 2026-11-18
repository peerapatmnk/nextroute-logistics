/**
 * NextRoute Logistics - Real-World Highway Routing Engine (Offline & Google Maps Styled)
 * Provides realistic road geometries along Thailand's primary national highways (ทล.7, ทล.9, ทล.1, ทล.2 มิตรภาพ, ทล.304, ทล.36)
 * Prevents straight-line routing across mountains and supports direct Google Maps deep-links.
 */

(function (window) {
  "use strict";

  // Pre-calculated high-fidelity road geometries (Lat, Lng) along major logistics corridors
  const HIGHWAY_GEOMETRIES = {
    // -------------------------------------------------------------------------
    // CORRIDOR 1: ชลบุรี (ไทยออยล์ ศรีราชา) -> หนองคาย (ด่านสะพานมิตรภาพไทย-ลาว)
    // เส้นทาง: ทล.7 มอเตอร์เวย์ -> ทล.9 วงแหวนตะวันออก -> ทล.1 สระบุรี -> ทล.2 ถนนมิตรภาพ (โคราช-ขอนแก่น-อุดรธานี-หนองคาย)
    // -------------------------------------------------------------------------
    "LOC-002_TO_LOC-007": [
      [13.1182, 100.9174], // คลังน้ำมันไทยออยล์ ศรีราชา
      [13.1620, 100.9350], // ทางแยกอ่าวอุดม / ทล.3 สุขุมวิท
      [13.2120, 100.9650], // ทางต่างระดับบางพระ เข้าสู่ ทล.7 มอเตอร์เวย์
      [13.2850, 100.9950], // มอเตอร์เวย์ ทล.7 ผ่านบางแสน
      [13.3450, 101.0050], // ต่างระดับเลี่ยงเมืองชลบุรี (ทล.7)
      [13.4350, 101.0150], // ด่านพานทอง มอเตอร์เวย์ ทล.7
      [13.5250, 101.0050], // ข้ามแม่น้ำบางปะกง มอเตอร์เวย์ ทล.7
      [13.6350, 100.8950], // มอเตอร์เวย์ ทล.7 บางเสาธง
      [13.7280, 100.7720], // ต่างระดับร่มเกล้า / ลาดกระบัง
      [13.7650, 100.7050], // ต่างระดับทับช้าง เข้าสู่ ทล.9 วงแหวนกาญจนาภิเษกฝั่งตะวันออก
      [13.8250, 100.6800], // ทล.9 รามอินทรา / แฟชั่นไอส์แลนด์
      [13.9150, 100.6900], // ทล.9 คลองสามวา / ลำลูกกา
      [14.0150, 100.6850], // ทล.9 รังสิต-นครนายก (ธัญบุรี)
      [14.1250, 100.6350], // ทล.9 คลองหลวง
      [14.1680, 100.6150], // ต่างระดับบางปะอิน เข้าสู่ ทล.1 ถนนพหลโยธิน
      [14.2300, 100.7150], // ทล.1 วังน้อย พระนครศรีอยุธยา
      [14.3400, 100.8650], // ทล.1 หนองแค สระบุรี
      [14.4750, 100.9100], // ทล.1 เลี่ยงเมืองสระบุรี
      [14.5280, 100.9150], // สามแยกมิตรภาพ สระบุรี -> เลี้ยวขวาเข้าสู่ ทล.2 ถนนมิตรภาพ
      [14.5850, 101.0050], // ทล.2 แก่งคอย
      [14.6150, 101.0950], // ทล.2 ทับกวาง
      [14.6350, 101.1950], // ทล.2 มวกเหล็ก สระบุรี
      [14.6650, 101.3150], // ทล.2 กลางดง นครราชสีมา
      [14.7050, 101.4150], // ทล.2 ปากช่อง นครราชสีมา
      [14.7650, 101.4950], // ทล.2 หนองสาหร่าย
      [14.8250, 101.5550], // ทล.2 ริมเขื่อนลำตะคอง (แนวขนาน M6 มอเตอร์เวย์บางปะอิน-โคราช)
      [14.8750, 101.6250], // ทล.2 คลองไผ่
      [14.8950, 101.7150], // ทล.2 สีคิ้ว
      [14.9050, 101.8250], // ทล.2 สูงเนิน
      [14.9550, 101.9550], // ทล.2 ขามทะเลสอ
      [14.9850, 102.0450], // ทล.2 เลี่ยงเมืองนครราชสีมา (บายพาสโคราช)
      [15.0450, 102.1250], // ทล.2 แยกจอหอ นครราชสีมา
      [15.1750, 102.2600], // ทล.2 โนนสูง
      [15.2250, 102.3850], // ทล.2 ตลาดแค แยกพิมาย
      [15.3450, 102.4550], // ทล.2 คง
      [15.4250, 102.5150], // ทล.2 โนนแดง
      [15.5250, 102.5750], // ทล.2 สีดา
      [15.6550, 102.5850], // ทล.2 บัวใหญ่
      [15.8150, 102.5950], // ทล.2 เมืองพล ขอนแก่น
      [15.9650, 102.6650], // ทล.2 โนนศิลา
      [16.0550, 102.7300], // ทล.2 บ้านไผ่ ขอนแก่น
      [16.2050, 102.7650], // ทล.2 บ้านแฮด
      [16.3350, 102.7950], // ทล.2 ท่าพระ
      [16.4350, 102.8250], // ทล.2 เลี่ยงเมืองขอนแก่น (หน้า มข. / ขอนแก่นใจกลาง)
      [16.5450, 102.8350], // ทล.2 สำราญ
      [16.7050, 102.8450], // ทล.2 น้ำพอง ขอนแก่น
      [16.8550, 102.8650], // ทล.2 เขาสวนกวาง
      [16.9750, 102.8950], // ทล.2 โนนสะอาด อุดรธานี
      [17.1150, 102.9750], // ทล.2 กุมภวาปี
      [17.2000, 102.7900], // ทล.2 เขตอุดรธานีตอนใต้ (พิกัดปัจจุบันรถขนส่ง V-11 ชบ.74-0556)
      [17.3850, 102.8150], // ทล.2 วงแหวนรอบเมืองอุดรธานี
      [17.4350, 102.7950], // ทล.2 บายพาสอุดร-หนองคาย
      [17.5150, 102.7800], // ทล.2 นาข่า
      [17.6150, 102.7550], // ทล.2 สี่แยกเพ็ญ
      [17.7250, 102.7450], // ทล.2 สระใคร หนองคาย
      [17.8250, 102.7400], // ทล.2 สี่แยกหนองสองห้อง เข้าเมืองหนองคาย
      [17.8550, 102.7350], // ทล.2 ทางเลี่ยงเมืองหนองคาย
      [17.8785, 102.7155]  // ด่านสะพานมิตรภาพไทย-ลาว แห่งที่ 1 (หนองคาย)
    ],

    // -------------------------------------------------------------------------
    // CORRIDOR 2: ชลบุรี (ไทยออยล์ ศรีราชา) -> ลำลูกกา ปทุมธานี
    // เส้นทาง: ทล.7 มอเตอร์เวย์ -> ทล.9 วงแหวนตะวันออก -> ลำลูกกา
    // -------------------------------------------------------------------------
    "LOC-002_TO_LOC-008": [
      [13.1182, 100.9174], // ไทยออยล์ ศรีราชา
      [13.1620, 100.9350],
      [13.2120, 100.9650], // มอเตอร์เวย์ ทล.7 บางพระ
      [13.3450, 101.0050], // บายพาสชลบุรี
      [13.4350, 101.0150], // ด่านพานทอง
      [13.5250, 101.0050], // แม่น้ำบางปะกง
      [13.6350, 100.8950], // บางเสาธง
      [13.7280, 100.7720], // ต่างระดับร่มเกล้า
      [13.7650, 100.7050], // ต่างระดับทับช้าง เข้า ทล.9 วงแหวนกาญจนาภิเษก
      [13.8250, 100.6800], // ทล.9 แฟชั่นไอส์แลนด์
      [13.9150, 100.6900], // ทล.9 คลองสามวา
      [13.9312, 100.7456]  // คลังน้ำมันลำลูกกา (ปตท.)
    ],

    // -------------------------------------------------------------------------
    // CORRIDOR 3: ระยอง (มาบตาพุด IRPC / PTT GC) -> ชลบุรี (ไทยออยล์ ศรีราชา)
    // เส้นทาง: ทล.36 เลี่ยงเมืองชลบุรี-พัทยา-ระยอง -> ทล.7 มอเตอร์เวย์
    // -------------------------------------------------------------------------
    "LOC-001_TO_LOC-002": [
      [12.7185, 101.1685], // IRPC มาบตาพุด
      [12.7650, 101.1550], // ต่างระดับมาบตาพุด ทล.363
      [12.8250, 101.1250], // ทล.36 นิคมพัฒนา ระยอง
      [12.8750, 101.0850], // ทล.36 ปลวกแดง
      [12.9150, 101.0350], // ทล.36 เขาไม้แก้ว / พัทยา
      [12.9650, 100.9950], // ทล.36 โป่ง / สนามพีระเซอร์กิต
      [13.0650, 100.9450], // ต่างระดับแหลมฉบัง มอเตอร์เวย์ ทล.7
      [13.1182, 100.9174]  // ไทยออยล์ ศรีราชา
    ],
    "LOC-004_TO_LOC-002": [
      [12.6950, 101.1450], // PTT GC มาบตาพุด
      [12.7650, 101.1550],
      [12.8250, 101.1250],
      [12.9150, 101.0350],
      [12.9650, 100.9950],
      [13.0650, 100.9450],
      [13.1182, 100.9174]
    ],

    // -------------------------------------------------------------------------
    // CORRIDOR 4: ระยอง (IRPC / PTT GC) -> ปราจีนบุรี (ศรีมหาโพธิ)
    // เส้นทาง: ทล.36 -> ทล.331 สัตหีบ-พนมสารคาม -> ทล.304 เขาหินซ้อน-ศรีมหาโพธิ
    // -------------------------------------------------------------------------
    "LOC-001_TO_LOC-005": [
      [12.7185, 101.1685], // IRPC มาบตาพุด
      [12.8250, 101.1250], // ทล.36 นิคมพัฒนา
      [12.9150, 101.0350], // แยกมาบข่า
      [13.0450, 101.1050], // เข้าสู่ ทล.331 โบวิน ปลวกแดง
      [13.2550, 101.1650], // ทล.331 บ่อทอง ชลบุรี
      [13.4350, 101.2150], // ทล.331 เกาะจันทร์
      [13.5650, 101.2850], // ทล.331 แปลงยาว ฉะเชิงเทรา
      [13.7450, 101.3450], // แยกพนมสารคาม เข้าสู่ ทล.304
      [13.7950, 101.4450], // ทล.304 เขาหินซ้อน
      [13.8620, 101.5550]  // นิคมอุตสาหกรรมศรีมหาโพธิ ปราจีนบุรี
    ],
    "LOC-002_TO_LOC-005": [
      [13.1182, 100.9174], // ไทยออยล์ ศรีราชา
      [13.1650, 101.0250], // บ่อวิน ทล.331
      [13.3450, 101.1250], // สัตหีบ-พนมสารคาม
      [13.5650, 101.2850], // แปลงยาว ฉะเชิงเทรา
      [13.7450, 101.3450], // พนมสารคาม ทล.304
      [13.8620, 101.5550]  // ศรีมหาโพธิ ปราจีนบุรี
    ],

    // -------------------------------------------------------------------------
    // CORRIDOR 5: ระยอง (PTT GC) -> ลำลูกกา ปทุมธานี
    // เส้นทาง: ทล.36 -> ทล.7 มอเตอร์เวย์ -> ทล.9 วงแหวนตะวันออก -> ลำลูกกา
    // -------------------------------------------------------------------------
    "LOC-004_TO_LOC-008": [
      [12.6950, 101.1450], // PTT GC มาบตาพุด
      [12.8250, 101.1250], // ทล.36
      [12.9650, 100.9950], // พีระเซอร์กิต
      [13.0650, 100.9450], // แหลมฉบัง มอเตอร์เวย์ ทล.7
      [13.2120, 100.9650], // บางพระ
      [13.4350, 101.0150], // พานทอง
      [13.5650, 100.9850], // บางปะกง
      [13.7280, 100.7720], // ร่มเกล้า
      [13.7650, 100.7050], // ทล.9 ทับช้าง
      [13.8250, 100.6800], // รามอินทรา
      [13.9312, 100.7456]  // ลำลูกกา
    ],

    // -------------------------------------------------------------------------
    // CORRIDOR 6: ชลบุรี -> แม่สอด ตาก (ด่านข้ามแดน)
    // -------------------------------------------------------------------------
    "LOC-002_TO_LOC-006": [
      [13.1182, 100.9174],
      [13.4350, 101.0150],
      [13.7650, 100.7050],
      [14.1680, 100.6150], // บางปะอิน
      [14.7850, 100.6550], // ลพบุรี
      [15.2250, 100.3250], // ชัยนาท
      [15.7050, 100.1350], // นครสวรรค์
      [16.4850, 99.5250],  // กำแพงเพชร
      [16.8750, 99.1250],  // ตาก ทล.1
      [16.7167, 98.5667]   // ด่านแม่สอดโกมิตร ทล.12
    ]
  };

  /**
   * Distance between two lat/lng points in Euclidean approximation (sufficient for waypoint matching)
   */
  function distSq(p1, p2) {
    const dLat = p1[0] - p2[0];
    const dLng = p1[1] - p2[1];
    return dLat * dLat + dLng * dLng;
  }

  const HighwayRouting = {
    /**
     * Get the real-world highway waypoints array between two location IDs
     */
    getHighwayRoute(fromLocId, toLocId, fromCoord = null, toCoord = null) {
      if (!fromLocId || !toLocId) {
        if (fromCoord && toCoord) return [fromCoord, toCoord];
        return [];
      }

      // Check direct corridor
      const directKey = `${fromLocId}_TO_${toLocId}`;
      if (HIGHWAY_GEOMETRIES[directKey]) {
        return [...HIGHWAY_GEOMETRIES[directKey]];
      }

      // Check reverse corridor (reverse the coordinate list)
      const reverseKey = `${toLocId}_TO_${fromLocId}`;
      if (HIGHWAY_GEOMETRIES[reverseKey]) {
        return [...HIGHWAY_GEOMETRIES[reverseKey]].reverse();
      }

      // Fallback: If both coordinates provided, synthesize a smooth highway curve avoiding straight direct lines
      if (fromCoord && toCoord) {
        const midLat = (fromCoord[0] + toCoord[0]) / 2 + (fromCoord[1] < toCoord[1] ? 0.2 : -0.1);
        const midLng = (fromCoord[1] + toCoord[1]) / 2 + 0.15;
        return [fromCoord, [midLat, midLng], toCoord];
      }

      return [];
    },

    /**
     * Split a highway route polyline at the vehicle's current real-time GPS coordinate
     * Returns:
     *  - passed: Waypoints from start up to and including the current vehicle position
     *  - remaining: Waypoints from current vehicle position to destination
     *  - progressPct: Estimated completion percentage based on route indices
     */
    splitHighwayRouteAtVehicle(waypoints, vehicleLat, vehicleLng) {
      if (!waypoints || waypoints.length === 0) {
        return {
          passed: [[vehicleLat, vehicleLng]],
          remaining: [[vehicleLat, vehicleLng]],
          progressPct: 0
        };
      }

      if (waypoints.length === 1) {
        return {
          passed: [waypoints[0], [vehicleLat, vehicleLng]],
          remaining: [[vehicleLat, vehicleLng]],
          progressPct: 50
        };
      }

      const vPt = [vehicleLat, vehicleLng];

      // Find the closest waypoint along the highway path
      let minDistance = Infinity;
      let closestIdx = 0;

      for (let i = 0; i < waypoints.length; i++) {
        const d = distSq(waypoints[i], vPt);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = i;
        }
      }

      // Slice the path smoothly at the matched waypoint
      // Passed: Start -> closest waypoint -> current vehicle GPS
      const passed = waypoints.slice(0, closestIdx + 1);
      // Ensure current vehicle position is precisely included at the end
      if (distSq(passed[passed.length - 1], vPt) > 0.000001) {
        passed.push(vPt);
      }

      // Remaining: Current vehicle GPS -> next waypoints -> Destination
      const remaining = [vPt];
      for (let j = closestIdx + 1; j < waypoints.length; j++) {
        remaining.push(waypoints[j]);
      }

      // If already at or past the last waypoint
      if (remaining.length === 1 && waypoints.length > 0) {
        remaining.push(waypoints[waypoints.length - 1]);
      }

      const progressPct = Math.round((closestIdx / (waypoints.length - 1)) * 100);

      return {
        passed,
        remaining,
        progressPct: Math.min(99, Math.max(1, progressPct))
      };
    },

    /**
     * Generate standard Google Maps Directions URL
     * Opens real Google Maps app or browser navigation
     */
    getGoogleMapsDirectionsUrl(originCoord, destCoord, waypointCoord = null) {
      if (!originCoord || !destCoord) return "#";
      const o = `${originCoord[0]},${originCoord[1]}`;
      const d = `${destCoord[0]},${destCoord[1]}`;
      let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
      if (waypointCoord) {
        const wp = `${waypointCoord[0]},${waypointCoord[1]}`;
        url += `&waypoints=${encodeURIComponent(wp)}`;
      }
      return url;
    }
  };

  window.HighwayRouting = HighwayRouting;
})(window);
