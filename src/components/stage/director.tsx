"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Ball, useBallMaterial, type BallRefs } from "./ball";
import { Paddle, PaddleGhost, type PaddleRefs } from "./paddle";
import {
  T,
  aimAngle,
  arcTween,
  ballScrub,
  clamp,
  computeWordHits,
  cornerPose,
  easeOutCubic,
  hopTween,
  lerp,
  range,
  swingAt,
  type BallPose,
  type Layout,
} from "./choreo";

const CAMERA_Z = 10;
const BALL_Z = 0.8;
const GHOSTS = 3;

type Mode = "scrub" | "left" | "right" | "dock";

type Tween = {
  kind: "hops" | "arc";
  from: BallPose;
  target: Exclude<Mode, "scrub">;
  start: number;
  dur: number;
};

function rectIn(el: Element, origin: DOMRect) {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left + r.width / 2, y: r.top - origin.top + r.height / 2, w: r.width, h: r.height };
}

/** Mide el DOM del hero y arma el layout de la coreografía. */
function measure(vw: number, vh: number): Layout | null {
  const pin = document.querySelector<HTMLElement>('[data-stage="pin"]');
  const badgeEl = document.querySelector<HTMLElement>('[data-stage="badge"]');
  if (!pin || !badgeEl) return null;
  const origin = pin.getBoundingClientRect();
  const mobile = vw < 768;

  const scale = mobile ? Math.min(vw * 0.66, vh * 0.47) : Math.min(vh * 0.55, vw * 0.36);
  const pivot0 = mobile ? { x: vw * 0.32, y: vh * 1.0 } : { x: vw * 0.22, y: vh * 1.04 };

  const b = rectIn(badgeEl, origin);
  const badge = { x: b.x, y: b.y, r: b.w / 2 };

  // Mover el pivote (como un bateador que da el paso) para pegar con el centro de la cara.
  const sweet = 0.96 * scale;
  const p1y = pivot0.y - vh * 0.02;
  const dy = p1y - badge.y;
  const dx = Math.sqrt(Math.max(sweet * sweet - dy * dy, 0));
  const pivot1 = { x: clamp(badge.x - dx, pivot0.x - vw * 0.04, badge.x - scale * 0.35), y: p1y };

  const theta0 = mobile ? 0.16 : 0.22;
  const thetaWind = theta0 + 0.3;
  const thetaHit = aimAngle(pivot1, badge);
  const vIn = (2 * (thetaWind - thetaHit)) / (T.HIT - T.WIND_END);
  const thetaFollow = thetaHit - (vIn * (T.FOLLOW_END - T.HIT)) / 3;

  const L: Layout = {
    vw,
    vh,
    scale,
    pivot0,
    pivot1,
    theta0,
    thetaWind,
    thetaHit,
    thetaFollow,
    badge,
    cornerR: clamp(vw * 0.04, 26, 36),
    margin: mobile ? 16 : 28,
    words: [],
  };

  const words = Array.from(pin.querySelectorAll<HTMLElement>("[data-word]")).map((el) => {
    const prev = el.style.transform;
    el.style.transform = "";
    const r = rectIn(el, origin);
    el.style.transform = prev;
    return { el, x: r.x, y: r.y };
  });
  L.words = computeWordHits(L, words);
  return L;
}

