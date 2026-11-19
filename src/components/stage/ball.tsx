"use client";

import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { createDecalTexture, createShadowTexture, drawDecal } from "./textures";

const HOLES = 38;

/** Puntos de Fibonacci sobre la esfera: centros de los hoyos de la pickleball. */
function fibonacciPoints(n: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push(new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad).normalize());
  }
  return pts;
}

const vertexShader = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  void main() {
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uInk;
  uniform float uMorph;
  uniform float uHover;
  uniform sampler2D uDecal;
  uniform vec3 uHoles[${HOLES}];
  varying vec3 vObj;
  varying vec3 vNormalV;
  varying vec3 vViewPos;

  void main() {
    vec3 n = normalize(vNormalV);
    vec3 V = normalize(vViewPos);
    vec3 L = normalize(vec3(-0.5, 0.7, 0.8));
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(n, normalize(L + V)), 0.0), 36.0);
    float rim = pow(1.0 - max(dot(n, V), 0.0), 2.2);

    // Hoyos procedurales
    vec3 p = normalize(vObj);
    float best = -1.0;
    for (int i = 0; i < ${HOLES}; i++) best = max(best, dot(p, uHoles[i]));
    float ang = acos(clamp(best, -1.0, 1.0));
    float aa = max(fwidth(ang), 0.002);
    float holeR = 0.155;
    float hole = 1.0 - smoothstep(holeR - aa, holeR + aa, ang);
    float lip = smoothstep(holeR - 0.06, holeR, ang) * hole; // borde interior iluminado
    float holeAmt = smoothstep(0.35, 0.95, uMorph);

    vec3 base = uColor;
    vec3 inside = uColor * 0.38 + vec3(0.02, 0.03, 0.0);
    vec3 col = mix(base, mix(inside, uColor * 0.8, lip * 0.6), hole * holeAmt);

    // Badge plano ↔ pelota iluminada
    vec3 flatCol = col * (0.95 + 0.08 * n.y);
    vec3 lit = col * (0.42 + 0.7 * diff) + vec3(1.0) * spec * 0.28 * (1.0 - hole * holeAmt) + uColor * rim * 0.22;
    vec3 c = mix(flatCol, lit, smoothstep(0.0, 0.7, uMorph));
    c += uHover * 0.06;

    // Texto del badge proyectado sobre la cara frontal
    vec2 duv = vObj.xy * 0.5 + 0.5;
    vec4 d = texture2D(uDecal, duv);
    float front = step(0.0, vObj.z);
    float decal = d.a * front * (1.0 - smoothstep(0.02, 0.42, uMorph));
    c = mix(c, uInk, decal);

    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

export type BallRefs = {
  root: RefObject<THREE.Group | null>;
  spin: RefObject<THREE.Group | null>;
  body: RefObject<THREE.Mesh | null>;
  shadow: RefObject<THREE.Mesh | null>;
  ring: RefObject<THREE.Mesh | null>;
};

export function useBallMaterial() {
  const { material, decal } = useMemo(() => {
    const decal = createDecalTexture();
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color("#d7f25c") },
        uInk: { value: new THREE.Color("#0d1d4a") },
        uMorph: { value: 0 },
        uHover: { value: 0 },
        uDecal: { value: decal.tex },
        uHoles: { value: fibonacciPoints(HOLES) },
      },
    });
    return { material, decal };
  }, []);

  useEffect(() => {
    let alive = true;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() ||
      "Impact, sans-serif";
    const paint = () => {
      if (!alive) return;
      drawDecal(decal.canvas, family);
      decal.tex.needsUpdate = true;
    };
    paint();
    document.fonts
      ?.load(`italic 900 200px ${family}`)
      .then(paint)
      .catch(() => {});
    return () => {
      alive = false;
      decal.tex.dispose();
      material.dispose();
    };
  }, [decal, material]);

  return material;
}

export function Ball({ refs, material }: { refs: BallRefs; material: THREE.ShaderMaterial }) {
  const { shadowMat, ringMat } = useMemo(
    () => ({
      shadowMat: new THREE.MeshBasicMaterial({
        map: createShadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
      ringMat: new THREE.MeshBasicMaterial({
        color: "#d7f25c",
        transparent: true,
        depthWrite: false,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    }),
    []
  );

  useEffect(
    () => () => {
      shadowMat.map?.dispose();
      shadowMat.dispose();
      ringMat.dispose();
    },
    [shadowMat, ringMat]
  );

  return (
    <>
      <mesh ref={refs.shadow} material={shadowMat} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={refs.ring} material={ringMat} renderOrder={2} visible={false}>
        <ringGeometry args={[0.9, 1, 72]} />
      </mesh>
      <group ref={refs.root}>
        <group ref={refs.spin}>
          <mesh ref={refs.body} material={material} renderOrder={3}>
            <sphereGeometry args={[1, 96, 64]} />
          </mesh>
        </group>
      </group>
    </>
  );
}
