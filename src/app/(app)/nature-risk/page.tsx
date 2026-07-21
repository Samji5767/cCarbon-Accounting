"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { Leaf, Droplets, Wind, Mountain, Fish, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

type ImpactDriver = "land_use" | "water_use" | "ghg" | "pollution" | "resource_use" | "invasive_species";
type DependencyType = "provisioning" | "regulating" | "cultural";
type DisclosureStatus = "reported" | "partial" | "not_assessed";

interface NatureRisk {
  id: string;
  location: string;
  biome: string;
  integrityScore: number;
  waterStressLevel: "high" | "medium" | "low";
  protectedAreaProximityKm: number;
  keyDrivers: ImpactDriver[];
  financialExposureEURm: number;
  mitigationStatus: "none" | "planned" | "in_progress" | "implemented";
}

interface Dependency {
  id: string;
  service: string;
  type: DependencyType;
  dependencyLevel: "high" | "medium" | "low";
  description: string;
  valuationEURm: number | null;
  disclosureStatus: DisclosureStatus;
}

interface PAIMetric {
  indicator: string;
  framework: string;
  value2024: string;
  value2023: string;
  unit: string;
  status: DisclosureStatus;
}

const NATURE_RISKS: NatureRisk[] = [
  {
    id: "n1", location: "Site A — Rhine Valley, Germany", biome: "Temperate broadleaf forest",
    integrityScore: 62, waterStressLevel: "medium", protectedAreaProximityKm: 3.2,
    keyDrivers: ["land_use", "water_use", "pollution"],
    financialExposureEURm: 14.5, mitigationStatus: "in_progress",
  },
  {
    id: "n2", location: "Site C — Andalusia, Spain", biome: "Mediterranean shrubland",
    integrityScore: 41, waterStressLevel: "high", protectedAreaProximityKm: 0.8,
    keyDrivers: ["water_use", "land_use"],
    financialExposureEURm: 22.0, mitigationStatus: "planned",
  },
  {
    id: "n3", location: "Supply — Brazil (soy)", biome: "Cerrado savanna",
    integrityScore: 28, waterStressLevel: "medium", protectedAreaProximityKm: 1.4,
    keyDrivers: ["land_use", "resource_use", "invasive_species"],
    financialExposureEURm: 9.8, mitigationStatus: "none",
  },
  {
    id: "n4", location: "Supply — Palm (Malaysia)", biome: "Tropical moist forest",
    integrityScore: 35, waterStressLevel: "low", protectedAreaProximityKm: 5.0,
    keyDrivers: ["land_use", "pollution"],
    financialExposureEURm: 6.2, mitigationStatus: "none",
  },
  {
    id: "n5", location: "Site B — East Midlands, UK", biome: "Temperate grassland",
    integrityScore: 74, waterStressLevel: "low", protectedAreaProximityKm: 12.1,
    keyDrivers: ["ghg", "land_use"],
    financialExposureEURm: 3.1, mitigationStatus: "implemented",
  },
];

