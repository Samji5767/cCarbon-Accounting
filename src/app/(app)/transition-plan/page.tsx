"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, Target, Zap, Factory, Truck, Leaf, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, Legend } from "recharts";

// ISSB IFRS S2 / ESRS E1 Transition Plan structure
// Based on TCFD Guidance on Transition Plans (2021) + TPT Disclosure Framework (2023)

type PillarKey = "ambition" | "actions" | "financial" | "governance" | "engagement";
type ActionStatus = "completed" | "in_progress" | "planned" | "at_risk";

interface TransitionAction {
  id: string;
  pillar: PillarKey;
  action: string;
  owner: string;
  deadline: string;
  status: ActionStatus;
  capexUSDm: number;
  co2eReductionTco2e: number;
  abatementCostUSD?: number; // $/tCO2e
  dependency?: string;
}

const ACTIONS: TransitionAction[] = [
  { id: "a1", pillar: "actions", action: "Replace natural gas boilers with heat pumps — Site A (TX)", owner: "Head of Operations", deadline: "2026-Q2", status: "in_progress", capexUSDm: 4.2, co2eReductionTco2e: 1800, abatementCostUSD: 47 },
  { id: "a2", pillar: "actions", action: "Install 3.5 MW on-site solar PV — Site A", owner: "Head of Operations", deadline: "2025-Q4", status: "completed", capexUSDm: 3.1, co2eReductionTco2e: 1200, abatementCostUSD: 52 },
  { id: "a3", pillar: "actions", action: "Sign 10-year renewable electricity PPA (100% UK)", owner: "CFO", deadline: "2025-Q2", status: "completed", capexUSDm: 0.1, co2eReductionTco2e: 310, abatementCostUSD: 6 },
  { id: "a4", pillar: "actions", action: "Electrify 60% of light-duty fleet (EV transition)", owner: "Logistics Director", deadline: "2027-Q4", status: "in_progress", capexUSDm: 2.8, co2eReductionTco2e: 680, abatementCostUSD: 82, dependency: "EV charging infrastructure (a5)" },
  { id: "a5", pillar: "actions", action: "Deploy EV charging infrastructure at 4 sites", owner: "Head of Operations", deadline: "2026-Q4", status: "planned", capexUSDm: 1.2, co2eReductionTco2e: 0, abatementCostUSD: undefined },
  { id: "a6", pillar: "actions", action: "Supplier SBTi engagement — top 20 by tCO₂e", owner: "Procurement Director", deadline: "2026-Q4", status: "in_progress", capexUSDm: 0.3, co2eReductionTco2e: 4200, abatementCostUSD: 1 },
  { id: "a7", pillar: "actions", action: "Product redesign — energy-use reduction in product line A", owner: "VP R&D", deadline: "2028-Q2", status: "planned", capexUSDm: 6.5, co2eReductionTco2e: 2900, abatementCostUSD: 45 },
  { id: "a8", pillar: "actions", action: "Waste heat recovery — Site B (DE)", owner: "Head of Operations", deadline: "2027-Q2", status: "at_risk", capexUSDm: 1.8, co2eReductionTco2e: 420, abatementCostUSD: 86, dependency: "Regulatory approval pending" },
  { id: "a9", pillar: "financial", action: "Embed ICP ($85/t, +5%/yr) into all capex appraisals", owner: "CFO", deadline: "2025-Q1", status: "completed", capexUSDm: 0, co2eReductionTco2e: 0 },
  { id: "a10", pillar: "financial", action: "Green bond issuance ($50M) for decarbonisation capex", owner: "CFO / Treasury", deadline: "2026-Q1", status: "planned", capexUSDm: 0, co2eReductionTco2e: 0 },
  { id: "a11", pillar: "governance", action: "Link executive remuneration to Scope 1+2 reduction target", owner: "Board Remuneration Ctte", deadline: "2025-Q3", status: "completed", capexUSDm: 0, co2eReductionTco2e: 0 },
  { id: "a12", pillar: "governance", action: "Annual Board climate review (TCFD / ESRS E1 oversight)", owner: "Board", deadline: "2025-Q4", status: "in_progress", capexUSDm: 0, co2eReductionTco2e: 0 },
  { id: "a13", pillar: "engagement", action: "CDP Supply Chain disclosure — invite 30 key suppliers", owner: "Procurement Director", deadline: "2025-Q3", status: "in_progress", capexUSDm: 0.1, co2eReductionTco2e: 0 },
];

