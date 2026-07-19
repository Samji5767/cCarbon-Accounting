"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";

// ISO 14067:2018 Product Carbon Footprint
// ISO 14044:2006 Life Cycle Assessment methodology

type SystemBoundary = "cradle_gate" | "cradle_grave" | "cradle_cradle";
type FunctionalUnit = "per_unit" | "per_kg" | "per_km";

interface LCAStage {
  id: string;
  phase: "upstream" | "manufacturing" | "distribution" | "use" | "end_of_life";
  name: string;
  process: string;
  quantity: number;
  unit: string;
  emissionFactor: number; // kgCO2e per unit
  co2eKg: number;
  dataQuality: "primary" | "secondary" | "proxy";
  source: string;
}

const PHASE_COLORS: Record<string, string> = {
  upstream: "#ef4444",
  manufacturing: "#f97316",
  distribution: "#eab308",
  use: "#22c55e",
  end_of_life: "#3b82f6",
};

const PHASE_LABELS: Record<string, string> = {
  upstream: "A1–A3: Raw materials & upstream",
  manufacturing: "A4–A5: Manufacturing & assembly",
  distribution: "B1–B3: Distribution & retail",
  use: "B4–B7: Use phase",
  end_of_life: "C1–C4: End of life",
};

// Demo: industrial pump unit (steel housing, electric motor)
const DEMO_STAGES: LCAStage[] = [
  { id: "s1", phase: "upstream", name: "Steel production (housing)", process: "Hot-rolled steel, EAF", quantity: 42, unit: "kg", emissionFactor: 1.46, co2eKg: 61.3, dataQuality: "secondary", source: "worldsteel LCA 2022" },
  { id: "s2", phase: "upstream", name: "Copper wiring", process: "Primary copper, smelting", quantity: 3.2, unit: "kg", emissionFactor: 3.88, co2eKg: 12.4, dataQuality: "secondary", source: "ecoinvent 3.10" },
  { id: "s3", phase: "upstream", name: "Aluminium castings", process: "Primary aluminium", quantity: 8.5, unit: "kg", emissionFactor: 8.14, co2eKg: 69.2, dataQuality: "secondary", source: "IAI 2022 LCA" },
  { id: "s4", phase: "upstream", name: "Lubricants & fluids", process: "Petroleum-based lubricant", quantity: 1.2, unit: "kg", emissionFactor: 2.85, co2eKg: 3.4, dataQuality: "secondary", source: "ELCD database" },
  { id: "s5", phase: "upstream", name: "Packaging (cardboard)", process: "Recycled fibre board", quantity: 2.8, unit: "kg", emissionFactor: 0.72, co2eKg: 2.0, dataQuality: "primary", source: "Supplier EPD" },
  { id: "s6", phase: "manufacturing", name: "Electricity — machining", process: "CNC machining, US grid", quantity: 84, unit: "kWh", emissionFactor: 0.386, co2eKg: 32.4, dataQuality: "primary", source: "EPA eGRID 2022 ERCOT" },
  { id: "s7", phase: "manufacturing", name: "Natural gas — heat treatment", process: "Gas furnace annealing", quantity: 12.5, unit: "m³", emissionFactor: 2.04, co2eKg: 25.5, dataQuality: "primary", source: "Metered + IPCC GL Vol.2" },
  { id: "s8", phase: "manufacturing", name: "Process water (cooling)", process: "Municipal water supply", quantity: 0.8, unit: "m³", emissionFactor: 0.344, co2eKg: 0.3, dataQuality: "secondary", source: "DEFRA 2023" },
  { id: "s9", phase: "manufacturing", name: "Waste — metal swarf", process: "Scrap metal recycling", quantity: 4.2, unit: "kg", emissionFactor: -0.52, co2eKg: -2.2, dataQuality: "secondary", source: "ecoinvent 3.10 (avoided burden)" },
  { id: "s10", phase: "distribution", name: "Road freight (factory → DC)", process: "Diesel HGV, 800 km", quantity: 800, unit: "km", emissionFactor: 0.098, co2eKg: 78.4, dataQuality: "secondary", source: "DEFRA 2023 freight" },
  { id: "s11", phase: "distribution", name: "Ocean freight (DC → EU port)", process: "Container ship, 9,000 km", quantity: 9000, unit: "km", emissionFactor: 0.016, co2eKg: 144.0, dataQuality: "secondary", source: "IMO 4th GHG Study" },
  { id: "s12", phase: "use", name: "Electricity — pump operation", process: "15-year life, 4 kW avg, EU grid", quantity: 525600, unit: "kWh", emissionFactor: 0.276, co2eKg: 145065.6, dataQuality: "secondary", source: "IEA 2023 EU avg EF; 15yr design life" },
  { id: "s13", phase: "end_of_life", name: "Steel recycling (housing)", process: "EAF steel scrap, EU", quantity: 42, unit: "kg", emissionFactor: -1.1, co2eKg: -46.2, dataQuality: "secondary", source: "worldsteel recycling credit" },
  { id: "s14", phase: "end_of_life", name: "Landfill (non-recyclables)", process: "Mixed industrial waste", quantity: 5, unit: "kg", emissionFactor: 0.45, co2eKg: 2.3, dataQuality: "proxy", source: "IPCC 2006 GL Vol.5" },
];

