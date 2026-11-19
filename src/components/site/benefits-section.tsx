import type { CSSProperties } from "react";
import { Clock3, CloudSun, MessageCircleMore, UsersRound, type LucideIcon } from "lucide-react";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: CloudSun, title: "Bajo techo", text: "Juega con sol o con lluvia: la reta no se cancela por el clima." },
  {
    icon: Clock3,
    title: "Hasta las 10 p.m.",
    text: "De lunes a sábado desde las 7 a.m. y hasta las 10 p.m.; domingos de 8 a.m. a 8 p.m.",
  },
  { icon: UsersRound, title: "Para todos", text: "Reta femenil, Once Kids y torneos: siempre hay con quién jugar." },
  { icon: MessageCircleMore, title: "Reserva fácil", text: "Escríbenos por WhatsApp, elige tu horario y listo." },
];

export function BenefitsSection() {
  return (
    <section
      id="por-que"
      data-ball="right"
      data-reveal-root
      aria-labelledby="por-que-titulo"
      className="relative overflow-hidden bg-navy-deep py-14 text-white sm:py-16"
    >
      {/* Líneas de cancha de fondo */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-[0.07]"
      >
        <path d="M-5 100 L38 0 M62 100 L105 0" stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <p
          data-reveal
          className="mb-3 inline-block rounded-full bg-lime px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy"
        >
          Por qué ONCE
        </p>
        <h2 id="por-que-titulo" data-reveal style={delay(1)} className="font-sport text-[10vw] sm:text-5xl">
          Aquí solo te preocupas
          <br />
          por jugar.
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-8 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-reveal style={delay(i + 2)} className="relative pt-6">
              <span
                aria-hidden="true"
                data-reveal="grow-x"
                style={delay(i + 2)}
                className="absolute inset-x-0 top-0 h-px bg-white/20"
              />
              <span className="mb-4 grid size-11 place-items-center rounded-full bg-lime text-navy">
                <Icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
