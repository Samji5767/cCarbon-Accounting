"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { screenScope3Materiality } from "@/lib/calculations/scope3-materiality";
import { formatNumber } from "@/lib/utils";

const INDUSTRIES = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "financial_services", label: "Financial Services" },
  { value: "retail", label: "Retail & Consumer Goods" },
  { value: "technology", label: "Technology & Software" },
  { value: "transport", label: "Transport & Logistics" },
  { value: "other", label: "Other" },
];

const MATERIALITY_COLORS = {
  material: "bg-red-100 text-red-700 border-red-200",
  to_be_assessed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  not_material: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function Scope3Page() {
  const [industry, setIndustry] = useState("manufacturing");
  const [totalS1S2, setTotalS1S2] = useState(6000);
  const [estimates, setEstimates] = useState<Partial<Record<number, number>>>({
    1: 28000,
    6: 1200,
    7: 800,
  });

  const screens = screenScope3Materiality(industry, totalS1S2, estimates);
  const material = screens.filter((s) => s.materiality === "material");
  const toAssess = screens.filter((s) => s.materiality === "to_be_assessed");

  const totalEstimated = Object.values(estimates).reduce<number>((sum, v) => sum + (v ?? 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scope 3 Materiality Screening</h1>
        <p className="text-sm text-gray-500 mt-1">
          GHG Protocol Scope 3 Standard Chapter 7 — identify which of the 15 categories are material
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle>Screening Parameters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Industry Sector</label>
            <select
              className="border border-gray-300 rounded-lg p-2 text-sm"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Total Scope 1+2 (tCO₂e)
            </label>
            <input
              type="number"
              value={totalS1S2}
              onChange={(e) => setTotalS1S2(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Material Categories</p>
            <p className="text-3xl font-bold text-red-600">{material.length}</p>
            <p className="text-xs text-gray-400">must report</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">To Be Assessed</p>
            <p className="text-3xl font-bold text-yellow-600">{toAssess.length}</p>
            <p className="text-xs text-gray-400">further analysis needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Estimated Scope 3</p>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(totalEstimated, 0)}</p>
            <p className="text-xs text-gray-400">tCO₂e entered</p>
          </CardContent>
        </Card>
      </div>

      {/* Category table */}
      <Card>
        <CardHeader>
          <CardTitle>15 Scope 3 Categories</CardTitle>
          <CardDescription>Enter estimates where available; screening is updated in real time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium w-8">#</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Stream</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Industry</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Estimate (tCO₂e)</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Materiality</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium hidden lg:table-cell">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {screens.map((s) => (
                  <tr key={s.categoryId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-400">{s.categoryId}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{s.categoryName}</td>
                    <td className="py-2 px-3 text-gray-500">{s.isUpstream ? "Upstream" : "Downstream"}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          s.industryRelevance === "high"
                            ? "bg-red-100 text-red-700"
                            : s.industryRelevance === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.industryRelevance}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        placeholder="—"
                        value={estimates[s.categoryId] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setEstimates((prev) => ({ ...prev, [s.categoryId]: val }));
                        }}
                        className="border border-gray-200 rounded p-1 w-28 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          MATERIALITY_COLORS[s.materiality]
                        }`}
                      >
                        {s.materiality.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-400 hidden lg:table-cell max-w-xs">
                      {s.reasoning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Methodology: GHG Protocol Scope 3 Standard (2011) Chapter 7 — size, influence, stakeholder
            expectations, outsourcing, and sector benchmarks
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
