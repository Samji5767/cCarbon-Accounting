"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, TrendingDown, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type EngagementStatus = "Baseline collected" | "Target set" | "Action planning" | "Not engaged";
type DataQuality = "Primary" | "Secondary" | "Estimated";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface Supplier {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  category: string;
  tCO2e: number;
  revenueShare: number;
  dataQuality: DataQuality;
  dataQualityScore: number;
  engagementStatus: EngagementStatus;
  riskLevel: RiskLevel;
  reductionTarget: number;
  spend: number;
  intensity: number;
  svgX: number;
  svgY: number;
}

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: "S1", name: "Hebei Steel Co.",      country: "China",        countryCode: "CN",
    category: "Raw Materials",  tCO2e: 4_820, revenueShare: 18.2, dataQuality: "Primary",
    dataQualityScore: 92, engagementStatus: "Target set",          riskLevel: "High",
    reductionTarget: 35, spend: 12_400, intensity: 0.389, svgX: 650, svgY: 140,
  },
  {
    id: "S2", name: "Tata Chemicals",       country: "India",        countryCode: "IN",
    category: "Chemicals",      tCO2e: 3_250, revenueShare: 12.1, dataQuality: "Secondary",
    dataQualityScore: 74, engagementStatus: "Action planning",      riskLevel: "High",
    reductionTarget: 30, spend: 8_900, intensity: 0.365, svgX: 590, svgY: 185,
  },
  {
    id: "S3", name: "PT Barito Pacific",    country: "Indonesia",    countryCode: "ID",
    category: "Packaging",      tCO2e: 1_840, revenueShare: 7.4,  dataQuality: "Estimated",
    dataQualityScore: 45, engagementStatus: "Not engaged",          riskLevel: "Critical",
    reductionTarget: 0,  spend: 4_200, intensity: 0.438, svgX: 690, svgY: 230,
  },
  {
    id: "S4", name: "Bosch Logistics GmbH", country: "Germany",      countryCode: "DE",
    category: "Logistics",      tCO2e: 1_120, revenueShare: 8.3,  dataQuality: "Primary",
    dataQualityScore: 96, engagementStatus: "Baseline collected",   riskLevel: "Low",
    reductionTarget: 25, spend: 11_500, intensity: 0.097, svgX: 430, svgY: 112,
  },
  {
    id: "S5", name: "ArcelorMittal Brazil", country: "Brazil",       countryCode: "BR",
    category: "Raw Materials",  tCO2e: 2_670, revenueShare: 9.7,  dataQuality: "Secondary",
    dataQualityScore: 68, engagementStatus: "Action planning",      riskLevel: "Medium",
    reductionTarget: 28, spend: 7_600, intensity: 0.351, svgX: 245, svgY: 295,
  },
  {
    id: "S6", name: "US Tech Components",   country: "United States", countryCode: "US",
    category: "Electronics",    tCO2e: 890,   revenueShare: 11.2, dataQuality: "Primary",
    dataQualityScore: 88, engagementStatus: "Target set",          riskLevel: "Low",
    reductionTarget: 40, spend: 15_400, intensity: 0.058, svgX: 155, svgY: 148,
  },
  {
    id: "S7", name: "Fonterra (NZ)",         country: "New Zealand",  countryCode: "NZ",
    category: "Food Inputs",    tCO2e: 1_450, revenueShare: 5.6,  dataQuality: "Primary",
    dataQualityScore: 91, engagementStatus: "Baseline collected",   riskLevel: "Medium",
    reductionTarget: 20, spend: 6_800, intensity: 0.213, svgX: 760, svgY: 340,
  },
  {
    id: "S8", name: "EDF Trading",           country: "France",       countryCode: "FR",
    category: "Energy",         tCO2e: 320,   revenueShare: 4.1,  dataQuality: "Primary",
    dataQualityScore: 99, engagementStatus: "Target set",          riskLevel: "Low",
    reductionTarget: 50, spend: 9_200, intensity: 0.035, svgX: 415, svgY: 118,
  },
  {
    id: "S9", name: "Nigerian Agri Export",  country: "Nigeria",      countryCode: "NG",
    category: "Food Inputs",    tCO2e: 2_180, revenueShare: 3.8,  dataQuality: "Estimated",
    dataQualityScore: 35, engagementStatus: "Not engaged",          riskLevel: "Critical",
    reductionTarget: 0,  spend: 2_100, intensity: 0.571, svgX: 430, svgY: 240,
  },
  {
    id: "S10", name: "Nippon Steel Corp.", country: "Japan",          countryCode: "JP",
    category: "Raw Materials",  tCO2e: 3_410, revenueShare: 8.9,  dataQuality: "Secondary",
    dataQualityScore: 78, engagementStatus: "Action planning",      riskLevel: "High",
    reductionTarget: 30, spend: 9_800, intensity: 0.348, svgX: 730, svgY: 148,
  },
  {
    id: "S11", name: "SSE Renewables",     country: "United Kingdom", countryCode: "GB",
    category: "Energy",         tCO2e: 95,    revenueShare: 6.8,  dataQuality: "Primary",
    dataQualityScore: 99, engagementStatus: "Target set",          riskLevel: "Low",
    reductionTarget: 60, spend: 13_200, intensity: 0.007, svgX: 400, svgY: 96,
  },
  {
    id: "S12", name: "Sappi Paper SA",     country: "South Africa",   countryCode: "ZA",
    category: "Packaging",      tCO2e: 1_090, revenueShare: 3.9,  dataQuality: "Secondary",
    dataQualityScore: 62, engagementStatus: "Baseline collected",   riskLevel: "Medium",
    reductionTarget: 22, spend: 3_400, intensity: 0.321, svgX: 470, svgY: 300,
  },
];

