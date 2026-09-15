"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // navigator.onLine doesn't exist during server rendering, so the
    // initial real value can only be read after mount — this is exactly
    // react.dev's documented pattern for syncing with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-danger-soft px-4 py-2 text-sm text-danger">
            <WifiOff size={16} aria-hidden="true" />
            You&apos;re offline — content won&apos;t update until your
            connection comes back.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
