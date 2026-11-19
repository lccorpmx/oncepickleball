import * as THREE from "three";

const LIME = "#d7f25c";
const CREAM = "#efe9da";
const NAVY = "#0d1d4a";

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible");
  return { canvas, ctx };
}

function finish(canvas: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Dibuja el isotipo ONCE (anillo + dos barras) centrado en (cx, cy). */
function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, ring: string) {
  const gap = 0.56; // radianes de apertura arriba (media apertura)
  ctx.save();
  ctx.lineWidth = r * 0.24;
  ctx.strokeStyle = ring;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2 + gap, -Math.PI / 2 - gap + Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = LIME;
  const barW = r * 0.24;
  const top = cy - r * 1.32;
  const bottom = cy - r * 0.05;
  const slant = r * 0.18;
  for (const offset of [-r * 0.2, r * 0.2]) {
    const x = cx + offset - slant / 2;
    ctx.beginPath();
    ctx.moveTo(x - barW / 2, top);
    ctx.lineTo(x + barW / 2, top);
    ctx.lineTo(x + barW / 2 + slant, bottom);
    ctx.lineTo(x - barW / 2 + slant, bottom);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Generador pseudoaleatorio determinista (xorshift32). */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Lienzo de ruido gris (grano tipo lija/fieltro), para mezclar y como bump. */
function grainCanvas(w: number, h: number, seed: number, spread: number) {
  const { canvas, ctx } = makeCanvas(w, h);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const rand = rng(seed);
  for (let i = 0; i < d.length; i += 4) {
    let n = 128 + (rand() - 0.5) * spread;
    if (rand() < 0.05) n += (rand() - 0.5) * spread * 1.6;
    d[i] = d[i + 1] = d[i + 2] = n;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Ancho / alto del lienzo de la cara (coincide con 2·FACE_HW / 1 en paddle.tsx). */
const FACE_ASPECT = 0.5625;

/**
 * Cara de la raqueta: teal con grano, franja recta y el isotipo ONCE.
 * El lienzo cubre la cara completa: u = (x + FACE_HW) / (2·FACE_HW), v = y.
 */
export function createFaceTextures() {
  const H = 2048;
  const W = Math.round(H * FACE_ASPECT);
  const { canvas, ctx } = makeCanvas(W, H);

  const base = ctx.createRadialGradient(W * 0.44, H * 0.4, 60, W * 0.5, H * 0.5, H * 0.62);
  base.addColorStop(0, "#236b6e");
  base.addColorStop(0.55, "#1d5e62");
  base.addColorStop(1, "#154a51");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Franja recta: del borde izquierdo (v ≈ 0.5) al derecho (v ≈ 0.13).
  const y0 = H * (1 - 0.5);
  const y1 = H * (1 - 0.13);
  const ext = 0.2;
  ctx.save();
  ctx.strokeStyle = "#d9e3dc";
  ctx.lineWidth = W * 0.07;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(-ext * W, y0 - (y1 - y0) * ext);
  ctx.lineTo(W * (1 + ext), y1 + (y1 - y0) * ext);
  ctx.stroke();
  ctx.restore();

  drawMark(ctx, W * 0.5, H * (1 - 0.64), W * 0.165, CREAM);

  // Grano: ruido de baja resolución, suavizado, en modo overlay (se ve a tamaño de pantalla).
  const grain = grainCanvas(Math.round(W / 3), Math.round(H / 3), 11, 150);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.42;
  ctx.drawImage(grain, 0, 0, W, H);
  ctx.globalAlpha = 0.18;
  ctx.drawImage(grainCanvas(W, H, 23, 120), 0, 0);
  ctx.restore();

  const grainTex = new THREE.CanvasTexture(grain);
  grainTex.anisotropy = 8;
  return { map: finish(canvas), grain: grainTex };
}

/** Overgrip blanco perforado. Un mosaico = una vuelta completa (u alrededor, v a lo largo). */
export function createGripTexture() {
  const S = 512;
  const { canvas, ctx } = makeCanvas(S, S);
  ctx.fillStyle = "#e3dccf";
  ctx.fillRect(0, 0, S, S);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.35;
  ctx.drawImage(grainCanvas(S / 2, S / 2, 5, 120), 0, 0, S, S);
  ctx.restore();

  // Perforaciones en tresbolillo, con un brillo leve en el borde inferior.
  const cols = 18;
  const step = S / cols;
  for (let row = 0; row < cols; row++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + (row % 2 ? 0.5 : 0)) * step;
      const y = (row + 0.5) * step;
      for (const dx of [0, -S, S]) {
        const cx = x + dx;
        if (cx < -step || cx > S + step) continue;
        const g = ctx.createRadialGradient(cx, y, 0, cx, y, 5.5);
        g.addColorStop(0, "rgba(96,86,72,0.85)");
        g.addColorStop(0.7, "rgba(120,108,92,0.55)");
        g.addColorStop(1, "rgba(120,108,92,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(cx, y + 4.6, 2.4, 0, Math.PI);
        ctx.fill();
      }
    }
  }
  const tex = finish(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Texto "RESERVA TU CANCHA" que se proyecta en la cara frontal del badge. */
export function drawDecal(canvas: HTMLCanvasElement, fontFamily: string) {
  const S = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, S, S);
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.rotate(-0.07);
  ctx.fillStyle = NAVY;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const fit = (text: string, max: number, size: number) => {
    ctx.font = `italic 900 ${size}px ${fontFamily}`;
    const w = ctx.measureText(text).width;
    return w > max ? (size * max) / w : size;
  };
  const s1 = fit("RESERVA", S * 0.66, S * 0.25);
  ctx.font = `italic 900 ${s1}px ${fontFamily}`;
  ctx.fillText("RESERVA", 0, -S * 0.005);
  const s2 = fit("TU CANCHA", S * 0.76, S * 0.21);
  ctx.font = `italic 900 ${s2}px ${fontFamily}`;
  ctx.fillText("TU CANCHA", 0, S * 0.2);
  ctx.restore();
}

export function createDecalTexture() {
  const { canvas } = makeCanvas(1024, 1024);
  const tex = finish(canvas);
  return { canvas, tex };
}

/** Sombra suave para el "piso" bajo la bola. */
export function createShadowTexture() {
  const S = 256;
  const { canvas, ctx } = makeCanvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(5,12,40,0.9)");
  g.addColorStop(0.45, "rgba(5,12,40,0.45)");
  g.addColorStop(1, "rgba(5,12,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return finish(canvas, false);
}
