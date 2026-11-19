"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Director } from "./director";
import { LOW_POWER } from "./quality";

function Environment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.5;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      flat
      dpr={[1, LOW_POWER ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 10], fov: 28, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        // Verificar cada shader obliga a esperar su compilación (bloquea el hilo principal).
        if (process.env.NODE_ENV === "production") gl.debug.checkShaderErrors = false;
        document.documentElement.dataset.webgl = "ready";
      }}
    >
      <Environment />
      <Director />
    </Canvas>
  );
}
