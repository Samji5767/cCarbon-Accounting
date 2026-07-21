"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Scale, AlertTriangle, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";

type CBAMSector = "steel" | "cement" | "aluminium" | "fertilisers" | "hydrogen" | "electricity";
type EUPhase = "2026" | "2027" | "2028" | "2029" | "2030";

interface ImportEntry {
  id: string;
  sector: CBAMSector;
  product: string;
  cnCode: string;
  originCountry: string;
  quantityTonnes: number;
  embeddedDirectKgCO2PerTonne: number;
  embeddedIndirectKgCO2PerTonne: number;
  carbonPricePaidEUR: number;
  freeAllocationFraction: number;
}

const EU_ETS_PRICE_EUR = 64.8;

const PHASE_IN: Record<EUPhase, number> = {
  "2026": 0.025,
  "2027": 0.025,
  "2028": 0.025,
  "2029": 0.025,
  "2030": 1.0,
};

const SECTOR_COLORS: Record<CBAMSector, string> = {
  steel: "#6366f1",
  cement: "#f59e0b",
  aluminium: "#3b82f6",
  fertilisers: "#10b981",
  hydrogen: "#8b5cf6",
  electricity: "#f43f5e",
};

const SECTOR_DEFAULT_FACTORS: Record<CBAMSector, { direct: number; indirect: number }> = {
  steel: { direct: 1460, indirect: 280 },
  cement: { direct: 820, indirect: 90 },
  aluminium: { direct: 2310, indirect: 6400 },
  fertilisers: { direct: 2100, indirect: 180 },
  hydrogen: { direct: 9800, indirect: 0 },
  electricity: { direct: 0, indirect: 420 },
};

const DEMO_IMPORTS: ImportEntry[] = [
  {
    id: "i1", sector: "steel", product: "Hot-rolled flat steel", cnCode: "7208.10",
    originCountry: "China", quantityTonnes: 4200,
    embeddedDirectKgCO2PerTonne: 1680, embeddedIndirectKgCO2PerTonne: 310,
    carbonPricePaidEUR: 0, freeAllocationFraction: 0,
  },
  {
    id: "i2", sector: "steel", product: "Steel wire rod", cnCode: "7213.10",
    originCountry: "India", quantityTonnes: 1800,
    embeddedDirectKgCO2PerTonne: 1520, embeddedIndirectKgCO2PerTonne: 290,
    carbonPricePaidEUR: 8, freeAllocationFraction: 0,
  },
  {
    id: "i3", sector: "cement", product: "Portland cement", cnCode: "2523.21",
    originCountry: "Turkey", quantityTonnes: 6500,
    embeddedDirectKgCO2PerTonne: 870, embeddedIndirectKgCO2PerTonne: 95,
    carbonPricePaidEUR: 12, freeAllocationFraction: 0,
  },
  {
    id: "i4", sector: "aluminium", product: "Unwrought aluminium", cnCode: "7601.10",
    originCountry: "Bahrain", quantityTonnes: 950,
    embeddedDirectKgCO2PerTonne: 2450, embeddedIndirectKgCO2PerTonne: 7200,
    carbonPricePaidEUR: 0, freeAllocationFraction: 0,
  },
  {
    id: "i5", sector: "aluminium", product: "Aluminium alloys", cnCode: "7601.20",
    originCountry: "Norway", quantityTonnes: 720,
    embeddedDirectKgCO2PerTonne: 1900, embeddedIndirectKgCO2PerTonne: 980,
    carbonPricePaidEUR: 52, freeAllocationFraction: 0,
  },
  {
    id: "i6", sector: "fertilisers", product: "Ammonia (anhydrous)", cnCode: "2814.10",
    originCountry: "Russia", quantityTonnes: 3100,
    embeddedDirectKgCO2PerTonne: 2200, embeddedIndirectKgCO2PerTonne: 200,
    carbonPricePaidEUR: 0, freeAllocationFraction: 0,
  },
  {
    id: "i7", sector: "hydrogen", product: "Hydrogen (electrolytic grey)", cnCode: "2804.10",
    originCountry: "Egypt", quantityTonnes: 280,
    embeddedDirectKgCO2PerTonne: 10200, embeddedIndirectKgCO2PerTonne: 0,
    carbonPricePaidEUR: 0, freeAllocationFraction: 0,
  },
];

