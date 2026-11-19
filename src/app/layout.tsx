import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const display = Sofia_Sans_Extra_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball ONCE · Aquí se arma la reta",
  description:
    "Canchas techadas de pickleball, reta femenil, ONCE Kids y torneos. Reserva tu cancha por WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#0b1b45",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="min-h-full bg-cream text-navy">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
