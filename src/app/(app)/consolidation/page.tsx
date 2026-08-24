"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { consolidate, type Entity, type ConsolidationApproach } from "@/lib/consolidation";
import { formatNumber } from "@/lib/utils";

const DEMO_ENTITIES: Entity[] = [
  { id: "e1", name: "Acme Manufacturing Corp (Parent)", type: "parent", ownershipPct: 100, operationalControl: true, financialControl: true, scope1Co2e: 4200, scope2Co2e: 1800, scope3Co2e: 12000, country: "US", reportingYear: 2025 },
  { id: "e2", name: "Acme UK Ltd", type: "subsidiary", ownershipPct: 100, operationalControl: true, financialControl: true, scope1Co2e: 980, scope2Co2e: 420, scope3Co2e: 3200, country: "UK", reportingYear: 2025 },
  { id: "e3", name: "Acme-Renew JV", type: "joint_venture", ownershipPct: 50, operationalControl: false, financialControl: false, scope1Co2e: 1500, scope2Co2e: 600, scope3Co2e: 2000, country: "DE", reportingYear: 2025 },
  { id: "e4", name: "GreenPack India Pvt Ltd", type: "associate", ownershipPct: 35, operationalControl: false, financialControl: false, scope1Co2e: 3200, scope2Co2e: 2100, scope3Co2e: 8000, country: "IN", reportingYear: 2025 },
  { id: "e5", name: "Acme Logistics LLC (acquired Jul 2025)", type: "subsidiary", ownershipPct: 100, operationalControl: true, financialControl: true, scope1Co2e: 2400, scope2Co2e: 800, scope3Co2e: 4500, country: "US", acquisitionDate: "2025-07-01", reportingYear: 2025 },
];

const APPROACH_LABELS: Record<ConsolidationApproach, string> = {
  operational_control: "Operational Control",
  financial_control: "Financial Control",
  equity_share: "Equity Share",
};

const APPROACH_DESCRIPTIONS: Record<ConsolidationApproach, string> = {
  operational_control: "100% of entities where company has authority to introduce/implement operating policies. Excludes JVs/associates without operational control.",
  financial_control: "100% of entities where company has ability to direct financial and operating policies. Typically follows accounting consolidation.",
  equity_share: "Proportional share of each entity's emissions equal to ownership %. Includes JVs and associates at ownership fraction.",
};

const TYPE_COLORS: Record<string, string> = {
  parent: "bg-emerald-100 text-emerald-700",
  subsidiary: "bg-blue-100 text-blue-700",
  joint_venture: "bg-yellow-100 text-yellow-700",
  associate: "bg-gray-100 text-gray-600",
  franchise: "bg-purple-100 text-purple-700",
};

export default function ConsolidationPage() {
  const [approach, setApproach] = useState<ConsolidationApproach>("operational_control");

  const result = consolidate(DEMO_ENTITIES, approach);

  const allThree = (["operational_control", "financial_control", "equity_share"] as ConsolidationApproach[]).map((a) => ({
    approach: a,
    result: consolidate(DEMO_ENTITIES, a),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Multi-Entity Consolidation</h1>
        <p className="text-sm text-gray-500 mt-1">
          GHG Protocol Chapter 3 — operational control, financial control, or equity share consolidation with M&A proration
        </p>
      </div>

      {/* Approach selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(APPROACH_LABELS) as ConsolidationApproach[]).map((a) => (
          <button
            key={a}
            onClick={() => setApproach(a)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              approach === a
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className={`text-sm font-semibold ${approach === a ? "text-emerald-800" : "text-gray-800"}`}>
              {APPROACH_LABELS[a]}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{APPROACH_DESCRIPTIONS[a]}</p>
          </button>
        ))}
      </div>

      {/* Result KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Scope 1", value: formatNumber(result.scope1, 0), sub: "tCO₂e" },
          { label: "Scope 2", value: formatNumber(result.scope2, 0), sub: "tCO₂e" },
          { label: "Scope 3", value: formatNumber(result.scope3, 0), sub: "tCO₂e" },
          { label: "Total", value: formatNumber(result.total, 0), sub: "tCO₂e" },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approach comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Approach Comparison</CardTitle>
          <CardDescription>Total consolidated tCO₂e under each GHG Protocol approach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allThree.map(({ approach: a, result: r }) => {
              const pct = result.total > 0 ? (r.total / allThree[0].result.total) * 100 : 0;
              return (
                <div key={a}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${a === approach ? "text-emerald-700" : "text-gray-700"}`}>
                      {APPROACH_LABELS[a]}
                      {a === approach && " (active)"}
                    </span>
                    <span className="font-mono text-gray-900">{formatNumber(r.total, 0)} tCO₂e</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${a === approach ? "bg-emerald-500" : "bg-gray-300"}`}
                      style={{ width: `${Math.min(100, (r.total / allThree.reduce((m, x) => Math.max(m, x.result.total), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Entity table */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Inventory</CardTitle>
          <CardDescription>
            Entities included/excluded under {APPROACH_LABELS[approach]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-600">
                  <th className="text-left py-2 px-3 font-medium">Entity</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-right py-2 px-3 font-medium">Ownership %</th>
                  <th className="text-left py-2 px-3 font-medium">Country</th>
                  <th className="text-right py-2 px-3 font-medium">Scope 1 (100%)</th>
                  <th className="text-right py-2 px-3 font-medium">Scope 2 (100%)</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ENTITIES.map((e) => {
                  const included = result.includedEntities.includes(e.name);
                  const note = result.prorationNotes.find((n) => n.startsWith(e.name));
                  return (
                    <tr key={e.id} className={`border-b border-gray-100 ${!included ? "opacity-50" : ""}`}>
                      <td className="py-2 px-3 font-medium text-gray-900 text-xs">{e.name}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[e.type]}`}>
                          {e.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{e.ownershipPct}%</td>
                      <td className="py-2 px-3 text-xs text-gray-600">{e.country}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{formatNumber(e.scope1Co2e, 0)}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{formatNumber(e.scope2Co2e, 0)}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-medium ${included ? "text-emerald-600" : "text-gray-400"}`}>
                          {included ? "Included" : "Excluded"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-400">
                        {note ? note.split(": ")[1] : e.acquisitionDate ? `Acq. ${e.acquisitionDate}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {result.prorationNotes.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800 mb-1">M&A Mid-Year Proration Applied</p>
              {result.prorationNotes.map((n, i) => (
                <p key={i} className="text-xs text-yellow-700">{n}</p>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Source: GHG Protocol Corporate Standard (2004) Chapter 3 — Consolidation approaches.
            M&A proration based on active days / 365 for partial-year acquisitions and disposals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
