"use client";

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingDown, CheckCircle, FileText, AlertTriangle, Leaf, Factory, Zap, Globe, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTonnes, formatNumber } from "@/lib/utils";

const PRIOR_YEAR = { total: 26800, scope1: 7100, scope2: 4200, scope3: 15500, intensity: 185, verificationRate: 68 };

const INTENSITY_TREND = [
  { year: "2020", intensity: 221 },
  { year: "2021", intensity: 209 },
  { year: "2022", intensity: 197 },
  { year: "2023", intensity: 185 },
  { year: "2024", intensity: 172 },
];

const DEMO_DATA = {
  summary: { scope1: 6420, scope2: 3780, scope3: 14440, total: 24640, intensity: 172 },
  monthly: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i).toLocaleString("default", { month: "short" }),
    scope1: +(6420 / 12 * (0.85 + Math.sin(i * 0.5) * 0.15)).toFixed(0),
    scope2: +(3780 / 12 * (0.9 + Math.cos(i * 0.4) * 0.1)).toFixed(0),
    scope3: +(14440 / 12 * (0.88 + Math.sin(i * 0.6) * 0.12)).toFixed(0),
  })),
  targets: [
    { id: "t1", name: "Net Zero by 2030", reductionPct: 100, status: "active" },
    { id: "t2", name: "SBTi 1.5°C Near-term", reductionPct: 42, status: "active" },
  ],
  reports: [
    { id: "r1", name: "GHG Inventory 2024", framework: "GHG Protocol", status: "verified", year: 2024 },
    { id: "r2", name: "CSRD Report 2024",   framework: "CSRD / ESRS",  status: "draft",    year: 2024 },
  ],
  verificationRate: 74,
  recordCount: 248,
};

