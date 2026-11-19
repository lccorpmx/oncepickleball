import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Las posiciones están en % de la tarjeta y los tamaños en cqw para que el texto
 * caiga exactamente sobre la zona limpia de cada foto (proporción 261:324).
 */
function ActivityCard({
  image,
  alt,
  title,
  schedule,
  price,
  children,
  className,
  wipeDelay = 0,
}: {
  image: string;
  alt: string;
  title: ReactNode;
  schedule: { day: string; hours: string; className: string };
  price: { label: string; className: string };
  children?: ReactNode;
  className?: string;
  /** ms; escalona el barrido de las tarjetas que aparecen juntas. */
  wipeDelay?: number;
}) {
  return (
    <article data-reveal-root className={cn("@container group relative aspect-[261/324] text-white", className)}>
      <div
        data-reveal="wipe"
        style={{ "--wipe-delay": `${wipeDelay}ms` } as CSSProperties}
        className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-court-deep shadow-[0_24px_48px_-16px_rgb(13_29_74/0.45)]"
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
          data-media
          data-parallax
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-navy-deep/45 to-transparent" />
        {title}
        {children}
        <div data-reveal style={delay(2)} className={cn("absolute", schedule.className)}>
          <p className="text-[5.5cqw] font-bold leading-tight">{schedule.day} ·</p>
          <p className="text-[5cqw] font-medium leading-tight text-white/90">{schedule.hours}</p>
        </div>
        <span
          data-reveal
          style={delay(3)}
          className={cn("pill-outline absolute px-[4.2cqw] py-[1.5cqw] text-[5.2cqw]", price.className)}
        >
          {price.label}
        </span>
      </div>
    </article>
  );
}

export function ActivitiesSection() {
  return (
    <section id="actividades" data-ball="left" className="bg-white px-5 py-12 sm:px-8 sm:py-16">
      {/* Cada tarjeta mide como máximo (alto de pantalla − 11rem), así siempre caben completas. */}
      <div className="mx-auto max-w-[min(56rem,calc((100svh_-_11rem)_*_1.611_+_1.25rem))]">
        <div data-reveal className="mb-5 flex items-end gap-5 sm:mb-6">
          <h2 className="font-sport text-[11vw] text-navy sm:text-5xl">Actividades</h2>
          <span aria-hidden="true" className="mb-[0.55em] hidden h-1 max-w-48 flex-1 rounded-full bg-lime sm:block" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ActivityCard
            image="/images/reta-femenil.jpg"
            alt="Jugadoras en un partido de dobles en las canchas techadas de ONCE"
            title={
              <h3 className="font-sport absolute left-[46.5%] top-[4.2%] text-[14.6cqw]">
                <span data-reveal="right" className="block text-[0.86em] text-white">
                  Reta
                </span>
                <span data-reveal="right" style={delay(1)} className="block text-lime">
                  Femenil
                </span>
                <svg aria-hidden="true" viewBox="0 0 130 30" className="mt-[0.02em] h-auto w-[2.55em] overflow-visible">
                  <path
                    data-reveal="draw"
                    style={delay(3)}
                    pathLength={1}
                    d="M2 24 Q 60 9 124 6 L 50 26 Q 92 20 128 20"
                    stroke="var(--lime)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </h3>
            }
            schedule={{ day: "Jueves", hours: "10:00 a.m.–1:00 p.m.", className: "left-[9.5%] top-[72.4%]" }}
            price={{ label: "$150 por persona", className: "left-[9.5%] top-[85.6%]" }}
          />

          <ActivityCard
            image="/images/once-kids.jpg"
            alt="Niños y jugadores de ONCE con su cheque de premio en la cancha"
            title={
              <h3 className="font-sport absolute left-[9%] top-[3.2%] text-[14.8cqw]">
                <span data-reveal="left" className="block text-white">
                  Once
                </span>
                <span data-reveal="left" style={delay(1)} className="relative block text-lime">
                  Kids
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 30 34"
                  className="absolute left-[103%] top-[6%] w-[0.62em] overflow-visible"
                >
                  <path
                    data-reveal="draw"
                    style={delay(3)}
                    pathLength={1}
                    d="M2 8 L10 0 M4 18 L24 4 M6 30 L22 22"
                    stroke="var(--lime)"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                </svg>
              </h3>
            }
            schedule={{ day: "Sábados", hours: "10:00 a.m.–12:00 p.m.", className: "left-[11.5%] top-[75.4%]" }}
            price={{ label: "$150 por niño", className: "left-[11%] top-[87.2%]" }}
            wipeDelay={160}
          >
            <span
              data-reveal="pop"
              data-float
              style={delay(3)}
              className="absolute left-[26.5%] top-[60.6%] -rotate-3 rounded-[3cqw] bg-lime px-[4.5cqw] py-[1.7cqw] text-[6.2cqw] font-extrabold text-navy shadow-[0_8px_20px_rgb(0_0_0/0.25)]"
            >
              6 a 12 años
            </span>
          </ActivityCard>
        </div>
      </div>
    </section>
  );
}
