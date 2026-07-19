"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, Download, CheckCircle, Clock, Factory, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface EmissionRecord {
  id: string;
  scope: number;
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  co2e: number;
  verified: boolean;
  year: number;
  month: number | null;
  dataSource: string | null;
  facility: { name: string } | null;
  emissionFactor: { source: string; name: string } | null;
}

const SCOPE_ICONS = { 1: Factory, 2: Zap, 3: Globe };
const SCOPE_COLORS = { 1: "bg-red-100 text-red-700", 2: "bg-orange-100 text-orange-700", 3: "bg-yellow-100 text-yellow-700" };

function formatCategory(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EmissionsPage() {
  const [records, setRecords] = useState<EmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    scope: "1", category: "stationary_combustion", activityType: "natural_gas",
    quantity: "", unit: "m3", co2e: "", year: "2024", dataSource: "", facilityId: "",
  });

  useEffect(() => {
    fetch("/api/emissions?year=2024")
      .then((r) => r.json())
      .then((d) => { setRecords(d); setLoading(false); });
  }, []);

  const filtered = scopeFilter ? records.filter((r) => r.scope === scopeFilter) : records;

  const scopeTotals = {
    1: records.filter((r) => r.scope === 1).reduce((s, r) => s + r.co2e, 0),
    2: records.filter((r) => r.scope === 2).reduce((s, r) => s + r.co2e, 0),
    3: records.filter((r) => r.scope === 3).reduce((s, r) => s + r.co2e, 0),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/emissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scope: parseInt(form.scope), quantity: parseFloat(form.quantity), co2e: parseFloat(form.co2e) }),
    });
    if (res.ok) {
      const newRecord = await res.json();
      setRecords((prev) => [newRecord, ...prev]);
      setShowForm(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emission Records</h1>
          <p className="text-gray-500 text-sm mt-1">GHG Protocol Scope 1, 2 & 3 inventory · 2024</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>

      {/* Scope summary tabs */}
      <div className="grid grid-cols-4 gap-4">
        {([null, 1, 2, 3] as (number | null)[]).map((scope) => {
          const total = scope ? scopeTotals[scope as 1 | 2 | 3] : Object.values(scopeTotals).reduce((a, b) => a + b, 0);
          const label = scope ? `Scope ${scope}` : "All Scopes";
          const active = scopeFilter === scope;
          return (
            <button
              key={String(scope)}
              onClick={() => setScopeFilter(scope)}
              className={`p-4 rounded-xl border text-left transition-all ${active ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${active ? "text-emerald-700" : "text-gray-900"}`}>
                {formatNumber(total)} t
              </p>
              <p className="text-xs text-gray-400">CO₂e</p>
            </button>
          );
        })}
      </div>

      {/* Add record form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Emission Record</CardTitle>
            <CardDescription>Enter activity data to calculate CO₂e</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Scope *</label>
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="1">Scope 1 – Direct</option>
                  <option value="2">Scope 2 – Electricity</option>
                  <option value="3">Scope 3 – Value Chain</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="stationary_combustion">Stationary Combustion</option>
                  <option value="mobile_combustion">Mobile Combustion</option>
                  <option value="fugitive">Fugitive Emissions</option>
                  <option value="electricity">Electricity (purchased)</option>
                  <option value="business_travel">Business Travel</option>
                  <option value="employee_commuting">Employee Commuting</option>
                  <option value="waste">Waste</option>
                  <option value="purchased_goods">Purchased Goods</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Activity Type *</label>
                <input value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. natural_gas" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Year *</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity *</label>
                <input type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="m3">m³ (gas)</option>
                  <option value="litre">Litre</option>
                  <option value="kWh">kWh</option>
                  <option value="kg">kg</option>
                  <option value="tonne">Tonne</option>
                  <option value="km">km</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CO₂e (tonnes) *</label>
                <input type="number" step="any" value={form.co2e} onChange={(e) => setForm({ ...form, co2e: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Data Source</label>
                <input value={form.dataSource} onChange={(e) => setForm({ ...form, dataSource: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. utility bills" />
              </div>
              <div className="col-span-2 md:col-span-4 flex gap-2 pt-2">
                <Button type="submit" size="sm">Save Record</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Scope", "Category", "Activity", "Quantity", "CO₂e (t)", "Facility", "Source", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                ) : (
                  filtered.map((r) => {
                    const ScopeIcon = SCOPE_ICONS[r.scope as 1 | 2 | 3];
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SCOPE_COLORS[r.scope as 1 | 2 | 3]}`}>
                            <ScopeIcon className="w-3 h-3" /> {r.scope}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{formatCategory(r.category)}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.activityType}</td>
                        <td className="px-4 py-3 text-gray-700">{formatNumber(r.quantity, 0)} {r.unit}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatNumber(r.co2e)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.facility?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{r.emissionFactor?.source ?? r.dataSource ?? "—"}</td>
                        <td className="px-4 py-3">
                          {r.verified ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* GHG Protocol guidance */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-emerald-800 mb-2">GHG Protocol Scope Definitions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-700">
            <div><span className="font-medium">Scope 1 – Direct:</span> Emissions from sources owned or controlled by the company (combustion, process, fugitive).</div>
            <div><span className="font-medium">Scope 2 – Indirect:</span> Emissions from purchased electricity, heat, steam or cooling.</div>
            <div><span className="font-medium">Scope 3 – Value Chain:</span> All other indirect emissions across the upstream and downstream value chain.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
