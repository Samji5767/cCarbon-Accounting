"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight } from "lucide-react";

const TEAM_MEMBERS = [
  { id: 1, name: "Alex Admin",   role: "Sustainability Director", avatar: "A", status: "online",  tasksOpen: 3, color: "from-emerald-500 to-teal-600" },
  { id: 2, name: "Sarah Chen",   role: "Data Analyst",            avatar: "S", status: "online",  tasksOpen: 7, color: "from-violet-500 to-purple-600" },
  { id: 3, name: "Marcus Webb",  role: "Scope 3 Lead",            avatar: "M", status: "away",    tasksOpen: 2, color: "from-orange-500 to-red-500" },
  { id: 4, name: "Priya Nair",   role: "Finance Controller",      avatar: "P", status: "offline", tasksOpen: 5, color: "from-sky-500 to-blue-600" },
  { id: 5, name: "Tom Bradley",  role: "Facilities Manager",      avatar: "T", status: "online",  tasksOpen: 4, color: "from-rose-500 to-pink-600" },
];

const TASKS = [
  { id: 1, title: "Collect Q4 utility bills from all sites",                    assignee: "Tom Bradley",  dueDate: "Jan 31", priority: "high",     status: "in-progress", tag: "Scope 2" },
  { id: 2, title: "Validate Scope 3 Category 1 data from top 10 suppliers",     assignee: "Marcus Webb",  dueDate: "Feb 7",  priority: "high",     status: "in-progress", tag: "Scope 3" },
  { id: 3, title: "Prepare CSRD ESRS E1 disclosure draft",                      assignee: "Alex Admin",   dueDate: "Jan 25", priority: "critical", status: "overdue",     tag: "CSRD" },
  { id: 4, title: "Run third-party verification audit scheduling",               assignee: "Sarah Chen",   dueDate: "Mar 1",  priority: "medium",   status: "todo",        tag: "Verification" },
  { id: 5, title: "Update emission factors to DEFRA 2024 version",              assignee: "Sarah Chen",   dueDate: "Jan 28", priority: "high",     status: "todo",        tag: "Data" },
  { id: 6, title: "Board sustainability report — Q3 review",                    assignee: "Priya Nair",   dueDate: "Feb 14", priority: "medium",   status: "completed",   tag: "Reporting" },
];

const ACTIVITY = [
  { user: "Sarah Chen",  action: "updated emission factors for Category 11 business travel",  time: "2m ago",  avatar: "S", color: "from-violet-500 to-purple-600" },
  { user: "Marcus Webb", action: "added 3 new supplier responses to Scope 3 tracker",          time: "18m ago", avatar: "M", color: "from-orange-500 to-red-500" },
  { user: "Tom Bradley", action: "uploaded Manchester site Q4 energy bills",                   time: "1h ago",  avatar: "T", color: "from-rose-500 to-pink-600" },
  { user: "Alex Admin",  action: "approved FY2024 emissions inventory baseline",               time: "3h ago",  avatar: "A", color: "from-emerald-500 to-teal-600" },
];

type TaskStatus = "in-progress" | "overdue" | "todo" | "completed";
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: "info" | "destructive" | "secondary" | "default" }> = {
  "in-progress": { label: "In Progress", color: "info" },
  "overdue":     { label: "Overdue",     color: "destructive" },
  "todo":        { label: "To Do",       color: "secondary" },
  "completed":   { label: "Done",        color: "default" },
};

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<"tasks" | "team" | "activity">("tasks");

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Team" subtitle="5 members · 12 active tasks" />

      {/* iOS-style segmented tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {(["tasks", "team", "activity"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-[9px] text-[13px] font-semibold capitalize transition-all ${
              activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "tasks" && (
        <div className="space-y-2">
          {TASKS.map(task => (
            <Card key={task.id} className={`p-4 ${task.status === "completed" ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                  task.status === "completed" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium text-slate-800 ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500">{task.assignee}</span>
                    <span className="text-[11px] text-slate-300">·</span>
                    <span className={`text-[11px] font-medium ${task.status === "overdue" ? "text-rose-500" : "text-slate-500"}`}>
                      Due {task.dueDate}
                    </span>
                    <Badge
                      variant={STATUS_CONFIG[task.status as TaskStatus].color}
                      className="text-[10px] py-0"
                    >
                      {task.tag}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <button className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-emerald-600 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-2">
          {TEAM_MEMBERS.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold`}>
                    {m.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    m.status === "online" ? "bg-emerald-500" : m.status === "away" ? "bg-amber-400" : "bg-slate-300"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-900">{m.name}</p>
                  <p className="text-[12px] text-slate-500">{m.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-slate-700">{m.tasksOpen}</p>
                  <p className="text-[10px] text-slate-400">open tasks</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-3">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>
                {a.avatar}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-[13px] text-slate-800">
                  <span className="font-semibold">{a.user}</span> {a.action}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
