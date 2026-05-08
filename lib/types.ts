// ─── Constants ───────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────
// 🔥 TYPES ĐỘNG TỪ FIREBASE
// ─────────────────────────────────────────────

export type TrungDoi = {
  id: string;
  name: string;
};
export type TrungDoiId = string;

export type ScoreCategory = {
  key: string;
  label: string;
};
export type ScoreCatKey = string;

// ─────────────────────────────────────────────
// ⚙️ SYSTEM CONFIG
// ─────────────────────────────────────────────

export type SystemConfig = {
  trungDois: TrungDoi[];

  scoreCategories: ScoreCategory[];
  
tdColors: Record<string, string>;

  tdIcons: Record<string, string>;
};



export const DEFAULT_CONFIG: SystemConfig = {
trungDois: [
  {
    id: "td9",
    name: "Trung đội 9",
  },
  {
    id: "td10",
    name: "Trung đội 10",
  },
  {
    id: "td11",
    name: "Trung đội 11",
  },
  {
    id: "td12",
    name: "Trung đội 12",
  },
],
  scoreCategories: [
    { key: "nd1", label: "Nội dung I" },
    { key: "nd2", label: "Nội dung II" },
    { key: "nd3", label: "Nội dung III" },
    { key: "nd4", label: "Nội dung IV" },
  ],

  tdColors: {
    "td9": "#FF6B6B",
    "td10": "#34d399",
    "td11": "#38bdf8",
    "td12": "#fbbf24",
  },

  tdIcons: {
    "td9": "🔴",
    "td10": "🟢",
    "td11": "🔵",
    "td12": "🟡",
  },
};

// ─────────────────────────────────────────────
// 📅 DATE
// ─────────────────────────────────────────────
export const MONTHS_VN = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const DAYS_VN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const DAYS_FULL = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
// ─────────────────────────────────────────────
// 📊 SCORE TYPES
// ─────────────────────────────────────────────

export type TrungDoiScores = Record<string, number>;

export type DayEntry = {
  nhanxet: string;

  uudiem: string;

  khuyetdiem: string;

  bieuduong: string;

  scores: Partial<Record<string, TrungDoiScores>>;

  grandTotal: number;

  isT5: boolean;

  createdAt: string;

  updatedAt: string;

  editReason?: string;

  updatedBy?: string;
};

export type CalendarData = Record<string, DayEntry>;

// ─────────────────────────────────────────────
// 📅 DATE HELPERS
// ─────────────────────────────────────────────

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function dateKey(
  y: number,
  m: number,
  d: number
) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}


export function isThu5(
  y: number,
  m: number,
  d: number
) {
  return new Date(y, m, d).getDay() === 4;
}

export function getDaysInMonth(
  y: number,
  m: number
) {
  return new Date(y, m + 1, 0).getDate();
}

export function getMonthStartOffset(
  y: number,
  m: number
) {
  const d = new Date(y, m, 1).getDay();

  return d === 0 ? 6 : d - 1;
}


// ─────────────────────────────────────────────
// 📊 TÍNH ĐIỂM
// ─────────────────────────────────────────────


export function calcTdAvg(
  scores: TrungDoiScores = {},
  categories: ScoreCategory[]
) {
  let total = 0;

  categories.forEach((cat, index) => {
    const value = scores[cat.key] ?? 0;

    const weight =
      index === 0 || index === 1
        ? 0.3
        : 0.2;

    total += value * weight;
  });

  return parseFloat(total.toFixed(2));
}

export function calcGrandTotal(
  allScores: Partial<Record<string, TrungDoiScores>>,
  trungDois: TrungDoi[],
  categories: ScoreCategory[]
) {
  if (!trungDois.length) return 0;

  const avgs = trungDois.map((td) =>
    calcTdAvg(
      allScores[td.id] ?? {},
      categories
    )
  );

  return parseFloat(
    (
      avgs.reduce((a, b) => a + b, 0) /
      avgs.length
    ).toFixed(2)
  );
}

export function calcWeekScore(
  normalDays: number[],
  thu5Score: number
) {
  const avgNormal =
    normalDays.length > 0
      ? normalDays.reduce((a, b) => a + b, 0) /
        normalDays.length
      : 0;

  return parseFloat(
    (
      avgNormal * 0.4 +
      thu5Score * 0.6
    ).toFixed(2)
  );
}


// ─────────────────────────────────────────────
// 🎨 UI
// ─────────────────────────────────────────────

export function scoreColor(v: number) {
  return v >= 8
    ? "#34d399"
    : v >= 6
      ? "#fbbf24"
      : v >= 4
        ? "#fb923c"
        : "#f87171";
}