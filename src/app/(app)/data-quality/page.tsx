"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Database, RefreshCw } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

// ISO 14064-1:2018 §6.10 data quality dimensions
// Based on GHG Protocol supplementary guidance + IPCC tiered approach

interface DataRecord {
  id: string;
  source: string;
  scope: number;
  category: string;
  emissionTco2e: number;
  tier: 1 | 2 | 3 | 4; // 1=measured, 2=site-specific EF, 3=industry EF, 4=spend-based
  efAge: number; // years since EF publication
  isMeasured: boolean;
  isSiteSpecific: boolean;
  thirdPartyVerified: boolean;
  lastReviewDate: string;
  dataGap: boolean;
  issues: string[];
}

const DEMO_RECORDS: DataRecord[] = [
  { id: "r1", source: "Natural gas boilers — Site A", scope: 1, category: "Stationary combustion", emissionTco2e: 2100, tier: 1, efAge: 1, isMeasured: true, isSiteSpecific: true, thirdPartyVerified: true, lastReviewDate: "2025-03-01", dataGap: false, issues: [] },
  { id: "r2", source: "Company vehicle fleet", scope: 1, category: "Mobile combustion", emissionTco2e: 1850, tier: 2, efAge: 1, isMeasured: false, isSiteSpecific: true, thirdPartyVerified: false, lastReviewDate: "2025-01-15", dataGap: false, issues: ["Odometer data missing for 3 vehicles"] },
  { id: "r3", source: "Refrigerant leakage (HCFC-22)", scope: 1, category: "Fugitive", emissionTco2e: 420, tier: 1, efAge: 3, isMeasured: true, isSiteSpecific: false, thirdPartyVerified: false, lastReviewDate: "2024-12-01", dataGap: false, issues: ["GWP100 value uses AR4 — update to AR5"] },
  { id: "r4", source: "Purchased electricity — US sites", scope: 2, category: "Electricity", emissionTco2e: 1680, tier: 2, efAge: 1, isMeasured: false, isSiteSpecific: true, thirdPartyVerified: true, lastReviewDate: "2025-04-01", dataGap: false, issues: [] },
  { id: "r5", source: "Purchased electricity — UK site", scope: 2, category: "Electricity", emissionTco2e: 310, tier: 2, efAge: 1, isMeasured: false, isSiteSpecific: true, thirdPartyVerified: false, lastReviewDate: "2025-04-01", dataGap: false, issues: [] },
  { id: "r6", source: "Purchased goods — Tier 1 suppliers", scope: 3, category: "Cat 1: Purchased goods", emissionTco2e: 12400, tier: 4, efAge: 2, isMeasured: false, isSiteSpecific: false, thirdPartyVerified: false, lastReviewDate: "2025-02-01", dataGap: true, issues: ["68% of spend still uses EEIO avg factors", "4 suppliers overdue for data submission"] },
  { id: "r7", source: "Purchased goods — SteelCo primary data", scope: 3, category: "Cat 1: Purchased goods", emissionTco2e: 6000, tier: 1, efAge: 0, isMeasured: true, isSiteSpecific: true, thirdPartyVerified: true, lastReviewDate: "2025-06-01", dataGap: false, issues: [] },
  { id: "r8", source: "Upstream freight (contract logistics)", scope: 3, category: "Cat 4: Transport", emissionTco2e: 2100, tier: 3, efAge: 1, isMeasured: false, isSiteSpecific: false, thirdPartyVerified: false, lastReviewDate: "2024-11-01", dataGap: false, issues: ["Distance data estimated; fuel consumption not collected"] },
  { id: "r9", source: "Business travel (air)", scope: 3, category: "Cat 6: Business travel", emissionTco2e: 480, tier: 3, efAge: 1, isMeasured: false, isSiteSpecific: false, thirdPartyVerified: false, lastReviewDate: "2025-01-01", dataGap: false, issues: ["Radiative forcing factor not applied"] },
  { id: "r10", source: "Use of sold products (EU ERA label)", scope: 3, category: "Cat 11: Use of products", emissionTco2e: 5800, tier: 2, efAge: 1, isMeasured: false, isSiteSpecific: true, thirdPartyVerified: false, lastReviewDate: "2025-05-01", dataGap: false, issues: [] },
];

