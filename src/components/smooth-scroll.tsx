"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Scroll suave global; respeta prefers-reduced-motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.8,
      anchors: { offset: -64 },
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
