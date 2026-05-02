"use client";
import {
  TrungDoiId,
  TrungDoiScores,
  SCORE_CATEGORIES,
  TD_COLORS,
  TD_ICONS,
  calcTdAvg,
  scoreColor,
} from "@/lib/types";
interface Props {
  td: TrungDoiId;
  scores: TrungDoiScores;
  readOnly: boolean;
  onChange: (key: string, value: number) => void;
}
const CARD: { [k: number]: { bg: string; border: string; top: string } } = {
  9: {
    bg: "linear-gradient(135deg,rgba(255,107,107,.13),rgba(255,107,107,.04))",
    border: "rgba(255,107,107,.32)",
    top: "#FF6B6B",
  },
  10: {
    bg: "linear-gradient(135deg,rgba(52,211,153,.13),rgba(52,211,153,.04))",
    border: "rgba(52,211,153,.32)",
    top: "#34d399",
  },
  11: {
    bg: "linear-gradient(135deg,rgba(56,189,248,.13),rgba(56,189,248,.04))",
    border: "rgba(56,189,248,.32)",
    top: "#38bdf8",
  },
  12: {
    bg: "linear-gradient(135deg,rgba(251,191,36,.13),rgba(251,191,36,.04))",
    border: "rgba(251,191,36,.32)",
    top: "#fbbf24",
  },
};
export default function ScoreInputCard({
  td,
  scores,
  readOnly,
  onChange,
}: Props) {
  const avg = calcTdAvg(scores),
    s = CARD[td];
  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderTop: `3px solid ${s.top}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3 text-sm font-black">
        <span>{TD_ICONS[td]}</span>
        <span style={{ color: TD_COLORS[td] }}>Trung đội {td}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SCORE_CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/40">
               {cat.label}
            </label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={scores[cat.key] ?? ""}
              readOnly={readOnly}
              placeholder="0–10"
              onChange={(e) =>
                onChange(cat.key, parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-lg px-2 py-1.5 text-center text-sm font-black outline-none transition-all"
              style={{
                background: readOnly
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.13)",
                color: readOnly ? "rgba(255,255,255,0.52)" : "#fff",
                pointerEvents: readOnly ? "none" : "auto",
              }}
            />
          </div>
        ))}
      </div>
      <div
        className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <span className="text-xs text-white/40 font-bold">Điểm TB</span>
        <span className="text-lg font-black" style={{ color: scoreColor(avg) }}>
          {avg.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