// Scoring: 1-5 per dimension (5=best)
function scoreDQ(r: DataRecord) {
  const completeness = r.dataGap ? 2 : r.issues.length > 0 ? 3 : 5;
  const accuracy = r.isMeasured ? 5 : r.isSiteSpecific ? 4 : r.tier <= 2 ? 3 : 2;
  const timeliness = r.efAge === 0 ? 5 : r.efAge === 1 ? 4 : r.efAge <= 3 ? 3 : 2;
  const consistency = r.thirdPartyVerified ? 5 : r.tier === 1 ? 4 : 3;
  const transparency = r.issues.length === 0 ? 5 : r.issues.length === 1 ? 4 : 3;
  const avg = (completeness + accuracy + timeliness + consistency + transparency) / 5;
  return { completeness, accuracy, timeliness, consistency, transparency, avg };
}

const TIER_LABELS = { 1: "T1 Measured", 2: "T2 Site-specific EF", 3: "T3 Industry EF", 4: "T4 Spend-based" };
const TIER_COLORS = { 1: "bg-emerald-100 text-emerald-700", 2: "bg-blue-100 text-blue-700", 3: "bg-yellow-100 text-yellow-700", 4: "bg-red-100 text-red-700" };

const DIMENSION_LABELS = ["Completeness", "Accuracy", "Timeliness", "Consistency", "Transparency"];

