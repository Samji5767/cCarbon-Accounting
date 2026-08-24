"use client";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 800);
    const t2 = setTimeout(() => setVisible(false), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b1120] transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-900/60">
          <Leaf className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <p className="text-[28px] font-bold text-white tracking-tight">cCarbon</p>
          <p className="text-[13px] text-white/40 mt-0.5">GHG Accounting Platform</p>
        </div>
        <div className="flex gap-1.5 mt-6">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
