"use client";

import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { OnceLogo } from "@/components/site/once-logo";
import { NAV_LINKS, RESERVA_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    // El límite solo cambia con el tamaño de ventana: medirlo en cada scroll forzaba un reflow.
    let limit = window.innerHeight;
    const measure = () => {
      const hero = document.querySelector<HTMLElement>('[data-stage="hero"]');
      limit = hero ? hero.offsetHeight - window.innerHeight * 0.9 : window.innerHeight;
    };
    const onScroll = () => setSolid(window.scrollY > limit);
    const onResize = () => {
      measure();
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
        // En móvil sin backdrop-blur: debajo está el canvas 3D, que cambia cada frame y obligaba a re-desenfocar.
        solid
          ? "bg-navy-deep/95 shadow-[0_8px_30px_rgb(0_0_0/0.25)] md:bg-navy-deep/85 md:backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-8">
        <a href="#inicio" className="text-[1.7rem] sm:text-[2.1rem]" aria-label="Pickleball ONCE, inicio">
          <OnceLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white/90 transition-colors hover:text-lime"
            >
              {link.label}
            </a>
          ))}
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-9 rounded-full px-5 text-sm font-bold shadow-[0_6px_20px_rgb(215_242_92/0.35)] hover:bg-lime hover:brightness-105"
            )}
          >
            Reserva
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "h-8 rounded-full px-3.5 text-sm font-bold")}
          >
            Reserva
          </a>
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "rounded-full text-white hover:bg-white/10 hover:text-white"
              )}
              aria-label="Abrir menú"
            >
              <MenuIcon className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-navy-deep text-white">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <div className="px-6 pt-8 text-[2.2rem]">
                <OnceLogo />
              </div>
              <nav aria-label="Móvil" className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<a href={link.href} />}
                    nativeButton={false}
                    className="font-sport rounded-lg px-3 py-3 text-5xl text-white transition-colors hover:bg-white/5 hover:text-lime"
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
