"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "./global-search";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/emissions": "Emissions",
  "/facilities": "Facilities",
  "/factors": "Emission Factors",
  "/reports": "Reports",
  "/targets": "Targets",
  "/scope3": "Scope 3 Materiality",
  "/supplier-engagement": "Supplier Engagement",
  "/carbon-price": "Carbon Price (ICP)",
  "/verification": "Verification",
  "/scenario-analysis": "Scenario Analysis",
  "/offsets": "Offsets & Credits",
  "/double-materiality": "Double Materiality",
  "/consolidation": "Consolidation",
  "/carbon-budget": "Carbon Budget",
  "/audit-trail": "Audit Trail",
  "/deadlines": "Deadlines",
  "/benchmarks": "Benchmarks",
  "/report-generator": "Report Generator",
  "/esrs-e1": "ESRS E1 Disclosure",
  "/data-quality": "Data Quality",
  "/transition-plan": "Transition Plan",
  "/net-zero": "Net-Zero Pathway",
  "/sfdr": "SFDR / PAI",
  "/lca": "LCA / PCF",
  "/cbam": "CBAM Calculator",
  "/climate-risk": "Climate Risk",
  "/regulatory-navigator": "Regulatory Navigator",
  "/supply-chain": "Supply Chain Decarb.",
  "/nature-risk": "Nature & Biodiversity",
  "/executive-reporting": "Executive Reporting",
  "/pricing": "Pricing & Plans",
  "/market-intelligence": "Market Intelligence",
  "/settings": "Settings",
  "/ai-advisor": "AI Advisor",
  "/live-tracker": "Live Tracker",
  "/reg-calendar": "Regulatory Calendar",
  "/team": "Team",
  "/notifications": "Notifications",
  "/onboarding": "Setup",
};

export function Header() {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] ?? "cCarbon";
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-sm border-b border-slate-200/70 dark:border-white/8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-400 font-medium">cCarbon</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 dark:text-white font-semibold">{pageLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <Link
            href="/notifications"
            className="relative flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </Link>
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-bold text-white">
              A
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">Alex Admin</span>
          </div>
        </div>
      </header>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