const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string; icon: React.ElementType }> = {
  completed:   { label: "Completed",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700",      icon: Clock },
  planned:     { label: "Planned",     color: "bg-gray-100 text-gray-600",       icon: Target },
  at_risk:     { label: "At Risk",     color: "bg-red-100 text-red-600",         icon: AlertTriangle },
};

const PILLAR_CONFIG: Record<PillarKey, { label: string; color: string; icon: React.ElementType }> = {
  ambition:   { label: "Ambition & Targets",  color: "text-emerald-700", icon: Target },
  actions:    { label: "Decarbonisation Actions", color: "text-blue-700",    icon: Factory },
  financial:  { label: "Financial Planning",  color: "text-purple-700",   icon: DollarSign },
  governance: { label: "Governance",          color: "text-gray-700",     icon: CheckCircle },
  engagement: { label: "Stakeholder Engagement", color: "text-orange-700", icon: Truck },
};

// Emission reduction pathway — stacked bar 2024-2030
const PATHWAY_DATA = [
  { year: "2024", baseline: 8410, solar: 0, ppa: 310, heatPump: 0, fleet: 0, supplier: 0, product: 0, residual: 8100 },
  { year: "2025", baseline: 8410, solar: 1200, ppa: 620, heatPump: 0, fleet: 200, supplier: 0, product: 0, residual: 6390 },
  { year: "2026", baseline: 8410, solar: 1200, ppa: 620, heatPump: 1800, fleet: 400, supplier: 1500, product: 0, residual: 4890 },
  { year: "2027", baseline: 8410, solar: 1200, ppa: 620, heatPump: 1800, fleet: 680, supplier: 2800, product: 0, residual: 3310 },
  { year: "2028", baseline: 8410, solar: 1200, ppa: 620, heatPump: 1800, fleet: 680, supplier: 3500, product: 1200, residual: 1410 },
  { year: "2029", baseline: 8410, solar: 1200, ppa: 620, heatPump: 1800, fleet: 680, supplier: 4000, product: 2000, residual: 1110 },
  { year: "2030", baseline: 8410, solar: 1200, ppa: 620, heatPump: 1800, fleet: 680, supplier: 4200, product: 2900, residual: 0 },
];

const TARGET_2030 = 8410 * 0.58; // 42% reduction = SBTi near-term

export default function TransitionPlanPage() {
  const [activePillar, setActivePillar] = useState<PillarKey | "all">("all");

  const filteredActions = activePillar === "all" ? ACTIONS : ACTIONS.filter(a => a.pillar === activePillar);

  const capexActions = ACTIONS.filter(a => a.capexUSDm > 0);
  const totalCapex = capexActions.reduce((s, a) => s + a.capexUSDm, 0);
  const totalReduction = ACTIONS.reduce((s, a) => s + a.co2eReductionTco2e, 0);
  const completedCount = ACTIONS.filter(a => a.status === "completed").length;
  const atRiskCount = ACTIONS.filter(a => a.status === "at_risk").length;

  // MAC curve data (sorted by abatement cost)
  const macActions = ACTIONS.filter(a => a.abatementCostUSD !== undefined && a.co2eReductionTco2e > 0)
    .sort((a, b) => (a.abatementCostUSD ?? 0) - (b.abatementCostUSD ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Climate Transition Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          IFRS S2 / ESRS E1 / TPT Disclosure Framework — decarbonisation roadmap 2024–2030
        </p>
      </div>

      {/* Progress banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Actions Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{completedCount}/{ACTIONS.length}</p>
          <p className="text-xs text-gray-400">transition actions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Total Capex Planned</p>
          <p className="text-2xl font-bold text-gray-900">${formatNumber(totalCapex, 1)}M</p>
          <p className="text-xs text-gray-400">USD decarbonisation investment</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">Emission Reduction (2030)</p>
          <p className="text-2xl font-bold text-blue-600">{formatNumber(totalReduction, 0)} t</p>
          <p className="text-xs text-gray-400">tCO₂e vs 2020 baseline</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-gray-500">At-Risk Actions</p>
          <p className={`text-2xl font-bold ${atRiskCount > 0 ? "text-red-500" : "text-emerald-600"}`}>{atRiskCount}</p>
          <p className="text-xs text-gray-400">require escalation</p>
        </CardContent></Card>
      </div>

      {/* Pathway chart */}
      <Card>
        <CardHeader>
          <CardTitle>Decarbonisation Pathway — Scope 1 + 2 (tCO₂e)</CardTitle>
          <CardDescription>Stacked contribution of each initiative vs 2024 baseline; SBTi near-term target: −42% by 2030</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={PATHWAY_DATA} stackOffset="none">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v, name) => [typeof v === "number" ? `${formatNumber(v, 0)} tCO₂e` : v, name]} />
              <Legend />
              <ReferenceLine y={TARGET_2030} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "SBTi 2030 target", position: "insideTopRight", fontSize: 11, fill: "#ef4444" }} />
              <Bar dataKey="residual" name="Residual emissions" stackId="a" fill="#94a3b8" />
              <Bar dataKey="supplier" name="Supplier engagement" stackId="a" fill="#f59e0b" />
              <Bar dataKey="product" name="Product redesign" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="fleet" name="Fleet electrification" stackId="a" fill="#3b82f6" />
              <Bar dataKey="heatPump" name="Heat pump conversion" stackId="a" fill="#10b981" />
              <Bar dataKey="ppa" name="Renewable PPA" stackId="a" fill="#34d399" />
              <Bar dataKey="solar" name="On-site solar" stackId="a" fill="#6ee7b7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MAC curve */}
      <Card>
        <CardHeader>
          <CardTitle>Marginal Abatement Cost Curve</CardTitle>
          <CardDescription>$/tCO₂e abatement cost per initiative — sorted lowest to highest cost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-40 min-w-[600px] relative">
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-300 z-0" style={{ top: "calc(85 / 100 * 100%)" }}>
                <span className="text-[10px] text-gray-400 ml-1 bg-white px-0.5">$85 ICP</span>
              </div>
              {macActions.map((a, i) => {
                const cost = a.abatementCostUSD ?? 0;
                const heightPct = Math.min(100, (cost / 100) * 100);
                const width = Math.max(40, (a.co2eReductionTco2e / 5000) * 80);
                const isAboveICP = cost > 85;
                return (
                  <div key={a.id} className="flex flex-col items-center shrink-0 relative z-10" style={{ width }}>
                    <div
                      className={`w-full rounded-t-md ${isAboveICP ? "bg-red-400" : "bg-emerald-500"}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${a.action}: $${cost}/tCO₂e, ${formatNumber(a.co2eReductionTco2e, 0)} tCO₂e`}
                    />
                    <p className="text-[10px] text-gray-600 text-center mt-1 leading-tight">${cost}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Below ICP ($85)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400" /> Above ICP (still fundable)</div>
              <span className="ml-2 text-gray-400">Bar width ∝ tCO₂e reduction volume</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillar filter + action table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Transition Actions</CardTitle>
              <CardDescription>Filter by TPT pillar. Click row to expand.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setActivePillar("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activePillar === "all" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                All
              </button>
              {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(p => (
                <button key={p} onClick={() => setActivePillar(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activePillar === p ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {PILLAR_CONFIG[p].label.split(" ")[0]}
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
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                  <th className="text-left py-2 px-3 font-medium">Owner</th>
                  <th className="text-left py-2 px-3 font-medium">Deadline</th>
                  <th className="text-right py-2 px-3 font-medium">Capex ($M)</th>
                  <th className="text-right py-2 px-3 font-medium">Reduction (t)</th>
                  <th className="text-right py-2 px-3 font-medium">$/tCO₂e</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map(a => {
                  const sc = STATUS_CONFIG[a.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-xs">
                        <p className="font-medium text-gray-800">{a.action}</p>
                        {a.dependency && <p className="text-gray-400 mt-0.5">Depends on: {a.dependency}</p>}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">{a.owner}</td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-600">{a.deadline}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{a.capexUSDm > 0 ? `$${a.capexUSDm}` : "—"}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{a.co2eReductionTco2e > 0 ? formatNumber(a.co2eReductionTco2e, 0) : "—"}</td>
                      <td className="py-2 px-3 text-right text-xs">{a.abatementCostUSD !== undefined ? `$${a.abatementCostUSD}` : "—"}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" /> {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300 bg-gray-50 text-xs font-semibold">
                  <td className="py-2 px-3 text-gray-700" colSpan={3}>Total (all actions)</td>
                  <td className="py-2 px-3 text-right font-mono">${formatNumber(totalCapex, 1)}M</td>
                  <td className="py-2 px-3 text-right font-mono">{formatNumber(totalReduction, 0)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Structure follows the Transition Plan Taskforce (TPT) Disclosure Framework (2023) and IFRS S2 Climate-related Disclosures §22-24. Financial figures are management estimates; capex subject to Board approval. Marginal abatement cost = total capex / (tCO₂e reduction × asset life). ICP benchmark: $85/tCO₂e (2024), escalating at 5%/year.
      </p>
    </div>
  );
}