const BOUNDARY_CONFIG: Record<SystemBoundary, { label: string; phases: string[]; description: string }> = {
  cradle_gate: { label: "Cradle-to-Gate", phases: ["upstream", "manufacturing"], description: "A1–A5: Raw material extraction through factory gate. Used for EPDs (ISO 14025) and B2B disclosure." },
  cradle_grave: { label: "Cradle-to-Grave", phases: ["upstream", "manufacturing", "distribution", "use", "end_of_life"], description: "Full life cycle A1–C4. Required for ISO 14067 product carbon footprint label and consumer-facing disclosure." },
  cradle_cradle: { label: "Cradle-to-Cradle", phases: ["upstream", "manufacturing", "distribution", "use", "end_of_life"], description: "Full life cycle with secondary material credits (Module D). Demonstrates circular economy value." },
};

const FU_CONFIG: Record<FunctionalUnit, { label: string; denominator: number }> = {
  per_unit: { label: "per pump unit", denominator: 1 },
  per_kg: { label: "per kg product", denominator: 57.7 }, // total product weight kg
  per_km: { label: "per km pumped distance (proxy)", denominator: 8000 },
};

export default function LCAPage() {
  const [boundary, setBoundary] = useState<SystemBoundary>("cradle_grave");
  const [fu, setFu] = useState<FunctionalUnit>("per_unit");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const phases = BOUNDARY_CONFIG[boundary].phases;
  const activeStages = DEMO_STAGES.filter(s => phases.includes(s.phase));
  const totalCo2eKg = activeStages.reduce((sum, s) => sum + s.co2eKg, 0);
  const denom = FU_CONFIG[fu].denominator;
  const pcfKg = totalCo2eKg / denom;

  // Phase rollup
  const phaseRollup = phases.map(ph => ({
    name: PHASE_LABELS[ph].split(":")[0],
    label: PHASE_LABELS[ph],
    co2e: activeStages.filter(s => s.phase === ph).reduce((sum, s) => sum + s.co2eKg, 0),
    fill: PHASE_COLORS[ph],
  }));

  // Hotspot: top 5 processes
  const hotspots = [...activeStages].sort((a, b) => b.co2eKg - a.co2eKg).slice(0, 5);

  // Data quality distribution
  const dqDist = (["primary", "secondary", "proxy"] as const).map(dq => ({
    name: dq,
    pct: Math.round(activeStages.filter(s => s.dataQuality === dq).reduce((sum, s) => sum + Math.abs(s.co2eKg), 0) / Math.abs(totalCo2eKg) * 100),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Carbon Footprint (LCA)</h1>
        <p className="text-sm text-gray-500 mt-1">
          ISO 14067:2018 / ISO 14044:2006 — life cycle GHG inventory by life cycle stage
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader><CardTitle>System Boundary & Functional Unit</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(BOUNDARY_CONFIG) as SystemBoundary[]).map(b => (
              <button key={b} onClick={() => setBoundary(b)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${boundary === b ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                <p className={`text-sm font-semibold ${boundary === b ? "text-emerald-800" : "text-gray-800"}`}>{BOUNDARY_CONFIG[b].label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{BOUNDARY_CONFIG[b].description}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Functional unit:</span>
            {(Object.keys(FU_CONFIG) as FunctionalUnit[]).map(f => (
              <button key={f} onClick={() => setFu(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${fu === f ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {FU_CONFIG[f].label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PCF result */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Product Carbon Footprint — {BOUNDARY_CONFIG[boundary].label}</p>
            <p className="text-xs text-gray-500 mt-0.5">Industrial Pump Unit · Model P-420 · {FU_CONFIG[fu].label}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-emerald-700">{formatNumber(pcfKg, 0)}</p>
            <p className="text-sm text-gray-600">kg CO₂e / {FU_CONFIG[fu].label}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <span>GWP version: AR5 (IPCC 2013)</span>
          <span>·</span>
          <span>Reference year: 2024</span>
          <span>·</span>
          <span>Life cycle stages: {phases.length}</span>
          <span>·</span>
          <span>Processes: {activeStages.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase breakdown chart */}
        <Card>
          <CardHeader>
            <CardTitle>Life Cycle Stage Breakdown</CardTitle>
            <CardDescription>kg CO₂e by EN 15978 / CEN/TR 15941 life cycle module</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={phaseRollup} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={v => `${v > 1000 ? (v/1000).toFixed(0)+"k" : v}`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [typeof v === "number" ? `${formatNumber(v, 0)} kg CO₂e` : v]} />
                <Bar dataKey="co2e" radius={4} name="kg CO₂e">
                  {phaseRollup.map((p, i) => <Cell key={i} fill={p.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hotspot donut */}
        <Card>
          <CardHeader>
            <CardTitle>Hotspot Analysis — Top 5 Processes</CardTitle>
            <CardDescription>% of total PCF by process (kg CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hotspots.map((s, i) => {
                const pct = (s.co2eKg / totalCo2eKg) * 100;
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-700 truncate max-w-56">{s.name}</span>
                      <span className="font-mono font-semibold">{formatNumber(pct, 1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: PHASE_COLORS[s.phase] }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">Data quality by tCO₂e weight</p>
              <div className="flex gap-3">
                {dqDist.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${d.name === "primary" ? "bg-emerald-500" : d.name === "secondary" ? "bg-blue-400" : "bg-amber-400"}`} />
                    <span className="capitalize text-gray-600">{d.name}: {d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <CardTitle>Life Cycle Inventory (LCI)</CardTitle>
          <CardDescription>All unit processes within system boundary. Click row to inspect. Negative values = avoided burdens / recycling credits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left py-2 px-3 font-medium">Module</th>
                  <th className="text-left py-2 px-3 font-medium">Process</th>
                  <th className="text-right py-2 px-3 font-medium">Qty</th>
                  <th className="text-left py-2 px-3 font-medium">Unit</th>
                  <th className="text-right py-2 px-3 font-medium">EF (kgCO₂e/u)</th>
                  <th className="text-right py-2 px-3 font-medium">kg CO₂e</th>
                  <th className="text-right py-2 px-3 font-medium">% PCF</th>
                  <th className="text-left py-2 px-3 font-medium">DQ</th>
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {activeStages.map(s => {
                  const pct = (s.co2eKg / totalCo2eKg) * 100;
                  const isNeg = s.co2eKg < 0;
                  return (
                    <tr key={s.id} onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedStage === s.id ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <td className="py-2 px-3">
                        <span className="text-xs px-1.5 py-0.5 rounded text-white text-[10px] font-medium" style={{ backgroundColor: PHASE_COLORS[s.phase] }}>
                          {PHASE_LABELS[s.phase].split(":")[0]}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-700 max-w-48">{s.name}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{formatNumber(s.quantity, 0)}</td>
                      <td className="py-2 px-3 text-xs text-gray-500">{s.unit}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{s.emissionFactor}</td>
                      <td className={`py-2 px-3 text-right font-mono text-xs font-semibold ${isNeg ? "text-emerald-600" : "text-gray-900"}`}>
                        {isNeg ? "" : ""}{formatNumber(s.co2eKg, 1)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-gray-500">{formatNumber(Math.abs(pct), 1)}%</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${s.dataQuality === "primary" ? "bg-emerald-100 text-emerald-700" : s.dataQuality === "secondary" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {s.dataQuality}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-400 max-w-40 truncate">{s.source}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-3 text-xs" colSpan={5}>TOTAL PCF ({BOUNDARY_CONFIG[boundary].label})</td>
                  <td className="py-2 px-3 text-right font-mono text-xs text-gray-900">{formatNumber(totalCo2eKg, 0)} kg CO₂e</td>
                  <td className="py-2 px-3 text-right text-xs">100%</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Methodology: ISO 14067:2018 (product carbon footprint), ISO 14044:2006 (LCA), ISO 14025:2006 (EPD). System boundary modules follow EN 15978:2011 (A1–C4+D). GWP100: IPCC AR5. Background LCI data: ecoinvent 3.10, worldsteel LCA 2022, DEFRA 2023 conversion factors, IEA 2023. Functional unit: 1 industrial pump unit (Model P-420), design life 15 years, 4 kW rated power. Use-phase electricity uses 2024 EU average grid EF (IEA 2023). Negative values represent avoided burden from recycled material credits (Module D approach).
      </p>
    </div>
  );
}
