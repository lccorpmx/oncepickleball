/**
 * Coreografía de la intro, en píxeles de pantalla (y hacia abajo).
 * p ∈ [0, 1] es el progreso de scroll mientras el hero está fijado.
 *
 *   0.00–0.19  la raqueta toma impulso
 *   0.19–0.65  swing: golpea el titular palabra por palabra
 *   0.65       impacto con el badge "Reserva tu cancha" → se vuelve pelota
 *   0.65–0.80  la pelota sale disparada hacia la cámara y se pierde por la derecha
 *   0.65–0.86  follow-through; la raqueta sale de cuadro
 *   0.67–…     zoom a la cancha (fondo del hero), sigue mientras el hero sale de pantalla
 *   0.90–1.00  la pelota regresa desde abajo a la esquina inferior derecha

 */

export const T = {
  WIND_END: 0.19,
  HIT: 0.65,
  FOLLOW_END: 0.8,
  EXIT_START: 0.7,
  EXIT_END: 0.86,
  MORPH_END: 0.69,
  SHOT_END: 0.8,
  ZOOM_START: 0.67,
  RETURN_START: 0.9,
} as const;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const easeInQuad = (t: number) => t * t;
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const easeOutBack = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

export type Vec = { x: number; y: number };
export type BallPose = { x: number; y: number; r: number };

export type WordHit = {
  el: HTMLElement;
  pHit: number;
  dirX: number;
  dirY: number;
  spin: number;
};

export type Layout = {
  vw: number;
  vh: number;
  /** px por unidad de raqueta */
  scale: number;
  pivot0: Vec;
  pivot1: Vec;
  theta0: number;
  thetaWind: number;
  thetaHit: number;
  thetaFollow: number;
  badge: BallPose;
  cornerR: number;
  margin: number;
  words: WordHit[];
};

/** Ángulo (rotation.z) para que la raqueta apunte desde `from` hacia `to`. */
export const aimAngle = (from: Vec, to: Vec) => Math.atan2(-(to.x - from.x), -(to.y - from.y));

export type Swing = {
  theta: number;
  x: number;
  y: number;
  twist: number;
  lean: number;
  visible: boolean;
};

export function swingAt(L: Layout, p: number): Swing {
  let theta: number;
  if (p < T.WIND_END) theta = lerp(L.theta0, L.thetaWind, easeInOutCubic(p / T.WIND_END));
  else if (p < T.HIT) theta = lerp(L.thetaWind, L.thetaHit, easeInQuad(range(p, T.WIND_END, T.HIT)));
  else theta = lerp(L.thetaHit, L.thetaFollow, easeOutCubic(range(p, T.HIT, T.FOLLOW_END)));

  const step = easeInOutCubic(range(p, 0.09, T.HIT));
  const exit = easeInQuad(range(p, T.EXIT_START, T.EXIT_END));
  const x = lerp(L.pivot0.x, L.pivot1.x, step) - exit * L.vw * 0.12;
  const y = lerp(L.pivot0.y, L.pivot1.y, step) + exit * L.vh * 1.1;

  // Giro sobre el eje largo: abre la cara al tomar impulso, la cierra al golpear.
  let twist: number;
  if (p < T.WIND_END) twist = lerp(0.5, 0.95, easeInOutCubic(p / T.WIND_END));
  else if (p < T.HIT) twist = lerp(0.95, 0.05, easeInQuad(range(p, T.WIND_END, T.HIT)));
  else twist = lerp(0.05, -0.75, easeOutCubic(range(p, T.HIT, T.FOLLOW_END)));

  const lean = lerp(-0.16, 0.12, range(p, T.WIND_END, T.HIT));
  return { theta, x, y, twist, lean, visible: p < T.EXIT_END };
}

/** Encuentra en qué momento del swing la raqueta "pasa" por cada palabra. */
export function computeWordHits(L: Layout, words: { el: HTMLElement; x: number; y: number }[]): WordHit[] {
  return words.map((w, i) => {
    let pHit = T.HIT - 0.06;
    let theta = 0;
    for (let k = 0; k <= 240; k++) {
      const p = lerp(T.WIND_END, T.FOLLOW_END, k / 240);
      const s = swingAt(L, p);
      theta = aimAngle({ x: s.x, y: s.y }, w);
      if (s.theta <= theta) {
        pHit = p;
        break;
      }
    }
    // Dirección tangente al swing (horario) + un poco de elevación.
    const phi = -theta;
    let dx = Math.cos(phi);
    let dy = Math.sin(phi) - 0.6;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    return { el: w.el, pHit, dirX: dx, dirY: dy, spin: 28 + ((i * 37) % 30) };
  });
}

