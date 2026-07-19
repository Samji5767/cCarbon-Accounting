"use client";

import { useEffect, useState } from "react";
import { Target, TrendingDown, Calendar, CheckCircle, AlertTriangle, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface EmissionTarget {
  id: string;
  name: string;
  type: string;
  baselineYear: number;
  targetYear: number;
  baselineCo2e: number;
  targetCo2e: number;
  reductionPct: number;
  scope: string;
  status: string;
}

const SCOPE_LABELS: Record<string, string> = {
  scope1: "Scope 1 Only",
  scope2: "Scope 2 Only",
  scope3: "Scope 3 Only",
  scope1_2: "Scope 1 & 2",
  all: "All Scopes (1+2+3)",
};

// Science Based Targets progress tracking data
const PATHWAY_DATA = [
  { year: 2020, actual: 2000, pathway: 2000, target: 2000 },
  { year: 2021, actual: 1850, pathway: 1800, target: 1800 },
  { year: 2022, actual: 1720, pathway: 1600, target: 1600 },
  { year: 2023, actual: 1620, pathway: 1400, target: 1400 },
  { year: 2024, actual: 1590, pathway: 1200, target: 1200 },
  { year: 2025, actual: null, pathway: 1000, target: 1000 },
  { year: 2026, actual: null, pathway: 800, target: 800 },
  { year: 2027, actual: null, pathway: 600, target: 600 },
  { year: 2028, actual: null, pathway: 400, target: 400 },
  { year: 2029, actual: null, pathway: 200, target: 200 },
  { year: 2030, actual: null, pathway: 0, target: 0 },
];

export default function TargetsPage() {
  const [targets, setTargets] = useState<EmissionTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports") // reuse to grab org data; targets are embedded in dashboard
      .then(() => {
        // Use static demo data for targets
        setTargets([
          {
            id: "target-1",
            name: "Net Zero by 2030 (Scope 1+2)",
            type: "absolute",
            baselineYear: 2020,
            targetYear: 2030,
            baselineCo2e: 2000,
            targetCo2e: 0,
            reductionPct: 100,
            scope: "scope1_2",
            status: "active",
          },
          {
            id: "target-2",
            name: "50% Scope 3 Reduction by 2030",
            type: "absolute",
            baselineYear: 2020,
            targetYear: 2030,
            baselineCo2e: 300,
            targetCo2e: 150,
            reductionPct: 50,
            scope: "scope3",
            status: "active",
          },
          {
            id: "target-3",
            name: "SBTi 1.5°C Near-term Target (Scope 1+2)",
            type: "sbti",
            baselineYear: 2020,
            targetYear: 2025,
            baselineCo2e: 2000,
            targetCo2e: 1400,
            reductionPct: 30,
            scope: "scope1_2",
            status: "active",
          },
        ]);
        setLoading(false);
      });
  }, []);

  const currentProgress = (t: EmissionTarget) => {
    // Simulated: current 2024 actual vs baseline
    const current = 1590;
    const progress = ((t.baselineCo2e - current) / (t.baselineCo2e - t.targetCo2e)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emission Reduction Targets</h1>
          <p className="text-gray-500 text-sm mt-1">Science-based targets · Net zero commitments · Regulatory pledges</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Target
        </Button>
      </div>

      {/* SBTi info banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Science Based Targets Initiative (SBTi)</p>
            <p className="text-xs text-blue-700 mt-1">
              SBTi requires companies to reduce Scope 1 & 2 emissions by at least 42% by 2030 (from a 2020 baseline) to align with a 1.5°C pathway.
              Scope 3 must be covered if it represents ≥40% of total emissions. Targets must be verified by SBTi before public disclosure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pathway chart */}
      <Card>
        <CardHeader>
          <CardTitle>Emissions Reduction Pathway</CardTitle>
          <CardDescription>Actual vs 1.5°C science-based pathway (Scope 1+2, tCO₂e)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={PATHWAY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => typeof v === "number" ? [`${formatNumber(v)} tCO₂e`] : ["Projected"]} />
              <Legend />
              <ReferenceLine y={0} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Net Zero", fill: "#22c55e", fontSize: 11 }} />
              <Bar dataKey="actual" name="Actual Emissions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pathway" name="1.5°C Pathway" fill="#d1fae5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Target cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400 text-sm col-span-3">Loading...</p>
        ) : (
          targets.map((t) => {
            const progress = currentProgress(t);
            const onTrack = progress >= ((2024 - t.baselineYear) / (t.targetYear - t.baselineYear)) * 100;

            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={onTrack ? "default" : "warning"}>
                        {onTrack ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> On Track</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> Lagging</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-800 text-sm mb-1">{t.name}</p>
                  <p className="text-xs text-gray-500 mb-4">{SCOPE_LABELS[t.scope] ?? t.scope} · {t.type.toUpperCase()}</p>

                  {/* Progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress toward {t.reductionPct}% reduction</span>
                      <span className="font-medium text-emerald-700">{formatNumber(progress, 0)}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${onTrack ? "bg-emerald-500" : "bg-amber-400"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Baseline</p>
                      <p className="text-sm font-bold text-gray-700">{formatNumber(t.baselineCo2e, 0)}t</p>
                      <p className="text-[10px] text-gray-400">{t.baselineYear}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-400">Current</p>
                      <p className="text-sm font-bold text-blue-700">1,590t</p>
                      <p className="text-[10px] text-blue-400">2024</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-xs text-emerald-400">Target</p>
                      <p className="text-sm font-bold text-emerald-700">{formatNumber(t.targetCo2e, 0)}t</p>
                      <p className="text-[10px] text-emerald-400">{t.targetYear}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{t.targetYear - 2024} years remaining</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Regulatory context */}
      <Card>
        <CardHeader>
          <CardTitle>Target Setting Frameworks</CardTitle>
          <CardDescription>Regulatory and voluntary target-setting standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              {
                name: "SBTi 1.5°C (Near-term)",
                desc: "≥42% reduction in Scope 1+2 by 2030 from 2020 baseline. Scope 3 if ≥40% of total.",
                status: "Submitted",
                statusColor: "default",
              },
              {
                name: "SBTi Net-Zero (Long-term)",
                desc: "Reduce absolute Scope 1, 2, 3 emissions by ≥90% before 2050. Neutralize residuals.",
                status: "Not yet",
                statusColor: "secondary",
              },
              {
                name: "EU CSRD – Climate Plan",
                desc: "Mandatory transition plan under ESRS E1 for EU-listed companies and large undertakings.",
                status: "In Progress",
                statusColor: "warning",
              },
              {
                name: "Race to Zero",
                desc: "UN-backed campaign: halve emissions by 2030, reach net zero before 2050.",
                status: "Committed",
                statusColor: "default",
              },
            ].map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <Badge variant={item.statusColor as "default" | "secondary" | "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
