"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { FileText, Download, CheckCircle, AlertTriangle, Building2, Calendar, Globe, Shield } from "lucide-react";

type ReportSection = "cover" | "boundary" | "base_year" | "inventory" | "intensity" | "uncertainty" | "recalculation" | "assurance";

interface InventoryRow {
  scope: number;
  category: string;
  tco2e: number;
  method: string;
  efSource: string;
  gwp: string;
  biogenic?: number;
}

const DEMO_INVENTORY: InventoryRow[] = [
  { scope: 1, category: "Stationary combustion (natural gas)", tco2e: 3200, method: "Tier 2 — fuel combustion EF", efSource: "IPCC 2006 GL Vol.2 Ch.2", gwp: "AR5" },
  { scope: 1, category: "Mobile combustion (diesel fleet)", tco2e: 1850, method: "Tier 2 — fuel combustion EF", efSource: "DEFRA 2023 conversion factors", gwp: "AR5" },
  { scope: 1, category: "Fugitive emissions (refrigerants)", tco2e: 420, method: "Tier 1 — IPCC screening", efSource: "IPCC 2006 GL Vol.2 Ch.7", gwp: "AR5" },
  { scope: 2, category: "Purchased electricity (location-based)", tco2e: 2940, method: "Location-based — grid avg EF", efSource: "IEA 2023 / EPA eGRID 2022", gwp: "AR5" },
  { scope: 2, category: "Purchased electricity (market-based)", tco2e: 1680, method: "Market-based — supplier EF + REC", efSource: "Supplier disclosure + AIB/ERCOT", gwp: "AR5" },
  { scope: 3, category: "Cat 1: Purchased goods & services", tco2e: 18400, method: "Spend-based / supplier-reported hybrid", efSource: "USEEIO + primary supplier data", gwp: "AR5" },
  { scope: 3, category: "Cat 4: Upstream transportation", tco2e: 2100, method: "Distance-based — tonne-km × EF", efSource: "DEFRA 2023 freight factors", gwp: "AR5" },
  { scope: 3, category: "Cat 6: Business travel", tco2e: 480, method: "Spend-based / distance-based", efSource: "DEFRA 2023 air travel EF", gwp: "AR5" },
  { scope: 3, category: "Cat 11: Use of sold products", tco2e: 5800, method: "Lifetime energy use model", efSource: "Product energy label data (EU ERA)", gwp: "AR5" },
  { scope: 3, category: "Cat 12: End-of-life treatment", tco2e: 320, method: "Waste composition × landfill EF", efSource: "IPCC 2006 GL Vol.5 Ch.2", gwp: "AR5", biogenic: 190 },
];

const SECTION_LABELS: Record<ReportSection, string> = {
  cover: "Cover Page",
  boundary: "Organizational Boundary",
  base_year: "Base Year Statement",
  inventory: "GHG Inventory Data",
  intensity: "Emissions Intensity",
  uncertainty: "Uncertainty Assessment",
  recalculation: "Recalculation Policy",
  assurance: "Third-Party Assurance",
};

const SECTIONS: ReportSection[] = ["cover", "boundary", "base_year", "inventory", "intensity", "uncertainty", "recalculation", "assurance"];

const scope1Total = DEMO_INVENTORY.filter(r => r.scope === 1).reduce((s, r) => s + r.tco2e, 0);
const scope2LbTotal = DEMO_INVENTORY.filter(r => r.scope === 2 && r.category.includes("location")).reduce((s, r) => s + r.tco2e, 0);
const scope2MbTotal = DEMO_INVENTORY.filter(r => r.scope === 2 && r.category.includes("market")).reduce((s, r) => s + r.tco2e, 0);
const scope3Total = DEMO_INVENTORY.filter(r => r.scope === 3).reduce((s, r) => s + r.tco2e, 0);
const grandTotalLb = scope1Total + scope2LbTotal + scope3Total;
const grandTotalMb = scope1Total + scope2MbTotal + scope3Total;

