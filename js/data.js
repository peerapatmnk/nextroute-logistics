/**
 * NextRoute Logistics - Master Initial Data
 * Based on Project Presentation & Specifications
 * Case Study: บริษัท เน็คท์รูท โลจิสติกส์ จำกัด
 */

const DEFAULT_DATA = {
  company: {
    name: "บริษัท เน็คท์รูท โลจิสติกส์ จำกัด",
    nameEn: "NextRoute Logistics Co., Ltd.",
    slogan: "Smart Route, Smart Delivery",
    foundedDate: "2020-06-26",
    address: "99/12 หมู่ 3 ต.ดอนหัวฬ่อ อ.เมืองชลบุรี จ.ชลบุรี 20000",
    phone: "038-123-456",
    safetyRestPolicy: "ขับรถติดต่อกัน 4 ชั่วโมง ต้องหยุดพักรถไม่น้อยกว่า 30 นาที"
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

  // 13 รถบรรทุกจริงตามสไลด์ (Volvo FM370 5 คัน, Scania P360 8 คัน)
  vehicles: [
    { id: "V-01", plate: "ชบ.73-8910", brand: "Volvo", model: "FM370", type: "น้ำมันและแก๊ส", capacity: "32,000 ลิตร", driverId: "D-01", status: "running", lat: 13.2541, lng: 100.9921, speed: 78, fuelLevel: 82, lastUpdate: "10 นาทีที่แล้ว" },
    { id: "V-02", plate: "ชบ.73-8911", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-06", status: "running", lat: 12.8942, lng: 101.1245, speed: 65, fuelLevel: 75, lastUpdate: "3 นาทีที่แล้ว" },
    { id: "V-03", plate: "ชบ.73-8912", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-07", status: "idle", lat: 13.1182, lng: 100.9174, speed: 0, fuelLevel: 90, lastUpdate: "25 นาทีที่แล้ว" },
    { id: "V-04", plate: "ชบ.73-8913", brand: "Volvo", model: "FM370", type: "น้ำมันและแก๊ส", capacity: "34,000 ลิตร", driverId: "D-08", status: "resting", lat: 13.5214, lng: 100.8241, speed: 0, fuelLevel: 68, lastUpdate: "12 นาทีที่แล้ว" },
    { id: "V-05", plate: "ชบ.73-8914", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "32,000 ลิตร", driverId: "D-09", status: "running", lat: 13.6210, lng: 101.8412, speed: 72, fuelLevel: 88, lastUpdate: "5 นาทีที่แล้ว" },
    { id: "V-06", plate: "ชบ.73-8915", brand: "Volvo", model: "FM370", type: "น้ำมันและแก๊ส", capacity: "32,000 ลิตร", driverId: "D-10", status: "running", lat: 14.1205, lng: 100.8920, speed: 80, fuelLevel: 70, lastUpdate: "8 นาทีที่แล้ว" },
    { id: "V-07", plate: "ชบ.73-8916", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "35,000 ลิตร", driverId: "D-12", status: "running", lat: 15.2104, lng: 101.9845, speed: 75, fuelLevel: 64, lastUpdate: "2 นาทีที่แล้ว" },
    { id: "V-08", plate: "ชบ.73-8917", brand: "Volvo", model: "FM370", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-02", status: "running", lat: 13.4120, lng: 100.9510, speed: 68, fuelLevel: 85, lastUpdate: "6 นาทีที่แล้ว" },
    { id: "V-09", plate: "ชบ.73-8918", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-11", status: "resting", lat: 14.3541, lng: 100.6210, speed: 0, fuelLevel: 55, lastUpdate: "18 นาทีที่แล้ว" },
    { id: "V-10", plate: "ชบ.73-8919", brand: "Volvo", model: "FM370", type: "น้ำมันและแก๊ส", capacity: "32,000 ลิตร", driverId: "D-03", status: "ready", lat: 13.3611, lng: 100.9847, speed: 0, fuelLevel: 98, lastUpdate: "1 ชั่วโมงที่แล้ว" },
    { id: "V-11", plate: "ชบ.73-8920", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "32,000 ลิตร", driverId: "D-04", status: "maintenance", lat: 13.3611, lng: 100.9847, speed: 0, fuelLevel: 45, lastUpdate: "3 ชั่วโมงที่แล้ว" },
    { id: "V-12", plate: "ชบ.73-8921", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-05", status: "ready", lat: 13.3611, lng: 100.9847, speed: 0, fuelLevel: 92, lastUpdate: "45 นาทีที่แล้ว" },
    { id: "V-13", plate: "ชบ.73-8922", brand: "Scania", model: "P360", type: "น้ำมันและแก๊ส", capacity: "30,000 ลิตร", driverId: "D-13", status: "offline", lat: 13.3611, lng: 100.9847, speed: 0, fuelLevel: 20, lastUpdate: "1 วันที่แล้ว" }
  ],

  // 13 คนขับประจำรถ
  drivers: [
    { id: "D-01", name: "นายสมชาย ใจดี", phone: "081-234-5678", licenseNo: "ท4-1002345", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 8, status: "on_duty", vehiclePlate: "ชบ.73-8910" },
    { id: "D-02", name: "นายกนกพล แสงจันทร์", phone: "081-345-6789", licenseNo: "ท4-1002346", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 6, status: "on_duty", vehiclePlate: "ชบ.73-8917" },
    { id: "D-03", name: "นายศราวุธ มั่นคง", phone: "081-456-7890", licenseNo: "ท4-1002347", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 10, status: "ready", vehiclePlate: "ชบ.73-8919" },
    { id: "D-04", name: "นายอัครเดช กิตติพงษ์", phone: "081-567-8901", licenseNo: "ท4-1002348", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 5, status: "leave", vehiclePlate: "ชบ.73-8920" },
    { id: "D-05", name: "นายวิทยา รัตนโชติ", phone: "081-678-9012", licenseNo: "ท4-1002349", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 7, status: "ready", vehiclePlate: "ชบ.73-8921" },
    { id: "D-06", name: "นายธีรพงษ์ ศรีนา", phone: "081-789-0123", licenseNo: "ท4-1002350", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 9, status: "on_duty", vehiclePlate: "ชบ.73-8911" },
    { id: "D-07", name: "นายธนวัฒน์ ศิริคำ", phone: "081-890-1234", licenseNo: "ท4-1002351", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 4, status: "on_duty", vehiclePlate: "ชบ.73-8912" },
    { id: "D-08", name: "นายชัยวัฒน์ แจ่มจันทร์", phone: "081-901-2345", licenseNo: "ท4-1002352", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 11, status: "on_duty", vehiclePlate: "ชบ.73-8913" },
    { id: "D-09", name: "นายกรกฏ พรหมมา", phone: "082-012-3456", licenseNo: "ท4-1002353", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 6, status: "on_duty", vehiclePlate: "ชบ.73-8914" },
    { id: "D-10", name: "นายอนุชา บุญส่ง", phone: "082-123-4567", licenseNo: "ท4-1002354", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 8, status: "on_duty", vehiclePlate: "ชบ.73-8915" },
    { id: "D-11", name: "นายวีรชัย สุขเกษม", phone: "082-234-5678", licenseNo: "ท4-1002355", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 5, status: "on_duty", vehiclePlate: "ชบ.73-8918" },
    { id: "D-12", name: "นายพิชัย มงคลดี", phone: "082-345-6789", licenseNo: "ท4-1002356", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 12, status: "on_duty", vehiclePlate: "ชบ.73-8916" },
    { id: "D-13", name: "นายสุริยา เจริญผล", phone: "082-456-7890", licenseNo: "ท4-1002357", licenseType: "ท.4 (วัตถุอันตราย)", expYears: 3, status: "offline", vehiclePlate: "ชบ.73-8922" }
  ],

  // คลังและสถานที่รับ-ส่งสินค้า
  locations: [
    { id: "LOC-001", code: "MAPTAPHUT", name: "คลังน้ำมันและปิโตรเคมีมาบตาพุด", province: "ระยอง", type: "pickup", lat: 12.7185, lng: 101.1685, contact: "038-683-111" },
    { id: "LOC-002", code: "SRIRACHA", name: "โรงกลั่นน้ำมันศรีราชา (ไทยออยล์)", province: "ชลบุรี", type: "pickup", lat: 13.1182, lng: 100.9174, contact: "038-408-500" },
    { id: "LOC-003", code: "HQ_CHONBURI", name: "สำนักงานใหญ่ เน็คท์รูท โลจิสติกส์", province: "ชลบุรี", type: "depot", lat: 13.3611, lng: 100.9847, contact: "038-123-456" },
    { id: "LOC-004", code: "LUMLUKKA", name: "คลังน้ำมันลำลูกกา (ปตท.)", province: "ปทุมธานี", type: "dropoff", lat: 13.9312, lng: 100.7456, contact: "02-531-2244" },
    { id: "LOC-005", code: "BANGPAKONG", name: "คลังแก๊สสยามแก๊ส บางปะกง", province: "ฉะเชิงเทรา", type: "dropoff", lat: 13.4833, lng: 100.9833, contact: "038-573-090" },
    { id: "LOC-006", code: "SARABURI", name: "คลังน้ำมันสระบุรี", province: "สระบุรี", type: "dropoff", lat: 14.5289, lng: 100.9108, contact: "036-211-555" },
    { id: "LOC-007", code: "ARANYAPRATHET", name: "ด่านศุลกากรอรัญประเทศ (ส่งออกข้ามแดน)", province: "สระแก้ว", type: "cross_border", lat: 13.6608, lng: 102.5097, contact: "037-231-200" },
    { id: "LOC-008", code: "KHONKAEN", name: "คลังน้ำมันขอนแก่น (ท่าพระ)", province: "ขอนแก่น", type: "dropoff", lat: 16.4419, lng: 102.8359, contact: "043-261-120" }
  ],

  // ข้อมูลลูกค้า
  customers: [
    { id: "CUS-001", code: "OR_PTT", name: "บมจ. ปตท. น้ำมันและการค้าปลีก (OR)", phone: "02-196-5999", email: "logistics@pttor.com", address: "555/2 ถ.วิภาวดีรังสิต จตุจักร กทม." },
    { id: "CUS-002", code: "BCP", name: "บมจ. บางจาก คอร์ปอเรชั่น", phone: "02-335-4999", email: "transport@bangchak.co.th", address: "2098 อาคารเอ็ม ทาวเวอร์ สุขุมวิท พระโขนง กทม." },
    { id: "CUS-003", code: "SIAMGAS", name: "บมจ. สยามแก๊ส แอนด์ ปิโตรเคมีคัลส์", phone: "02-120-9999", email: "fleet@siamgas.com", address: "553 อาคารเดอะ พาลาเดียม ราชปรารภ กทม." },
    { id: "CUS-004", code: "SHELL", name: "บริษัท เชลล์แห่งประเทศไทย จำกัด", phone: "02-262-6000", email: "ops@shell.co.th", address: "10 ถ.คลองเตย พระราม 4 กทม." },
    { id: "CUS-005", code: "CAMBODIA_EXP", name: "บจก. กัมพูชา ปิโตรเลียม เทรดดิ้ง (ข้ามแดน)", phone: "+855-23-888-999", email: "trade@cambodiapetro.kh", address: "ด่านอรัญประเทศ-ปอยเปต สระแก้ว" }
  ],

  // รายการใบงานขนส่ง (Jobs)
  jobs: [
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
      vehicleId: "V-01",
      driverId: "D-01",
      departureDate: "2026-11-10",
      departureTime: "08:15",
      estimatedDurationHours: 2.25,
      eta: "2026-11-10 10:30",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 85,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "07:30", note: "สร้างใบงานจากคำสั่งซื้อ OR-9921", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "07:45", note: "มอบหมาย ชบ.73-8910 (นายสมชาย)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "08:00", note: "ตรวจแรงดันลมยาง, ซีลถัง, อุปกรณ์ดับเพลิง ผ่าน", by: "นายสมชาย ใจดี" },
        { statusId: 4, name: "รับสินค้า", time: "08:45", note: "โหลดน้ำมันดีเซล B7 ครบ 32,000 ลิตร ที่คลังมาบตาพุด", by: "คลังมาบตาพุด" },
        { statusId: 5, name: "ออกเดินทาง", time: "09:00", note: "ออกจากคลังมุ่งหน้าศรีราชา ความเร็วเฉลี่ย 75 กม./ชม.", by: "GPS Auto Tracker" }
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
      pickupLocId: "LOC-001",
      dropoffLocId: "LOC-005",
      vehicleId: "V-02",
      driverId: "D-06",
      departureDate: "2026-11-10",
      departureTime: "09:00",
      estimatedDurationHours: 2.5,
      eta: "2026-11-10 11:30",
      currentStatusId: 4, // รับสินค้า (loaded)
      currentStatusKey: "loaded",
      routeDistanceKm: 110,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "08:00", note: "คำสั่งซื้อ SG-8812", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "08:15", note: "มอบหมาย ชบ.73-8911 (นายธีรพงษ์)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "08:35", note: "เช็กลิสต์ความปลอดภัยแก๊สแรงดันสูง ผ่าน", by: "นายธีรพงษ์ ศรีนา" },
        { statusId: 4, name: "รับสินค้า", time: "09:15", note: "โหลดก๊าซ LPG เสร็จสิ้น ออกใบกำกับการขนส่ง", by: "คลังมาบตาพุด" }
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
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-001",
      vehicleId: "V-03",
      driverId: "D-07",
      departureDate: "2026-11-10",
      departureTime: "09:45",
      estimatedDurationHours: 2.0,
      eta: "2026-11-10 12:00",
      currentStatusId: 3, // ตรวจสภาพรถ (inspected)
      currentStatusKey: "inspected",
      routeDistanceKm: 85,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "08:30", note: "ใบสั่งซื้อ BCP-4401", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "09:00", note: "มอบหมาย ชบ.73-8912 (นายธนวัฒน์)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "09:40", note: "กำลังตรวจสภาพรถและอุปกรณ์ป้องกันภัยส่วนบุคคล", by: "นายธนวัฒน์ ศิริคำ" }
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
      pickupLocId: "LOC-002",
      dropoffLocId: "LOC-004",
      vehicleId: "V-04",
      driverId: "D-08",
      departureDate: "2026-11-10",
      departureTime: "10:30",
      estimatedDurationHours: 3.0,
      eta: "2026-11-10 13:30",
      currentStatusId: 2, // ลงคิวคนขับ (assigned)
      currentStatusKey: "assigned",
      routeDistanceKm: 135,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "09:10", note: "ใบสั่งซื้อ OR-9925", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "09:30", note: "มอบหมาย ชบ.73-8913 (นายชัยวัฒน์)", by: "Admin Dispatcher" }
      ]
    },
    {
      id: "JN-005",
      code: "JN-2026-005",
      customerId: "CUS-005", // บจก. กัมพูชา ปิโตรเลียม เทรดดิ้ง (ข้ามแดน)
      isCrossBorder: true,
      transportType: "cross_border",
      productType: "ก๊าซ LPG ข้ามแดน",
      productQty: "18 ตัน",
      pickupLocId: "LOC-001",
      dropoffLocId: "LOC-007", // ด่านศุลกากรอรัญประเทศ (ส่งออกข้ามแดน)
      vehicleId: "V-05", // Scania P360 (ชบ.73-8914)
      driverId: "D-09", // นายกรกฏ พรหมมา
      departureDate: "2026-11-10",
      departureTime: "07:00",
      estimatedDurationHours: 4.5, // 245 กม. พักรถ 30 นาที
      eta: "2026-11-10 12:00",
      currentStatusId: 6, // ส่งเอกสารข้ามแดน (border_customs)
      currentStatusKey: "border_customs",
      routeDistanceKm: 245,
      returnToCompany: true,
      hasRestStop: true,
      restDurationMinutes: 30,
      customsPermitNo: "CB-THKH-2026/0491",
      customsDeclarationNo: "กศก.120-690214",
      customsCheckpoint: "ด่านศุลกากรอรัญประเทศ (สะพานมิตรภาพไทย-กัมพูชา บ้านหนองเอี่ยน)",
      destinationCountry: "ราชอาณาจักรกัมพูชา (Cambodia)",
      driverPassport: "PASSPORT-TH-AA99218 (ท.4 สากล)",
      customsSealNo: "SEAL-CUSTOMS-8821",
      documentsChecklist: [
        { name: "ใบอนุญาตขนส่งสินค้าอันตรายข้ามแดน (Cross-Border DG Permit)", status: "approved", docNo: "CB-THKH-2026/0491" },
        { name: "ใบขนสินค้าขาออก กศก.120 พร้อมชำระภาษี", status: "approved", docNo: "กศก.120-690214" },
        { name: "หนังสือเดินทางคนขับ (Passport) & ใบขับขี่ ท.4", status: "verified", docNo: "PASSPORT-TH-AA99218" },
        { name: "ซีลล็อกวาล์วถังก๊าซศุลกากร (Customs Tamper Seal)", status: "inspected", docNo: "SEAL-CUSTOMS-8821" }
      ],
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "06:30", note: "สร้างใบงานขนส่งส่งออกข้ามแดน ปอยเปต กัมพูชา", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "06:45", note: "มอบหมาย ชบ.73-8914 (นายกรกฏ พรหมมา มี Passport & ท.4)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "07:00", note: "ตรวจสภาพรถ วาล์วถังก๊าซ และเช็กอุปกรณ์ความปลอดภัยสากล ผ่าน", by: "นายกรกฏ พรหมมา" },
        { statusId: 4, name: "รับสินค้า", time: "07:45", note: "โหลดก๊าซ LPG ข้ามแดน 18 ตัน ที่คลังมาบตาพุด ตรวจซีลเรียบร้อย", by: "คลังมาบตาพุด" },
        { statusId: 5, name: "ออกเดินทาง", time: "08:15", note: "มุ่งหน้าด่านอรัญประเทศ พักรถตามกฎหมายที่กบินทร์บุรี 30 นาที", by: "GPS Auto Tracker" },
        { statusId: 6, name: "ส่งเอกสารข้ามแดน", time: "11:20", note: "ถึงด่านศุลกากรอรัญประเทศ ยื่นใบขออนุญาตขนส่งข้ามแดนและตรวจศุลกากร", by: "นายกรกฏ พรหมมา (คนขับ)" }
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
      dropoffLocId: "LOC-006",
      vehicleId: "V-06",
      driverId: "D-10",
      departureDate: "2026-11-10",
      departureTime: "06:00",
      estimatedDurationHours: 3.5,
      eta: "2026-11-10 09:30",
      currentStatusId: 7, // เสร็จสิ้น (completed)
      currentStatusKey: "completed",
      routeDistanceKm: 180,
      returnToCompany: true,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "05:00", note: "สร้างใบงาน", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "05:15", note: "มอบหมาย ชบ.73-8915 (นายอนุชา)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "05:30", note: "ผ่าน", by: "นายอนุชา บุญส่ง" },
        { statusId: 4, name: "รับสินค้า", time: "06:15", note: "โหลดน้ำมันเสร็จสิ้น", by: "โรงกลั่นศรีราชา" },
        { statusId: 5, name: "ออกเดินทาง", time: "06:30", note: "มุ่งหน้าสระบุรี", by: "GPS Auto Tracker" },
        { statusId: 6, name: "ส่งสินค้า", time: "09:45", note: "ถ่ายเทน้ำมันที่คลังสระบุรีเรียบร้อย", by: "นายอนุชา บุญส่ง" },
        { statusId: 7, name: "เสร็จสิ้น", time: "10:15", note: "ส่งเอกสารใบกำกับและใบส่งมอบงานแล้ว", by: "Admin Dispatcher" }
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
      dropoffLocId: "LOC-008",
      vehicleId: "V-07",
      driverId: "D-12",
      departureDate: "2026-11-10",
      departureTime: "05:30",
      estimatedDurationHours: 7.5,
      eta: "2026-11-10 14:00",
      currentStatusId: 5, // ออกเดินทาง (in_transit)
      currentStatusKey: "in_transit",
      routeDistanceKm: 460,
      returnToCompany: true,
      hasRestStop: true,
      restCount: 2,
      restDurationMinutes: 60,
      timeline: [
        { statusId: 1, name: "รอรับงาน", time: "04:30", note: "สร้างงานระยะไกล มุ่งหน้าขอนแก่น", by: "Admin Dispatcher" },
        { statusId: 2, name: "ลงคิวคนขับ", time: "04:45", note: "มอบหมาย ชบ.73-8916 (นายพิชัย มือหนึ่ง)", by: "Admin Dispatcher" },
        { statusId: 3, name: "ตรวจสภาพรถ", time: "05:00", note: "เช็กลิสต์ระยะไกล 100%", by: "นายพิชัย มงคลดี" },
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
