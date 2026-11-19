import type { CSSProperties } from "react";
import { CalendarCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { RESERVA_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/** Eje de la agenda: de 7 a.m. a 10 p.m. */
const OPEN = 7;
const CLOSE = 22;
const SPAN = CLOSE - OPEN;
const left = (h: number) => `${((h - OPEN) / SPAN) * 100}%`;
const width = (from: number, to: number) => `${((to - from) / SPAN) * 100}%`;

const hour = (h: number) => (h < 12 ? `${h} a.m.` : h === 12 ? "12 p.m." : `${h - 12} p.m.`);

type Block = { from: number; to: number; price: 300 | 400 };
type Activity = { name: string; from: number; to: number };

/** Los mismos horarios y precios de la sección de canchas (RATES en courts-section). */
const WEEKDAY: Block[] = [
  { from: 7, to: 15, price: 300 },
  { from: 16, to: 22, price: 400 },
];

const WEEK: { day: string; short: string; blocks: Block[]; activity?: Activity }[] = [
  { day: "Lunes", short: "Lun", blocks: WEEKDAY },
  { day: "Martes", short: "Mar", blocks: WEEKDAY },
  { day: "Miércoles", short: "Mié", blocks: WEEKDAY },
  { day: "Jueves", short: "Jue", blocks: WEEKDAY, activity: { name: "Reta femenil", from: 10, to: 13 } },
  { day: "Viernes", short: "Vie", blocks: WEEKDAY },
  { day: "Sábado", short: "Sáb", blocks: WEEKDAY, activity: { name: "Once Kids", from: 10, to: 12 } },
  { day: "Domingo", short: "Dom", blocks: [{ from: 8, to: 20, price: 300 }] },
];

const TICKS = [7, 10, 13, 16, 19, 22];

function describe({ day, blocks, activity }: (typeof WEEK)[number]) {
  const parts = blocks.map((b) => `de ${hour(b.from)} a ${hour(b.to)}, $${b.price} por hora`);
  if (activity) parts.push(`${activity.name} de ${hour(activity.from)} a ${hour(activity.to)}`);
  return `${day}: ${parts.join("; ")}`;
}

function Legend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-navy/80", className)}>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-full bg-lime/70" />
        $300/h
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-full bg-navy" />
        $400/h
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-full bg-court" />
        Actividad
      </span>
    </div>
  );
}

export function ScheduleSection() {
  return (
    <section
      id="horarios"
      data-ball="right"
      data-reveal-root
      aria-labelledby="horarios-titulo"
      className="bg-cream py-14 sm:py-16"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              data-reveal
              className="mb-3 inline-block rounded-full bg-navy px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime"
            >
              Horarios
            </p>
            <h2 id="horarios-titulo" data-reveal style={delay(1)} className="font-sport text-[11vw] text-navy sm:text-5xl">
              Tu semana en ONCE
            </h2>
            <p data-reveal style={delay(2)} className="mt-3 text-navy/75">
              Renta de cancha por hora y actividades fijas.
            </p>
          </div>
          <Legend className="hidden sm:flex" />
        </div>

        <div
          data-reveal
          style={delay(2)}
          className="mt-8 rounded-[1.75rem] bg-white p-4 shadow-[0_24px_50px_-24px_rgb(13_29_74/0.35)] sm:p-7"
        >
          {/* Eje de horas */}
          <div aria-hidden="true" className="relative ml-11 mr-3 h-5 sm:ml-28">
            {TICKS.map((h) => (
              <span
                key={h}
                style={{ left: left(h) }}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[0.65rem] font-semibold text-navy/55 sm:text-xs"
              >
                {hour(h)}
              </span>
            ))}
          </div>

          <ol className="mt-2 space-y-2.5">
            {WEEK.map((d, i) => (
              <li key={d.day} aria-label={describe(d)} className="grid grid-cols-[2.75rem_1fr] items-center sm:grid-cols-[7rem_1fr]">
                <span aria-hidden="true" className="text-sm font-extrabold">
                  <span className="sm:hidden">{d.short}</span>
                  <span className="hidden sm:inline">{d.day}</span>
                </span>
                <div aria-hidden="true" className="relative mr-3 h-9 rounded-full bg-navy/[0.05]">
                  {/* Líneas guía de las horas marcadas */}
                  {TICKS.slice(1, -1).map((h) => (
                    <span key={h} style={{ left: left(h) }} className="absolute inset-y-1 w-px bg-navy/10" />
                  ))}
                  {d.blocks.map((b) => (
                    <span
                      key={b.from}
                      data-reveal="grow-x"
                      style={{ ...delay(i), left: left(b.from), width: width(b.from, b.to) }}
                      className={cn(
                        "absolute inset-y-0 flex items-center rounded-full px-2 text-[0.65rem] font-extrabold sm:px-3 sm:text-xs",
                        b.price === 400 ? "bg-navy text-white" : "bg-lime/70 text-navy"
                      )}
                    >
                      ${b.price}/h
                    </span>
                  ))}
                  {d.activity && (
                    <span
                      data-reveal="pop"
                      style={{ ...delay(i + 3), left: left(d.activity.from), minWidth: width(d.activity.from, d.activity.to) }}
                      className="absolute inset-y-1 flex items-center justify-center whitespace-nowrap rounded-full bg-court px-2.5 text-[0.65rem] font-bold text-white shadow-[0_6px_14px_rgb(35_83_194/0.35)] sm:text-xs"
                    >
                      {d.activity.name}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <Legend className="mt-5 sm:hidden" />
        </div>

        <a
          data-reveal
          style={delay(4)}
          href={RESERVA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants(),
            "shine mt-7 h-11 gap-2 rounded-full px-6 text-sm font-extrabold shadow-[0_10px_30px_rgb(185_217_58/0.45)] hover:bg-lime hover:brightness-105"
          )}
        >
          <CalendarCheck className="size-4" aria-hidden="true" />
          Aparta tu horario
        </a>
      </div>
    </section>
  );
}
