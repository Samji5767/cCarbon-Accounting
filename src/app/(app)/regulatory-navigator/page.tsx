"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

type ApplicabilityStatus = "applicable" | "not_applicable" | "monitor" | "pending_assessment";
type JurisdictionRegion = "EU" | "UK" | "US" | "APAC" | "Global";
type EntityCriteria = "revenue" | "employees" | "listed" | "sector" | "import_activity" | "emissions";

interface Threshold {
  criteria: EntityCriteria;
  label: string;
  threshold: string;
  entityValue: string;
  met: boolean;
}

interface Regulation {
  id: string;
  name: string;
  shortName: string;
  region: JurisdictionRegion;
  status: ApplicabilityStatus;
  filingDeadline: string;
  nextKey: string;
  penaltyMax: string;
  scope: string[];
  thresholds: Threshold[];
  keyRequirements: string[];
  gaps: string[];
  readinessScore: number;
}

const ENTITY = {
  revenueEURm: 320,
  employees: 850,
  listed: false,
  euImporter: true,
  averageScope1tCO2: 12400,
  operatesInUK: true,
  operatesInSG: true,
  operatesInCA: false,
};

const REGULATIONS: Regulation[] = [
  {
    id: "csrd",
    name: "Corporate Sustainability Reporting Directive",
    shortName: "CSRD",
    region: "EU",
    status: "applicable",
    filingDeadline: "2026-04-30",
    nextKey: "FY2025 sustainability statement (first filing)",
    penaltyMax: "€5m or 5% of annual revenue",
    scope: ["ESRS E1", "ESRS E2–E5", "ESRS S1–S4", "ESRS G1"],
    thresholds: [
      { criteria: "revenue", label: "Revenue > €40m", threshold: "€40m", entityValue: "€320m", met: true },
      { criteria: "employees", label: "Employees > 250", threshold: "250", entityValue: "850", met: true },
      { criteria: "listed", label: "Listed OR above thresholds", threshold: "Either", entityValue: "Above thresholds", met: true },
    ],
    keyRequirements: [
      "Mandatory ESRS E1 climate disclosure (GHG inventory, targets, transition plan)",
      "Double materiality assessment (DMA) covering all ESRS topics",
      "Value chain (upstream/downstream) Scope 3 disclosure",
      "Third-party limited assurance (reasonable assurance from 2028)",
      "XBRL/iXBRL digital tagging of sustainability statement",
    ],
    gaps: [
      "Scope 3 Category 1–3 data coverage <60% — supplier engagement required",
      "DMA not yet formally completed and documented",
      "XBRL taxonomy tagging capability not in place",
    ],
    readinessScore: 62,
  },
  {
    id: "eu-ets",
    name: "EU Emissions Trading System (Phase 4)",
    shortName: "EU ETS",
    region: "EU",
    status: "applicable",
    filingDeadline: "2025-04-30",
    nextKey: "Annual verified emission report & allowance surrender",
    penaltyMax: "€100/tCO₂e excess + public disclosure",
    scope: ["Scope 1 — stationary combustion >20MW", "Scope 1 — industrial processes"],
    thresholds: [
      { criteria: "emissions", label: "Scope 1 > installation thresholds", threshold: ">20MW or sector-specific", entityValue: "2 installations qualifying", met: true },
    ],
    keyRequirements: [
      "Verified annual emission report per EU MRR (Monitoring, Reporting, Verification)",
      "Surrender sufficient allowances by 30 April each year",
      "Free allocation application under National Allocation Plan (NAP)",
      "Cross-border process for merged or acquired installations",
    ],
    gaps: [
      "MRV plan not updated following Site C process change in 2024",
    ],
    readinessScore: 85,
  },
  {
    id: "cbam",
    name: "Carbon Border Adjustment Mechanism",
    shortName: "CBAM",
    region: "EU",
    status: "applicable",
    filingDeadline: "2026-01-31",
    nextKey: "First annual CBAM declaration (for 2025 imports)",
    penaltyMax: "€50–150 per certificate not surrendered",
    scope: ["Steel", "Cement", "Aluminium", "Fertilisers", "Hydrogen", "Electricity"],
    thresholds: [
      { criteria: "import_activity", label: "Imports of CBAM goods into EU", threshold: "Any quantity", entityValue: "Steel, aluminium imports active", met: true },
    ],
    keyRequirements: [
      "Register as CBAM declarant in EU CBAM Registry",
      "Collect embedded carbon data from third-country suppliers",
      "Purchase and surrender CBAM certificates annually",
      "Apply for deductions for carbon prices paid in country of origin",
    ],
    gaps: [
      "Embedded carbon data not yet collected from 3 of 7 key suppliers",
      "CBAM Registry registration not yet initiated",
    ],
    readinessScore: 40,
  },
  {
    id: "uk-secr",
    name: "Streamlined Energy and Carbon Reporting",
    shortName: "UK SECR",
    region: "UK",
    status: "applicable",
    filingDeadline: "2025-09-30",
    nextKey: "Annual directors' report energy & carbon disclosure",
    penaltyMax: "Companies Act filing penalties (up to £500 per day)",
    scope: ["Scope 1", "Scope 2", "UK energy consumption", "Intensity metric"],
    thresholds: [
      { criteria: "employees", label: "Employees > 250 (UK)", threshold: "250", entityValue: "320 UK employees", met: true },
      { criteria: "revenue", label: "Turnover > £36m", threshold: "£36m", entityValue: "~£275m", met: true },
    ],
    keyRequirements: [
      "Annual energy use (kWh) and GHG (Scope 1+2) in directors' report",
      "At least one intensity metric per reporting period",
      "Energy efficiency actions taken during the year",
      "Methodology statement referencing GHG Protocol or ISO 14064",
    ],
    gaps: [
      "UK-only boundary Scope 1+2 split not yet separated in current inventory",
    ],
    readinessScore: 78,
  },
  {
    id: "sg-mas",
    name: "MAS Notice on Environmental Risk Management",
    shortName: "MAS ENRM",
    region: "APAC",
    status: "monitor",
    filingDeadline: "2026-12-31",
    nextKey: "Awaiting MAS taxonomy applicability guidance for non-financials",
    penaltyMax: "Regulatory action by MAS",
    scope: ["Climate risk governance", "Scenario analysis", "Disclosure (TCFD-aligned)"],
    thresholds: [
      { criteria: "listed", label: "SGX listed OR MAS-licensed", threshold: "MAS license or SGX listing", entityValue: "No SGX listing / MAS license", met: false },
    ],
    keyRequirements: [
      "Board-level climate governance structures",
      "Physical and transition risk scenario analysis",
      "Annual TCFD-aligned climate disclosure",
    ],
    gaps: [],
    readinessScore: 55,
  },
  {
    id: "sec-climate",
    name: "SEC Climate Disclosure Rule",
    shortName: "SEC Climate",
    region: "US",
    status: "not_applicable",
    filingDeadline: "N/A",
    nextKey: "Monitor — rule under legal challenge as of 2024",
    penaltyMax: "SEC enforcement / restatement risk",
    scope: ["Scope 1", "Scope 2 (if material)", "Material climate risks", "GHG targets"],
    thresholds: [
      { criteria: "listed", label: "SEC-registered issuer", threshold: "US listed", entityValue: "Not SEC-registered", met: false },
    ],
    keyRequirements: [
      "Annual Form 10-K climate risk disclosures",
      "Scope 1 and 2 GHG (large accelerated filers)",
      "Climate-related financial statement impacts",
    ],
    gaps: [],
    readinessScore: 0,
  },
  {
    id: "ca-sb253",
    name: "California Climate Corporate Data Accountability Act",
    shortName: "CA SB-253",
    region: "US",
    status: "not_applicable",
    filingDeadline: "N/A",
    nextKey: "No California revenue — monitor only",
    penaltyMax: "Up to $500k per year",
    scope: ["Scope 1", "Scope 2", "Scope 3"],
    thresholds: [
      { criteria: "revenue", label: "Revenue > $1B doing business in CA", threshold: "$1B + CA operations", entityValue: "No CA operations", met: false },
    ],
    keyRequirements: [
      "Annual public Scope 1, 2, 3 GHG disclosure",
      "Third-party assurance (Scope 1+2 from 2026; Scope 3 from 2027)",
    ],
    gaps: [],
    readinessScore: 0,
  },
  {
    id: "sbti",
    name: "Science Based Targets initiative — Corporate Standard",
    shortName: "SBTi",
    region: "Global",
    status: "applicable",
    filingDeadline: "2025-09-30",
    nextKey: "Near-term target revalidation (5-year cycle)",
    penaltyMax: "Removal from SBTi target list; reputational risk",
    scope: ["Scope 1", "Scope 2", "Scope 3 (if >40% of footprint)"],
    thresholds: [
      { criteria: "emissions", label: "Committed to SBTi target setting", threshold: "Voluntary commitment", entityValue: "Committed 2023", met: true },
    ],
    keyRequirements: [
      "Near-term targets: −42% S1+S2 by 2030 (1.5°C); −25% S3 by 2030",
      "Long-term net-zero target by ≤2050",
      "Annual progress disclosure against validated targets",
      "Scope 3 >40% of total footprint requires category-level targets",
    ],
    gaps: [
      "S3 supplier-specific data needed to validate category 1 target",
      "Annual progress report not yet published for FY2024",
    ],
    readinessScore: 70,
  },
];

