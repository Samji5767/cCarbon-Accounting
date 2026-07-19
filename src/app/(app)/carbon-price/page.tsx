"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateICP, CARBON_PRICE_BENCHMARKS, type ICPConfig, type ICPMechanism } from "@/lib/internal-carbon-price";
import { formatNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEFAULT_CONFIG: ICPConfig = {
  mechanism: "shadow_price",
  pricePerTonneCO2e: 50,
  currency: "USD",
  effectiveYear: 2024,
  escalationRatePct: 5,
  applyToScopes: [1, 2, 3],
};

const DEMO_EMISSIONS = { scope1: 4200, scope2: 1800, scope3: 12000 };

const MECHANISM_LABELS: Record<ICPMechanism, string> = {
  shadow_price: "Shadow Price — internal decision-making only",
  internal_fee: "Internal Fee — real fund transfer between BUs",
  implicit_price: "Implicit Price — derived from existing investments",
};

export default function CarbonPricePage() {
  const [config, setConfig] = useState<ICPConfig>(DEFAULT_CONFIG);
  const currentYear = 2024;

  const result = calculateICP(DEMO_EMISSIONS, config, currentYear);

  const projectionData = Array.from({ length: 7 }, (_, i) => {
    const year = 2024 + i;
    const r = calculateICP(DEMO_EMISSIONS, config, year);
    return {
      year,
      "Scope 1": Math.round(r.scope1Cost),
      "Scope 2": Math.round(r.scope2Cost),
      "Scope 3": Math.round(r.scope3Cost),
      priceUsed: Math.round(r.priceUsed),
    };
  });

  const benchmarks = Object.entries(CARBON_PRICE_BENCHMARKS).map(([key, price]) => ({
    key,
    price,
    label: key.replace(/_/g, " "),
    isCurrent: Math.abs(price - config.pricePerTonneCO2e) < 5,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Internal Carbon Pricing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure shadow price or internal fee mechanism to embed carbon costs in decision-making
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ICP Configuration</CardTitle>
            <CardDescription>Set your internal carbon price parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mechanism</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={config.mechanism}
                onChange={(e) => setConfig({ ...config, mechanism: e.target.value as ICPMechanism })}
              >
                {(Object.keys(MECHANISM_LABELS) as ICPMechanism[]).map((m) => (
                  <option key={m} value={m}>{m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">{MECHANISM_LABELS[config.mechanism]}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Price (USD / tCO₂e)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={config.pricePerTonneCO2e}
                onChange={(e) => setConfig({ ...config, pricePerTonneCO2e: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Annual Escalation (%)
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={config.escalationRatePct}
                onChange={(e) => setConfig({ ...config, escalationRatePct: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Apply to Scopes</label>
              <div className="flex gap-3">
                {([1, 2, 3] as const).map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.applyToScopes.includes(s)}
                      onChange={(e) => {
                        const scopes = e.target.checked
                          ? [...config.applyToScopes, s].sort()
                          : config.applyToScopes.filter((x) => x !== s);
                        setConfig({ ...config, applyToScopes: scopes as (1 | 2 | 3)[] });
                      }}
                    />
                    Scope {s}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Carbon Cost", value: `$${formatNumber(result.totalCost, 0)}`, sub: "USD / year" },
              { label: "Carbon Price Used", value: `$${formatNumber(result.priceUsed, 0)}`, sub: "per tCO₂e" },
              { label: "Scope 1 Exposure", value: `$${formatNumber(result.scope1Cost, 0)}`, sub: `${formatNumber(DEMO_EMISSIONS.scope1)} tCO₂e` },
              { label: "Scope 2 Exposure", value: `$${formatNumber(result.scope2Cost, 0)}`, sub: `${formatNumber(DEMO_EMISSIONS.scope2)} tCO₂e` },
            ].map(({ label, value, sub }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 7-year projection chart */}
          <Card>
            <CardHeader>
              <CardTitle>7-Year Carbon Cost Projection</CardTitle>
              <CardDescription>
                At {config.escalationRatePct}% annual escalation from ${config.pricePerTonneCO2e}/tCO₂e
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => (typeof v === "number" ? [`$${formatNumber(v, 0)}`, ""] : [v, ""])} />
                  <Legend />
                  <Bar dataKey="Scope 1" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Scope 2" stackId="a" fill="#f97316" />
                  <Bar dataKey="Scope 3" stackId="a" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Market benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Market Price Benchmarks</CardTitle>
          <CardDescription>Compare your ICP against regulatory and voluntary market reference prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {benchmarks.map(({ key, label, price, isCurrent }) => (
              <div
                key={key}
                className={`p-3 rounded-lg border-2 text-center ${
                  isCurrent ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
                <p className={`text-lg font-bold mt-1 ${isCurrent ? "text-emerald-700" : "text-gray-800"}`}>
                  ${price}
                </p>
                {isCurrent && <p className="text-xs text-emerald-600 mt-0.5">≈ Your price</p>}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Sources: EU ETS, UK ETS, World Bank FASTER, High-Level Commission on Carbon Prices (2023 estimates)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
