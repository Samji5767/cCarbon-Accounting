"use client";

import { Database, Search, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EMISSION_FACTORS } from "@/lib/emission-factors";
import { formatNumber } from "@/lib/utils";

interface Factor {
  key: string;
  category: string;
  name: string;
  factor: number;
  unit: string;
  source: string;
}

function buildFactorList(): Factor[] {
  const list: Factor[] = [];
  for (const [catKey, cat] of Object.entries(EMISSION_FACTORS)) {
    for (const [key, val] of Object.entries(cat as Record<string, { name: string; factor: number; unit: string; source: string }>)) {
      list.push({ key, category: catKey, ...val });
    }
  }
  return list;
}

const ALL_FACTORS = buildFactorList();

const CAT_LABELS: Record<string, string> = {
  stationary_combustion: "Scope 1 – Stationary Combustion",
  mobile_combustion: "Scope 1 – Mobile Combustion",
  fugitive: "Scope 1 – Fugitive",
  electricity: "Scope 2 – Purchased Electricity",
  scope3_upstream: "Scope 3 – Upstream",
};

const SOURCE_COLORS: Record<string, string> = {
  "DEFRA 2023": "bg-blue-100 text-blue-700",
  "IPCC AR5": "bg-purple-100 text-purple-700",
  "EPA eGRID 2022": "bg-green-100 text-green-700",
  "IEA 2023": "bg-orange-100 text-orange-700",
};

export default function FactorsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const filtered = ALL_FACTORS.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.key.includes(search.toLowerCase());
    const matchCat = !catFilter || f.category === catFilter;
    return matchSearch && matchCat;
  });

  const grouped = filtered.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, Factor[]>);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emission Factors Library</h1>
        <p className="text-gray-500 text-sm mt-1">IPCC AR5, DEFRA 2023, EPA eGRID, IEA — kg CO₂e per unit</p>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "DEFRA 2023", url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023" },
          { label: "IPCC AR5 (GWP)", url: "https://www.ipcc.ch/report/ar5/wg1/" },
          { label: "EPA eGRID 2022", url: "https://www.epa.gov/egrid" },
          { label: "IEA 2023", url: "https://www.iea.org/reports/greenhouse-gas-emissions-from-energy" },
        ].map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full hover:border-emerald-400 hover:text-emerald-700 transition-colors">
            <Database className="w-3 h-3" /> {s.label} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search factors..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setCatFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${!catFilter ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:border-gray-300"}`}>
            All
          </button>
          {Object.entries(CAT_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setCatFilter(k === catFilter ? null : k)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${catFilter === k ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:border-gray-300"}`}>
              {v.split("–")[1]?.trim() ?? v}
            </button>
          ))}
        </div>
      </div>

      {/* Factor tables by category */}
      {Object.entries(grouped).map(([cat, factors]) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{CAT_LABELS[cat] ?? cat}</CardTitle>
            <CardDescription>{factors.length} factors</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Activity", "Factor (kg CO₂e / unit)", "Unit", "Source"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {factors.map((f) => (
                    <tr key={f.key} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-700">{formatNumber(f.factor, 5)}</td>
                      <td className="px-4 py-2.5 text-gray-500">per {f.unit}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_COLORS[f.source] ?? "bg-gray-100 text-gray-600"}`}>
                          {f.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">GWP Values (IPCC AR5, 100-year)</p>
          <div className="grid grid-cols-3 gap-4 text-xs text-amber-700">
            <div><span className="font-medium">CO₂:</span> 1 (reference)</div>
            <div><span className="font-medium">CH₄ (fossil):</span> 28 kg CO₂e/kg</div>
            <div><span className="font-medium">N₂O:</span> 265 kg CO₂e/kg</div>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            CO₂e = CO₂ × 1 + CH₄ × 28 + N₂O × 265. The GHG Protocol and most national regulators mandate IPCC AR5 GWP values.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
