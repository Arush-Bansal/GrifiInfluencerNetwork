"use client";

import React from "react";
import { Float } from "@react-three/drei";

export const HologramCard = () => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[0, 1.8, 0]}>
                <planeGeometry args={[1.2, 1.6]} />
                <meshStandardMaterial 
                    transparent 
                    opacity={0.1}
                    color="#FF8A65"
                    emissive="#FF8A65"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
};
