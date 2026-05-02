"use client";
import { DayEntry, TD_COLORS, TRUNG_DOIS, isThu5 } from "@/lib/types";
interface Props {
  day: number;
  year: number;
  month: number;
  kind: "prev" | "cur" | "next";
  entry?: DayEntry;
  offReason?: string;
  onClick?: () => void;
}
export default function DayCell({
  day,
  year,
  month,
  kind,
  entry,
  offReason,
  onClick,
}: Props) {
  const isOther = kind !== "cur",
    isOff = !!offReason,
    isSunday = offReason === "Chủ nhật",
    isHoliday = isOff && !isSunday;
  const now = new Date(),
    isToday =
      !isOther &&
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear();
  const t5 = !isOther && !isOff && isThu5(year, month, day),
    hasData = !!entry && !isOff;
  let bg = "rgba(255,255,255,0.04)",
    border = "1px solid rgba(255,255,255,0.07)",
    extra = "";
  if (isToday && isOff) {
    border = "2px solid #fbbf24";
    bg = isHoliday
      ? "linear-gradient(135deg,rgba(248,113,113,.15),rgba(220,38,38,.06))"
      : "rgba(251,191,36,.1)";
  } else if (isToday) {
    border = "2px solid #fbbf24";
    bg = "linear-gradient(135deg,rgba(251,191,36,.18),rgba(251,191,36,.06))";
    extra = "today-pulse";
  } else if (isOff) {
    bg = "linear-gradient(135deg,rgba(248,113,113,.10),rgba(220,38,38,.04))";
    border = "1px solid rgba(248,113,113,.22)";
  } else if (t5 && hasData) {
    bg = "linear-gradient(135deg,rgba(192,132,252,.25),rgba(139,92,246,.12))";
    border = "1px solid rgba(192,132,252,.5)";
  } else if (t5) {
    bg = "linear-gradient(135deg,rgba(167,139,250,.15),rgba(139,92,246,.07))";
    border = "1px solid rgba(167,139,250,.28)";
  } else if (hasData) {
    bg = "linear-gradient(135deg,rgba(52,211,153,.18),rgba(16,185,129,.06))";
    border = "1px solid rgba(52,211,153,.35)";
  }
  const numColor = isOther
    ? "rgba(255,255,255,0.18)"
    : isToday
      ? "#fbbf24"
      : isOff
        ? "#fca5a5"
        : "rgba(255,255,255,0.92)";
  const clickable = !isOther && !isOff;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={[
        "rounded-xl p-1.5 relative overflow-hidden transition-all duration-200 select-none",
        extra,
        isOther ? "opacity-30" : "",
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl"
          : "",
      ].join(" ")}
      style={{ minHeight: 72, background: bg, border }}
    >
      {t5 && <span className="absolute top-1 right-1.5 text-[10px]">⭐</span>}
      {isHoliday && (
        <span
          className="absolute top-1 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(248,113,113,.32)", color: "#fca5a5" }}
        >
          🎌 Lễ
        </span>
      )}
      {isSunday && !isOther && (
        <span
          className="absolute top-1 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(248,113,113,.28)", color: "#fca5a5" }}
        >
          CN
        </span>
      )}
      <div className="text-sm font-black" style={{ color: numColor }}>
        {day}
      </div>
      {isHoliday && !isOther && (
        <div
          className="mt-0.5 leading-tight overflow-hidden"
          style={{
            fontSize: 9,
            color: "#fca5a5",
            fontWeight: 700,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {offReason}
        </div>
      )}
      {hasData && (
        <>
          <span
            className="inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg"
            style={
              t5
                ? {
                    background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                    color: "#fff",
                  }
                : {
                    background: "linear-gradient(135deg,#059669,#10b981)",
                    color: "#fff",
                  }
            }
          >
            {entry!.grandTotal}
          </span>
          <div className="flex gap-0.5 mt-1 flex-wrap">
            {TRUNG_DOIS.map((td) => (
              <div
                key={td}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: TD_COLORS[td] }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
