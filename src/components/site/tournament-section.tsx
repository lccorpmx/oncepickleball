import Image from "next/image";
import type { CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { TORNEO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

function Details({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <p data-reveal style={delay(2)} className="font-bold leading-snug">
        Dobles mixtos ·
        <br />
        21–22 de noviembre
      </p>
      <span data-reveal style={delay(3)} className="pill-outline mt-[0.7em] px-[0.95em] py-[0.32em]">
        $400 por persona
      </span>
      <a
        data-reveal
        style={delay(4)}
        href={TORNEO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants(),
          "shine mt-[0.6em] h-auto rounded-full px-[1.2em] py-[0.55em] text-[1em] font-extrabold shadow-[0_10px_30px_rgb(215_242_92/0.3)] hover:bg-lime hover:brightness-105"
        )}
      >
        Consultar por WhatsApp
      </a>
    </div>
  );
}

export function TournamentSection() {
  return (
    <section id="torneo" data-ball="right" data-reveal-root className="bg-white px-5 py-14 sm:px-8 sm:py-16">
      <div
        data-reveal="wipe"
        className="@container relative mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] bg-[#2a4d9b] text-white shadow-[0_28px_60px_-20px_rgb(13_29_74/0.5)]"
      >
        <div className="relative aspect-[530/284]">
          <Image
            src="/images/torneo.jpg"
            alt="Pareja de dobles lista para recibir junto a la red"
            fill
            sizes="(min-width: 960px) 896px, 100vw"
            data-media
            data-parallax
            className="object-cover object-[50%_51%]"
          />
          <div className="absolute inset-y-0 left-0 w-[55%] bg-linear-to-r from-[#24479a]/70 via-[#24479a]/30 to-transparent" />
          <h2 className="font-sport absolute left-[4.2%] top-[5.5%]">
            <span data-reveal="left" className="block text-[17.2cqw] text-lime">
              Torneo
            </span>
            <span data-reveal="left" style={delay(1)} className="-mt-[0.02em] block text-[8.6cqw] text-white">
              de pickleball
            </span>
          </h2>
          <Details className="absolute left-[6.2%] top-[56%] hidden text-[2.55cqw] md:flex" />
        </div>
        <Details className="px-5 pb-7 pt-5 text-base md:hidden" />
      </div>
    </section>
  );
}
