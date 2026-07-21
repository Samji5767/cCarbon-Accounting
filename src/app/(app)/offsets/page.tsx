"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type OffsetStatus = "active" | "retired" | "pending" | "expired";
type Registry = "Verra VCS" | "Gold Standard" | "American Carbon Registry" | "Climate Action Reserve";
type ProjectType = "Forestry (REDD+)" | "Renewable Energy" | "Cookstoves" | "Blue Carbon" | "Direct Air Capture" | "Methane Capture";

interface CarbonCredit {
  id: string;
  registry: Registry;
  projectName: string;
  projectType: ProjectType;
  country: string;
  vintage: number;
  quantity: number; // tCO2e
  pricePerTonne: number;
  status: OffsetStatus;
  additionality: "high" | "medium" | "low";
  permanence: "high" | "medium" | "low";
  retiredFor?: string; // scope/year
  serialRange: string;
  // Oxford Principles flags
  oxfordPrinciplesMet: boolean;
  usedForNearTermTarget: boolean; // should be false per Oxford Principles
}

const DEMO_CREDITS: CarbonCredit[] = [
  {
    id: "c1",
    registry: "Verra VCS",
    projectName: "Amazon Basin REDD+ Conservation",
    projectType: "Forestry (REDD+)",
    country: "Brazil",
    vintage: 2023,
    quantity: 5000,
    pricePerTonne: 14.50,
    status: "active",
    additionality: "high",
    permanence: "medium",
    serialRange: "VCS-2023-00412-00000001-05000",
    oxfordPrinciplesMet: false, // REDD+ doesn't meet Oxford Principles (not durable)
    usedForNearTermTarget: false,
  },
  {
    id: "c2",
    registry: "Gold Standard",
    projectName: "Kenya Efficient Cookstoves",
    projectType: "Cookstoves",
    country: "Kenya",
    vintage: 2024,
    quantity: 2000,
    pricePerTonne: 22.00,
    status: "retired",
    additionality: "high",
    permanence: "low",
    retiredFor: "Scope 3 — residual FY2023",
    serialRange: "GS-2024-CKS-00001-02000",
    oxfordPrinciplesMet: false,
    usedForNearTermTarget: false,
  },
  {
    id: "c3",
    registry: "American Carbon Registry",
    projectName: "Wyoming Enhanced Oil Recovery Methane Capture",
    projectType: "Methane Capture",
    country: "United States",
    vintage: 2024,
    quantity: 1500,
    pricePerTonne: 35.00,
    status: "active",
    additionality: "high",
    permanence: "high",
    serialRange: "ACR-2024-MCH-00001-01500",
    oxfordPrinciplesMet: true,
    usedForNearTermTarget: false,
  },
  {
    id: "c4",
    registry: "Verra VCS",
    projectName: "Climeworks Orca DAC Facility",
    projectType: "Direct Air Capture",
    country: "Iceland",
    vintage: 2025,
    quantity: 500,
    pricePerTonne: 890.00,
    status: "pending",
    additionality: "high",
    permanence: "high",
    serialRange: "VCS-2025-DAC-PEND-00001",
    oxfordPrinciplesMet: true, // DAC is durable removal
    usedForNearTermTarget: false,
  },
];

const STATUS_COLORS: Record<OffsetStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  retired: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  expired: "bg-red-100 text-red-700",
};

const QUALITY_COLORS = {
  high: "text-emerald-600",
  medium: "text-yellow-600",
  low: "text-red-600",
};

export default function OffsetsPage() {
  const [credits] = useState<CarbonCredit[]>(DEMO_CREDITS);
  const [showOxfordWarning, setShowOxfordWarning] = useState(true);

  const active = credits.filter((c) => c.status === "active");
  const retired = credits.filter((c) => c.status === "retired");
  const totalActive = active.reduce((sum, c) => sum + c.quantity, 0);
  const totalRetired = retired.reduce((sum, c) => sum + c.quantity, 0);
  const totalValue = active.reduce((sum, c) => sum + c.quantity * c.pricePerTonne, 0);
  const oxfordCompliant = active.filter((c) => c.oxfordPrinciplesMet).length;
  const violations = credits.filter((c) => c.usedForNearTermTarget && c.permanence !== "high");

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carbon Credits & Offsets Registry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track voluntary carbon credits across registries — additionality, permanence, Oxford Principles alignment
        </p>
      </div>

      {/* Oxford Principles warning */}
      {showOxfordWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-0.5">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Oxford Principles Guidance</p>
            <p className="text-xs text-amber-700 mt-1">
              The Oxford Principles on Net Zero Aligned Offsetting require: (1) prioritise reducing own emissions
              first, (2) shift to durable carbon removal over time, (3) move toward carbon removal with
              co-benefits. Offsets should <strong>not</strong> be used to compensate for near-term emission
              reduction targets. {oxfordCompliant} of {active.length} active credits meet Oxford Principles
              (durable removal only).
            </p>
          </div>
          <button onClick={() => setShowOxfordWarning(false)} className="text-amber-400 hover:text-amber-600 text-lg">×</button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Active Credits</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalActive, 0)}</p>
            <p className="text-xs text-gray-400">tCO₂e</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900">${formatNumber(totalValue / 1000, 0)}k</p>
            <p className="text-xs text-gray-400">USD at cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Retired (FY)</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalRetired, 0)}</p>
            <p className="text-xs text-gray-400">tCO₂e cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Oxford Compliant</p>
            <p className={`text-2xl font-bold ${oxfordCompliant > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {oxfordCompliant}/{active.length}
            </p>
            <p className="text-xs text-gray-400">active credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Registry</CardTitle>
          <CardDescription>Serial-number level tracking across Verra VCS, Gold Standard, ACR, CAR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Project</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Registry</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Type</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">tCO₂e</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">$/t</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Additionality</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Permanence</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Oxford</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900 text-xs leading-tight">{c.projectName}</p>
                      <p className="text-xs text-gray-400">{c.country} · {c.vintage}</p>
                      {c.retiredFor && <p className="text-xs text-gray-400 italic">Retired: {c.retiredFor}</p>}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">{c.registry}</td>
                    <td className="py-3 px-3 text-xs text-gray-600">{c.projectType}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs">{formatNumber(c.quantity, 0)}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs">${c.pricePerTonne.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium ${QUALITY_COLORS[c.additionality]}`}>
                        {c.additionality}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium ${QUALITY_COLORS[c.permanence]}`}>
                        {c.permanence}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {c.oxfordPrinciplesMet ? (
                        <span className="text-emerald-600 text-sm">✓</span>
                      ) : (
                        <span className="text-gray-400 text-sm" title="Does not meet Oxford Principles for durable removal">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Sources: Oxford Principles on Net Zero Aligned Offsetting (2023), VCMI Claims Code of Practice,
        SBTi Corporate Net-Zero Standard v1.1. Credits should complement, not substitute, emission reductions.
      </p>
    </div>
  );
}