export default function DataQualityPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<number | null>(null);

  const filtered = scopeFilter ? DEMO_RECORDS.filter(r => r.scope === scopeFilter) : DEMO_RECORDS;
  const selectedRecord = DEMO_RECORDS.find(r => r.id === selected);
  const selectedDQ = selectedRecord ? scoreDQ(selectedRecord) : null;

  // Portfolio-level DQ scores
  const totalCo2e = DEMO_RECORDS.reduce((s, r) => s + r.emissionTco2e, 0);
  const weightedDimensions = DIMENSION_LABELS.map((dim, i) => {
    const key = dim.toLowerCase() as keyof ReturnType<typeof scoreDQ>;
    const weighted = DEMO_RECORDS.reduce((s, r) => {
      const scores = scoreDQ(r);
      return s + (scores[key] as number) * (r.emissionTco2e / totalCo2e);
    }, 0);
    return { name: dim, score: Math.round(weighted * 10) / 10 };
  });

  const portfolioAvg = weightedDimensions.reduce((s, d) => s + d.score, 0) / 5;

  // Tier distribution by emission weight
  const tierDist = ([1, 2, 3, 4] as const).map(t => ({
    tier: TIER_LABELS[t],
    pct: Math.round(DEMO_RECORDS.filter(r => r.tier === t).reduce((s, r) => s + r.emissionTco2e, 0) / totalCo2e * 100),
    fill: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][t - 1],
  }));

  const openIssues = DEMO_RECORDS.flatMap(r => r.issues.map(issue => ({ source: r.source, issue })));

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Quality Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          ISO 14064-1:2018 §6.10 — five-dimension DQ scoring by emission source, weighted by tCO₂e contribution
        </p>
      </div>

      {/* Portfolio DQ score */}
      <div className={`p-5 rounded-xl border-2 ${portfolioAvg >= 4 ? "bg-emerald-50 border-emerald-400" : portfolioAvg >= 3 ? "bg-yellow-50 border-yellow-400" : "bg-red-50 border-red-400"}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-lg font-bold ${portfolioAvg >= 4 ? "text-emerald-800" : portfolioAvg >= 3 ? "text-yellow-800" : "text-red-800"}`}>
              Portfolio DQ Score: {portfolioAvg.toFixed(1)} / 5.0
            </p>
            <p className="text-sm mt-1 text-gray-600">
              Weighted by tCO₂e contribution across {DEMO_RECORDS.length} emission sources.{" "}
              {portfolioAvg >= 4 ? "High quality — suitable for limited assurance." : portfolioAvg >= 3 ? "Medium quality — targeted improvements needed before verification." : "Low quality — significant data gaps require remediation."}
            </p>
          </div>
          <div className="text-5xl font-bold" style={{ color: portfolioAvg >= 4 ? "#059669" : portfolioAvg >= 3 ? "#d97706" : "#dc2626" }}>
            {portfolioAvg >= 4 ? "A" : portfolioAvg >= 3 ? "B" : "C"}
          </div>
        </div>
        <div className="mt-3 h-2.5 bg-white/50 rounded-full border border-gray-200">
          <div className="h-2.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${(portfolioAvg / 5) * 100}%` }} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Open Issues</p>
          <p className="text-2xl font-bold text-red-600">{openIssues.length}</p>
          <p className="text-xs text-gray-400">requiring remediation</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Data Gaps</p>
          <p className="text-2xl font-bold text-amber-600">{DEMO_RECORDS.filter(r => r.dataGap).length} sources</p>
          <p className="text-xs text-gray-400">incomplete activity data</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">T1/T2 Coverage</p>
          <p className="text-2xl font-bold text-emerald-600">{tierDist[0].pct + tierDist[1].pct}%</p>
          <p className="text-xs text-gray-400">of tCO₂e by weight</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">3rd-Party Verified</p>
          <p className="text-2xl font-bold text-blue-600">{DEMO_RECORDS.filter(r => r.thirdPartyVerified).length}/{DEMO_RECORDS.length}</p>
          <p className="text-xs text-gray-400">sources</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle>DQ Dimensions — Portfolio</CardTitle>
            <CardDescription>tCO₂e-weighted average score per ISO 14064-1 dimension (1–5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={weightedDimensions}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                <Radar name="DQ Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {weightedDimensions.map(d => (
                <div key={d.name} className="text-center">
                  <p className={`text-sm font-bold ${d.score >= 4 ? "text-emerald-600" : d.score >= 3 ? "text-yellow-600" : "text-red-500"}`}>{d.score}</p>
                  <p className="text-[10px] text-gray-400">{d.name.slice(0, 5)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Emission Factor Tier Distribution</CardTitle>
            <CardDescription>% of total tCO₂e by data quality tier (T1=best, T4=worst)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tierDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="tier" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v}% of tCO₂e`]} />
                <Bar dataKey="pct" radius={4}>
                  {tierDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Issue log */}
      {openIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Open Data Quality Issues
            </CardTitle>
            <CardDescription>Issues requiring action before inventory submission or verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openIssues.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">{item.source}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{item.issue}</p>
                  </div>
                  <button className="ml-auto text-xs text-amber-600 underline shrink-0">Resolve</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emission Source DQ Inventory</CardTitle>
              <CardDescription>Click a row to see dimension-level scores. Filter by scope.</CardDescription>
            </div>
            <div className="flex gap-1">
              {([null, 1, 2, 3] as (number | null)[]).map(s => (
                <button key={String(s)} onClick={() => setScopeFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${scopeFilter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {s === null ? "All" : `S${s}`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                  <th className="text-left py-2 px-3 font-medium">Scope</th>
                  <th className="text-right py-2 px-3 font-medium">tCO₂e</th>
                  <th className="text-left py-2 px-3 font-medium">Tier</th>
                  <th className="text-right py-2 px-3 font-medium">DQ Score</th>
                  <th className="text-left py-2 px-3 font-medium">Verified</th>
                  <th className="text-left py-2 px-3 font-medium">Issues</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const dq = scoreDQ(r);
                  return (
                    <tr key={r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selected === r.id ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <td className="py-2 px-3 text-xs font-medium text-gray-800">{r.source}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${r.scope === 1 ? "bg-red-100 text-red-700" : r.scope === 2 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                          S{r.scope}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{formatNumber(r.emissionTco2e, 0)}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${TIER_COLORS[r.tier]}`}>{TIER_LABELS[r.tier]}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-bold text-sm ${dq.avg >= 4 ? "text-emerald-600" : dq.avg >= 3 ? "text-yellow-600" : "text-red-500"}`}>
                          {dq.avg.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {r.thirdPartyVerified
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-gray-300" />}
                      </td>
                      <td className="py-2 px-3">
                        {r.issues.length > 0
                          ? <span className="text-xs text-amber-600 font-medium">{r.issues.length} issue{r.issues.length > 1 ? "s" : ""}</span>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded dimension row */}
          {selectedRecord && selectedDQ && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-semibold text-gray-800 mb-3">{selectedRecord.source} — DQ breakdown</p>
              <div className="grid grid-cols-5 gap-3">
                {(["completeness", "accuracy", "timeliness", "consistency", "transparency"] as const).map((dim) => {
                  const score = selectedDQ[dim];
                  return (
                    <div key={dim} className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-white font-bold text-sm ${score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-yellow-500" : "bg-red-400"}`}>
                        {score}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{dim}</p>
                    </div>
                  );
                })}
              </div>
              {selectedRecord.issues.length > 0 && (
                <div className="mt-3 space-y-1">
                  {selectedRecord.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        DQ scoring follows ISO 14064-1:2018 §6.10 and GHG Protocol supplementary guidance. Five dimensions: Completeness (data gaps), Accuracy (measurement vs estimation), Timeliness (EF recency), Consistency (third-party verification), Transparency (documented issues). Scores 1–5; portfolio average weighted by tCO₂e contribution.
      </p>
    </div>
  );
}