function calcEntry(e: ImportEntry, phase: EUPhase) {
  const totalEmbeddedTCO2 = ((e.embeddedDirectKgCO2PerTonne + e.embeddedIndirectKgCO2PerTonne) * e.quantityTonnes) / 1000;
  const euBenchmarkTCO2 = ((SECTOR_DEFAULT_FACTORS[e.sector].direct + SECTOR_DEFAULT_FACTORS[e.sector].indirect) * e.quantityTonnes) / 1000;
  const netEmbeddedTCO2 = Math.max(0, totalEmbeddedTCO2 - (e.carbonPricePaidEUR / EU_ETS_PRICE_EUR) * totalEmbeddedTCO2);
  const phaseIn = PHASE_IN[phase];
  const certificatesRequired = netEmbeddedTCO2 * (1 - e.freeAllocationFraction) * phaseIn;
  const costEUR = certificatesRequired * EU_ETS_PRICE_EUR;
  const carbonLeakageExposure = totalEmbeddedTCO2 > euBenchmarkTCO2;
  return { totalEmbeddedTCO2, euBenchmarkTCO2, netEmbeddedTCO2, certificatesRequired, costEUR, carbonLeakageExposure };
}

const COUNTRIES_WITH_CARBON_PRICE = ["Norway", "Switzerland", "UK", "Canada"];

