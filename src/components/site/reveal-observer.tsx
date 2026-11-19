"use client";

import { useEffect } from "react";

/**
 * Marca con [data-shown] los elementos [data-reveal-root] y [data-reveal]
 * sueltos cuando entran al viewport. Las transiciones viven en globals.css.
 */
export function RevealObserver() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-root], [data-reveal]")
    ).filter((el) => el.matches("[data-reveal-root]") || !el.closest("[data-reveal-root]"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));

    // Las animaciones infinitas (brillos, pelota del SVG…) se pausan fuera de pantalla:
    // las de SVG corren en el hilo principal y repintaban en cada frame aunque no se vieran.
    const offscreen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
      },
      { rootMargin: "200px 0px" }
    );
    document.querySelectorAll("main > section").forEach((el) => offscreen.observe(el));

    return () => {
      io.disconnect();
      offscreen.disconnect();
    };
  }, []);

  return (
    <noscript>
      <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;stroke-dashoffset:0!important}[data-media]{scale:1.12!important}`}</style>
    </noscript>
  );
}