const INTENSITY_METRICS = [
  { metric: "tCO₂e per $M revenue (Sc 1+2 MB)", value: 172, unit: "tCO₂e/$M", base2020: 221, trend: "−22.2% since 2020" },
  { metric: "tCO₂e per tonne product (Sc 1+2 MB)", value: 0.48, unit: "tCO₂e/t", base2020: 0.62, trend: "−22.6% since 2020" },
  { metric: "tCO₂e per employee (Sc 1+2+3 LB)", value: 124, unit: "tCO₂e/FTE", base2020: 158, trend: "−21.5% since 2020" },
];

export default function ReportGeneratorPage() {
  const [activeSection, setActiveSection] = useState<ReportSection>("cover");
  const [reportYear, setReportYear] = useState("2024");
  const [companyName, setCompanyName] = useState("Acme Manufacturing Corp");
  const [gwp, setGwp] = useState("AR5");
  const [boundary, setBoundary] = useState("operational_control");
  const [showPrintHint, setShowPrintHint] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GHG Inventory Report Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            GHG Protocol Corporate Standard — structured disclosure document
          </p>
        </div>
        <button
          onClick={() => setShowPrintHint(!showPrintHint)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {showPrintHint && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          Use your browser's Print function (Ctrl+P / Cmd+P) and select "Save as PDF" to export the report. A dedicated PDF export with branded letterhead is on the roadmap.
        </div>
      )}

      {/* Report config */}
      <Card>
        <CardHeader><CardTitle>Report Parameters</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-5">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Company / Entity</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm w-64" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Reporting Year</label>
            <input value={reportYear} onChange={e => setReportYear(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm w-28" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">GWP Version</label>
            <select value={gwp} onChange={e => setGwp(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm">
              <option value="AR4">IPCC AR4</option>
              <option value="AR5">IPCC AR5</option>
              <option value="AR6">IPCC AR6</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Consolidation Approach</label>
            <select value={boundary} onChange={e => setBoundary(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm">
              <option value="operational_control">Operational Control</option>
              <option value="financial_control">Financial Control</option>
              <option value="equity_share">Equity Share</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Section nav */}
        <div className="w-52 shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Sections</p>
          <div className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s ? "bg-emerald-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {SECTION_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Report content */}
        <div className="flex-1 space-y-4">
          {activeSection === "cover" && (
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{companyName}</h2>
                    <p className="text-xl text-gray-600 mt-2">GHG Emissions Inventory Report</p>
                    <p className="text-lg text-emerald-600 font-semibold mt-1">Reporting Year {reportYear}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Consolidation approach</p>
                        <p className="font-medium text-gray-700 capitalize">{boundary.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">GWP100 version</p>
                        <p className="font-medium text-gray-700">IPCC {gwp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Base year</p>
                        <p className="font-medium text-gray-700">2020 (IPCC AR6 alignment)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Assurance level</p>
                        <p className="font-medium text-gray-700">Limited (ISO 14064-3)</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Prepared in accordance with the GHG Protocol Corporate Accounting and Reporting Standard (Revised Edition, 2004) and GHG Protocol Scope 2 Guidance (2015).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "boundary" && (
            <Card>
              <CardHeader>
                <CardTitle>1. Organizational Boundary</CardTitle>
                <CardDescription>GHG Protocol Chapter 3 — consolidation approach and entity scope</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-800 mb-1">Consolidation Approach: {boundary === "operational_control" ? "Operational Control" : boundary === "financial_control" ? "Financial Control" : "Equity Share"}</p>
                  <p className="text-xs text-blue-700">
                    {boundary === "operational_control"
                      ? "The company accounts for 100% of GHG emissions from operations over which it has the authority to introduce and implement its operating policies."
                      : boundary === "financial_control"
                      ? "The company accounts for 100% of GHG emissions from operations over which it has the ability to direct the financial and operating policies."
                      : "The company accounts for GHG emissions from operations in proportion to its share of equity in those operations."}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Entities within the reporting boundary:</p>
                  <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Entity", "Type", "Ownership %", "Op. Control", "Fin. Control", "Included"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "Acme Manufacturing Corp (Parent)", type: "Parent", own: "100%", op: true, fin: true },
                        { name: "Acme UK Ltd", type: "Subsidiary", own: "100%", op: true, fin: true },
                        { name: "Acme-Renew JV", type: "Joint Venture", own: "50%", op: false, fin: false },
                        { name: "GreenPack India Pvt Ltd", type: "Associate", own: "35%", op: false, fin: false },
                        { name: "Acme Logistics LLC", type: "Subsidiary", own: "100%", op: true, fin: true },
                      ].map((e, i) => {
                        const included = boundary === "operational_control" ? e.op : boundary === "financial_control" ? e.fin : true;
                        return (
                          <tr key={i} className={!included ? "opacity-40" : ""}>
                            <td className="px-3 py-2 font-medium text-gray-800">{e.name}</td>
                            <td className="px-3 py-2 text-gray-600">{e.type}</td>
                            <td className="px-3 py-2">{e.own}</td>
                            <td className="px-3 py-2">{e.op ? "✓" : "✗"}</td>
                            <td className="px-3 py-2">{e.fin ? "✓" : "✗"}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${included ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                {included ? "Included" : "Excluded"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400">
                  Exclusions: Acme-Renew JV and GreenPack India Pvt Ltd are excluded under operational control and financial control approaches as the company does not have the authority to implement operating policies. Emissions are disclosed as equity-share information in the supplementary data table.
                </p>
              </CardContent>
            </Card>
          )}

          {activeSection === "base_year" && (
            <Card>
              <CardHeader>
                <CardTitle>2. Base Year Statement</CardTitle>
                <CardDescription>GHG Protocol Chapter 5 — base year selection and recalculation triggers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Base year</p>
                    <p className="text-2xl font-bold text-gray-900">2020</p>
                    <p className="text-xs text-gray-500 mt-1">Selected as the earliest year with robust, verifiable data across all included entities.</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Base year emissions (Sc 1+2 LB)</p>
                    <p className="text-2xl font-bold text-gray-900">7,840 tCO₂e</p>
                    <p className="text-xs text-gray-500 mt-1">Third-party verified (limited assurance, ISO 14064-3, 2021).</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Base Year Recalculation Policy</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    The company will recalculate the base year emissions retroactively if structural changes result in a cumulative change of more than <strong>5%</strong> of base year Scope 1 + Scope 2 (location-based) emissions. Triggers include:
                  </p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600">
                    <li>Acquisitions or divestments that fall outside the reporting boundary definition</li>
                    <li>Outsourcing or insourcing of emitting activities</li>
                    <li>Discovery of significant data errors or methodological changes affecting comparability</li>
                    <li>Changes in consolidation approach</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Base Year Emissions History</p>
                  <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Year", "Scope 1 tCO₂e", "Scope 2 LB tCO₂e", "Scope 2 MB tCO₂e", "Total S1+S2 LB", "Notes"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { year: "2020", s1: 5620, s2lb: 2220, s2mb: 2220, notes: "Base year (verified)" },
                        { year: "2021", s1: 5890, s2lb: 3100, s2mb: 2800, notes: "Acme UK acquired Jan 2021" },
                        { year: "2022", s1: 5700, s2lb: 3050, s2mb: 2500, notes: "" },
                        { year: "2023", s1: 5500, s2lb: 2980, s2mb: 2100, notes: "REC purchase commenced" },
                        { year: "2024", s1: 5470, s2lb: 2940, s2mb: 1680, notes: "Acme Logistics acq. Jul" },
                      ].map(r => (
                        <tr key={r.year} className={r.year === "2020" ? "bg-emerald-50 font-medium" : ""}>
                          <td className="px-3 py-2 font-medium">{r.year}</td>
                          <td className="px-3 py-2 font-mono">{formatNumber(r.s1, 0)}</td>
                          <td className="px-3 py-2 font-mono">{formatNumber(r.s2lb, 0)}</td>
                          <td className="px-3 py-2 font-mono">{formatNumber(r.s2mb, 0)}</td>
                          <td className="px-3 py-2 font-mono">{formatNumber(r.s1 + r.s2lb, 0)}</td>
                          <td className="px-3 py-2 text-gray-400">{r.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "inventory" && (
            <Card>
              <CardHeader>
                <CardTitle>3. GHG Inventory Data ({reportYear})</CardTitle>
                <CardDescription>Scope 1, 2 (location & market-based) and Scope 3 — GWP100 {gwp} — tCO₂e</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Scope 1 (Direct)", value: scope1Total, color: "bg-red-50 border-red-200" },
                    { label: "Scope 2 (Location)", value: scope2LbTotal, color: "bg-orange-50 border-orange-200" },
                    { label: "Scope 2 (Market)", value: scope2MbTotal, color: "bg-amber-50 border-amber-200" },
                    { label: "Scope 3 (Value Chain)", value: scope3Total, color: "bg-yellow-50 border-yellow-200" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`p-3 rounded-lg border ${color}`}>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-0.5">{formatNumber(value, 0)}</p>
                      <p className="text-xs text-gray-400">tCO₂e</p>
                    </div>
                  ))}
                </div>

                {/* Grand totals */}
                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-600">Total (location-based S1+S2+S3): <strong>{formatNumber(grandTotalLb, 0)} tCO₂e</strong></span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">Total (market-based S1+S2+S3): <strong>{formatNumber(grandTotalMb, 0)} tCO₂e</strong></span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Scope", "Emission Category", "tCO₂e", "Biogenic CO₂ (t)", "Method", "EF Source", "GWP"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {DEMO_INVENTORY.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.scope === 1 ? "bg-red-100 text-red-700" : r.scope === 2 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                              S{r.scope}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-700 max-w-48">{r.category}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-gray-900">{formatNumber(r.tco2e, 0)}</td>
                          <td className="px-3 py-2 font-mono text-green-600">{r.biogenic ? formatNumber(r.biogenic, 0) : "—"}</td>
                          <td className="px-3 py-2 text-gray-500">{r.method}</td>
                          <td className="px-3 py-2 text-gray-400">{r.efSource}</td>
                          <td className="px-3 py-2 text-gray-500">{gwp}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-3 py-2" colSpan={2}>TOTAL (location-based)</td>
                        <td className="px-3 py-2 font-mono">{formatNumber(grandTotalLb, 0)}</td>
                        <td colSpan={4} />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400">
                  Biogenic CO₂ emissions are reported separately in accordance with GHG Protocol guidance and are not included in the tCO₂e totals above. All figures are expressed using {gwp} GWP100 values.
                </p>
              </CardContent>
            </Card>
          )}

          {activeSection === "intensity" && (
            <Card>
              <CardHeader>
                <CardTitle>4. Emissions Intensity Metrics</CardTitle>
                <CardDescription>GHG Protocol — normalised performance indicators for {reportYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Metric", "Reporting Year", "Unit", "Base Year (2020)", "Trend"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {INTENSITY_METRICS.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">{m.metric}</td>
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{m.value}</td>
                        <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                        <td className="px-4 py-3 font-mono text-gray-400">{m.base2020}</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium text-sm">{m.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-3">
                  Revenue-based intensity uses reported {reportYear} annual revenue of USD 150M. Product-based intensity uses manufactured tonnes of finished product. Employee-based intensity uses average FTE headcount.
                </p>
              </CardContent>
            </Card>
          )}

          {activeSection === "uncertainty" && (
            <Card>
              <CardHeader>
                <CardTitle>5. Uncertainty Assessment</CardTitle>
                <CardDescription>ISO 14064-1:2018 §6.10 — qualitative and quantitative uncertainty by source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Emission Source", "Contribution %", "Activity Data Uncertainty", "EF Uncertainty", "Combined ±%", "Quality"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {[
                      { source: "Stationary combustion", pct: 12, activity: "±2% (metered)", ef: "±5% (IPCC GL)", combined: 5.4, q: "High" },
                      { source: "Mobile combustion", pct: 7, activity: "±3% (fuel purchase)", ef: "±5% (DEFRA)", combined: 5.8, q: "High" },
                      { source: "Fugitives", pct: 2, activity: "±20% (screening)", ef: "±15% (IPCC T1)", combined: 25, q: "Low" },
                      { source: "Electricity (LB)", pct: 11, activity: "±1% (utility bills)", ef: "±10% (grid avg)", combined: 10, q: "Medium" },
                      { source: "Cat 1: Purchased goods", pct: 52, activity: "±5% (spend data)", ef: "±30% (EEIO avg)", combined: 30, q: "Low" },
                      { source: "Cat 4: Transport", pct: 6, activity: "±8% (distance)", ef: "±8% (DEFRA)", combined: 11, q: "Medium" },
                      { source: "Cat 11: Use of products", pct: 10, activity: "±15% (model)", ef: "±10% (product label)", combined: 18, q: "Medium" },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{r.source}</td>
                        <td className="px-3 py-2 font-mono text-gray-600">{r.pct}%</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{r.activity}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{r.ef}</td>
                        <td className="px-3 py-2 font-mono font-semibold text-gray-900">{r.combined}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.q === "High" ? "bg-emerald-100 text-emerald-700" : r.q === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {r.q}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  <strong>Overall inventory uncertainty:</strong> ±18% (weighted by emission contribution). Category 1 purchased goods represent 52% of total emissions and carry the highest uncertainty due to use of spend-based EEIO factors. The company is actively engaging top-30 suppliers to replace EEIO estimates with primary supplier data by 2026.
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "recalculation" && (
            <Card>
              <CardHeader>
                <CardTitle>6. Recalculation Policy</CardTitle>
                <CardDescription>GHG Protocol Chapter 5 — conditions and procedures for retroactive recalculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="space-y-3">
                  {[
                    { trigger: "Structural change (acquisition / divestment)", threshold: ">5% of base year Sc 1+2 LB", action: "Recalculate all years with updated boundary; restate base year" },
                    { trigger: "Methodology change (new EF standard, new GWP values)", threshold: ">5% of any single year total inventory", action: "Recalculate impacted years; disclose change and magnitude" },
                    { trigger: "Discovery of data errors", threshold: ">5% of reported year total", action: "Correct and restate the affected reporting year; note in current year disclosure" },
                    { trigger: "Outsourcing / insourcing of operations", threshold: ">1% of base year Sc 1+2 LB", action: "Restate base year; include/exclude operations from all reported years" },
                    { trigger: "Change in consolidation approach", threshold: "Any change", action: "Recalculate all years under new approach; describe rationale" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800">{item.trigger}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Threshold: {item.threshold}</p>
                          <p className="text-xs text-gray-600 mt-1">Action: {item.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Source: GHG Protocol Corporate Standard, Chapter 5 — Tracking Emissions Over Time. Recalculation history is maintained in the audit trail. Prior-year restatements are disclosed in the notes to the current reporting year inventory.
                </p>
              </CardContent>
            </Card>
          )}

          {activeSection === "assurance" && (
            <Card>
              <CardHeader>
                <CardTitle>7. Third-Party Assurance Statement</CardTitle>
                <CardDescription>ISO 14064-3:2019 / ISAE 3410 limited assurance — summary disclosure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-800">Limited Assurance Engagement Completed</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        EY Climate Change & Sustainability Services ("the verifier") has completed a limited assurance engagement in accordance with ISO 14064-3:2019 over the GHG emissions inventory of {companyName} for the period 1 January – 31 December {reportYear}.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Standard", value: "ISO 14064-3:2019 / ISAE 3410" },
                    { label: "Assurance level", value: "Limited" },
                    { label: "Engagement period", value: `1 Jan – 31 Dec ${reportYear}` },
                    { label: "Completion date", value: `March ${parseInt(reportYear) + 1}` },
                    { label: "Scope covered", value: "Scope 1, Scope 2 (LB+MB)" },
                    { label: "Verifier", value: "EY Climate Change & Sustainability" },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-gray-100 rounded-lg p-3">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="font-medium text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Verifier Conclusion</p>
                  <p className="text-gray-600 leading-relaxed italic text-sm">
                    "Based on our limited assurance procedures, nothing has come to our attention that causes us to believe that the GHG emission inventory of {companyName} for the year ended 31 December {reportYear} has not been prepared, in all material respects, in accordance with the GHG Protocol Corporate Accounting and Reporting Standard and the company's reporting criteria."
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Material Observations</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">No material misstatements identified in Scope 1 or Scope 2 emissions data</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Observation: Category 1 (purchased goods) relies on spend-based EEIO factors for 68% of suppliers. Recommend transitioning to primary data collection for top-20 suppliers in the next reporting cycle.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Scope 3 Categories 4, 6 and 11 are reported for informational purposes and were not subject to limited assurance</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
