"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Factory, FileText, Target, Building2, Database, Settings, Leaf,
  ChevronRight, DollarSign, GitBranch, ShieldCheck, CalendarClock, BarChart3,
  History, TrendingDown, Grid3x3, Network, FlaskConical, Users, PrinterCheck,
  Table2, Activity, Route, Milestone, Globe2, Microscope, Scale, ShieldAlert,
  MapPin, Link2, TreePine, PresentationIcon, CreditCard, LineChart, PanelLeftClose,
  PanelLeftOpen, Calculator, Bot, BookOpen, Map, Sliders, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Core",
    items: [
      { label: "Dashboard",       href: "/dashboard",  icon: LayoutDashboard },
      { label: "Emissions",       href: "/emissions",  icon: Factory },
      { label: "Facilities",      href: "/facilities", icon: Building2 },
      { label: "Emission Factors",href: "/factors",    icon: Database },
    ],
  },
  {
    label: "Reporting",
    items: [
      { label: "Reports",             href: "/reports",             icon: FileText },
      { label: "Targets",             href: "/targets",             icon: Target },
      { label: "Scope 3 Materiality", href: "/scope3",              icon: GitBranch },
      { label: "Supplier Engagement", href: "/supplier-engagement", icon: Users },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Carbon Price (ICP)",    href: "/carbon-price",          icon: DollarSign },
      { label: "Verification",          href: "/verification",          icon: ShieldCheck },
      { label: "Scenario Analysis",     href: "/scenario-analysis",     icon: TrendingDown },
      { label: "Offsets & Credits",     href: "/offsets",               icon: Leaf },
      { label: "Double Materiality",    href: "/double-materiality",    icon: Grid3x3 },
      { label: "Consolidation",         href: "/consolidation",         icon: Network },
      { label: "Carbon Budget",         href: "/carbon-budget",         icon: FlaskConical },
      { label: "Audit Trail",           href: "/audit-trail",           icon: History },
      { label: "Deadlines",             href: "/deadlines",             icon: CalendarClock },
      { label: "Benchmarks",            href: "/benchmarks",            icon: BarChart3 },
      { label: "Report Generator",      href: "/report-generator",      icon: PrinterCheck },
      { label: "ESRS E1 Disclosure",    href: "/esrs-e1",               icon: Table2 },
      { label: "Data Quality",          href: "/data-quality",          icon: Activity },
      { label: "Transition Plan",       href: "/transition-plan",       icon: Route },
      { label: "Net-Zero Pathway",      href: "/net-zero",              icon: Milestone },
      { label: "SFDR / PAI",            href: "/sfdr",                  icon: Globe2 },
      { label: "LCA / PCF",             href: "/lca",                   icon: Microscope },
      { label: "CBAM Calculator",       href: "/cbam",                  icon: Scale },
      { label: "Climate Risk",          href: "/climate-risk",          icon: ShieldAlert },
      { label: "Regulatory Navigator",  href: "/regulatory-navigator",  icon: MapPin },
      { label: "Supply Chain Decarb.",  href: "/supply-chain",          icon: Link2 },
      { label: "Nature & Biodiversity", href: "/nature-risk",           icon: TreePine },
      { label: "Executive Reporting",   href: "/executive-reporting",   icon: PresentationIcon },
      { label: "Pricing & Plans",       href: "/pricing",               icon: CreditCard },
      { label: "Market Intelligence",   href: "/market-intelligence",   icon: LineChart },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Footprint Calculator", href: "/calculator",          icon: Calculator },
      { label: "AI Advisor",           href: "/ai-advisor",          icon: Bot },
      { label: "Factor Library",       href: "/factor-library",      icon: BookOpen },
      { label: "Supply Chain Map",     href: "/supply-chain-map",    icon: Map },
      { label: "Net Zero Planner",     href: "/net-zero-planner",    icon: Sliders },
      { label: "Compliance Calendar",  href: "/compliance-calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col min-h-screen transition-all duration-300 select-none",
        "bg-[#0b1120] text-white",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/8",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-900/40">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              cCarbon
            </p>
            <p className="text-white/40 text-[10px]">GHG Accounting</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 py-4 overflow-y-auto sidebar-scroll",
        collapsed ? "px-1 space-y-1" : "px-3 space-y-5"
      )}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                      collapsed ? "justify-center p-2 mx-auto w-10 h-10" : "px-3 py-2",
                      active
                        ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_2px_0_0_0_#10b981]"
                        : "text-white/50 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {active && <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-emerald-400" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Frameworks banner */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
          <p className="text-[10px] font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">Frameworks</p>
          <div className="flex flex-wrap gap-1">
            {["GHG Protocol", "ISO 14064", "TCFD", "CSRD", "CDP"].map((f) => (
              <span key={f} className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded-md">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* User row */}
      {!collapsed && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/8">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white/90">Alex Admin</p>
            <p className="text-[11px] text-white/35 truncate">admin@acme.com</p>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 border-t border-white/8 text-white/40 hover:text-white/70 transition-colors text-xs",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : (
          <>
            <PanelLeftClose className="w-4 h-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
