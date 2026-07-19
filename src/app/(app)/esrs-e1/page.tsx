"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

// ESRS E1 mandatory quantitative disclosure tables
// Based on EFRAG ESRS 1 (2023) and ESRS E1 Climate Change standard

type TabKey = "e1_4" | "e1_5" | "e1_6" | "e1_7" | "e1_8" | "e1_9";

const TABS: { key: TabKey; title: string; ref: string }[] = [
  { key: "e1_4", title: "E1-4 Targets", ref: "ESRS E1 §30-36" },
  { key: "e1_5", title: "E1-5 Energy", ref: "ESRS E1 §37-40" },
  { key: "e1_6", title: "E1-6 GHG Emissions", ref: "ESRS E1 §44-55" },
  { key: "e1_7", title: "E1-7 Removal & Storage", ref: "ESRS E1 §56-58" },
  { key: "e1_8", title: "E1-8 Internal Carbon Pricing", ref: "ESRS E1 §59-60" },
  { key: "e1_9", title: "E1-9 Financial Effects", ref: "ESRS E1 §64-68" },
];

// E1-6 GHG data rows
const GHG_ROWS = [
  { category: "Gross Scope 1 GHG emissions", current: 5470, prior: 5500, unit: "tCO₂e", note: "Direct combustion + fugitive; GWP AR5" },
  { category: "— of which: CO₂", current: 4980, prior: 5010, unit: "tCO₂e", note: "" },
  { category: "— of which: CH₄ (as CO₂e)", current: 350, prior: 360, unit: "tCO₂e", note: "" },
  { category: "— of which: N₂O (as CO₂e)", current: 80, prior: 85, unit: "tCO₂e", note: "" },
  { category: "— of which: HFCs (as CO₂e)", current: 60, prior: 45, unit: "tCO₂e", note: "Refrigerant fugitive" },
  { category: "Gross Scope 2 GHG emissions (location-based)", current: 2940, prior: 2980, unit: "tCO₂e", note: "Grid-average EF" },
  { category: "Gross Scope 2 GHG emissions (market-based)", current: 1680, prior: 2100, unit: "tCO₂e", note: "REC + supplier-specific EF" },
  { category: "Total Gross Scope 1 + 2 (location-based)", current: 8410, prior: 8480, unit: "tCO₂e", note: "Sum of S1 + S2 LB" },
  { category: "Total Gross Scope 1 + 2 (market-based)", current: 7150, prior: 7600, unit: "tCO₂e", note: "Sum of S1 + S2 MB" },
  { category: "Gross Scope 3 Cat 1: Purchased goods & services", current: 18400, prior: 19200, unit: "tCO₂e", note: "Spend-based + primary supplier hybrid" },
  { category: "Gross Scope 3 Cat 2: Capital goods", current: 420, prior: 390, unit: "tCO₂e", note: "Spend-based USEEIO" },
  { category: "Gross Scope 3 Cat 3: Fuel- & energy-related", current: 680, prior: 710, unit: "tCO₂e", note: "Upstream extraction EF" },
  { category: "Gross Scope 3 Cat 4: Upstream transport & dist.", current: 2100, prior: 2200, unit: "tCO₂e", note: "Distance × tonne-km EF" },
  { category: "Gross Scope 3 Cat 5: Waste generated in operations", current: 210, prior: 230, unit: "tCO₂e", note: "Landfill + incineration EF" },
  { category: "Gross Scope 3 Cat 6: Business travel", current: 480, prior: 620, unit: "tCO₂e", note: "Air distance + hotel nights" },
  { category: "Gross Scope 3 Cat 11: Use of sold products", current: 5800, prior: 5950, unit: "tCO₂e", note: "Lifetime energy model (EU ERA label data)" },
  { category: "Gross Scope 3 Cat 12: End-of-life treatment", current: 320, prior: 340, unit: "tCO₂e", note: "Waste composition × landfill EF" },
  { category: "Total Gross Scope 3", current: 28410, prior: 29640, unit: "tCO₂e", note: "Categories 1–4, 5, 6, 11, 12 reported" },
  { category: "Total GHG emissions (Sc 1+2 MB+3)", current: 35560, prior: 37240, unit: "tCO₂e", note: "" },
  { category: "Biogenic CO₂ emissions (outside Sc 1-3)", current: 190, prior: 210, unit: "tCO₂e", note: "Waste biomass combustion; not in tCO₂e" },
];

