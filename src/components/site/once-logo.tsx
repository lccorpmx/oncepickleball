import { cn } from "@/lib/utils";

/** Anillo tipo "power" con las dos barras lima (el "11" de ONCE). */
export function OnceMark({ className, ringColor = "currentColor" }: { className?: string; ringColor?: string }) {
  return (
    <svg viewBox="0 0 100 104" className={className} aria-hidden="true">
      <path
        d="M70.1 33.8 A38 38 0 1 1 29.9 33.8"
        fill="none"
        stroke={ringColor}
        strokeWidth="10"
      />
      <polygon points="35,0 45,0 52,52 42,52" fill="var(--lime)" />
      <polygon points="51,0 61,0 68,52 58,52" fill="var(--lime)" />
    </svg>
  );
}

export function OnceLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-end gap-[0.04em] leading-none text-white", className)}
      aria-label="Pickleball ONCE"
      role="img"
    >
      <OnceMark className="h-[1.08em] w-auto -translate-y-[0.02em]" />
      <span className="flex flex-col items-end">
        <span className="mb-[0.08em] text-[0.3em] font-bold tracking-[0.18em]">PICKLEBALL</span>
        <span className="text-[1em] font-medium tracking-[-0.03em]">NCE</span>
      </span>
    </span>
  );
}
