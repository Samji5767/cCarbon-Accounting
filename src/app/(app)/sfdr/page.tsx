"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

// SFDR (EU 2019/2088) Principal Adverse Impact (PAI) Indicators
// Annex I Table 1 (mandatory) — climate & environment indicators
// As required for Article 8 / Article 9 product-level and entity-level disclosures

type PAIStatus = "reported" | "partial" | "not_reported" | "not_applicable";

interface PAIIndicator {
  id: string;
  table: string;
  indicator: string;
  metric: string;
  value2024: number | string;
  value2023: number | string;
  unit: string;
  status: PAIStatus;
  explanation?: string;
}

const PAI_INDICATORS: PAIIndicator[] = [
  // Table 1 — Climate & environment (mandatory)
  { id: "1", table: "1", indicator: "GHG emissions", metric: "Scope 1 GHG emissions", value2024: 5470, value2023: 5500, unit: "tCO₂e", status: "reported" },
  { id: "2", table: "1", indicator: "GHG emissions", metric: "Scope 2 GHG emissions", value2024: 1680, value2023: 2100, unit: "tCO₂e", status: "reported" },
  { id: "3", table: "1", indicator: "GHG emissions", metric: "Scope 3 GHG emissions", value2024: 28410, value2023: 29640, unit: "tCO₂e", status: "reported" },
  { id: "4", table: "1", indicator: "GHG emissions", metric: "Total GHG emissions (S1+S2+S3)", value2024: 35560, value2023: 37240, unit: "tCO₂e", status: "reported" },
  { id: "5", table: "1", indicator: "Carbon footprint", metric: "Carbon footprint (tCO₂e / $M revenue invested)", value2024: 237, value2023: 248, unit: "tCO₂e/$M", status: "reported" },
  { id: "6", table: "1", indicator: "GHG intensity of investee companies", metric: "GHG intensity (tCO₂e / $M revenue)", value2024: 172, value2023: 185, unit: "tCO₂e/$M", status: "reported" },
  { id: "7", table: "1", indicator: "Fossil fuel sector exposure", metric: "Share of investments in fossil fuel companies", value2024: 0, value2023: 0, unit: "%", status: "reported" },
  { id: "8", table: "1", indicator: "Non-renewable energy consumption", metric: "Non-renewable energy consumption share", value2024: 88.7, value2023: 94.3, unit: "%", status: "reported" },
  { id: "9", table: "1", indicator: "Energy consumption intensity", metric: "Energy intensity (MWh / $M revenue)", value2024: 1067, value2023: 1047, unit: "MWh/$M", status: "reported" },
  { id: "10", table: "1", indicator: "Biodiversity", metric: "Activities negatively affecting biodiversity-sensitive areas", value2024: "No", value2023: "No", unit: "Y/N", status: "reported" },
  { id: "11", table: "1", indicator: "Water emissions", metric: "Emissions to water (polychlorinated biphenyls / heavy metals)", value2024: "Nil", value2023: "Nil", unit: "t", status: "partial", explanation: "Wastewater discharge data awaiting third-party verification." },
  { id: "12", table: "1", indicator: "Hazardous waste", metric: "Hazardous waste and radioactive waste ratio", value2024: 0.42, value2023: 0.51, unit: "t/$M revenue", status: "reported" },
  { id: "13", table: "1", indicator: "UNGC / OECD violations", metric: "Share of investments in companies violating UNGC / OECD MNG", value2024: 0, value2023: 0, unit: "%", status: "reported" },
  { id: "14", table: "1", indicator: "Lack of compliance mechanisms", metric: "Share of investments in companies without UNGC complaint mechanisms", value2024: 0, value2023: 0, unit: "%", status: "reported" },
  // Table 2 — Social indicators (mandatory entity-level)
  { id: "15", table: "2", indicator: "Gender diversity", metric: "Unadjusted gender pay gap", value2024: 12.1, value2023: 13.8, unit: "%", status: "reported" },
  { id: "16", table: "2", indicator: "Gender diversity", metric: "Board gender diversity (female %)", value2024: 38, value2023: 33, unit: "%", status: "reported" },
  { id: "17", table: "2", indicator: "Controversial weapons", metric: "Exposure to controversial weapons", value2024: "No", value2023: "No", unit: "Y/N", status: "reported" },
  // Table 3 — Optional climate indicators
  { id: "18", table: "3", indicator: "Real estate energy performance", metric: "Inefficient real estate assets (energy class below C)", value2024: "2 sites", value2023: "3 sites", unit: "sites", status: "partial", explanation: "EPC certificates in progress for Site B (DE). Expected Q3 2025." },
];

