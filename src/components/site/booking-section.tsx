import type { CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { RESERVA_URL, WHATSAPP_DISPLAY } from "@/lib/site";
import { cn } from "@/lib/utils";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

const STEPS = [
  { title: "Elige tu horario", text: "Revisa la agenda y escoge el día y la hora que te acomoden." },
  {
    title: "Escríbenos por WhatsApp",
    text: `Mándanos tu horario al ${WHATSAPP_DISPLAY} y te confirmamos la cancha.`,
  },
  { title: "¡A jugar!", text: "Llega unos minutos antes, calienta y que empiece la reta." },
];

export function BookingSection() {
  return (
    <section
      id="como-reservar"
      data-ball="left"
      data-reveal-root
      aria-labelledby="como-reservar-titulo"
      className="relative overflow-hidden bg-navy py-14 text-white sm:py-16"
    >
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(215_242_92/0.16),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <p
          data-reveal
          className="mb-3 inline-block rounded-full bg-lime px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy"
        >
          Cómo reservar
        </p>
        <h2 id="como-reservar-titulo" data-reveal style={delay(1)} className="font-sport text-[11vw] sm:text-5xl">
          Tres pasos y a la cancha.
        </h2>

        <ol className="mt-9 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              style={delay(i + 2)}
              className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-6"
            >
              <span aria-hidden="true" className="font-sport block text-6xl text-lime">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{step.text}</p>
              <span
                aria-hidden="true"
                data-reveal="grow-x"
                style={delay(i + 3)}
                className="absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-lime"
              />
            </li>
          ))}
        </ol>

        <div data-reveal style={delay(5)} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants(),
              "shine h-11 rounded-full px-6 text-sm font-extrabold shadow-[0_10px_30px_rgb(215_242_92/0.3)] hover:bg-lime hover:brightness-105"
            )}
          >
            Reservar por WhatsApp
          </a>
          <span className="text-sm text-white/70">WhatsApp · {WHATSAPP_DISPLAY}</span>
        </div>
      </div>
    </section>
  );
}
