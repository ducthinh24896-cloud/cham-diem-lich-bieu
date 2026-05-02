"use client";
import { ChevronLeft, ChevronRight, CalendarDays, LogOut } from "lucide-react";
import { MONTHS_VN } from "@/lib/types";
import { useAuth } from "@/lib/Authcontext";

interface Props {
  month: number; year: number;
  onPrev: () => void; onNext: () => void; onToday: () => void;
  isCurrentMonth: boolean;
}

export default function CalendarHeader({ month, year, onPrev, onNext, onToday, isCurrentMonth }: Props) {
  const { user, logout } = useAuth();
  const now = new Date();
  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between mb-3">
      <button onClick={onPrev} className="glass flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/20 hover:scale-105">
        <ChevronLeft size={15} /><span className="hidden sm:inline">Trước</span>
      </button>

      <div className="text-center flex-1 mx-2">
        <div className="gradient-text animate-shimmer font-black text-xl sm:text-2xl" style={{ fontFamily: "'Baloo 2', cursive" }}>
          {MONTHS_VN[month]} {year}
        </div>
        <div className="text-[10px] text-white/30 mt-0.5">
          Hôm nay: {now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isCurrentMonth && (
          <button onClick={onToday} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "#fff" }}>
            <CalendarDays size={12} /><span className="hidden sm:inline">Hôm nay</span>
          </button>
        )}
        <button onClick={onNext} className="glass flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/20 hover:scale-105">
          <span className="hidden sm:inline">Sau</span><ChevronRight size={15} />
        </button>
        {/* User avatar + logout */}
        {user && (
          <div className="flex items-center gap-2 ml-1">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.3)" }} />
            )}
            <button onClick={logout} title="Đăng xuất" className="glass p-1.5 rounded-lg transition-all hover:bg-white/20" >
              <LogOut size={14} color="#f87171" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}