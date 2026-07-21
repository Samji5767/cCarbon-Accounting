"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { ShieldAlert, Thermometer, TrendingDown, Building2, ChevronDown, ChevronUp, Filter } from "lucide-react";

type RiskType = "physical" | "transition";
type RiskCategory = "acute" | "chronic" | "policy" | "legal" | "technology" | "market" | "reputation";
type Likelihood = 1 | 2 | 3 | 4 | 5;
type Magnitude = 1 | 2 | 3 | 4 | 5;
type TimeHorizon = "short" | "medium" | "long";
type Scenario = "1.5C" | "2C" | "3C" | "4C";

interface ClimateRisk {
  id: string;
  type: RiskType;
  category: RiskCategory;
  name: string;
  description: string;
  assetGroup: string;
  scenarios: Scenario[];
  timeHorizon: TimeHorizon;
  likelihood: Likelihood;
  magnitude: Magnitude;
  financialImpactLowEURm: number;
  financialImpactHighEURm: number;
  impactType: "revenue" | "opex" | "capex" | "asset_value" | "liability";
  currentControls: string;
  residualRisk: "low" | "medium" | "high" | "critical";
  owner: string;
}

const RISKS: ClimateRisk[] = [
  {
    id: "r01", type: "physical", category: "acute",
    name: "Flood — Manufacturing facilities",
    description: "Increased frequency and intensity of river and coastal flooding events threatening production sites in low-lying areas.",
    assetGroup: "Manufacturing — Sites A, B", scenarios: ["3C", "4C"], timeHorizon: "medium",
    likelihood: 4, magnitude: 4,
    financialImpactLowEURm: 12, financialImpactHighEURm: 48,
    impactType: "asset_value", currentControls: "Flood barriers, business continuity plan",
    residualRisk: "high", owner: "Operations Director",
  },
  {
    id: "r02", type: "physical", category: "chronic",
    name: "Chronic heat stress — cooling costs",
    description: "Rising mean temperatures increase energy demand for cooling across European manufacturing facilities.",
    assetGroup: "All facilities", scenarios: ["2C", "3C", "4C"], timeHorizon: "long",
    likelihood: 5, magnitude: 3,
    financialImpactLowEURm: 3.5, financialImpactHighEURm: 9.2,
    impactType: "opex", currentControls: "HVAC upgrades (partial)",
    residualRisk: "medium", owner: "Facilities Manager",
  },
  {
    id: "r03", type: "physical", category: "chronic",
    name: "Water scarcity — operations",
    description: "Drought conditions in Southern European supply regions reduce water availability for cooling and production processes.",
    assetGroup: "Site C (Spain)", scenarios: ["2C", "3C", "4C"], timeHorizon: "medium",
    likelihood: 3, magnitude: 3,
    financialImpactLowEURm: 2.0, financialImpactHighEURm: 7.5,
    impactType: "opex", currentControls: "Water recycling system installed 2023",
    residualRisk: "medium", owner: "Environmental Manager",
  },
  {
    id: "r04", type: "transition", category: "policy",
    name: "EU ETS Phase 4 tightening — free allocation reduction",
    description: "Accelerated reduction in EU ETS free allowances increases carbon cost for Scope 1 emissions from 2026.",
    assetGroup: "All EU production", scenarios: ["1.5C", "2C"], timeHorizon: "short",
    likelihood: 5, magnitude: 4,
    financialImpactLowEURm: 8.4, financialImpactHighEURm: 21.0,
    impactType: "opex", currentControls: "Abatement roadmap, energy efficiency investments",
    residualRisk: "high", owner: "CFO",
  },
  {
    id: "r05", type: "transition", category: "policy",
    name: "CBAM — import cost exposure",
    description: "EU Carbon Border Adjustment Mechanism certificates required for imported steel and aluminium inputs.",
    assetGroup: "Procurement", scenarios: ["1.5C", "2C"], timeHorizon: "short",
    likelihood: 5, magnitude: 3,
    financialImpactLowEURm: 1.8, financialImpactHighEURm: 5.4,
    impactType: "opex", currentControls: "CBAM monitoring dashboard, supplier diversification review",
    residualRisk: "medium", owner: "Procurement Director",
  },
  {
    id: "r06", type: "transition", category: "market",
    name: "Low-carbon product demand shift",
    description: "Customers shift to low-carbon alternatives; conventional product revenue declines in key segments.",
    assetGroup: "Product Line A", scenarios: ["1.5C", "2C"], timeHorizon: "medium",
    likelihood: 4, magnitude: 5,
    financialImpactLowEURm: 22.0, financialImpactHighEURm: 85.0,
    impactType: "revenue", currentControls: "Green product line launched; SBTi commitment published",
    residualRisk: "high", owner: "Chief Commercial Officer",
  },
  {
    id: "r07", type: "transition", category: "technology",
    name: "Electrification capex — fleet & heat",
    description: "Capital required to replace diesel fleet and gas boilers with electric alternatives ahead of regulatory phase-out.",
    assetGroup: "Fleet & Heat", scenarios: ["1.5C", "2C"], timeHorizon: "medium",
    likelihood: 5, magnitude: 3,
    financialImpactLowEURm: 14.0, financialImpactHighEURm: 28.0,
    impactType: "capex", currentControls: "Phased electrification plan 2024-2030",
    residualRisk: "medium", owner: "CTO",
  },
  {
    id: "r08", type: "transition", category: "legal",
    name: "Climate litigation — greenwashing claim",
    description: "Potential legal action from NGOs or investors if disclosed net-zero pathway is not backed by credible interim targets.",
    assetGroup: "Corporate", scenarios: ["1.5C", "2C"], timeHorizon: "short",
    likelihood: 2, magnitude: 4,
    financialImpactLowEURm: 5.0, financialImpactHighEURm: 35.0,
    impactType: "liability", currentControls: "SBTi-validated targets, external assurance",
    residualRisk: "medium", owner: "General Counsel",
  },
  {
    id: "r09", type: "physical", category: "acute",
    name: "Extreme wind — logistics disruption",
    description: "Increased storm intensity disrupts port operations and road freight in Northern Europe.",
    assetGroup: "Logistics & Distribution", scenarios: ["3C", "4C"], timeHorizon: "medium",
    likelihood: 3, magnitude: 2,
    financialImpactLowEURm: 1.2, financialImpactHighEURm: 4.8,
    impactType: "opex", currentControls: "Multi-mode routing, buffer stock policy",
    residualRisk: "low", owner: "Supply Chain Director",
  },
  {
    id: "r10", type: "transition", category: "reputation",
    name: "ESG rating downgrade — Scope 3 disclosure gap",
    description: "Failure to report full Scope 3 supply chain emissions damages ESG ratings, raising cost of capital.",
    assetGroup: "Corporate / Finance", scenarios: ["1.5C", "2C"], timeHorizon: "short",
    likelihood: 3, magnitude: 3,
    financialImpactLowEURm: 3.0, financialImpactHighEURm: 12.0,
    impactType: "liability", currentControls: "Scope 3 screening complete; supplier engagement programme",
    residualRisk: "medium", owner: "Head of Sustainability",
  },
];

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  acute: "#ef4444",
  chronic: "#f97316",
  policy: "#8b5cf6",
  legal: "#6366f1",
  technology: "#3b82f6",
  market: "#f59e0b",
  reputation: "#ec4899",
};

