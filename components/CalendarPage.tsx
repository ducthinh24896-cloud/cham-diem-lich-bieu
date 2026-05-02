"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarData,
  DayEntry,
  DAYS_VN,
  dateKey,
  getDaysInMonth,
  getMonthStartOffset,
} from "@/lib/types";
import { getHolidays, isOffDay } from "@/lib/holidays";
import { saveEntry, deleteEntry, subscribeToMonth } from "@/lib/firestore";
import { useAuth } from "@/lib/Authcontext";
import CalendarHeader from "./CalendarHeader";
import DayCell from "./DayCell";
import DayModal from "./DayModal";
import Legend from "./Legend";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ day: number } | null>(null);
const router = useRouter();

useEffect(() => {
  if (!loading && !user) {
    router.push("/login"); // 👉 chuyển sang trang login
  }
}, [user, loading]);

  const holidays = useMemo(
    () => ({
      ...getHolidays(year - 1),
      ...getHolidays(year),
      ...getHolidays(year + 1),
    }),
    [year],
  );

  // Realtime Firestore subscription per month
useEffect(() => {
  setLoading(true);

  const uid = user?.uid || "public"; // 👈 dùng chung 1 id

  const unsub = subscribeToMonth(uid, year, month, (entries) => {
    setData((prev) => ({ ...prev, ...entries }));
    setLoading(false);
  });

  return () => unsub();
}, [user, year, month]);

  const changeMonth = useCallback((dir: -1 | 1) => {
    setMonth((m) => {
      const next = m + dir;
      if (next > 11) {
        setYear((y) => y + 1);
        return 0;
      }
      if (next < 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return next;
    });
  }, []);

  const goToday = useCallback(() => {
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  }, []);


const handleSave = useCallback(
  async (entry: DayEntry) => {
    if (!user || !modal) {
      alert("⚠️ Cần đăng nhập để lưu!");
      return;
    }

    setSaving(true);
    try {
      const key = dateKey(year, month, modal.day);

      await saveEntry(user.uid, key, entry); // 👈 QUAN TRỌNG

      setData((prev) => ({ ...prev, [key]: entry }));
    } finally {
      setSaving(false);
    }
  },
  [user, modal, year, month],
);

  const handleDelete = useCallback(async () => {
    if (!user || !modal) return;
    setSaving(true);
    try {
      const key = dateKey(year, month, modal.day);
      await deleteEntry(user.uid, key);
      setData((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setModal(null);
    } finally {
      setSaving(false);
    }
  }, [user, modal, year, month]);

  // Build cells
  const startOffset = getMonthStartOffset(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrev = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = useMemo(() => {
    const arr: { day: number; kind: "prev" | "cur" | "next" }[] = [];
    for (let i = 0; i < startOffset; i++)
      arr.push({ day: daysInPrev - startOffset + 1 + i, kind: "prev" });
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, kind: "cur" });
    let nd = 1;
    while (arr.length < totalCells) arr.push({ day: nd++, kind: "next" });
    return arr;
  }, [startOffset, daysInMonth, daysInPrev, totalCells]);

  // Stats
  const { workDays, offDaysCount, entered, avgScore } = useMemo(() => {
    let w = 0,
      o = 0,
      e = 0,
      total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const off = isOffDay(year, month, d, holidays);
      if (off.off) {
        o++;
        continue;
      }
      w++;
      const key = dateKey(year, month, d);
      if (data[key]) {
        e++;
        total += data[key].grandTotal ?? 0;
      }
    }
    return {
      workDays: w,
      offDaysCount: o,
      entered: e,
      avgScore: e ? (total / e).toFixed(2) : "—",
    };
  }, [daysInMonth, year, month, holidays, data]);

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  return (
    <div className="min-h-screen py-5 px-3 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-6 animate-fadeUp">
          <span
            className="text-5xl animate-float block mb-2"
            style={{ lineHeight: 1 }}
          >
            📋
          </span>
          <h1
            className="gradient-text animate-shimmer font-black text-3xl sm:text-4xl mb-1.5"
            style={{ fontFamily: "'Baloo 2',cursive" }}
          >
            Lịch Biểu Chấm Điểm Trung Đội
          </h1>
          <p className="text-white/38 text-sm">
           Hệ thống theo dõi, đánh giá chất lượng thực hiện nhiệm vụ của các trung đội
          </p>
          <p className="text-white/22 text-xs mt-1">
         Thực hiện theo quy định ngày công tác, không chấm điểm ngày nghỉ · ☁️ Dữ liệu được quản lý, lưu trữ trên nền tảng số
          </p>
          {/* {user && (
            <p className="text-white/28 text-xs mt-1">
              👤 {user.displayName || user.email}
            </p>
          )} */}
        </div>

        <div className="animate-fadeUp" style={{ animationDelay: "0.05s" }}>
          <CalendarHeader
            month={month}
            year={year}
            onPrev={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
            onToday={goToday}
            isCurrentMonth={isCurrentMonth}
          />
        </div>
        <div className="animate-fadeUp" style={{ animationDelay: "0.08s" }}>
          <Legend />
        </div>

        {/* Weekdays */}
        <div
          className="grid grid-cols-7 gap-1 mb-1 animate-fadeUp"
          style={{ animationDelay: "0.10s" }}
        >
          {DAYS_VN.map((d, i) => (
            <div
              key={d}
              className="text-center text-[10px] font-black uppercase tracking-wider py-1"
              style={{ color: i === 6 ? "#f87171" : "rgba(255,255,255,0.35)" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="relative">
          {loading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Loader2 size={32} className="animate-spin" color="#a78bfa" />
            </div>
          )}
          <div
            className="grid grid-cols-7 gap-1 animate-fadeUp"
            style={{ animationDelay: "0.12s" }}
          >
            {cells.map((cell, i) => {
              const isCur = cell.kind === "cur";
              const key = isCur ? dateKey(year, month, cell.day) : "";
              const offInfo = isCur
                ? isOffDay(year, month, cell.day, holidays)
                : { off: false };
              return (
                <DayCell
                  key={i}
                  day={cell.day}
                  year={year}
                  month={month}
                  kind={cell.kind}
                  entry={isCur && !offInfo.off ? data[key] : undefined}
                  offReason={offInfo.off ? offInfo.reason : undefined}
                  onClick={() =>
                    isCur && !offInfo.off && setModal({ day: cell.day })
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div
          className="glass rounded-2xl px-5 py-4 mt-4 flex flex-wrap gap-5 animate-fadeUp"
          style={{ animationDelay: "0.16s" }}
        >
          {[
            {
              icon: "📅",
              label: "Ngày làm việc",
              value: workDays,
              grad: "linear-gradient(135deg,#34d399,#059669)",
            },
            {
              icon: "🎌",
              label: "Ngày lễ / CN",
              value: offDaysCount,
              grad: "linear-gradient(135deg,#f87171,#dc2626)",
            },
            {
              icon: "✅",
              label: "Đã nhập",
              value: entered,
              grad: "linear-gradient(135deg,#38bdf8,#6366f1)",
            },
            {
              icon: "⭐",
              label: "Điểm TB tháng",
              value: avgScore,
              grad: "linear-gradient(135deg,#fbbf24,#f472b6)",
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-[11px] font-bold text-white/38 uppercase tracking-wider">
                  {s.label}
                </div>
                <div
                  className="text-xl font-black"
                  style={{
                    background: s.grad,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <DayModal
          year={year}
          month={month}
          day={modal.day}
          entry={data[dateKey(year, month, modal.day)]}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
