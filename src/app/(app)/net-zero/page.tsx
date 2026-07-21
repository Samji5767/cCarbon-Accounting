"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Line, Legend } from "recharts";

// Net-zero pathway builder
// Based on SBTi Corporate Net-Zero Standard (2021) + Oxford Net Zero principles

type PathwayShape = "linear" | "front_loaded" | "back_loaded" | "sectoral";

const SHAPE_LABELS: Record<PathwayShape, string> = {
  linear: "Linear reduction",
  front_loaded: "Front-loaded (aggressive early)",
  back_loaded: "Back-loaded (technology-dependent)",
  sectoral: "Sectoral decarbonisation (SBTi)",
};

const SHAPE_DESC: Record<PathwayShape, string> = {
  linear: "Constant % reduction each year. Simplest to plan and communicate, but may miss early action opportunities.",
  front_loaded: "Higher reductions in early years when leverage is highest. Favoured by IPCC 1.5°C pathways.",
  back_loaded: "Relies on emerging technologies (green H₂, DAC, SAF) for later reductions. Higher risk of missing interim targets.",
  sectoral: "Follows IEA NZE sector-specific pathway. Manufacturing: faster 2030 cuts, then technology transition 2030–2050.",
};

// Residual emissions require permanent removals at net-zero year
// SBTi: residual ≤ 10% of base year S1+2+3 gross emissions at net-zero
const BASE_YEAR = 2020;
const BASE_CO2E = 43200; // tCO₂e S1+2+3 gross
const SBTI_RESIDUAL_LIMIT = BASE_CO2E * 0.10; // 4,320 tCO₂e

function buildPathway(shape: PathwayShape, netZeroYear: number, currentCo2e: number): { year: number; emissions: number; removals: number; net: number }[] {
  const years = Array.from({ length: netZeroYear - 2024 + 1 }, (_, i) => 2024 + i);
  const yrs = netZeroYear - 2024;

  return years.map((yr, i) => {
    const t = i / yrs; // 0..1
    let emissions: number;
    if (shape === "linear") {
      emissions = currentCo2e * (1 - t);
    } else if (shape === "front_loaded") {
      // Square root curve — drops fast early, levels off
      emissions = currentCo2e * Math.pow(1 - t, 0.6);
    } else if (shape === "back_loaded") {
      // Quadratic — slow early, faster later
      emissions = currentCo2e * Math.pow(1 - t, 1.7);
    } else {
      // Sectoral: steeper 2024-2030, plateau, then fast 2040-2050
      if (t < 0.23) {
        // 2024-2030: -42% (SBTi near-term)
        emissions = currentCo2e * (1 - t * 1.83);
      } else if (t < 0.6) {
        // 2030-2040: slower
        emissions = currentCo2e * 0.58 * (1 - (t - 0.23) * 0.7);
      } else {
        // 2040-2050: sharp drop to residual
        emissions = currentCo2e * 0.58 * 0.7 * (1 - (t - 0.6) * 2.5);
      }
    }
    emissions = Math.max(0, Math.round(emissions));
    // Removals ramp up toward net-zero year to cover residual
    const residualAtNetZero = Math.min(SBTI_RESIDUAL_LIMIT, currentCo2e * 0.05);
    const removals = t > 0.7 ? Math.round(residualAtNetZero * ((t - 0.7) / 0.3)) : 0;
    return { year: yr, emissions, removals, net: Math.max(0, emissions - removals) };
  });
}

const CARBON_BUDGET_SHAPES: Record<PathwayShape, string> = {
  linear: "Moderate — similar to 1.5°C 67% pathway",
  front_loaded: "Best — lowest cumulative emissions; aligns with Paris Agreement",
  back_loaded: "Worst — high cumulative emissions; technology risk",
  sectoral: "Good — follows IEA NZE sector decomposition",
};

