"use client";

import { useRouter } from "next/navigation";
import {
  X, Building2, Database, GitBranch, Users, DollarSign, ShieldCheck,
  TrendingDown, Leaf, Grid3x3, Network, FlaskConical, History,
  CalendarClock, BarChart3, PrinterCheck, Table2, Activity, Route,
  Milestone, Globe2, Microscope, Scale, ShieldAlert, MapPin, Link2,
  TreePine, PresentationIcon, CreditCard, LineChart, Settings,
  Calculator, Bot, BookOpen, Map, Sliders, CalendarDays, FileText, Target,
} from "lucide-react";

const MORE_ITEMS = [
  { label: "Reports",      href: "/reports",             icon: FileText },
  { label: "Targets",      href: "/targets",             icon: Target },
  { label: "Live Tracker", href: "/live-tracker",        icon: Activity },
  { label: "Reg Calendar", href: "/reg-calendar",        icon: CalendarClock },
  { label: "Facilities",   href: "/facilities",          icon: Building2 },
  { label: "Factors",      href: "/factors",             icon: Database },
  { label: "Scope 3",      href: "/scope3",              icon: GitBranch },
  { label: "Suppliers",    href: "/supplier-engagement", icon: Users },
  { label: "Carbon Price", href: "/carbon-price",        icon: DollarSign },
  { label: "Verification", href: "/verification",        icon: ShieldCheck },
  { label: "Scenarios",    href: "/scenario-analysis",   icon: TrendingDown },
  { label: "Offsets",      href: "/offsets",             icon: Leaf },
  { label: "Materiality",  href: "/double-materiality",  icon: Grid3x3 },
  { label: "Consolidation",href: "/consolidation",       icon: Network },
  { label: "Carbon Budget",href: "/carbon-budget",       icon: FlaskConical },
  { label: "Audit Trail",  href: "/audit-trail",         icon: History },
  { label: "Deadlines",    href: "/deadlines",           icon: CalendarClock },
  { label: "Benchmarks",   href: "/benchmarks",          icon: BarChart3 },
  { label: "Report Gen.",  href: "/report-generator",    icon: PrinterCheck },
  { label: "ESRS E1",      href: "/esrs-e1",             icon: Table2 },
  { label: "Data Quality", href: "/data-quality",        icon: Activity },
  { label: "Transition",   href: "/transition-plan",     icon: Route },
  { label: "Net-Zero",     href: "/net-zero",            icon: Milestone },
  { label: "SFDR / PAI",   href: "/sfdr",                icon: Globe2 },
  { label: "LCA / PCF",    href: "/lca",                 icon: Microscope },
  { label: "CBAM",         href: "/cbam",                icon: Scale },
  { label: "Climate Risk", href: "/climate-risk",        icon: ShieldAlert },
  { label: "Regulatory",   href: "/regulatory-navigator",icon: MapPin },
  { label: "Supply Chain", href: "/supply-chain",        icon: Link2 },
  { label: "Nature",       href: "/nature-risk",         icon: TreePine },
  { label: "Executive",    href: "/executive-reporting", icon: PresentationIcon },
  { label: "Pricing",      href: "/pricing",             icon: CreditCard },
  { label: "Market Intel.",href: "/market-intelligence", icon: LineChart },
  { label: "Calculator",   href: "/calculator",          icon: Calculator },
  { label: "AI Advisor",   href: "/ai-advisor",          icon: Bot },
  { label: "Factor Lib.",  href: "/factor-library",      icon: BookOpen },
  { label: "Supply Map",   href: "/supply-chain-map",    icon: Map },
  { label: "Net Zero Plan",href: "/net-zero-planner",    icon: Sliders },
  { label: "Cal. Calendar",href: "/compliance-calendar", icon: CalendarDays },
  { label: "Settings",     href: "/settings",            icon: Settings },
];

interface MoreSheetProps {
  onClose: () => void;
}

export function MoreSheet({ onClose }: MoreSheetProps) {
  const router = useRouter();

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative bg-[#0b1120] rounded-t-2xl overflow-hidden more-sheet-enter"
        style={{ maxHeight: "85vh", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.08]">
          <h2 className="text-white font-semibold text-base">All Features</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable grid */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 64px)" }}>
          <div className="grid grid-cols-4 gap-3">
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.05] active:bg-white/[0.12] transition-colors"
                >
                  <Icon className="w-5 h-5 text-white/70" />
                  <span className="text-[10px] text-white/60 text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
