"use client";
import { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({ children, onRefresh }: { children: React.ReactNode; onRefresh: () => Promise<void> }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(0);
  const threshold = 64;

  async function doRefresh() {
    setRefreshing(true);
    setPullY(0);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  return (
    <div
      onTouchStart={e => { startY.current = e.touches[0].clientY; }}
      onTouchMove={e => {
        const delta = e.touches[0].clientY - startY.current;
        if (delta > 0 && !refreshing) { setPulling(true); setPullY(Math.min(delta * 0.4, threshold + 20)); }
      }}
      onTouchEnd={() => {
        if (pullY >= threshold) doRefresh();
        else { setPullY(0); setPulling(false); }
      }}
      style={{ transform: `translateY(${pullY}px)`, transition: pulling ? "none" : "transform 0.3s ease" }}
      className="relative"
    >
      {(pullY > 8 || refreshing) && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center">
          <div className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center ${refreshing ? "animate-spin" : ""}`}>
            <RefreshCw className="w-4 h-4 text-emerald-500" style={{ transform: `rotate(${(pullY / threshold) * 180}deg)` }} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