const RESIDUAL_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#7f1d1d" };
const HORIZON_LABEL: Record<TimeHorizon, string> = { short: "Short (0–5y)", medium: "Medium (5–15y)", long: "Long (15–30y)" };

function RiskScore({ l, m }: { l: Likelihood; m: Magnitude }) {
  const score = l * m;
  const color = score >= 16 ? "#ef4444" : score >= 9 ? "#f59e0b" : "#10b981";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: color }}>
        {score}
      </div>
      <span className="text-xs text-gray-400">L{l}×M{m}</span>
    </div>
  );
}

export default function ClimateRiskPage() {
  const [filterType, setFilterType] = useState<RiskType | "all">("all");
  const [filterHorizon, setFilterHorizon] = useState<TimeHorizon | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "impact">("score");

  const filtered = useMemo(() => {
    let r = RISKS.filter(r =>
      (filterType === "all" || r.type === filterType) &&
      (filterHorizon === "all" || r.timeHorizon === filterHorizon)
    );
    if (sortBy === "score") r = r.sort((a, b) => (b.likelihood * b.magnitude) - (a.likelihood * a.magnitude));
    else r = r.sort((a, b) => b.financialImpactHighEURm - a.financialImpactHighEURm);
    return r;
  }, [filterType, filterHorizon, sortBy]);

  const totalImpactLow = filtered.reduce((s, r) => s + r.financialImpactLowEURm, 0);
  const totalImpactHigh = filtered.reduce((s, r) => s + r.financialImpactHighEURm, 0);
  const physicalCount = filtered.filter(r => r.type === "physical").length;
  const transitionCount = filtered.filter(r => r.type === "transition").length;
  const criticalHigh = filtered.filter(r => r.residualRisk === "critical" || r.residualRisk === "high").length;

  const heatmapData = RISKS.map(r => ({
    x: r.likelihood, y: r.magnitude, z: r.financialImpactHighEURm,
    name: r.name, type: r.type,
  }));

  const categoryRollup = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => {
      map[r.category] = (map[r.category] ?? 0) + r.financialImpactHighEURm;
    });
    return Object.entries(map).map(([cat, v]) => ({ category: cat, impact: v })).sort((a, b) => b.impact - a.impact);
  }, [filtered]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Climate Risk Register
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            TCFD / ESRS E1-9 · Physical & transition risks · Financial quantification under climate scenarios
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Financial Exposure (P90)", value: `€${totalImpactHigh.toFixed(0)}m`, sub: `P10: €${totalImpactLow.toFixed(0)}m`, color: "text-red-600" },
          { label: "High / Critical Risks", value: `${criticalHigh}`, sub: `of ${filtered.length} identified`, color: "text-orange-600" },
          { label: "Physical Risks", value: `${physicalCount}`, sub: "Acute & chronic", color: "text-blue-600" },
          { label: "Transition Risks", value: `${transitionCount}`, sub: "Policy, market, legal", color: "text-purple-600" },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Financial Impact by Category (P90)</CardTitle>
            <CardDescription className="text-xs">EUR millions — high scenario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryRollup} layout="vertical" margin={{ left: 60, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `€${v}m`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(v) => `€${Number(v)}m`} />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {categoryRollup.map(c => (
                    <Cell key={c.category} fill={CATEGORY_COLORS[c.category as RiskCategory] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Heatmap — Likelihood × Magnitude</CardTitle>
            <CardDescription className="text-xs">Bubble size = P90 financial impact · Blue = physical · Purple = transition</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} label={{ value: "Likelihood", position: "insideBottom", offset: -2, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="y" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} label={{ value: "Magnitude", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
                <ZAxis dataKey="z" range={[60, 600]} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded p-2 text-xs shadow-md max-w-48">
                      <p className="font-medium">{d.name}</p>
                      <p className="text-gray-500">Impact: €{d.z}m (P90)</p>
                    </div>
                  );
                }} />
                <Scatter
                  data={heatmapData}
                  fill="#8b5cf6"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 text-xs text-gray-500"><Filter className="w-3 h-3" /> Type:</div>
        {(["all", "physical", "transition"] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterType === t ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1 text-xs text-gray-500">Horizon:</div>
        {(["all", "short", "medium", "long"] as const).map(h => (
          <button
            key={h}
            onClick={() => setFilterHorizon(h)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterHorizon === h ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
          >
            {h === "all" ? "All horizons" : HORIZON_LABEL[h]}
          </button>
        ))}
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1 text-xs text-gray-500">Sort:</div>
        {(["score", "impact"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${sortBy === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
          >
            {s === "score" ? "Risk score" : "Financial impact"}
          </button>
        ))}
      </div>

      {/* Risk register table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Risk Register ({filtered.length} risks)</CardTitle>
          <CardDescription className="text-xs">TCFD / ESRS E1-9 · Click to expand controls and financial quantification</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["Risk", "Type / Category", "Horizon", "Scenarios", "Risk Score", "Financial Impact (€m)", "Residual Risk", ""].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(r => (
                  <>
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800 max-w-52">{r.name}</p>
                        <p className="text-gray-400">{r.assetGroup}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${r.type === "physical" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {r.type}
                        </span>
                        <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: CATEGORY_COLORS[r.category] + "22", color: CATEGORY_COLORS[r.category] }}>
                          {r.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{HORIZON_LABEL[r.timeHorizon]}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {r.scenarios.map(s => (
                            <span key={s} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2"><RiskScore l={r.likelihood} m={r.magnitude} /></td>
                      <td className="px-3 py-2">
                        <span className="font-medium">€{r.financialImpactLowEURm}–{r.financialImpactHighEURm}m</span>
                        <p className="text-gray-400 text-[10px]">{r.impactType}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={{ backgroundColor: RESIDUAL_COLORS[r.residualRisk] + "22", color: RESIDUAL_COLORS[r.residualRisk] }}>
                          {r.residualRisk}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">
                        {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={`${r.id}-exp`}>
                        <td colSpan={8} className="bg-red-50 px-4 py-3">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Description</p>
                              <p className="text-gray-600">{r.description}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Current Controls</p>
                              <p className="text-gray-600">{r.currentControls}</p>
                              <p className="mt-2 font-semibold text-gray-700">Risk Owner</p>
                              <p className="text-gray-600">{r.owner}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Financial Quantification</p>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">P10 (low scenario)</span>
                                  <span className="font-medium">€{r.financialImpactLowEURm}m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">P90 (high scenario)</span>
                                  <span className="font-medium text-red-600">€{r.financialImpactHighEURm}m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Impact type</span>
                                  <span className="font-medium capitalize">{r.impactType.replace("_", " ")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Active under</span>
                                  <span className="font-medium">{r.scenarios.join(", ")} scenarios</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Framework alignment</p>
        <p>TCFD (2017) · ESRS E1-9 (2023) · IPCC AR6 climate scenarios (SSP1-1.9 → 1.5°C; SSP2-4.5 → 2°C; SSP3-7.0 → 3°C; SSP5-8.5 → 4°C). Financial ranges represent 10th–90th percentile NPV of impact over the relevant time horizon.</p>
      </div>
    </div>
  );
}
