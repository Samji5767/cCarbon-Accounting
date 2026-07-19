"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// CSRD/ESRS E1 Double Materiality Assessment
// Two dimensions: Impact Materiality + Financial Materiality
// Score each topic 1-5 on both axes → quadrant determines reporting requirement

interface MaterialityTopic {
  id: string;
  esrsRef: string;
  topic: string;
  subtopic: string;
  impactScore: number; // 1-5: severity + scale + irremediability of impact on people/environment
  financialScore: number; // 1-5: magnitude + likelihood of effect on company financial position
  timeHorizon: "short" | "medium" | "long";
  isMaterial: boolean; // true if either score >= 3 (single materiality threshold)
  status: "included" | "excluded" | "under_review";
}

const MATERIALITY_THRESHOLD = 3;

const INITIAL_TOPICS: MaterialityTopic[] = [
  { id: "e1-1", esrsRef: "ESRS E1-1", topic: "Climate Change", subtopic: "Transition plans & GHG targets", impactScore: 5, financialScore: 5, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "e1-2", esrsRef: "ESRS E1-2", topic: "Climate Change", subtopic: "Policies re: climate change mitigation", impactScore: 4, financialScore: 4, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "e1-3", esrsRef: "ESRS E1-3", topic: "Climate Change", subtopic: "Actions & resources for mitigation", impactScore: 4, financialScore: 3, timeHorizon: "medium", isMaterial: true, status: "included" },
  { id: "e1-4", esrsRef: "ESRS E1-4", topic: "Climate Change", subtopic: "Targets re: climate mitigation & adaptation", impactScore: 5, financialScore: 4, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "e1-5", esrsRef: "ESRS E1-5", topic: "Climate Change", subtopic: "Energy consumption and mix", impactScore: 3, financialScore: 4, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "e1-6", esrsRef: "ESRS E1-6", topic: "Climate Change", subtopic: "Gross Scope 1/2/3 GHG emissions", impactScore: 5, financialScore: 5, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "e1-7", esrsRef: "ESRS E1-7", topic: "Climate Change", subtopic: "GHG removals and carbon credits", impactScore: 3, financialScore: 3, timeHorizon: "medium", isMaterial: true, status: "included" },
  { id: "e1-8", esrsRef: "ESRS E1-8", topic: "Climate Change", subtopic: "Internal carbon pricing", impactScore: 2, financialScore: 4, timeHorizon: "medium", isMaterial: true, status: "under_review" },
  { id: "e1-9", esrsRef: "ESRS E1-9", topic: "Climate Change", subtopic: "Physical climate risks", impactScore: 4, financialScore: 5, timeHorizon: "long", isMaterial: true, status: "included" },
  { id: "e2-1", esrsRef: "ESRS E2-1", topic: "Pollution", subtopic: "Air pollution (NOx, SOx, PM)", impactScore: 3, financialScore: 2, timeHorizon: "medium", isMaterial: true, status: "under_review" },
  { id: "e3-1", esrsRef: "ESRS E3-1", topic: "Water & Marine", subtopic: "Water consumption", impactScore: 2, financialScore: 2, timeHorizon: "long", isMaterial: false, status: "excluded" },
  { id: "e4-1", esrsRef: "ESRS E4-1", topic: "Biodiversity", subtopic: "Direct impact drivers", impactScore: 1, financialScore: 1, timeHorizon: "long", isMaterial: false, status: "excluded" },
  { id: "s1-1", esrsRef: "ESRS S1-1", topic: "Own Workforce", subtopic: "Working conditions", impactScore: 3, financialScore: 3, timeHorizon: "short", isMaterial: true, status: "included" },
  { id: "g1-1", esrsRef: "ESRS G1-1", topic: "Business Conduct", subtopic: "Business ethics & anti-corruption", impactScore: 3, financialScore: 4, timeHorizon: "short", isMaterial: true, status: "included" },
];

const STATUS_COLORS = {
  included: "bg-emerald-100 text-emerald-700",
  excluded: "bg-gray-100 text-gray-500",
  under_review: "bg-yellow-100 text-yellow-700",
};

const TIME_LABELS = { short: "≤1yr", medium: "1–5yr", long: ">5yr" };

function scoreColor(score: number) {
  if (score >= 4) return "bg-red-500";
  if (score >= 3) return "bg-orange-400";
  if (score >= 2) return "bg-yellow-400";
  return "bg-gray-300";
}

