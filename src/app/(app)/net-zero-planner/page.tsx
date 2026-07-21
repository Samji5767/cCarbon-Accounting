"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sliders, TrendingDown, Target, Zap, Leaf, Flag, DollarSign, AlertCircle } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// ── Baseline data — matches DEMO_DATA in dashboard ───────────────────────────
const BASELINE_2024 = 24_640; // tCO₂e

// ── Levers ───────────────────────────────────────────────────────────────────
interface Lever {
  id: string;
  label: string;
  category: string;
  maxAbatement: number;    // tCO₂e at 100% adoption
  costPerTonne: number;    // £/tCO₂e
  description: string;
  icon: React.ReactNode;
  color: string;
  sbtiAligned: boolean;
  timeToScale: "Short" | "Medium" | "Long";
}

const LEVERS: Lever[] = [
  {
    id: "renewable",
    label: "Renewable Electricity (PPA)",
    category: "Energy",
    maxAbatement: 5_120,
    costPerTonne: 8,
    description: "Power Purchase Agreement for 100% renewable electricity, eliminating Scope 2 market-based emissions",
    icon: <Zap className="w-4 h-4" />,
    color: "#f59e0b",
    sbtiAligned: true,
    timeToScale: "Short",
  },
  {
    id: "heatpump",
    label: "Industrial Heat Pump / Electrification",
    category: "Energy",
    maxAbatement: 3_840,
    costPerTonne: 45,
    description: "Replace gas-fired industrial heat with electric heat pumps and resistance heating",
    icon: <Zap className="w-4 h-4" />,
    color: "#f59e0b",
    sbtiAligned: true,
    timeToScale: "Medium",
  },
  {
    id: "fleet",
    label: "Fleet Electrification",
    category: "Transport",
    maxAbatement: 1_980,
    costPerTonne: 28,
    description: "Switch company cars and light delivery fleet to BEV by 2030",
    icon: <TrendingDown className="w-4 h-4" />,
    color: "#3b82f6",
    sbtiAligned: true,
    timeToScale: "Medium",
  },
  {
    id: "supplier",
    label: "Supplier Engagement Programme",
    category: "Supply Chain",
    maxAbatement: 4_400,
    costPerTonne: 18,
    description: "Partner with top-20 suppliers representing 80% of Scope 3 Cat 1 to set and verify SBT-aligned targets",
    icon: <Leaf className="w-4 h-4" />,
    color: "#10b981",
    sbtiAligned: true,
    timeToScale: "Long",
  },
  {
    id: "energy_eff",
    label: "Energy Efficiency (ISO 50001)",
    category: "Energy",
    maxAbatement: 1_480,
    costPerTonne: 5,
    description: "LED lighting, HVAC optimisation, building envelope insulation, energy management system",
    icon: <Zap className="w-4 h-4" />,
    color: "#f59e0b",
    sbtiAligned: true,
    timeToScale: "Short",
  },
  {
    id: "travel",
    label: "Business Travel Reduction",
    category: "Transport",
    maxAbatement: 860,
    costPerTonne: 0,
    description: "Virtual meeting policy, travel pre-approval, flight offsetting, rail preference for < 4hr journeys",
    icon: <TrendingDown className="w-4 h-4" />,
    color: "#3b82f6",
    sbtiAligned: false,
    timeToScale: "Short",
  },
  {
    id: "process",
    label: "Process Innovation & Circular Economy",
    category: "Industrial",
    maxAbatement: 2_960,
    costPerTonne: 62,
    description: "Redesign manufacturing processes to use recycled feedstocks, reduce waste-to-landfill, and close material loops",
    icon: <Leaf className="w-4 h-4" />,
    color: "#8b5cf6",
    sbtiAligned: true,
    timeToScale: "Long",
  },
  {
    id: "cdr",
    label: "Engineered CDR (Residual Offset)",
    category: "Removals",
    maxAbatement: 1_200,
    costPerTonne: 280,
    description: "High-quality, durable carbon dioxide removal (BECCS, DAC) for unavoidable residual emissions after max reduction",
    icon: <Leaf className="w-4 h-4" />,
    color: "#06b6d4",
    sbtiAligned: true,
    timeToScale: "Long",
  },
];

const LEVER_COLORS = ["#f59e0b","#f97316","#3b82f6","#10b981","#eab308","#60a5fa","#8b5cf6","#06b6d4"];

// Abatement ramp: lever adoption scales in over years (S-curve approximation)
function rampFactor(year: number, lever: Lever, adoptionPct: number): number {
  const pct = adoptionPct / 100;
  if (pct === 0) return 0;
  const ramp =
    lever.timeToScale === "Short"  ? Math.min(1, (year - 2024) / 3) :
    lever.timeToScale === "Medium" ? Math.min(1, (year - 2025) / 5) :
                                     Math.min(1, (year - 2026) / 8);
  return Math.max(0, ramp) * pct * lever.maxAbatement;
}

// Baseline trajectory: 3% efficiency improvement per year (BAU)
function baseline(year: number): number {
  const declinePerYear = 0.00; // flat — worst case baseline
  return Math.round(BASELINE_2024 * Math.pow(1 - declinePerYear, year - 2024));
}

