"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateCompanyBudget, GLOBAL_REMAINING_BUDGETS, SECTOR_BUDGET_SHARES, type TemperatureTarget } from "@/lib/carbon-budget";
import { formatNumber } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const TARGET_LABELS: Record<TemperatureTarget, string> = {
  "1.5C_50pct": "1.5°C (50% probability)",
  "1.5C_67pct": "1.5°C (67% probability)",
  "2C_67pct": "2°C (67% probability)",
};

const INDUSTRIES = Object.keys(SECTOR_BUDGET_SHARES).map((k) => ({
  value: k,
  label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export default function CarbonBudgetPage() {
  const [target, setTarget] = useState<TemperatureTarget>("1.5C_67pct");
  const [industry, setIndustry] = useState("manufacturing");
  const [revenueUSDm, setRevenueUSDm] = useState(150);
  const [sectorRevenueUSDbn, setSectorRevenueUSDbn] = useState(12000);
  const [currentCo2e, setCurrentCo2e] = useState(18000);
  const [netZeroYear, setNetZeroYear] = useState(2050);
  const currentYear = 2025;
  const baselineYear = 2020;

  const budget = calculateCompanyBudget({
    target,
    industryKey: industry,
    revenueUSDm,
    sectorRevenueUSDbn,
    currentCo2e,
    baselineYear,
    currentYear,
    netZeroYear,
  });

  const onTrack = budget.budgetSurplusOrDeficit >= 0;

  // Build emission pathway chart
  const years = Array.from({ length: netZeroYear - currentYear + 1 }, (_, i) => currentYear + i);
  const pathwayData = years.map((yr) => {
    const progress = (yr - currentYear) / (netZeroYear - currentYear);
    const linearEmissions = Math.max(0, currentCo2e * (1 - progress));
    return { year: yr, "Linear path to net-zero": Math.round(linearEmissions) };
  });

  // Budget depletion chart
  let remaining = budget.companyBudgetTCO2e;
  const budgetData = years.map((yr) => {
    const progress = (yr - currentYear) / (netZeroYear - currentYear);
    const annualEmissions = Math.max(0, currentCo2e * (1 - progress));
    remaining = Math.max(0, remaining - annualEmissions);
    return { year: yr, "Remaining Budget": Math.round(remaining) };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Science-Based Carbon Budget</h1>
        <p className="text-sm text-gray-500 mt-1">
          IPCC AR6 remaining carbon budget apportioned to your company via revenue-share of sector allocation
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Temperature Target</label>
            <select className="border border-gray-300 rounded-lg p-2 text-sm" value={target}
              onChange={(e) => setTarget(e.target.value as TemperatureTarget)}>
              {(Object.keys(TARGET_LABELS) as TemperatureTarget[]).map((t) => (
                <option key={t} value={t}>{TARGET_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Industry</label>
            <select className="border border-gray-300 rounded-lg p-2 text-sm" value={industry}
              onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Your Revenue (USD M)</label>
            <input type="number" value={revenueUSDm} onChange={(e) => setRevenueUSDm(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Sector Revenue (USD Bn)</label>
            <input type="number" value={sectorRevenueUSDbn} onChange={(e) => setSectorRevenueUSDbn(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current tCO₂e/yr</label>
            <input type="number" value={currentCo2e} onChange={(e) => setCurrentCo2e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Net-Zero Year</label>
            <input type="number" min={2030} max={2070} value={netZeroYear}
              onChange={(e) => setNetZeroYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Budget verdict */}
      <div className={`p-5 rounded-xl border-2 ${onTrack ? "bg-emerald-50 border-emerald-400" : "bg-red-50 border-red-400"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-lg font-bold ${onTrack ? "text-emerald-800" : "text-red-800"}`}>
              {onTrack ? "Budget surplus — on track" : "Budget deficit — off track"}
            </p>
            <p className={`text-sm mt-1 ${onTrack ? "text-emerald-700" : "text-red-700"}`}>
              {onTrack
                ? `Your linear path to net-zero by ${netZeroYear} leaves ${formatNumber(budget.budgetSurplusOrDeficit, 0)} tCO₂e to spare.`
                : `Your linear path to net-zero by ${netZeroYear} exceeds your budget by ${formatNumber(Math.abs(budget.budgetSurplusOrDeficit), 0)} tCO₂e. Accelerate reductions or bring the net-zero year forward.`}
            </p>
          </div>
          <span className="text-4xl">{onTrack ? "✓" : "✗"}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Global Remaining Budget", value: `${budget.globalRemainingGt} Gt`, sub: `from 2020 (${TARGET_LABELS[target]})` },
          { label: "Your Company Budget", value: `${formatNumber(budget.companyBudgetTCO2e, 0)} t`, sub: "tCO₂e total remaining" },
          { label: "Years at Current Rate", value: budget.yearsAtCurrentRate < 999 ? `${budget.yearsAtCurrentRate} yrs` : "∞", sub: "before budget exhausted" },
          { label: "Required Annual Reduction", value: `${budget.requiredLinearReductionPctPerYear}%/yr`, sub: `linear to net-zero ${netZeroYear}` },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Linear Emission Pathway</CardTitle>
            <CardDescription>tCO₂e/yr — linear reduction to net-zero by {netZeroYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={pathwayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? [`${formatNumber(v, 0)} tCO₂e`, ""] : [v, ""])} />
                <Area type="monotone" dataKey="Linear path to net-zero" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Depletion</CardTitle>
            <CardDescription>Remaining tCO₂e budget as emissions are consumed on linear path</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? [`${formatNumber(v, 0)} tCO₂e`, ""] : [v, ""])} />
                <Area type="monotone" dataKey="Remaining Budget" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-gray-400">
        Sources: IPCC AR6 WGI Table SPM.2 remaining carbon budgets from 2020. Sector budget shares based on
        IEA Energy Technology Perspectives sector decomposition. Company share = revenue / sector global
        revenue (grandfathering approach). This is indicative — consult a climate scientist for formal
        Science Based Target validation.
      </p>
    </div>
  );
}
