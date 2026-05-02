"use client";
const ITEMS=[
  {bg:"rgba(251,191,36,.2)",border:"2px solid #fbbf24",label:"Hôm nay"},
  {bg:"linear-gradient(135deg,#34d399,#059669)",border:"none",label:"Đã nhập (×0.4)"},
  {bg:"linear-gradient(135deg,#a78bfa,#7c3aed)",border:"none",label:"Thứ 5 (×0.6)"},
  {bg:"rgba(248,113,113,.35)",border:"1px solid rgba(248,113,113,.5)",label:"Không chấm (CN/Lễ)"},
];
export default function Legend(){
  return(
    <div className="glass rounded-2xl px-4 py-2.5 mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {ITEMS.map(item=>(
        <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-white/55">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{background:item.bg,border:item.border}}/>
          {item.label}
        </div>
      ))}
    </div>
  );
}