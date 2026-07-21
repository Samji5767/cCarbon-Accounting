"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, Wind, Sun, Droplets, Star, MapPin, Shield, ChevronRight, Plus } from "lucide-react";

const PROJECTS = [
  {
    id: 1, name: "Borneo Rainforest REDD+", type: "Forest Protection", country: "Indonesia",
    icon: TreePine, color: "from-green-500 to-emerald-600",
    price: 18.50, vintage: 2024, standard: "Verra VCS", cobenefits: ["Biodiversity", "Community", "Water"],
    rating: 4.8, reviews: 234, available: 12400,
    description: "Protects 47,000 hectares of primary rainforest in Central Kalimantan, home to endangered orangutan populations.",
    verified: true, tag: "Popular",
  },
  {
    id: 2, name: "Scottish Wind Farm", type: "Renewable Energy", country: "UK",
    icon: Wind, color: "from-sky-500 to-blue-600",
    price: 12.00, vintage: 2024, standard: "Gold Standard", cobenefits: ["Local Jobs", "Energy Independence"],
    rating: 4.6, reviews: 89, available: 8200,
    description: "27-turbine wind farm in the Scottish Highlands generating 180MW of clean electricity annually.",
    verified: true, tag: "UK-Local",
  },
  {
    id: 3, name: "Sahel Cookstove Programme", type: "Cookstoves", country: "Mali",
    icon: Sun, color: "from-amber-500 to-orange-600",
    price: 8.75, vintage: 2023, standard: "Gold Standard", cobenefits: ["Health", "Women Empowerment", "SDG 7"],
    rating: 4.9, reviews: 412, available: 55000,
    description: "Distributes improved cookstoves to 30,000 households, reducing wood consumption by 65% and indoor air pollution.",
    verified: true, tag: "High Impact",
  },
  {
    id: 4, name: "Kenyan Blue Carbon", type: "Blue Carbon", country: "Kenya",
    icon: Droplets, color: "from-teal-500 to-cyan-600",
    price: 24.00, vintage: 2024, standard: "Verra VCS", cobenefits: ["Coastal Protection", "Fisheries", "Biodiversity"],
    rating: 4.7, reviews: 67, available: 3100,
    description: "Restores and protects 2,400 hectares of mangrove forest along the Kenyan coast, sequestering 15,000 tCO₂e/year.",
    verified: true, tag: "Premium",
  },
  {
    id: 5, name: "Brazil Atlantic Forest Restoration", type: "Reforestation", country: "Brazil",
    icon: TreePine, color: "from-lime-500 to-green-600",
    price: 15.25, vintage: 2024, standard: "Plan Vivo", cobenefits: ["Biodiversity", "Water", "Livelihoods"],
    rating: 4.5, reviews: 158, available: 9800,
    description: "Restores native Atlantic Forest in Rio Grande do Sul with smallholder farmers, creating 450 local jobs.",
    verified: true, tag: "Nature-Based",
  },
];

const PORTFOLIO = [
  { name: "Borneo REDD+", tonnes: 500, cost: 9250, vintage: 2023, status: "retired" },
  { name: "Scottish Wind Farm", tonnes: 200, cost: 2400, vintage: 2023, status: "active" },
  { name: "Sahel Cookstoves", tonnes: 150, cost: 1312, vintage: 2024, status: "active" },
];

const TYPES = ["All", "Forest", "Renewable", "Cookstoves", "Blue Carbon", "Reforestation"];

type Project = typeof PROJECTS[0];

