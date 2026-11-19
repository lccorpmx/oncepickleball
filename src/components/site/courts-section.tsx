import Image from "next/image";
import type { CSSProperties } from "react";

const RATES = [
  { day: "Lunes a sábado", hours: "7:00 a.m.–3:00 p.m.", price: "$300/h" },
  { day: "Lunes a sábado", hours: "4:00–10:00 p.m.", price: "$400/h" },
  { day: "Domingo", hours: "8:00 a.m.–8:00 p.m.", price: "$300/h" },
];

const delay = (i: number) => ({ "--i": i }) as CSSProperties;
/** Retraso del revelado + deriva horizontal ligada al scroll (alterna de lado). */
const word = (i: number) => ({ "--i": i, "--drift": i % 2 ? -1 : 1 }) as CSSProperties;

export function CourtsSection() {
  return (
    <section
      id="canchas"
      data-ball="right"
      data-reveal-root
      className="relative overflow-hidden border-t-4 border-white bg-cream py-12 sm:py-16"
    >
      <div className="relative mx-auto grid max-w-5xl items-center gap-9 px-5 sm:grid-cols-[0.9fr_1.1fr] sm:px-8 lg:gap-14">
        <div className="relative">
          {/* Raya lima diagonal detrás del título */}
          <svg
            aria-hidden="true"
            data-reveal="clip-up"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute -inset-y-12 left-[-6%] h-[calc(100%+6rem)] w-[106%] sm:-inset-y-16 sm:h-[calc(100%+8rem)]"
          >
            <line x1="4" y1="100" x2="96" y2="0" stroke="var(--lime)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          </svg>
          <p
            data-reveal
            className="relative mb-3 inline-block rounded-full bg-navy px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime"
          >
            Canchas
          </p>
          <h2 className="font-sport relative text-[16vw] text-navy sm:text-[7.5vw] lg:text-[6rem]">
            <span data-reveal="left" data-drift style={word(0)} className="block">
              Juega
            </span>
            <span data-reveal="left" data-drift style={word(1)} className="block">
              bajo
            </span>
            <span data-reveal="left" data-drift style={word(2)} className="block">
              techo
            </span>
          </h2>
        </div>

        <div className="relative">
          <div className="drop-shadow-[0_22px_30px_rgb(13_29_74/0.2)]">
            <div className="[clip-path:polygon(9%_0,100%_0,100%_100%,0_100%)]">
              <div data-reveal="clip" className="relative aspect-[652/364] overflow-hidden bg-court">
                <Image
                  src="/images/canchas.jpg"
                  alt="Jugadores en las canchas techadas de ONCE"
                  fill
                  sizes="(min-width: 1024px) 520px, (min-width: 640px) 52vw, 100vw"
                  data-media
                  data-parallax
                  className="object-cover object-[50%_38%]"
                />
              </div>
            </div>
          </div>

          <dl className="mt-5 sm:ml-[8%]">
            {RATES.map((rate, i) => (
              <div
                key={rate.hours}
                data-reveal
                style={delay(i + 2)}
                className="relative grid grid-cols-[1fr_2px_minmax(5.5rem,auto)] items-center gap-x-5 py-2.5 sm:gap-x-6"
              >
                <dt>
                  <span className="block text-[0.95rem] font-extrabold leading-tight sm:text-base">{rate.day}</span>
                  <span className="block text-[0.8rem] font-medium text-navy/70 sm:text-sm">{rate.hours}</span>
                </dt>
                <span aria-hidden="true" data-reveal="grow-y" style={delay(i + 2)} className="h-7 bg-lime" />
                <dd className="overflow-hidden text-center text-lg font-extrabold tracking-tight sm:text-xl">
                  <span data-reveal="rise" style={delay(i + 2)} className="block">
                    {rate.price}
                  </span>
                </dd>
                {i < RATES.length - 1 && (
                  <span
                    aria-hidden="true"
                    data-reveal="grow-x"
                    style={delay(i + 2)}
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-lime/80"
                  />
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
