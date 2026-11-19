import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

const FACTS = [
  { title: "En parejas o individual", text: "Lo más común son los dobles: cuatro jugadores en la cancha." },
  { title: "Saque por abajo", text: "Se saca por debajo de la cintura y en diagonal, al cuadro contrario." },
  { title: "Regla del doble bote", text: "La pelota bota una vez de cada lado antes de que se pueda volear." },
  { title: "Cuidado con la cocina", text: "Junto a la red está la zona de no volea: ahí no le pegas al aire." },
];

const PRIMERA_VEZ_URL = whatsappLink("¡Hola! Nunca he jugado pickleball, ¿cómo puedo empezar en ONCE?");

/**
 * Cancha vista desde arriba, a escala (44 × 20 pies → 440 × 200 unidades), con la
 * "cocina" resaltada y una pelota que recorre un peloteo (animación en globals.css).
 */
function CourtDiagram() {
  const line = { stroke: "white", strokeWidth: 3, fill: "none", pathLength: 1 } as const;
  return (
    <svg viewBox="-24 -26 488 252" className="h-auto w-full" role="img" aria-labelledby="cancha-titulo">
      <title id="cancha-titulo">Cancha de pickleball vista desde arriba, con la cocina junto a la red</title>
      <rect x="0" y="0" width="440" height="200" fill="var(--court)" />
      <rect x="150" y="0" width="140" height="200" fill="var(--lime)" opacity="0.22" />

      <path data-reveal="draw" d="M0 0 H440 V200 H0 Z" {...line} />
      <path data-reveal="draw" style={delay(1)} d="M150 0 V200 M290 0 V200" {...line} />
      <path data-reveal="draw" style={delay(2)} d="M0 100 H150 M290 100 H440" {...line} />

      {/* Red */}
      <path d="M220 -14 V214" stroke="#eef3ff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="220" cy="-14" r="6" fill="white" />
      <circle cx="220" cy="214" r="6" fill="white" />

      <g fill="var(--lime)" fontSize="11" fontWeight="800" letterSpacing="2.5" textAnchor="middle">
        <text transform="translate(186 100) rotate(-90)">COCINA</text>
        <text transform="translate(254 100) rotate(90)">COCINA</text>
      </g>

      {/* Pelota: la sombra se queda en el piso y la pelota "sube" en cada tramo */}
      <g className="court-ball" transform="translate(410 160)">
        <ellipse rx="7" ry="4" fill="rgb(5 12 40 / 0.35)" />
        <circle className="court-ball-body" r="7" fill="var(--lime)" stroke="#9fbf2a" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function HowToPlaySection() {
  return (
    <section
      id="como-se-juega"
      data-ball="left"
      data-reveal-root
      aria-labelledby="como-se-juega-titulo"
      className="overflow-hidden bg-cream py-14 sm:py-16"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <p
            data-reveal
            className="mb-3 inline-block rounded-full bg-navy px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime"
          >
            ¿Nuevo en el pickleball?
          </p>
          <h2 id="como-se-juega-titulo" data-reveal style={delay(1)} className="font-sport text-[11vw] text-navy sm:text-5xl">
            Fácil de aprender,
            <br />
            difícil de soltar.
          </h2>
          <p data-reveal style={delay(2)} className="mt-4 max-w-md leading-relaxed text-navy/75">
            El pickleball mezcla lo mejor del tenis, el bádminton y el ping pong. Se juega con raqueta sólida y una
            pelota de plástico perforada, en una cancha del tamaño de una de bádminton.
          </p>

          <ol className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {FACTS.map((fact, i) => (
              <li key={fact.title} data-reveal style={delay(i + 3)} className="flex gap-3">
                <span className="mt-0.5 grid h-7 min-w-9 place-items-center rounded-full bg-navy px-2 text-xs font-extrabold text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-extrabold leading-snug">{fact.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-navy/70">{fact.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <a
            data-reveal
            style={delay(7)}
            href={PRIMERA_VEZ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 font-bold underline decoration-lime decoration-[3px] underline-offset-[6px] transition-colors hover:text-court"
          >
            ¿Primera vez? Te decimos cómo empezar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        <figure
          data-reveal
          style={delay(2)}
          className="rounded-[1.75rem] bg-court-deep p-5 shadow-[0_28px_60px_-24px_rgb(13_29_74/0.6)] sm:p-7"
        >
          <CourtDiagram />
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm text-white/80">
            <span>Cancha de 6.1 × 13.4 m</span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-3 rounded-sm bg-lime/60" />
              Cocina: zona de no volea
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
