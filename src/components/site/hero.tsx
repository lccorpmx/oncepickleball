import { Fragment } from "react";
import Image from "next/image";
import { RESERVA_URL } from "@/lib/site";

const LINES = [["Aquí", "se", "arma"], ["la", "reta."]];

/**
 * El hero queda fijado (sticky) mientras dura la intro 3D: la raqueta batea el
 * titular y el badge, que sale disparado como pelota; luego zoom a la cancha.
 */
export function Hero() {
  return (
    <section
      id="inicio"
      data-stage="hero"
      data-ball="right"
      aria-label="Aquí se arma la reta"
      className="relative h-[300svh] bg-navy-deep"
    >
      <div data-stage="pin" className="sticky top-0 h-svh overflow-hidden">
        {/* Al final de la intro, el director hace zoom rápido a la cancha. */}
        <div data-stage="zoom" className="absolute inset-0 origin-[50%_88%] will-change-transform">
          <Image
            src="/images/canchas.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover object-[62%_50%] blur-[2px] saturate-[1.2]"
          />
        </div>
        <div className="absolute inset-0 bg-[#1c43b5] opacity-60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-b from-navy-deep/90 via-navy-deep/25 to-navy-deep/5" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-navy-deep/60 to-transparent" />
        <h1 className="font-sport absolute left-[30%] top-[18%] text-[12.5vw] text-white drop-shadow-[0_8px_28px_rgb(0_0_0/0.35)] md:left-[45%] md:top-[20%] md:text-[min(7.2vw,13.5vh)]">
          {LINES.map((line, li) => (
            <span key={li} className="block whitespace-nowrap">
              {line.map((word, wi) => (
                <Fragment key={word}>
                  {wi > 0 && " "}
                  <span data-word className="inline-block origin-bottom-left will-change-transform">
                    {word}
                  </span>
                </Fragment>
              ))}
            </span>
          ))}
        </h1>

        {/* Lugar del badge. Se ve en HTML hasta que el 3D toma el control. */}
        <a
          data-stage="badge"
          href={RESERVA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[12%] right-[6%] grid aspect-square w-[clamp(120px,33vw,160px)] place-items-center rounded-full bg-lime text-navy shadow-[0_20px_50px_rgb(0_0_0/0.35)] in-data-[webgl=ready]:invisible md:bottom-[11%] md:right-[7%] md:w-[clamp(150px,20vmin,220px)]"
        >
          <span className="font-sport -rotate-4 text-center text-[clamp(1.55rem,4.2vmin,2.7rem)] leading-[0.88]">
            Reserva
            <br />
            tu cancha
          </span>
        </a>

        <div
          data-stage="hint"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/80"
        >
          <span>Desliza</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[hint_1.6s_ease-in-out_infinite] bg-lime" />
          </span>
        </div>
      </div>
    </section>
  );
}
