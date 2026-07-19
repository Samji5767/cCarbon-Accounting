"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

// TCFD-aligned scenario analysis
// Three canonical scenarios from IPCC SR1.5 / IEA WEO / NGFS
type Scenario = "NZE" | "SDS" | "STEPS";

const SCENARIOS: Record<Scenario, { label: string; color: string; description: string; tempBy2100: string }> = {
  NZE: {
    label: "Net Zero 2050 (NZE)",
    color: "#10b981",
    description: "IEA Net Zero Emissions by 2050 — 1.5°C pathway, rapid decarbonisation",
    tempBy2100: "1.5°C",
  },
  SDS: {
    label: "Sustainable Dev. (SDS)",
    color: "#3b82f6",
    description: "IEA Sustainable Development Scenario — well below 2°C, Paris-aligned",
    tempBy2100: "1.8°C",
  },
  STEPS: {
    label: "Stated Policies (STEPS)",
    color: "#f97316",
    description: "IEA Stated Policies — current policies only, high physical risk",
    tempBy2100: "2.5°C",
  },
};

// Carbon price trajectories by scenario (USD/tCO2e)
const CARBON_PRICE_PATHS: Record<Scenario, Record<number, number>> = {
  NZE:   { 2024: 80,  2025: 95,  2026: 115, 2027: 140, 2028: 170, 2029: 200, 2030: 250 },
  SDS:   { 2024: 50,  2025: 60,  2026: 72,  2027: 85,  2028: 100, 2029: 120, 2030: 140 },
  STEPS: { 2024: 25,  2025: 28,  2026: 31,  2027: 34,  2028: 37,  2029: 40,  2030: 45  },
};

// Energy price multipliers (relative to 2024 baseline)
const ENERGY_PRICE_MULT: Record<Scenario, Record<number, number>> = {
  NZE:   { 2024: 1.0, 2025: 0.95, 2026: 0.88, 2027: 0.80, 2028: 0.70, 2029: 0.60, 2030: 0.50 },
  SDS:   { 2024: 1.0, 2025: 1.00, 2026: 0.98, 2027: 0.95, 2028: 0.90, 2029: 0.85, 2030: 0.80 },
  STEPS: { 2024: 1.0, 2025: 1.05, 2026: 1.10, 2027: 1.18, 2028: 1.25, 2029: 1.32, 2030: 1.40 },
};