function YoYChip({ current, prior, inverse = false }: { current: number; prior: number; inverse?: boolean }) {
  const pct = prior > 0 ? ((current - prior) / prior) * 100 : 0;
  const isDown = pct < 0;
  const isGood = inverse ? !isDown : isDown;
  if (Math.abs(pct) < 0.1) return <span className="text-xs text-white/50 flex items-center gap-0.5"><Minus className="w-3 h-3" /> flat vs 2023</span>;
  return (
    <span className={`text-xs flex items-center gap-0.5 font-medium ${isGood ? "text-emerald-300" : "text-rose-300"}`}>
      {isDown ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}% vs 2023
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "destructive" }> = {
  draft:        { label: "Draft",        variant: "secondary" },
  under_review: { label: "Under Review", variant: "warning" },
  verified:     { label: "Verified",     variant: "default" },
  published:    { label: "Published",    variant: "default" },
};

const COMPLIANCE_FRAMEWORKS = [
  { framework: "GHG Protocol", color: "#059669", items: ["Scope 1 direct emissions", "Scope 2 electricity", "Scope 3 value chain", "Base year established", "Org. boundary set"], done: [true, true, true, true, true] },
  { framework: "ISO 14064-1",  color: "#0284c7", items: ["GHG inventory completed", "Scope boundary set", "Uncertainty assessment", "Third-party verification", "Management review"],  done: [true, true, false, false, true] },
  { framework: "TCFD",         color: "#7c3aed", items: ["Governance disclosure", "Strategy analysis", "Risk management", "Metrics & targets", "Climate scenario"],            done: [true, true, false, true, false] },
  { framework: "CSRD / ESRS",  color: "#b45309", items: ["Double materiality", "GHG inventory (E1-6)", "Climate transition plan", "Physical risk assessment", "Financial effects"], done: [false, true, false, false, false] },
  { framework: "CDP Climate",  color: "#0e7490", items: ["Scope 1 & 2 verified", "Scope 3 categories", "Emissions intensity", "Reduction initiatives", "Climate targets"],      done: [true, true, true, false, true] },
  { framework: "SBTi",         color: "#be185d", items: ["Near-term target set", "Long-term net-zero", "Scope 1+2 coverage", "Scope 3 coverage", "Annual reporting"],            done: [true, false, true, false, false] },
];

export default function DashboardPage() {
  const [data] = useState(DEMO_DATA);
  const { summary } = data;
  const total = summary.total;

  const HERO_CARDS = [
    {
      label: "Total Emissions",
      value: formatTonnes(summary.total),
      sub: "tCO₂e · 2024",
      chip: <YoYChip current={summary.total} prior={PRIOR_YEAR.total} />,
      icon: Leaf,
      gradient: "from-slate-800 to-slate-900",
    },
    {
      label: "Scope 1 — Direct",
      value: formatTonnes(summary.scope1),
      sub: `${formatNumber((summary.scope1 / total) * 100, 1)}% of total`,
      chip: <YoYChip current={summary.scope1} prior={PRIOR_YEAR.scope1} />,
      icon: Factory,
      gradient: "from-rose-700 to-rose-900",
    },
    {
      label: "Scope 2 — Electricity",
      value: formatTonnes(summary.scope2),
      sub: `${formatNumber((summary.scope2 / total) * 100, 1)}% of total`,
      chip: <YoYChip current={summary.scope2} prior={PRIOR_YEAR.scope2} />,
      icon: Zap,
      gradient: "from-orange-600 to-orange-900",
    },
    {
      label: "Scope 3 — Value Chain",
      value: formatTonnes(summary.scope3),
      sub: `${formatNumber((summary.scope3 / total) * 100, 1)}% of total`,
      chip: <YoYChip current={summary.scope3} prior={PRIOR_YEAR.scope3} />,
      icon: Globe,
      gradient: "from-yellow-600 to-yellow-900",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">GHG Emissions Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Acme Manufacturing Corp · Reporting Year 2024</p>
      </div>

      {/* Gradient hero KPI cards — 2×2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {HERO_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`relative rounded-2xl bg-gradient-to-br ${c.gradient} max-md:p-4 p-5 text-white overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider leading-tight">{c.label}</p>
                <div className="p-1.5 rounded-lg bg-white/10 shrink-0 ml-1">
                  <Icon className="w-3.5 h-3.5 text-white/80" />
                </div>
              </div>
              <p className="text-3xl max-md:text-2xl font-bold tabular-nums leading-none">{c.value}</p>
              <p className="text-xs text-white/50 mt-1">{c.sub}</p>
              <div className="mt-3">{c.chip}</div>
            </div>
          );
        })}
      </div>

      {/* Scope bar + Key indicators side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Scope Breakdown</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {[
                { scope: "Scope 1", value: summary.scope1, color: "#e11d48" },
                { scope: "Scope 2", value: summary.scope2, color: "#ea580c" },
                { scope: "Scope 3", value: summary.scope3, color: "#ca8a04" },
              ].map((s) => (
                <div
                  key={s.scope}
                  style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
                  className="transition-all"
                  title={`${s.scope}: ${formatNumber((s.value / total) * 100, 1)}%`}
                />
              ))}
            </div>
            <div className="flex gap-5 mt-3">
              {[
                { label: "Scope 1", value: summary.scope1, color: "#e11d48" },
                { label: "Scope 2", value: summary.scope2, color: "#ea580c" },
                { label: "Scope 3", value: summary.scope3, color: "#ca8a04" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{formatNumber((s.value / total) * 100, 1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          {[
            { label: "Intensity", value: `${summary.intensity}`, unit: "tCO₂e/$M", icon: TrendingDown, color: "sky" },
            { label: "Verified", value: `${data.verificationRate}%`, unit: "data quality", icon: CheckCircle, color: "emerald" },
            { label: "Records", value: `${data.recordCount}`, unit: "inventory entries", icon: FileText, color: "violet" },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label}>
                <CardContent className="pt-4 pb-4 flex flex-col items-center text-center gap-1">
                  <Icon className="w-4 h-4 text-slate-400 mb-1" />
                  <p className="text-lg font-bold text-slate-900 tabular-nums">{k.value}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{k.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Area chart — 200px on mobile, 260px on desktop */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Emissions Trend</CardTitle>
          <CardDescription>Scope 1, 2 & 3 — stacked area by month (tCO₂e)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] md:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gs1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gs2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gs3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ca8a04" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [`${formatNumber(Number(v))} tCO₂e`]}
                />
                <Area type="monotone" dataKey="scope3" stackId="1" stroke="#ca8a04" strokeWidth={1.5} fill="url(#gs3)" name="Scope 3" />
                <Area type="monotone" dataKey="scope2" stackId="1" stroke="#ea580c" strokeWidth={1.5} fill="url(#gs2)" name="Scope 2" />
                <Area type="monotone" dataKey="scope1" stackId="1" stroke="#e11d48" strokeWidth={1.5} fill="url(#gs1)" name="Scope 1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Intensity line chart — min 200px on mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Emissions Intensity Trend</CardTitle>
          <CardDescription>tCO₂e per $M revenue — 5-year trajectory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] md:h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INTENSITY_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gint" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[150, 240]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [`${v} tCO₂e/$M`, "Intensity"]}
                />
                <Line
                  type="monotone" dataKey="intensity"
                  stroke="url(#gint)" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
                  name="Intensity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>2020 baseline: <strong className="text-slate-700">221 tCO₂e/$M</strong></span>
            <span>2024 current: <strong className="text-emerald-600">172 tCO₂e/$M</strong></span>
            <span>5-yr reduction: <strong className="text-emerald-600">−22.2%</strong></span>
            <span>CAGR: <strong className="text-emerald-600">−6.0%/yr</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Compliance grid — single column on mobile, 2-col md, 3-col lg */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance Status</CardTitle>
          <CardDescription>Requirements across all active frameworks for 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPLIANCE_FRAMEWORKS.map((fw) => {
              const done = fw.done.filter(Boolean).length;
              const total = fw.done.length;
              const pct = Math.round((done / total) * 100);
              const statusLabel = done === total ? "Complete" : pct >= 60 ? "In progress" : "Needs action";
              const statusColor = done === total ? "bg-emerald-100 text-emerald-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
              return (
                <div key={fw.framework} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-slate-800">{fw.framework}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: fw.color }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    {fw.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {fw.done[i] ? (
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: fw.color }} />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className={fw.done[i] ? "text-slate-600" : "text-slate-400"}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-right">{done}/{total} complete</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
