import type { CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/** Solo con datos que ya están en el sitio; lo demás se resuelve por WhatsApp. */
const FAQS = [
  {
    q: "¿Necesito experiencia para jugar?",
    a: "No. El pickleball es de los deportes más fáciles de aprender: las reglas básicas se entienden en minutos y desde tu primera reta ya estás jugando.",
  },
  {
    q: "¿Qué necesito llevar?",
    a: "Ropa deportiva y tenis cómodos para cancha. Si no tienes raqueta o pelotas, pregúntanos por WhatsApp antes de venir.",
  },
  {
    q: "¿Las canchas son techadas?",
    a: "Sí. Nuestras canchas están bajo techo, así que juegas con sol o con lluvia.",
  },
  {
    q: "¿Cuánto cuesta rentar una cancha?",
    a: "$300 por hora de lunes a sábado de 7:00 a.m. a 3:00 p.m. y los domingos de 8:00 a.m. a 8:00 p.m. De lunes a sábado de 4:00 a 10:00 p.m. son $400 por hora.",
  },
  {
    q: "¿Cómo me inscribo a la Reta femenil, Once Kids o el torneo?",
    a: "Escríbenos por WhatsApp y te apartamos tu lugar. La Reta femenil es los jueves de 10:00 a.m. a 1:00 p.m. y Once Kids los sábados de 10:00 a.m. a 12:00 p.m.",
  },
  {
    q: "¿Desde qué edad pueden jugar los niños?",
    a: "Once Kids es para niñas y niños de 6 a 12 años, los sábados de 10:00 a.m. a 12:00 p.m.",
  },
];

const DUDA_URL = whatsappLink("¡Hola! Tengo una pregunta sobre Pickleball ONCE.");

export function FaqSection() {
  return (
    <section
      id="preguntas"
      data-ball="left"
      data-reveal-root
      aria-labelledby="preguntas-titulo"
      className="bg-white py-14 sm:py-16"
    >
      <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <p
            data-reveal
            className="mb-3 inline-block rounded-full bg-navy px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime"
          >
            Preguntas frecuentes
          </p>
          <h2 id="preguntas-titulo" data-reveal style={delay(1)} className="font-sport text-[11vw] text-navy sm:text-5xl">
            ¿Dudas?
            <br />
            Te ayudamos.
          </h2>
          <a
            data-reveal
            style={delay(2)}
            href={DUDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-2 font-bold underline decoration-lime decoration-[3px] underline-offset-[6px] transition-colors hover:text-court"
          >
            ¿No está tu pregunta? Escríbenos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        <div className="border-t border-navy/10">
          {FAQS.map((item, i) => (
            <details key={item.q} data-reveal style={delay(i + 1)} className="faq group border-b border-navy/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-extrabold transition-colors hover:text-court [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-cream transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:bg-lime"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-prose pb-5 pr-12 text-[0.95rem] leading-relaxed text-navy/75">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
