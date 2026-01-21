"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

const StarField = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Create 2000 random star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    let seed = 1;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i < 2000; i++) {
      const radius = 10 + random() * 40;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
        ref.current.rotation.y = state.clock.elapsedTime * 0.05;
        ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FF8A65"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// A single orbiting data point (Icon or Avatar)
const OrbitingIcon = ({ radius, speed, offset, color }: { radius: number; speed: number; offset: number; color: string }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime * speed + offset;
            ref.current.position.x = Math.cos(t) * radius;
            ref.current.position.z = Math.sin(t) * radius;
            ref.current.position.y = Math.sin(t * 0.5) * (radius * 0.2);
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={ref}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive={color} 
                        emissiveIntensity={2} 
                        roughness={0} 
                        metalness={1}
                    />
                </mesh>
            </Float>
        </group>
    );
};

export const SocialGalaxy = () => {
  return (
    <group>
      <StarField />
      
      {/* Orbiting Elements */}
      <OrbitingIcon radius={5} speed={0.4} offset={0} color="#FF8A65" />
      <OrbitingIcon radius={8} speed={0.3} offset={2} color="#4FC3F7" />
      <OrbitingIcon radius={11} speed={0.2} offset={4} color="#FFD54F" />
      <OrbitingIcon radius={14} speed={0.15} offset={1} color="#BA68C8" />
      <OrbitingIcon radius={18} speed={0.1} offset={5} color="#FF8A65" />
    </group>
  );
};
