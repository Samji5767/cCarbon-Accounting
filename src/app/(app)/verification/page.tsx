"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type VerificationStatus = "planning" | "fieldwork" | "review" | "statement_issued" | "complete";
type FindingType = "misstatement" | "limitation" | "observation";
type AssuranceLevel = "limited" | "reasonable";

interface VerificationFinding {
  id: string;
  type: FindingType;
  description: string;
  scopeAffected: string;
  materiality: "material" | "immaterial";
  resolved: boolean;
}

const STATUS_STEPS: { key: VerificationStatus; label: string; description: string }[] = [
  { key: "planning", label: "Planning", description: "Scope & criteria agreed with verifier" },
  { key: "fieldwork", label: "Fieldwork", description: "Data review, site visits, interviews" },
  { key: "review", label: "Review", description: "Draft findings review & management response" },
  { key: "statement_issued", label: "Statement Issued", description: "Third-party assurance statement signed" },
  { key: "complete", label: "Complete", description: "Published with assurance statement" },
];

const DEMO_FINDINGS: VerificationFinding[] = [
  {
    id: "f1",
    type: "misstatement",
    description: "Natural gas consumption for Site B under-reported by ~8% due to meter calibration error",
    scopeAffected: "Scope 1 — Stationary Combustion",
    materiality: "material",
    resolved: true,
  },
  {
    id: "f2",
    type: "limitation",
    description: "Scope 3 Cat 1 supplier emission factors not available for 3 key suppliers — industry average used",
    scopeAffected: "Scope 3 — Category 1",
    materiality: "immaterial",
    resolved: false,
  },
  {
    id: "f3",
    type: "observation",
    description: "Data collection process for refrigerant top-ups could be improved with monthly tracking",
    scopeAffected: "Scope 1 — Fugitive",
    materiality: "immaterial",
    resolved: false,
  },
];

const FINDING_COLORS: Record<FindingType, string> = {
  misstatement: "bg-red-50 border-red-200 text-red-700",
  limitation: "bg-yellow-50 border-yellow-200 text-yellow-700",
  observation: "bg-blue-50 border-blue-200 text-blue-700",
};

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>("fieldwork");
  const [assuranceLevel, setAssuranceLevel] = useState<AssuranceLevel>("limited");
  const [findings, setFindings] = useState<VerificationFinding[]>(DEMO_FINDINGS);
  const [verifier, setVerifier] = useState("Bureau Veritas");
  const [framework, setFramework] = useState("ISO 14064-3");

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  const unresolvedMaterial = findings.filter(
    (f) => f.type === "misstatement" && f.materiality === "material" && !f.resolved
  );
  const canIssueStatement = unresolvedMaterial.length === 0 && currentStepIdx >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Third-Party Verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          ISO 14064-3 / GHG Protocol verification workflow — track assurance engagement from planning to statement
        </p>
      </div>

      {/* Engagement details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Engagement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Verification Body</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={verifier}
                onChange={(e) => setVerifier(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Standard</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              >
                {["ISO 14064-3", "ISAE 3410", "AA1000AS", "GHG Protocol"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Assurance Level</label>
              <div className="flex gap-4">
                {(["limited", "reasonable"] as const).map((l) => (
                  <label key={l} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={assuranceLevel === l}
                      onChange={() => setAssuranceLevel(l)}
                    />
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {assuranceLevel === "limited"
                  ? "Nothing has come to our attention (ISAE 3410 §A1)"
                  : "Positive conclusion with high level of confidence"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress stepper */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-0">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <button
                      onClick={() => setStatus(step.key)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        idx < currentStepIdx
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : idx === currentStepIdx
                          ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {idx < currentStepIdx ? "✓" : idx + 1}
                    </button>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          idx < currentStepIdx ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <p className={`text-xs font-medium ${idx === currentStepIdx ? "text-emerald-700" : "text-gray-500"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {canIssueStatement && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800">
                  Ready to issue {assuranceLevel} assurance statement under {framework}
                </p>
                <button
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                  onClick={() => setStatus("statement_issued")}
                >
                  Mark Statement Issued
                </button>
              </div>
            )}

            {unresolvedMaterial.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">
                  {unresolvedMaterial.length} unresolved material misstatement(s) — statement cannot be issued
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Findings</CardTitle>
          <CardDescription>
            Misstatements, limitations, and observations raised by the verification body
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {findings.map((f) => (
            <div key={f.id} className={`p-4 rounded-lg border ${FINDING_COLORS[f.type]} ${f.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase">{f.type.replace(/_/g, " ")}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${f.materiality === "material" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-600"}`}>
                      {f.materiality}
                    </span>
                    <span className="text-xs text-gray-400">{f.scopeAffected}</span>
                  </div>
                  <p className="text-sm">{f.description}</p>
                </div>
                <button
                  onClick={() =>
                    setFindings((prev) =>
                      prev.map((item) => (item.id === f.id ? { ...item, resolved: !item.resolved } : item))
                    )
                  }
                  className={`text-xs px-3 py-1 rounded-full border shrink-0 ${
                    f.resolved
                      ? "bg-gray-100 text-gray-500 border-gray-300"
                      : "bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {f.resolved ? "Resolved" : "Mark Resolved"}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
