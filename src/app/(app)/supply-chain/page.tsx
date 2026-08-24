"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Truck, Star, AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp, TrendingDown } from "lucide-react";

type DataMaturity = "primary" | "activity" | "spend" | "default";
type EngagementStatus = "committed" | "in_progress" | "baseline_collected" | "not_started" | "unresponsive";
type SBTiStatus = "validated" | "committed" | "none";
type RiskLevel = "critical" | "high" | "medium" | "low";

interface Supplier {
  id: string;
  name: string;
  country: string;
  sector: string;
  annualSpendEURm: number;
  scope3Cat1tCO2e: number;
  dataMaturity: DataMaturity;
  engagementStatus: EngagementStatus;
  sbtiStatus: SBTiStatus;
  riskLevel: RiskLevel;
  reductionTargetPct: number | null;
  reportedReductionYoYPct: number | null;
  primaryDataCoverage: number;
  cdpScore: string | null;
  keyIssues: string[];
}

const SUPPLIERS: Supplier[] = [
  {
    id: "s1", name: "Steelworks GmbH", country: "Germany", sector: "Steel manufacturing",
    annualSpendEURm: 28.4, scope3Cat1tCO2e: 5840, dataMaturity: "primary",
    engagementStatus: "committed", sbtiStatus: "committed",
    riskLevel: "high", reductionTargetPct: 42, reportedReductionYoYPct: -8.2,
    primaryDataCoverage: 100, cdpScore: "B",
    keyIssues: ["High-emission blast furnace process", "Coal dependency"],
  },
  {
    id: "s2", name: "Plastiform SA", country: "France", sector: "Plastics & polymers",
    annualSpendEURm: 14.1, scope3Cat1tCO2e: 2340, dataMaturity: "activity",
    engagementStatus: "in_progress", sbtiStatus: "none",
    riskLevel: "high", reductionTargetPct: null, reportedReductionYoYPct: null,
    primaryDataCoverage: 0, cdpScore: "C",
    keyIssues: ["No decarbonisation target", "Fossil-based feedstock"],
  },
  {
    id: "s3", name: "LogiFreight AB", country: "Sweden", sector: "Freight transport",
    annualSpendEURm: 9.8, scope3Cat1tCO2e: 1870, dataMaturity: "activity",
    engagementStatus: "baseline_collected", sbtiStatus: "committed",
    riskLevel: "medium", reductionTargetPct: 30, reportedReductionYoYPct: -4.1,
    primaryDataCoverage: 60, cdpScore: "B-",
    keyIssues: ["Fleet electrification plan in draft"],
  },
  {
    id: "s4", name: "Chemix BV", country: "Netherlands", sector: "Specialty chemicals",
    annualSpendEURm: 7.3, scope3Cat1tCO2e: 3120, dataMaturity: "spend",
    engagementStatus: "not_started", sbtiStatus: "none",
    riskLevel: "critical", reductionTargetPct: null, reportedReductionYoYPct: null,
    primaryDataCoverage: 0, cdpScore: null,
    keyIssues: ["High-intensity sector", "No engagement response"],
  },
  {
    id: "s5", name: "Alucorp SpA", country: "Italy", sector: "Aluminium smelting",
    annualSpendEURm: 11.6, scope3Cat1tCO2e: 4780, dataMaturity: "primary",
    engagementStatus: "committed", sbtiStatus: "validated",
    riskLevel: "medium", reductionTargetPct: 50, reportedReductionYoYPct: -11.4,
    primaryDataCoverage: 100, cdpScore: "A-",
    keyIssues: ["Grid electricity carbon intensity dependency"],
  },
  {
    id: "s6", name: "PaperCo Oy", country: "Finland", sector: "Pulp & paper",
    annualSpendEURm: 4.2, scope3Cat1tCO2e: 620, dataMaturity: "activity",
    engagementStatus: "baseline_collected", sbtiStatus: "committed",
    riskLevel: "low", reductionTargetPct: 25, reportedReductionYoYPct: -3.8,
    primaryDataCoverage: 75, cdpScore: "B+",
    keyIssues: [],
  },
  {
    id: "s7", name: "ElectroComp Ltd", country: "UK", sector: "Electronics",
    annualSpendEURm: 6.5, scope3Cat1tCO2e: 890, dataMaturity: "spend",
    engagementStatus: "in_progress", sbtiStatus: "none",
    riskLevel: "medium", reductionTargetPct: null, reportedReductionYoYPct: null,
    primaryDataCoverage: 0, cdpScore: "D",
    keyIssues: ["Poor CDP disclosure", "No Scope 3 accounting"],
  },
  {
    id: "s8", name: "ConcretePro AS", country: "Norway", sector: "Cement & concrete",
    annualSpendEURm: 8.9, scope3Cat1tCO2e: 2650, dataMaturity: "activity",
    engagementStatus: "committed", sbtiStatus: "committed",
    riskLevel: "high", reductionTargetPct: 38, reportedReductionYoYPct: -6.0,
    primaryDataCoverage: 45, cdpScore: "B",
    keyIssues: ["Clinker ratio reduction needed"],
  },
  {
    id: "s9", name: "TextileMed", country: "Turkey", sector: "Textiles",
    annualSpendEURm: 3.1, scope3Cat1tCO2e: 480, dataMaturity: "spend",
    engagementStatus: "not_started", sbtiStatus: "none",
    riskLevel: "medium", reductionTargetPct: null, reportedReductionYoYPct: null,
    primaryDataCoverage: 0, cdpScore: null,
    keyIssues: ["Dyeing water usage", "Coal-powered grid"],
  },
  {
    id: "s10", name: "BioPackage GmbH", country: "Austria", sector: "Sustainable packaging",
    annualSpendEURm: 2.4, scope3Cat1tCO2e: 190, dataMaturity: "primary",
    engagementStatus: "committed", sbtiStatus: "validated",
    riskLevel: "low", reductionTargetPct: 60, reportedReductionYoYPct: -14.2,
    primaryDataCoverage: 100, cdpScore: "A",
    keyIssues: [],
  },
];

