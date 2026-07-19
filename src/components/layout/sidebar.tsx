"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Factory,
  FileText,
  Target,
  Building2,
  Database,
  Settings,
  Leaf,
  ChevronRight,
  DollarSign,
  GitBranch,
  ShieldCheck,
  CalendarClock,
  BarChart3,
  History,
  TrendingDown,
  Leaf as LeafIcon,
  Grid3x3,
  Network,
  FlaskConical,
  Users,
  PrinterCheck,
  Table2,
  Activity,
  Route,
  Milestone,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Emissions", href: "/emissions", icon: Factory },
      { label: "Facilities", href: "/facilities", icon: Building2 },
      { label: "Emission Factors", href: "/factors", icon: Database },
    ],
  },
  {
    label: "Reporting",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Targets", href: "/targets", icon: Target },
      { label: "Scope 3 Materiality", href: "/scope3", icon: GitBranch },
      { label: "Supplier Engagement", href: "/supplier-engagement", icon: Users },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Carbon Price (ICP)", href: "/carbon-price", icon: DollarSign },
      { label: "Verification", href: "/verification", icon: ShieldCheck },
      { label: "Scenario Analysis", href: "/scenario-analysis", icon: TrendingDown },
      { label: "Offsets & Credits", href: "/offsets", icon: LeafIcon },
      { label: "Double Materiality", href: "/double-materiality", icon: Grid3x3 },
      { label: "Consolidation", href: "/consolidation", icon: Network },
      { label: "Carbon Budget", href: "/carbon-budget", icon: FlaskConical },
      { label: "Audit Trail", href: "/audit-trail", icon: History },
      { label: "Deadlines", href: "/deadlines", icon: CalendarClock },
      { label: "Benchmarks", href: "/benchmarks", icon: BarChart3 },
      { label: "Report Generator", href: "/report-generator", icon: PrinterCheck },
      { label: "ESRS E1 Disclosure", href: "/esrs-e1", icon: Table2 },
      { label: "Data Quality", href: "/data-quality", icon: Activity },
      { label: "Transition Plan", href: "/transition-plan", icon: Route },
      { label: "Net-Zero Pathway", href: "/net-zero", icon: Milestone },
      { label: "SFDR / PAI", href: "/sfdr", icon: Globe2 },
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

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">cCarbon</p>
          <p className="text-gray-400 text-xs">GHG Accounting</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-emerald-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Regulatory Frameworks banner */}
      <div className="mx-3 mb-4 p-3 rounded-lg bg-emerald-900/50 border border-emerald-700">
        <p className="text-xs font-semibold text-emerald-300 mb-1">Frameworks</p>
        <div className="flex flex-wrap gap-1">
          {["GHG Protocol", "ISO 14064", "TCFD", "CSRD", "CDP"].map((f) => (
            <span key={f} className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-sm font-bold">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Alex Admin</p>
          <p className="text-xs text-gray-400 truncate">admin@acme.com</p>
        </div>
      </div>
    </aside>
  );
}
