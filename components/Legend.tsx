"use client";

import { useState } from "react";
import { Star, Calendar, AlertCircle, Sparkles } from "lucide-react";

const ITEMS = [
  {
    key: "today",
    bg: "rgba(251,191,36,.25)",
    border: "2px solid #fbbf24",
    label: "Hôm nay",
    desc: "Ngày hiện tại",
    icon: <Sparkles size={12} />,
  },
  {
    key: "normal",
    bg: "linear-gradient(135deg,#34d399,#059669)",
    border: "none",
    label: "Đã nhập (×0.4)",
    desc: "Ngày thường đã chấm điểm",
    icon: <Calendar size={12} />,
  },
  {
    key: "t5",
    bg: "linear-gradient(135deg,#a78bfa,#7c3aed)",
    border: "none",
    label: "Thứ 5 (×0.6)",
    desc: "Ngày tổng kết tuần",
    icon: <Star size={12} />,
  },
  {
    key: "off",
    bg: "rgba(248,113,113,.35)",
    border: "1px solid rgba(248,113,113,.5)",
    label: "Không chấm",
    desc: "Chủ nhật / ngày lễ",
    icon: <AlertCircle size={12} />,
  },
];

export default function Legend() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="glass rounded-2xl px-4 py-3 mb-3 flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const isActive = active === item.key;

        return (
          <div
            key={item.key}
            onClick={() => setActive(isActive ? null : item.key)}
            className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            style={{
              background: isActive
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* COLOR BOX */}
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0 transition-all group-hover:scale-110"
              style={{
                background: item.bg,
                border: item.border,
              }}
            />

            {/* ICON */}
            <span className="text-white/60 group-hover:text-white">
              {item.icon}
            </span>

            {/* LABEL */}
            <span className="text-xs font-bold text-white/55 group-hover:text-white transition-all">
              {item.label}
            </span>

            {/* TOOLTIP */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-[10px] rounded-md bg-black/80 text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
              {item.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}