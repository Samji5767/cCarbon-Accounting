"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type EngagementStatus = "not_started" | "invited" | "data_received" | "verified" | "declined";
type DataQuality = "primary" | "secondary" | "spend_based";

interface Supplier {
  id: string;
  name: string;
  country: string;
  spend: number; // USD thousand
  category: string;
  co2eReported?: number; // tCO2e from supplier
  co2eSpendBased: number; // tCO2e calculated from spend × factor
  dataQuality: DataQuality;
  engagementStatus: EngagementStatus;
  sbtiCommitted: boolean;
  reductionTargetPct?: number;
  lastDataDate?: string;
}

const DEMO_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "SteelCo International", country: "Germany", spend: 4200, category: "Raw Materials", co2eReported: 18400, co2eSpendBased: 21000, dataQuality: "primary", engagementStatus: "verified", sbtiCommitted: true, reductionTargetPct: 46, lastDataDate: "2025-03-15" },
  { id: "s2", name: "PackRight Ltd", country: "UK", spend: 1800, category: "Packaging", co2eReported: 2100, co2eSpendBased: 2500, dataQuality: "secondary", engagementStatus: "data_received", sbtiCommitted: false, lastDataDate: "2025-06-01" },
  { id: "s3", name: "QuickFreight Logistics", country: "US", spend: 3100, category: "Transport", co2eSpendBased: 5800, dataQuality: "spend_based", engagementStatus: "invited", sbtiCommitted: false },
  { id: "s4", name: "ChemBase Corp", country: "China", spend: 2600, category: "Chemicals", co2eSpendBased: 9100, dataQuality: "spend_based", engagementStatus: "not_started", sbtiCommitted: false },
  { id: "s5", name: "Precision Parts GmbH", country: "Germany", spend: 950, category: "Components", co2eReported: 1200, co2eSpendBased: 1400, dataQuality: "primary", engagementStatus: "verified", sbtiCommitted: true, reductionTargetPct: 42, lastDataDate: "2025-04-20" },
  { id: "s6", name: "GlobalMould Asia", country: "India", spend: 680, category: "Components", co2eSpendBased: 2800, dataQuality: "spend_based", engagementStatus: "declined", sbtiCommitted: false },
];

const STATUS_COLORS: Record<EngagementStatus, string> = {
  not_started: "bg-gray-100 text-gray-600",
  invited: "bg-blue-100 text-blue-700",
  data_received: "bg-yellow-100 text-yellow-700",
  verified: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<EngagementStatus, string> = {
  not_started: "Not Started",
  invited: "Invited",
  data_received: "Data Received",
  verified: "Verified",
  declined: "Declined",
};

const DQ_LABELS: Record<DataQuality, string> = {
  primary: "Primary (supplier-reported)",
  secondary: "Secondary (industry EF)",
  spend_based: "Spend-based (avg IO EF)",
};

const DQ_COLORS: Record<DataQuality, string> = {
  primary: "text-emerald-600",
  secondary: "text-yellow-600",
  spend_based: "text-gray-500",
};

export default function SupplierEngagementPage() {
  const [suppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);

  const totalSpend = suppliers.reduce((s, x) => s + x.spend, 0);
  const totalCo2e = suppliers.reduce((s, x) => s + (x.co2eReported ?? x.co2eSpendBased), 0);
  const verified = suppliers.filter((s) => s.engagementStatus === "verified");
  const primaryDataCoverage = verified.reduce((s, x) => s + (x.co2eReported ?? 0), 0);
  const sbtiSuppliers = suppliers.filter((s) => s.sbtiCommitted).length;
  const sbtiSpend = suppliers.filter((s) => s.sbtiCommitted).reduce((s, x) => s + x.spend, 0);

  // CDP Supplier Engagement Rating inputs
  const engagementScore = Math.round(
    (verified.length / suppliers.length) * 40 +
    (sbtiSuppliers / suppliers.length) * 30 +
    (primaryDataCoverage / totalCo2e) * 30
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supplier Engagement</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scope 3 Category 1 — purchased goods & services. Track supplier data collection,
          SBTi commitments, and CDP Supplier Engagement Rating readiness.
        </p>
      </div>

      {/* CDP SER score */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">CDP Supplier Engagement Rating (SER) Readiness</p>
              <p className="text-xs text-blue-600 mt-1">Based on verification rate, SBTi coverage, and primary data share</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-700">{engagementScore}</p>
              <p className="text-xs text-blue-500">/ 100</p>
            </div>
          </div>
          <div className="mt-3 h-3 bg-blue-200 rounded-full">
            <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: `${engagementScore}%` }} />
          </div>
          <p className="text-xs text-blue-500 mt-2">
            {engagementScore >= 70 ? "Leadership — A/A- range" : engagementScore >= 50 ? "Management — B range" : "Awareness — C/D range"}
          </p>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Supplier Emissions</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalCo2e / 1000, 1)}</p>
            <p className="text-xs text-gray-400">kt CO₂e (Cat 1 estimate)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Verified Suppliers</p>
            <p className="text-2xl font-bold text-emerald-600">{verified.length}/{suppliers.length}</p>
            <p className="text-xs text-gray-400">primary data collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">SBTi Committed</p>
            <p className="text-2xl font-bold text-blue-600">{sbtiSuppliers} suppliers</p>
            <p className="text-xs text-gray-400">{formatNumber((sbtiSpend / totalSpend) * 100, 0)}% of spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Primary Data Coverage</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber((primaryDataCoverage / totalCo2e) * 100, 0)}%</p>
            <p className="text-xs text-gray-400">by tCO₂e</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Inventory</CardTitle>
          <CardDescription>Ranked by estimated emissions. Click to update engagement status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-600">
                  <th className="text-left py-2 px-3 font-medium">Supplier</th>
                  <th className="text-left py-2 px-3 font-medium">Category</th>
                  <th className="text-right py-2 px-3 font-medium">Spend ($k)</th>
                  <th className="text-right py-2 px-3 font-medium">tCO₂e</th>
                  <th className="text-left py-2 px-3 font-medium">Data Quality</th>
                  <th className="text-left py-2 px-3 font-medium">SBTi</th>
                  <th className="text-left py-2 px-3 font-medium">Engagement</th>
                  <th className="text-left py-2 px-3 font-medium">Last Data</th>
                </tr>
              </thead>
              <tbody>
                {[...suppliers].sort((a, b) => (b.co2eReported ?? b.co2eSpendBased) - (a.co2eReported ?? a.co2eSpendBased)).map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <p className="font-medium text-gray-900 text-xs">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.country}</p>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600">{s.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">${formatNumber(s.spend, 0)}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">
                      {formatNumber(s.co2eReported ?? s.co2eSpendBased, 0)}
                      {!s.co2eReported && <span className="text-gray-400 text-[10px]"> est.</span>}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs ${DQ_COLORS[s.dataQuality]}`}>
                        {s.dataQuality === "primary" ? "Primary" : s.dataQuality === "secondary" ? "Secondary" : "Spend-based"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {s.sbtiCommitted ? (
                        <span className="text-xs text-emerald-600 font-medium">
                          ✓ {s.reductionTargetPct ? `${s.reductionTargetPct}%` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.engagementStatus]}`}>
                        {STATUS_LABELS[s.engagementStatus]}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-400">{s.lastDataDate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Spend-based emissions use DEFRA/Environmentally-Extended IO average factor (0.43 kg CO₂e/USD).
            Primary data from supplier-reported GHG inventories. SBTi = Science Based Target committed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
