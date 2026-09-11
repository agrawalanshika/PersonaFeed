"use client";

import { useEffect, useRef } from "react";

type LoadMoreSentinelProps = {
  onIntersect: () => void;
  enabled: boolean;
};

export default function LoadMoreSentinel({
  onIntersect,
  enabled,
}: LoadMoreSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: "200px" }, // start loading slightly before it's visible
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return <div ref={ref} aria-hidden="true" className="h-1" />;
}
