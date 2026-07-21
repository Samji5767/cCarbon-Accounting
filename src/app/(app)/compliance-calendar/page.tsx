"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChevronLeft, ChevronRight, List, AlertTriangle, CheckCircle, Clock, Bell, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type EventStatus = "upcoming" | "overdue" | "complete" | "due-today";

interface ComplianceEvent {
  id: string;
  regulation: string;
  shortName: string;
  month: number;
  day: number;
  year: number;
  color: string;
  bgColor: string;
  category: string;
  description: string;
  documents: string[];
  status: EventStatus;
  daysRelative: number;
  framework: string;
}

// ── Events (relative to 2026-07-21) ─────────────────────────────────────────
// Positive = days until due; Negative = days overdue
const EVENTS: ComplianceEvent[] = [
  {
    id: "cbam-q1-2026",
    regulation: "CBAM Quarterly Report — Q1 2026",
    shortName: "CBAM Q1",
    month: 4, day: 30, year: 2026,
    color: "#f97316", bgColor: "#fff7ed",
    category: "EU Regulation",
    description: "Report embedded carbon in CBAM-covered goods imported in Q1 2026. Declarant must use CBAM Registry portal.",
    documents: ["CBAM declaration", "Embedded carbon calculation", "CN codes list", "Verification certificate"],
    status: "overdue",
    daysRelative: -82,
    framework: "EU CBAM Reg 2023/956",
  },
  {
    id: "csrd-fy2025",
    regulation: "CSRD / ESRS — FY2025 Annual Report",
    shortName: "CSRD FY25",
    month: 3, day: 31, year: 2026,
    color: "#6366f1", bgColor: "#eef2ff",
    category: "EU Regulation",
    description: "First-wave CSRD reporters (EU PIEs > 500 employees) must include ESRS-compliant sustainability statement in Annual Report for FY2025.",
    documents: ["ESRS E1-6 metrics", "Double materiality assessment", "Transition plan", "GHG verification statement"],
    status: "overdue",
    daysRelative: -112,
    framework: "CSRD 2022/2464",
  },
  {
    id: "eu-ets-surrender",
    regulation: "EU ETS — Annual Allowance Surrender",
    shortName: "EU ETS",
    month: 4, day: 30, year: 2026,
    color: "#ec4899", bgColor: "#fdf2f8",
    category: "EU ETS",
    description: "Surrender EU Allowances (EUAs) equal to verified 2025 emissions. Installations must ensure allowances are in the Operator Holding Account.",
    documents: ["Verified emission report", "EUA transfer confirmation", "Installation permit update"],
    status: "overdue",
    daysRelative: -82,
    framework: "EU ETS Directive 2003/87/EC",
  },
  {
    id: "cdp-2026",
    regulation: "CDP Climate — 2026 Disclosure",
    shortName: "CDP Climate",
    month: 7, day: 31, year: 2026,
    color: "#0ea5e9", bgColor: "#f0f9ff",
    category: "Voluntary Framework",
    description: "Submit 2026 CDP Climate questionnaire covering GHG inventory, risks, opportunities, strategy, and governance. Investor-facing.",
    documents: ["CDP Climate questionnaire", "GHG inventory (Scopes 1, 2, 3)", "TCFD alignment evidence", "SBTi commitment letter"],
    status: "upcoming",
    daysRelative: 10,
    framework: "CDP 2026 Questionnaire",
  },
  {
    id: "cbam-q2-2026",
    regulation: "CBAM Quarterly Report — Q2 2026",
    shortName: "CBAM Q2",
    month: 7, day: 31, year: 2026,
    color: "#f97316", bgColor: "#fff7ed",
    category: "EU Regulation",
    description: "Report embedded carbon in CBAM-covered goods imported in Q2 2026. Submit via CBAM Registry by 31 July 2026.",
    documents: ["CBAM Q2 declaration", "Embedded carbon data", "Importer of record details"],
    status: "upcoming",
    daysRelative: 10,
    framework: "EU CBAM Reg 2023/956",
  },
  {
    id: "uk-secr-interim",
    regulation: "UK SECR — Interim Energy Audit",
    shortName: "UK SECR Mid",
    month: 9, day: 30, year: 2026,
    color: "#10b981", bgColor: "#f0fdf4",
    category: "UK Regulation",
    description: "Prepare interim energy consumption data for UK SECR annual report. Mandatory for UK quoted companies, large unquoted companies and LLPs.",
    documents: ["Energy consumption data", "Intensity ratio calculation", "Energy efficiency actions"],
    status: "upcoming",
    daysRelative: 71,
    framework: "UK SECR 2018",
  },
  {
    id: "cbam-q3-2026",
    regulation: "CBAM Quarterly Report — Q3 2026",
    shortName: "CBAM Q3",
    month: 10, day: 31, year: 2026,
    color: "#f97316", bgColor: "#fff7ed",
    category: "EU Regulation",
    description: "Report embedded carbon in CBAM-covered goods imported in Q3 2026.",
    documents: ["CBAM Q3 declaration", "Embedded carbon data"],
    status: "upcoming",
    daysRelative: 102,
    framework: "EU CBAM Reg 2023/956",
  },
  {
    id: "sbti-progress-2026",
    regulation: "SBTi Annual Progress Disclosure",
    shortName: "SBTi Progress",
    month: 12, day: 1, year: 2026,
    color: "#8b5cf6", bgColor: "#f5f3ff",
    category: "Voluntary Framework",
    description: "Publish annual progress report against SBTi near-term targets. Required for all companies with validated SBTi targets.",
    documents: ["Progress vs target table", "GHG inventory reconciliation", "Methodology disclosures"],
    status: "upcoming",
    daysRelative: 133,
    framework: "SBTi Corporate Standard",
  },
  {
    id: "uk-secr-2026",
    regulation: "UK SECR — Annual Filing (FY2026)",
    shortName: "UK SECR",
    month: 12, day: 31, year: 2026,
    color: "#10b981", bgColor: "#f0fdf4",
    category: "UK Regulation",
    description: "File annual SECR disclosure in Directors' Report for FY2026, covering energy use, GHG emissions, energy efficiency actions, and intensity ratio.",
    documents: ["UK SECR Directors' Report section", "Scope 1+2 GHG inventory", "Energy consumption by type", "Intensity ratio", "Methodology statement"],
    status: "upcoming",
    daysRelative: 163,
    framework: "UK SECR 2018",
  },
  {
    id: "cbam-q4-2026",
    regulation: "CBAM Quarterly Report — Q4 2026",
    shortName: "CBAM Q4",
    month: 1, day: 31, year: 2027,
    color: "#f97316", bgColor: "#fff7ed",
    category: "EU Regulation",
    description: "Report embedded carbon in CBAM-covered goods imported in Q4 2026.",
    documents: ["CBAM Q4 declaration", "Embedded carbon data", "Annual summary"],
    status: "upcoming",
    daysRelative: 194,
    framework: "EU CBAM Reg 2023/956",
  },
  {
    id: "tcfd-2027",
    regulation: "TCFD Annual Disclosure (FY2026)",
    shortName: "TCFD 2027",
    month: 3, day: 31, year: 2027,
    color: "#3b82f6", bgColor: "#eff6ff",
    category: "Voluntary Framework",
    description: "Publish TCFD-aligned climate-related financial disclosures covering governance, strategy, risk management, and metrics & targets.",
    documents: ["TCFD report", "Scenario analysis results", "Physical risk assessment", "Transition risk quantification"],
    status: "upcoming",
    daysRelative: 253,
    framework: "TCFD 2017 Recommendations",
  },
];

