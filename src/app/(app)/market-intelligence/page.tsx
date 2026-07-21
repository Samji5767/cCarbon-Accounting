"use client";

import { useState } from "react";
import { TrendingUp, Globe, AlertCircle, Target, Layers, DollarSign, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis } from "recharts";

const MARKET_GROWTH = [
  { year: "2022", size: 12.4 }, { year: "2023", size: 15.8 }, { year: "2024", size: 19.6 },
  { year: "2025", size: 23.2 }, { year: "2026", size: 27.5 }, { year: "2027", size: 33.8 },
  { year: "2028", size: 41.6 }, { year: "2029", size: 51.1 }, { year: "2030", size: 62.8 },
  { year: "2031", size: 77.2 }, { year: "2032", size: 94.9 }, { year: "2033", size: 116.7 },
  { year: "2034", size: 136.0 },
];

const SEGMENT_REVENUE = [
  { segment: "Enterprise SaaS", revenue: 14.2, growth: 31, accounts: 8400 },
  { segment: "Mid-market SaaS", revenue: 7.8, growth: 28, accounts: 34000 },
  { segment: "SME SaaS", revenue: 3.6, growth: 22, accounts: 210000 },
  { segment: "Consumer Apps", revenue: 1.2, growth: 18, accounts: 4200000 },
  { segment: "Marketplace / Credits", revenue: 0.7, growth: 45, accounts: 0 },
];

const REGULATORY_DRIVERS = [
  { regulation: "EU CSRD", obligated: 50000, deadline: "2025–2028", region: "EU", impact: 9 },
  { regulation: "EU CBAM", obligated: 12000, deadline: "2026", region: "EU", impact: 7 },
  { regulation: "UK SECR", obligated: 11000, deadline: "Ongoing", region: "UK", impact: 6 },
  { regulation: "SEC Climate", obligated: 2800, deadline: "2026", region: "US", impact: 8 },
  { regulation: "CA SB-253", obligated: 5300, deadline: "2026–2027", region: "US", impact: 7 },
  { regulation: "MAS ENRM", obligated: 3100, deadline: "2025", region: "APAC", impact: 6 },
  { regulation: "ISSB S2", obligated: 0, deadline: "Voluntary", region: "Global", impact: 5 },
  { regulation: "SBTi Corporate", obligated: 0, deadline: "Voluntary", region: "Global", impact: 8 },
];

const COMPETITOR_RADAR = [
  { dimension: "Scope coverage", cCarbon: 90, watershed: 95, sweep: 85, normative: 75 },
  { dimension: "CSRD depth", cCarbon: 88, watershed: 82, sweep: 90, normative: 55 },
  { dimension: "Mobile", cCarbon: 95, watershed: 20, sweep: 15, normative: 10 },
  { dimension: "Price/value", cCarbon: 92, watershed: 35, sweep: 55, normative: 78 },
  { dimension: "API/integrations", cCarbon: 80, watershed: 90, sweep: 75, normative: 45 },
  { dimension: "UX quality", cCarbon: 88, watershed: 82, sweep: 78, normative: 65 },
];

const CONSUMER_APPS = [
  { name: "Joro", model: "Freemium + offsets", mau: "280k", arpu: "$72/yr", rating: 4.6, gap: "No B2B, US only" },
  { name: "Klima", model: "Subscription $7.99/mo", mau: "190k", arpu: "$96/yr", rating: 4.4, gap: "Consumer only, no CSRD" },
  { name: "Pawprint", model: "B2B employee engagement", mau: "45k", arpu: "$18/employee/yr", rating: 4.3, gap: "Engagement only, no reporting" },
  { name: "Capture", model: "Freemium + credits", mau: "320k", arpu: "$54/yr", rating: 4.2, gap: "No regulatory compliance" },
  { name: "Cogo", model: "Bank white-label", mau: "1.2M", arpu: "$8/yr", rating: 3.9, gap: "No enterprise module" },
];