const STATUS_CONFIG = {
  applicable: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Applicable" },
  not_applicable: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-50 border-gray-200", label: "Not applicable" },
  monitor: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Monitor" },
  pending_assessment: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Pending assessment" },
};

const REGION_COLORS: Record<JurisdictionRegion, string> = {
  EU: "#3b82f6",
  UK: "#8b5cf6",
  US: "#ef4444",
  APAC: "#f59e0b",
  Global: "#10b981",
};

function ReadinessBar({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function RegulatoryNavigatorPage() {
  const [filterRegion, setFilterRegion] = useState<JurisdictionRegion | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ApplicabilityStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() =>
    REGULATIONS.filter(r =>
      (filterRegion === "all" || r.region === filterRegion) &&
      (filterStatus === "all" || r.status === filterStatus)
    ),
    [filterRegion, filterStatus]
  );

  const applicable = REGULATIONS.filter(r => r.status === "applicable");
  const avgReadiness = applicable.length
    ? Math.round(applicable.reduce((s, r) => s + r.readinessScore, 0) / applicable.length)
    : 0;
  const gaps = applicable.flatMap(r => r.gaps).length;

  const regions: JurisdictionRegion[] = ["EU", "UK", "US", "APAC", "Global"];
  const statuses: ApplicabilityStatus[] = ["applicable", "monitor", "not_applicable", "pending_assessment"];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-500" />
          Regulatory Navigator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Multi-jurisdiction applicability assessment · Filing deadlines · Penalty exposure · Readiness scoring
        </p>
      </div>

      {/* Entity profile */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-semibold text-blue-700 mb-2">Entity profile used for applicability assessment</p>
        <div className="flex flex-wrap gap-4 text-xs text-blue-800">
          <span>Revenue: <strong>€{ENTITY.revenueEURm}m</strong></span>
          <span>Employees: <strong>{ENTITY.employees}</strong></span>
          <span>Listed: <strong>{ENTITY.listed ? "Yes" : "No"}</strong></span>
          <span>EU importer: <strong>{ENTITY.euImporter ? "Yes (CBAM goods)" : "No"}</strong></span>
          <span>UK operations: <strong>{ENTITY.operatesInUK ? "Yes" : "No"}</strong></span>
          <span>Scope 1: <strong>{ENTITY.averageScope1tCO2.toLocaleString()} tCO₂e</strong></span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Applicable Regulations", value: `${applicable.length}`, sub: `of ${REGULATIONS.length} assessed`, color: "text-green-600" },
          { label: "Avg. Readiness (applicable)", value: `${avgReadiness}%`, sub: "Across all applicable regs", color: avgReadiness >= 70 ? "text-green-600" : avgReadiness >= 50 ? "text-amber-600" : "text-red-600" },
          { label: "Open Compliance Gaps", value: `${gaps}`, sub: "Action items required", color: "text-red-600" },
          { label: "Nearest Filing Deadline", value: "Apr 2025", sub: "EU ETS allowance surrender", color: "text-orange-600" },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium">Region:</span>
        {(["all", ...regions] as const).map(r => (
          <button
            key={r}
            onClick={() => setFilterRegion(r as JurisdictionRegion | "all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterRegion === r
                ? r === "all" ? "bg-gray-800 text-white border-gray-800" : "text-white border-transparent"
                : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
            style={filterRegion === r && r !== "all" ? { backgroundColor: REGION_COLORS[r as JurisdictionRegion] } : {}}
          >
            {r === "all" ? "All regions" : r}
          </button>
        ))}
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500 font-medium">Status:</span>
        {(["all", ...statuses] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s as ApplicabilityStatus | "all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {s === "all" ? "All statuses" : STATUS_CONFIG[s as ApplicabilityStatus]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Regulation cards */}
      <div className="space-y-3">
        {filtered.map(reg => {
          const cfg = STATUS_CONFIG[reg.status];
          const Icon = cfg.icon;
          const isOpen = expanded === reg.id;
          return (
            <div key={reg.id} className={`border rounded-xl overflow-hidden ${cfg.bg}`}>
              <button
                className="w-full text-left px-5 py-4"
                onClick={() => setExpanded(isOpen ? null : reg.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{reg.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white" style={{ backgroundColor: REGION_COLORS[reg.region] }}>{reg.region}</span>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {reg.filingDeadline !== "N/A" ? `Next: ${reg.filingDeadline}` : "Not applicable"}</span>
                      <span>Penalty: {reg.penaltyMax}</span>
                      {reg.status === "applicable" && <span className="text-orange-600 font-medium">{reg.gaps.length} gap{reg.gaps.length !== 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                  {reg.status === "applicable" && (
                    <div className="w-24 shrink-0">
                      <ReadinessBar score={reg.readinessScore} />
                    </div>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-200 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 text-xs">
                    {/* Thresholds */}
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Applicability Thresholds</p>
                      <div className="space-y-2">
                        {reg.thresholds.map((t, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {t.met
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              : <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />}
                            <div>
                              <p className={t.met ? "text-gray-700" : "text-gray-400"}>{t.label}</p>
                              <p className="text-gray-400">Entity: {t.entityValue}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="font-semibold text-gray-700 mt-3 mb-1">In-scope topics</p>
                      <div className="flex flex-wrap gap-1">
                        {reg.scope.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Key requirements */}
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Key Requirements</p>
                      <ul className="space-y-1.5">
                        {reg.keyRequirements.map((req, i) => (
                          <li key={i} className="flex gap-2 text-gray-600">
                            <span className="text-gray-300 shrink-0">→</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps */}
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">
                        Compliance Gaps
                        {reg.gaps.length === 0 && <span className="ml-2 text-green-600 font-normal">None identified</span>}
                      </p>
                      {reg.gaps.length > 0 && (
                        <ul className="space-y-1.5">
                          {reg.gaps.map((gap, i) => (
                            <li key={i} className="flex gap-2 text-red-700 bg-red-50 rounded p-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3">
                        <p className="font-semibold text-gray-700 mb-1">Next Action</p>
                        <p className="text-gray-600">{reg.nextKey}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
