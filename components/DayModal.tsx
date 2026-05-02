"use client";
import { useState, useEffect } from "react";
import { X, Save, Trash2, Pencil, Star, Calendar, Loader2 } from "lucide-react";
import {
  DayEntry,
  TrungDoiId,
  TrungDoiScores,
  TRUNG_DOIS,
  DAYS_FULL,
  SCORE_CATEGORIES,
  isThu5,
  calcGrandTotal,
  scoreColor,
} from "@/lib/types";
import ScoreInputCard from "./ScoreInputCard";
import { useAuth } from "@/lib/Authcontext";
interface Props {
  year: number;
  month: number;
  day: number;
  entry: DayEntry | undefined;
  saving: boolean;
  createdAt?: string; // 🆕 thời gian tạo
  updatedAt?: string; // 🆕 thời gian sửa
  editReason?: string; // 🆕 lý do sửa
  onClose: () => void;
  onSave: (e: DayEntry) => Promise<void>;
  onDelete: () => Promise<void>;
}
function emptyScores(): Partial<Record<TrungDoiId, TrungDoiScores>> {
  const s: Partial<Record<TrungDoiId, TrungDoiScores>> = {};
  TRUNG_DOIS.forEach((td) => (s[td] = {}));
  return s;
}
export default function DayModal({
  year,
  month,
  day,
  entry,
  saving,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isT5 = isThu5(year, month, day),
    dow = new Date(year, month, day).getDay(),
    mult = isT5 ? 0.6 : 0.4;
  const [mode, setMode] = useState<"view" | "edit">(entry ? "view" : "edit");
  const { user } = useAuth();
  const [nhanxet, setNhanxet] = useState(entry?.nhanxet ?? "");
  const [uudiem, setUudiem] = useState(entry?.uudiem ?? "");
  const [khuyetdiem, setKhuyetdiem] = useState(entry?.khuyetdiem ?? "");
  const [bieuduong, setBieuduong] = useState(entry?.bieuduong ?? "");
  const [editReason, setEditReason] = useState("");
  const [scores, setScores] = useState<
    Partial<Record<TrungDoiId, TrungDoiScores>>
  >(entry?.scores ? { ...entry.scores } : emptyScores());
  useEffect(() => {
    if (entry && mode === "view") {
      setNhanxet(entry.nhanxet);
      setUudiem(entry.uudiem);
      setKhuyetdiem(entry.khuyetdiem);
      setScores({ ...entry.scores });
    }
  }, [entry, mode]);
  const isValid = (() => {
  // bắt buộc nhập text
  if (!nhanxet.trim()) return false;
  if (!uudiem.trim()) return false;
  if (!khuyetdiem.trim()) return false;
  if (!bieuduong.trim()) return false;

  // bắt buộc nhập điểm tất cả trung đội + tất cả tiêu chí
  for (const td of TRUNG_DOIS) {
    const tdScores = scores[td];
    if (!tdScores) return false;

    for (const cat of SCORE_CATEGORIES) {
      if (tdScores[cat.key] === undefined) return false;
    }
  }

  // nếu là sửa → phải có lý do
  if (entry && !editReason.trim()) return false;

  return true;
})();

  const grandTotal = calcGrandTotal(scores, isT5),
    readOnly = mode === "view";
    const ranking = (() => {
  const arr = TRUNG_DOIS.map((td) => {
    const tdScores = scores[td] ?? {};
    let sum = 0;
    let count = 0;

    for (const cat of SCORE_CATEGORIES) {
      const val = tdScores[cat.key];
      if (val !== undefined) {
        sum += val;
        count++;
      }
    }

    const avg = count ? sum / count : 0;

    return {
      td,
      avg,
    };
  });

  // sort giảm dần
  arr.sort((a, b) => b.avg - a.avg);

  return arr;
})();

  function handleScoreChange(td: TrungDoiId, key: string, val: number) {
    setScores((prev) => ({
      ...prev,
      [td]: { ...(prev[td] ?? {}), [key]: val },
    }));
  }
  async function handleSave() {

      if (!isValid) {
    alert("❌ Vui lòng nhập đầy đủ tất cả thông tin trước khi lưu!");
    return;
  }
    if (!user) {
    alert("⚠️ Vui lòng đăng nhập để lưu dữ liệu!");
    return;
  }

    const now = new Date().toISOString();

    // ❗ nếu đang sửa mà chưa nhập lý do
    if (entry && !editReason.trim()) {
      alert("Vui lòng nhập lý do chỉnh sửa!");
      return;
    }

    await onSave({
      nhanxet,
      uudiem,
      khuyetdiem,
      bieuduong,
      scores,
      grandTotal,
      isT5,

      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
      editReason: entry ? editReason : "Tạo mới",
    });
// ✅ QUAN TRỌNG: đóng modal sau khi lưu thành công
  onClose();
    setMode("view");
    setEditReason("");
  }

  async function handleDelete() {
    if (confirm(`Xóa dữ liệu ngày ${day}/${month + 1}/${year}?`))
      await onDelete();
  }
  const taStyle = (ro: boolean) => ({
    width: "100%",
    borderRadius: 12,
    padding: "9px 13px",
    color: ro ? "rgba(255,255,255,0.52)" : "#fff",
    fontFamily: "'Nunito',sans-serif",
    fontSize: 14,
    resize: "vertical" as const,
    minHeight: 68,
    outline: "none",
    background: ro ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    pointerEvents: ro ? ("none" as const) : ("auto" as const),
  });
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-scaleIn relative w-full overflow-y-auto rounded-3xl p-6"
        style={{
          maxWidth: 720,
          maxHeight: "92vh",
          background:
            "radial-gradient(ellipse 80% 40% at 20% 0%,#7c3aed33,transparent 60%),radial-gradient(ellipse 70% 40% at 80% 100%,#0ea5e933,transparent 60%),linear-gradient(160deg,#12103a,#1a0f3a,#0f1629)",
          border: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <X size={17} color="#fff" />
        </button>
        <div
          className="font-black text-2xl mb-1"
          style={{
            fontFamily: "'Baloo 2',cursive",
            background: "linear-gradient(135deg,#fbbf24,#f472b6,#a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {DAYS_FULL[dow]}, {day} tháng {month + 1} năm {year}
        </div>
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
            style={
              isT5
                ? {
                    background: "rgba(139,92,246,.3)",
                    color: "#c4b5fd",
                    border: "1px solid rgba(167,139,250,.4)",
                  }
                : {
                    background: "rgba(56,189,248,.22)",
                    color: "#7dd3fc",
                    border: "1px solid rgba(56,189,248,.3)",
                  }
            }
          >
            {isT5 ? (
              <>
                <Star size={12} />
                Thứ 5 — Tổng tuần × 0.6
              </>
            ) : (
              <>
                <Calendar size={12} />
                Ngày thường × 0.4
              </>
            )}
          </span>
          {entry?.createdAt && (
            <div className="text-[11px] text-white/25">
              Tạo: {new Date(entry.createdAt).toLocaleString("vi-VN")}
            </div>
          )}

          {entry?.updatedAt && (
            <div className="text-[11px] text-white/25">
              Sửa: {new Date(entry.updatedAt).toLocaleString("vi-VN")}
            </div>
          )}

          {entry?.editReason && (
            <div className="text-[11px] text-yellow-300/70">
              Lý do: {entry.editReason}
            </div>
          )}
        </div>
        {mode === "edit" && entry && (
          <div
            className="text-[11px] mb-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.3)",
              color: "#facc15",
            }}
          >
            ⚠️ Bạn đang chỉnh sửa dữ liệu đã lưu — cần nhập lý do
          </div>
        )}
        <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
          📝 Nhận xét chung
        </div>
        <textarea
          value={nhanxet}
          onChange={(e) => setNhanxet(e.target.value)}
          placeholder="Nhập nhận xét chung..."
          rows={3}
          style={taStyle(readOnly)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-5">
          <div>
            <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
              ✅ Ưu điểm
            </div>
            <textarea
              value={uudiem}
              onChange={(e) => setUudiem(e.target.value)}
              placeholder="Nhập ưu điểm..."
              rows={3}
              style={taStyle(readOnly)}
            />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
              ⚠️ Khuyết điểm
            </div>
            <textarea
              value={khuyetdiem}
              onChange={(e) => setKhuyetdiem(e.target.value)}
              placeholder="Nhập khuyết điểm..."
              rows={3}
              style={taStyle(readOnly)}
            />
          </div>
        </div>
            <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
           Biểu dương
        </div>
        <textarea
          value={bieuduong}
          onChange={(e) => setBieuduong(e.target.value)}
          placeholder="Nhập biểu dương..."
          rows={3}
          style={taStyle(readOnly)}
        />
        {mode === "edit" && entry && (
          <div className="mt-3 mb-5">
            <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
              ✏️ Lý do chỉnh sửa
            </div>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Nhập lý do sửa dữ liệu..."
              rows={2}
              style={taStyle(false)}
            />
          </div>
        )}
        <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-3">
          🏆 Điểm các Trung đội
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {TRUNG_DOIS.map((td) => (
            <ScoreInputCard
              key={td}
              td={td}
              scores={scores[td] ?? {}}
              readOnly={readOnly}
              onChange={(key, val) => handleScoreChange(td, key, val)}
            />
          ))}
        </div>
        <div className="mb-5">
  <div className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-2">
    🏅 Bảng xếp hạng trung đội
  </div>

  <div className="space-y-2">
    {ranking.map((r, idx) => (
      <div
        key={r.td}
        className="flex items-center justify-between px-4 py-2 rounded-xl"
        style={{
          background:
            idx === 0
              ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
              : idx === 1
              ? "linear-gradient(135deg,#d1d5db,#9ca3af)"
              : idx === 2
              ? "linear-gradient(135deg,#f97316,#ea580c)"
              : "rgba(255,255,255,0.05)",
          color: idx < 3 ? "#000" : "#fff",
        }}
      >
        <div className="flex items-center gap-2 font-bold">
          <span>
            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
          </span>
          <span>Trung đội {r.td}</span>
        </div>

        <div className="font-black text-lg">
          {r.avg.toFixed(2)}
        </div>
      </div>
    ))}
  </div>
</div>
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-4 mb-5"
          style={{
            background:
              "linear-gradient(135deg,rgba(251,191,36,.12),rgba(244,114,182,.12),rgba(167,139,250,.1))",
            border: "1px solid rgba(251,191,36,.28)",
          }}
        >
          <div>
            <div className="text-sm font-bold text-white/50">
              Tổng điểm cuối cùng
            </div>
            <div className="text-xs text-white/28 mt-0.5">
              TB 4 trung đội × {mult} ({isT5 ? "Thứ 5" : "ngày thường"})
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={
                isT5
                  ? { background: "rgba(139,92,246,.3)", color: "#c4b5fd" }
                  : { background: "rgba(56,189,248,.25)", color: "#7dd3fc" }
              }
            >
              × {mult}
            </span>
            <span
              className="text-5xl font-black"
              style={{
                background: `linear-gradient(135deg,${scoreColor(grandTotal / mult)},#f472b6)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1,
              }}
            >
              {readOnly ? (entry?.grandTotal ?? "--") : grandTotal}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 justify-end flex-wrap">
          {mode === "view" ? (
            <>
              <button
                onClick={() => {
                  setEditReason(""); // reset
                  setMode("edit");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "rgba(56,189,248,.18)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56,189,248,.38)",
                }}
              >
                <Pencil size={14} />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: "rgba(248,113,113,.16)",
                  color: "#f87171",
                  border: "1px solid rgba(248,113,113,.35)",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Xóa
              </button>
            </>
          ) : (
            <>
              {entry && (
                <button
                  onClick={() => setMode("view")}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  Hủy
                </button>
              )}
              <button
                onClick={handleSave}
               disabled={saving || !isValid}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50"
                style={{
                    background: isValid
      ? "linear-gradient(135deg,#059669,#34d399)"
      : "rgba(255,255,255,0.1)",
    color: "#fff",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Lưu dữ liệu
              </button>
              {entry && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background: "rgba(248,113,113,.16)",
                    color: "#f87171",
                    border: "1px solid rgba(248,113,113,.35)",
                  }}
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
