"use client";

import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { createFaceTextures, createGripTexture } from "./textures";

/** Longitud del mango; la cara empieza aquí (unidades de raqueta). */
export const HANDLE_LEN = 0.44;
/** Media anchura de la cara en su punto más ancho (el lienzo de la cara cubre ±FACE_HW). */
export const FACE_HW = 0.28;

const GRIP_R = 0.073;
const GRIP_FROM = 0.036;
const GRIP_TO = HANDLE_LEN - 0.03;

/**
 * Contorno de la cara (y = 0 en el cuello, y = 1 arriba): raqueta elongada de
 * lados casi paralelos, punta redondeada y un abanico corto hacia el cuello.
 */
function traceOutline<P extends THREE.Path>(path: P, inset: number): P {
  const hw = FACE_HW - inset;
  const top = 1 - inset;
  const neck = 0.056 - inset * 0.5;
  const low = 0.36;
  const high = 0.78;
  const shoulder = 0.96 - inset * 0.3;
  path.moveTo(-neck, 0);
  path.bezierCurveTo(-neck - 0.015, 0.09, -hw, 0.13, -hw, low);
  path.lineTo(-hw, high);
  path.bezierCurveTo(-hw, shoulder, -hw * 0.66, top, 0, top);
  path.bezierCurveTo(hw * 0.66, top, hw, shoulder, hw, high);
  path.lineTo(hw, low);
  path.bezierCurveTo(hw, 0.13, neck + 0.015, 0.09, neck, 0);
  return path;
}

/** Perfil de vuelta del grip: overgrip enrollado en bandas que se enciman. */
function gripProfile() {
  const pts: THREE.Vector2[] = [];
  const period = 0.05;
  for (let y = GRIP_FROM; y <= GRIP_TO + 1e-6; y += 0.0025) {
    const f = ((y - GRIP_FROM) / period) % 1;
    const ridge = THREE.MathUtils.smoothstep(f, 0, 0.85) * (1 - THREE.MathUtils.smoothstep(f, 0.88, 1));
    const taper = 0.003 * (1 - y / HANDLE_LEN);
    pts.push(new THREE.Vector2(GRIP_R + taper + ridge * 0.0085, y));
  }
  return pts;
}

const lathe = (pts: number[][], y0 = 0, segments = 48) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y + y0)),
    segments
  );

function useFaceGeometry() {
  return useMemo(() => {
    // Cara: placa delgada con UV plano (el lienzo cubre x ∈ [-FACE_HW, FACE_HW], y ∈ [0, 1]).
    const face = new THREE.ExtrudeGeometry(traceOutline(new THREE.Shape(), 0.022), {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 40,
    });
    face.translate(0, 0, -0.015);
    const pos = face.attributes.position;
    const uv = face.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) + FACE_HW) / (2 * FACE_HW), pos.getY(i));
    }
    uv.needsUpdate = true;

    // Protector de borde: tubo redondeado y grueso que abraza el contorno.
    // Los extremos bajan dentro del collarín del mango.
    const path = traceOutline(new THREE.Path(), 0.008);
    const outline = path.getSpacedPoints(420).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const first = outline[0];
    const last = outline[outline.length - 1];
    outline.unshift(new THREE.Vector3(first.x, -0.035, 0));
    outline.push(new THREE.Vector3(last.x, -0.035, 0));
    const guard = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(outline, false, "centripetal"),
      520,
      0.024,
      18,
      false
    );
    guard.scale(1, 1, 1.45);

    return { face, guard };
  }, []);
}

function useHandleGeometry() {
  return useMemo(() => {
    // Mango: grip con bandas, collarín bajo la cara y tapa en la base.
    const grip = new THREE.LatheGeometry(gripProfile(), 56);
    const gpos = grip.attributes.position;
    const guv = grip.attributes.uv;
    const circ = 2 * Math.PI * GRIP_R;
    for (let i = 0; i < gpos.count; i++) guv.setY(i, (gpos.getY(i) - GRIP_FROM) / circ);
    guv.needsUpdate = true;

    const collar = lathe(
      [
        [0, -0.05],
        [0.07, -0.05],
        [0.079, -0.044],
        [0.0845, -0.03],
        [0.0865, -0.01],
        [0.0865, 0.022],
        [0.0835, 0.038],
        [0.076, 0.05],
        [0.062, 0.056],
        [0, 0.056],
      ],
      HANDLE_LEN
    );
    const cap = lathe([
      [0, 0],
      [0.064, 0],
      [0.078, 0.005],
      [0.0855, 0.016],
      [0.0865, 0.03],
      [0.081, 0.042],
      [0.072, 0.05],
      [0, 0.05],
    ]);

    return { grip, collar, cap };
  }, []);
}

export type PaddleRefs = {
  root: RefObject<THREE.Group | null>;
  lean: RefObject<THREE.Group | null>;
  twist: RefObject<THREE.Group | null>;
};

export function Paddle({ refs }: { refs: PaddleRefs }) {
  const faceGeo = useFaceGeometry();
  const handleGeo = useHandleGeometry();
  const geo = { ...faceGeo, ...handleGeo };

  const materials = useMemo(() => {
    const { map, grain } = createFaceTextures();
    const gripMap = createGripTexture();
    return {
      face: new THREE.MeshStandardMaterial({
        map,
        bumpMap: grain,
        bumpScale: 1.4,
        roughness: 0.9,
        metalness: 0,
      }),
      guard: new THREE.MeshStandardMaterial({ color: "#ddd4c3", roughness: 0.42, metalness: 0 }),
      grip: new THREE.MeshStandardMaterial({
        map: gripMap,
        bumpMap: gripMap,
        bumpScale: 2.4,
        roughness: 0.8,
      }),
      trim: new THREE.MeshStandardMaterial({ color: "#dcd4c4", roughness: 0.48, metalness: 0 }),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(faceGeo).forEach((g) => g.dispose());
      Object.values(handleGeo).forEach((g) => g.dispose());
      materials.face.map?.dispose();
      materials.face.bumpMap?.dispose();
      materials.grip.map?.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [faceGeo, handleGeo, materials]
  );

  return (
    <group ref={refs.root}>
      <group ref={refs.lean}>
        <group ref={refs.twist}>
          <mesh geometry={geo.cap} material={materials.trim} />
          <mesh geometry={geo.grip} material={materials.grip} />
          <mesh geometry={geo.collar} material={materials.trim} />
          <group position={[0, HANDLE_LEN, 0]}>
            <mesh geometry={geo.face} material={materials.face} />
            <mesh geometry={geo.guard} material={materials.guard} />
          </group>
        </group>
      </group>
    </group>
  );
}

/** Siluetas translúcidas que siguen a la raqueta durante el swing (motion blur). */
export function PaddleGhost({ groupRef, material }: { groupRef: RefObject<THREE.Group | null>; material: THREE.Material }) {
  const geo = useFaceGeometry();
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  return (
    <group ref={groupRef} visible={false}>
      <group position={[0, HANDLE_LEN, 0]}>
        <mesh geometry={geo.face} material={material} />
        <mesh geometry={geo.guard} material={material} />
      </group>
    </group>
  );
}
