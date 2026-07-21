"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight, LayoutDashboard, Factory, FileText, Target, Sparkles } from "lucide-react";
import Link from "next/link";

const SEARCH_INDEX = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Pages" },
  { label: "Emissions", href: "/emissions", icon: Factory, category: "Pages" },
  { label: "Reports", href: "/reports", icon: FileText, category: "Pages" },
  { label: "Targets", href: "/targets", icon: Target, category: "Pages" },
  { label: "AI Advisor", href: "/ai-advisor", icon: Sparkles, category: "Pages" },
  { label: "Scope 1 — Direct emissions", href: "/emissions", icon: Factory, category: "Data" },
  { label: "Scope 2 — Electricity", href: "/emissions", icon: Factory, category: "Data" },
  { label: "Scope 3 — Supply chain", href: "/scope3", icon: Factory, category: "Data" },
  { label: "Carbon budget runway", href: "/carbon-budget", icon: Target, category: "Data" },
  { label: "CSRD ESRS E1 disclosure", href: "/esrs-e1", icon: FileText, category: "Compliance" },
  { label: "CDP questionnaire", href: "/reports", icon: FileText, category: "Compliance" },
  { label: "SBTi target validation", href: "/targets", icon: Target, category: "Compliance" },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = query.length > 0
    ? SEARCH_INDEX.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_INDEX.slice(0, 6);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div
        className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/8 px-4 py-3 safe-area-top"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#3a3a3c] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, data, reports..."
            className="flex-1 text-[16px] text-slate-800 dark:text-white bg-transparent outline-none placeholder-slate-400"
          />
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
        {results.length > 0 ? (
          <div className="py-2">
            {results.map((item, i) => (
              <Link key={i} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-slate-800 dark:text-white">{item.label}</p>
                  <p className="text-[12px] text-slate-400">{item.category}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center px-4">
            <Search className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-[15px] font-medium text-slate-400">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-[13px] text-slate-300 dark:text-slate-600 mt-1">Try searching for pages, data, or reports</p>
          </div>
        )}
      </div>

      <div className="bg-black/20 flex-[0.5]" />
    </div>
  );
}
