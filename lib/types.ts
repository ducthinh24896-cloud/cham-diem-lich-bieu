// ─── Constants ───────────────────────────────────────────────────────────────

export const TRUNG_DOIS = [9, 10, 11, 12] as const;
export type TrungDoiId = (typeof TRUNG_DOIS)[number];

export const SCORE_CATEGORIES = [
  { key: "vs", label: "Nội dung I" },
  { key: "nv", label: "Nội dung II" },
  { key: "kl", label: "Nội dung III" },
  { key: "hd", label: "Nội dung IV" },
] as const;
export type ScoreCatKey = (typeof SCORE_CATEGORIES)[number]["key"];
export const TD_COLORS: Record<TrungDoiId, string> = {
  9: "#FF6B6B",
  10: "#34d399",
  11: "#38bdf8",
  12: "#fbbf24",
};
export const TD_ICONS: Record<TrungDoiId, string> = {
  9: "🔴",
  10: "🟢",
  11: "🔵",
  12: "🟡",
};
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
export type TrungDoiScores = Partial<Record<ScoreCatKey, number>>;
export type DayEntry = {
  nhanxet: string;
  uudiem: string;
  khuyetdiem: string;
  bieuduong: string;
  scores: Partial<Record<TrungDoiId, TrungDoiScores>>;
  grandTotal: number;
  isT5: boolean;

  createdAt: string;   // 🟢 bắt buộc (lần đầu)
  updatedAt: string;   // 🟢 lần sửa gần nhất
  editReason?: string; // 🟡 chỉ có khi sửa
};


export type CalendarData = Record<string, DayEntry>;
export function pad(n: number) {
  return String(n).padStart(2, "0");
}
export function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
export function isThu5(y: number, m: number, d: number) {
  return new Date(y, m, d).getDay() === 4;
}
export function calcTdAvg(scores: TrungDoiScores) {
  return (
    SCORE_CATEGORIES.map((c) => scores[c.key] ?? 0).reduce((a, b) => a + b, 0) /
    SCORE_CATEGORIES.length
  );
}
export function calcGrandTotal(
  allScores: Partial<Record<TrungDoiId, TrungDoiScores>>,
  isT5: boolean,
) {
  const mult = isT5 ? 0.6 : 0.4;
  const avgs = TRUNG_DOIS.map((td) => calcTdAvg(allScores[td] ?? {}));
  return parseFloat(
    ((avgs.reduce((a, b) => a + b, 0) / avgs.length) * mult).toFixed(2),
  );
}
export function scoreColor(v: number) {
  return v >= 8
    ? "#34d399"
    : v >= 6
      ? "#fbbf24"
      : v >= 4
        ? "#fb923c"
        : "#f87171";
}
export function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
export function getMonthStartOffset(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
