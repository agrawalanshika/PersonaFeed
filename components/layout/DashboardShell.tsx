"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import { NAV_ITEMS } from "@/lib/nav";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <Sidebar variant="static" />

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-foreground/30"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="relative z-10 h-full w-64 shadow-xl"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="absolute right-3 top-4 rounded-md p-1.5 text-muted hover:bg-accent-soft/60"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <Sidebar variant="drawer" onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col">
        <Header title={title} onMenuClick={() => setDrawerOpen(true)} />
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