const MATURITY_CONFIG: Record<DataMaturity, { label: string; color: string; score: number }> = {
  primary: { label: "Primary", color: "#10b981", score: 4 },
  activity: { label: "Activity-based", color: "#3b82f6", score: 3 },
  spend: { label: "Spend-based", color: "#f59e0b", score: 2 },
  default: { label: "Default EF", color: "#ef4444", score: 1 },
};

const ENGAGEMENT_CONFIG: Record<EngagementStatus, { label: string; color: string }> = {
  committed: { label: "Committed", color: "#10b981" },
  in_progress: { label: "In progress", color: "#3b82f6" },
  baseline_collected: { label: "Baseline collected", color: "#8b5cf6" },
  not_started: { label: "Not started", color: "#f59e0b" },
  unresponsive: { label: "Unresponsive", color: "#ef4444" },
};

const SBTI_CONFIG: Record<SBTiStatus, { label: string; color: string }> = {
  validated: { label: "Validated", color: "#10b981" },
  committed: { label: "Committed", color: "#3b82f6" },
  none: { label: "None", color: "#9ca3af" },
};

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: "#7f1d1d",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function SupplyChainPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"emissions" | "risk" | "spend">("emissions");
  const [filterStatus, setFilterStatus] = useState<EngagementStatus | "all">("all");

  const sorted = useMemo(() => {
    let s = [...SUPPLIERS].filter(x => filterStatus === "all" || x.engagementStatus === filterStatus);
    if (sortBy === "emissions") s.sort((a, b) => b.scope3Cat1tCO2e - a.scope3Cat1tCO2e);
    else if (sortBy === "spend") s.sort((a, b) => b.annualSpendEURm - a.annualSpendEURm);
    else s.sort((a, b) => {
      const order: RiskLevel[] = ["critical", "high", "medium", "low"];
      return order.indexOf(a.riskLevel) - order.indexOf(b.riskLevel);
    });
    return s;
  }, [sortBy, filterStatus]);

  const totalEmissions = SUPPLIERS.reduce((s, x) => s + x.scope3Cat1tCO2e, 0);
  const primaryCoverage = SUPPLIERS.reduce((s, x) => s + x.scope3Cat1tCO2e * (x.primaryDataCoverage / 100), 0);
  const sbtiAligned = SUPPLIERS.filter(x => x.sbtiStatus !== "none").length;
  const criticalHigh = SUPPLIERS.filter(x => x.riskLevel === "critical" || x.riskLevel === "high").length;

  const maturityBreakdown = (["primary", "activity", "spend", "default"] as DataMaturity[]).map(m => ({
    name: MATURITY_CONFIG[m].label,
    tCO2e: SUPPLIERS.filter(x => x.dataMaturity === m).reduce((s, x) => s + x.scope3Cat1tCO2e, 0),
    fill: MATURITY_CONFIG[m].color,
  }));

  const radarData = [
    { subject: "SBTi alignment", value: Math.round((sbtiAligned / SUPPLIERS.length) * 100) },
    { subject: "Primary data", value: Math.round((primaryCoverage / totalEmissions) * 100) },
    { subject: "Engagement rate", value: Math.round((SUPPLIERS.filter(x => x.engagementStatus !== "not_started" && x.engagementStatus !== "unresponsive").length / SUPPLIERS.length) * 100) },
    { subject: "CDP disclosure", value: Math.round((SUPPLIERS.filter(x => x.cdpScore !== null).length / SUPPLIERS.length) * 100) },
    { subject: "Reduction targets", value: Math.round((SUPPLIERS.filter(x => x.reductionTargetPct !== null).length / SUPPLIERS.length) * 100) },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-500" />
          Supply Chain Decarbonization
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Scope 3 Category 1 · Supplier engagement maturity · SBTi alignment · Primary data coverage
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cat. 1 Emissions", value: `${(totalEmissions / 1000).toFixed(1)}k tCO₂e`, sub: "Purchased goods & services", color: "text-blue-600" },
          { label: "Primary Data Coverage", value: `${((primaryCoverage / totalEmissions) * 100).toFixed(0)}%`, sub: "of Cat. 1 by weight", color: "text-emerald-600" },
          { label: "SBTi-Aligned Suppliers", value: `${sbtiAligned} / ${SUPPLIERS.length}`, sub: "Committed or validated", color: "text-purple-600" },
          { label: "High / Critical Risk", value: `${criticalHigh}`, sub: "Require priority action", color: "text-red-600" },
        ].map(c => (
          <Card key={c.label}><CardContent className="pt-5">
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Suppliers by Cat. 1 Emissions</CardTitle>
            <CardDescription className="text-xs">tCO₂e · coloured by data maturity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...SUPPLIERS].sort((a, b) => b.scope3Cat1tCO2e - a.scope3Cat1tCO2e).slice(0, 8)} layout="vertical" margin={{ left: 80, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString()} tCO₂e`} />
                <Bar dataKey="scope3Cat1tCO2e" radius={[0, 4, 4, 0]}>
                  {[...SUPPLIERS].sort((a, b) => b.scope3Cat1tCO2e - a.scope3Cat1tCO2e).slice(0, 8).map(s => (
                    <Cell key={s.id} fill={MATURITY_CONFIG[s.dataMaturity].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Supply Chain Maturity Radar</CardTitle>
            <CardDescription className="text-xs">% of suppliers meeting criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Portfolio" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data maturity breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Emissions by Data Maturity</CardTitle>
            <CardDescription className="text-xs">GHG Protocol data quality hierarchy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={maturityBreakdown} dataKey="tCO2e" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {maturityBreakdown.map(m => <Cell key={m.name} fill={m.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v).toLocaleString()} tCO₂e`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Engagement Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {(Object.entries(ENGAGEMENT_CONFIG) as [EngagementStatus, typeof ENGAGEMENT_CONFIG[EngagementStatus]][]).map(([k, cfg]) => {
              const count = SUPPLIERS.filter(s => s.engagementStatus === k).length;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-32 shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / SUPPLIERS.length) * 100}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="text-xs font-medium w-4 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Filters + table */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium">Filter:</span>
        {(["all", "committed", "in_progress", "baseline_collected", "not_started", "unresponsive"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
          >
            {s === "all" ? "All" : ENGAGEMENT_CONFIG[s].label}
          </button>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        <span className="text-xs text-gray-500 font-medium">Sort:</span>
        {(["emissions", "risk", "spend"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${sortBy === s ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["Supplier", "Sector / Country", "Spend (€m)", "Cat. 1 (tCO₂e)", "Data Maturity", "Engagement", "SBTi", "YoY Δ", "Risk", ""].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map(s => (
                  <>
                    <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                      <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                      <td className="px-3 py-2 text-gray-500">{s.sector}<br />{s.country}</td>
                      <td className="px-3 py-2">€{s.annualSpendEURm}</td>
                      <td className="px-3 py-2 font-medium">{s.scope3Cat1tCO2e.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: MATURITY_CONFIG[s.dataMaturity].color }}>
                          {MATURITY_CONFIG[s.dataMaturity].label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: ENGAGEMENT_CONFIG[s.engagementStatus].color, backgroundColor: ENGAGEMENT_CONFIG[s.engagementStatus].color + "22" }}>
                          {ENGAGEMENT_CONFIG[s.engagementStatus].label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: SBTI_CONFIG[s.sbtiStatus].color, backgroundColor: SBTI_CONFIG[s.sbtiStatus].color + "22" }}>
                          {SBTI_CONFIG[s.sbtiStatus].label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {s.reportedReductionYoYPct !== null
                          ? <span className="text-emerald-600 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" />{s.reportedReductionYoYPct}%</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize text-white" style={{ backgroundColor: RISK_COLORS[s.riskLevel] }}>
                          {s.riskLevel}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">
                        {expanded === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={`${s.id}-exp`}>
                        <td colSpan={10} className="bg-blue-50 px-4 py-3">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Primary Data Coverage</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.primaryDataCoverage}%` }} />
                                </div>
                                <span className="font-bold">{s.primaryDataCoverage}%</span>
                              </div>
                              <p className="mt-2 font-semibold text-gray-700">CDP Score</p>
                              <p className="text-lg font-bold text-gray-800">{s.cdpScore ?? "Not disclosed"}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Reduction Target</p>
                              <p>{s.reductionTargetPct !== null ? `−${s.reductionTargetPct}% by 2030` : "No target set"}</p>
                              <p className="mt-2 font-semibold text-gray-700">Reported YoY Change</p>
                              <p>{s.reportedReductionYoYPct !== null ? `${s.reportedReductionYoYPct}% vs prior year` : "Not reported"}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Key Issues</p>
                              {s.keyIssues.length > 0
                                ? <ul className="space-y-1">{s.keyIssues.map((i, idx) => <li key={idx} className="flex gap-2 text-red-700"><AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-red-500" />{i}</li>)}</ul>
                                : <p className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> No critical issues</p>}
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
        <p className="font-semibold text-gray-700 mb-1">Methodology</p>
        <p>GHG Protocol Scope 3 Standard (2011) Category 1 — Purchased goods and services. Data maturity hierarchy: primary (supplier-specific measured data) &gt; activity-based (spend × emission factor) &gt; spend-based (economic input-output). SBTi alignment per Corporate Net-Zero Standard v1.1 (2021). CDP scores from latest CDP questionnaire cycle.</p>
      </div>
    </div>
  );
}