const DEPENDENCIES: Dependency[] = [
  {
    id: "d1", service: "Fresh water (surface & groundwater)", type: "provisioning",
    dependencyLevel: "high", description: "Cooling water for manufacturing processes; Sites A and C directly dependent on river/aquifer abstraction.",
    valuationEURm: 8.4, disclosureStatus: "reported",
  },
  {
    id: "d2", service: "Climate regulation (carbon sequestration)", type: "regulating",
    dependencyLevel: "high", description: "Nearby forest ecosystems sequester CO₂ that offsets residual emissions in net-zero calculation.",
    valuationEURm: 3.2, disclosureStatus: "partial",
  },
  {
    id: "d3", service: "Pollination (agricultural supply inputs)", type: "provisioning",
    dependencyLevel: "medium", description: "Raw material inputs (e.g. plant-based feedstocks) dependent on wild pollinator services.",
    valuationEURm: null, disclosureStatus: "not_assessed",
  },
  {
    id: "d4", service: "Water purification (wetlands)", type: "regulating",
    dependencyLevel: "medium", description: "Wetland ecosystems downstream of Site A reduce effluent treatment costs.",
    valuationEURm: 1.8, disclosureStatus: "partial",
  },
  {
    id: "d5", service: "Soil formation & fertility (agriculture inputs)", type: "provisioning",
    dependencyLevel: "medium", description: "Healthy soils underpin agricultural raw material supply chains.",
    valuationEURm: null, disclosureStatus: "not_assessed",
  },
  {
    id: "d6", service: "Flood regulation (riparian ecosystems)", type: "regulating",
    dependencyLevel: "high", description: "Site A is in a floodplain; degraded upstream ecosystems increase flood frequency risk.",
    valuationEURm: 12.0, disclosureStatus: "reported",
  },
  {
    id: "d7", service: "Aesthetic / recreational (workforce wellbeing)", type: "cultural",
    dependencyLevel: "low", description: "Green spaces adjacent to corporate offices benefit employee wellbeing.",
    valuationEURm: null, disclosureStatus: "not_assessed",
  },
];

const PAI_METRICS: PAIMetric[] = [
  { indicator: "Exposure to areas of high biodiversity sensitivity", framework: "TNFD / SFDR", value2024: "2 sites", value2023: "2 sites", unit: "sites", status: "reported" },
  { indicator: "Land use (direct operations)", framework: "GRI 304", value2024: "48.2", value2023: "48.2", unit: "ha", status: "reported" },
  { indicator: "Water abstraction (total)", framework: "GRI 303", value2024: "124,800", value2023: "138,200", unit: "m³/yr", status: "reported" },
  { indicator: "Water abstraction (high-stress regions)", framework: "WRI Aqueduct", value2024: "62,400", value2023: "71,600", unit: "m³/yr", status: "partial" },
  { indicator: "Deforestation-linked commodities (supply chain)", framework: "EU EUDR", value2024: "Soy, Palm", value2023: "Soy, Palm", unit: "commodities", status: "partial" },
  { indicator: "Species affected (IUCN Red List proximity)", framework: "TNFD LEAP", value2024: "3 threatened species", value2023: "Not assessed", unit: "species", status: "partial" },
  { indicator: "Ecosystem restoration spend", framework: "TNFD", value2024: "€240k", value2023: "€80k", unit: "EUR", status: "reported" },
  { indicator: "Total nature-related financial exposure", framework: "TNFD", value2024: "€55.6m", value2023: "Not assessed", unit: "EUR m", status: "partial" },
];

const DRIVER_ICONS: Record<ImpactDriver, React.ElementType> = {
  land_use: Mountain, water_use: Droplets, ghg: Wind,
  pollution: AlertTriangle, resource_use: Leaf, invasive_species: Fish,
};

const DRIVER_LABELS: Record<ImpactDriver, string> = {
  land_use: "Land use", water_use: "Water use", ghg: "GHG emissions",
  pollution: "Pollution", resource_use: "Resource use", invasive_species: "Invasive species",
};

const DEP_COLORS: Record<DependencyType, string> = {
  provisioning: "#10b981", regulating: "#3b82f6", cultural: "#a855f7",
};

const STATUS_CONFIG: Record<DisclosureStatus, { label: string; color: string }> = {
  reported: { label: "Reported", color: "#10b981" },
  partial: { label: "Partial", color: "#f59e0b" },
  not_assessed: { label: "Not assessed", color: "#9ca3af" },
};

const INTEGRITY_COLOR = (score: number) =>
  score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