// E1-5 Energy rows
const ENERGY_ROWS = [
  { category: "Total energy consumption from non-renewable sources", current: 142000, prior: 148000, unit: "MWh" },
  { category: "— Natural gas (heat/steam)", current: 68000, prior: 72000, unit: "MWh" },
  { category: "— Diesel (transport)", current: 22000, prior: 23500, unit: "MWh" },
  { category: "— Purchased electricity (non-renewable share)", current: 52000, prior: 52500, unit: "MWh" },
  { category: "Total energy consumption from renewable sources", current: 18000, prior: 9000, unit: "MWh" },
  { category: "— Purchased electricity (renewable, RECs)", current: 14500, prior: 6500, unit: "MWh" },
  { category: "— On-site solar PV", current: 3500, prior: 2500, unit: "MWh" },
  { category: "Total energy consumption (all sources)", current: 160000, prior: 157000, unit: "MWh" },
  { category: "Share of renewable energy in total energy mix", current: 11.3, prior: 5.7, unit: "%" },
  { category: "Energy intensity (MWh per $M revenue)", current: 1067, prior: 1047, unit: "MWh/$M" },
];

// E1-4 Climate targets
const TARGETS = [
  {
    target: "Near-term Scope 1 & 2 absolute reduction",
    ref: "SBTi 1.5°C near-term",
    base: 2020,
    baseline_tco2e: 7840,
    target_year: 2030,
    target_pct: -42,
    current_pct: -9,
    status: "On track",
    gwp: "AR5",
    scope: "Sc 1+2",
  },
  {
    target: "Scope 3 absolute reduction (Cat 1 & 11)",
    ref: "SBTi SBTI-S3 guidance",
    base: 2020,
    baseline_tco2e: 28000,
    target_year: 2030,
    target_pct: -25,
    current_pct: -4.3,
    status: "Off track",
    gwp: "AR5",
    scope: "Sc 3 Cat 1+11",
  },
  {
    target: "Net-zero GHG (Sc 1+2+3)",
    ref: "SBTi Corporate Net-Zero Standard",
    base: 2020,
    baseline_tco2e: 43200,
    target_year: 2050,
    target_pct: -90,
    current_pct: -17.7,
    status: "On track",
    gwp: "AR5",
    scope: "Sc 1+2+3",
  },
  {
    target: "100% renewable electricity",
    ref: "RE100 commitment",
    base: 2023,
    baseline_tco2e: null,
    target_year: 2030,
    target_pct: 100, // % renewable share
    current_pct: 21,
    status: "On track",
    gwp: "—",
    scope: "Scope 2 electricity",
  },
];

