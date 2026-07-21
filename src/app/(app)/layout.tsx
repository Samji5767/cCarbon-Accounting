"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div
      className="flex h-full min-h-screen bg-slate-50"
      style={isMobile ? { paddingTop: "env(safe-area-inset-top)" } : {}}
    >
      {!isMobile && <Sidebar />}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {!isMobile && <Header />}
        <main
          className="flex-1 overflow-auto"
          style={
            isMobile
              ? { paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }
              : {}
          }
        >
          {children}
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
