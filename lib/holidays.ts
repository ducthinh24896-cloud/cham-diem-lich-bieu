/**
 * Ngày lễ Việt Nam theo quy định Nhà nước
 * Bao gồm: Tết Dương lịch, Tết Âm lịch, Giỗ Tổ Hùng Vương, 30/4, 1/5, 2/9
 */

export type HolidayMap = Record<string, string>;

// ─── Julian Day Number helpers ────────────────────────────────────────────────

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const l  = Math.floor(jd) + 68569;
  const n  = Math.floor((4 * l) / 146097);
  const ll = l - Math.floor((146097 * n + 3) / 4);
  const i  = Math.floor((4000 * (ll + 1)) / 1461001);
  const lll = ll - Math.floor((1461 * i) / 4) + 31;
  const j  = Math.floor((80 * lll) / 2447);
  const day   = lll - Math.floor((2447 * j) / 80);
  const k     = Math.floor(j / 11);
  const month = j + 2 - 12 * k;
  const year  = 100 * (n - 49) + i + k;
  return { year, month, day };
}

/** New moon Julian Day Number (Meeus, UTC+7) */
function newMoonJD(k: number): number {
  const T  = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  let jde =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;
  const M  = ((2.5534 + 29.1053567 * k - 0.0000014 * T2) * Math.PI) / 180;
  const Mp = ((201.5643 + 385.81693528 * k + 0.0107582 * T2) * Math.PI) / 180;
  const F  = ((160.7108 + 390.67050284 * k - 0.0016118 * T2) * Math.PI) / 180;
  jde +=
    -0.4072 * Math.sin(Mp) +
    0.17241 * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * Math.sin(Mp - M) -
    0.00514 * Math.sin(Mp + M) +
    0.00208 * Math.sin(2 * M);
  return jde + 7 / 24; // UTC+7
}

/** Get solar date of lunar date (year, lmonth, lday) for a given Gregorian year */
function lunarToSolar(
  gyear: number,
  lmonth: number,
  lday: number
): { month: number; day: number } | null {
  try {
    const k0 = Math.floor((gyear - 1900) * 12.3685);
    let jd = newMoonJD(k0);
    let monthStart = Math.floor(jd) + 1;
    let prevMonthStart = monthStart;
    let i = k0;
    let attempts = 0;
    while (attempts < 30) {
      const g = jdToGregorian(monthStart);
      if (g.month === lmonth) {
        return { month: g.month, day: monthStart - Math.floor(newMoonJD(i)) + lday - 1 };
      }
      i++;
      jd = newMoonJD(i);
      prevMonthStart = monthStart;
      monthStart = Math.floor(jd) + 1;
      attempts++;
    }
    return null;
  } catch {
    return null;
  }
}

/** Get Gregorian dates for Tết Nguyên Đán (29/30 tháng Chạp → mùng 5) */
function getTetDays(year: number): { y: number; m: number; d: number; label: string }[] {
  try {
    const labels = [
      "29 tháng Chạp",
      "30 tháng Chạp",
      "Mùng 1 Tết",
      "Mùng 2 Tết",
      "Mùng 3 Tết",
      "Mùng 4 Tết",
      "Mùng 5 Tết",
    ];
    // Find JD of lunar 1/1 of the given year
    const k0 = Math.floor((year - 1900) * 12.3685);
    let best = k0;
    for (let i = k0 - 2; i <= k0 + 2; i++) {
      const jd = newMoonJD(i);
      const g = jdToGregorian(Math.floor(jd) + 1);
      if (g.year === year) { best = i; break; }
    }
    const jd1 = Math.floor(newMoonJD(best)) + 1;
    const result: { y: number; m: number; d: number; label: string }[] = [];
    for (let offset = -2; offset <= 4; offset++) {
      const g = jdToGregorian(jd1 + offset);
      result.push({ y: g.year, m: g.month, d: g.day, label: labels[offset + 2] || "Tết Nguyên Đán" });
    }
    return result;
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

export function getHolidays(year: number): HolidayMap {
  const h: HolidayMap = {};

  const add = (m: number, d: number, name: string) => {
    h[`${year}-${pad(m)}-${pad(d)}`] = name;
  };

  // Fixed holidays
  add(1, 1, "Tết Dương lịch");
  add(4, 30, "Ngày Thống nhất");
  add(5, 1, "Quốc tế Lao động");
  add(9, 2, "Quốc khánh");

  // Giỗ Tổ Hùng Vương — 10/3 âm lịch
  const hungVuong = lunarToSolar(year, 3, 10);
  if (hungVuong) add(hungVuong.month, hungVuong.day, "Giỗ Tổ Hùng Vương");

  // Tết Nguyên Đán
  const tetDays = getTetDays(year);
  tetDays.forEach(({ y, m, d, label }) => {
    h[`${y}-${pad(m)}-${pad(d)}`] = label;
  });

  return h;
}

export function isOffDay(
  year: number,
  month: number,
  day: number,
  holidays: HolidayMap
): { off: boolean; reason?: string } {
  const dow = new Date(year, month, day).getDay();
  if (dow === 0) return { off: true, reason: "Chủ nhật" };
  const key = `${year}-${pad(month + 1)}-${pad(day)}`;
  if (holidays[key]) return { off: true, reason: holidays[key] };
  return { off: false };
}