function TrendChip({ current, prior, higherIsBetter = false }: { current: number; prior: number; higherIsBetter?: boolean }) {
  const diff = current - prior;
  const pct = prior !== 0 ? (diff / prior) * 100 : 0;
  const isGood = higherIsBetter ? diff > 0 : diff < 0;
  if (Math.abs(pct) < 0.1) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`text-xs font-medium ${isGood ? "text-emerald-600" : "text-red-500"}`}>
      {diff > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function EsrsE1Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("e1_6");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ESRS E1 — Climate Change Disclosures</h1>
        <p className="text-sm text-gray-500 mt-1">
          EFRAG ESRS E1 (2023) mandatory quantitative disclosure tables · Reporting year 2024
        </p>
      </div>

      {/* CSRD applicability banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">CSRD applicability: Large Public Interest Entity (PIE)</p>
          <p className="text-xs text-blue-600 mt-1">
            First reporting year: 2024 (published 2025). ESRS E1 is mandatory for all in-scope undertakings.
            Material climate-related impacts, risks and opportunities were identified through the double materiality assessment (ESRS 1 §§16–43).
            All disclosures use IPCC AR5 GWP100 values per ESRS E1 §23 unless otherwise stated.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border border-b-0 -mb-px ${
              activeTab === tab.key
                ? "bg-white border-gray-200 text-emerald-700 border-b-white"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {activeTab === "e1_4" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-4 — GHG Emission Reduction Targets</CardTitle>
            <CardDescription>ESRS E1 §30-36 — mandatory qualitative and quantitative target disclosure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    {["Target description", "Reference / standard", "Base year", "Target year", "Baseline (tCO₂e)", "Target reduction", "2024 progress", "GWP", "Scope", "Status"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TARGETS.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800 text-xs max-w-44">{t.target}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{t.ref}</td>
                      <td className="px-3 py-3 text-xs font-mono">{t.base}</td>
                      <td className="px-3 py-3 text-xs font-mono font-semibold">{t.target_year}</td>
                      <td className="px-3 py-3 text-xs font-mono">{t.baseline_tco2e ? formatNumber(t.baseline_tco2e, 0) : "—"}</td>
                      <td className="px-3 py-3 text-xs font-mono font-bold text-gray-900">
                        {t.target_pct > 0 ? "+" : ""}{t.target_pct}%
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-gray-700">{t.current_pct > 0 ? "+" : ""}{t.current_pct}%</span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                            <div
                              className={`h-1.5 rounded-full ${t.status === "On track" ? "bg-emerald-500" : "bg-red-400"}`}
                              style={{ width: `${Math.min(100, Math.abs(t.current_pct) / Math.abs(t.target_pct) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">{t.gwp}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">{t.scope}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === "On track" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">
              All targets validated by the Science Based Targets initiative (SBTi) Corporate Net-Zero Standard (2021) unless noted. GHG Protocol base year recalculation policy applies (5% threshold). Discloses against ESRS E1 §§30-36 and ESRS E1-4 data points.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "e1_5" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-5 — Energy Consumption and Mix</CardTitle>
            <CardDescription>ESRS E1 §37-40 — total energy from renewable and non-renewable sources (MWh)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium w-96">Energy category</th>
                    <th className="px-4 py-2 text-right font-medium">2024</th>
                    <th className="px-4 py-2 text-right font-medium">2023</th>
                    <th className="px-4 py-2 text-right font-medium">Unit</th>
                    <th className="px-4 py-2 text-right font-medium">YoY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ENERGY_ROWS.map((r, i) => {
                    const isSub = r.category.startsWith("—");
                    const isTotal = r.category.startsWith("Total") || r.category.startsWith("Share");
                    return (
                      <tr key={i} className={`hover:bg-gray-50 ${isTotal ? "bg-gray-50 font-semibold" : ""}`}>
                        <td className={`px-4 py-2 text-xs text-gray-700 ${isSub ? "pl-8 text-gray-500" : ""}`}>{r.category}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-gray-900">{formatNumber(r.current, 0)}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-gray-500">{formatNumber(r.prior, 0)}</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-400">{r.unit}</td>
                        <td className="px-4 py-2 text-right">
                          <TrendChip current={r.current} prior={r.prior} higherIsBetter={r.category.includes("renewable") && !r.category.includes("non")} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">11.3%</p>
                <p className="text-xs text-emerald-600 mt-0.5">Renewable energy share</p>
                <p className="text-xs text-gray-400">vs 5.7% in 2023</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">160k</p>
                <p className="text-xs text-blue-600 mt-0.5">Total MWh consumed</p>
                <p className="text-xs text-gray-400">+1.9% vs 2023</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-700">1,067</p>
                <p className="text-xs text-gray-600 mt-0.5">MWh per $M revenue</p>
                <p className="text-xs text-gray-400">vs 1,047 in 2023</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Energy data sourced from utility invoices, submetering, and fuel purchase records. Renewable electricity verified by ERCOT REC certificates (15-month vintage). On-site solar generation measured by generation meter. ESRS E1 §37-40 compliant.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "e1_6" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-6 — Gross GHG Emissions (Scope 1, 2 & 3)</CardTitle>
            <CardDescription>ESRS E1 §44-55 — mandatory quantitative table · tCO₂e · GWP AR5 · 2024 vs 2023</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-xs text-yellow-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>ESRS E1 requires disclosure of GROSS emissions (before offsets). Carbon credits/offsets are disclosed separately in E1-7 and shall not be deducted from these figures.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium w-96">GHG emission category (ESRS E1 §44-55)</th>
                    <th className="px-4 py-2 text-right font-medium">2024 tCO₂e</th>
                    <th className="px-4 py-2 text-right font-medium">2023 tCO₂e</th>
                    <th className="px-4 py-2 text-right font-medium">YoY change</th>
                    <th className="px-4 py-3 text-left font-medium">Note / method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {GHG_ROWS.map((r, i) => {
                    const isSub = r.category.startsWith("—");
                    const isTotal = r.category.startsWith("Total") || r.category.startsWith("Biogenic");
                    return (
                      <tr key={i} className={`hover:bg-gray-50 ${isTotal ? "bg-gray-50 font-semibold" : ""} ${r.category.startsWith("Biogenic") ? "italic" : ""}`}>
                        <td className={`px-4 py-2 text-xs text-gray-700 ${isSub ? "pl-8 text-gray-500" : ""}`}>{r.category}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-gray-900">{formatNumber(r.current, 0)}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-gray-500">{formatNumber(r.prior, 0)}</td>
                        <td className="px-4 py-2 text-right">
                          <TrendChip current={r.current} prior={r.prior} />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-400 max-w-48">{r.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {[
                { label: "Gross Scope 1", value: "5,470 tCO₂e", trend: "▼ 0.5% vs 2023", color: "bg-red-50 border-red-200" },
                { label: "Gross Scope 2 (MB)", value: "1,680 tCO₂e", trend: "▼ 20% vs 2023", color: "bg-orange-50 border-orange-200" },
                { label: "Gross Scope 3", value: "28,410 tCO₂e", trend: "▼ 4.1% vs 2023", color: "bg-yellow-50 border-yellow-200" },
                { label: "Total Gross (MB)", value: "35,560 tCO₂e", trend: "▼ 4.5% vs 2023", color: "bg-emerald-50 border-emerald-200" },
              ].map(({ label, value, trend, color }) => (
                <div key={label} className={`p-3 rounded-lg border ${color}`}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                  <p className="text-xs text-emerald-600 font-medium">{trend}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              GWP100 values: IPCC AR5 (CH₄=28, N₂O=265, HFC-134a=1,430). Location-based Scope 2 uses IEA 2023 country grid average EFs. Market-based Scope 2 uses supplier-specific residual mix + ERCOT REC certificates. Scope 3 completeness: 8 of 15 categories reported; remaining 7 assessed as non-material (see Scope 3 Materiality assessment). Reporting boundary: operational control, consistent with GHG Protocol Corporate Standard Chapter 3.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "e1_7" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-7 — GHG Removals and Carbon Credits</CardTitle>
            <CardDescription>ESRS E1 §56-58 — carbon removals, storage and purchased offsets (reported separately from gross emissions)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <p className="font-semibold mb-1">ESRS E1 §56 — Disclosure requirement</p>
              <p>Undertakings shall disclose GHG removals and carbon credits <strong>separately</strong> from gross GHG emissions (E1-6) and shall not net them against gross emissions. This is to maintain transparency on decarbonisation efforts vs offsetting.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    {["Type", "Volume (tCO₂e)", "Standard / Registry", "Vintage", "Project type", "Permanence"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { type: "Purchased carbon credit (avoidance)", vol: 500, std: "Verra VCS", vintage: "2023", project: "REDD+ avoided deforestation — Brazil", perm: "Non-permanent (buffer pool)" },
                    { type: "Purchased carbon credit (removal)", vol: 200, std: "Gold Standard", vintage: "2023", project: "Biochar carbon removal — Kenya", perm: "Durable (100-year+ verified)" },
                    { type: "On-site biological removal", vol: 42, std: "ISO 14064-2", vintage: "2024", project: "Reforestation of 12ha facility land", perm: "Non-permanent (reversible)" },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 text-xs">
                      <td className="px-4 py-2 text-gray-700">{r.type}</td>
                      <td className="px-4 py-2 font-mono font-semibold">{formatNumber(r.vol, 0)}</td>
                      <td className="px-4 py-2 text-gray-600">{r.std}</td>
                      <td className="px-4 py-2 text-gray-500">{r.vintage}</td>
                      <td className="px-4 py-2 text-gray-600">{r.project}</td>
                      <td className="px-4 py-2 text-gray-500">{r.perm}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold text-xs">
                    <td className="px-4 py-2">Total removals + credits</td>
                    <td className="px-4 py-2 font-mono">742</td>
                    <td colSpan={4} />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <p className="font-semibold mb-1">Oxford Principles on Net Zero Aligned Offsetting (2023)</p>
              <p>The company is transitioning its offset portfolio from avoidance-based credits to durable carbon removals per the Oxford Principles. Current removal fraction: 32% (target: 100% by 2040). Residual emissions not covered by credits will be addressed through further absolute reductions.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "e1_8" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-8 — Internal Carbon Pricing</CardTitle>
            <CardDescription>ESRS E1 §59-60 — disclosure of internal carbon price used for investment and business decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "ICP mechanism", value: "Shadow price", sub: "Applied to capex > $500k" },
                { label: "Current ICP rate (2024)", value: "$85 / tCO₂e", sub: "USD per tonne CO₂e" },
                { label: "Escalation rate", value: "+5% / year", sub: "To 2030" },
                { label: "2030 projected ICP", value: "~$120 / tCO₂e", sub: "USD real" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    {["Application scope", "Threshold", "How used", "Coverage"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { scope: "Capital expenditure evaluation", threshold: "Projects > $500k", use: "Added to NPV hurdle rate as shadow cost of carbon over asset life", coverage: "All capex projects" },
                    { scope: "Product pricing (internal P&L)", threshold: "Scope 1+2 attributed to product lines", use: "Informs true cost of high-emission products; flags candidates for redesign", coverage: "3 product lines" },
                    { scope: "Supplier qualification", threshold: "Suppliers with >1,000 tCO₂e scope 3 impact", use: "Carbon cost applied to total cost of ownership for supplier selection", coverage: "Top-20 suppliers" },
                    { scope: "R&D portfolio prioritisation", threshold: "Low-carbon technology projects", use: "ICP used to calculate avoided cost benefit of decarbonisation R&D", coverage: "R&D pipeline" },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{r.scope}</td>
                      <td className="px-3 py-2 text-gray-500">{r.threshold}</td>
                      <td className="px-3 py-2 text-gray-600">{r.use}</td>
                      <td className="px-3 py-2 text-gray-500">{r.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">
              ICP benchmarked against: EU ETS (current ~€65/t), High-Level Commission on Carbon Prices 2030 range ($50–100/t), and SBTi guidance. Rate reviewed annually by the Sustainability Committee and approved by CFO. Consistent with ESRS E1 §59-60 disclosure requirements.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "e1_9" && (
        <Card>
          <CardHeader>
            <CardTitle>E1-9 — Anticipated Financial Effects of Climate-related Risks and Opportunities</CardTitle>
            <CardDescription>ESRS E1 §64-68 — financial effects of transition and physical climate risks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              ESRS E1 §64 requires disclosure of anticipated financial effects from material climate risks (transition and physical) identified in the double materiality assessment. Figures represent management estimates; ranges reflect scenario uncertainty (NZE / SDS / STEPS scenarios, IEA 2023).
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2 text-sm">Transition Risks — Quantitative Financial Effects (2024–2030 horizon)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Risk / Opportunity", "Type", "Time horizon", "Estimated P&L impact (USD M)", "Mitigation", "Residual risk"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { item: "Carbon pricing on Scope 1 (EU ETS expansion)", type: "Policy", horizon: "2025–2030", impact: "−3.5 to −8.2", mit: "Electrification of stationary combustion; energy efficiency", residual: "Medium" },
                      { item: "Increased cost of purchased energy (grid carbon price)", type: "Policy", horizon: "2025–2030", impact: "−1.2 to −3.0", mit: "PPA + on-site solar expansion; demand response", residual: "Low" },
                      { item: "Market shift to low-carbon products (demand)", type: "Market", horizon: "2027–2035", impact: "+5.0 to +15.0", mit: "Product redesign (low-energy use phase)", residual: "Opportunity" },
                      { item: "Supply chain disruption (carbon cost in Cat 1 inputs)", type: "Policy", horizon: "2026–2030", impact: "−2.0 to −6.0", mit: "Supplier SBTi engagement; dual-sourcing", residual: "Medium" },
                      { item: "Reputational risk from non-disclosure (CSRD non-compliance)", type: "Legal", horizon: "2024–2025", impact: "−0.5 to −2.0", mit: "Full ESRS E1 compliance (this disclosure)", residual: "Low" },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700 max-w-44">{r.item}</td>
                        <td className="px-3 py-2 text-gray-500">{r.type}</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.horizon}</td>
                        <td className={`px-3 py-2 font-mono font-semibold ${r.impact.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>{r.impact}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs max-w-48">{r.mit}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.residual === "Low" ? "bg-emerald-100 text-emerald-700" : r.residual === "Medium" ? "bg-yellow-100 text-yellow-700" : r.residual === "Opportunity" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                            {r.residual}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2 text-sm">Physical Risks — Asset & Operational Exposure (chronic & acute)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Hazard", "Type", "Affected asset / location", "Scenario (RCP)", "Potential loss (USD M)", "Adaptation"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { hazard: "Extreme heat / heatwave", type: "Acute", asset: "US manufacturing campus (Texas)", rcp: "RCP 4.5 / 8.5", loss: "−0.8 to −4.2", adapt: "Cooling system upgrade; heat action plan" },
                      { hazard: "Flooding (100-yr return)", type: "Acute", asset: "Acme UK Ltd (Thames floodplain)", rcp: "RCP 8.5 (2050)", loss: "−2.0 to −12.0", adapt: "Flood barrier + business continuity plan (in progress)" },
                      { hazard: "Water stress (chronic)", type: "Chronic", asset: "India facility (GreenPack JV region)", rcp: "RCP 4.5", loss: "−0.3 to −1.5", adapt: "Water recycling; municipal water access agreement" },
                      { hazard: "Supply chain disruption (extreme weather, key suppliers)", type: "Acute", asset: "Tier-1 raw material suppliers (DE, CN)", rcp: "RCP 2.6 / 4.5", loss: "−1.0 to −5.0", adapt: "Geographic diversification; inventory buffer" },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{r.hazard}</td>
                        <td className="px-3 py-2 text-gray-500">{r.type}</td>
                        <td className="px-3 py-2 text-gray-600">{r.asset}</td>
                        <td className="px-3 py-2 text-gray-500">{r.rcp}</td>
                        <td className="px-3 py-2 font-mono font-semibold text-red-600">{r.loss}</td>
                        <td className="px-3 py-2 text-gray-500 max-w-44">{r.adapt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 p-3 border border-gray-200 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Financial effect estimates are based on IEA NZE (1.5°C), SDS (below 2°C) and STEPS (3°C) scenarios as required by ESRS E1 §64. Ranges reflect scenario spread. All figures are management estimates and subject to material uncertainty. Full climate scenario analysis disclosed in the TCFD Scenario Analysis section.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
