"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AlertCircle, CheckCircle2, Info, TrendingUp, Calendar, Users } from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, type: "urgent", icon: AlertCircle, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40", title: "CSRD deadline in 12 days", body: "ESRS E1 disclosure due Jan 31. 3 sections still incomplete.", time: "2m ago", unread: true, category: "Compliance" },
  { id: 2, type: "alert", icon: TrendingUp, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40", title: "Scope 2 emissions spike detected", body: "Manchester site consumed 34% more electricity than last week. Possible HVAC fault.", time: "1h ago", unread: true, category: "Emissions" },
  { id: 3, type: "info", icon: Users, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/40", title: "Marcus Webb completed Scope 3 data entry", body: "Category 1 — Purchased goods. 847 tCO₂e logged for Q4 2024.", time: "3h ago", unread: true, category: "Team" },
  { id: 4, type: "success", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40", title: "SBTi target validated ✅", body: "Your near-term 42% reduction target by 2030 has been validated by SBTi.", time: "Yesterday", unread: false, category: "Milestones" },
  { id: 5, type: "info", icon: Calendar, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/40", title: "CDP questionnaire opens in 30 days", body: "Start preparing your CDP Climate Change response. 127 questions mapped to your existing data.", time: "Yesterday", unread: false, category: "Compliance" },
  { id: 6, type: "info", icon: Info, color: "text-slate-500 bg-slate-50 dark:bg-slate-800/60", title: "New DEFRA 2024 emission factors available", body: "Update your electricity factors to improve data accuracy. Affects 12 emission entries.", time: "2 days ago", unread: false, category: "Data" },
  { id: 7, type: "success", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40", title: "Monthly report generated", body: "December 2024 GHG summary report is ready. Total: 1,087 tCO₂e (↓6.2% vs Nov).", time: "3 days ago", unread: false, category: "Reports" },
  { id: 8, type: "alert", icon: AlertCircle, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40", title: "Supplier data gap — 6 missing responses", body: "6 Tier 1 suppliers have not submitted emissions data for Q4. Follow-up required.", time: "4 days ago", unread: false, category: "Scope 3" },
];

const CATEGORIES = ["All", "Compliance", "Emissions", "Team", "Reports", "Data"];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [read, setRead] = useState<number[]>([]);

  const visible = NOTIFICATIONS.filter(n => filter === "All" || n.category === filter);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread && !read.includes(n.id)).length;

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} />

      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${filter === c ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-[#2c2c2e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => setRead(NOTIFICATIONS.map(n => n.id))}
          className="shrink-0 text-[12px] text-[#007AFF] font-medium ml-2">Mark all read</button>
      </div>

      <div className="space-y-2">
        {visible.map(n => {
          const isUnread = n.unread && !read.includes(n.id);
          return (
            <div key={n.id} onClick={() => setRead(p => [...p, n.id])}
              className={`flex gap-3 p-4 rounded-2xl transition-all cursor-pointer ${isUnread ? "bg-white dark:bg-[#2c2c2e] shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "bg-white/60 dark:bg-[#2c2c2e]/60"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[14px] leading-snug ${isUnread ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                    {n.title}
                  </p>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0 mt-1.5" />}
                </div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
