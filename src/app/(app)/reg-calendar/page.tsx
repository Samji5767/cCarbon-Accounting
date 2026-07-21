"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle2, Clock, ChevronRight } from "lucide-react";

const DEADLINES = [
  { id: 1,  regulation: "CSRD",          jurisdiction: "EU",     deadline: "2025-01-31", description: "ESRS E1 Climate Disclosure — FY2024 report submission to national authority",          status: "urgent",    daysLeft: 12,  priority: "critical" },
  { id: 2,  regulation: "CDP",           jurisdiction: "Global", deadline: "2025-07-31", description: "CDP Climate Change questionnaire response deadline",                                     status: "upcoming",  daysLeft: 192, priority: "high" },
  { id: 3,  regulation: "TCFD",          jurisdiction: "UK",     deadline: "2025-04-30", description: "TCFD-aligned annual report disclosures for UK-listed entities",                          status: "upcoming",  daysLeft: 101, priority: "high" },
  { id: 4,  regulation: "EU ETS",        jurisdiction: "EU",     deadline: "2025-03-31", description: "Annual emissions report verification and surrender of allowances",                       status: "upcoming",  daysLeft: 71,  priority: "critical" },
  { id: 5,  regulation: "GHG Protocol",  jurisdiction: "Global", deadline: "2025-06-30", description: "Internal GHG inventory completion — FY2024 Scope 1, 2 & 3 finalization",               status: "upcoming",  daysLeft: 161, priority: "medium" },
  { id: 6,  regulation: "SFDR",          jurisdiction: "EU",     deadline: "2025-03-01", description: "Principal Adverse Impact (PAI) statement publication on company website",               status: "upcoming",  daysLeft: 41,  priority: "high" },
  { id: 7,  regulation: "ISO 14064",     jurisdiction: "Global", deadline: "2025-09-15", description: "Third-party verification audit completion for ISO 14064-1 certification",               status: "upcoming",  daysLeft: 238, priority: "medium" },
  { id: 8,  regulation: "SBTi",          jurisdiction: "Global", deadline: "2024-12-31", description: "SBTi near-term target validation submission",                                           status: "completed", daysLeft: 0,   priority: "high" },
  { id: 9,  regulation: "CBAM",          jurisdiction: "EU",     deadline: "2025-01-31", description: "CBAM transitional period quarterly report Q4 2024",                                     status: "urgent",    daysLeft: 12,  priority: "critical" },
  { id: 10, regulation: "SEC Climate",   jurisdiction: "US",     deadline: "2026-06-15", description: "SEC climate-related disclosure rules — large accelerated filers",                       status: "future",    daysLeft: 511, priority: "medium" },
];

const FILTERS = ["All", "Critical", "EU", "UK", "Global", "US"];

type DeadlineStatus = "urgent" | "upcoming" | "completed" | "future";

const STATUS_CONFIG: Record<DeadlineStatus, {
  color: "destructive" | "warning" | "default" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
}> = {
  urgent:    { color: "destructive", icon: AlertCircle,   bg: "bg-rose-50 border-l-4 border-rose-500" },
  upcoming:  { color: "warning",     icon: Clock,         bg: "bg-white" },
  completed: { color: "default",     icon: CheckCircle2,  bg: "bg-emerald-50/50" },
  future:    { color: "secondary",   icon: Calendar,      bg: "bg-white" },
};

export default function RegCalendarPage() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = DEADLINES.filter(d => {
    if (filter === "All") return true;
    if (filter === "Critical") return d.priority === "critical";
    return d.jurisdiction === filter;
  });

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Reg Calendar" subtitle="Global compliance deadlines" />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Urgent",        count: DEADLINES.filter(d => d.status === "urgent").length,                      color: "text-rose-600 bg-rose-50" },
          { label: "This Quarter",  count: DEADLINES.filter(d => d.daysLeft > 0 && d.daysLeft <= 90).length,         color: "text-amber-600 bg-amber-50" },
          { label: "Completed",     count: DEADLINES.filter(d => d.status === "completed").length,                   color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
            <p className="text-[22px] font-bold">{s.count}</p>
            <p className="text-[11px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Deadline list */}
      <div className="space-y-2">
        {filtered.map(d => {
          const cfg = STATUS_CONFIG[d.status as DeadlineStatus];
          const Icon = cfg.icon;
          return (
            <div
              key={d.id}
              className={`rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${cfg.bg}`}
              onClick={() => setExpanded(expanded === d.id ? null : d.id)}
            >
              <div className="flex items-center gap-3 p-4">
                <Icon className={`w-5 h-5 shrink-0 ${
                  d.status === "urgent" ? "text-rose-500" :
                  d.status === "completed" ? "text-emerald-500" : "text-slate-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-bold text-slate-900">{d.regulation}</span>
                    <Badge variant={cfg.color} className="text-[10px] py-0">{d.jurisdiction}</Badge>
                  </div>
                  <p className="text-[12px] text-slate-500 truncate">{d.description}</p>
                </div>
                <div className="text-right shrink-0">
                  {d.status !== "completed" && (
                    <p className={`text-[13px] font-bold ${
                      d.daysLeft <= 14 ? "text-rose-600" :
                      d.daysLeft <= 60 ? "text-amber-600" : "text-slate-600"
                    }`}>
                      {d.daysLeft}d
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">{d.deadline}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expanded === d.id ? "rotate-90" : ""}`} />
              </div>
              {expanded === d.id && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-2">{d.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[13px] font-semibold">
                      View Checklist
                    </button>
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-[13px] font-semibold">
                      Set Reminder
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