/* ---------- Rebotes ---------- */

type Hop = { h: number; w: number };

function hopsPath(s: number, hops: Hop[], start: Vec, endX: number, floorY: number) {
  const total = hops.reduce((acc, hp) => acc + Math.sqrt(hp.h), 0);
  let t0 = 0;
  let wx = 0;
  for (let i = 0; i < hops.length; i++) {
    const d = Math.sqrt(hops[i].h) / total;
    if (s <= t0 + d || i === hops.length - 1) {
      const t = clamp((s - t0) / d);
      const x = lerp(start.x, endX, wx + hops[i].w * t);
      const baseY = i === 0 ? lerp(start.y, floorY, t) : floorY;
      return { x, y: baseY - hops[i].h * 4 * t * (1 - t) };
    }
    t0 += d;
    wx += hops[i].w;
  }
  return { x: endX, y: floorY };
}

function contactTimes(hops: Hop[]) {
  const total = hops.reduce((acc, hp) => acc + Math.sqrt(hp.h), 0);
  const out: number[] = [];
  let t = 0;
  for (const hp of hops) {
    t += Math.sqrt(hp.h) / total;
    out.push(t);
  }
  return out;
}

const squashAt = (s: number, contacts: number[], width: number, base = 0.28) =>
  contacts.reduce((acc, c, i) => acc + base * 0.72 ** i * Math.exp(-(((s - c) / width) ** 2)), 0);

export const cornerPose = (L: Layout, side: "left" | "right"): BallPose => ({
  x: side === "left" ? L.margin + L.cornerR : L.vw - L.margin - L.cornerR,
  y: L.vh - L.margin - L.cornerR,
  r: L.cornerR,
});

export type BallFrame = BallPose & {
  morph: number;
  squash: number;
  roll: number;
  shadow: number;
  ring: number;
};

/** Pelota durante la intro (dependiente del scroll, reversible). */
export function ballScrub(L: Layout, p: number): BallFrame {
  const B = L.badge;
  if (p <= T.HIT) {
    const pre = range(p, T.HIT - 0.035, T.HIT);
    return { ...B, morph: 0, squash: pre * 0.12, roll: 0, shadow: 0, ring: 0 };
  }
  const ring = range(p, T.HIT, T.HIT + 0.08);

  // Disparo: viene hacia la cámara (crece cada vez más rápido) y se sale por la derecha.
  if (p < T.SHOT_END) {
    const s = range(p, T.HIT, T.SHOT_END);
    const e = s * s;
    const r = B.r * (1 + 9 * e);
    return {
      x: lerp(B.x, L.vw + r + 40, e),
      y: lerp(B.y, L.vh * 0.4, easeOutCubic(s)),
      r,
      morph: easeOutCubic(range(p, T.HIT, T.MORPH_END)),
      // Sale aplastada por el golpe y recupera su forma en el aire.
      squash: 0.12 * (1 - easeOutCubic(clamp(s / 0.35))),
      roll: -s * 7,
      shadow: 0,
      ring,
    };
  }

  // Fuera de cuadro; al final del hero regresa desde abajo a su esquina.
  const end = cornerPose(L, "right");
  const u = range(p, T.RETURN_START, 1);
  return {
    x: end.x,
    y: lerp(L.vh + end.r * 2.5, end.y, easeOutBack(u)),
    r: end.r,
    morph: 1,
    squash: 0,
    roll: -u * 4,
    shadow: range(u, 0.6, 1) * 0.9,
    ring,
  };
}

/** Rebotes de esquina a esquina, en tiempo (u ∈ [0, 1]). */
export function hopTween(L: Layout, from: BallPose, to: BallPose, u: number) {
  const hops: Hop[] = [
    { h: L.vh * 0.3, w: 0.56 },
    { h: L.vh * 0.11, w: 0.3 },
    { h: L.vh * 0.035, w: 0.14 },
  ];
  const r = lerp(from.r, to.r, easeInOutCubic(u));
  const pt = hopsPath(u, hops, from, to.x, to.y);
  const squash = squashAt(u, contactTimes(hops), 0.035, 0.24);
  return { x: pt.x, y: pt.y, r, squash, height: to.y - pt.y };
}

/** Arco único (hacia / desde el lugar de la pelota en el cierre). */
export function arcTween(L: Layout, from: BallPose, to: BallPose, u: number) {
  const e = easeInOutCubic(u);
  const lift = L.vh * 0.22 * 4 * u * (1 - u);
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, u * u) - lift,
    r: lerp(from.r, to.r, e),
    squash: 0.2 * Math.exp(-(((u - 1) / 0.06) ** 2)),
    height: lift,
  };
}