const STATUS_CONFIG: Record<PAIStatus, { label: string; color: string; icon: React.ElementType }> = {
  reported:       { label: "Reported",       color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  partial:        { label: "Partial",        color: "bg-yellow-100 text-yellow-700",   icon: AlertTriangle },
  not_reported:   { label: "Not Reported",   color: "bg-red-100 text-red-700",         icon: XCircle },
  not_applicable: { label: "N/A",            color: "bg-gray-100 text-gray-500",       icon: Info },
};

type ArticleType = "8" | "9";

const ARTICLE_THRESHOLDS: Record<ArticleType, { label: string; color: string; description: string }> = {
  "8": { label: "Article 8 — ESG integration", color: "bg-blue-50 border-blue-300 text-blue-800", description: "Promotes environmental or social characteristics; does not have sustainable investment as its objective. PAI statement required from 2023." },
  "9": { label: "Article 9 — Sustainable investment", color: "bg-emerald-50 border-emerald-300 text-emerald-800", description: "Has sustainable investment as its objective (impact fund). Stricter PAI disclosure; must demonstrate no significant harm (DNSH) to all environmental objectives." },
};

const reportedCount = PAI_INDICATORS.filter(p => p.status === "reported").length;
const partialCount = PAI_INDICATORS.filter(p => p.status === "partial").length;

export default function SFDRPage() {
  const [articleType, setArticleType] = useState<ArticleType>("8");
  const [tableFilter, setTableFilter] = useState<string>("all");

  const filtered = tableFilter === "all" ? PAI_INDICATORS : PAI_INDICATORS.filter(p => p.table === tableFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SFDR Principal Adverse Impacts</h1>
        <p className="text-sm text-gray-500 mt-1">
          EU SFDR Regulation 2019/2088 — Annex I PAI statement · Reporting period 2024
        </p>
      </div>

      {/* Article type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["8", "9"] as ArticleType[]).map(a => (
          <button key={a} onClick={() => setArticleType(a)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${articleType === a ? `${ARTICLE_THRESHOLDS[a].color} border-current` : "border-gray-200 bg-white hover:border-gray-300"}`}>
            <p className="font-semibold text-sm">{ARTICLE_THRESHOLDS[a].label}</p>
            <p className="text-xs mt-1 text-gray-600">{ARTICLE_THRESHOLDS[a].description}</p>
          </button>
        ))}
      </div>

      {/* PAI completion KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">PAI Indicators Total</p>
          <p className="text-2xl font-bold text-gray-900">{PAI_INDICATORS.length}</p>
          <p className="text-xs text-gray-400">Annex I Table 1+2+3</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Fully Reported</p>
          <p className="text-2xl font-bold text-emerald-600">{reportedCount}</p>
          <p className="text-xs text-gray-400">{Math.round(reportedCount / PAI_INDICATORS.length * 100)}% completion</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Partial / Pending</p>
          <p className="text-2xl font-bold text-amber-500">{partialCount}</p>
          <p className="text-xs text-gray-400">data gaps to close</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Mandatory Reported</p>
          <p className="text-2xl font-bold text-blue-600">{PAI_INDICATORS.filter(p => p.table === "1" && p.status === "reported").length}/14</p>
          <p className="text-xs text-gray-400">Table 1 indicators</p>
        </CardContent></Card>
      </div>

      {/* Article 9 DNSH notice */}
      {articleType === "9" && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
          <p className="font-semibold text-emerald-800 text-sm mb-2">Do No Significant Harm (DNSH) — Article 9 Requirements</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { obj: "Climate change mitigation", status: "Compliant", note: "SBTi-validated −42% Sc 1+2 by 2030" },
              { obj: "Climate change adaptation", status: "Partial", note: "Physical risk assessment in progress (ESRS E1-9)" },
              { obj: "Water & marine resources", status: "Compliant", note: "No RBMP-listed body affected; water intensity monitored" },
              { obj: "Circular economy", status: "Partial", note: "Waste reduction plan initiated; EPR compliance underway" },
              { obj: "Pollution prevention", status: "Compliant", note: "No hazardous substances above EU threshold levels" },
              { obj: "Biodiversity & ecosystems", status: "Compliant", note: "No operations in Natura 2000 / WDPA protected areas" },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg border text-xs ${item.status === "Compliant" ? "bg-white border-emerald-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="font-semibold text-gray-700">{item.obj}</p>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.status === "Compliant" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{item.status}</span>
                <p className="text-gray-500 mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement policy */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Policy on PAI</CardTitle>
          <CardDescription>SFDR Art. 3 / ESMA Q&A — how adverse impacts are identified and addressed through engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              { title: "Identification", items: ["Annual PAI screening against Annex I indicators", "GHG inventory reviewed vs prior year (ESRS E1-6)", "Supplier PAI data collected via CDP Supply Chain"] },
              { title: "Prioritisation", items: ["Weighted by tCO₂e contribution (Sc 1+2+3)", "Materiality threshold: >5% of inventory or ESG risk score ≥3", "Top 3 PAIs escalated to Board Sustainability Committee"] },
              { title: "Mitigation", items: ["Supplier SBTi engagement programme (Cat 1 top-20)", "Capital allocation preference for low-PAI projects (ICP)", "Annual PAI statement published in SFDR Art. 4 disclosure"] },
            ].map(col => (
              <div key={col.title} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-800 mb-2">{col.title}</p>
                <ul className="space-y-1">
                  {col.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PAI table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>PAI Indicator Statement — Annex I</CardTitle>
              <CardDescription>2024 vs 2023 mandatory and optional indicators</CardDescription>
            </div>
            <div className="flex gap-1">
              {[["all", "All Tables"], ["1", "Table 1 (mandatory)"], ["2", "Table 2 (social)"], ["3", "Table 3 (optional)"]].map(([val, label]) => (
                <button key={val} onClick={() => setTableFilter(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tableFilter === val ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {label}
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
                  <th className="text-left py-2 px-3 font-medium">Tbl</th>
                  <th className="text-left py-2 px-3 font-medium">Indicator</th>
                  <th className="text-left py-2 px-3 font-medium">Metric</th>
                  <th className="text-right py-2 px-3 font-medium">2024</th>
                  <th className="text-right py-2 px-3 font-medium">2023</th>
                  <th className="text-left py-2 px-3 font-medium">Unit</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const sc = STATUS_CONFIG[p.status];
                  const Icon = sc.icon;
                  const prior = typeof p.value2023 === "number" ? p.value2023 : null;
                  const current = typeof p.value2024 === "number" ? p.value2024 : null;
                  const trend = prior !== null && current !== null && prior !== 0
                    ? ((current - prior) / prior) * 100
                    : null;
                  const isGoodDown = !["Board gender diversity", "Non-renewable", "GHG", "Carbon", "Hazardous", "Gender pay gap", "Fossil", "Inefficient", "Energy intensity"].some(k => p.metric.includes(k) && p.metric.includes("diversity") === false);

                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-xs text-gray-400">{p.table}</td>
                      <td className="py-2 px-3 text-xs text-gray-600">{p.indicator}</td>
                      <td className="py-2 px-3 text-xs text-gray-700 max-w-64">{p.metric}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs font-semibold text-gray-900">
                        {typeof p.value2024 === "number" ? formatNumber(p.value2024, p.value2024 < 10 ? 1 : 0) : p.value2024}
                        {trend !== null && (
                          <span className={`ml-1.5 text-[10px] ${trend < 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {trend < 0 ? "▼" : "▲"}{Math.abs(trend).toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs text-gray-400">
                        {typeof p.value2023 === "number" ? formatNumber(p.value2023, p.value2023 < 10 ? 1 : 0) : p.value2023}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-400">{p.unit}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${sc.color}`}>
                            <Icon className="w-3 h-3" /> {sc.label}
                          </span>
                          {p.explanation && <span className="text-[10px] text-amber-600 leading-tight">{p.explanation}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Source: EU SFDR Regulation (EU) 2019/2088, Delegated Regulation (EU) 2022/1288 Annex I. PAI indicators 1–14 (Table 1) are mandatory for financial market participants with ≥500 employees or Article 9 products. Tables 2 and 3 indicators are voluntary. GHG figures use IPCC AR5 GWP100 and align with ESRS E1-6. Data period: 1 January – 31 December 2024. Third-party verification: Scope 1 and Scope 2 (limited assurance, EY).
      </p>
    </div>
  );
}