const MONETISATION_MODELS = [
  {
    model: "SaaS Subscription",
    share: 68,
    description: "Recurring monthly/annual licence per seat or entity. Dominant model for B2B platforms.",
    arpu: "$6k–200k/yr",
    examples: "Watershed, Persefoni, Sweep",
    cCarbon: true,
  },
  {
    model: "Credit Marketplace",
    share: 12,
    description: "2–5% transaction fee on carbon credit purchases and retirements. High-margin, scalable.",
    arpu: "2–5% GMV",
    examples: "South Pole, Xpansiv",
    cCarbon: true,
  },
  {
    model: "Professional Services",
    share: 11,
    description: "Audit support, verification, CBAM filing, custom integrations at £800–£3k per engagement.",
    arpu: "$2k–15k/engagement",
    examples: "EY, PwC, Normative",
    cCarbon: true,
  },
  {
    model: "Consumer Freemium",
    share: 6,
    description: "Free footprint tracker with premium offset subscription. Large funnel, low ARPU.",
    arpu: "$54–96/yr",
    examples: "Joro, Klima, Capture",
    cCarbon: false,
  },
  {
    model: "API / Data Licensing",
    share: 3,
    description: "Emission factor database, credit registry data sold to third-party developers.",
    arpu: "$12k–80k/yr",
    examples: "Climatiq, Ecoinvent",
    cCarbon: false,
  },
];

const ICP_SEGMENTS = [
  { segment: "Listed EU corporates", size: 8400, urgency: "Critical", driver: "CSRD mandatory 2025", acv: "£48k+", color: "red" },
  { segment: "EU SMEs (CSRD wave 3)", size: 33600, urgency: "High", driver: "CSRD mandatory 2028", acv: "£5.7k", color: "orange" },
  { segment: "UK SECR reporters", size: 11000, urgency: "High", driver: "Annual filing", acv: "£5.7k", color: "orange" },
  { segment: "CBAM importers", size: 12000, urgency: "High", driver: "Certificates from 2026", acv: "£8k+", color: "orange" },
  { segment: "SBTi commitments", size: 9400, urgency: "Medium", driver: "Science-based targets", acv: "£12k", color: "yellow" },
  { segment: "CDP responders", size: 23000, urgency: "Medium", driver: "Investor pressure", acv: "£5.7k", color: "yellow" },
];

