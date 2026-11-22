import { useRef, type ReactNode } from "react";
import { useHoloTilt } from "./useHoloTilt";

export function HoloCard({ children }: { children: ReactNode }) {
  const shell = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLElement>(null);
  useHoloTilt(shell, face);
  return <div className="crust-card-shell" data-effect="tilt" ref={shell}>
    <article className="crust-card" ref={face}>{children}</article>
  </div>;
}
