"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, Download, Info } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type GWPBasis = "AR5" | "AR6";

interface EmissionFactor {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  value_ar5: number;
  value_ar6: number;
  unit: string;
  source: string;
  region: string;
  year: number;
  uncertaintyPct: number;
  tags: string[];
}

// ── Data generation ───────────────────────────────────────────────────────────
const CATEGORIES = [
  "Energy", "Transport", "Waste", "Materials", "Agriculture", "Industrial", "Refrigerants", "Water",
] as const;

const SOURCES = ["DEFRA 2024", "IPCC AR6 Ch4", "EPA 2024", "IEA 2024", "GHG Protocol", "Ecoinvent 3.10", "BEIS 2024"] as const;
const REGIONS = ["Global", "UK", "EU", "US", "China", "India"] as const;

function buildFactors(): EmissionFactor[] {
  const factors: EmissionFactor[] = [];

  const add = (
    name: string, cat: string, sub: string,
    v5: number, v6: number, unit: string,
    source: string, region: string, year: number, unc: number, tags: string[]
  ) => {
    factors.push({ id: `${cat}-${factors.length}`, name, category: cat, subcategory: sub, value_ar5: v5, value_ar6: v6, unit, source, region, year, uncertaintyPct: unc, tags });
  };

  // Energy – Electricity
  add("UK Grid Electricity",      "Energy", "Electricity", 0.207, 0.233, "kgCO₂e/kWh", "DEFRA 2024", "UK",     2024, 3, ["scope2", "market-based"]);
  add("EU Average Grid",          "Energy", "Electricity", 0.295, 0.312, "kgCO₂e/kWh", "IEA 2024",   "EU",     2024, 4, ["scope2"]);
  add("US Average Grid",          "Energy", "Electricity", 0.386, 0.411, "kgCO₂e/kWh", "EPA 2024",   "US",     2024, 4, ["scope2"]);
  add("China Grid Electricity",   "Energy", "Electricity", 0.581, 0.612, "kgCO₂e/kWh", "IEA 2024",   "China",  2024, 5, ["scope2"]);
  add("Solar PV (lifecycle)",     "Energy", "Electricity", 0.041, 0.043, "kgCO₂e/kWh", "IPCC AR6 Ch4","Global",2024, 10,["renewable"]);
  add("Onshore Wind (lifecycle)", "Energy", "Electricity", 0.011, 0.012, "kgCO₂e/kWh", "IPCC AR6 Ch4","Global",2024, 8, ["renewable"]);
  add("Offshore Wind (lifecycle)","Energy", "Electricity", 0.012, 0.013, "kgCO₂e/kWh", "IPCC AR6 Ch4","Global",2024, 9, ["renewable"]);
  add("Nuclear (lifecycle)",      "Energy", "Electricity", 0.012, 0.012, "kgCO₂e/kWh", "IPCC AR6 Ch4","Global",2024, 8, ["low-carbon"]);
  add("Coal Power Plant",         "Energy", "Electricity", 0.820, 0.870, "kgCO₂e/kWh", "IEA 2024",   "Global", 2024, 5, ["fossil", "scope1"]);
  add("Natural Gas CCGT",         "Energy", "Electricity", 0.490, 0.520, "kgCO₂e/kWh", "IEA 2024",   "Global", 2024, 5, ["fossil", "scope1"]);

  // Energy – Heat & Fuel
  add("Natural Gas (combustion)", "Energy", "Heat",        2.04,  2.13,  "kgCO₂e/m³",  "DEFRA 2024", "UK",     2024, 3, ["scope1", "heating"]);
  add("LPG (combustion)",         "Energy", "Heat",        1.51,  1.58,  "kgCO₂e/litre","DEFRA 2024","UK",     2024, 3, ["scope1"]);
  add("Fuel Oil (heavy)",         "Energy", "Heat",        2.96,  3.11,  "kgCO₂e/litre","DEFRA 2024","UK",     2024, 4, ["scope1"]);
  add("Biomass – wood pellets",   "Energy", "Heat",        0.015, 0.016, "kgCO₂e/kWh", "BEIS 2024",  "UK",     2024, 15,["biomass", "low-carbon"]);
  add("District heating (UK)",    "Energy", "Heat",        0.193, 0.204, "kgCO₂e/kWh", "DEFRA 2024", "UK",     2024, 6, ["scope2"]);

  // Transport – Road
  add("Petrol car (avg)",         "Transport","Road",       0.166, 0.174, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 3, ["scope1", "fleet"]);
  add("Diesel car (avg)",         "Transport","Road",       0.169, 0.178, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 3, ["scope1", "fleet"]);
  add("Battery EV (UK grid)",     "Transport","Road",       0.048, 0.051, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 4, ["scope3", "fleet"]);
  add("Large SUV petrol",         "Transport","Road",       0.238, 0.250, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 3, ["scope1"]);
  add("Delivery van diesel",      "Transport","Road",       0.270, 0.284, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 4, ["scope1", "logistics"]);
  add("Articulated HGV (diesel)", "Transport","Road",       0.880, 0.925, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 5, ["scope1", "logistics"]);
  add("Motorcycle",               "Transport","Road",       0.114, 0.120, "kgCO₂e/mi",  "DEFRA 2024", "UK",     2024, 4, ["scope1"]);
  add("Bus (avg occupancy)",      "Transport","Road",       0.102, 0.107, "kgCO₂e/pkm", "DEFRA 2024", "UK",     2024, 5, ["scope3", "commute"]);

  // Transport – Rail & Air
  add("Domestic flight UK",       "Transport","Aviation",   0.246, 0.259, "kgCO₂e/pkm", "DEFRA 2024", "UK",     2024, 8, ["scope3", "travel"]);
  add("Short-haul flight (<3h)",  "Transport","Aviation",   0.153, 0.161, "kgCO₂e/pkm", "DEFRA 2024", "Global", 2024, 8, ["scope3", "travel"]);
  add("Long-haul flight (econ)",  "Transport","Aviation",   0.115, 0.121, "kgCO₂e/pkm", "DEFRA 2024", "Global", 2024, 8, ["scope3", "travel"]);
  add("Long-haul flight (biz)",   "Transport","Aviation",   0.415, 0.437, "kgCO₂e/pkm", "DEFRA 2024", "Global", 2024, 8, ["scope3", "travel", "premium"]);
  add("National Rail UK",         "Transport","Rail",       0.035, 0.037, "kgCO₂e/pkm", "DEFRA 2024", "UK",     2024, 5, ["scope3", "commute"]);
  add("Eurostar",                 "Transport","Rail",       0.004, 0.004, "kgCO₂e/pkm", "DEFRA 2024", "EU",     2024, 6, ["scope3", "low-carbon"]);
  add("Freight – sea (container)","Transport","Shipping",   0.016, 0.017, "kgCO₂e/tkm", "DEFRA 2024", "Global", 2024, 7, ["scope3", "logistics"]);
  add("Freight – air cargo",      "Transport","Shipping",   0.602, 0.633, "kgCO₂e/tkm", "DEFRA 2024", "Global", 2024, 8, ["scope3", "logistics"]);

  // Waste
  add("Municipal landfill (mixed)","Waste","Landfill",      0.450, 0.479, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 10,["waste"]);
  add("Paper to landfill",        "Waste","Landfill",       0.840, 0.890, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 10,["waste"]);
  add("Food to landfill",         "Waste","Landfill",       0.580, 0.614, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 10,["waste"]);
  add("Plastic to landfill",      "Waste","Landfill",       0.011, 0.012, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 8, ["waste"]);
  add("Incineration (mixed)",     "Waste","Incineration",   0.240, 0.253, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 8, ["waste"]);
  add("Paper recycling",          "Waste","Recycling",      0.021, 0.022, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 8, ["waste"]);
  add("Plastic recycling",        "Waste","Recycling",      0.019, 0.020, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 8, ["waste"]);
  add("Metal recycling (aluminium)","Waste","Recycling",    0.030, 0.032, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 8, ["waste"]);
  add("Composting (food waste)",  "Waste","Composting",     0.100, 0.106, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 12,["waste"]);
  add("Anaerobic digestion",      "Waste","Composting",    -0.260,-0.275, "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 12,["waste", "negative"]);
  add("Wastewater treatment",     "Waste","Water",          0.708, 0.748, "kgCO₂e/m³",  "DEFRA 2024", "UK",     2024, 10,["waste"]);

  // Materials
  add("Primary steel (BOF)",      "Materials","Steel",       2.30,  2.42,  "kgCO₂e/kg",  "GHG Protocol","Global",2024, 8, ["scope3", "industrial"]);
  add("Primary aluminium",        "Materials","Metals",      8.24,  8.67,  "kgCO₂e/kg",  "GHG Protocol","Global",2024, 7, ["scope3", "industrial"]);
  add("Concrete (ready-mix)",     "Materials","Construction",0.11,  0.116, "kgCO₂e/kg",  "Ecoinvent 3.10","Global",2024,10,["scope3", "construction"]);
  add("Cement (Portland)",        "Materials","Construction",0.83,  0.874, "kgCO₂e/kg",  "GHG Protocol","Global",2024, 6, ["scope3", "construction"]);
  add("Flat glass",               "Materials","Construction",1.23,  1.295, "kgCO₂e/kg",  "Ecoinvent 3.10","EU",  2024, 10,["scope3"]);
  add("Paper (virgin)",           "Materials","Pulp & Paper",0.919, 0.968, "kgCO₂e/kg",  "Ecoinvent 3.10","EU",  2024, 10,["scope3"]);
  add("Plastics (HDPE)",          "Materials","Plastics",    1.93,  2.031, "kgCO₂e/kg",  "Ecoinvent 3.10","Global",2024, 8, ["scope3"]);
  add("Plastics (PET)",           "Materials","Plastics",    2.15,  2.263, "kgCO₂e/kg",  "Ecoinvent 3.10","Global",2024, 8, ["scope3"]);
  add("Cotton (raw)",             "Materials","Textiles",    8.00,  8.42,  "kgCO₂e/kg",  "Ecoinvent 3.10","Global",2024, 15,["scope3", "agriculture"]);
  add("Polyester fibre",          "Materials","Textiles",    5.50,  5.79,  "kgCO₂e/kg",  "Ecoinvent 3.10","Global",2024, 10,["scope3"]);

  // Agriculture
  add("Beef (UK)",                "Agriculture","Livestock", 27.0,  27.9,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 20,["food", "scope3"]);
  add("Lamb",                     "Agriculture","Livestock", 39.2,  40.5,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 20,["food", "scope3"]);
  add("Pork",                     "Agriculture","Livestock",  7.6,   7.9,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 15,["food", "scope3"]);
  add("Chicken",                  "Agriculture","Livestock",  5.4,   5.6,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 15,["food", "scope3"]);
  add("Dairy milk",               "Agriculture","Dairy",      1.14,  1.18, "kgCO₂e/litre","DEFRA 2024","UK",     2024, 12,["food", "scope3"]);
  add("Cheese (cheddar)",         "Agriculture","Dairy",      8.50,  8.79,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 12,["food", "scope3"]);
  add("Wheat grain",              "Agriculture","Crops",      0.59,  0.61,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 12,["food", "scope3"]);
  add("Vegetables (avg)",         "Agriculture","Crops",      0.30,  0.31,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 15,["food", "scope3"]);
  add("Potatoes",                 "Agriculture","Crops",      0.20,  0.21,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 12,["food", "scope3"]);
  add("Fertiliser (nitrogen)",    "Agriculture","Inputs",     4.80,  5.04,  "kgCO₂e/kg",  "DEFRA 2024", "UK",     2024, 10,["scope3"]);

  // Industrial processes
  add("Lime (calcination)",       "Industrial","Process",     0.75,  0.789, "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 6, ["scope1"]);
  add("Ammonia production",       "Industrial","Process",     1.90,  2.0,   "kgCO₂e/kg",  "GHG Protocol","Global",2024, 8, ["scope1"]);
  add("Hydrogen (grey)",          "Industrial","Hydrogen",    11.0,  11.57, "kgCO₂e/kg",  "IEA 2024",   "Global", 2024, 8, ["scope3"]);
  add("Hydrogen (green)",         "Industrial","Hydrogen",    0.97,  1.02,  "kgCO₂e/kg",  "IEA 2024",   "Global", 2024, 15,["scope3", "low-carbon"]);
  add("Hydrogen (blue CCS)",      "Industrial","Hydrogen",    2.40,  2.52,  "kgCO₂e/kg",  "IEA 2024",   "Global", 2024, 12,["scope3"]);

  // Refrigerants
  add("HFC-134a",                 "Refrigerants","HFC",      1430,  1530,  "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 5, ["scope1", "f-gas"]);
  add("HFC-404A",                 "Refrigerants","HFC",      3922,  4190,  "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 5, ["scope1", "f-gas"]);
  add("HFC-410A",                 "Refrigerants","HFC",      2088,  2230,  "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 5, ["scope1", "f-gas"]);
  add("R-32 (HFC)",               "Refrigerants","HFC",       675,   716,  "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 5, ["scope1", "f-gas"]);
  add("SF₆",                     "Refrigerants","SF6",       23500, 25200, "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 3, ["scope1", "f-gas"]);
  add("R-1234yf (HFO)",          "Refrigerants","HFO",          4,     4,  "kgCO₂e/kg",  "IPCC AR6 Ch4","Global",2024, 8, ["scope1", "low-gwp"]);

  // Water
  add("Mains water supply (UK)",  "Water","Supply",           0.149, 0.157, "kgCO₂e/m³",  "DEFRA 2024", "UK",     2024, 8, ["scope3", "water"]);
  add("Treated water (import)",   "Water","Supply",           0.344, 0.362, "kgCO₂e/m³",  "DEFRA 2024", "UK",     2024, 10,["scope3", "water"]);
  add("Water desalination",       "Water","Supply",           3.50,  3.68,  "kgCO₂e/m³",  "Ecoinvent 3.10","Global",2024,12, ["scope3"]);

  return factors;
}

const ALL_FACTORS = buildFactors();

const CAT_COLORS: Record<string, string> = {
  Energy:       "#f59e0b",
  Transport:    "#3b82f6",
  Waste:        "#10b981",
  Materials:    "#8b5cf6",
  Agriculture:  "#ec4899",
  Industrial:   "#f97316",
  Refrigerants: "#ef4444",
  Water:        "#06b6d4",
};

const UNCERTAINTY_COLOR = (pct: number) =>
  pct <= 5 ? "text-emerald-600 bg-emerald-50" :
  pct <= 10 ? "text-amber-600 bg-amber-50" :
  "text-rose-600 bg-rose-50";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FactorLibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [gwp, setGwp] = useState<GWPBasis>("AR6");
  const [sortKey, setSortKey] = useState<"name" | "value" | "unc">("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<EmissionFactor | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_FACTORS
      .filter(f =>
        (category === "All" || f.category === category) &&
        (f.name.toLowerCase().includes(q) ||
         f.subcategory.toLowerCase().includes(q) ||
         f.tags.some(t => t.includes(q)))
      )
      .sort((a, b) => {
        const av = sortKey === "name" ? a.name : sortKey === "value" ? (gwp === "AR5" ? a.value_ar5 : a.value_ar6) : a.uncertaintyPct;
        const bv = sortKey === "name" ? b.name : sortKey === "value" ? (gwp === "AR5" ? b.value_ar5 : b.value_ar6) : b.uncertaintyPct;
        if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
  }, [search, category, gwp, sortKey, sortDir]);

  // Top 15 by value for chart
  const top15 = useMemo(() => {
    return [...ALL_FACTORS]
      .sort((a, b) => Math.abs(gwp === "AR5" ? b.value_ar5 : b.value_ar6) - Math.abs(gwp === "AR5" ? a.value_ar5 : a.value_ar6))
      .slice(0, 15)
      .map(f => ({
        name:  f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name,
        value: gwp === "AR5" ? f.value_ar5 : f.value_ar6,
        cat:   f.category,
      }));
  }, [gwp]);

  // Category averages chart
  const catAvg = useMemo(() =>
    CATEGORIES.map(cat => {
      const items = ALL_FACTORS.filter(f => f.category === cat);
      const avg = items.reduce((s, f) => s + (gwp === "AR5" ? f.value_ar5 : f.value_ar6), 0) / items.length;
      return { cat, avg: +avg.toFixed(3), count: items.length };
    }), [gwp]);

  const toggleSort = (key: "name" | "value" | "unc") => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const getValue = (f: EmissionFactor) => gwp === "AR5" ? f.value_ar5 : f.value_ar6;

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 md:pb-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Emission Factor Library</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ALL_FACTORS.length} factors · DEFRA 2024, IPCC AR6, EPA, IEA, Ecoinvent 3.10</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
            {(["AR5", "AR6"] as GWPBasis[]).map(basis => (
              <button key={basis} onClick={() => setGwp(basis)}
                className={cn("px-3 py-1.5 font-medium transition-colors",
                  gwp === basis ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-50")}>
                {basis}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 15 Highest Impact Factors ({gwp})</CardTitle>
            <CardDescription className="text-xs">All units vary — comparison only</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top15} layout="vertical" margin={{ top: 0, right: 10, left: 90, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={88} />
                  <Tooltip formatter={(v: unknown) => [formatNumber(Number(v), 3)]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {top15.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.cat] ?? "#6366f1"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Category Average EF ({gwp})</CardTitle>
            <CardDescription className="text-xs">Mean across all factors in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catAvg} margin={{ top: 4, right: 8, left: -12, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cat" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [formatNumber(Number(v), 3), "Avg EF"]} />
                  <Bar dataKey="avg" radius={[5, 5, 0, 0]}>
                    {catAvg.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.cat] ?? "#6366f1"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search factors, categories, tags…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={category} onChange={e => setCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white cursor-pointer"
          >
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500">{filtered.length} of {ALL_FACTORS.length} factors shown</p>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: "name",  label: "Factor Name" },
                  { key: null,    label: "Category" },
                  { key: null,    label: "Unit" },
                  { key: "value", label: `EF (${gwp})` },
                  { key: "unc",   label: "±%" },
                  { key: null,    label: "Source" },
                ].map(({ key, label }) => (
                  <th key={label} onClick={() => key && toggleSort(key as "name" | "value" | "unc")}
                    className={cn("px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap",
                      key && "cursor-pointer hover:text-emerald-700 select-none")}>
                    {label} {key && sortKey === key && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((f, i) => (
                <tr key={f.id}
                  onClick={() => setSelected(selected?.id === f.id ? null : f)}
                  className={cn("border-b border-slate-100 cursor-pointer transition-colors",
                    selected?.id === f.id ? "bg-emerald-50" : i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100")}>
                  <td className="px-3 py-2.5 font-medium text-slate-900 max-w-[200px] truncate">{f.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${CAT_COLORS[f.category]}18`, color: CAT_COLORS[f.category] }}>
                      {f.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{f.unit}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900 font-mono tabular-nums">
                    {formatNumber(getValue(f), getValue(f) >= 10 ? 0 : getValue(f) >= 1 ? 2 : 3)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", UNCERTAINTY_COLOR(f.uncertaintyPct))}>
                      {f.uncertaintyPct}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 80 && (
            <p className="text-xs text-slate-400 text-center py-3">Showing 80 of {filtered.length} — refine search to see more</p>
          )}
        </div>
      </Card>

      {/* Detail panel */}
      {selected && (
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.category} › {selected.subcategory}</p>
              </div>
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "AR5 (GWP100)", value: formatNumber(selected.value_ar5, selected.value_ar5 >= 10 ? 0 : 3), unit: selected.unit },
                { label: "AR6 (GWP100)", value: formatNumber(selected.value_ar6, selected.value_ar6 >= 10 ? 0 : 3), unit: selected.unit },
                { label: "Uncertainty",  value: `±${selected.uncertaintyPct}%`, unit: "" },
                { label: "Vintage",      value: String(selected.year), unit: "" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-slate-900 tabular-nums">{value}</p>
                  {unit && <p className="text-[10px] text-slate-400 font-mono">{unit}</p>}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {selected.tags.map(t => <Badge key={t} className="text-xs bg-emerald-100 text-emerald-700">{t}</Badge>)}
              <Badge className="text-xs bg-slate-100 text-slate-600">{selected.region}</Badge>
              <Badge className="text-xs bg-slate-100 text-slate-600">{selected.source}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
