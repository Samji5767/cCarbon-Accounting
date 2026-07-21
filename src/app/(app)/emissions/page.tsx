"use client";

import { useState } from "react";
import { Plus, Download, CheckCircle, Clock, Factory, Zap, Globe, Upload, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

interface EmissionRecord {
  id: string;
  scope: number;
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  co2e: number;
  verified: boolean;
  year: number;
  month: number | null;
  dataSource: string | null;
  facility: { name: string } | null;
  emissionFactor: { source: string; name: string } | null;
}

type GWPVersion = "AR4" | "AR5" | "AR6";

// GWP100 multiplier delta vs AR5 baseline — applied as a proportional adjustment
// AR4: CH4=25/N2O=298, AR5: CH4=28/N2O=265, AR6: CH4=27.9/N2O=273
// Most records are CO2-dominant; Scope 1 fugitives carry methane uplift
const GWP_SCOPE1_MULTIPLIER: Record<GWPVersion, number> = { AR4: 0.97, AR5: 1.00, AR6: 1.02 };
const GWP_LABEL: Record<GWPVersion, string> = {
  AR4: "AR4 (IPCC 2007) — CH₄=25, N₂O=298",
  AR5: "AR5 (IPCC 2013) — CH₄=28, N₂O=265",
  AR6: "AR6 (IPCC 2021) — CH₄=27.9, N₂O=273",
};

// Data Quality tier colours
const DQ_TIER: Record<string, { label: string; color: string }> = {
  stationary_combustion: { label: "T1", color: "bg-emerald-100 text-emerald-700" },
  electricity:           { label: "T2", color: "bg-blue-100 text-blue-700" },
  mobile_combustion:     { label: "T1", color: "bg-emerald-100 text-emerald-700" },
  fugitive:              { label: "T2", color: "bg-yellow-100 text-yellow-700" },
  business_travel:       { label: "T3", color: "bg-orange-100 text-orange-700" },
  employee_commuting:    { label: "T3", color: "bg-orange-100 text-orange-700" },
  waste:                 { label: "T3", color: "bg-orange-100 text-orange-700" },
  purchased_goods:       { label: "T4", color: "bg-red-100 text-red-700" },
};

// Biogenic CO2 fractions by category (share of reported co2e that is biogenic)
const BIOGENIC_FRACTION: Record<string, number> = {
  stationary_combustion: 0.12, // biomass co-firing typical
  mobile_combustion: 0.05,
  waste: 0.40,
};

const SCOPE_ICONS = { 1: Factory, 2: Zap, 3: Globe };
const SCOPE_COLORS = { 1: "bg-red-100 text-red-700", 2: "bg-orange-100 text-orange-700", 3: "bg-yellow-100 text-yellow-700" };

function formatCategory(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const DEMO_RECORDS: EmissionRecord[] = [
  { id: "e1", scope: 1, category: "stationary_combustion", activityType: "Natural gas boiler", quantity: 48200, unit: "m³", co2e: 96.4, verified: true, year: 2024, month: null, dataSource: "Meter reading", facility: { name: "Site A" }, emissionFactor: { source: "BEIS 2023", name: "Natural gas" } },
  { id: "e2", scope: 1, category: "mobile_combustion", activityType: "Diesel fleet", quantity: 32100, unit: "litres", co2e: 85.7, verified: true, year: 2024, month: null, dataSource: "Fleet management", facility: { name: "Site A" }, emissionFactor: { source: "BEIS 2023", name: "Diesel" } },
  { id: "e3", scope: 1, category: "stationary_combustion", activityType: "HFO combustion", quantity: 8400, unit: "litres", co2e: 22.3, verified: false, year: 2024, month: null, dataSource: "Invoice", facility: { name: "Site C" }, emissionFactor: { source: "IPCC 2006", name: "Heavy fuel oil" } },
  { id: "e4", scope: 1, category: "fugitive_emissions", activityType: "Refrigerant leak (R410a)", quantity: 12, unit: "kg", co2e: 25.8, verified: false, year: 2024, month: null, dataSource: "Maintenance log", facility: { name: "Site B" }, emissionFactor: { source: "IPCC AR5", name: "R410a" } },
  { id: "e5", scope: 2, category: "purchased_electricity", activityType: "Grid electricity (LB)", quantity: 1824000, unit: "kWh", co2e: 378.0, verified: true, year: 2024, month: null, dataSource: "Utility invoice", facility: { name: "All sites" }, emissionFactor: { source: "IEA 2023", name: "EU grid average" } },
  { id: "e6", scope: 2, category: "purchased_heat", activityType: "District heat", quantity: 420000, unit: "kWh", co2e: 58.4, verified: true, year: 2024, month: null, dataSource: "Utility invoice", facility: { name: "Site A" }, emissionFactor: { source: "BEIS 2023", name: "District heating" } },
  { id: "e7", scope: 3, category: "purchased_goods", activityType: "Steel (hot-rolled)", quantity: 4200, unit: "tonnes", co2e: 8232.0, verified: false, year: 2024, month: null, dataSource: "Spend-based", facility: null, emissionFactor: { source: "Ecoinvent 3.9", name: "Steel billet EU" } },
  { id: "e8", scope: 3, category: "business_travel", activityType: "Long-haul flights", quantity: 840, unit: "passenger-km (000)", co2e: 192.7, verified: false, year: 2024, month: null, dataSource: "Travel agency", facility: null, emissionFactor: { source: "BEIS 2023", name: "Long-haul flight" } },
  { id: "e9", scope: 3, category: "waste", activityType: "Landfill (mixed)", quantity: 128, unit: "tonnes", co2e: 24.2, verified: false, year: 2024, month: null, dataSource: "Waste contractor", facility: { name: "Site B" }, emissionFactor: { source: "BEIS 2023", name: "Landfill (mixed)" } },
  { id: "e10", scope: 3, category: "upstream_transport", activityType: "Road freight inbound", quantity: 284000, unit: "tonne-km", co2e: 63.4, verified: false, year: 2024, month: null, dataSource: "Logistics system", facility: null, emissionFactor: { source: "GLEC 2023", name: "HGV > 34t EU" } },
];

export default function EmissionsPage() {
  const [records, setRecords] = useState<EmissionRecord[]>(DEMO_RECORDS);
  const [scopeFilter, setScopeFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [gwpVersion, setGwpVersion] = useState<GWPVersion>("AR5");
  const [showGwpInfo, setShowGwpInfo] = useState(false);
  const [form, setForm] = useState({
    scope: "1", category: "stationary_combustion", activityType: "natural_gas",
    quantity: "", unit: "m3", co2e: "", year: "2024", dataSource: "", facilityId: "",
  });

  function adjustedCo2e(r: EmissionRecord): number {
    const mult = r.scope === 1 ? GWP_SCOPE1_MULTIPLIER[gwpVersion] : 1;
    return r.co2e * mult;
  }

  const filtered = scopeFilter ? records.filter((r) => r.scope === scopeFilter) : records;

  const scopeTotals = {
    1: records.filter((r) => r.scope === 1).reduce((s, r) => s + adjustedCo2e(r), 0),
    2: records.filter((r) => r.scope === 2).reduce((s, r) => s + adjustedCo2e(r), 0),
    3: records.filter((r) => r.scope === 3).reduce((s, r) => s + adjustedCo2e(r), 0),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newRecord: EmissionRecord = {
      id: `e${Date.now()}`, scope: parseInt(form.scope),
      category: form.category, activityType: form.activityType,
      quantity: parseFloat(form.quantity), unit: form.unit,
      co2e: parseFloat(form.co2e), verified: false,
      year: parseInt(form.year), month: null,
      dataSource: form.dataSource || null, facility: null, emissionFactor: null,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="md:hidden">
        <PageHeader title="Emissions" subtitle="GHG Protocol Scope 1, 2 & 3 · 2024" />
      </div>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Emission Records</h1>
          <p className="text-gray-500 text-sm mt-1">GHG Protocol Scope 1, 2 & 3 inventory · 2024</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>

      {/* GWP Version selector */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex-1 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-blue-800">GWP100 Version:</span>
          {(["AR4", "AR5", "AR6"] as GWPVersion[]).map((v) => (
            <button
              key={v}
              onClick={() => setGwpVersion(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                gwpVersion === v ? "bg-blue-600 text-white" : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-100"
              }`}
            >
              {v}
            </button>
          ))}
          <span className="text-xs text-blue-600">{GWP_LABEL[gwpVersion]}</span>
        </div>
        <button onClick={() => setShowGwpInfo(!showGwpInfo)} className="text-blue-500 hover:text-blue-700">
          <Info className="w-4 h-4" />
        </button>
      </div>
      {showGwpInfo && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 space-y-1">
          <p><strong>AR4 (2007):</strong> CH₄ = 25 × CO₂, N₂O = 298 × CO₂. Used for UNFCCC reporting pre-2015.</p>
          <p><strong>AR5 (2013):</strong> CH₄ = 28 × CO₂, N₂O = 265 × CO₂. Most GHG Protocol inventories default to AR5.</p>
          <p><strong>AR6 (2021):</strong> CH₄ = 27.9 × CO₂, N₂O = 273 × CO₂. CSRD/ESRS E1 requires AR5 or AR6; SBTi moved to AR5.</p>
          <p className="text-blue-500 mt-1">GWP adjustment applies only to Scope 1 records where non-CO₂ gases are material (fugitive, combustion). CO₂-dominant records are unaffected.</p>
        </div>
      )}

      {/* Bulk Import drop zone */}
      {showImport && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
            <Upload className="w-10 h-10 text-gray-300" />
            <p className="font-semibold text-gray-600">Drag & drop a CSV file here</p>
            <p className="text-xs text-gray-400">Expected columns: scope, category, activityType, quantity, unit, co2e, year, dataSource, facilityName</p>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Browse file</button>
              <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setShowImport(false)}>Cancel</button>
            </div>
            <a href="#" className="text-xs text-blue-500 underline">Download template CSV</a>
          </CardContent>
        </Card>
      )}

      {/* Scope summary tabs */}
      <div className="grid grid-cols-4 gap-4">
        {([null, 1, 2, 3] as (number | null)[]).map((scope) => {
          const total = scope ? scopeTotals[scope as 1 | 2 | 3] : Object.values(scopeTotals).reduce((a, b) => a + b, 0);
          const label = scope ? `Scope ${scope}` : "All Scopes";
          const active = scopeFilter === scope;
          return (
            <button
              key={String(scope)}
              onClick={() => setScopeFilter(scope)}
              className={`p-4 rounded-xl border text-left transition-all ${active ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${active ? "text-emerald-700" : "text-gray-900"}`}>
                {formatNumber(total)} t
              </p>
              <p className="text-xs text-gray-400">CO₂e ({gwpVersion})</p>
            </button>
          );
        })}
      </div>

      {/* Add record form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Emission Record</CardTitle>
            <CardDescription>Enter activity data to calculate CO₂e</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Scope *</label>
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="1">Scope 1 – Direct</option>
                  <option value="2">Scope 2 – Electricity</option>
                  <option value="3">Scope 3 – Value Chain</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="stationary_combustion">Stationary Combustion</option>
                  <option value="mobile_combustion">Mobile Combustion</option>
                  <option value="fugitive">Fugitive Emissions</option>
                  <option value="electricity">Electricity (purchased)</option>
                  <option value="business_travel">Business Travel</option>
                  <option value="employee_commuting">Employee Commuting</option>
                  <option value="waste">Waste</option>
                  <option value="purchased_goods">Purchased Goods</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Activity Type *</label>
                <input value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. natural_gas" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Year *</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity *</label>
                <input type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="m3">m³ (gas)</option>
                  <option value="litre">Litre</option>
                  <option value="kWh">kWh</option>
                  <option value="kg">kg</option>
                  <option value="tonne">Tonne</option>
                  <option value="km">km</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CO₂e (tonnes) *</label>
                <input type="number" step="any" value={form.co2e} onChange={(e) => setForm({ ...form, co2e: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Data Source</label>
                <input value={form.dataSource} onChange={(e) => setForm({ ...form, dataSource: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. utility bills" />
              </div>
              <div className="col-span-2 md:col-span-4 flex gap-2 pt-2">
                <Button type="submit" size="sm">Save Record</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Scope", "Category", "Activity", "Quantity", `CO₂e (t, ${gwpVersion})`, "Biogenic CO₂", "DQ", "Facility", "Source", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                ) : (
                  filtered.map((r) => {
                    const ScopeIcon = SCOPE_ICONS[r.scope as 1 | 2 | 3];
                    const adj = adjustedCo2e(r);
                    const biogenicFrac = BIOGENIC_FRACTION[r.category] ?? 0;
                    const biogenicCo2 = adj * biogenicFrac;
                    const dq = DQ_TIER[r.category] ?? { label: "T3", color: "bg-orange-100 text-orange-700" };
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SCOPE_COLORS[r.scope as 1 | 2 | 3]}`}>
                            <ScopeIcon className="w-3 h-3" /> {r.scope}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatCategory(r.category)}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.activityType}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatNumber(r.quantity, 0)} {r.unit}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatNumber(adj)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {biogenicCo2 > 0 ? (
                            <span className="text-green-600 font-mono">{formatNumber(biogenicCo2, 1)} t</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${dq.color}`} title="Data quality tier (T1=measured, T4=spend-based)">
                            {dq.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.facility?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{r.emissionFactor?.source ?? r.dataSource ?? "—"}</td>
                        <td className="px-4 py-3">
                          {r.verified ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs text-gray-500 px-1">
        <div>
          <span className="font-semibold text-gray-700">DQ Tiers:</span>{" "}
          T1 = Metered/measured · T2 = Supplier-specific EF · T3 = Industry-average EF · T4 = Spend-based estimation
        </div>
        <div>
          <span className="font-semibold text-gray-700">Biogenic CO₂:</span>{" "}
          Reported separately per GHG Protocol; not included in tCO₂e market-based total.
        </div>
      </div>

      {/* GHG Protocol guidance */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-emerald-800 mb-2">GHG Protocol Scope Definitions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-700">
            <div><span className="font-medium">Scope 1 – Direct:</span> Emissions from sources owned or controlled by the company (combustion, process, fugitive).</div>
            <div><span className="font-medium">Scope 2 – Indirect:</span> Emissions from purchased electricity, heat, steam or cooling.</div>
            <div><span className="font-medium">Scope 3 – Value Chain:</span> All other indirect emissions across the upstream and downstream value chain.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
