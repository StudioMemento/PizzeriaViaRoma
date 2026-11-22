import type { ReactNode } from "react";
import { useOnApproach } from "../hooks/useOnApproach";
import { Chevron } from "./Icon";

export function TileArrow() {
  return <span className="tile-arrow" aria-hidden="true"><Chevron direction="right" /></span>;
}

const loadParticles = () => import("./bento/effects").then(module => module.bindParticles);

export function BentoGrid({ children, className }: { children: ReactNode; className: string }) {
  const ref = useOnApproach(loadParticles);
  return <div ref={ref} className={`bento-grid ${className}`}>{children}</div>;
}
