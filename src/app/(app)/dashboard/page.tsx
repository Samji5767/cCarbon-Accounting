"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingDown, CheckCircle, FileText, AlertTriangle, Leaf, Factory, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTonnes, formatNumber } from "@/lib/utils";

const COLORS = { scope1: "#ef4444", scope2: "#f97316", scope3: "#eab308" };
const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];

interface DashboardData {
  summary: { scope1: number; scope2: number; scope3: number; total: number; intensity: number };
  monthly: { month: string; scope1: number; scope2: number; scope3: number }[];
  categoryData: { name: string; value: number }[];
  targets: { id: string; name: string; reductionPct: number; status: string }[];
  reports: { id: string; name: string; framework: string; status: string; year: number }[];
  verificationRate: number;
  recordCount: number;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  under_review: { label: "Under Review", variant: "warning" },
  verified: { label: "Verified", variant: "default" },
  published: { label: "Published", variant: "default" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-gray-500">
          <Leaf className="w-5 h-5 animate-spin text-emerald-600" />
          Loading emissions data...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const scopeData = [
    { name: "Scope 1", value: summary.scope1, color: COLORS.scope1, icon: Factory },
    { name: "Scope 2", value: summary.scope2, color: COLORS.scope2, icon: Zap },
    { name: "Scope 3", value: summary.scope3, color: COLORS.scope3, icon: Globe },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GHG Emissions Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Acme Manufacturing Corp · Reporting Year 2024</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["GHG Protocol", "ISO 14064", "TCFD", "CSRD"].map((f) => (
            <Badge key={f} variant="default" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" /> {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatTonnes(summary.total)}</p>
                <p className="text-xs text-gray-400 mt-1">tCO₂e 2024</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {scopeData.map((scope) => (
          <Card key={scope.name}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{scope.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: scope.color }}>
                    {formatTonnes(scope.value)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatNumber((scope.value / summary.total) * 100, 1)}% of total
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: scope.color + "15" }}>
                  <scope.icon className="w-5 h-5" style={{ color: scope.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emissions Intensity</p>
              <p className="text-xl font-bold text-gray-900">{summary.intensity} tCO₂e/M$</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Verification Rate</p>
              <p className="text-xl font-bold text-gray-900">{data.verificationRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-50">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emission Records</p>
              <p className="text-xl font-bold text-gray-900">{data.recordCount} entries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Emissions Trend</CardTitle>
            <CardDescription>Scope 1, 2 & 3 breakdown by month (tCO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${typeof v === "number" ? formatNumber(v) : v} tCO₂e`]} />
                <Legend />
                <Area type="monotone" dataKey="scope1" stackId="1" stroke={COLORS.scope1} fill={COLORS.scope1} fillOpacity={0.6} name="Scope 1" />
                <Area type="monotone" dataKey="scope2" stackId="1" stroke={COLORS.scope2} fill={COLORS.scope2} fillOpacity={0.6} name="Scope 2" />
                <Area type="monotone" dataKey="scope3" stackId="1" stroke={COLORS.scope3} fill={COLORS.scope3} fillOpacity={0.6} name="Scope 3" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Emission sources breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${typeof v === "number" ? formatNumber(v) : v} tCO₂e`]} />
                <Legend iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Targets & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Reduction Targets</CardTitle>
            <CardDescription>Science-based & regulatory commitments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.targets.map((t) => (
              <div key={t.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">{t.name}</span>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>
                    {t.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(t.reductionPct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{t.reductionPct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Regulatory submissions & inventories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.reports.map((r) => {
              const s = STATUS_MAP[r.status] ?? { label: r.status, variant: "secondary" as const };
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.framework} · {r.year}</p>
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance Status</CardTitle>
          <CardDescription>Requirements across all active frameworks for 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { framework: "GHG Protocol", items: ["Scope 1 direct emissions", "Scope 2 electricity", "Scope 3 value chain", "Base year established", "Organizational boundary"], done: [true, true, true, true, true] },
              { framework: "ISO 14064-1", items: ["GHG inventory completed", "Scope boundary set", "Uncertainty assessment", "Third-party verification", "Management review"], done: [true, true, false, false, true] },
              { framework: "TCFD", items: ["Governance disclosure", "Strategy analysis", "Risk management", "Metrics & targets", "Climate scenario"], done: [true, true, false, true, false] },
              { framework: "CSRD / ESRS E1", items: ["Double materiality", "GHG inventory (E1-6)", "Climate transition plan", "Physical risk assessment", "Financial effects"], done: [false, true, false, false, false] },
              { framework: "CDP Climate", items: ["Scope 1 & 2 verified", "Scope 3 categories", "Emissions intensity", "Reduction initiatives", "Climate targets"], done: [true, true, true, false, true] },
              { framework: "SBTi", items: ["Near-term target set", "Long-term net-zero", "Scope 1+2 coverage", "Scope 3 coverage", "Annual reporting"], done: [true, false, true, false, false] },
            ].map((fw) => (
              <div key={fw.framework} className="border border-gray-100 rounded-lg p-4">
                <p className="font-semibold text-sm text-gray-800 mb-3">{fw.framework}</p>
                <div className="space-y-1.5">
                  {fw.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {fw.done[i] ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className={fw.done[i] ? "text-gray-600" : "text-gray-400"}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {fw.done.filter(Boolean).length}/{fw.done.length} complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