const KANBAN_COLS: { status: EngagementStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: "Not engaged",        label: "Not Engaged",         color: "bg-slate-100 border-slate-200",   icon: <Clock className="w-3.5 h-3.5 text-slate-400" /> },
  { status: "Baseline collected", label: "Baseline Collected",  color: "bg-blue-50 border-blue-200",      icon: <Package className="w-3.5 h-3.5 text-blue-500" /> },
  { status: "Action planning",    label: "Action Planning",     color: "bg-amber-50 border-amber-200",    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
  { status: "Target set",         label: "Target Set",          color: "bg-emerald-50 border-emerald-200",icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> },
];

const RISK_COLORS: Record<RiskLevel, string> = {
  Low:      "bg-emerald-100 text-emerald-700",
  Medium:   "bg-amber-100 text-amber-700",
  High:     "bg-rose-100 text-rose-700",
  Critical: "bg-red-100 text-red-800 font-bold",
};

const DQ_COLORS: Record<DataQuality, string> = {
  Primary:   "bg-emerald-100 text-emerald-700",
  Secondary: "bg-amber-100 text-amber-700",
  Estimated: "bg-slate-100 text-slate-600",
};

const ENGAGEMENT_COLOR: Record<EngagementStatus, string> = {
  "Baseline collected": "bg-blue-100 text-blue-700",
  "Target set":          "bg-emerald-100 text-emerald-700",
  "Action planning":     "bg-amber-100 text-amber-700",
  "Not engaged":         "bg-slate-100 text-slate-600",
};

// Country roll-up for bar chart
const countryRollup = () => {
  const map: Record<string, number> = {};
  DEMO_SUPPLIERS.forEach(s => {
    map[s.country] = (map[s.country] ?? 0) + s.tCO2e;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, tCO2e]) => ({ country: country.length > 14 ? country.slice(0, 12) + "…" : country, tCO2e }));
};
const COUNTRY_DATA = countryRollup();

