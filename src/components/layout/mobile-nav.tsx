"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Factory, FileText, Target, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreSheet } from "./more-sheet";

const TABS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Emissions",  href: "/emissions",  icon: Factory },
  { label: "Reports",   href: "/reports",    icon: FileText },
  { label: "Targets",   href: "/targets",    icon: Target },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const mainPaths = TABS.map((t) => t.href);
  const isMoreActive = !mainPaths.some((href) => pathname.startsWith(href));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] border-t border-white/[0.08] select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-14">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-1"
              >
                <Icon className={cn("w-5 h-5", active ? "text-emerald-400" : "text-white/40")} />
                <span className={cn("text-[10px] font-medium", active ? "text-emerald-400" : "text-white/40")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <Grid3x3 className={cn("w-5 h-5", isMoreActive ? "text-emerald-400" : "text-white/40")} />
            <span className={cn("text-[10px] font-medium", isMoreActive ? "text-emerald-400" : "text-white/40")}>
              More
            </span>
          </button>
        </div>
      </nav>

      {showMore && <MoreSheet onClose={() => setShowMore(false)} />}
    </>
  );
}