const MILESTONES = [
  { year: 2025, target: "SBTi targets validated; ICP embedded in capex appraisals" },
  { year: 2026, target: "100% renewable electricity (RE100); heat pump conversion complete" },
  { year: 2027, target: "Fleet 60% electrified; supplier SBTi engagement >50% of Cat 1 spend" },
  { year: 2028, target: "Product redesign Phase 1 complete; Cat 11 use-phase emissions −20%" },
  { year: 2030, target: "SBTi near-term: −42% Sc 1+2 vs 2020; −25% Sc 3 vs 2020" },
  { year: 2035, target: "Net-zero Scope 1+2; residual offset by durable removals" },
  { year: 2040, target: "Scope 3 Cat 1+11 −70% vs 2020; transition to circular business model" },
  { year: 2050, target: "Corporate net-zero (SBTi CNZ Standard): ≤10% residual; 100% durable removal" },
];

export default function NetZeroPage() {
  const [shape, setShape] = useState<PathwayShape>("sectoral");
  const [netZeroYear, setNetZeroYear] = useState(2050);
  const [currentCo2e, setCurrentCo2e] = useState(35560);

  const pathway = buildPathway(shape, netZeroYear, currentCo2e);
  const cumulativeCo2e = pathway.reduce((s, p) => s + p.emissions, 0);
  const yearsToNZ = netZeroYear - 2024;
  const requiredReductionPct = ((currentCo2e - SBTI_RESIDUAL_LIMIT) / currentCo2e * 100).toFixed(1);
  const linearAnnualReductionPct = (100 / yearsToNZ).toFixed(1);

  // 2030 check
  const pt2030 = pathway.find(p => p.year === 2030);
  const reduction2030Pct = pt2030 ? ((currentCo2e - pt2030.emissions) / currentCo2e * 100).toFixed(1) : "—";
  const sbti2030Target = (currentCo2e * 0.58).toFixed(0);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Net-Zero Pathway Builder</h1>
        <p className="text-sm text-gray-500 mt-1">
          SBTi Corporate Net-Zero Standard (2021) — pathway modelling and milestone tracker
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader><CardTitle>Pathway Parameters</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Gross Emissions (tCO₂e/yr)</label>
            <input type="number" value={currentCo2e} onChange={e => setCurrentCo2e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-40" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Net-Zero Year</label>
            <input type="number" min={2035} max={2070} value={netZeroYear} onChange={e => setNetZeroYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-28" />
          </div>
          <div className="flex-1 min-w-60">
            <label className="text-sm font-medium text-gray-700 block mb-1">Pathway Shape</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SHAPE_LABELS) as PathwayShape[]).map(s => (
                <button key={s} onClick={() => setShape(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${shape === s ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                  {SHAPE_LABELS[s]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{SHAPE_DESC[shape]}</p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Required Gross Reduction</p>
          <p className="text-2xl font-bold text-gray-900">{requiredReductionPct}%</p>
          <p className="text-xs text-gray-400">before removals (SBTi: ≥90%)</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Annual Reduction Needed</p>
          <p className="text-2xl font-bold text-gray-900">{linearAnnualReductionPct}%/yr</p>
          <p className="text-xs text-gray-400">linear to {netZeroYear}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">2030 Emissions ({shape})</p>
          <p className={`text-2xl font-bold ${pt2030 && pt2030.emissions <= Number(sbti2030Target) ? "text-emerald-600" : "text-red-500"}`}>
            {pt2030 ? formatNumber(pt2030.emissions, 0) : "—"} t
          </p>
          <p className="text-xs text-gray-400">SBTi target: {formatNumber(Number(sbti2030Target), 0)} t</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Cumulative Budget Used</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(cumulativeCo2e / 1000, 0)}k t</p>
          <p className="text-xs text-gray-400">tCO₂e 2024–{netZeroYear}</p>
        </CardContent></Card>
      </div>

      {/* 2030 SBTi check */}
      {pt2030 && (
        <div className={`p-4 rounded-xl border-2 ${pt2030.emissions <= Number(sbti2030Target) ? "bg-emerald-50 border-emerald-400" : "bg-red-50 border-red-400"}`}>
          <p className={`font-semibold ${pt2030.emissions <= Number(sbti2030Target) ? "text-emerald-800" : "text-red-800"}`}>
            {pt2030.emissions <= Number(sbti2030Target)
              ? `✓ 2030 SBTi near-term target met: ${reduction2030Pct}% reduction (required: −42%)`
              : `✗ 2030 SBTi target missed: ${reduction2030Pct}% reduction achieved vs −42% required. Front-load reductions or accelerate transition actions.`}
          </p>
        </div>
      )}

      {/* Pathway chart */}
      <Card>
        <CardHeader>
          <CardTitle>Net-Zero Pathway — {SHAPE_LABELS[shape]}</CardTitle>
          <CardDescription>Gross emissions, carbon removals, and net emissions to {netZeroYear} (tCO₂e)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={pathway}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [typeof v === "number" ? `${formatNumber(v, 0)} tCO₂e` : v, name]} />
              <Legend />
              <ReferenceLine y={SBTI_RESIDUAL_LIMIT} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "SBTi residual limit (10% base year)", position: "insideTopRight", fontSize: 10, fill: "#d97706" }} />
              <Area type="monotone" dataKey="emissions" name="Gross emissions" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
              <Bar dataKey="removals" name="Carbon removals" fill="#10b981" fillOpacity={0.8} />
              <Line type="monotone" dataKey="net" name="Net emissions" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span>Cumulative budget: <strong>{formatNumber(cumulativeCo2e / 1000, 1)}k tCO₂e</strong></span>
            <span>SBTi residual max: <strong>{formatNumber(SBTI_RESIDUAL_LIMIT, 0)} tCO₂e</strong> ({(SBTI_RESIDUAL_LIMIT / BASE_CO2E * 100).toFixed(0)}% of 2020 base)</span>
            <span className="ml-auto font-medium text-amber-600">{CARBON_BUDGET_SHAPES[shape]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pathway comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Pathway Shape Comparison</CardTitle>
          <CardDescription>Cumulative tCO₂e budget consumed by each pathway shape (lower is better)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.keys(SHAPE_LABELS) as PathwayShape[]).map(s => {
              const pw = buildPathway(s, netZeroYear, currentCo2e);
              const cum = pw.reduce((sum, p) => sum + p.emissions, 0);
              const maxCum = buildPathway("back_loaded", netZeroYear, currentCo2e).reduce((sum, p) => sum + p.emissions, 0);
              const pct = (cum / maxCum) * 100;
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${s === shape ? "text-emerald-700" : "text-gray-700"}`}>
                      {SHAPE_LABELS[s]}{s === shape ? " (active)" : ""}
                    </span>
                    <span className="font-mono text-gray-900">{formatNumber(cum / 1000, 1)}k tCO₂e</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 rounded-full ${s === shape ? "bg-emerald-500" : "bg-gray-300"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Net-Zero Milestones</CardTitle>
          <CardDescription>Key commitments and decision gates on the path to net-zero by {netZeroYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {MILESTONES.map((m, i) => {
                const isPast = m.year <= 2024;
                const isCurrent = m.year === 2025 || m.year === 2026;
                return (
                  <div key={i} className="flex items-start gap-4 pl-10 relative">
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${isPast ? "bg-emerald-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"}`} />
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPast ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.year}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{m.target}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Sources: SBTi Corporate Net-Zero Standard v1.1 (2021); Oxford Net Zero principles (2022); IPCC AR6 WGI Table SPM.2 (remaining carbon budgets); IEA Net Zero by 2050 (2021). Near-term target: −42% Scope 1+2 by 2030 (SBTi 1.5°C well-below pathway). Net-zero definition: gross emissions reduced ≥90% vs base year; residual ≤10% of base year offset by durable removals (DAC, biochar, enhanced weathering). Biogenic sequestration not counted toward residual offset per SBTi CNZ guidance.
      </p>
    </div>
  );
}
