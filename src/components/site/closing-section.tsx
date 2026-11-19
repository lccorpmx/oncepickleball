import type { CSSProperties } from "react";
import { OnceLogo } from "@/components/site/once-logo";
import { NAV_LINKS, RESERVA_URL, WHATSAPP_DISPLAY } from "@/lib/site";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.36A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.08.8.82-3-.2-.31a8.18 8.18 0 1 1 6.94 3.84Zm4.5-6.12c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.12.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.07-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48a.92.92 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07 4.83 4.83 0 0 0 1.01 2.57 11.06 11.06 0 0 0 4.24 3.74c.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

export function ClosingSection() {
  return (
    <>
      <section
        id="reserva"
        data-ball="dock"
        data-reveal-root
        className="relative isolate overflow-hidden bg-lime text-navy"
      >
        {/* Líneas de cancha */}
        <svg
          aria-hidden="true"
          data-reveal="clip-down"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 -z-10 h-full w-full"
        >
          <path d="M78 -5 L52 105" stroke="white" strokeWidth="7" vectorEffect="non-scaling-stroke" opacity="0.9" />
          <path d="M100 18 L84 105" stroke="white" strokeWidth="4" vectorEffect="non-scaling-stroke" opacity="0.55" />
        </svg>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_40%,rgb(255_255_255/0.35),transparent_55%)]" />

        <div className="relative mx-auto flex min-h-[18rem] max-w-5xl flex-col justify-center px-5 pb-12 pt-[32vw] sm:px-8 md:min-h-[19rem] md:py-14">
          <h2 className="font-sport text-[11vw] md:text-[min(5.6vw,5rem)]">
            <span data-reveal="slam" className="block origin-left">
              Nos vemos
            </span>
            <span data-reveal="slam" style={delay(1)} className="block origin-left">
              en la cancha.
            </span>
          </h2>
          <a
            data-reveal
            style={delay(2)}
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shine mt-6 inline-flex w-fit items-center gap-2.5 rounded-full bg-navy-deep px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgb(8_18_54/0.3)] transition-transform hover:-translate-y-0.5 md:text-base"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp · {WHATSAPP_DISPLAY}
          </a>
        </div>

        {/* Lugar donde aterriza la pelota 3D */}
        <div className="pointer-events-none absolute right-[-7vw] top-[-2vw] w-[36vw] md:right-[1%] md:top-1/2 md:w-[min(16vw,210px)] md:-translate-y-1/2">
          <div className="absolute left-[-30%] top-[52%] h-[45%] w-[95%] -rotate-12 rounded-[50%] bg-[#6f8f1d]/45 blur-xl" />
          <div data-stage="dock" className="relative aspect-square w-full">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#eefa9e,var(--lime)_45%,var(--lime-deep))] in-data-[webgl=ready]:invisible" />
          </div>
        </div>
      </section>

      <footer className="bg-navy-deep text-white/70">
        <div
          data-reveal
          className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-8"
        >
          <span className="text-[1.7rem]">
            <OnceLogo />
          </span>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-lime">
                {link.label}
              </a>
            ))}
            <a href={RESERVA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-lime">
              Reserva
            </a>
          </nav>
          <p className="text-sm">© 2026 Pickleball ONCE</p>
        </div>
      </footer>
    </>
  );
}
