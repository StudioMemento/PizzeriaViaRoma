import { useEffect, useRef } from "react";
import { useDialog } from "../DialogContext";
import type { SideSquaresController } from "./side-squares/controller";
import { SIDE_SQUARES } from "./side-squares/preset";

export function MenuSideSquares() {
  const viewport = useRef<HTMLDivElement>(null);
  const engine = useRef<SideSquaresController | null>(null);
  const { modal } = useDialog();
  const paused = useRef(!!modal);
  paused.current = !!modal;

  useEffect(() => {
    const layer = viewport.current;
    const section = layer?.parentElement?.parentElement;
    if (!layer || !section) return;
    let disposed = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import("./side-squares/controller").then(({ mountSideSquares }) => {
        if (!disposed) engine.current = mountSideSquares(section, layer, paused.current);
      }).catch(() => { /* The menu retains its plain background if the optional effect fails. */ });
    }, { rootMargin: "200px" });
    observer.observe(section);
    return () => {
      disposed = true;
      observer.disconnect();
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => { engine.current?.setPaused(!!modal); }, [modal]);

  return <div className="menu-side-background" aria-hidden="true">
    <div className="menu-side-viewport" ref={viewport}>
      <canvas className="menu-side-band" style={{ maxWidth: SIDE_SQUARES.maxFieldWidth }} />
      <canvas className="menu-side-band" style={{ maxWidth: SIDE_SQUARES.maxFieldWidth }} />
    </div>
  </div>;
}
