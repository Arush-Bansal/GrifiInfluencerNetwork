"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const HologramStage = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Custom shader logic for scanlines
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
        // Pulse scale slightly
        const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        meshRef.current.scale.set(s, 1, s);
    }
    if (glowRef.current) {
        glowRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* The Central Pedestal */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1.5, 1.8, 0.4, 64]} />
        <meshStandardMaterial 
            color="#FF8A65" 
            emissive="#FF8A65" 
            emissiveIntensity={4} 
            transparent 
            opacity={0.8}
            wireframe={true}
        />
      </mesh>

      {/* Decorative Outer Glow Ring */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial 
            color="#FF8A65" 
            emissive="#FF8A65" 
            emissiveIntensity={10} 
        />
      </mesh>

      {/* Inner "Digital" Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <circleGeometry args={[1.5, 64]} />
        <meshStandardMaterial 
            color="#050505" 
            roughness={0.1} 
            metalness={1}
            emissive="#FF8A65"
            emissiveIntensity={0.2}
        />
      </mesh>

      {/* Vertical Hologram Beam Lights */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 1.2, 1, Math.sin((i * Math.PI) / 2) * 1.2]}>
          <cylinderGeometry args={[0.01, 0.01, 2, 8]} />
          <meshBasicMaterial color="#FF8A65" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};
