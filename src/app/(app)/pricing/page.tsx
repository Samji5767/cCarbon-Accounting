"use client";

import { useState } from "react";
import { Check, X, Zap, Building2, Globe, ArrowRight, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const MARKET_DATA = {
  marketSize2026: 27.5,
  cagr: 24,
  projected2034: 136,
};

const ARR_PROJECTION = [
  { year: "2026", starter: 180, professional: 620, enterprise: 1200, total: 2000 },
  { year: "2027", starter: 290, professional: 1100, enterprise: 2800, total: 4190 },
  { year: "2028", starter: 420, professional: 1900, enterprise: 5200, total: 7520 },
  { year: "2029", starter: 580, professional: 3100, enterprise: 9400, total: 13080 },
  { year: "2030", starter: 750, professional: 4800, enterprise: 16200, total: 21750 },
];

const REVENUE_MIX = [
  { name: "Enterprise SaaS", value: 58, color: "#059669" },
  { name: "Professional", value: 28, color: "#10b981" },
  { name: "Starter", value: 8, color: "#6ee7b7" },
  { name: "Marketplace", value: 6, color: "#a7f3d0" },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: { monthly: 149, annual: 119 },
    description: "For SMEs beginning their GHG reporting journey",
    target: "10–250 employees",
    highlight: false,
    color: "gray",
    features: [
      { label: "Scope 1 & 2 tracking", included: true },
      { label: "GHG Protocol reporting", included: true },
      { label: "3 facilities", included: true },
      { label: "Basic emission factors (DEFRA/EPA)", included: true },
      { label: "CSV data import", included: true },
      { label: "PDF report export", included: true },
      { label: "Scope 3 (15 categories)", included: false },
      { label: "CSRD / ESRS disclosure", included: false },
      { label: "API access", included: false },
      { label: "Audit trail & verification", included: false },
      { label: "Regulatory navigator", included: false },
      { label: "Dedicated CSM", included: false },
    ],
    cta: "Start free trial",
    note: "14-day free trial, no card required",
  },
  {
    id: "professional",
    name: "Professional",
    icon: Building2,
    price: { monthly: 599, annual: 479 },
    description: "For mid-market companies with regulatory obligations",
    target: "250–2,500 employees",
    highlight: true,
    color: "emerald",
    features: [
      { label: "Scope 1, 2 & 3 (all 15 categories)", included: true },
      { label: "CSRD / ESRS E1 disclosure pack", included: true },
      { label: "Unlimited facilities", included: true },
      { label: "CBAM calculator", included: true },
      { label: "CDP questionnaire templates", included: true },
      { label: "SBTi target setting & tracking", included: true },
      { label: "Audit trail & verification workflow", included: true },
      { label: "Regulatory navigator (8 frameworks)", included: true },
      { label: "REST API access (10k calls/mo)", included: true },
      { label: "Climate risk register (TCFD)", included: true },
      { label: "Executive reporting packs", included: true },
      { label: "Dedicated CSM", included: false },
    ],
    cta: "Start free trial",
    note: "14-day free trial · Most popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Globe,
    price: { monthly: null, annual: null },
    description: "For large corporates with group-level consolidation needs",
    target: "2,500+ employees",
    highlight: false,
    color: "gray",
    features: [
      { label: "Everything in Professional", included: true },
      { label: "Multi-entity consolidation", included: true },
      { label: "Supply chain decarbonisation", included: true },
      { label: "LCA / Product Carbon Footprint", included: true },
      { label: "Nature & biodiversity risk (TNFD)", included: true },
      { label: "Internal carbon pricing module", included: true },
      { label: "Unlimited API access + webhooks", included: true },
      { label: "SSO / SAML + SCIM provisioning", included: true },
      { label: "Custom emission factor libraries", included: true },
      { label: "White-label reporting", included: true },
      { label: "SLA 99.9% uptime guarantee", included: true },
      { label: "Dedicated CSM + onboarding team", included: true },
    ],
    cta: "Talk to sales",
    note: "Custom pricing · Annual contract",
  },
];

