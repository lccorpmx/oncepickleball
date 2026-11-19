export const WHATSAPP_NUMBER = "522712455020";
export const WHATSAPP_DISPLAY = "271 245 5020";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const RESERVA_URL = whatsappLink(
  "¡Hola! Quiero reservar una cancha en Pickleball ONCE."
);
export const TORNEO_URL = whatsappLink(
  "¡Hola! Quiero información del Torneo de Pickleball (dobles mixtos, 21–22 de noviembre)."
);

export const NAV_LINKS = [
  { href: "#canchas", label: "Canchas" },
  { href: "#actividades", label: "Actividades" },
  { href: "#torneo", label: "Torneo" },
  { href: "#horarios", label: "Horarios" },
] as const;
