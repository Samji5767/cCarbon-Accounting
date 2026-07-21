"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type Action = "create" | "update" | "verify" | "publish" | "delete" | "import";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: Action;
  resource: string;
  resourceId: string;
  field?: string;
  before?: string;
  after?: string;
  reason?: string;
  ipAddress: string;
  hash: string; // SHA-256 of (prev_hash + payload) for immutability chain
}

const ACTION_COLORS: Record<Action, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  verify: "bg-purple-100 text-purple-700",
  publish: "bg-green-100 text-green-700",
  delete: "bg-red-100 text-red-700",
  import: "bg-yellow-100 text-yellow-700",
};

const ACTION_ICONS: Record<Action, string> = {
  create: "+",
  update: "~",
  verify: "✓",
  publish: "↑",
  delete: "×",
  import: "↓",
};

const DEMO_LOG: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "2026-07-19T14:32:10Z",
    user: "alex.admin@acme.com",
    action: "publish",
    resource: "Report",
    resourceId: "rpt-2025-ghg",
    reason: "Board-approved FY2025 GHG inventory",
    ipAddress: "192.168.1.42",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "a2",
    timestamp: "2026-07-19T13:15:04Z",
    user: "sarah.env@acme.com",
    action: "verify",
    resource: "EmissionRecord",
    resourceId: "er-00412",
    reason: "Site audit confirmed meter calibration corrected",
    ipAddress: "10.0.0.55",
    hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  },
  {
    id: "a3",
    timestamp: "2026-07-19T11:50:22Z",
    user: "sarah.env@acme.com",
    action: "update",
    resource: "EmissionRecord",
    resourceId: "er-00412",
    field: "quantity",
    before: "48200",
    after: "52100",
    reason: "Corrected natural gas meter reading — calibration error Q2",
    ipAddress: "10.0.0.55",
    hash: "2c624232cdd221771294dfbb310acbc8d21c7fba3bc45ee31b6fbf4fc8b84cc5",
  },
  {
    id: "a4",
    timestamp: "2026-07-18T16:02:58Z",
    user: "james.data@acme.com",
    action: "import",
    resource: "EmissionRecord",
    resourceId: "batch-20260718",
    reason: "Q2 2026 utility bills bulk import (14 records)",
    ipAddress: "10.0.0.12",
    hash: "19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7",
  },
  {
    id: "a5",
    timestamp: "2026-07-17T09:30:01Z",
    user: "alex.admin@acme.com",
    action: "create",
    resource: "EmissionTarget",
    resourceId: "tgt-sbti-nz",
    reason: "SBTi net-zero target commitment registered",
    ipAddress: "192.168.1.42",
    hash: "4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865",
  },
  {
    id: "a6",
    timestamp: "2026-07-15T14:11:33Z",
    user: "sarah.env@acme.com",
    action: "update",
    resource: "Organization",
    resourceId: "org-acme",
    field: "framework",
    before: "GHG_PROTOCOL",
    after: "CSRD",
    reason: "Upgraded reporting framework ahead of FY2026 CSRD obligation",
    ipAddress: "10.0.0.55",
    hash: "53c234e5e8472b6ac51c1ae1cab3fe06fad053beb8ebfd8977b010655bfdd3c3",
  },
];

const RESOURCE_FILTER_OPTIONS = ["All", "EmissionRecord", "Report", "Organization", "EmissionTarget"];
const ACTION_FILTER_OPTIONS: ("All" | Action)[] = ["All", "create", "update", "verify", "publish", "import", "delete"];

export default function AuditTrailPage() {
  const [resourceFilter, setResourceFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState<"All" | Action>("All");
  const [search, setSearch] = useState("");
  const [showDiff, setShowDiff] = useState<string | null>(null);

  const filtered = DEMO_LOG.filter((e) => {
    if (resourceFilter !== "All" && e.resource !== resourceFilter) return false;
    if (actionFilter !== "All" && e.action !== actionFilter) return false;
    if (search && !JSON.stringify(e).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-1">
          Immutable change log with before/after diffs — every mutation to emission data, reports, and targets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: DEMO_LOG.length },
          { label: "Updates (with diff)", value: DEMO_LOG.filter((e) => e.action === "update").length },
          { label: "Verifications", value: DEMO_LOG.filter((e) => e.action === "verify").length },
          { label: "Published", value: DEMO_LOG.filter((e) => e.action === "publish").length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by user, resource, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            {RESOURCE_FILTER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as "All" | Action)}
          >
            {ACTION_FILTER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </CardContent>
      </Card>

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Action badge */}
                <span
                  className={`text-xs font-bold px-2 py-1 rounded shrink-0 mt-0.5 font-mono ${ACTION_COLORS[entry.action]}`}
                >
                  {ACTION_ICONS[entry.action]} {entry.action.toUpperCase()}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.resource} <span className="text-gray-400 font-mono text-xs">#{entry.resourceId}</span>
                    </span>
                    {entry.field && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                        .{entry.field}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium">{entry.user}</span>
                    {" · "}
                    {new Date(entry.timestamp).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                    {" · "}
                    <span className="font-mono">{entry.ipAddress}</span>
                  </p>

                  {entry.reason && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{entry.reason}"</p>
                  )}

                  {entry.before && entry.after && (
                    <button
                      onClick={() => setShowDiff(showDiff === entry.id ? null : entry.id)}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      {showDiff === entry.id ? "Hide diff ▲" : "Show diff ▼"}
                    </button>
                  )}

                  {showDiff === entry.id && entry.before && entry.after && (
                    <div className="mt-2 font-mono text-xs rounded overflow-hidden border border-gray-200">
                      <div className="bg-red-50 px-3 py-1.5 text-red-700">
                        − {entry.field}: {entry.before}
                      </div>
                      <div className="bg-emerald-50 px-3 py-1.5 text-emerald-700">
                        + {entry.field}: {entry.after}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hash chain chip */}
                <span className="text-[10px] font-mono text-gray-300 hidden lg:block shrink-0 mt-1" title="Chain hash">
                  {entry.hash.slice(0, 12)}…
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No audit events match the current filters.</p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Each entry's hash is derived from SHA-256(previous_hash + payload) forming a tamper-evident chain.
        Published records are permanently immutable — corrections require a new entry with a reason.
      </p>
    </div>
  );
}
