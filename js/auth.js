/**
 * NextRoute Logistics - Authentication & Session Management
 * Role-Based Access Control (Admin vs. Driver vs. Customer Public Tracking)
 * Fully aligned with real NWT Fleet & Drivers (14 trucks, 14 drivers)
 */

const Auth = {
  SESSION_KEY: "NEXTROUTE_AUTH_USER_V1",

  // Master accounts list for system roles and all 14 NWT drivers
  ACCOUNTS: [
    // -------------------------------------------------------------
    // Administrators & Dispatchers
    // -------------------------------------------------------------
    {
      username: "admin",
      role: "admin",
      name: "ผู้ดูแลระบบ (Admin)",
      title: "หัวหน้าศูนย์ควบคุมขนส่ง NextRoute",
      avatar: "AD",
      redirect: "index.html"
    },
    {
      username: "NEXTROUTE",
      role: "admin",
      name: "NextRoute Admin (NWT Fleet)",
      title: "ผู้ดูแลระบบกองรถ เน็คท์รูท โลจิสติกส์",
      avatar: "NR",
      redirect: "index.html"
    },
    {
      username: "dispatcher",
      role: "admin",
      name: "วิโรจน์ จัดคิว (Dispatcher)",
      title: "เจ้าหน้าที่จัดรอบรถและควบคุม FSM",
      avatar: "DP",
      redirect: "index.html"
    },

    // -------------------------------------------------------------
    // All 14 Drivers (Aligned with NWT Fleet 100%)
    // -------------------------------------------------------------
    {
      username: "D-01",
      driverId: "D-01",
      role: "driver",
      name: "นายประสิทธิ์ น้ำนาค",
      nameEn: "MR. PRASIT NAMNAK",
      title: "พนักงานขับรถประจำการ (คัน ชบ.73-8910 Volvo FM11)",
      vehiclePlate: "ชบ.73-8910",
      rawPlate: "73-8910",
      brand: "Volvo",
      model: "FM11",
      avatar: "PS",
      redirect: "driver.html"
    },
    {
      username: "D-02",
      driverId: "D-02",
      role: "driver",
      name: "นายรัญญา พงษ์วัน",
      nameEn: "MR. RANYA PHONGWAN",
      title: "พนักงานขับรถประจำการ (คัน ชบ.73-8912 Volvo FM11)",
      vehiclePlate: "ชบ.73-8912",
      rawPlate: "73-8912",
      brand: "Volvo",
      model: "FM11",
      avatar: "RY",
      redirect: "driver.html"
    },
    {
      username: "D-03",
      driverId: "D-03",
      role: "driver",
      name: "นายจินดา พิชวนชม",
      nameEn: "MR. CHINDA PHISCHUANCHOM",
      title: "พนักงานขับรถประจำการ (คัน ชบ.73-8914 Volvo FM11)",
      vehiclePlate: "ชบ.73-8914",
      rawPlate: "73-8914",
      brand: "Volvo",
      model: "FM11",
      avatar: "CD",
      redirect: "driver.html"
    },
    {
      username: "D-04",
      driverId: "D-04",
      role: "driver",
      name: "นายกิตถโรจน์ ปัญญาธิป",
      nameEn: "MR. KITTHAROT PANYATHIP",
      title: "พนักงานขับรถประจำการ (คัน ชบ.73-8947 Volvo FM11)",
      vehiclePlate: "ชบ.73-8947",
      rawPlate: "73-8947",
      brand: "Volvo",
      model: "FM11",
      avatar: "KT",
      redirect: "driver.html"
    },
    {
      username: "D-05",
      driverId: "D-05",
      role: "driver",
      name: "นายอนงค์ ผิวคำ",
      nameEn: "MR. ANONG PHIWKHAM",
      title: "พนักงานขับรถประจำการ (คัน ชบ.73-8949 Volvo FM11)",
      vehiclePlate: "ชบ.73-8949",
      rawPlate: "73-8949",
      brand: "Volvo",
      model: "FM11",
      avatar: "AN",
      redirect: "driver.html"
    },
    {
      username: "D-06",
      driverId: "D-06",
      role: "driver",
      name: "นายชำนาญ จุลวรรณ",
      nameEn: "MR. CHAMNAN CHUNLAWAN",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-0547 Scania P360)",
      vehiclePlate: "ชบ.74-0547",
      rawPlate: "74-0547",
      brand: "Scania",
      model: "P360",
      avatar: "CN",
      redirect: "driver.html"
    },
    {
      username: "D-07",
      driverId: "D-07",
      role: "driver",
      name: "นายสุเทพ โพธิ์ศรี",
      nameEn: "MR. SUTHEP PHOSRI",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-0549 Scania P360)",
      vehiclePlate: "ชบ.74-0549",
      rawPlate: "74-0549",
      brand: "Scania",
      model: "P360",
      avatar: "ST",
      redirect: "driver.html"
    },
    {
      username: "D-08",
      driverId: "D-08",
      role: "driver",
      name: "นายธวัชชัย อุเทศ",
      nameEn: "MR. THAWATCHAI UTSEN",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-0551 Scania P360)",
      vehiclePlate: "ชบ.74-0551",
      rawPlate: "74-0551",
      brand: "Scania",
      model: "P360",
      avatar: "TC",
      redirect: "driver.html"
    },
    {
      username: "D-09",
      driverId: "D-09",
      role: "driver",
      name: "นายสมคิด แสงสร้อย",
      nameEn: "MR. SOMKID SANGSOI",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-0553 Scania P360)",
      vehiclePlate: "ชบ.74-0553",
      rawPlate: "74-0553",
      brand: "Scania",
      model: "P360",
      avatar: "SK",
      redirect: "driver.html"
    },
    {
      username: "D-10",
      driverId: "D-10",
      role: "driver",
      name: "สำรอง / ประจำศูนย์ NRL",
      nameEn: "SPARE TRUCK NRL",
      title: "พนักงานสำรองประจำศูนย์ (คัน ชบ.74-0553 Scania P360)",
      vehiclePlate: "ชบ.74-0553 (สำรอง)",
      rawPlate: "74-0553",
      brand: "Scania",
      model: "P360",
      avatar: "SP",
      redirect: "driver.html"
    },
    {
      username: "D-11",
      driverId: "D-11",
      role: "driver",
      name: "นายน้อม กะปรัม",
      nameEn: "MR. NOM KAPRAM",
      title: "พนักงานขับรถสายอีสาน-ข้ามแดน (คัน ชบ.74-0556 Scania P360)",
      vehiclePlate: "ชบ.74-0556",
      rawPlate: "74-0556",
      brand: "Scania",
      model: "P360",
      avatar: "NK",
      redirect: "driver.html"
    },
    {
      username: "D-12",
      driverId: "D-12",
      role: "driver",
      name: "นายประทีป อินทาโนะ",
      nameEn: "MR. PRATHIP INTANO",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-1586 Scania P360)",
      vehiclePlate: "ชบ.74-1586",
      rawPlate: "74-1586",
      brand: "Scania",
      model: "P360",
      avatar: "PT",
      redirect: "driver.html"
    },
    {
      username: "D-13",
      driverId: "D-13",
      role: "driver",
      name: "นายอานนท์ อุ่นกะสัง",
      nameEn: "MR. ARNON AUNKASANG",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-1748 Scania P360)",
      vehiclePlate: "ชบ.74-1748",
      rawPlate: "74-1748",
      brand: "Scania",
      model: "P360",
      avatar: "AN",
      redirect: "driver.html"
    },
    {
      username: "D-14",
      driverId: "D-14",
      role: "driver",
      name: "นายจิรพัฒน์ สงนอก",
      nameEn: "MR. CHIRAPHAT SONGNOK",
      title: "พนักงานขับรถประจำการ (คัน ชบ.74-1750 Scania P360)",
      vehiclePlate: "ชบ.74-1750",
      rawPlate: "74-1750",
      brand: "Scania",
      model: "P360",
      avatar: "CR",
      redirect: "driver.html"
    }
  ],

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Smart login method accepting:
   * - username (e.g. 'admin', 'NEXTROUTE', 'dispatcher')
   * - driverId (e.g. 'D-01', 'D-14', 'd-7', '07', '7')
   * - license plate (e.g. '74-0549', '73-8910')
   * - driver name (e.g. 'สุเทพ', 'จิรพัฒน์', 'น้อม', 'suthep')
   */
  login(username, password) {
    const cleanUser = (username || "").trim();
    if (!cleanUser) {
      return { success: false, message: "กรุณาระบุชื่อผู้ใช้ หรือรหัสคนขับ" };
    }

    const uLower = cleanUser.toLowerCase();
    const uNumeric = cleanUser.replace(/^d-?/i, "").replace(/^0+/, ""); // e.g. "D-07" -> "7", "02" -> "2"

    let matched = this.ACCOUNTS.find(a => {
      // 1. Direct username or driverId match
      if (a.username.toLowerCase() === uLower) return true;
      if (a.driverId && a.driverId.toLowerCase() === uLower) return true;

      // 2. Numeric driver ID match (e.g. user typed "7" or "07" for D-07)
      if (a.driverId) {
        const dNum = a.driverId.replace(/^d-?/i, "").replace(/^0+/, "");
        if (uNumeric && dNum === uNumeric) return true;
      }

      // 3. License plate match
      if (a.rawPlate && a.rawPlate.includes(cleanUser)) return true;
      if (a.vehiclePlate && a.vehiclePlate.includes(cleanUser)) return true;

      // 4. Name match (TH or EN)
      if (a.name && a.name.toLowerCase().includes(uLower)) return true;
      if (a.nameEn && a.nameEn.toLowerCase().includes(uLower)) return true;

      return false;
    });

    // Fallback: check window.store if available
    if (!matched && typeof window !== "undefined" && window.store) {
      const d = window.store.getDriver(cleanUser) || (window.store.getDrivers ? window.store.getDrivers().find(dr => dr.name.includes(cleanUser) || (dr.vehiclePlate && dr.vehiclePlate.includes(cleanUser))) : null);
      if (d) {
        matched = {
          username: d.id,
          role: "driver",
          driverId: d.id,
          name: d.name,
          title: `พนักงานขับรถประจำการ (คัน ${d.vehiclePlate || "-"})`,
          vehiclePlate: d.vehiclePlate || "-",
          avatar: d.id,
          redirect: "driver.html"
        };
      }
    }

    if (!matched) {
      return {
        success: false,
        message: `ไม่พบชื่อผู้ใช้งานหรือรหัส "${cleanUser}" (ลองใช้: admin, NEXTROUTE, หรือคนขับ D-01 ถึง D-14)`
      };
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(matched));
    return { success: true, user: matched };
  },

  quickLogin(accountKey) {
    const res = this.login(accountKey, "123456");
    if (res.success) {
      window.location.href = res.user.redirect;
    } else {
      const matched = this.ACCOUNTS[0];
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(matched));
      window.location.href = matched.redirect;
    }
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = "login.html";
  },

  /**
   * Guards protected pages (index.html or driver.html)
   * Redirects unauthenticated visitors to login.html
   */
  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      // If a driver attempts to open admin index.html
      if (requiredRole === "admin" && user.role === "driver") {
        alert("หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น ระบบจะนำคุณไปยังหน้าคนขับ");
        window.location.href = "driver.html";
        return null;
      }
    }

    return user;
  }
};

if (typeof window !== "undefined") {
  window.Auth = Auth;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Auth;
}
