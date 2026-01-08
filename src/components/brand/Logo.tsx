import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image
        src="/logo.png"
        alt="Grifi Logo"
        width={size}
        height={size}
        className="object-contain rounded-md"
        priority
      />
    </div>
  );
}
