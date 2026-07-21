"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { FileBarChart2, Download, TrendingDown, CheckCircle2, AlertTriangle, Target, Shield, Globe } from "lucide-react";

type ReportPeriod = "Q4 2024" | "FY 2024" | "FY 2023";
type Audience = "board" | "investors" | "regulators" | "public";

const PERIODS: ReportPeriod[] = ["Q4 2024", "FY 2024", "FY 2023"];
const AUDIENCES: { key: Audience; label: string }[] = [
  { key: "board", label: "Board / C-suite" },
  { key: "investors", label: "Investor ESG" },
  { key: "regulators", label: "Regulatory (CSRD)" },
  { key: "public", label: "Public / CDP" },
];

// ── Demo data ─────────────────────────────────────────────────────────────────
const EMISSION_TREND = [
  { year: "2020", s1: 9200, s2: 5100, s3: 18400, total: 32700 },
  { year: "2021", s1: 8800, s2: 4700, s3: 17200, total: 30700 },
  { year: "2022", s1: 8100, s2: 4400, s3: 16800, total: 29300 },
  { year: "2023", s1: 7100, s2: 4200, s3: 15500, total: 26800 },
  { year: "2024", s1: 6420, s2: 3780, s3: 14440, total: 24640 },
];

const INTENSITY_TREND = [
  { year: "2020", intensity: 221, target: 221 },
  { year: "2021", intensity: 209, target: 205 },
  { year: "2022", intensity: 197, target: 189 },
  { year: "2023", intensity: 185, target: 173 },
  { year: "2024", intensity: 172, target: 157 },
  { year: "2025", intensity: null, target: 141 },
  { year: "2026", intensity: null, target: 125 },
  { year: "2027", intensity: null, target: 109 },
  { year: "2028", intensity: null, target: 93 },
  { year: "2029", intensity: null, target: 77 },
  { year: "2030", intensity: null, target: 62 },
];

const SCOPE_BREAKDOWN = [
  { name: "Scope 1", value: 6420, color: "#ef4444" },
  { name: "Scope 2 (MB)", value: 3780, color: "#f97316" },
  { name: "Scope 3", value: 14440, color: "#eab308" },
];

const ABATEMENT = [
  { lever: "Renewable energy (PPA)", reduction: 840, cost: 2.1 },
  { lever: "Fleet electrification", reduction: 320, cost: 4.8 },
  { lever: "Heat pump (heat decarbonisation)", reduction: 290, cost: 3.6 },
  { lever: "Supplier engagement (Cat. 1)", reduction: 1240, cost: 0.8 },
  { lever: "Building efficiency", reduction: 180, cost: 1.4 },
  { lever: "Process optimisation", reduction: 95, cost: 0.3 },
];

const REG_COMPLIANCE = [
  { reg: "CSRD", readiness: 62, deadline: "Apr 2026", status: "amber" },
  { reg: "EU ETS", readiness: 85, deadline: "Apr 2025", status: "green" },
  { reg: "CBAM", readiness: 40, deadline: "Jan 2026", status: "red" },
  { reg: "UK SECR", readiness: 78, deadline: "Sep 2025", status: "green" },
  { reg: "SBTi", readiness: 70, deadline: "Sep 2025", status: "amber" },
];

const BOARD_KPIs = [
  { label: "Total GHG (tCO₂e)", value: "24,640", delta: "−8.1% YoY", good: true, icon: TrendingDown },
  { label: "vs. SBTi Pathway", value: "−3.2%", delta: "Ahead of pathway", good: true, icon: Target },
  { label: "Verification Coverage", value: "74%", delta: "+6pp YoY", good: true, icon: Shield },
  { label: "Regulatory Readiness", value: "63%", delta: "2 regs at risk", good: false, icon: Globe },
  { label: "CBAM Obligation (2026)", value: "€342k", delta: "Full phase-in: €13.7m", good: null, icon: AlertTriangle },
  { label: "Nature Exposure", value: "€55.6m", delta: "TNFD disclosure partial", good: null, icon: Globe },
];

const AUDIENCE_SECTIONS: Record<Audience, string[]> = {
  board: ["KPI Overview", "Emissions Trend", "SBTi Pathway", "Regulatory Dashboard", "Top Risks"],
  investors: ["KPI Overview", "Emissions Trend", "SBTi Pathway", "Scope 3 Breakdown", "Abatement Levers", "Nature Risk"],
  regulators: ["Emissions Trend", "SBTi Pathway", "Regulatory Dashboard", "ESRS E1 Summary", "Verification Statement"],
  public: ["KPI Overview", "Emissions Trend", "SBTi Pathway", "Abatement Levers", "Nature Risk"],
};

const STATUS_COLOR = { green: "#10b981", amber: "#f59e0b", red: "#ef4444" };

