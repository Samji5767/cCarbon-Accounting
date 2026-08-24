"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Factory, Sparkles, Users, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreSheet } from "./more-sheet";
import { haptics } from "@/lib/haptics";

const TABS = [
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Emissions",  href: "/emissions",  icon: Factory },
  { label: "AI Advisor", href: "/ai-advisor", icon: Sparkles },
  { label: "Team",       href: "/team",       icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const mainPaths = TABS.map((t) => t.href);
  const isMoreActive = !mainPaths.some((href) => pathname.startsWith(href));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-180 border-t border-slate-200/60 select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-[49px]">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => haptics.selectionChanged()}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150"
              >
                <Icon
                  className={cn("w-[26px] h-[26px]", active ? "text-emerald-500" : "text-slate-400")}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={cn("text-[10px] font-medium tracking-tight mt-0.5", active ? "text-emerald-500" : "text-slate-400")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => { haptics.selectionChanged(); setShowMore(true); }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150"
          >
            <Grid3x3
              className={cn("w-[26px] h-[26px]", isMoreActive ? "text-emerald-500" : "text-slate-400")}
              strokeWidth={isMoreActive ? 2.5 : 1.8}
            />
            <span className={cn("text-[10px] font-medium tracking-tight mt-0.5", isMoreActive ? "text-emerald-500" : "text-slate-400")}>
              More
            </span>
          </button>
        </div>
      </nav>

      {showMore && <MoreSheet onClose={() => setShowMore(false)} />}
    </>
  );
}
