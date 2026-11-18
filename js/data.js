/**
 * NextRoute Logistics - Master Initial Data
 * Based on Real NWT Fleet & Project Specifications
 * Case Study: บริษัท เน็คท์รูท โลจิสติกส์ จำกัด (NextRoute Logistics Co., Ltd.)
 */

// Helper to generate realistic mock proof photos as SVG data URIs
function buildEvidenceSvg({ category = "fuel", title = "รูปถ่ายหลักฐาน", detail = "", plate = "ชบ.74-0549", coords = "13.1412, 101.1684", time = "17 พ.ย. 2569 12:10 น.", badge = "หลักฐาน", stamp = "VERIFIED" }) {
  const themes = {
    fuel: { color: "#0284c7", icon: "⛽", bgGrad: ["#082f49", "#0f172a"], badgeBg: "#0284c7", stampColor: "#38bdf8" },
    customs: { color: "#9333ea", icon: "🌐", bgGrad: ["#3b0764", "#0f172a"], badgeBg: "#7e22ce", stampColor: "#c084fc" },
    seal: { color: "#e11d48", icon: "🔒", bgGrad: ["#4c0519", "#0f172a"], badgeBg: "#be123c", stampColor: "#fb7185" },
    inspection: { color: "#d97706", icon: "🛡️", bgGrad: ["#451a03", "#0f172a"], badgeBg: "#b45309", stampColor: "#fcd34d" },
    delivery: { color: "#059669", icon: "📝", bgGrad: ["#022c22", "#0f172a"], badgeBg: "#047857", stampColor: "#34d399" },
    other: { color: "#475569", icon: "📷", bgGrad: ["#1e293b", "#0f172a"], badgeBg: "#334155", stampColor: "#94a3b8" }
  };
  const t = themes[category] || themes.other;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <defs>
      <linearGradient id="bg-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t.bgGrad[0]}"/>
        <stop offset="100%" stop-color="${t.bgGrad[1]}"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="640" height="420" fill="url(#bg-${category})"/>
    <rect width="640" height="420" fill="url(#grid)"/>

    <!-- Viewfinder Corners -->
    <path d="M 30 50 L 30 30 L 50 30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 610 50 L 610 30 L 590 30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 30 310 L 30 330 L 50 330" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <path d="M 610 310 L 610 330 L 590 330" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>

    <!-- Category Header Badge -->
    <rect x="35" y="35" width="230" height="32" rx="8" fill="${t.badgeBg}"/>
    <text x="45" y="56" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">${t.icon} ${badge}</text>

    <!-- Center Graphics & Visual Info Box -->
    <rect x="35" y="85" width="570" height="235" rx="14" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <circle cx="95" cy="150" r="35" fill="${t.badgeBg}" opacity="0.25"/>
    <text x="95" y="165" fill="#ffffff" font-size="36" text-anchor="middle">${t.icon}</text>

    <text x="150" y="140" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">${title}</text>
    <text x="150" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">${detail}</text>

    <line x1="60" y1="210" x2="580" y2="210" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Metric Tags inside visual card -->
    <rect x="60" y="230" width="150" height="60" rx="8" fill="rgba(0,0,0,0.3)"/>
    <text x="75" y="252" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" font-weight="bold">ทะเบียนรถ</text>
    <text x="75" y="275" fill="#ffffff" font-family="monospace" font-size="15" font-weight="bold">${plate}</text>

    <rect x="225" y="230" width="180" height="60" rx="8" fill="rgba(0,0,0,0.3)"/>
    <text x="240" y="252" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" font-weight="bold">พิกัด GPS ณ จุดบันทึก</text>
    <text x="240" y="275" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">${coords}</text>

    <!-- Stamp in center card -->
    <g transform="translate(430, 230) rotate(-5)">
      <rect x="0" y="0" width="145" height="58" rx="6" fill="none" stroke="${t.stampColor}" stroke-width="2.5" stroke-dasharray="6,3"/>
      <text x="72" y="26" fill="${t.stampColor}" font-family="system-ui, sans-serif" font-size="11" font-weight="900" text-anchor="middle">OFFICIAL AUDIT</text>
      <text x="72" y="46" fill="${t.stampColor}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${stamp}</text>
    </g>

    <!-- Bottom Camera Watermark Bar (Real-world security metadata) -->
    <rect x="0" y="340" width="640" height="80" fill="rgba(0,0,0,0.85)"/>
    <line x1="0" y1="340" x2="640" y2="340" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <circle cx="25" cy="365" r="4" fill="#22c55e"/>
    <text x="35" y="369" fill="#e2e8f0" font-family="monospace" font-size="11" font-weight="bold">NEXTROUTE SMART EVIDENCE • GPS WATERMARKED</text>
    <text x="25" y="392" fill="#94a3b8" font-family="monospace" font-size="10">TIME: ${time} | COORDS: [${coords}] | TRUCK: ${plate}</text>
    <text x="25" y="408" fill="#64748b" font-family="monospace" font-size="9">TAMPER-PROOF AUDIT LOG: VERIFIED SECURE</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

if (typeof window !== "undefined") {
  window.buildEvidenceSvg = buildEvidenceSvg;
}

const DEFAULT_DATA = {
  company: {
    name: "บริษัท เน็คท์รูท โลจิสติกส์ จำกัด",
    nameEn: "NextRoute Logistics Co., Ltd.",
    slogan: "Smart Route, Smart Delivery",
    foundedDate: "2020-06-26",
    address: "99/12 หมู่ 3 ต.ดอนหัวฬ่อ อ.เมืองชลบุรี จ.ชลบุรี 20000",
    phone: "038-123-456",
    safetyRestPolicy: "ขับรถติดต่อกัน 4 ชั่วโมง ต้องหยุดพักรถไม่น้อยกว่า 30 นาที",
    gpsProvider: "NWT Tracking System (Cloud Run)",
    nwtMemberId: "668ecf8127ebf79f22f0a802"
  },

  // 7 สถานะหลักสำหรับงานขนส่งภายในประเทศ (Domestic Flow - 7 ขั้นตอน)
  domesticStatusFlow: [
    { id: 1, key: "pending", name: "รอรับงาน", icon: "clipboard-list", color: "blue", desc: "สร้างใบงานเข้าระบบ รอจัดรอบ" },
    { id: 2, key: "assigned", name: "ลงคิวคนขับ", icon: "user-check", color: "purple", desc: "มอบหมายรถและคนขับเรียบร้อย" },
    { id: 3, key: "inspected", name: "ตรวจสภาพรถ", icon: "wrench", color: "amber", desc: "ตรวจเช็กลิสต์ความปลอดภัยก่อนออก" },
    { id: 4, key: "loaded", name: "รับสินค้า", icon: "package", color: "emerald", desc: "โหลดผลิตภัณฑ์น้ำมัน/แก๊สที่คลังต้นทาง" },
    { id: 5, key: "in_transit", name: "ออกเดินทาง", icon: "truck", color: "indigo", desc: "รถกำลังมุ่งหน้าสู่จุดส่งสินค้า" },
    { id: 6, key: "delivered", name: "ส่งสินค้า", icon: "map-pin", color: "rose", desc: "ถึงจุดส่งและถ่ายเทน้ำมัน/แก๊ส" },
    { id: 7, key: "completed", name: "เสร็จสิ้น", icon: "check-circle", color: "teal", desc: "ยืนยันส่งงานเรียบร้อย บันทึกประวัติ" }
  ],

  // 8 สถานะสำหรับงานขนส่งสินค้าข้ามแดน/นอกประเทศ (Cross-Border Flow - เพิ่มขั้นตอนส่งเอกสารข้ามแดน)
  crossBorderStatusFlow: [
    { id: 1, key: "pending", name: "รอรับงาน", icon: "clipboard-list", color: "blue", desc: "สร้างใบงานเข้าระบบ รอจัดรอบ" },
    { id: 2, key: "assigned", name: "ลงคิวคนขับ", icon: "user-check", color: "purple", desc: "มอบหมายรถและคนขับพร้อมพาสปอร์ต" },
    { id: 3, key: "inspected", name: "ตรวจสภาพรถ", icon: "wrench", color: "amber", desc: "ตรวจเช็กลิสต์ความปลอดภัยและซีลสากล" },
    { id: 4, key: "loaded", name: "รับสินค้า", icon: "package", color: "emerald", desc: "โหลดผลิตภัณฑ์และปิดผนึกซีลศุลกากร" },
    { id: 5, key: "in_transit", name: "ออกเดินทาง", icon: "truck", color: "indigo", desc: "รถมุ่งหน้าสู่ด่านพรมแดนชายแดน" },
    { id: 6, key: "border_customs", name: "ส่งเอกสารข้ามแดน", icon: "globe", color: "purple", desc: "ยื่นใบขออนุญาตขนส่งข้ามแดนและตรวจศุลกากร" },
    { id: 7, key: "delivered", name: "ส่งสินค้า", icon: "map-pin", color: "rose", desc: "ถึงจุดส่งต่างประเทศและถ่ายเทสินค้า" },
    { id: 8, key: "completed", name: "เสร็จสิ้น", icon: "check-circle", color: "teal", desc: "ยืนยันส่งงานเรียบร้อย บันทึกประวัติ" }
  ],

  // สถานะเริ่มต้น (Default)
  statusFlow: [
    { id: 1, key: "pending", name: "รอรับงาน", icon: "clipboard-list", color: "blue", desc: "สร้างใบงานเข้าระบบ รอจัดรอบ" },
    { id: 2, key: "assigned", name: "ลงคิวคนขับ", icon: "user-check", color: "purple", desc: "มอบหมายรถและคนขับเรียบร้อย" },
    { id: 3, key: "inspected", name: "ตรวจสภาพรถ", icon: "wrench", color: "amber", desc: "ตรวจเช็กลิสต์ความปลอดภัยก่อนออก" },
    { id: 4, key: "loaded", name: "รับสินค้า", icon: "package", color: "emerald", desc: "โหลดผลิตภัณฑ์น้ำมัน/แก๊สที่คลังต้นทาง" },
    { id: 5, key: "in_transit", name: "ออกเดินทาง", icon: "truck", color: "indigo", desc: "รถกำลังมุ่งหน้าสู่จุดส่งสินค้า" },
    { id: 6, key: "delivered", name: "ส่งสินค้า", icon: "map-pin", color: "rose", desc: "ถึงจุดส่งและถ่ายเทน้ำมัน/แก๊ส" },
    { id: 7, key: "completed", name: "เสร็จสิ้น", icon: "check-circle", color: "teal", desc: "ยืนยันส่งงานเรียบร้อย บันทึกประวัติ" }
  ],

  // 14 รถบรรทุกจริงของบริษัท เน็คท์รูท โลจิสติกส์ จำกัด (ดึงจากระบบ GPS NWT จริง)
  vehicles: [
    { id: "V-01", plate: "ชบ.73-8910", rawPlate: "73-8910", imei: "868998039188715", dltUnitId: "2020001000NEXTROUTE00738910", brand: "Scania", model: "P360 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-01", driverName: "นายประสิทธิ์ น้ำนาค", status: "resting", lat: 13.20835, lng: 100.99995, speed: 0, fuelLevel: 82, odometerKm: 175635, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-02", plate: "ชบ.73-8912", rawPlate: "73-8912", imei: "868998039178344", dltUnitId: "2020001000NEXTROUTE00738912", brand: "Scania", model: "P360 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-02", driverName: "นายรัญญา พงษ์วัน", status: "resting", lat: 13.20838, lng: 100.99979, speed: 0, fuelLevel: 90, odometerKm: 182749, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-03", plate: "ชบ.73-8914", rawPlate: "73-8914", imei: "868998039186016", dltUnitId: "2020001000NEXTROUTE00738914", brand: "Scania", model: "P360 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-03", driverName: "นายจินดา พิชวนชม", status: "running", lat: 17.85670, lng: 102.73093, speed: 6, fuelLevel: 68, odometerKm: 170647, address: "ต.มีชัย อ.เมืองหนองคาย จ.หนองคาย", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-04", plate: "ชบ.73-8947", rawPlate: "73-8947", imei: "864352043378298", dltUnitId: "2020001000NEXTROUTE00738947", brand: "Scania", model: "P360 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-04", driverName: "นายกิตถโรจน์ ปัญญาธิป", status: "resting", lat: 13.20819, lng: 100.99988, speed: 0, fuelLevel: 65, odometerKm: 178990, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-05", plate: "ชบ.73-8949", rawPlate: "73-8949", imei: "864606049303976", dltUnitId: "2020001000NEXTROUTE00738949", brand: "Scania", model: "P360 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-05", driverName: "นายอนงค์ ผิวคำ", status: "resting", lat: 13.20815, lng: 100.99995, speed: 0, fuelLevel: 85, odometerKm: 88376, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-06", plate: "ชบ.74-0547", rawPlate: "74-0547", imei: "864606049612517", dltUnitId: "2020001000NEXTROUTE00740547", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-06", driverName: "นายชำนาญ จุลวรรณ", status: "resting", lat: 13.20811, lng: 101.00029, speed: 0, fuelLevel: 72, odometerKm: 206671, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-07", plate: "ชบ.74-0549", rawPlate: "74-0549", imei: "868998039186446", dltUnitId: "2020001000NEXTROUTE00740549", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-07", driverName: "นายสุเทพ โพธิ์ศรี", status: "running", lat: 13.14125, lng: 101.16842, speed: 73, fuelLevel: 77, odometerKm: 201200, address: "ต.คลองกิ่ว อ.บ้านบึง จ.ชลบุรี", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-08", plate: "ชบ.74-0551", rawPlate: "74-0551", imei: "868998039172834", dltUnitId: "2020001000NEXTROUTE00740551", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-08", driverName: "นายธวัชชัย อุเทศ", status: "resting", lat: 13.20840, lng: 101.00012, speed: 0, fuelLevel: 80, odometerKm: 207812, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-09", plate: "ชบ.74-0553", rawPlate: "74-0553", imei: "864606049623514", dltUnitId: "2020001000NEXTROUTE00740553", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-09", driverName: "นายสมคิด แสงสร้อย", status: "idle", lat: 13.20830, lng: 101.00000, speed: 0, fuelLevel: 80, odometerKm: 180000, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-10", plate: "ชบ.74-0553 (สำรอง)", rawPlate: "74-0553", imei: "864606049603482", dltUnitId: "2020001000NEXTROUTE00740553", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-10", driverName: "สำรอง / ประจำศูนย์", status: "resting", lat: 13.20835, lng: 100.99996, speed: 0, fuelLevel: 75, odometerKm: 100808, address: "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-11", plate: "ชบ.74-0556", rawPlate: "74-0556", imei: "864606049305211", dltUnitId: "2020001000NEXTROUTE00740556", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-11", driverName: "นายน้อม กะปรัม", status: "running", lat: 17.69574, lng: 102.78182, speed: 76, fuelLevel: 81, odometerKm: 169154, address: "ต.สระใคร อ.สระใคร จ.หนองคาย", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-12", plate: "ชบ.74-1586", rawPlate: "74-1586", imei: "864606049327504", dltUnitId: "2020001000NEXTROUTE00741586", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-12", driverName: "นายประทีป อินทาโนะ", status: "idle", lat: 17.85709, lng: 102.73072, speed: 0, fuelLevel: 74, odometerKm: 188046, address: "ต.มีชัย อ.เมืองหนองคาย จ.หนองคาย", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-13", plate: "ชบ.74-1748", rawPlate: "74-1748", imei: "864606049621807", dltUnitId: "2020001000NEXTROUTE00741748", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-13", driverName: "นายอานนท์ อุ่นกะสัง", status: "resting", lat: 17.85703, lng: 102.73071, speed: 0, fuelLevel: 64, odometerKm: 192128, address: "ต.มีชัย อ.เมืองหนองคาย จ.หนองคาย", lastUpdate: "สดจากดาวเทียม NWT" },
    { id: "V-14", plate: "ชบ.74-1750", rawPlate: "74-1750", imei: "864606049333155", dltUnitId: "2020001000NEXTROUTE00741750", brand: "Volvo", model: "FM370 (10 ล้อหัวลาก)", type: "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)", capacity: "32,000 ลิตร", driverId: "D-14", driverName: "นายจิรพัฒน์ สงนอก", status: "running", lat: 13.75866, lng: 101.50829, speed: 74, fuelLevel: 87, odometerKm: 242333, address: "ต.เขาหินซ้อน อ.พนมสารคาม จ.ฉะเชิงเทรา", lastUpdate: "สดจากดาวเทียม NWT" }
  ],

  // 14 คนขับรถตัวจริงของบริษัท เน็คท์รูท โลจิสติกส์ จำกัด
  drivers: [
    { id: "D-01", name: "นายประสิทธิ์ น้ำนาค", phone: "081-987-1001", licenseNo: "ท4-60703-35", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 9, status: "ready", vehiclePlate: "ชบ.73-8910" },
    { id: "D-02", name: "นายรัญญา พงษ์วัน", phone: "081-987-1002", licenseNo: "ท4-30301-12", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 8, status: "ready", vehiclePlate: "ชบ.73-8912" },
    { id: "D-03", name: "นายจินดา พิชวนชม", phone: "081-987-1003", licenseNo: "ท4-40200-140", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 10, status: "on_duty", vehiclePlate: "ชบ.73-8914" },
    { id: "D-04", name: "นายกิตถโรจน์ ปัญญาธิป", phone: "081-987-1004", licenseNo: "ท4-20303-278", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 7, status: "ready", vehiclePlate: "ชบ.73-8947" },
    { id: "D-05", name: "นายอนงค์ ผิวคำ", phone: "081-987-1005", licenseNo: "ท4-20300-519", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 6, status: "ready", vehiclePlate: "ชบ.73-8949" },
    { id: "D-06", name: "นายชำนาญ จุลวรรณ", phone: "081-987-1006", licenseNo: "ท4-10400-247", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 11, status: "ready", vehiclePlate: "ชบ.74-0547" },
    { id: "D-07", name: "นายสุเทพ โพธิ์ศรี", phone: "081-987-1007", licenseNo: "ท4-20303-84", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 12, status: "on_duty", vehiclePlate: "ชบ.74-0549" },
    { id: "D-08", name: "นายธวัชชัย อุเทศ", phone: "081-987-1008", licenseNo: "ท4-20303-365", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 8, status: "ready", vehiclePlate: "ชบ.74-0551" },
    { id: "D-09", name: "นายสมคิด แสงสร้อย", phone: "081-987-1009", licenseNo: "ท4-20300-109", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 9, status: "ready", vehiclePlate: "ชบ.74-0553" },
    { id: "D-10", name: "สำรอง / ประจำศูนย์", phone: "081-987-1010", licenseNo: "ท4-20300-110", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 5, status: "ready", vehiclePlate: "ชบ.74-0553" },
    { id: "D-11", name: "นายน้อม กะปรัม", phone: "081-987-1011", licenseNo: "ท4-20300-647", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 10, status: "on_duty", vehiclePlate: "ชบ.74-0556" },
    { id: "D-12", name: "นายประทีป อินทาโนะ", phone: "081-987-1012", licenseNo: "ท4-20303-506", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 9, status: "ready", vehiclePlate: "ชบ.74-1586" },
    { id: "D-13", name: "นายอานนท์ อุ่นกะสัง", phone: "081-987-1013", licenseNo: "ท4-30504-76", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 7, status: "ready", vehiclePlate: "ชบ.74-1748" },
    { id: "D-14", name: "นายจิรพัฒน์ สงนอก", phone: "081-987-1014", licenseNo: "ท4-20300-674", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 11, status: "on_duty", vehiclePlate: "ชบ.74-1750" }
  ],

  // คลังและสถานที่รับ-ส่งสินค้าจริงตาม NWT Places
  locations: [
    { id: "LOC-001", code: "IRPC", name: "คลังน้ำมัน - IRPC (มาบตาพุด)", province: "ระยอง", type: "pickup", lat: 12.7185, lng: 101.1685, contact: "038-683-111" },
    { id: "LOC-002", code: "TH_OIL", name: "คลังน้ำมัน - TH OIL (ไทยออยล์ ศรีราชา)", province: "ชลบุรี", type: "pickup", lat: 13.1182, lng: 100.9174, contact: "038-408-500" },
    { id: "LOC-003", code: "NRL_HQ", name: "ลานจอดศูนย์ เน็คท์รูท โลจิสติกส์ (NRL)", province: "ชลบุรี", type: "depot", lat: 13.2083, lng: 101.0000, contact: "038-123-456" },
    { id: "LOC-004", code: "PTT_GC", name: "คลังน้ำมัน - PTT GC (มาบตาพุด)", province: "ระยอง", type: "pickup", lat: 12.6950, lng: 101.1450, contact: "038-975-000" },
    { id: "LOC-005", code: "PRACHIN", name: "ตรงชั่งปราจีน (ศรีมหาโพธิ)", province: "ปราจีนบุรี", type: "dropoff", lat: 13.8620, lng: 101.5550, contact: "037-210-999" },
    { id: "LOC-006", code: "MAESOT", name: "แม่สอดโกมิตร (ตาก - ข้ามแดน)", province: "ตาก", type: "cross_border", lat: 16.7167, lng: 98.5667, contact: "055-531-222" },
    { id: "LOC-007", code: "NONGKHAI", name: "ด่านสะพานมิตรภาพไทย-ลาว (หนองคาย)", province: "หนองคาย", type: "cross_border", lat: 17.8785, lng: 102.7155, contact: "042-420-244" },
    { id: "LOC-008", code: "LUMLUKKA", name: "คลังน้ำมันลำลูกกา (ปตท.)", province: "ปทุมธานี", type: "dropoff", lat: 13.9312, lng: 100.7456, contact: "02-531-2244" }
  ],

  // ข้อมูลลูกค้า
  customers: [
    { id: "CUS-001", code: "OR_PTT", name: "บมจ. ปตท. น้ำมันและการค้าปลีก (OR)", phone: "02-196-5999", email: "logistics@pttor.com", address: "555/2 ถ.วิภาวดีรังสิต จตุจักร กทม." },
    { id: "CUS-002", code: "BCP", name: "บมจ. บางจาก คอร์ปอเรชั่น", phone: "02-335-4999", email: "transport@bangchak.co.th", address: "2098 อาคารเอ็ม ทาวเวอร์ สุขุมวิท พระโขนง กทม." },
    { id: "CUS-003", code: "SIAMGAS", name: "บมจ. สยามแก๊ส แอนด์ ปิโตรเคมีคัลส์", phone: "02-120-9999", email: "fleet@siamgas.com", address: "553 อาคารเดอะ พาลาเดียม ราชปรารภ กทม." },
    { id: "CUS-004", code: "SHELL", name: "บริษัท เชลล์แห่งประเทศไทย จำกัด", phone: "02-262-6000", email: "ops@shell.co.th", address: "10 ถ.คลองเตย พระราม 4 กทม." },
    { id: "CUS-005", code: "LAOS_EXP", name: "บจก. ลาว ปิโตรเลียม เทรดดิ้ง (ส่งออก สปป.ลาว)", phone: "+856-21-998-888", email: "trade@laospetro.la", address: "ด่านสะพานมิตรภาพไทย-ลาว หนองคาย" }
  ],

  // รายการใบงานขนส่งจริง (Jobs) เชื่อมต่อกองรถจริง 14 คัน
  jobs: [
    {
      id: "JN-000",
      code: "JN-2026-C01",
      customerId: "CUS-005", // บจก. ลาว ปิโตรเลียม เทรดดิ้ง (ส่งออก สปป.ลาว)
      isCrossBorder: true,
      transportType: "cross_border",
      productType: "ก๊าซ LPG ข้ามแดน",
      productQty: "18 ตัน",
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-007", // ด่านสะพานมิตรภาพไทย-ลาว (หนองคาย)
      vehicleId: "V-11", // ชบ.74-0556 (นายน้อม กะปรัม)
      driverId: "D-11",
      departureDate: "2026-11-16",
      departureTime: "06:00",
      estimatedDurationHours: 5.5,
      eta: "2026-11-16 11:30",
      currentStatusId: 8, // เสร็จสมบูรณ์ / กลับถึงศูนย์ (completed)
      currentStatusKey: "completed",
      routeDistanceKm: 245,
      returnToCompany: true,
      hasRestStop: true,
      restCount: 1,
      restDurationMinutes: 30,
      customsPermitNo: "CB-THLA-2026/0488",
      customsDeclarationNo: "กศก.120-690180",
      customsCheckpoint: "ด่านศุลกากรสะพานมิตรภาพไทย-ลาว (หนองคาย)",
      destinationCountry: "สาธารณรัฐประชาธิปไตยประชาชนลาว (Lao PDR)",
      driverPassport: "PASSPORT-TH-AA99218 (ท.4 สากล)",
      customsSealNo: "SEAL-CUSTOMS-8790",
      documentsChecklist: [
        { name: "ใบอนุญาตขนส่งสินค้าอันตรายข้ามแดน (Cross-Border DG Permit)", status: "approved", docNo: "CB-THLA-2026/0488" },
        { name: "ใบขนสินค้าขาออก กศก.120 พร้อมชำระภาษี", status: "approved", docNo: "กศก.120-690180" },
        { name: "หนังสือเดินทางคนขับ (Passport) & ใบขับขี่ ท.4", status: "verified", docNo: "PASSPORT-TH-AA99218" },
        { name: "ซีลล็อกวาล์วถังก๊าซศุลกากร (Customs Tamper Seal)", status: "inspected", docNo: "SEAL-CUSTOMS-8790" }
      ],
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "05:00", note: "สร้างงานส่งออกก๊าซ LPG ข้ามแดน สปป.ลาว", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "05:15", note: "มอบหมาย ชบ.74-0556 (นายน้อม กะปรัม)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "05:40", note: "ตรวจเช็กสภาพหัวลากและวาล์วถังก๊าซ ผ่าน", by: "นายน้อม กะปรัม" },
        { statusId: 4, name: "รับสินค้า", time: "06:30", note: "โหลดก๊าซ LPG 18 ตัน ปิดซีลศุลกากร", by: "โรงกลั่นไทยออยล์" },
        { statusId: 5, name: "ด่านศุลกากร", time: "09:30", note: "ผ่านพิธีการศุลกากรด่านหนองคาย ตรวจซีลเรียบร้อย", by: "เจ้าหน้าที่ศุลกากร" },
        { statusId: 6, name: "ออกเดินทาง", time: "10:00", note: "ข้ามสะพานมิตรภาพสู่ฝั่งเวียงจันทน์", by: "นายน้อม กะปรัม" },
        { statusId: 7, name: "ส่งมอบสินค้า", time: "11:30", note: "ถ่ายเทก๊าซเข้าคลังปลายทาง ลูกค้าลงนาม e-POD สำเร็จ", by: "บจก. ลาว ปิโตรเลียม เทรดดิ้ง" },
        { statusId: 8, name: "เสร็จสมบูรณ์", time: "14:00", note: "ตีรถกลับถึงศูนย์ชลบุรี ตรวจสอบมิเตอร์และส่งเอกสารครบถ้วน", by: "Admin Dispatcher" }
      ]
    },
    {
      id: "JN-001",
      code: "JN-2026-001",
      customerId: "CUS-001",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "น้ำมันดีเซล B7",
      productQty: "32,000 ลิตร",
      pickupLocId: "LOC-001",
      dropoffLocId: "LOC-002",
      vehicleId: "V-07", // ชบ.74-0549 (นายสุเทพ โพธิ์ศรี) วิ่งจริงบ้านบึง ชลบุรี
      driverId: "D-07",
      departureDate: "2026-11-17",
      departureTime: "08:15",
      estimatedDurationHours: 2.25,
      eta: "2026-11-17 10:30",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 85,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "07:30", note: "สร้างใบงานจากคำสั่งซื้อ OR-9921", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "07:45", note: "มอบหมาย ชบ.74-0549 (นายสุเทพ โพธิ์ศรี)", by: "Admin Dispatcher" },
        {
          statusId: 3,
          name: "ตรวจสภาพรถ",
          time: "08:00",
          note: "ตรวจแรงดันลมยาง 110 PSI, ซีลถัง, อุปกรณ์ดับเพลิง ผ่าน 100%",
          by: "นายสุเทพ โพธิ์ศรี (คนขับ)",
          photos: [
            {
              id: "P-001-1",
              category: "inspection",
              caption: "ตรวจเช็กลิสต์ความปลอดภัยก่อนออกรถ",
              url: buildEvidenceSvg({
                category: "inspection",
                title: "ตรวจสภาพรถก่อนออกเดินทาง",
                detail: "ตรวจแรงดันลมยาง 110 PSI, ซีลถัง และอุปกรณ์ดับเพลิง ผ่าน",
                plate: "ชบ.74-0549",
                coords: "13.2083, 101.0000",
                time: "17 พ.ย. 2569 08:00 น.",
                badge: "ตรวจสภาพรถ",
                stamp: "INSPECTED"
              }),
              timestamp: "08:00 น.",
              by: "นายสุเทพ โพธิ์ศรี"
            }
          ]
        },
        {
          statusId: 4,
          name: "รับสินค้า",
          time: "08:45",
          note: "โหลดน้ำมันดีเซล B7 ครบ 32,000 ลิตร ที่คลังมาบตาพุด วัดอุณหภูมิ 29°C",
          by: "คลังมาบตาพุด / นายสุเทพ",
          photos: [
            {
              id: "P-001-2",
              category: "fuel",
              caption: "ภาพมาตรวัดหัวจ่ายโหลดน้ำมันดีเซล B7 ครบ 32,000 ลิตร",
              url: buildEvidenceSvg({
                category: "fuel",
                title: "มาตรวัดหัวจ่ายโหลดน้ำมันดีเซล B7",
                detail: "คลังมาบตาพุด หัวจ่ายเบย์ 4 - ยอดโหลด 32,000 ลิตร อุณหภูมิ 29°C",
                plate: "ชบ.74-0549",
                coords: "12.7185, 101.1685",
                time: "17 พ.ย. 2569 08:45 น.",
                badge: "เติมน้ำมัน / โหลดสินค้า",
                stamp: "LOADED 32KL"
              }),
              timestamp: "08:45 น.",
              by: "คลังมาบตาพุด"
            }
          ]
        },
        { statusId: 5, name: "ออกเดินทาง", time: "09:00", note: "ออกจากคลังมุ่งหน้าศรีราชา ความเร็ว 73 กม./ชม. (NWT GPS Live)", by: "GPS Auto Tracker" }
      ]
    },
    {
      id: "JN-002",
      code: "JN-2026-002",
      customerId: "CUS-003",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "ก๊าซปิโตรเลียมเหลว LPG",
      productQty: "15 ตัน",
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-005",
      vehicleId: "V-14", // ชบ.74-1750 (นายจิรพัฒน์ สงนอก) วิ่งจริงพนมสารคาม-ปราจีนบุรี
      driverId: "D-14",
      departureDate: "2026-11-17",
      departureTime: "09:00",
      estimatedDurationHours: 2.5,
      eta: "2026-11-17 11:30",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 110,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "08:00", note: "คำสั่งซื้อ SG-8812", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "08:15", note: "มอบหมาย ชบ.74-1750 (นายจิรพัฒน์)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "08:35", note: "เช็กลิสต์ความปลอดภัยแก๊สแรงดันสูง ผ่าน", by: "นายจิรพัฒน์ สงนอก" },
        { statusId: 4, name: "รับสินค้า", time: "09:15", note: "โหลดก๊าซ LPG เสร็จสิ้น ออกใบกำกับการขนส่ง", by: "โรงกลั่นไทยออยล์" },
        { statusId: 5, name: "ออกเดินทาง", time: "09:30", note: "มุ่งหน้าตรงชั่งปราจีนบุรี ความเร็ว 74 กม./ชม. (NWT GPS Live)", by: "GPS Auto Tracker" }
      ]
    },
    {
      id: "JN-003",
      code: "JN-2026-003",
      customerId: "CUS-002",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "น้ำมันแก๊สโซฮอล์ 95",
      productQty: "30,000 ลิตร",
      pickupLocId: "LOC-004",
      dropoffLocId: "LOC-008",
      vehicleId: "V-01", // ชบ.73-8910 (นายประสิทธิ์ น้ำนาค)
      driverId: "D-01",
      departureDate: "2026-11-17",
      departureTime: "09:45",
      estimatedDurationHours: 2.0,
      eta: "2026-11-17 12:00",
      currentStatusId: 4, // รับสินค้า (loaded)
      currentStatusKey: "loaded",
      routeDistanceKm: 85,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "08:30", note: "ใบสั่งซื้อ BCP-4401", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "09:00", note: "มอบหมาย ชบ.73-8910 (นายประสิทธิ์)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "09:40", note: "ตรวจสภาพรถและอุปกรณ์ป้องกันภัยส่วนบุคคล ผ่าน", by: "นายประสิทธิ์ น้ำนาค" },
        { statusId: 4, name: "รับสินค้า", time: "10:15", note: "โหลดแก๊สโซฮอล์ 95 ที่คลัง PTT GC เสร็จสมบูรณ์", by: "คลัง PTT GC" }
      ]
    },
    {
      id: "JN-004",
      code: "JN-2026-004",
      customerId: "CUS-001",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "น้ำมันดีเซลพรีเมียม",
      productQty: "34,000 ลิตร",
      pickupLocId: "LOC-001",
      dropoffLocId: "LOC-002",
      vehicleId: "V-02", // ชบ.73-8912 (นายรัญญา พงษ์วัน)
      driverId: "D-02",
      departureDate: "2026-11-17",
      departureTime: "10:30",
      estimatedDurationHours: 3.0,
      eta: "2026-11-17 13:30",
      currentStatusId: 3, // ตรวจสภาพรถ (inspected)
      currentStatusKey: "inspected",
      routeDistanceKm: 135,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "09:10", note: "ใบสั่งซื้อ OR-9925", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "09:30", note: "มอบหมาย ชบ.73-8912 (นายรัญญา)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "10:00", note: "ตรวจเช็กลิสต์ความปลอดภัย 10 ล้อ ผ่าน", by: "นายรัญญา พงษ์วัน" }
      ]
    },
    {
      id: "JN-005",
      code: "JN-2026-005",
      customerId: "CUS-005", // บจก. ลาว ปิโตรเลียม เทรดดิ้ง (ส่งออก สปป.ลาว)
      isCrossBorder: true,
      transportType: "cross_border",
      productType: "ก๊าซ LPG ข้ามแดน",
      productQty: "18 ตัน",
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-007", // ด่านสะพานมิตรภาพไทย-ลาว (หนองคาย)
      vehicleId: "V-11", // ชบ.74-0556 (นายน้อม กะปรัม) วิ่งจริงอุดร-หนองคาย
      driverId: "D-11",
      departureDate: "2026-11-17",
      departureTime: "07:00",
      estimatedDurationHours: 4.5,
      eta: "2026-11-17 12:00",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 245,
      returnToCompany: true,
      hasRestStop: true,
      restDurationMinutes: 30,
      customsPermitNo: "CB-THLA-2026/0491",
      customsDeclarationNo: "กศก.120-690214",
      customsCheckpoint: "ด่านศุลกากรสะพานมิตรภาพไทย-ลาว (หนองคาย)",
      destinationCountry: "สาธารณรัฐประชาธิปไตยประชาชนลาว (Lao PDR)",
      driverPassport: "PASSPORT-TH-AA99218 (ท.4 สากล)",
      customsSealNo: "SEAL-CUSTOMS-8821",
      documentsChecklist: [
        { name: "ใบอนุญาตขนส่งสินค้าอันตรายข้ามแดน (Cross-Border DG Permit)", status: "approved", docNo: "CB-THLA-2026/0491" },
        { name: "ใบขนสินค้าขาออก กศก.120 พร้อมชำระภาษี", status: "approved", docNo: "กศก.120-690214" },
        { name: "หนังสือเดินทางคนขับ (Passport) & ใบขับขี่ ท.4", status: "verified", docNo: "PASSPORT-TH-AA99218" },
        { name: "ซีลล็อกวาล์วถังก๊าซศุลกากร (Customs Tamper Seal)", status: "inspected", docNo: "SEAL-CUSTOMS-8821" }
      ],
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "06:30", note: "สร้างใบงานขนส่งส่งออกข้ามแดน สปป.ลาว", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "06:45", note: "มอบหมาย ชบ.74-0556 (นายน้อม กะปรัม มี Passport & ท.4)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "07:00", note: "ตรวจสภาพรถ วาล์วถังก๊าซ และเช็กอุปกรณ์ความปลอดภัยสากล ผ่าน", by: "นายน้อม กะปรัม" },
        {
          statusId: 4,
          name: "รับสินค้า",
          time: "07:45",
          note: "โหลดก๊าซ LPG ข้ามแดน 18 ตัน ปิดผนึกซีลศุลกากรเรียบร้อย",
          by: "โรงกลั่นไทยออยล์",
          photos: [
            {
              id: "P-005-1",
              category: "seal",
              caption: "ภาพซีลล็อกวาล์วถังก๊าซนิรภัย SEAL-CUSTOMS-8821",
              url: buildEvidenceSvg({
                category: "seal",
                title: "ตรวจซีลล็อกวาล์วถังนิรภัย SEAL-8821",
                detail: "ปิดผนึกวาล์วขนถ่ายสินค้าอันตรายข้ามแดนเรียบร้อย ไม่มีการดัดแปลง",
                plate: "ชบ.74-0556",
                coords: "17.6957, 102.7818",
                time: "17 พ.ย. 2569 07:45 น.",
                badge: "ซีลล็อกนิรภัย",
                stamp: "SEALED 8821"
              }),
              timestamp: "07:45 น.",
              by: "โรงกลั่นไทยออยล์"
            }
          ]
        },
        { statusId: 5, name: "ออกเดินทาง", time: "08:15", note: "มุ่งหน้าด่านสะพานมิตรภาพหนองคาย ความเร็ว 76 กม./ชม. (NWT GPS Live)", by: "GPS Auto Tracker" }
      ]
    },
    {
      id: "JN-006",
      code: "JN-2026-006",
      customerId: "CUS-004",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "น้ำมันดีเซล B10",
      productQty: "32,000 ลิตร",
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-008",
      vehicleId: "V-06", // ชบ.74-0547 (นายชำนาญ จุลวรรณ)
      driverId: "D-06",
      departureDate: "2026-11-17",
      departureTime: "06:00",
      estimatedDurationHours: 3.5,
      eta: "2026-11-17 09:30",
      currentStatusId: 7, // เสร็จสิ้น (completed)
      currentStatusKey: "completed",
      routeDistanceKm: 180,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "05:00", note: "สร้างใบงาน", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "05:15", note: "มอบหมาย ชบ.74-0547 (นายชำนาญ)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "05:30", note: "ผ่าน", by: "นายชำนาญ จุลวรรณ" },
        { statusId: 4, name: "รับสินค้า", time: "06:15", note: "โหลดน้ำมันเสร็จสิ้น", by: "โรงกลั่นศรีราชา" },
        { statusId: 5, name: "ออกเดินทาง", time: "06:30", note: "มุ่งหน้าลำลูกกา", by: "GPS Auto Tracker" },
        {
          statusId: 6,
          name: "ส่งสินค้า",
          time: "09:45",
          note: "ถ่ายเทน้ำมันที่คลังลำลูกกาเรียบร้อย",
          by: "นายชำนาญ จุลวรรณ",
          photos: [
            {
              id: "P-006-1",
              category: "fuel",
              caption: "ภาพถ่ายเทน้ำมันดีเซล B10 เข้าแท็งก์คลังลำลูกกา",
              url: buildEvidenceSvg({
                category: "fuel",
                title: "การถ่ายเทน้ำมันเข้าคลังลำลูกกา",
                detail: "ต่อสายลงถังจ่ายใต้ดินคลังลำลูกกา วัดปริมาณตรงตามเอกสาร 32,000 ลิตร",
                plate: "ชบ.74-0547",
                coords: "13.9312, 100.7456",
                time: "17 พ.ย. 2569 09:45 น.",
                badge: "ถ่ายเทสินค้า",
                stamp: "DISCHARGED"
              }),
              timestamp: "09:45 น.",
              by: "นายชำนาญ จุลวรรณ"
            }
          ]
        },
        {
          statusId: 7,
          name: "เสร็จสิ้น",
          time: "10:15",
          note: "ส่งเอกสารใบกำกับและใบส่งมอบงานแล้ว",
          by: "Admin Dispatcher",
          photos: [
            {
              id: "P-006-2",
              category: "delivery",
              caption: "ใบส่งมอบสินค้า (POD) พร้อมลายเซ็นผู้รับสินค้า",
              url: buildEvidenceSvg({
                category: "delivery",
                title: "ใบส่งมอบสินค้า (POD - Proof of Delivery)",
                detail: "เอกสารใบกำกับและส่งมอบน้ำมัน 32,000 ลิตร ผู้จัดการคลังลงนามรับมอบเรียบร้อย",
                plate: "ชบ.74-0547",
                coords: "13.9312, 100.7456",
                time: "17 พ.ย. 2569 10:15 น.",
                badge: "ใบส่งมอบสินค้า (POD)",
                stamp: "SIGNED & CLOSED"
              }),
              timestamp: "10:15 น.",
              by: "Admin Dispatcher"
            }
          ]
        }
      ]
    },
    {
      id: "JN-007",
      code: "JN-2026-007",
      customerId: "CUS-001",
      isCrossBorder: false,
      transportType: "domestic",
      productType: "น้ำมันดีเซล B7",
      productQty: "35,000 ลิตร",
      pickupLocId: "LOC-001",
      dropoffLocId: "LOC-005",
      vehicleId: "V-03", // ชบ.73-8914 (นายจินดา พิชวนชม)
      driverId: "D-03",
      departureDate: "2026-11-17",
      departureTime: "05:30",
      estimatedDurationHours: 7.5,
      eta: "2026-11-17 14:00",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 460,
      returnToCompany: true,
      hasRestStop: true,
      restCount: 2,
      restDurationMinutes: 60,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "04:30", note: "สร้างงานระยะไกล มุ่งหน้าหนองคาย", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "04:45", note: "มอบหมาย ชบ.73-8914 (นายจินดา)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "05:00", note: "เช็กลิสต์ระยะไกล 100%", by: "นายจินดา พิชวนชม" },
        { statusId: 4, name: "รับสินค้า", time: "05:40", note: "โหลดน้ำมันดีเซล B7 เต็มความจุ", by: "คลังมาบตาพุด" },
        { statusId: 5, name: "ออกเดินทาง", time: "06:00", note: "ออกเดินทาง วิ่งเส้นทางสาย 304 ผ่านเขาใหญ่ สู่ภาคอีสาน", by: "GPS Auto Tracker" }
      ]
    }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.DEFAULT_DATA = DEFAULT_DATA;
}