const STATUS_CONFIG: Record<EventStatus, { label: string; icon: React.ReactNode; color: string; border: string }> = {
  upcoming:   { label: "Upcoming",   icon: <Clock className="w-3.5 h-3.5" />,         color: "text-blue-700 bg-blue-50",    border: "border-blue-200"   },
  "due-today":{ label: "Due Today",  icon: <Bell className="w-3.5 h-3.5" />,          color: "text-amber-700 bg-amber-50",  border: "border-amber-200"  },
  overdue:    { label: "Overdue",    icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-rose-700 bg-rose-50",    border: "border-rose-200"   },
  complete:   { label: "Complete",   icon: <CheckCircle className="w-3.5 h-3.5" />,   color: "text-emerald-700 bg-emerald-50",border: "border-emerald-200" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const DOW_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function daysInMonth(m: number, y: number): number {
  if (m === 2) return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28;
  return DAYS_IN_MONTH[m - 1];
}

// Day of week: 0=Sun, 1=Mon, …, 6=Sat → convert to Mon=0
function startDow(m: number, y: number): number {
  const d = new Date(y, m - 1, 1).getDay();
  return (d + 6) % 7; // rotate so Mon=0
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ComplianceCalendarPage() {
  const [viewMonth, setViewMonth] = useState(7);   // July 2026 (today's month)
  const [viewYear,  setViewYear]  = useState(2026);
  const [viewMode, setViewMode]   = useState<"calendar" | "list">("calendar");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<ComplianceEvent | null>(null);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const eventsForMonth = EVENTS.filter(e => e.month === viewMonth && e.year === viewYear);

  const eventsForDay = (day: number): ComplianceEvent[] =>
    eventsForMonth.filter(e => e.day === day);

  // List view: all events sorted by daysRelative
  const listEvents = [...EVENTS]
    .filter(e => filterStatus === "all" || e.status === filterStatus)
    .sort((a, b) => a.daysRelative - b.daysRelative);

  const totalDays = daysInMonth(viewMonth, viewYear);
  const firstDow  = startDow(viewMonth, viewYear);

  // Calendar grid cells
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // Summary counts
  const upcoming = EVENTS.filter(e => e.status === "upcoming").length;
  const overdue  = EVENTS.filter(e => e.status === "overdue").length;

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compliance Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {overdue > 0 && <span className="text-rose-600 font-medium">{overdue} overdue · </span>}
            {upcoming} upcoming · CDP, CBAM, CSRD, UK SECR, SBTi, TCFD
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
            {(["calendar", "list"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={cn("px-3 py-1.5 capitalize font-medium transition-colors flex items-center gap-1.5",
                  viewMode === v ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-50")}>
                {v === "calendar" ? <CalendarDays className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Deadlines",   value: EVENTS.length,                                                icon: <CalendarDays className="w-4 h-4 text-slate-400" />,      color: "text-slate-900" },
          { label: "Upcoming",          value: upcoming,                                                      icon: <Clock className="w-4 h-4 text-blue-500" />,              color: "text-blue-700"  },
          { label: "Overdue",           value: overdue,                                                       icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,      color: "text-rose-700"  },
          { label: "Due This Month",    value: EVENTS.filter(e => e.month === 7 && e.year === 2026).length,  icon: <Bell className="w-4 h-4 text-amber-500" />,              color: "text-amber-700" },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              {icon}
              <div>
                <p className={cn("text-xl font-bold", color)}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <CardTitle className="text-base">
                {MONTHS[viewMonth - 1]} {viewYear}
              </CardTitle>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day of week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DOW_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, idx) => {
                const dayEvents = day ? eventsForDay(day) : [];
                const isToday   = day === 21 && viewMonth === 7 && viewYear === 2026;
                return (
                  <div key={idx}
                    className={cn(
                      "min-h-[48px] md:min-h-[64px] rounded-lg p-1 transition-colors relative",
                      day ? "cursor-pointer" : "cursor-default",
                      isToday ? "bg-emerald-50 ring-1 ring-emerald-300" :
                      day ? dayEvents.some(e => e.status === "overdue") ? "bg-rose-50 hover:bg-rose-100" :
                            dayEvents.length > 0 ? "bg-blue-50 hover:bg-blue-100" :
                            "hover:bg-slate-50" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => {
                      if (dayEvents.length === 1) setSelectedEvent(e => e?.id === dayEvents[0].id ? null : dayEvents[0]);
                      else if (dayEvents.length > 1) setSelectedEvent(e => e?.month === viewMonth && e?.day === day ? null : dayEvents[0]);
                    }}
                  >
                    {day && (
                      <>
                        <span className={cn("text-xs font-medium", isToday ? "text-emerald-600 font-bold" : "text-slate-600")}>{day}</span>
                        <div className="mt-0.5 space-y-0.5">
                          {dayEvents.slice(0, 2).map(e => (
                            <div key={e.id} className="text-[8px] md:text-[9px] font-medium px-1 py-0.5 rounded truncate"
                              style={{ backgroundColor: e.bgColor, color: e.color }}>
                              {e.shortName}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[8px] text-slate-400 px-1">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Month events list */}
            {eventsForMonth.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This month — {MONTHS[viewMonth - 1]} {viewYear}</p>
                {eventsForMonth.map(e => {
                  const cfg = STATUS_CONFIG[e.status];
                  return (
                    <button key={e.id} onClick={() => setSelectedEvent(ev => ev?.id === e.id ? null : e)}
                      className={cn("w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all",
                        selectedEvent?.id === e.id ? "ring-2 ring-emerald-400" : "",
                        cfg.border, cfg.color.includes("rose") ? "bg-rose-50" : cfg.color.includes("blue") ? "bg-blue-50" : cfg.color.includes("amber") ? "bg-amber-50" : "bg-emerald-50")}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ backgroundColor: e.bgColor, color: e.color }}>
                        {e.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{e.regulation}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{e.category} · {e.framework}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={cn("flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium", cfg.color)}>
                            {cfg.icon} {cfg.label}
                          </span>
                          {e.daysRelative > 0
                            ? <span className="text-xs text-slate-400">· {e.daysRelative} days away</span>
                            : e.daysRelative < 0
                            ? <span className="text-xs text-rose-500 font-medium">· {Math.abs(e.daysRelative)} days overdue</span>
                            : <span className="text-xs text-amber-600 font-bold">· Due today!</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {eventsForMonth.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">No compliance deadlines this month</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm">All Deadlines</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {(["all", "overdue", "upcoming", "complete"] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={cn("text-xs px-2.5 py-1 rounded-full capitalize transition-colors border",
                      filterStatus === s ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <CardDescription className="text-xs">{listEvents.length} deadline{listEvents.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {listEvents.map(e => {
              const cfg = STATUS_CONFIG[e.status];
              const isSelected = selectedEvent?.id === e.id;
              return (
                <div key={e.id}>
                  <button onClick={() => setSelectedEvent(ev => ev?.id === e.id ? null : e)}
                    className={cn("w-full text-left p-3 rounded-xl border transition-all",
                      isSelected ? "ring-2 ring-emerald-400 border-emerald-300" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-xs font-bold"
                        style={{ backgroundColor: e.bgColor, color: e.color }}>
                        <span className="text-[10px] font-normal">{MONTHS[e.month - 1]}</span>
                        <span className="text-base leading-tight">{e.day}</span>
                        <span className="text-[10px] font-normal">{e.year}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{e.regulation}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{e.category} · {e.framework}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={cn("flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium", cfg.color)}>
                            {cfg.icon} {cfg.label}
                          </span>
                          {e.daysRelative > 0
                            ? <span className="text-xs text-slate-400">{e.daysRelative}d to go</span>
                            : e.daysRelative < 0
                            ? <span className="text-xs text-rose-500 font-semibold">{Math.abs(e.daysRelative)}d overdue</span>
                            : <span className="text-xs text-amber-700 font-bold">Due today</span>}
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{e.documents.length} docs required</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  {isSelected && (
                    <div className="mt-1 mx-1 p-3 bg-slate-50 rounded-b-xl border border-t-0 border-slate-200 space-y-2">
                      <p className="text-xs text-slate-700">{e.description}</p>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Required Documents</p>
                        <div className="space-y-1">
                          {e.documents.map((doc, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <FileText className="w-3 h-3 text-slate-400 shrink-0" /> {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Event detail modal (calendar view) */}
      {selectedEvent && viewMode === "calendar" && !eventsForMonth.find(e => e.id === selectedEvent.id) && (
        <Card className="border-2" style={{ borderColor: selectedEvent.color }}>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{selectedEvent.regulation}</p>
                <p className="text-sm text-slate-500">{selectedEvent.framework}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 text-sm shrink-0">✕</button>
            </div>
            <p className="text-sm text-slate-700">{selectedEvent.description}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge className={cn("text-xs", STATUS_CONFIG[selectedEvent.status].color)}>
                {selectedEvent.status}
              </Badge>
              <Badge className="text-xs bg-slate-100 text-slate-600">{selectedEvent.category}</Badge>
              <Badge className="text-xs bg-slate-100 text-slate-600">
                Due {MONTHS[selectedEvent.month - 1]} {selectedEvent.day}, {selectedEvent.year}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedEvent.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" /> {doc}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regulatory legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Regulatory Framework Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: "CDP",      desc: "Voluntary investor disclosure",               color: "#0ea5e9" },
              { name: "CBAM",     desc: "EU Carbon Border Adjustment Mechanism",       color: "#f97316" },
              { name: "CSRD/ESRS",desc: "EU Sustainability Reporting Directive",       color: "#6366f1" },
              { name: "UK SECR",  desc: "Streamlined Energy & Carbon Reporting",       color: "#10b981" },
              { name: "SBTi",     desc: "Science Based Targets initiative",            color: "#8b5cf6" },
              { name: "TCFD",     desc: "Task Force on Climate-related Disclosures",   color: "#3b82f6" },
            ].map(({ name, desc, color }) => (
              <div key={name} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
