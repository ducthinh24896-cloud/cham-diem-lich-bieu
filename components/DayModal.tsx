"use client";
import { useState, useEffect } from "react";
import { X, Save, Trash2, Pencil, Star, Calendar, Loader2 } from "lucide-react";
import {
  DayEntry,
  TrungDoiId,
  TrungDoiScores,
  DAYS_FULL,
  isThu5,
  scoreColor,
  calcGrandTotal,
} from "@/lib/types";

import { useSystemConfig } from "@/lib/SystemConfigContext";
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
  weekData?: DayEntry[];
  embedded?: boolean;
  onClose: () => void;
  onSave: (e: DayEntry) => Promise<void>;
  onDelete: () => Promise<void>;
}
function emptyScores(
  trungDois: number[]
): Record<number, TrungDoiScores> {
  const s: Record<number, TrungDoiScores> = {};

  trungDois.forEach((td) => {
    s[td] = {};
  });

  return s;
}

export default function DayModal({
  year,
  month,
  day,
  entry,
  saving,
  weekData,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isT5 = isThu5(year, month, day),
    dow = new Date(year, month, day).getDay();
  // mult = isT5 ? 0.6 : 0.4;
  const [mode, setMode] = useState<"view" | "edit">(entry ? "view" : "edit");
  const { user } = useAuth();
  const {
  trungDois,
  scoreCategories,
  tdColors,
  tdIcons,
} = useSystemConfig();

  const [nhanxet, setNhanxet] = useState(entry?.nhanxet ?? "");
  const [uudiem, setUudiem] = useState(entry?.uudiem ?? "");
  const [khuyetdiem, setKhuyetdiem] = useState(entry?.khuyetdiem ?? "");
  const [bieuduong, setBieuduong] = useState(entry?.bieuduong ?? "");
  const [editReason, setEditReason] = useState("");
  const [scores, setScores] = useState<
    Partial<Record<TrungDoiId, TrungDoiScores>>
  >(
  entry?.scores
    ? { ...entry.scores }
    : emptyScores(trungDois)
);
  useEffect(() => {
    if (entry && mode === "view") {
      setNhanxet(entry.nhanxet);
      setUudiem(entry.uudiem);
      setKhuyetdiem(entry.khuyetdiem);
      setScores({ ...entry.scores });
    }
  }, [entry, mode]);
  useEffect(() => {
  console.log("weekData:", weekData);
}, [weekData]);
  const isValid = (() => {
    // bắt buộc nhập text
    if (!nhanxet.trim()) return false;
    if (!uudiem.trim()) return false;
    if (!khuyetdiem.trim()) return false;
    if (!bieuduong.trim()) return false;

    // bắt buộc nhập điểm tất cả trung đội + tất cả tiêu chí
   for (const td of trungDois) {
      const tdScores = scores[td];
      if (!tdScores) return false;

    for (const cat of scoreCategories) {
        if (tdScores[cat.key] === undefined) return false;
      }
    }

    // nếu là sửa → phải có lý do
    if (entry && !editReason.trim()) return false;

    return true;
  })();

  // const grandTotal = calcGrandTotal(scores, isT5),
const grandTotal = calcGrandTotal(
  scores,
  trungDois,
  scoreCategories
),
    readOnly = mode === "view";

  // ✅ RANKING NGÀY
  const dayRanking = trungDois.map((td) => {
    const s = scores[td] ?? {};

   const avg = scoreCategories.reduce(
  (total, cat, index) => {
    const weight =
      index === 0 || index === 1
        ? 0.3
        : 0.2;

    return (
      total +
      (s[cat.key] ?? 0) * weight
    );
  },
  0
);

    return { td, avg };
  }).sort((a, b) => b.avg - a.avg);

  // 👉 map để lấy rank nhanh
  const rankMap: Record<number, number> = {};
  dayRanking.forEach((r, i) => {
    rankMap[r.td] = i;
  });

  // ✅ RANKING TUẦN (chỉ khi là thứ 5)
const weekRanking = (() => {
  if (!isT5 || !weekData) return [];

  return trungDois.map((td) => {
    // 👉 TB ngày thường (đã lọc sẵn)
    const normalAvg =
      weekData.length === 0
        ? 0
        : weekData.reduce((sum, d) => {
            const s = d.scores?.[td] ?? {};
            return (
              sum +
              ((s.nd1 ?? 0) * 0.3 +
                (s.nd2 ?? 0) * 0.3 +
                (s.nd3 ?? 0) * 0.2 +
                (s.nd4 ?? 0) * 0.2)
            );
          }, 0) / weekData.length;

    // 👉 điểm thứ 5 (chính ngày đang mở modal)
    const t5Score = (() => {
      const s = scores[td] ?? {};
      return (
        (s.nd1 ?? 0) * 0.3 +
        (s.nd2 ?? 0) * 0.3 +
        (s.nd3 ?? 0) * 0.2 +
        (s.nd4 ?? 0) * 0.2
      );
    })();

    const tongCong = normalAvg * 0.4 + t5Score * 0.6;

    return {
      td,
      normalAvg,
      t5Avg: t5Score,
      tongCong,
      tongDiem: tongCong,
    };
  }).sort((a, b) => b.tongDiem - a.tongDiem);
})();

  // const ranking = TRUNG_DOIS.map((td) => {
  //   const s = scores[td] ?? {};

  //   const avg =
  //     ((s.nd1 ?? 0) * 0.3 +
  //       (s.nd2 ?? 0) * 0.3 +
  //       (s.nd3 ?? 0) * 0.2 +
  //       (s.nd4 ?? 0) * 0.2) /
  //     4;

  //   return { td, avg };
  // }).sort((a, b) => b.avg - a.avg);

  
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
  // const tableData = TRUNG_DOIS.map((td) => {
  //   const s = scores[td] ?? {};

  //   const mt1 = s.nd1 ?? 0;
  //   const mt2 = s.nd2 ?? 0;
  //   const mt3 = s.nd3 ?? 0;
  //   const mt4 = s.nd4 ?? 0;

  //   const diem = mt1 * 0.3 + mt2 * 0.3 + mt3 * 0.2 + mt4 * 0.2;

  //   // 👉 xếp loại (bạn chỉnh lại nếu có quy định riêng)
  //   let xeploai = "C";
  //   if (diem >= 9) xeploai = "A";
  //   else if (diem >= 8) xeploai = "B";

  //   return {
  //     td,
  //     mt1,
  //     mt2,
  //     mt3,
  //     mt4,
  //     diem,
  //     xeploai,
  //   };
  // });

  return (
    <div className="rounded-2xl p-4 border border-white/10">
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
            🏆 Bảng điểm trung đội
          </div>
          <div className="mb-6">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
              }}
            >
              <table className="w-full text-sm text-center">
                {/* HEADER */}
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(124,58,237,.25),rgba(14,165,233,.25))",
                    }}
                  >
                    <th className="py-3 text-white/70 font-bold">Trung đội</th>

                    {scoreCategories.map((c) => (
                      <th
                        key={c.key}
                        className="py-3 text-white/60 text-xs font-bold"
                      >
                        {c.label}
                      </th>
                    ))}

                    <th className="py-3 text-white/80 font-black">TB</th>
                    <th className="py-3 text-white/80 font-black">Hạng</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {trungDois.map((td, idx) => {
                    const s = scores[td] ?? {};

                    const avg =
                      (s.nd1 ?? 0) * 0.3 +
                      (s.nd2 ?? 0) * 0.3 +
                      (s.nd3 ?? 0) * 0.2 +
                      (s.nd4 ?? 0) * 0.2;
                    const rank = rankMap[td];

                    return (
                      <tr
                        key={td}
                        className="transition-all"
                        style={{
                          background:
                            idx % 2 === 0
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.04)",
                        }}
                      >
                        {/* TD NAME */}
                        <td className="py-3 font-bold text-sm">
                          <span style={{ color: tdColors?.[td] ?? "#fff" }}>
  {tdIcons?.[td] ?? "⚪"} TD {td}
</span>
                        </td>

                        {/* INPUT */}
                        {scoreCategories.map((cat) => (
                          <td key={cat.key}>
                            <input
                              type="number"
                              value={s[cat.key] ?? ""}
                              readOnly={readOnly}
                              onChange={(e) =>
                                handleScoreChange(
                                  td,
                                  cat.key,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-14 py-1.5 rounded-lg text-center font-bold outline-none transition-all"
                              style={{
                                background: readOnly
                                  ? "rgba(255,255,255,0.03)"
                                  : "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "#fff",
                              }}
                            />
                          </td>
                        ))}

                        {/* AVG */}
                        <td className="font-black text-lg">
                          <span
                            style={{
                              color: scoreColor(avg),
                            }}
                          >
                            {avg.toFixed(2)}
                          </span>
                        </td>
                        {/* ✅ XẾP HẠNG */}
                        <td className="font-bold">
                          {rank === 0
                            ? "I"
                            : rank === 1
                              ? "II"
                              : rank === 2
                                ? "III"
                                : `IV`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {isT5 && weekData && (
            <div className="mt-6">
              {/* TITLE */}
              <div
                className="font-black text-2xl mb-5"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f472b6,#a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📊 Tổng kết thi đua tuần
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white border-collapse">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="p-2 border">Đơn vị</th>
                      <th className="p-2 border">TB ngày (0.4)</th>
                      <th className="p-2 border">Thứ 5 (0.6)</th>
                      <th className="p-2 border">Tổng cộng</th>
                      <th className="p-2 border">Điểm trừ</th>
                      <th className="p-2 border">Tổng điểm</th>
                      <th className="p-2 border">Xếp hạng</th>
                    </tr>
                  </thead>

                  <tbody>
                    {weekRanking.map((r, idx) => (
                      <tr key={r.td} className="text-center border">
                        <td className="p-2 border font-bold">
                          Trung đội {r.td}
                        </td>
                        <td className="p-2 border">{r.normalAvg.toFixed(2)}</td>
                        <td className="p-2 border">{r.t5Avg.toFixed(2)}</td>
                        <td className="p-2 border">{r.tongCong.toFixed(2)}</td>
                        <td className="p-2 border">0</td>
                        <td
                          className="p-2 border font-bold"
                          style={{
                            color: scoreColor(r.tongDiem),
                          }}
                        >
                          {r.tongDiem.toFixed(2)}
                        </td>
                        <td className="p-2 border">
                          {idx === 0
                            ? "I"
                            : idx === 1
                              ? "II"
                              : idx === 2
                                ? "III"
                                : `IV`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY */}
              <div className="mt-6 text-center">
                <div className="text-sm text-white/50">
                  Điểm tuần = TB ngày × 0.4 + Thứ 5 × 0.6
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
}
