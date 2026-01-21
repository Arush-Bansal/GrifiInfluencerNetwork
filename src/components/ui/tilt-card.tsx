"use client";

import React, { useRef, useState } from "react";
import { 
    motion, 
    useMotionValue, 
    useSpring, 
    useTransform,
    AnimatePresence
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltReverse?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
    children, 
    className,
    tiltReverse = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion Values for cursor position (0 to 1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs for the motion values
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Map position to rotation (-10deg to 10deg)
  const rotateX = useTransform(springY, [0, 1], tiltReverse ? [12, -12] : [-12, 12]);
  const rotateY = useTransform(springX, [0, 1], tiltReverse ? [-12, 12] : [12, -12]);

  // Glare position
  const glareX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [0, 1], ["0%", "100%"]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={cn(
        "relative transition-transform duration-200 ease-out",
        className
      )}
    >
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 h-full w-full">
        {children}
      </div>

      {/* Dynamic Glare Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              pointerEvents: "none",
              zIndex: 20,
              borderRadius: "inherit",
            }}
          />
        )}
      </AnimatePresence>

      {/* Background Shadow depth */}
      <div 
        className="absolute inset-0 bg-slate-900/10 blur-2xl -z-10 rounded-[inherit] transition-opacity duration-300 pointer-events-none" 
        style={{ 
            opacity: isHovered ? 0.3 : 0,
            transform: "translateZ(-10px) scale(0.95)"
        }} 
      />
    </motion.div>
  );
};
