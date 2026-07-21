"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Industry intensity benchmarks (tCO2e per USD million revenue)
// Sources: CDP Industry Averages 2023, IEA, sector-specific studies
const INDUSTRY_BENCHMARKS: Record<string, {
  label: string;
  p25: number; p50: number; p75: number; // tCO2e/USDm
  sbtPathway2030: number; // % reduction from 2020 baseline for 1.5°C
  carbonBudget2050: number; // tCO2e/USDm at net-zero
}> = {
  manufacturing: { label: "Manufacturing", p25: 85, p50: 210, p75: 450, sbtPathway2030: 42, carbonBudget2050: 12 },
  financial_services: { label: "Financial Services", p25: 5, p50: 12, p75: 28, sbtPathway2030: 50, carbonBudget2050: 1.5 },
  retail: { label: "Retail", p25: 35, p50: 78, p75: 160, sbtPathway2030: 46, carbonBudget2050: 8 },
  technology: { label: "Technology", p25: 15, p50: 38, p75: 85, sbtPathway2030: 50, carbonBudget2050: 3.5 },
  transport: { label: "Transport", p25: 180, p50: 420, p75: 900, sbtPathway2030: 38, carbonBudget2050: 25 },
  energy: { label: "Energy", p25: 300, p50: 650, p75: 1200, sbtPathway2030: 55, carbonBudget2050: 20 },
};

// SBTi 1.5°C sector pathways (index 100 = 2020 baseline)
const SBTI_PATHWAY = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
  (year) => ({
    year,
    pathway: Math.max(0, 100 - ((year - 2020) / 10) * 50), // linear 50% reduction 2020→2030
  })
);

const DEMO_COMPANY = {
  revenueUSDm: 150,
  totalCo2e: 18000, // tCO2e
  baselineCo2e: 28000, // 2020
  industry: "manufacturing",
};

export default function BenchmarksPage() {
  const [industry, setIndustry] = useState(DEMO_COMPANY.industry);
  const [revenueUSDm, setRevenueUSDm] = useState(DEMO_COMPANY.revenueUSDm);
  const [totalCo2e, setTotalCo2e] = useState(DEMO_COMPANY.totalCo2e);
  const [baselineCo2e, setBaselineCo2e] = useState(DEMO_COMPANY.baselineCo2e);

  const bench = INDUSTRY_BENCHMARKS[industry];
  const intensity = revenueUSDm > 0 ? totalCo2e / revenueUSDm : 0;
  const reductionFromBaseline = baselineCo2e > 0 ? ((baselineCo2e - totalCo2e) / baselineCo2e) * 100 : 0;
  const sbtRequired2030Pct = bench.sbtPathway2030;
  const sbtRequired2030Absolute = baselineCo2e * (1 - sbtRequired2030Pct / 100);
  const onSbtTrack = totalCo2e <= sbtRequired2030Absolute;

  const intensityChartData = [
    { name: "Your Company", value: intensity, fill: "#10b981" },
    { name: "P25 (Leader)", value: bench.p25, fill: "#6ee7b7" },
    { name: "P50 (Median)", value: bench.p50, fill: "#fbbf24" },
    { name: "P75 (Laggard)", value: bench.p75, fill: "#f87171" },
    { name: "Net-Zero (2050)", value: bench.carbonBudget2050, fill: "#60a5fa" },
  ];

  const pathwayData = SBTI_PATHWAY.map((p) => ({
    year: p.year,
    "SBTi 1.5°C Pathway": Math.round((baselineCo2e * p.pathway) / 100),
    "Your Trajectory": p.year === 2020 ? baselineCo2e : p.year === 2024 ? totalCo2e : undefined,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Benchmarking & Peer Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          Industry intensity benchmarks, SBTi sector pathways, and science-based carbon budget
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader><CardTitle>Your Company Profile</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Industry</label>
            <select
              className="border border-gray-300 rounded-lg p-2 text-sm"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {Object.entries(INDUSTRY_BENCHMARKS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Revenue (USD million)</label>
            <input type="number" value={revenueUSDm} onChange={(e) => setRevenueUSDm(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Year tCO₂e</label>
            <input type="number" value={totalCo2e} onChange={(e) => setTotalCo2e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">2020 Baseline tCO₂e</label>
            <input type="number" value={baselineCo2e} onChange={(e) => setBaselineCo2e(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-36" />
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Emission Intensity</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(intensity, 1)}</p>
            <p className="text-xs text-gray-400">tCO₂e / USD million revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Vs. Sector Median</p>
            <p className={`text-2xl font-bold ${intensity < bench.p50 ? "text-emerald-600" : "text-red-600"}`}>
              {intensity < bench.p50 ? "▼" : "▲"} {formatNumber(Math.abs(intensity - bench.p50), 1)}
            </p>
            <p className="text-xs text-gray-400">vs P50 ({formatNumber(bench.p50, 1)})</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Reduction vs Baseline</p>
            <p className={`text-2xl font-bold ${reductionFromBaseline > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {reductionFromBaseline > 0 ? "−" : "+"}{formatNumber(Math.abs(reductionFromBaseline), 1)}%
            </p>
            <p className="text-xs text-gray-400">from {baselineCo2e.toLocaleString()} tCO₂e baseline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">SBTi 1.5°C Track</p>
            <p className={`text-2xl font-bold ${onSbtTrack ? "text-emerald-600" : "text-red-600"}`}>
              {onSbtTrack ? "On track" : "Off track"}
            </p>
            <p className="text-xs text-gray-400">target: {Math.round(sbtRequired2030Absolute).toLocaleString()} tCO₂e by 2030</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intensity benchmark chart */}
        <Card>
          <CardHeader>
            <CardTitle>Intensity vs Peers</CardTitle>
            <CardDescription>tCO₂e per USD million revenue — {bench.label} sector</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={intensityChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? [`${formatNumber(v, 1)} tCO₂e/USDm`, ""] : [v, ""])} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {intensityChartData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SBTi pathway chart */}
        <Card>
          <CardHeader>
            <CardTitle>SBTi 1.5°C Pathway</CardTitle>
            <CardDescription>Required reduction trajectory vs your actual emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pathwayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? [`${formatNumber(v, 0)} tCO₂e`, ""] : [v, ""])} />
                <Legend />
                <Bar dataKey="SBTi 1.5°C Pathway" fill="#93c5fd" />
                <Bar dataKey="Your Trajectory" fill="#10b981" />
                <ReferenceLine y={sbtRequired2030Absolute} stroke="#ef4444" strokeDasharray="5 5"
                  label={{ value: "2030 Target", fill: "#ef4444", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sector Percentile Rankings</CardTitle>
          <CardDescription>Where you stand in the {bench.label} sector (lower intensity = better)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative h-8 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow"
                style={{ left: `${Math.min(95, (intensity / bench.p75) * 75)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>P25 — {formatNumber(bench.p25, 0)}</span>
            <span>P50 — {formatNumber(bench.p50, 0)}</span>
            <span>P75 — {formatNumber(bench.p75, 0)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Sources: CDP Sector Research 2023, IEA Net Zero by 2050, SBTi Corporate Manual v2.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
