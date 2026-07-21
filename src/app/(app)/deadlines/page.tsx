"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Deadline {
  id: string;
  framework: string;
  country: string;
  obligation: string;
  reportingYear: number;
  dueDate: string;
  status: "overdue" | "urgent" | "upcoming" | "complete";
  category: "mandatory" | "voluntary";
  dataReadinessPct: number;
}

const TODAY = new Date("2026-07-19");

function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - TODAY.getTime()) / 86400000);
}

const DEADLINES: Deadline[] = [
  {
    id: "d1",
    framework: "EU CSRD / ESRS E1",
    country: "EU",
    obligation: "Large EU companies first CSRD report (FY 2024)",
    reportingYear: 2024,
    dueDate: "2025-07-01",
    status: "overdue",
    category: "mandatory",
    dataReadinessPct: 85,
  },
  {
    id: "d2",
    framework: "CDP Climate Change",
    country: "Global",
    obligation: "CDP annual disclosure deadline",
    reportingYear: 2025,
    dueDate: "2026-07-31",
    status: "urgent",
    category: "voluntary",
    dataReadinessPct: 72,
  },
  {
    id: "d3",
    framework: "GHG Protocol",
    country: "Global",
    obligation: "FY 2025 corporate inventory sign-off",
    reportingYear: 2025,
    dueDate: "2026-09-30",
    status: "upcoming",
    category: "voluntary",
    dataReadinessPct: 60,
  },
  {
    id: "d4",
    framework: "SEC Climate Disclosure",
    country: "US",
    obligation: "Scope 1/2 disclosure in 10-K (accelerated filers)",
    reportingYear: 2025,
    dueDate: "2026-03-31",
    status: "complete",
    category: "mandatory",
    dataReadinessPct: 100,
  },
  {
    id: "d5",
    framework: "ISO 14064-1",
    country: "UK",
    obligation: "Annual GHG inventory verification completion",
    reportingYear: 2025,
    dueDate: "2026-10-31",
    status: "upcoming",
    category: "voluntary",
    dataReadinessPct: 45,
  },
  {
    id: "d6",
    framework: "TCFD",
    country: "UK",
    obligation: "TCFD-aligned disclosure (UK-listed companies)",
    reportingYear: 2025,
    dueDate: "2026-06-30",
    status: "overdue",
    category: "mandatory",
    dataReadinessPct: 90,
  },
  {
    id: "d7",
    framework: "SBTi",
    country: "Global",
    obligation: "Annual progress report submission",
    reportingYear: 2025,
    dueDate: "2026-12-31",
    status: "upcoming",
    category: "voluntary",
    dataReadinessPct: 55,
  },
];

const STATUS_STYLES = {
  overdue: "bg-red-100 text-red-700 border-red-200",
  urgent: "bg-orange-100 text-orange-700 border-orange-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  complete: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS = {
  overdue: "Overdue",
  urgent: "Due Soon",
  upcoming: "Upcoming",
  complete: "Complete",
};

export default function DeadlinesPage() {
  const sorted = [...DEADLINES].sort((a, b) => {
    const order = { overdue: 0, urgent: 1, upcoming: 2, complete: 3 };
    return order[a.status] - order[b.status];
  });

  const overdue = DEADLINES.filter((d) => d.status === "overdue").length;
  const urgent = DEADLINES.filter((d) => d.status === "urgent").length;
  const complete = DEADLINES.filter((d) => d.status === "complete").length;

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Regulatory Deadline Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Country-specific mandatory and voluntary reporting deadlines with data readiness
        </p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Overdue", value: overdue, color: "text-red-600" },
          { label: "Due Soon (≤30d)", value: urgent, color: "text-orange-600" },
          { label: "Upcoming", value: DEADLINES.filter((d) => d.status === "upcoming").length, color: "text-blue-600" },
          { label: "Complete", value: complete, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deadline list */}
      <div className="space-y-3">
        {sorted.map((d) => {
          const days = daysUntil(d.dueDate);
          return (
            <Card key={d.id} className={d.status === "overdue" ? "border-red-200" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{d.framework}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{d.country}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          d.category === "mandatory"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {d.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{d.obligation}</p>
                    <p className="text-xs text-gray-400 mt-1">Reporting year: {d.reportingYear}</p>
                  </div>

                  {/* Centre: due date */}
                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-gray-400">Due</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(d.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        days < 0 ? "text-red-600" : days <= 30 ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {d.status === "complete"
                        ? "Done"
                        : days < 0
                        ? `${Math.abs(days)}d overdue`
                        : `${days}d remaining`}
                    </p>
                  </div>

                  {/* Right: status + readiness */}
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[d.status]}`}>
                      {STATUS_LABELS[d.status]}
                    </span>
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Data ready</span>
                        <span>{d.dataReadinessPct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${
                            d.dataReadinessPct >= 80
                              ? "bg-emerald-500"
                              : d.dataReadinessPct >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${d.dataReadinessPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Deadlines are indicative — verify against official regulatory publications. CSRD dates may vary
        by member state. CDP deadlines set annually.
      </p>
    </div>
  );
}
