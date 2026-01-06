"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  activeClassName?: string;
  pendingClassName?: string; // Kept for compat, unused
  to: string; // Map to href
  href?: string; // Optional if they use href
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName: _pendingClassName, to, href, ...props }, ref) => {
    const pathname = usePathname();
    const target = to || href || "";
    const isActive = pathname === target;

    return (
      <Link
        ref={ref}
        href={target}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