const totalTCO2e = DEMO_SUPPLIERS.reduce((s, x) => s + x.tCO2e, 0);
const notEngaged  = DEMO_SUPPLIERS.filter(s => s.engagementStatus === "Not engaged").length;
const avgDQ       = Math.round(DEMO_SUPPLIERS.reduce((s, x) => s + x.dataQualityScore, 0) / DEMO_SUPPLIERS.length);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SupplyChainMapPage() {
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [view, setView] = useState<"map" | "kanban">("map");
  const [search, setSearch] = useState("");

  const filtered = DEMO_SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supply Chain Map</h1>
          <p className="text-slate-500 text-sm mt-0.5">Scope 3 Category 1 — {DEMO_SUPPLIERS.length} strategic suppliers · {formatNumber(totalTCO2e, 0)} tCO₂e</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
          {(["map", "kanban"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-1.5 capitalize font-medium transition-colors",
                view === v ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-50")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Scope 3 Cat 1",  value: `${formatNumber(totalTCO2e, 0)} tCO₂e`, sub: "12 suppliers"        },
          { label: "Not Engaged",           value: notEngaged,                              sub: "need outreach"       },
          { label: "Avg Data Quality",      value: `${avgDQ}/100`,                          sub: "GHG Protocol DQ"    },
          { label: "Coverage",              value: `${formatNumber(DEMO_SUPPLIERS.reduce((s,x) => s+x.revenueShare,0),1)}%`,  sub: "of Scope 3 spend"    },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SVG world map */}
      {view === "map" && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Global Supplier Locations</CardTitle>
            <CardDescription className="text-xs">Click a dot to view supplier detail</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-[#0f172a] overflow-hidden rounded-b-xl" style={{ paddingTop: "50%" }}>
              <svg
                viewBox="0 0 800 400"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full"
              >
                {/* Ocean */}
                <rect width="800" height="400" fill="#0f172a" />
                {/* North America */}
                <path d="M80 60 L200 55 L220 90 L240 130 L210 180 L180 200 L140 210 L110 185 L75 160 L70 120 Z" fill="#1e3a5f" opacity="0.9" />
                {/* South America */}
                <path d="M185 215 L240 210 L265 250 L260 310 L235 350 L200 360 L180 330 L165 280 L170 240 Z" fill="#1e3a5f" opacity="0.9" />
                {/* Europe */}
                <path d="M370 65 L430 60 L450 80 L445 115 L420 130 L390 125 L370 105 Z" fill="#1e3a5f" opacity="0.9" />
                {/* Africa */}
                <path d="M385 145 L455 140 L475 170 L480 230 L460 290 L430 320 L400 315 L375 280 L365 230 L370 180 Z" fill="#1e3a5f" opacity="0.9" />
                {/* Middle East */}
                <path d="M455 130 L520 125 L540 160 L510 185 L470 180 L455 155 Z" fill="#1e3a5f" opacity="0.9" />
                {/* Russia / Central Asia */}
                <path d="M445 45 L700 40 L720 80 L700 100 L620 105 L550 100 L480 90 L450 70 Z" fill="#1e3a5f" opacity="0.9" />
                {/* South / SE Asia */}
                <path d="M560 125 L670 120 L710 155 L720 190 L680 210 L640 205 L590 190 L555 165 Z" fill="#1e3a5f" opacity="0.9" />
                {/* Australia */}
                <path d="M660 275 L760 270 L775 300 L770 335 L740 355 L700 355 L670 330 L652 305 Z" fill="#1e3a5f" opacity="0.9" />
                {/* New Zealand */}
                <path d="M755 325 L775 320 L780 345 L765 360 L748 350 Z" fill="#1e3a5f" opacity="0.9" />

                {/* Grid lines */}
                {[1,2,3,4,5,6,7].map(i => (
                  <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="400" stroke="#ffffff08" strokeWidth="1" />
                ))}
                {[1,2,3].map(i => (
                  <line key={`h${i}`} x1="0" y1={i*100} x2="800" y2={i*100} stroke="#ffffff08" strokeWidth="1" />
                ))}

                {/* Supplier dots */}
                {DEMO_SUPPLIERS.map(s => {
                  const isSelected = selected?.id === s.id;
                  const r = Math.max(6, Math.min(14, Math.sqrt(s.tCO2e / 300)));
                  const col = s.riskLevel === "Critical" ? "#ef4444" :
                              s.riskLevel === "High"     ? "#f97316" :
                              s.riskLevel === "Medium"   ? "#f59e0b" : "#10b981";
                  return (
                    <g key={s.id} onClick={() => setSelected(isSelected ? null : s)} style={{ cursor: "pointer" }}>
                      {isSelected && (
                        <circle cx={s.svgX} cy={s.svgY} r={r + 8} fill={col} opacity={0.25} />
                      )}
                      <circle cx={s.svgX} cy={s.svgY} r={r} fill={col} opacity={0.85} stroke="white" strokeWidth={isSelected ? 2.5 : 1} />
                      <text x={s.svgX} y={s.svgY + r + 9} textAnchor="middle" fill="white" fontSize="7" opacity={0.7}>
                        {s.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                {[
                  { col: "#ef4444", label: "Critical" },
                  { col: "#f97316", label: "High" },
                  { col: "#f59e0b", label: "Medium" },
                  { col: "#10b981", label: "Low" },
                ].map(({ col, label }, i) => (
                  <g key={label} transform={`translate(${14 + i * 70}, 375)`}>
                    <circle cx="6" cy="6" r="5" fill={col} opacity="0.85" />
                    <text x="14" y="10" fill="white" fontSize="9" opacity="0.7">{label}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Selected supplier panel */}
            {selected && (
              <div className="border-t border-slate-100 p-4 bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">{selected.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" /> {selected.country} · {selected.category}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {[
                    { l: "Emissions",     v: `${formatNumber(selected.tCO2e, 0)} tCO₂e` },
                    { l: "Revenue Share", v: `${selected.revenueShare}%` },
                    { l: "Intensity",     v: `${formatNumber(selected.intensity, 3)} tCO₂e/£` },
                    { l: "Reduction Tgt", v: selected.reductionTarget ? `${selected.reductionTarget}%` : "Not set" },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-white rounded-xl p-2.5 border border-slate-200">
                      <p className="text-xs text-slate-500">{l}</p>
                      <p className="font-bold text-sm text-slate-900">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge className={cn("text-xs", RISK_COLORS[selected.riskLevel])}>Risk: {selected.riskLevel}</Badge>
                  <Badge className={cn("text-xs", DQ_COLORS[selected.dataQuality])}>{selected.dataQuality} data · {selected.dataQualityScore}/100</Badge>
                  <Badge className={cn("text-xs", ENGAGEMENT_COLOR[selected.engagementStatus])}>{selected.engagementStatus}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search suppliers…"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KANBAN_COLS.map(col => {
              const items = filtered.filter(s => s.engagementStatus === col.status);
              return (
                <div key={col.status} className={cn("rounded-xl border p-3 space-y-2", col.color)}>
                  <div className="flex items-center gap-1.5">
                    {col.icon}
                    <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                    <span className="ml-auto text-xs text-slate-400">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(s => (
                      <button key={s.id} onClick={() => setSelected(s)}
                        className={cn("w-full text-left p-2.5 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md",
                          selected?.id === s.id ? "border-emerald-400 ring-1 ring-emerald-300" : "border-slate-200")}>
                        <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s.country}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-bold text-slate-700">{formatNumber(s.tCO2e, 0)} t</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold", RISK_COLORS[s.riskLevel])}>
                            {s.riskLevel}
                          </span>
                        </div>
                      </button>
                    ))}
                    {items.length === 0 && <p className="text-xs text-slate-400 text-center py-3">None</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Emissions by Country</CardTitle>
            <CardDescription className="text-xs">tCO₂e across all suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COUNTRY_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 90, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="country" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={88} />
                  <Tooltip formatter={(v: unknown) => [`${formatNumber(Number(v), 0)} tCO₂e`]} />
                  <Bar dataKey="tCO2e" radius={[0, 4, 4, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Emissions by Supplier</CardTitle>
            <CardDescription className="text-xs">tCO₂e — top contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...DEMO_SUPPLIERS].sort((a,b) => b.tCO2e - a.tCO2e).slice(0,8).map(s => ({
                    name: s.name.split(" ")[0] + (s.name.split(" ").length > 1 ? " " + s.name.split(" ")[1].slice(0,3) : ""),
                    tCO2e: s.tCO2e,
                    risk: s.riskLevel,
                  }))}
                  margin={{ top: 4, right: 8, left: -12, bottom: 28 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [`${formatNumber(Number(v), 0)} tCO₂e`]} />
                  <Bar dataKey="tCO2e" radius={[4, 4, 0, 0]}>
                    {[...DEMO_SUPPLIERS].sort((a,b) => b.tCO2e - a.tCO2e).slice(0,8).map((s, i) => (
                      <Cell key={i} fill={
                        s.riskLevel === "Critical" ? "#ef4444" :
                        s.riskLevel === "High"     ? "#f97316" :
                        s.riskLevel === "Medium"   ? "#f59e0b" : "#10b981"
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data quality table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" /> Engagement Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Supplier", "Country", "Category", "tCO₂e", "Data Quality", "Risk", "Status"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_SUPPLIERS.sort((a,b) => b.tCO2e - a.tCO2e).map((s, i) => (
                  <tr key={s.id} onClick={() => setSelected(s)}
                    className={cn("border-b border-slate-100 cursor-pointer transition-colors",
                      selected?.id === s.id ? "bg-emerald-50" : i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100")}>
                    <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{s.country}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{s.category}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900 tabular-nums">{formatNumber(s.tCO2e, 0)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${s.dataQualityScore}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.dataQualityScore}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", RISK_COLORS[s.riskLevel])}>{s.riskLevel}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap", ENGAGEMENT_COLOR[s.engagementStatus])}>
                        {s.engagementStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
