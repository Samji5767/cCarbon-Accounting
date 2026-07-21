"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Zap, Truck, Factory, Wind, TrendingUp, TrendingDown } from "lucide-react";

const SOURCES = [
  { id: "electricity", label: "Electricity", icon: Zap,     color: "#f59e0b", unit: "kWh", rate: 142, scope: "Scope 2" },
  { id: "gas",         label: "Natural Gas", icon: Factory,  color: "#ef4444", unit: "m³",  rate: 31,  scope: "Scope 1" },
  { id: "fleet",       label: "Fleet",       icon: Truck,    color: "#8b5cf6", unit: "km",  rate: 89,  scope: "Scope 1" },
  { id: "hvac",        label: "HVAC",        icon: Wind,     color: "#06b6d4", unit: "kWh", rate: 67,  scope: "Scope 2" },
];

interface SourceState {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  unit: string;
  rate: number;
  scope: string;
  current: number;
  trend: number;
}

function generatePoint(base: number) {
  return Math.round(base + (Math.random() - 0.5) * base * 0.15);
}

export default function LiveTrackerPage() {
  const [todayTotal, setTodayTotal] = useState(34.7);
  const [sources, setSources] = useState<SourceState[]>(
    SOURCES.map(s => ({ ...s, current: s.rate, trend: 0 }))
  );
  const [history, setHistory] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      tCO2e: parseFloat((Math.random() * 2 + 0.8).toFixed(2)),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSources(prev =>
        prev.map(s => {
          const newVal = generatePoint(s.rate);
          return { ...s, current: newVal, trend: newVal - s.current };
        })
      );
      setTodayTotal(prev => parseFloat((prev + Math.random() * 0.01).toFixed(2)));
      setHistory(prev => {
        const now = new Date();
        const label = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return [...prev.slice(-47), { time: label, tCO2e: parseFloat((Math.random() * 2 + 0.8).toFixed(2)) }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const dailyBudget = 38.2;

  return (
    <div className="p-4 space-y-4 pb-24 md:pb-6">
      <PageHeader title="Live Tracker" subtitle="Real-time facility emissions" />

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[12px] text-emerald-600 font-semibold">LIVE — updating every 3s</span>
      </div>

      {/* Today total hero */}
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-none">
        <p className="text-slate-400 text-[12px] font-medium uppercase tracking-wide">Today&apos;s Emissions</p>
        <p className="text-[42px] font-bold leading-tight mt-1">{todayTotal.toFixed(1)}</p>
        <p className="text-slate-400 text-[13px]">tCO₂e · on track for {dailyBudget} today</p>
        <div className="mt-3 bg-white/10 rounded-full h-1.5">
          <div
            className="bg-emerald-400 h-1.5 rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min((todayTotal / dailyBudget) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-500">0</span>
          <span className="text-[10px] text-slate-500">Daily budget: {dailyBudget} tCO₂e</span>
        </div>
      </Card>

      {/* Live area chart */}
      <Card className="p-4">
        <p className="text-[13px] font-semibold text-slate-700 mb-3">Emissions Rate (24h)</p>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(history.length / 4)}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              formatter={(v) => [`${v} tCO₂e`, "Emissions"]}
            />
            <Area
              type="monotone"
              dataKey="tCO2e"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#liveGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Source cards */}
      <div className="grid grid-cols-2 gap-3">
        {sources.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <Badge variant="secondary" className="text-[10px] py-0">{s.scope}</Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
              <p className="text-[22px] font-bold text-slate-900 leading-tight">{s.current}</p>
              <p className="text-[10px] text-slate-400">{s.unit}/h</p>
              <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${s.trend > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {s.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(s.trend)} vs last
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