interface PathwayPoint {
  year: number;
  baseline: number;
  residual: number;
  totalAbatement: number;
  [key: string]: number;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NetZeroPlannerPage() {
  const [adoptions, setAdoptions] = useState<Record<string, number>>(
    Object.fromEntries(LEVERS.map(l => [l.id, 50]))
  );
  const [hoveredLever, setHoveredLever] = useState<string | null>(null);

  const setAdoption = (id: string, pct: number) =>
    setAdoptions(prev => ({ ...prev, [id]: pct }));

  // Compute pathway
  const pathway = useMemo<PathwayPoint[]>(() => {
    const years = [2024, 2026, 2028, 2030, 2032, 2035, 2040, 2045, 2050];
    return years.map(year => {
      const b = baseline(year);
      const leverAbatements: Record<string, number> = {};
      let total = 0;
      LEVERS.forEach(l => {
        const abate = Math.round(rampFactor(year, l, adoptions[l.id]));
        leverAbatements[l.id] = abate;
        total += abate;
      });
      const residual = Math.max(0, b - total);
      return { year, baseline: b, totalAbatement: total, residual, ...leverAbatements };
    });
  }, [adoptions]);

  // Budget and KPIs
  const totalAbatement2050 = useMemo(() =>
    LEVERS.reduce((s, l) => s + (adoptions[l.id] / 100) * l.maxAbatement, 0), [adoptions]);

  const totalCost = useMemo(() =>
    LEVERS.reduce((s, l) => s + (adoptions[l.id] / 100) * l.maxAbatement * l.costPerTonne, 0), [adoptions]);

  const reductionPct2030 = useMemo(() => {
    const row2030 = pathway.find(p => p.year === 2030);
    if (!row2030) return 0;
    return Math.round((1 - row2030.residual / BASELINE_2024) * 100);
  }, [pathway]);

  const reductionPct2050 = useMemo(() => {
    const row2050 = pathway.find(p => p.year === 2050);
    if (!row2050) return 0;
    return Math.round((1 - row2050.residual / BASELINE_2024) * 100);
  }, [pathway]);

  const residual2050 = useMemo(() => {
    const row2050 = pathway.find(p => p.year === 2050);
    return row2050 ? row2050.residual : 0;
  }, [pathway]);

  const netZeroAchieved = residual2050 <= 2_464; // ≤10% of baseline

  // Lever abatement bar data
  const leverBarData = LEVERS.map((l, i) => ({
    name: l.label.length > 28 ? l.label.slice(0, 26) + "…" : l.label,
    abatement: Math.round((adoptions[l.id] / 100) * l.maxAbatement),
    cost: l.costPerTonne,
    fill: LEVER_COLORS[i],
  })).sort((a, b) => b.abatement - a.abatement);

  const sbtiAligned = reductionPct2030 >= 42; // 42% by 2030 = well-below 2°C threshold

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Net Zero Planner</h1>
          <p className="text-slate-500 text-sm mt-0.5">Model your decarbonisation pathway to 2050 with 8 abatement levers</p>
        </div>
        <div className="flex gap-2">
          <Badge className={cn("text-xs", sbtiAligned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {sbtiAligned ? "✓ SBTi 1.5°C aligned" : "⚠ Below SBTi threshold"}
          </Badge>
          <Badge className={cn("text-xs", netZeroAchieved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
            {netZeroAchieved ? "Net Zero 2050 ✓" : "Net Zero gap ✗"}
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Baseline 2024",   value: `${formatNumber(BASELINE_2024, 0)} tCO₂e`, sub: "GHG Protocol verified",      color: "text-slate-900" },
          { label: "−% by 2030",      value: `${reductionPct2030}%`,                    sub: sbtiAligned ? "SBTi aligned" : "Below 42% SBTi req.",  color: reductionPct2030 >= 42 ? "text-emerald-600" : "text-amber-600" },
          { label: "Residual 2050",   value: `${formatNumber(residual2050, 0)} tCO₂e`,  sub: "Needs CDR/offset",           color: residual2050 <= 2464 ? "text-emerald-600" : "text-rose-600" },
          { label: "Abatement Cost",  value: `£${formatNumber(totalCost / 1_000_000, 1)}M`, sub: "Total NPV (undiscounted)", color: "text-slate-900" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={cn("text-xl font-bold mt-0.5", color)}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pathway chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" /> Emission Pathway to 2050
          </CardTitle>
          <CardDescription className="text-xs">Baseline vs residual emissions with abatement area and science-based milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pathway} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [
                    `${formatNumber(Number(v), 0)} tCO₂e`,
                    name === "baseline" ? "Baseline (flat)" : name === "residual" ? "Residual Emissions" : "Total Abatement",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />

                {/* Abatement shaded area between baseline and residual */}
                <Area type="monotone" dataKey="baseline" name="Baseline (flat)"
                  stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 3"
                  fill="#f1f5f9" fillOpacity={0.6} />
                <Area type="monotone" dataKey="residual" name="Residual Emissions"
                  stroke="#6366f1" strokeWidth={2.5}
                  fill="#6366f1" fillOpacity={0.15} />
                <Line type="monotone" dataKey="totalAbatement" name="Total Abatement"
                  stroke="#10b981" strokeWidth={2} dot={false} />

                {/* Milestone lines */}
                <ReferenceLine x={2030} stroke="#f59e0b" strokeDasharray="4 2"
                  label={{ value: "2030 SBTi", position: "top", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine x={2040} stroke="#3b82f6" strokeDasharray="4 2"
                  label={{ value: "2040 interim", position: "top", fontSize: 10, fill: "#3b82f6" }} />
                <ReferenceLine x={2050} stroke="#10b981" strokeDasharray="4 2"
                  label={{ value: "2050 net-zero", position: "top", fontSize: 10, fill: "#10b981" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lever controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" /> Abatement Levers — Adoption Rate (%)
          </CardTitle>
          <CardDescription className="text-xs">Drag sliders to model different decarbonisation scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LEVERS.map((lever, i) => {
            const adoption = adoptions[lever.id];
            const abatement = Math.round(adoption / 100 * lever.maxAbatement);
            return (
              <div key={lever.id}
                onMouseEnter={() => setHoveredLever(lever.id)}
                onMouseLeave={() => setHoveredLever(null)}
                className={cn("p-3 rounded-xl border transition-all", hoveredLever === lever.id ? "border-emerald-300 bg-emerald-50" : "border-slate-100 bg-slate-50")}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: LEVER_COLORS[i] }}>{lever.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{lever.label}</p>
                      <p className="text-xs text-slate-500">{lever.category} · £{lever.costPerTonne}/tCO₂e · {lever.timeToScale}-term</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: LEVER_COLORS[i] }}>{adoption}%</p>
                    <p className="text-xs text-emerald-600 font-medium">{formatNumber(abatement, 0)} t saved</p>
                  </div>
                </div>
                <input type="range" min={0} max={100} step={5} value={adoption}
                  onChange={e => setAdoption(lever.id, Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                  style={{ accentColor: LEVER_COLORS[i] }} />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>0%</span>
                  <span className="text-center hidden sm:block text-slate-400">{lever.description}</span>
                  <span className="flex items-center gap-1">
                    {lever.sbtiAligned && <span className="text-emerald-500">SBTi</span>}
                    100%
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Abatement by lever bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Abatement by Lever at Current Settings</CardTitle>
          <CardDescription className="text-xs">Full deployment tCO₂e reduction at 2050 (ramp-adjusted)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leverBarData} layout="vertical" margin={{ top: 0, right: 10, left: 160, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={158} />
                <Tooltip formatter={(v: unknown) => [`${formatNumber(Number(v), 0)} tCO₂e`]} />
                <Bar dataKey="abatement" radius={[0, 4, 4, 0]}>
                  {leverBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flag className="w-4 h-4 text-emerald-500" /> Science-Based Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { year: 2025, req: "Commit SBTi & publish transition plan",   achieved: true  },
              { year: 2026, req: "Submit validated SBTi near-term targets",  achieved: true  },
              { year: 2030, req: `−42% Scope 1+2, −25% Scope 3 vs 2024 baseline (≥${formatNumber(BASELINE_2024* 0.42 / 1000, 0)}k tCO₂e)`, achieved: reductionPct2030 >= 42 },
              { year: 2035, req: "100% renewable electricity globally",       achieved: adoptions["renewable"] >= 80 },
              { year: 2040, req: "100% zero-emission fleet and logistics",    achieved: adoptions["fleet"] >= 80 },
              { year: 2045, req: "Scope 3 Cat 1 suppliers on SBT pathway",  achieved: adoptions["supplier"] >= 70 },
              { year: 2050, req: `Residual ≤10% of baseline (≤${formatNumber(BASELINE_2024 * 0.1 / 1000, 1)}k tCO₂e), neutralised by CDR`, achieved: netZeroAchieved },
            ].map(({ year, req, achieved }) => (
              <div key={year} className={cn("flex items-start gap-3 p-3 rounded-xl", achieved ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-200")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  achieved ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                  {year}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{req}</p>
                </div>
                {achieved
                  ? <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget summary */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-slate-500" /> Total Decarbonisation Investment (undiscounted, 2025–2050)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LEVERS.map((l, i) => {
              const cost = Math.round((adoptions[l.id] / 100) * l.maxAbatement * l.costPerTonne);
              return (
                <div key={l.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-500 leading-tight">{l.label.slice(0, 24)}{l.label.length > 24 ? "…" : ""}</p>
                  <p className="font-bold text-slate-900 mt-1" style={{ color: LEVER_COLORS[i] }}>
                    £{formatNumber(cost / 1_000_000, 1)}M
                  </p>
                  <p className="text-[10px] text-slate-400">£{l.costPerTonne}/tCO₂e</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-700">Total Programme Cost</p>
            <p className="text-xl font-bold text-slate-900">£{formatNumber(totalCost / 1_000_000, 1)}M</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Excludes carbon price revenue, grants, and tax incentives. Real-terms NPV will differ significantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