export default function OffsetMarketPage() {
  const [tab, setTab] = useState<"market" | "portfolio">("market");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [tonnes, setTonnes] = useState("10");

  const filtered = PROJECTS.filter(p =>
    typeFilter === "All" ||
    p.type.toLowerCase().includes(typeFilter.toLowerCase()) ||
    (typeFilter === "Forest" && p.type === "Forest Protection") ||
    (typeFilter === "Renewable" && p.type === "Renewable Energy")
  );

  const totalOffset = PORTFOLIO.reduce((sum, p) => sum + p.tonnes, 0);
  const totalSpend = PORTFOLIO.reduce((sum, p) => sum + p.cost, 0);

  if (selected) {
    return (
      <div className="p-4 space-y-4 pb-24 md:pb-6">
        <button onClick={() => setSelected(null)} className="text-[15px] text-[#007AFF] font-medium flex items-center gap-1">
          ← Back to Market
        </button>
        <div className={`h-32 rounded-2xl bg-gradient-to-br ${selected.color} flex items-center justify-center`}>
          <selected.icon className="w-16 h-16 text-white/80" />
        </div>
        <div>
          <div className="flex items-start justify-between">
            <h2 className="text-[22px] font-bold text-slate-900 dark:text-white flex-1">{selected.name}</h2>
            <Badge variant="default" className="ml-2">{selected.tag}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[13px] text-slate-500">{selected.country}</span>
            <span className="text-slate-300">·</span>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[13px] text-emerald-600 font-medium">{selected.standard}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{selected.rating}</span>
            <span className="text-[13px] text-slate-400">({selected.reviews} reviews)</span>
          </div>
        </div>
        <Card className="p-4">
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{selected.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selected.cobenefits.map(b => (
              <span key={b} className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">{b}</span>
            ))}
          </div>
        </Card>
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[15px] font-semibold text-slate-800 dark:text-white">Purchase Credits</p>
            <p className="text-[15px] font-bold text-emerald-600">${selected.price}/tCO₂e</p>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Tonnes to retire</label>
            <input
              type="number" value={tonnes} onChange={e => setTonnes(e.target.value)} min="1"
              className="w-full mt-1.5 px-4 py-3 bg-slate-50 dark:bg-[#3a3a3c] rounded-xl text-[22px] font-bold text-slate-900 dark:text-white text-center outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-between py-2 border-t border-slate-100 dark:border-white/8">
            <span className="text-[14px] text-slate-500">Total cost</span>
            <span className="text-[16px] font-bold text-slate-900 dark:text-white">${(parseFloat(tonnes || "0") * selected.price).toFixed(2)}</span>
          </div>
          <button className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-[16px] active:scale-[0.98] transition-transform">
            Purchase &amp; Retire Credits
          </button>
          <p className="text-[11px] text-center text-slate-400">Credits are immediately retired in your name. Retirement certificate emailed within 24h.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 md:pb-6">
      <PageHeader title="Offset Market" subtitle="Verified carbon credits" />

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 dark:bg-[#2c2c2e] rounded-xl p-1">
        {(["market", "portfolio"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-[9px] text-[13px] font-semibold capitalize transition-all ${tab === t ? "bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}>
            {t === "portfolio" ? `My Portfolio (${totalOffset} t)` : "Marketplace"}
          </button>
        ))}
      </div>

      {tab === "market" && (
        <>
          {/* Type filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${typeFilter === t ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-[#2c2c2e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Project cards */}
          <div className="space-y-3">
            {filtered.map(p => (
              <Card key={p.id} className="overflow-hidden cursor-pointer active:scale-[0.99] transition-transform" onClick={() => setSelected(p)}>
                <div className="flex gap-3 p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{p.name}</p>
                      <Badge variant="secondary" className="text-[10px] py-0 shrink-0">{p.tag}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] text-slate-500">{p.country}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[12px] text-slate-500">{p.standard}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">{p.rating}</span>
                      </div>
                      <span className="text-[15px] font-bold text-emerald-600">
                        ${p.price}<span className="text-[11px] font-normal text-slate-400">/t</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                </div>
                <div className="flex gap-1 px-4 pb-3 flex-wrap">
                  {p.cobenefits.map(b => (
                    <span key={b} className="text-[10px] bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/8 px-1.5 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "portfolio" && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Total Offset</p>
              <p className="text-[24px] font-bold text-slate-900 dark:text-white">
                {totalOffset}<span className="text-[14px] font-normal text-slate-400"> t</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">tCO₂e retired</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Total Spend</p>
              <p className="text-[24px] font-bold text-slate-900 dark:text-white">
                ${(totalSpend / 1000).toFixed(1)}k
              </p>
              <p className="text-[11px] text-slate-400">avg ${(totalSpend / totalOffset).toFixed(2)}/t</p>
            </Card>
          </div>

          {/* Holdings */}
          <div className="space-y-2">
            {PORTFOLIO.map((p, i) => (
              <Card key={i} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{p.tonnes} tCO₂e · Vintage {p.vintage}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">${p.cost.toLocaleString()}</p>
                  <Badge variant={p.status === "retired" ? "secondary" : "default"} className="text-[10px] py-0 mt-1">
                    {p.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <button className="w-full py-3 flex items-center justify-center gap-2 text-[14px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800">
            <Plus className="w-4 h-4" /> Buy More Credits
          </button>
        </div>
      )}
    </div>
  );
}