// Physical risk multiplier on asset value (% impairment per year)
const PHYSICAL_RISK: Record<Scenario, Record<number, number>> = {
  NZE:   { 2024: 0.5, 2025: 0.5, 2026: 0.6, 2027: 0.6, 2028: 0.7, 2029: 0.7, 2030: 0.8 },
  SDS:   { 2024: 0.8, 2025: 0.9, 2026: 1.0, 2027: 1.1, 2028: 1.2, 2029: 1.3, 2030: 1.5 },
  STEPS: { 2024: 1.2, 2025: 1.4, 2026: 1.7, 2027: 2.0, 2028: 2.5, 2029: 3.0, 2030: 3.8 },
};

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export default function ScenarioAnalysisPage() {
  const [activeScenarios, setActiveScenarios] = useState<Set<Scenario>>(new Set(["NZE", "SDS", "STEPS"]));
  const [scope1e, setScope1e] = useState(4200);  // tCO2e
  const [scope2e, setScope2e] = useState(1800);
  const [assetValueM, setAssetValueM] = useState(250); // USD million
  const [energyCostM, setEnergyCostM] = useState(3.2); // USD million/year

  function toggleScenario(s: Scenario) {
    setActiveScenarios((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  const totalCo2e = scope1e + scope2e;

  // Build chart data
  const carbonPriceData = YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const s of Object.keys(SCENARIOS) as Scenario[]) {
      if (activeScenarios.has(s)) row[SCENARIOS[s].label] = CARBON_PRICE_PATHS[s][year];
    }
    return row;
  });

  const carbonCostData = YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const s of Object.keys(SCENARIOS) as Scenario[]) {
      if (activeScenarios.has(s)) {
        row[SCENARIOS[s].label] = Math.round((totalCo2e * CARBON_PRICE_PATHS[s][year]) / 1_000_000 * 10) / 10;
      }
    }
    return row;
  });

  const energyCostData = YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const s of Object.keys(SCENARIOS) as Scenario[]) {
      if (activeScenarios.has(s)) {
        row[SCENARIOS[s].label] = Math.round(energyCostM * ENERGY_PRICE_MULT[s][year] * 10) / 10;
      }
    }
    return row;
  });

  const physicalRiskData = YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const s of Object.keys(SCENARIOS) as Scenario[]) {
      if (activeScenarios.has(s)) {
        row[SCENARIOS[s].label] = Math.round(assetValueM * PHYSICAL_RISK[s][year] / 100 * 10) / 10;
      }
    }
    return row;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">TCFD Scenario Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transition and physical risk under IEA NZE, SDS, and STEPS climate scenarios (2024–2030)
        </p>
      </div>

      {/* Scenario toggles */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <button
            key={s}
            onClick={() => toggleScenario(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
              activeScenarios.has(s)
                ? "border-current text-gray-900 bg-white shadow-sm"
                : "border-gray-200 text-gray-400 bg-gray-50"
            }`}
            style={{ borderColor: activeScenarios.has(s) ? SCENARIOS[s].color : undefined }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeScenarios.has(s) ? SCENARIOS[s].color : "#d1d5db" }}
            />
            {s} — {SCENARIOS[s].tempBy2100}
          </button>
        ))}
      </div>

      {/* Company inputs */}
      <Card>
        <CardHeader><CardTitle>Company Exposure Inputs</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Scope 1 (tCO₂e)</label>
            <input type="number" value={scope1e} onChange={(e) => setScope1e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-32" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Scope 2 (tCO₂e)</label>
            <input type="number" value={scope2e} onChange={(e) => setScope2e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-32" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Asset Value (USD M)</label>
            <input type="number" value={assetValueM} onChange={(e) => setAssetValueM(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Energy Cost (USD M/yr)</label>
            <input type="number" step="0.1" value={energyCostM} onChange={(e) => setEnergyCostM(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
        </CardContent>
      </Card>

      {/* 2030 summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(SCENARIOS) as Scenario[]).filter((s) => activeScenarios.has(s)).map((s) => (
          <Card key={s} className="border-l-4" style={{ borderLeftColor: SCENARIOS[s].color }}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-semibold text-gray-500">{SCENARIOS[s].label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{SCENARIOS[s].description}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Carbon cost 2030</span>
                  <span className="font-medium">${formatNumber((totalCo2e * CARBON_PRICE_PATHS[s][2030]) / 1_000_000, 1)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Energy cost 2030</span>
                  <span className="font-medium">${formatNumber(energyCostM * ENERGY_PRICE_MULT[s][2030], 1)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Physical risk 2030</span>
                  <span className="font-medium">${formatNumber(assetValueM * PHYSICAL_RISK[s][2030] / 100, 1)}M/yr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: "Carbon Price Trajectory", data: carbonPriceData, yLabel: "USD/tCO₂e", yFmt: (v: number) => `$${v}` },
          { title: "Carbon Cost Exposure", data: carbonCostData, yLabel: "USD million", yFmt: (v: number) => `$${v}M` },
          { title: "Energy Cost Projection", data: energyCostData, yLabel: "USD million/yr", yFmt: (v: number) => `$${v}M` },
          { title: "Physical Risk (Asset Impairment)", data: physicalRiskData, yLabel: "USD million/yr", yFmt: (v: number) => `$${v}M` },
        ].map(({ title, data, yFmt }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={yFmt} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v) => (typeof v === "number" ? [yFmt(v), ""] : [v, ""])} />
                  <Legend />
                  {(Object.keys(SCENARIOS) as Scenario[]).filter((s) => activeScenarios.has(s)).map((s) => (
                    <Line
                      key={s}
                      type="monotone"
                      dataKey={SCENARIOS[s].label}
                      stroke={SCENARIOS[s].color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Scenarios: IEA World Energy Outlook 2023 NZE/SDS/STEPS. Carbon prices indexed to IEA Advanced
        Economies trajectory. Physical risk modelled as % asset value impairment per NGFS Phase 4 chronic
        risk. This is indicative modelling for TCFD disclosure — engage a climate risk specialist for
        formal assessment.
      </p>
    </div>
  );
}
