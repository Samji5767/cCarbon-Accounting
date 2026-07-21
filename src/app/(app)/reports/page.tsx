"use client";

import { useState } from "react";
import { Plus, FileText, CheckCircle, Clock, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { REGULATORY_FRAMEWORKS } from "@/lib/emission-factors";
import { PageHeader } from "@/components/layout/page-header";

interface Report {
  id: string;
  name: string;
  type: string;
  framework: string;
  year: number;
  status: string;
  totalScope1: number;
  totalScope2: number;
  totalScope3: number;
  totalCo2e: number;
  verificationBody: string | null;
  verificationDate: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
  under_review: { label: "Under Review", variant: "warning" as const, icon: Eye },
  verified: { label: "Verified", variant: "default" as const, icon: CheckCircle },
  published: { label: "Published", variant: "default" as const, icon: CheckCircle },
};

const DEMO_REPORTS: Report[] = [
  { id: "r1", name: "GHG Inventory Report 2024", type: "annual", framework: "GHG_PROTOCOL", year: 2024, status: "verified", totalScope1: 6420, totalScope2: 3780, totalScope3: 14440, totalCo2e: 24640, verificationBody: "Bureau Veritas", verificationDate: "2025-03-15", publishedAt: null, createdAt: "2025-01-10" },
  { id: "r2", name: "CSRD Sustainability Statement 2024", type: "csrd", framework: "CSRD", year: 2024, status: "draft", totalScope1: 6420, totalScope2: 3780, totalScope3: 14440, totalCo2e: 24640, verificationBody: null, verificationDate: null, publishedAt: null, createdAt: "2025-02-01" },
  { id: "r3", name: "CDP Climate Questionnaire 2024", type: "cdp", framework: "CDP", year: 2024, status: "under_review", totalScope1: 6420, totalScope2: 3780, totalScope3: 14440, totalCo2e: 24640, verificationBody: null, verificationDate: null, publishedAt: null, createdAt: "2025-01-20" },
  { id: "r4", name: "GHG Inventory Report 2023", type: "annual", framework: "GHG_PROTOCOL", year: 2023, status: "published", totalScope1: 7100, totalScope2: 4200, totalScope3: 15500, totalCo2e: 26800, verificationBody: "SGS", verificationDate: "2024-03-20", publishedAt: "2024-04-01", createdAt: "2024-01-15" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", framework: "GHG_PROTOCOL", year: "2024" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newReport: Report = {
      id: `r${Date.now()}`, name: form.name, type: "annual",
      framework: form.framework, year: parseInt(form.year), status: "draft",
      totalScope1: 0, totalScope2: 0, totalScope3: 0, totalCo2e: 0,
      verificationBody: null, verificationDate: null, publishedAt: null,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="md:hidden">
        <PageHeader title="Reports" subtitle="GHG Protocol · CSRD · CDP disclosures" />
      </div>
      <div className="flex items-start justify-between">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Regulatory Reports</h1>
          <p className="text-gray-500 text-sm mt-1">GHG Protocol · ISO 14064 · TCFD · CSRD · CDP disclosures</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Report
        </Button>
      </div>

      {/* Framework cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(REGULATORY_FRAMEWORKS).map(([key, fw]) => (
          <Card key={key} className="hover:border-emerald-300 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm text-gray-800">{fw.name}</p>
                {fw.verificationRequired && (
                  <Badge variant="warning" className="text-[10px]">Verification Required</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">{fw.description}</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Annual</span>
                {fw.scopes.map((s) => (
                  <span key={s} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    Scope {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>Compile emission data into a regulatory report</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Report Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 2024 Annual GHG Report"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Framework *</label>
                <select
                  value={form.framework}
                  onChange={(e) => setForm({ ...form, framework: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.entries(REGULATORY_FRAMEWORKS).map(([k, fw]) => (
                    <option key={k} value={k}>{fw.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Reporting Year</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-1 md:col-span-3 flex gap-2">
                <Button type="submit" size="sm">Generate Report</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      <div className="space-y-3">
          {reports.map((r) => {
            const sc = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
            const Icon = sc.icon;
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {r.framework} · {r.year} · {r.type}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Scope 1: <b className="text-red-600">{formatNumber(r.totalScope1)} t</b></span>
                          <span>Scope 2: <b className="text-orange-600">{formatNumber(r.totalScope2)} t</b></span>
                          <span>Scope 3: <b className="text-yellow-600">{formatNumber(r.totalScope3)} t</b></span>
                          <span>Total: <b className="text-emerald-700">{formatNumber(r.totalCo2e)} tCO₂e</b></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={sc.variant}>
                        <Icon className="w-3 h-3 mr-1" /> {sc.label}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          <Download className="w-3 h-3 mr-1" /> PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </div>
  );
}
