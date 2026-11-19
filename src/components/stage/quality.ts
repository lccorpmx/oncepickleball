/**
 * Dispositivos táctiles o pantallas angostas: texturas más chicas y menos
 * resolución de render. Solo se evalúa en el cliente (la escena es ssr: false).
 */
export const LOW_POWER =
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
