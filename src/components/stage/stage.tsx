"use client";

import dynamic from "next/dynamic";
import { RESERVA_URL } from "@/lib/site";

const Scene = dynamic(() => import("./scene"), { ssr: false });

/**
 * Capa 3D fija sobre la página (sin eventos) + el enlace accesible que
 * acompaña a la pelota "Reserva tu cancha" por toda la página.
 *
 * Alto fijo de 100vh (= viewport grande en móvil): así el canvas no cambia de
 * tamaño cuando la barra del navegador aparece o se oculta al hacer scroll.
 */
export function Stage() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-40 h-screen">
        <Scene />
      </div>
      <a
        data-stage="ball-link"
        href={RESERVA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reserva tu cancha por WhatsApp"
        className="ball-link group fixed left-0 top-0 z-[45] hidden rounded-full outline-none focus-visible:ring-4 focus-visible:ring-white/80 in-data-[webgl=ready]:block"
        style={{ width: 0, height: 0 }}
      >
        <span
          className="ball-label pointer-events-none absolute top-1/2 whitespace-nowrap rounded-full bg-navy-deep px-3.5 py-1.5 text-sm font-bold text-white shadow-[0_8px_24px_rgb(0_0_0/0.3)] group-data-[side=left]:left-[calc(100%+10px)] group-data-[side=left]:[--label-shift:-8px] group-data-[side=right]:right-[calc(100%+10px)] group-data-[side=right]:[--label-shift:8px]"
        >
          ¡Reserva tu cancha!
        </span>
      </a>
    </>
  );
}