export default function NatureRiskPage() {
  const [activeTab, setActiveTab] = useState<"locations" | "dependencies" | "disclosure">("locations");
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalExposure = NATURE_RISKS.reduce((s, r) => s + r.financialExposureEURm, 0);
  const highStressCount = NATURE_RISKS.filter(r => r.waterStressLevel === "high").length;
  const avgIntegrity = Math.round(NATURE_RISKS.reduce((s, r) => s + r.integrityScore, 0) / NATURE_RISKS.length);
  const totalNaturalCapitalEURm = DEPENDENCIES.filter(d => d.valuationEURm).reduce((s, d) => s + (d.valuationEURm ?? 0), 0);

  const radarData: { subject: string; score: number }[] = [
    { subject: "Land use", score: 38 },
    { subject: "Water use", score: 55 },
    { subject: "GHG", score: 72 },
    { subject: "Pollution", score: 61 },
    { subject: "Resource use", score: 44 },
    { subject: "Biodiversity", score: 29 },
  ];

  const depByType = useMemo(() => {
    const map: Record<string, number> = { provisioning: 0, regulating: 0, cultural: 0 };
    DEPENDENCIES.forEach(d => { map[d.type] += d.valuationEURm ?? 0; });
    return Object.entries(map).map(([type, val]) => ({ type, val }));
  }, []);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "locations", label: "Location Assessment" },
    { key: "dependencies", label: "Nature Dependencies" },
    { key: "disclosure", label: "TNFD / PAI Disclosure" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            Nature & Biodiversity Risk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            TNFD LEAP Approach (2023) · GRI 304 · SBTN · Natural capital dependency valuation
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Nature-Related Exposure", value: `€${totalExposure.toFixed(0)}m`, sub: "Direct financial exposure", color: "text-emerald-700" },
          { label: "Avg. Ecosystem Integrity", value: `${avgIntegrity}/100`, sub: "Biodiversity Intactness Index", color: avgIntegrity >= 60 ? "text-yellow-600" : "text-red-600" },
          { label: "High Water Stress Sites", value: `${highStressCount}`, sub: "WRI Aqueduct baseline", color: "text-blue-600" },
          { label: "Natural Capital Valued", value: `€${totalNaturalCapitalEURm.toFixed(1)}m`, sub: "Dependencies assessed", color: "text-purple-600" },
        ].map(c => (
          <Card key={c.label}><CardContent className="pt-5">
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Location Assessment */}
      {activeTab === "locations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Impact Driver Intensity</CardTitle>
                <CardDescription className="text-xs">Portfolio-level score (0–100, higher = lower impact)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Financial Exposure by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={NATURE_RISKS} layout="vertical" margin={{ left: 100, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `€${v}m`} />
                    <YAxis type="category" dataKey="location" tick={{ fontSize: 9 }} width={100} tickFormatter={v => v.split("—")[0].trim()} />
                    <Tooltip formatter={(v) => `€${Number(v)}m`} />
                    <Bar dataKey="financialExposureEURm" radius={[0, 4, 4, 0]}>
                      {NATURE_RISKS.map(r => <Cell key={r.id} fill={INTEGRITY_COLOR(r.integrityScore)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {NATURE_RISKS.map(r => (
            <Card key={r.id} className={r.integrityScore < 40 ? "border-red-200" : r.integrityScore < 60 ? "border-yellow-200" : ""}>
              <button className="w-full text-left px-5 py-4" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ backgroundColor: INTEGRITY_COLOR(r.integrityScore) }}>
                    {r.integrityScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{r.location}</p>
                    <p className="text-xs text-gray-500">{r.biome} · Water stress: <span className={r.waterStressLevel === "high" ? "text-red-600 font-medium" : r.waterStressLevel === "medium" ? "text-yellow-600" : "text-green-600"}>{r.waterStressLevel}</span> · Protected area: {r.protectedAreaProximityKm}km</p>
                    <div className="flex gap-2 mt-1">
                      {r.keyDrivers.map(d => {
                        const Icon = DRIVER_ICONS[d];
                        return <span key={d} className="flex items-center gap-0.5 text-[10px] text-gray-500"><Icon className="w-3 h-3" />{DRIVER_LABELS[d]}</span>;
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">€{r.financialExposureEURm}m</p>
                    <p className="text-xs text-gray-400">exposure</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${r.mitigationStatus === "implemented" ? "bg-green-100 text-green-700" : r.mitigationStatus === "in_progress" ? "bg-blue-100 text-blue-700" : r.mitigationStatus === "planned" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      Mitigation: {r.mitigationStatus.replace("_", " ")}
                    </span>
                  </div>
                  {expanded === r.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>
              </button>
              {expanded === r.id && (
                <div className="border-t px-5 pb-4 bg-emerald-50">
                  <p className="text-xs text-gray-500 mt-3">Biodiversity Intactness Index score of <strong>{r.integrityScore}/100</strong> — {r.integrityScore >= 70 ? "above global safety boundary (60)" : "below global safety boundary (60)"}. Protected area at {r.protectedAreaProximityKm}km {r.protectedAreaProximityKm < 2 ? "— within immediate impact zone per TNFD guidance." : "— outside immediate impact zone."}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Dependencies */}
      {activeTab === "dependencies" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Natural Capital Valuation by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={depByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `€${v}m`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `€${Number(v).toFixed(1)}m`} />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                      {depByType.map(d => <Cell key={d.type} fill={DEP_COLORS[d.type as DependencyType]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Dependency by Level</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-2">
                {(["high", "medium", "low"] as const).map(level => {
                  const deps = DEPENDENCIES.filter(d => d.dependencyLevel === level);
                  const color = level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#10b981";
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize" style={{ color }}>{level} dependency</span>
                        <span className="text-xs text-gray-400">{deps.length} services</span>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div className="h-full rounded-full" style={{ width: `${(deps.length / DEPENDENCIES.length) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {["Ecosystem Service", "Type", "Dependency Level", "Valuation (€m)", "Disclosure"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {DEPENDENCIES.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800">{d.service}</p>
                        <p className="text-gray-400 text-[10px]">{d.description}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize" style={{ color: DEP_COLORS[d.type], backgroundColor: DEP_COLORS[d.type] + "22" }}>{d.type}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] font-semibold capitalize ${d.dependencyLevel === "high" ? "text-red-600" : d.dependencyLevel === "medium" ? "text-yellow-600" : "text-green-600"}`}>{d.dependencyLevel}</span>
                      </td>
                      <td className="px-3 py-2 font-medium">{d.valuationEURm !== null ? `€${d.valuationEURm}m` : <span className="text-gray-400">Not valued</span>}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: STATUS_CONFIG[d.disclosureStatus].color, backgroundColor: STATUS_CONFIG[d.disclosureStatus].color + "22" }}>
                          {STATUS_CONFIG[d.disclosureStatus].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: TNFD / PAI Disclosure */}
      {activeTab === "disclosure" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nature-Related Disclosure Metrics</CardTitle>
            <CardDescription className="text-xs">TNFD (2023) · GRI 304 · SFDR PAI indicators</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["Indicator", "Framework", "2024", "2023", "Unit", "Status"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {PAI_METRICS.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{m.indicator}</td>
                    <td className="px-3 py-2 text-gray-500">{m.framework}</td>
                    <td className="px-3 py-2 font-medium">{m.value2024}</td>
                    <td className="px-3 py-2 text-gray-500">{m.value2023}</td>
                    <td className="px-3 py-2 text-gray-500">{m.unit}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: STATUS_CONFIG[m.status].color, backgroundColor: STATUS_CONFIG[m.status].color + "22" }}>
                        {STATUS_CONFIG[m.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Framework alignment — TNFD LEAP Approach</p>
        <p><strong>L</strong>ocate — identify interface with nature · <strong>E</strong>valuate — assess dependencies and impacts · <strong>A</strong>ssess — determine risks and opportunities · <strong>P</strong>repare — respond and report. Biodiversity Intactness Index (BII) sourced from PREDICTS/NHM. Water stress from WRI Aqueduct 3.0. Natural capital valuation per TEEB / SEEA EA methodology.</p>
      </div>
    </div>
  );
}