export default function DoubleMaterialityPage() {
  const [topics, setTopics] = useState<MaterialityTopic[]>(INITIAL_TOPICS);
  const [selected, setSelected] = useState<string | null>(null);

  function updateScore(id: string, field: "impactScore" | "financialScore", value: number) {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        updated.isMaterial = updated.impactScore >= MATERIALITY_THRESHOLD || updated.financialScore >= MATERIALITY_THRESHOLD;
        updated.status = updated.isMaterial
          ? updated.status === "excluded" ? "under_review" : updated.status
          : "excluded";
        return updated;
      })
    );
  }

  const material = topics.filter((t) => t.isMaterial);
  const included = topics.filter((t) => t.status === "included");

  // Group by topic
  const grouped = topics.reduce<Record<string, MaterialityTopic[]>>((acc, t) => {
    if (!acc[t.topic]) acc[t.topic] = [];
    acc[t.topic].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CSRD Double Materiality Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">
          ESRS-aligned impact & financial materiality matrix — required under EU CSRD Article 19a/29a
        </p>
      </div>

      {/* Explainer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-blue-800 font-medium">Double Materiality: two lenses</p>
          <div className="flex gap-6 mt-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700">Impact Materiality (Outside-In)</p>
              <p className="text-xs text-blue-600">How the company's activities impact people and the environment. Assessed on severity, scale, and irremediability.</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700">Financial Materiality (Inside-Out)</p>
              <p className="text-xs text-blue-600">How sustainability risks/opportunities affect the company's financial position, performance, and cash flows.</p>
            </div>
          </div>
          <p className="text-xs text-blue-500 mt-2">A topic is material if it scores ≥{MATERIALITY_THRESHOLD} on either dimension.</p>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Material Topics</p>
            <p className="text-3xl font-bold text-gray-900">{material.length}</p>
            <p className="text-xs text-gray-400">of {topics.length} assessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Included in Report</p>
            <p className="text-3xl font-bold text-emerald-600">{included.length}</p>
            <p className="text-xs text-gray-400">ESRS disclosures required</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Under Review</p>
            <p className="text-3xl font-bold text-yellow-600">{topics.filter((t) => t.status === "under_review").length}</p>
            <p className="text-xs text-gray-400">need final decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Materiality matrix (visual) */}
      <Card>
        <CardHeader>
          <CardTitle>Materiality Matrix</CardTitle>
          <CardDescription>Each dot = one ESRS topic. Hover for label. Top-right = highest priority.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border border-gray-200 rounded-lg bg-gray-50" style={{ height: 320 }}>
            {/* Quadrant labels */}
            <div className="absolute top-2 right-3 text-xs text-gray-400 font-medium">HIGH financial + HIGH impact</div>
            <div className="absolute bottom-2 left-3 text-xs text-gray-400">Low financial + Low impact</div>
            {/* Threshold lines */}
            <div className="absolute" style={{ left: "50%", top: 0, bottom: 0, borderLeft: "1px dashed #d1d5db" }} />
            <div className="absolute" style={{ top: "50%", left: 0, right: 0, borderTop: "1px dashed #d1d5db" }} />

            {topics.map((t) => {
              const x = ((t.financialScore - 1) / 4) * 85 + 7; // 7–92% horizontal
              const y = 92 - ((t.impactScore - 1) / 4) * 85; // inverted: high score = top
              return (
                <button
                  key={t.id}
                  title={`${t.topic}: ${t.subtopic}`}
                  onClick={() => setSelected(selected === t.id ? null : t.id)}
                  className={`absolute w-4 h-4 rounded-full border-2 transition-transform hover:scale-150 ${
                    t.status === "included"
                      ? "bg-emerald-500 border-emerald-700"
                      : t.status === "under_review"
                      ? "bg-yellow-400 border-yellow-600"
                      : "bg-gray-300 border-gray-400"
                  } ${selected === t.id ? "scale-150 ring-2 ring-blue-500" : ""}`}
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                />
              );
            })}

            {/* Axis labels */}
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-400 pb-1">
              Financial Materiality →
            </div>
            <div className="absolute top-0 bottom-0 left-0 flex items-center text-xs text-gray-400" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", paddingLeft: 4 }}>
              ← Impact Materiality
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Included</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"/> Under review</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block"/> Excluded</span>
          </div>
        </CardContent>
      </Card>

      {/* Topic table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Adjust scores (1=low, 5=high) to update materiality determination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-600">
                  <th className="text-left py-2 px-3 font-medium">ESRS Ref</th>
                  <th className="text-left py-2 px-3 font-medium">Topic / Subtopic</th>
                  <th className="text-left py-2 px-3 font-medium">Horizon</th>
                  <th className="text-center py-2 px-3 font-medium">Impact (1–5)</th>
                  <th className="text-center py-2 px-3 font-medium">Financial (1–5)</th>
                  <th className="text-left py-2 px-3 font-medium">Material?</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([group, rows]) => (
                  <>
                    <tr key={`group-${group}`} className="bg-gray-50">
                      <td colSpan={7} className="py-1.5 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {group}
                      </td>
                    </tr>
                    {rows.map((t) => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-xs text-gray-400">{t.esrsRef}</td>
                        <td className="py-2 px-3 text-xs text-gray-800">{t.subtopic}</td>
                        <td className="py-2 px-3 text-xs text-gray-500">{TIME_LABELS[t.timeHorizon]}</td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="range" min={1} max={5} value={t.impactScore}
                            onChange={(e) => updateScore(t.id, "impactScore", Number(e.target.value))}
                            className="w-16 accent-emerald-600"
                          />
                          <span className="ml-1 text-xs font-bold">{t.impactScore}</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="range" min={1} max={5} value={t.financialScore}
                            onChange={(e) => updateScore(t.id, "financialScore", Number(e.target.value))}
                            className="w-16 accent-blue-600"
                          />
                          <span className="ml-1 text-xs font-bold">{t.financialScore}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-medium ${t.isMaterial ? "text-red-600" : "text-gray-400"}`}>
                            {t.isMaterial ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Methodology: EFRAG ESRS 1 — Annex C (IRO identification), ESRS 1 §§ 16–43 (double materiality
            process). Threshold set at score ≥3 per EFRAG guidance. Final determination requires management
            review and sign-off.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