const ADDONS = [
  { name: "Carbon Credit Marketplace", price: "2% transaction fee", description: "Buy, retire and track VCS/Gold Standard credits" },
  { name: "Verification & Assurance", price: "£2,500 / audit", description: "Third-party limited assurance on GHG inventory" },
  { name: "CBAM Filing Service", price: "£800 / quarter", description: "Managed EU CBAM quarterly declaration submission" },
  { name: "API Overage", price: "£0.008 / call", description: "Beyond plan limit, billed monthly in arrears" },
  { name: "Custom Integrations", price: "From £3,000", description: "ERP, energy management, IoT sensor connectors" },
  { name: "Training & Certification", price: "£450 / seat", description: "GHG Protocol practitioner certification programme" },
];

const COMPETITORS = [
  { name: "Watershed", segment: "Enterprise", price: "$50k–200k/yr", scope3: true, csrd: true, mobile: false, api: true },
  { name: "Persefoni", segment: "Enterprise", price: "$40k–150k/yr", scope3: true, csrd: true, mobile: false, api: true },
  { name: "Sweep", segment: "Mid-market", price: "$18k–60k/yr", scope3: true, csrd: true, mobile: false, api: true },
  { name: "Normative", segment: "SME", price: "$6k–24k/yr", scope3: true, csrd: false, mobile: false, api: false },
  { name: "Greenly", segment: "SME", price: "$3k–15k/yr", scope3: true, csrd: false, mobile: false, api: false },
  { name: "cCarbon", segment: "SME→Enterprise", price: "$1.8k–Custom", scope3: true, csrd: true, mobile: true, api: true },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [activeTab, setActiveTab] = useState<"pricing" | "market" | "compare">("pricing");

  return (
    <div className="p-4 md:p-6 space-y-8 pb-24 md:pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">Market size $27.5B · 24% CAGR · $136B by 2034</Badge>
        <h1 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          Built for the carbon accounting market. From first GHG inventory to full CSRD compliance.
        </p>
      </div>

      {/* Tab nav — iOS segmented control */}
      <div className="flex justify-center">
        <SegmentedControl
          options={[
            { value: "pricing", label: "Plans" },
            { value: "market", label: "Revenue" },
            { value: "compare", label: "Compare" },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as typeof activeTab)}
        />
      </div>

      {/* PRICING TAB */}
      {activeTab === "pricing" && (
        <div className="space-y-8">
          {/* Billing toggle — iOS segmented control */}
          <div className="flex justify-center items-center gap-3">
            <SegmentedControl
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
              value={billing}
              onChange={(v) => setBilling(v as typeof billing)}
            />
            {billing === "annual" && (
              <Badge variant="secondary" className="text-[10px]">Save 20%</Badge>
            )}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const price = billing === "annual" ? plan.price.annual : plan.price.monthly;
              return (
                <Card key={plan.id} className={`relative ${plan.highlight ? "border-emerald-400 shadow-lg shadow-emerald-100" : ""}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-emerald-600 text-white text-xs px-3">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${plan.highlight ? "bg-emerald-100" : "bg-gray-100"}`}>
                        <Icon className={`w-4 h-4 ${plan.highlight ? "text-emerald-600" : "text-gray-600"}`} />
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                    <Badge variant="outline" className="w-fit text-[10px]">{plan.target}</Badge>
                    <div className="mt-3">
                      {price ? (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">£{price}</span>
                          <span className="text-gray-400 text-sm">/month</span>
                          {billing === "annual" && <p className="text-xs text-emerald-600 mt-0.5">Billed £{price * 12}/year</p>}
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-gray-900">Custom</span>
                          <p className="text-xs text-gray-500 mt-0.5">Contact sales for quote</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className={`w-full ${plan.highlight ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                      size="sm"
                    >
                      {plan.cta} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center">{plan.note}</p>
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {f.included ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                          )}
                          <span className={`text-xs ${f.included ? "text-gray-700" : "text-gray-400"}`}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add-ons */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add-ons & Professional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ADDONS.map((a) => (
                <Card key={a.name} className="hover:border-emerald-200 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm text-gray-800">{a.name}</p>
                      <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{a.price}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MARKET / REVENUE MODEL TAB */}
      {activeTab === "market" && (
        <div className="space-y-6">
          {/* Market KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "TAM 2026", value: "$27.5B", icon: Globe, sub: "Carbon accounting software" },
              { label: "CAGR", value: "22–26%", icon: TrendingUp, sub: "To 2032–2034" },
              { label: "TAM 2034", value: "$136B", icon: DollarSign, sub: "Projected market size" },
              { label: "Target accounts", value: "42,000", icon: Users, sub: "UK+EU CSRD-obligated corps" },
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
                    <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ARR projection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ARR Projection by Tier (£k)</CardTitle>
              <CardDescription>2026–2030 based on 24% market CAGR with bottom-up cohort modelling</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ARR_PROJECTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `£${v}k`} />
                  <Tooltip formatter={(v) => `£${Number(v).toLocaleString()}k`} />
                  <Bar dataKey="starter" stackId="a" fill="#a7f3d0" name="Starter" radius={[0,0,0,0]} />
                  <Bar dataKey="professional" stackId="a" fill="#10b981" name="Professional" />
                  <Bar dataKey="enterprise" stackId="a" fill="#059669" name="Enterprise" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue mix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Steady-State Revenue Mix</CardTitle>
                <CardDescription>Target blended at scale (2028+)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={REVENUE_MIX} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {REVENUE_MIX.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {REVENUE_MIX.map((r) => (
                    <div key={r.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                      <span className="text-gray-600">{r.name}</span>
                      <span className="font-semibold ml-auto">{r.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unit economics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Unit Economics</CardTitle>
                <CardDescription>Per-tier benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tier: "Starter", acv: "£1,428", cac: "£380", ltv: "£4,284", payback: "3.2 mo", margin: "78%" },
                    { tier: "Professional", acv: "£5,748", cac: "£1,900", ltv: "£23,000", payback: "4.0 mo", margin: "82%" },
                    { tier: "Enterprise", acv: "£48,000+", cac: "£14,000", ltv: "£192,000+", payback: "3.5 mo", margin: "74%" },
                  ].map((u) => (
                    <div key={u.tier} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-800 mb-2">{u.tier}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><p className="text-gray-400">ACV</p><p className="font-medium">{u.acv}</p></div>
                        <div><p className="text-gray-400">CAC</p><p className="font-medium">{u.cac}</p></div>
                        <div><p className="text-gray-400">LTV</p><p className="font-medium">{u.ltv}</p></div>
                        <div><p className="text-gray-400">Payback</p><p className="font-medium">{u.payback}</p></div>
                        <div><p className="text-gray-400">Gross margin</p><p className="font-medium text-emerald-600">{u.margin}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* COMPETITOR COMPARISON TAB */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competitive Landscape — Feature & Price Matrix</CardTitle>
              <CardDescription>Carbon accounting platforms: B2B SaaS segment, 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Platform</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Segment</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Pricing</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Scope 3</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">CSRD</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Mobile</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPETITORS.map((c) => (
                      <tr key={c.name} className={`border-b border-gray-50 ${c.name === "cCarbon" ? "bg-emerald-50" : ""}`}>
                        <td className="py-2.5 px-3 font-medium text-gray-800 flex items-center gap-2">
                          {c.name === "cCarbon" && <Star className="w-3 h-3 text-emerald-500" />}
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3"><Badge variant="outline" className="text-[10px]">{c.segment}</Badge></td>
                        <td className="py-2.5 px-3 text-gray-600 text-xs">{c.price}</td>
                        <td className="py-2.5 px-3 text-center">{c.scope3 ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{c.csrd ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{c.mobile ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{c.api ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Gap 1 — Mobile-first",
                color: "emerald",
                description: "No enterprise carbon accounting platform has a native iPhone app. cCarbon is first-to-market with Capacitor iOS — a defensible moat with field teams and sustainability managers on the go.",
                badge: "Our advantage",
              },
              {
                title: "Gap 2 — CSRD at SME price",
                color: "blue",
                description: "CSRD compliance tools cost £18k–60k/yr from Sweep/Watershed — priced out of the 42,000 EU-obligated SMEs. cCarbon Professional at £5,748/yr is 70% cheaper with equivalent disclosure coverage.",
                badge: "Price gap",
              },
              {
                title: "Gap 3 — Integrated marketplace",
                color: "purple",
                description: "Competitors treat offset purchases as external links. cCarbon embeds a carbon credit exchange with retirement workflow and registry verification — capturing 2% transaction fees in-platform.",
                badge: "Revenue unlock",
              },
            ].map((g) => (
              <Card key={g.title} className="border-l-4 border-l-emerald-400">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-sm text-gray-800">{g.title}</p>
                    <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{g.badge}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{g.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