export default function MarketIntelligencePage() {
  const [activeSection, setActiveSection] = useState<"market" | "competitors" | "monetisation" | "icp">("market");

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">Carbon accounting app market · $27.5B (2026) · 22–26% CAGR · $136B by 2034</p>
        </div>
        <Badge variant="secondary" className="text-xs">Source: App Store Revenue Report · July 2026</Badge>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TAM 2026", value: "$27.5B", delta: "+23% YoY", icon: Globe },
          { label: "CAGR to 2034", value: "22–26%", delta: "Fastest-growing SaaS vertical", icon: TrendingUp },
          { label: "TAM 2034", value: "$136B", delta: "5× current market", icon: DollarSign },
          { label: "CSRD-obligated corps", value: "50,000+", delta: "EU alone by 2028", icon: Users },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-gray-500">{k.label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                <p className="text-xs text-emerald-600 mt-0.5">{k.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "market", label: "Market Sizing" },
          { id: "competitors", label: "Competitor Analysis" },
          { id: "monetisation", label: "Monetisation Models" },
          { id: "icp", label: "Target Segments" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id as typeof activeSection)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === t.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MARKET SIZING */}
      {activeSection === "market" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global Carbon Accounting Software Market ($B)</CardTitle>
              <CardDescription>2022 actuals → 2034 projection at 24% CAGR midpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MARKET_GROWTH}>
                  <defs>
                    <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}B`} />
                  <Tooltip formatter={(v) => `$${v}B`} />
                  <Area type="monotone" dataKey="size" stroke="#059669" strokeWidth={2} fill="url(#mktGrad)" name="Market size" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2026 Revenue by Segment ($B)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={SEGMENT_REVENUE} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}B`} />
                    <YAxis dataKey="segment" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip formatter={(v) => `$${v}B`} />
                    <Bar dataKey="revenue" fill="#059669" radius={[0, 4, 4, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regulatory Demand Drivers</CardTitle>
                <CardDescription>Obligated entities by regulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {REGULATORY_DRIVERS.map((r) => (
                    <div key={r.regulation} className="flex items-center gap-3">
                      <div className="w-24 shrink-0">
                        <p className="text-xs font-medium text-gray-700">{r.regulation}</p>
                        <p className="text-[10px] text-gray-400">{r.region} · {r.deadline}</p>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min((r.obligated / 50000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-16 text-right">
                        {r.obligated > 0 ? `${(r.obligated / 1000).toFixed(0)}k corps` : "Voluntary"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* COMPETITORS */}
      {activeSection === "competitors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Capability Radar</CardTitle>
                <CardDescription>cCarbon vs top competitors across 6 dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={COMPETITOR_RADAR}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar name="cCarbon" dataKey="cCarbon" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Watershed" dataKey="watershed" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={1.5} />
                    <Radar name="Sweep" dataKey="sweep" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-2">
                  {[{ name: "cCarbon", color: "#059669" }, { name: "Watershed", color: "#6366f1" }, { name: "Sweep", color: "#f59e0b" }].map((l) => (
                    <div key={l.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      {l.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consumer App Landscape</CardTitle>
                <CardDescription>Top carbon footprint apps — gaps inform B2C opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CONSUMER_APPS.map((a) => (
                    <div key={a.name} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-gray-800">{a.name}</p>
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          ★ {a.rating}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div><p className="text-gray-400">Model</p><p className="text-gray-700 leading-tight">{a.model}</p></div>
                        <div><p className="text-gray-400">MAU</p><p className="text-gray-700">{a.mau}</p></div>
                        <div><p className="text-gray-400">ARPU</p><p className="text-gray-700">{a.arpu}</p></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-700">{a.gap}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MONETISATION */}
      {activeSection === "monetisation" && (
        <div className="space-y-4">
          {MONETISATION_MODELS.map((m) => (
            <Card key={m.model} className={m.cCarbon ? "border-l-4 border-l-emerald-400" : "opacity-70"}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-800">{m.model}</p>
                      {m.cCarbon && <Badge variant="secondary" className="text-[10px]">cCarbon active</Badge>}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{m.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-gray-500">ARPU: <b className="text-gray-700">{m.arpu}</b></span>
                      <span className="text-gray-500">Examples: <b className="text-gray-700">{m.examples}</b></span>
                    </div>
                  </div>
                  <div className="ml-6 text-right shrink-0">
                    <p className="text-2xl font-bold text-emerald-700">{m.share}%</p>
                    <p className="text-xs text-gray-400">market share</p>
                    <div className="w-24 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.share}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ICP SEGMENTS */}
      {activeSection === "icp" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ICP_SEGMENTS.map((s) => {
              const urgencyColor = s.urgency === "Critical" ? "red" : s.urgency === "High" ? "orange" : "yellow";
              return (
                <Card key={s.segment} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{s.segment}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.driver}</p>
                      </div>
                      <Badge
                        variant={s.urgency === "Critical" ? "destructive" : "warning"}
                        className="text-[10px] shrink-0"
                      >
                        {s.urgency}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400">Addressable accounts</p>
                        <p className="font-semibold text-gray-800 text-lg">{s.size.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Target ACV</p>
                        <p className="font-semibold text-emerald-700 text-lg">{s.acv}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Segment ARR potential</span>
                        <span className="font-semibold text-gray-800">
                          {s.acv.includes("+") ? "£400M+" : `£${((s.size * parseInt(s.acv.replace(/[^0-9.]/g, "")) / 1000)).toFixed(0)}M`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