export default function CBAMPage() {
  const [phase, setPhase] = useState<EUPhase>("2026");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSector, setFilterSector] = useState<CBAMSector | "all">("all");

  const filtered = useMemo(() =>
    DEMO_IMPORTS.filter(e => filterSector === "all" || e.sector === filterSector),
    [filterSector]
  );

  const results = useMemo(() =>
    filtered.map(e => ({ ...e, ...calcEntry(e, phase) })),
    [filtered, phase]
  );

  const totalCost = results.reduce((s, r) => s + r.costEUR, 0);
  const totalEmbedded = results.reduce((s, r) => s + r.totalEmbeddedTCO2, 0);
  const totalCerts = results.reduce((s, r) => s + r.certificatesRequired, 0);

  const sectorRollup = useMemo(() => {
    const map: Record<string, { cost: number; embedded: number }> = {};
    results.forEach(r => {
      if (!map[r.sector]) map[r.sector] = { cost: 0, embedded: 0 };
      map[r.sector].cost += r.costEUR;
      map[r.sector].embedded += r.totalEmbeddedTCO2;
    });
    return Object.entries(map).map(([sector, v]) => ({ sector, ...v }));
  }, [results]);

  const phaseOptions: EUPhase[] = ["2026", "2027", "2028", "2029", "2030"];
  const sectors: CBAMSector[] = ["steel", "cement", "aluminium", "fertilisers", "hydrogen", "electricity"];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            CBAM Calculator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            EU Carbon Border Adjustment Mechanism — Regulation (EU) 2023/956 · Certificate surrender obligation & cost modelling
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-700">ETS price: <strong>€{EU_ETS_PRICE_EUR}/tCO₂e</strong></p>
        </div>
      </div>

      {/* Phase selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 font-medium">Reporting phase:</span>
        {phaseOptions.map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              phase === p
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
            }`}
          >
            {p} ({(PHASE_IN[p] * 100).toFixed(0)}%)
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CBAM Obligation", value: `€${(totalCost / 1000).toFixed(0)}k`, sub: `${phase} phase-in: ${(PHASE_IN[phase] * 100).toFixed(0)}%`, color: "text-indigo-600" },
          { label: "Certificates Required", value: `${totalCerts.toFixed(0)} tCO₂e`, sub: "Net embedded carbon", color: "text-amber-600" },
          { label: "Total Embedded Carbon", value: `${(totalEmbedded / 1000).toFixed(1)}k tCO₂e`, sub: "Direct + indirect", color: "text-red-600" },
          { label: "Full Phase-In Cost (2030)", value: `€${(results.reduce((s, r) => s + calcEntry(r, "2030").costEUR, 0) / 1000).toFixed(0)}k`, sub: "100% obligation", color: "text-rose-600" },
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

      {/* Sector filter + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CBAM Cost by Sector</CardTitle>
            <CardDescription className="text-xs">Phase {phase} obligation in EUR</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sectorRollup} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {sectorRollup.map(r => (
                    <Cell key={r.sector} fill={SECTOR_COLORS[r.sector as CBAMSector] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Phase-In Trajectory</CardTitle>
            <CardDescription className="text-xs">Annual certificate cost 2026–2030</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phaseOptions.map(p => {
                const cost = DEMO_IMPORTS.reduce((s, e) => s + calcEntry(e, p).costEUR, 0);
                const maxCost = DEMO_IMPORTS.reduce((s, e) => s + calcEntry(e, "2030").costEUR, 0);
                return (
                  <div key={p} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8">{p}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(cost / maxCost) * 100}%` }}
                      >
                        <span className="text-[9px] text-white font-bold">{(PHASE_IN[p] * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-16 text-right">€{(cost / 1000).toFixed(0)}k</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSector("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${filterSector === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
        >
          All sectors
        </button>
        {sectors.map(s => (
          <button
            key={s}
            onClick={() => setFilterSector(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${filterSector === s ? "text-white border-transparent" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"}`}
            style={filterSector === s ? { backgroundColor: SECTOR_COLORS[s] } : {}}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Import table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Import Register — CBAM Obligation Detail</CardTitle>
          <CardDescription className="text-xs">Click a row to expand verification data and carbon leakage assessment</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["Product / CN Code", "Origin", "Quantity (t)", "Embedded CO₂e (tCO₂e)", "Certs Required", "CBAM Cost (€)", "Carbon Leakage", ""].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map(r => (
                  <>
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800">{r.product}</p>
                        <p className="text-gray-400">{r.cnCode} · <span className="capitalize" style={{ color: SECTOR_COLORS[r.sector] }}>{r.sector}</span></p>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          COUNTRIES_WITH_CARBON_PRICE.includes(r.originCountry)
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {r.originCountry}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.quantityTonnes.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium">{r.totalEmbeddedTCO2.toFixed(0)}</span>
                        <span className="text-gray-400 ml-1">tCO₂e</span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.certificatesRequired.toFixed(1)}</td>
                      <td className="px-3 py-2 font-bold text-indigo-700">€{r.costEUR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-2">
                        {r.carbonLeakageExposure
                          ? <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="w-3 h-3" /> Yes</span>
                          : <span className="text-green-600">Low risk</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-400">
                        {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={`${r.id}-expand`}>
                        <td colSpan={8} className="bg-indigo-50 px-4 py-3">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-500 font-medium mb-1">Embedded Carbon Breakdown</p>
                              <p>Direct: <strong>{(r.embeddedDirectKgCO2PerTonne * r.quantityTonnes / 1000).toFixed(1)} tCO₂e</strong></p>
                              <p>Indirect: <strong>{(r.embeddedIndirectKgCO2PerTonne * r.quantityTonnes / 1000).toFixed(1)} tCO₂e</strong></p>
                              <p>Per tonne: <strong>{(r.embeddedDirectKgCO2PerTonne + r.embeddedIndirectKgCO2PerTonne)} kgCO₂e/t</strong></p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium mb-1">EU Benchmark Comparison</p>
                              <p>EU benchmark: <strong>{(SECTOR_DEFAULT_FACTORS[r.sector].direct + SECTOR_DEFAULT_FACTORS[r.sector].indirect)} kgCO₂e/t</strong></p>
                              <p>Imported intensity: <strong>{r.embeddedDirectKgCO2PerTonne + r.embeddedIndirectKgCO2PerTonne} kgCO₂e/t</strong></p>
                              <p className={r.carbonLeakageExposure ? "text-red-600 font-medium" : "text-green-600"}>
                                {r.carbonLeakageExposure ? "Above EU benchmark ↑" : "Below EU benchmark ✓"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium mb-1">Carbon Price Deduction</p>
                              <p>Paid in origin: <strong>€{r.carbonPricePaidEUR}/tCO₂e</strong></p>
                              <p>Deductible fraction: <strong>{r.carbonPricePaidEUR > 0 ? ((r.carbonPricePaidEUR / EU_ETS_PRICE_EUR) * 100).toFixed(1) : "0"}%</strong></p>
                              <p>Net embedded: <strong>{r.netEmbeddedTCO2.toFixed(1)} tCO₂e</strong></p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium mb-1">Certificate Obligation</p>
                              <p>Phase-in ({phase}): <strong>{(PHASE_IN[phase] * 100).toFixed(0)}%</strong></p>
                              <p>Certificates: <strong>{r.certificatesRequired.toFixed(2)}</strong></p>
                              <p>Obligation cost: <strong className="text-indigo-700">€{r.costEUR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold border-t-2">
                  <td className="px-3 py-2" colSpan={2}>Total ({filtered.length} imports)</td>
                  <td className="px-3 py-2">{filtered.reduce((s, e) => s + e.quantityTonnes, 0).toLocaleString()}</td>
                  <td className="px-3 py-2">{totalEmbedded.toFixed(0)} tCO₂e</td>
                  <td className="px-3 py-2">{totalCerts.toFixed(1)}</td>
                  <td className="px-3 py-2 text-indigo-700">€{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Methodology note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Methodology — Regulation (EU) 2023/956 (CBAM)</p>
        <p>Certificate price = EU ETS closing price (€{EU_ETS_PRICE_EUR}/tCO₂e). Obligation = net embedded emissions × phase-in fraction. Net embedded = total embedded − carbon price deduction (Art. 9). Carbon leakage flagged when import intensity exceeds EU production benchmark.</p>
      </div>
    </div>
  );
}