export function Director() {
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  const camera = useThree((s) => s.camera);

  const paddle: PaddleRefs = {
    root: useRef<THREE.Group>(null),
    lean: useRef<THREE.Group>(null),
    twist: useRef<THREE.Group>(null),
  };
  const ball: BallRefs = {
    root: useRef<THREE.Group>(null),
    spin: useRef<THREE.Group>(null),
    body: useRef<THREE.Mesh>(null),
    shadow: useRef<THREE.Mesh>(null),
    ring: useRef<THREE.Mesh>(null),
  };
  const ghostRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const ghostMats = useMemo(
    () =>
      Array.from({ length: GHOSTS }, () =>
        new THREE.MeshBasicMaterial({ color: "#f3f8d8", transparent: true, opacity: 0, depthWrite: false })
      ),
    []
  );
  useEffect(() => () => ghostMats.forEach((m) => m.dispose()), [ghostMats]);

  const ballMaterial = useBallMaterial();

  const st = useRef({
    layout: null as Layout | null,
    dirty: true,
    mode: null as Mode | null,
    tween: null as Tween | null,
    blend: null as { from: BallPose; start: number } | null,
    pose: { x: 0, y: 0, r: 40 } as BallPose,
    roll: 0,
    spinY: 0,
    lastZoom: "",
    hover: 0,
    hovering: false,
    reduced: false,
    lastWord: [] as string[],
    dom: {
      hero: null as HTMLElement | null,
      hint: null as HTMLElement | null,
      zoom: null as HTMLElement | null,
      link: null as HTMLAnchorElement | null,
      dock: null as HTMLElement | null,
      sections: [] as { el: HTMLElement; mode: Exclude<Mode, "scrub"> }[],
    },
  });

  // Referencias al DOM + eventos que invalidan el layout.
  useEffect(() => {
    const s = st.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.dom.hero = document.querySelector('[data-stage="hero"]');
    s.dom.hint = document.querySelector('[data-stage="hint"]');
    s.dom.zoom = document.querySelector('[data-stage="zoom"]');
    s.dom.link = document.querySelector('[data-stage="ball-link"]');
    s.dom.dock = document.querySelector('[data-stage="dock"]');
    s.dom.sections = Array.from(document.querySelectorAll<HTMLElement>("[data-ball]")).map((el) => ({
      el,
      mode: el.dataset.ball as Exclude<Mode, "scrub">,
    }));
    const invalidate = () => (s.dirty = true);
    document.fonts?.ready.then(invalidate);
    const ro = new ResizeObserver(invalidate);
    const pin = document.querySelector('[data-stage="pin"]');
    if (pin) ro.observe(pin);

    const link = s.dom.link;
    const enter = () => (s.hovering = true);
    const leave = () => (s.hovering = false);
    link?.addEventListener("pointerenter", enter);
    link?.addEventListener("pointerleave", leave);
    link?.addEventListener("focus", enter);
    link?.addEventListener("blur", leave);
    return () => {
      ro.disconnect();
      link?.removeEventListener("pointerenter", enter);
      link?.removeEventListener("pointerleave", leave);
      link?.removeEventListener("focus", enter);
      link?.removeEventListener("blur", leave);
    };
  }, []);

  useEffect(() => {
    st.current.dirty = true;
  }, [size.width, size.height]);

  useFrame((state, delta) => {
    const s = st.current;
    const vw = size.width;
    const vh = size.height;
    if (s.dirty || !s.layout) {
      s.layout = measure(vw, vh);
      s.dirty = false;
    }
    const L = s.layout;
    if (!L) return;

    const t = state.clock.elapsedTime;
    const now = performance.now() / 1000;
    const unit0 = viewport.getCurrentViewport(camera, [0, 0, 0]).height / vh;
    const unitAt = (z: number) => (unit0 * (CAMERA_Z - z)) / CAMERA_Z;
    const toWorld = (x: number, y: number, z: number) => {
      const u = unitAt(z);
      return [(x - vw / 2) * u, (vh / 2 - y) * u, z] as const;
    };

    // Progreso de la intro (hero fijado).
    // pRaw sigue creciendo cuando el hero ya se soltó (vale pExit cuando sale de pantalla).
    let p = 1;
    let pRaw = 1;
    let pExit = 2;
    const hero = s.dom.hero;
    if (hero) {
      const r = hero.getBoundingClientRect();
      const travel = Math.max(r.height - vh, 1);
      pRaw = -r.top / travel;
      pExit = r.height / travel;
      p = clamp(pRaw);
    }
    const idle = s.reduced ? 0 : 1 - range(p, 0, 0.06);

    /* ---------------- Raqueta ---------------- */
    const sw = swingAt(L, p);
    const root = paddle.root.current;
    if (root) {
      root.visible = sw.visible;
      if (sw.visible) {
        const bob = Math.sin(t * 1.1) * vh * 0.006 * idle;
        root.position.set(...toWorld(sw.x, sw.y + bob, 0));
        root.rotation.z = sw.theta + Math.sin(t * 1.3) * 0.025 * idle;
        root.scale.setScalar(L.scale * unitAt(0));
        paddle.lean.current?.rotation.set(sw.lean, 0, 0);
        paddle.twist.current?.rotation.set(0, sw.twist + Math.sin(t * 0.8) * 0.05 * idle, 0);
      }
    }
    // Estela del swing
    const blur = range(p, T.WIND_END + 0.09, T.WIND_END + 0.2) * (1 - range(p, T.HIT + 0.03, T.FOLLOW_END));
    ghostRefs.forEach((ref, i) => {
      const g = ref.current;
      if (!g) return;
      g.visible = blur > 0.01 && sw.visible;
      if (!g.visible) return;
      const gs = swingAt(L, Math.max(p - 0.011 * (i + 1), 0));
      g.position.set(...toWorld(gs.x, gs.y, -0.05 * (i + 1)));
      g.rotation.set(gs.lean, gs.twist, gs.theta, "ZXY");
      g.scale.setScalar(L.scale * unitAt(-0.05 * (i + 1)));
      ghostMats[i].opacity = blur * (0.2 / (i + 1));
    });

    /* ---------------- Titular golpeado ---------------- */
    L.words.forEach((w, i) => {
      const k = range(p, w.pHit, w.pHit + 0.2);
      let tf = "";
      let op = "";
      if (k > 0) {
        const e = easeOutCubic(k);
        const dist = Math.max(vw, vh) * 1.15 * e;
        tf = `translate3d(${(w.dirX * dist).toFixed(1)}px, ${(w.dirY * dist).toFixed(1)}px, 0) rotate(${(w.spin * e).toFixed(2)}deg) scale(${(1 - 0.15 * e).toFixed(3)})`;
        op = (1 - range(k, 0.55, 1)).toFixed(3);
      } else {
        const pre = range(p, w.pHit - 0.02, w.pHit);
        if (pre > 0) tf = `scale(${(1 + pre * 0.06).toFixed(3)}, ${(1 - pre * 0.08).toFixed(3)})`;
      }
      const key = tf + "|" + op;
      if (s.lastWord[i] !== key) {
        w.el.style.transform = tf;
        w.el.style.opacity = op;
        s.lastWord[i] = key;
      }
    });
    if (s.dom.hint) s.dom.hint.style.opacity = (1 - range(p, 0, 0.05)).toFixed(3);

    /* ---------------- Zoom a la cancha ---------------- */
    // Rápido al principio y sigue acercándose mientras el hero se va y entra la segunda sección.
    const zoomEl = s.dom.zoom;
    if (zoomEl) {
      const q = range(pRaw, T.ZOOM_START, pExit);
      const zoom = Math.pow(s.reduced ? 1.12 : 2.6, 1 - (1 - q) * (1 - q));
      const key = zoom.toFixed(4);
      if (s.lastZoom !== key) {
        zoomEl.style.transform = q > 0 ? `scale(${key})` : "";
        s.lastZoom = key;
      }
    }

    /* ---------------- Pelota ---------------- */
    let mode: Mode = "scrub";
    if (p >= 0.999) {
      mode = "right";
      for (const sec of s.dom.sections) {
        if (sec.el.getBoundingClientRect().top < vh * 0.6) mode = sec.mode;
      }
    }

    const dockPose = (): BallPose => {
      const el = s.dom.dock;
      if (!el) return cornerPose(L, "right");
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
    };
    const poseFor = (m: Exclude<Mode, "scrub">) => (m === "dock" ? dockPose() : cornerPose(L, m));

    if (mode !== s.mode) {
      if (s.mode === null) {
        // primer frame: sin transición
      } else if (mode === "scrub" || s.mode === "scrub") {
        s.tween = null;
        s.blend = { from: { ...s.pose }, start: now };
      } else {
        const kind = mode === "dock" || s.mode === "dock" ? "arc" : "hops";
        s.tween = {
          kind,
          from: { ...s.pose },
          target: mode,
          start: now,
          dur: s.reduced ? 0.01 : kind === "arc" ? 0.85 : 1.25,
        };
      }
      s.mode = mode;
    }

    let pose: BallPose;
    let morph = 1;
    let squash = 0;
    let shadow = 0;
    let ring = 0;
    let rollTarget: number | null = null;

    if (mode === "scrub") {
      const f = ballScrub(L, p);
      pose = { x: f.x, y: f.y, r: f.r };
      morph = f.morph;
      squash = f.squash;
      shadow = f.shadow;
      ring = f.ring;
      rollTarget = f.roll;
    } else if (s.tween) {
      const tw = s.tween;
      const u = clamp((now - tw.start) / tw.dur);
      const to = poseFor(tw.target);
      const f = tw.kind === "arc" ? arcTween(L, tw.from, to, u) : hopTween(L, tw.from, to, u);
      pose = { x: f.x, y: f.y, r: f.r };
      squash = f.squash;
      shadow = mode === "dock" ? 0 : clamp(1 - f.height / (vh * 0.4)) * 0.9;
      if (u >= 1) s.tween = null;
    } else {
      pose = poseFor(mode);
      shadow = mode === "dock" ? 0 : 0.9;
    }

    if (s.blend) {
      const u = clamp((now - s.blend.start) / 0.4);
      const e = easeOutCubic(u);
      pose = {
        x: lerp(s.blend.from.x, pose.x, e),
        y: lerp(s.blend.from.y, pose.y, e),
        r: lerp(s.blend.from.r, pose.r, e),
      };
      if (u >= 1) s.blend = null;
    }

    // Rodado: determinista en la intro, acumulado después.
    const dx = pose.x - s.pose.x;
    if (rollTarget !== null && !s.blend) s.roll = rollTarget;
    else s.roll -= dx / Math.max(pose.r, 1);
    s.pose = pose;

    s.hover = lerp(s.hover, s.hovering ? 1 : 0, 1 - Math.exp(-delta * 10));
    const settled = mode !== "scrub" && mode !== "dock" && !s.tween && !s.blend;
    const spinRate = (settled ? 0.35 : 0.15) + s.hover * 2.2;
    if (!s.reduced) s.spinY += delta * spinRate * morph;

    const bRoot = ball.root.current;
    const bSpin = ball.spin.current;
    const body = ball.body.current;
    if (bRoot && bSpin && body) {
      const u = unitAt(BALL_Z);
      const hoverScale = 1 + s.hover * 0.08;
      const rad = pose.r * hoverScale;
      bRoot.visible = rad > 0.01;
      bRoot.position.set(...toWorld(pose.x, pose.y + squash * rad, BALL_Z));
      bRoot.scale.set(rad * u * (1 + squash * 0.8), rad * u * (1 - squash), rad * u * (1 + squash * 0.8));
      const wobble = (1 - morph) * idle * Math.sin(t * 1.6) * 0.05;
      // El giro en Y se desvanece con el morph para que el badge vuelva a quedar de frente.
      const TAU = Math.PI * 2;
      const wrapped = ((s.spinY % TAU) + TAU) % TAU;
      const spinY = (wrapped > Math.PI ? wrapped - TAU : wrapped) * morph;
      bSpin.rotation.set(0, spinY, s.roll + wobble);
      const pulse = 1 + (1 - morph) * idle * Math.sin(t * 2.2) * 0.015;
      body.scale.set(pulse, pulse, lerp(0.05, 1, morph));
      ballMaterial.uniforms.uMorph.value = morph;
      ballMaterial.uniforms.uHover.value = s.hover;
    }

    const shadowMesh = ball.shadow.current;
    if (shadowMesh) {
      const floor = vh - L.margin;
      const h = clamp((floor - (pose.y + pose.r)) / (vh * 0.45));
      shadowMesh.visible = shadow > 0.01;
      shadowMesh.position.set(...toWorld(pose.x, floor - pose.r * 0.06, 0.5));
      const w = pose.r * 2.3 * (1 - 0.45 * h) * unitAt(0.5);
      shadowMesh.scale.set(w, w * 0.22, 1);
      (shadowMesh.material as THREE.MeshBasicMaterial).opacity = shadow * 0.5 * (1 - h * 0.7);
    }

    const ringMesh = ball.ring.current;
    if (ringMesh) {
      ringMesh.visible = ring > 0 && ring < 1;
      if (ringMesh.visible) {
        ringMesh.position.set(...toWorld(L.badge.x, L.badge.y, BALL_Z - 0.1));
        ringMesh.scale.setScalar(L.badge.r * (1 + easeOutCubic(ring) * 1.4) * unitAt(BALL_Z - 0.1));
        (ringMesh.material as THREE.MeshBasicMaterial).opacity = (1 - ring) * 0.85;
      }
    }

    // Botón accesible que sigue a la pelota.
    const link = s.dom.link;
    if (link) {
      const d = pose.r * 2;
      link.style.width = `${d}px`;
      link.style.height = `${d}px`;
      link.style.transform = `translate3d(${(pose.x - pose.r).toFixed(1)}px, ${(pose.y - pose.r).toFixed(1)}px, 0)`;
      const side = pose.x < vw / 2 ? "left" : "right";
      if (link.dataset.side !== side) link.dataset.side = side;
      const set = settled ? "true" : "false";
      if (link.dataset.settled !== set) link.dataset.settled = set;
    }
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight position={[-4, 6, 8]} intensity={1.9} />
      <directionalLight position={[5, -2, 4]} intensity={0.45} color="#9db8ff" />
      <directionalLight position={[6, 3, -5]} intensity={1.1} color="#dfe8ff" />
      {ghostRefs.map((ref, i) => (
        <PaddleGhost key={i} groupRef={ref} material={ghostMats[i]} />
      ))}
      <Paddle refs={paddle} />
      <Ball refs={ball} material={ballMaterial} />
    </>
  );
}
