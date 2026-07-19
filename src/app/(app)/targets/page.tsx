"use client";

import { useState } from "react";
import { Target, TrendingDown, Calendar, CheckCircle, AlertTriangle, Plus, Zap, ArrowDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface EmissionTarget {
  id: string;
  name: string;
  type: string;
  baselineYear: number;
  targetYear: number;
  baselineCo2e: number;
  targetCo2e: number;
  reductionPct: number;
  scope: string;
  status: string;
}

const SCOPE_LABELS: Record<string, string> = {
  scope1: "Scope 1 Only",
  scope2: "Scope 2 Only",
  scope3: "Scope 3 Only",
  scope1_2: "Scope 1 & 2",
  all: "All Scopes (1+2+3)",
};

// SBTi 1.5°C pathway: −42% by 2030 from 2020 base (11,600 tCO₂e S1+S2)
// Actual = sum of S1+S2 from inventory
const PATHWAY_DATA = [
  { year: 2020, actual: 14300, pathway: 14300, gap: 0 },
  { year: 2021, actual: 13500, pathway: 13398, gap: 102 },
  { year: 2022, actual: 12500, pathway: 12496, gap: 4 },
  { year: 2023, actual: 11300, pathway: 11594, gap: -294 },
  { year: 2024, actual: 10200, pathway: 10692, gap: -492 },
  { year: 2025, actual: null, pathway: 9790, gap: null },
  { year: 2026, actual: null, pathway: 8888, gap: null },
  { year: 2027, actual: null, pathway: 7986, gap: null },
  { year: 2028, actual: null, pathway: 7084, gap: null },
  { year: 2029, actual: null, pathway: 6182, gap: null },
  { year: 2030, actual: null, pathway: 5280, gap: null },
];

// Annual SBTi deviation alerts (actual − pathway, positive = lagging)
const DEVIATION_ALERTS = [
  { year: 2021, deviation: 102, status: "lagging", message: "102 tCO₂e above pathway — review energy procurement" },
  { year: 2022, deviation: 4, status: "on_track", message: "4 tCO₂e above pathway — effectively on track" },
  { year: 2023, deviation: -294, status: "ahead", message: "294 tCO₂e ahead of pathway — early delivery of heat decarbonisation" },
  { year: 2024, deviation: -492, status: "ahead", message: "492 tCO₂e ahead of pathway — renewable PPA and fleet electrification delivering" },
];

// Milestone tracking
interface Milestone {
  year: number;
  label: string;
  target: string;
  status: "completed" | "on_track" | "at_risk" | "pending";
  note?: string;
}
const MILESTONES: Milestone[] = [
  { year: 2022, label: "100% renewable electricity (S2 LB)", target: "0 tCO₂e S2 LB", status: "completed", note: "EAC contracts executed Apr 2022" },
  { year: 2023, label: "SBTi near-term target submission", target: "Validated target", status: "completed", note: "Validated Nov 2023" },
  { year: 2024, label: "Fleet electrification Phase 1 (30%)", target: "−320 tCO₂e", status: "completed", note: "28% converted by Dec 2024" },
  { year: 2025, label: "Supplier engagement — 50% by spend", target: "5 of 10 key suppliers", status: "on_track", note: "3 committed; 2 in progress" },
  { year: 2026, label: "Heat pump installation — Sites A&B", target: "−290 tCO₂e", status: "at_risk", note: "Planning permission delayed" },
  { year: 2027, label: "Fleet electrification Phase 2 (80%)", target: "−640 tCO₂e total", status: "pending" },
  { year: 2028, label: "Scope 3 Cat. 1 primary data ≥80%", target: "≥80% by weight", status: "pending" },
  { year: 2030, label: "SBTi near-term target achieved", target: "−42% vs 2020 (S1+S2)", status: "pending" },
];

const DEMO_TARGETS: EmissionTarget[] = [
  { id: "target-1", name: "Net Zero by 2030 (Scope 1+2)", type: "absolute", baselineYear: 2020, targetYear: 2030, baselineCo2e: 14300, targetCo2e: 0, reductionPct: 100, scope: "scope1_2", status: "active" },
  { id: "target-2", name: "50% Scope 3 Reduction by 2030", type: "absolute", baselineYear: 2020, targetYear: 2030, baselineCo2e: 18400, targetCo2e: 9200, reductionPct: 50, scope: "scope3", status: "active" },
  { id: "target-3", name: "SBTi 1.5°C Near-term (Scope 1+2)", type: "sbti", baselineYear: 2020, targetYear: 2030, baselineCo2e: 14300, targetCo2e: 8294, reductionPct: 42, scope: "scope1_2", status: "active" },
];

export default function TargetsPage() {
  const [targets] = useState<EmissionTarget[]>(DEMO_TARGETS);

  const currentProgress = (t: EmissionTarget) => {
    // Simulated: current 2024 actual vs baseline
    const current = 1590;
    const progress = ((t.baselineCo2e - current) / (t.baselineCo2e - t.targetCo2e)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const deviationStats = {
    lagging: DEVIATION_ALERTS.filter(a => a.status === "lagging").length,
    ahead: DEVIATION_ALERTS.filter(a => a.status === "ahead").length,
    latestDeviation: DEVIATION_ALERTS[DEVIATION_ALERTS.length - 1],
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emission Reduction Targets</h1>
          <p className="text-gray-500 text-sm mt-1">Science-based targets · Net zero commitments · SBTi deviation alerts · Milestones</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Target
        </Button>
      </div>

      {/* Deviation alert banner */}
      {deviationStats.latestDeviation && (
        <div className={`flex items-start gap-3 rounded-xl p-4 border ${deviationStats.latestDeviation.status === "ahead" ? "bg-emerald-50 border-emerald-200" : deviationStats.latestDeviation.status === "lagging" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
          <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${deviationStats.latestDeviation.status === "ahead" ? "text-emerald-600" : "text-red-600"}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${deviationStats.latestDeviation.status === "ahead" ? "text-emerald-800" : "text-red-800"}`}>
              {deviationStats.latestDeviation.year} SBTi Pathway Deviation · {deviationStats.latestDeviation.status === "ahead" ? "Ahead of pathway ✓" : "Lagging behind pathway ⚠"}
            </p>
            <p className={`text-xs mt-0.5 ${deviationStats.latestDeviation.status === "ahead" ? "text-emerald-700" : "text-red-700"}`}>
              {deviationStats.latestDeviation.message}
            </p>
          </div>
          <span className={`text-lg font-bold ${deviationStats.latestDeviation.status === "ahead" ? "text-emerald-600" : "text-red-600"}`}>
            {deviationStats.latestDeviation.deviation > 0 ? "+" : ""}{deviationStats.latestDeviation.deviation} tCO₂e
          </span>
        </div>
      )}

      {/* SBTi info banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Science Based Targets Initiative (SBTi)</p>
            <p className="text-xs text-blue-700 mt-1">
              SBTi requires companies to reduce Scope 1 & 2 emissions by at least 42% by 2030 (from a 2020 baseline) to align with a 1.5°C pathway.
              Scope 3 must be covered if it represents ≥40% of total emissions. Targets must be verified by SBTi before public disclosure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pathway chart */}
      <Card>
        <CardHeader>
          <CardTitle>Emissions Reduction Pathway — Scope 1+2 (tCO₂e)</CardTitle>
          <CardDescription>Actual vs SBTi 1.5°C pathway · −42% by 2030 from 2020 baseline of 14,300 tCO₂e</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={PATHWAY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => typeof v === "number" ? `${Number(v).toLocaleString()} tCO₂e` : "Projected"} />
              <Legend />
              <Area type="monotone" dataKey="pathway" name="1.5°C Pathway" fill="#d1fae5" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" fillOpacity={0.4} />
              <Bar dataKey="actual" name="Actual S1+S2" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <ReferenceLine x={2024} stroke="#9ca3af" strokeDasharray="4 2" label={{ value: "Now", fontSize: 10, fill: "#9ca3af" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Annual deviation log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SBTi Annual Deviation Log</CardTitle>
          <CardDescription className="text-xs">Actual S1+S2 vs 1.5°C pathway per year · Positive = lagging, Negative = ahead</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Year", "Actual (tCO₂e)", "Pathway (tCO₂e)", "Deviation", "Status", "Action note"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {DEVIATION_ALERTS.map(a => (
                <tr key={a.year} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{a.year}</td>
                  <td className="px-3 py-2">{(PATHWAY_DATA.find(p => p.year === a.year)?.actual ?? 0).toLocaleString()}</td>
                  <td className="px-3 py-2">{(PATHWAY_DATA.find(p => p.year === a.year)?.pathway ?? 0).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className={`flex items-center gap-1 font-semibold ${a.deviation > 0 ? "text-red-600" : a.deviation < 0 ? "text-emerald-600" : "text-gray-500"}`}>
                      {a.deviation > 0 ? <AlertTriangle className="w-3 h-3" /> : a.deviation < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {a.deviation > 0 ? "+" : ""}{a.deviation} tCO₂e
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${a.status === "ahead" ? "bg-emerald-100 text-emerald-700" : a.status === "lagging" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {a.status === "on_track" ? "On track" : a.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Milestone tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Decarbonisation Milestones</CardTitle>
          <CardDescription className="text-xs">Key delivery points on the pathway to 2030 target</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200" />
            {MILESTONES.map((m, i) => {
              const dotColor = m.status === "completed" ? "#10b981" : m.status === "on_track" ? "#3b82f6" : m.status === "at_risk" ? "#ef4444" : "#9ca3af";
              return (
                <div key={i} className="relative flex items-start gap-4 pb-5 last:pb-0">
                  <div className="absolute -left-4 mt-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: dotColor }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{m.year}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${
                        m.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        m.status === "on_track" ? "bg-blue-100 text-blue-700" :
                        m.status === "at_risk" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{m.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{m.label}</p>
                    <p className="text-xs text-gray-500">Target: {m.target}{m.note ? ` · ${m.note}` : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Target cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {targets.map((t) => {
            const progress = currentProgress(t);
            const onTrack = progress >= ((2024 - t.baselineYear) / (t.targetYear - t.baselineYear)) * 100;

            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={onTrack ? "default" : "warning"}>
                        {onTrack ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> On Track</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> Lagging</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-800 text-sm mb-1">{t.name}</p>
                  <p className="text-xs text-gray-500 mb-4">{SCOPE_LABELS[t.scope] ?? t.scope} · {t.type.toUpperCase()}</p>

                  {/* Progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress toward {t.reductionPct}% reduction</span>
                      <span className="font-medium text-emerald-700">{formatNumber(progress, 0)}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${onTrack ? "bg-emerald-500" : "bg-amber-400"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Baseline</p>
                      <p className="text-sm font-bold text-gray-700">{formatNumber(t.baselineCo2e, 0)}t</p>
                      <p className="text-[10px] text-gray-400">{t.baselineYear}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-400">Current</p>
                      <p className="text-sm font-bold text-blue-700">1,590t</p>
                      <p className="text-[10px] text-blue-400">2024</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-xs text-emerald-400">Target</p>
                      <p className="text-sm font-bold text-emerald-700">{formatNumber(t.targetCo2e, 0)}t</p>
                      <p className="text-[10px] text-emerald-400">{t.targetYear}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{t.targetYear - 2024} years remaining</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Regulatory context */}
      <Card>
        <CardHeader>
          <CardTitle>Target Setting Frameworks</CardTitle>
          <CardDescription>Regulatory and voluntary target-setting standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              {
                name: "SBTi 1.5°C (Near-term)",
                desc: "≥42% reduction in Scope 1+2 by 2030 from 2020 baseline. Scope 3 if ≥40% of total.",
                status: "Submitted",
                statusColor: "default",
              },
              {
                name: "SBTi Net-Zero (Long-term)",
                desc: "Reduce absolute Scope 1, 2, 3 emissions by ≥90% before 2050. Neutralize residuals.",
                status: "Not yet",
                statusColor: "secondary",
              },
              {
                name: "EU CSRD – Climate Plan",
                desc: "Mandatory transition plan under ESRS E1 for EU-listed companies and large undertakings.",
                status: "In Progress",
                statusColor: "warning",
              },
              {
                name: "Race to Zero",
                desc: "UN-backed campaign: halve emissions by 2030, reach net zero before 2050.",
                status: "Committed",
                statusColor: "default",
              },
            ].map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <Badge variant={item.statusColor as "default" | "secondary" | "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