export default function ExecutiveReportingPage() {
  const [period, setPeriod] = useState<ReportPeriod>("FY 2024");
  const [audience, setAudience] = useState<Audience>("board");

  const sections = AUDIENCE_SECTIONS[audience];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-indigo-500" />
            Executive Reporting
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Board-ready KPI packs · Investor ESG briefings · Regulatory submissions · CDP public disclosure
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Period:</span>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${period === p ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Audience:</span>
          {AUDIENCES.map(a => (
            <button key={a.key} onClick={() => setAudience(a.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${audience === a.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-600 hover:border-emerald-400"}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active sections indicator */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500">Sections in this pack:</span>
        {sections.map(s => (
          <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs border border-indigo-200">{s}</span>
        ))}
      </div>

      {/* KPI Overview (always shown) */}
      {sections.includes("KPI Overview") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{period} · Key Performance Indicators</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARD_KPIs.map(kpi => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className={kpi.good === false ? "border-red-200 bg-red-50" : kpi.good === true ? "border-emerald-200 bg-emerald-50" : ""}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{kpi.value}</p>
                        <p className={`text-xs mt-0.5 font-medium ${kpi.good === true ? "text-emerald-600" : kpi.good === false ? "text-red-600" : "text-amber-600"}`}>
                          {kpi.delta}
                        </p>
                      </div>
                      <Icon className={`w-5 h-5 ${kpi.good === true ? "text-emerald-500" : kpi.good === false ? "text-red-500" : "text-amber-500"}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Emissions Trend */}
      {sections.includes("Emissions Trend") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Emissions Trend (2020–{period.slice(-4)})</h2>
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={EMISSION_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()} tCO₂e`} />
                  <Legend />
                  <Area type="monotone" dataKey="s3" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="Scope 3" />
                  <Area type="monotone" dataKey="s2" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.7} name="Scope 2" />
                  <Area type="monotone" dataKey="s1" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Scope 1" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* SBTi Pathway */}
      {sections.includes("SBTi Pathway") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">SBTi 1.5°C Pathway vs. Actual</h2>
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={INTENSITY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} label={{ value: "tCO₂e/$M", angle: -90, position: "insideLeft", fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="intensity" name="Actual intensity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="target" name="SBTi pathway" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  <ReferenceLine x="2024" stroke="#9ca3af" strokeDasharray="4 2" label={{ value: "Today", fontSize: 10, fill: "#9ca3af" }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2 text-xs text-gray-500 justify-center">
                <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-blue-500 inline-block" /> Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-emerald-500 inline-block border-dashed border-emerald-500" /> SBTi 1.5°C pathway</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Regulatory Dashboard */}
      {sections.includes("Regulatory Dashboard") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Regulatory Compliance Readiness</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {REG_COMPLIANCE.map(r => (
              <Card key={r.reg}>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="font-bold text-gray-700 text-sm mb-2">{r.reg}</p>
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke={STATUS_COLOR[r.status as keyof typeof STATUS_COLOR]} strokeWidth="3"
                        strokeDasharray={`${r.readiness} ${100 - r.readiness}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: STATUS_COLOR[r.status as keyof typeof STATUS_COLOR] }}>
                      {r.readiness}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">Deadline: {r.deadline}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Scope 3 Breakdown */}
      {sections.includes("Scope 3 Breakdown") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">GHG Scope Breakdown — {period}</h2>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={200} height={180}>
                  <PieChart>
                    <Pie data={SCOPE_BREAKDOWN} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {SCOPE_BREAKDOWN.map(s => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${Number(v).toLocaleString()} tCO₂e`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {SCOPE_BREAKDOWN.map(s => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.value.toLocaleString()} tCO₂e · {((s.value / 24640) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Abatement Levers */}
      {sections.includes("Abatement Levers") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">2030 Abatement Levers</h2>
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ABATEMENT} layout="vertical" margin={{ left: 160, right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v} tCO₂e`} />
                  <YAxis type="category" dataKey="lever" tick={{ fontSize: 10 }} width={160} />
                  <Tooltip formatter={(v, name) => name === "reduction" ? `${Number(v)} tCO₂e` : `€${Number(v)}m`} />
                  <Bar dataKey="reduction" name="Reduction" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Top Risks */}
      {sections.includes("Top Risks") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Top Climate Risks — Board Briefing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Low-carbon market shift", impact: "€22–85m revenue", horizon: "Medium-term", level: "high" },
              { title: "EU ETS cost escalation", impact: "€8–21m P&L", horizon: "Short-term", level: "high" },
              { title: "Flood — manufacturing sites", impact: "€12–48m asset", horizon: "Medium-term", level: "high" },
            ].map(r => (
              <Card key={r.title} className="border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{r.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold shrink-0">HIGH</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{r.impact}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.horizon}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ESRS E1 Summary */}
      {sections.includes("ESRS E1 Summary") && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">ESRS E1 — Mandatory Disclosure Summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { sub: "E1-4", label: "Climate Targets", value: "4 targets", status: "green" },
              { sub: "E1-5", label: "Energy Consumption", value: "142,800 MWh", status: "green" },
              { sub: "E1-6", label: "GHG Emissions", value: "24,640 tCO₂e", status: "green" },
              { sub: "E1-9", label: "Financial Effects", value: "Partial", status: "amber" },
            ].map(e => (
              <Card key={e.sub}>
                <CardContent className="pt-4">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">{e.sub}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{e.label}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{e.value}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: STATUS_COLOR[e.status as keyof typeof STATUS_COLOR] }}>
                    {e.status === "green" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {e.status === "green" ? "Compliant" : "Gap exists"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">{period} Sustainability Report · Auto-generated · CONFIDENTIAL DRAFT</p>
        <p>Data sourced from internal GHG inventory. Scope 1+2 externally verified under ISO 14064-3 (limited assurance). Scope 3 unverified. SBTi targets validated November 2023. Audience profile: <strong className="capitalize">{audience}</strong> — sections filtered accordingly.</p>
      </div>
    </div>
  );
}
