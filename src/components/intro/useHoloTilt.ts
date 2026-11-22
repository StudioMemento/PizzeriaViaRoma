import { useEffect, type RefObject } from "react";

export function useHoloTilt(shellRef: RefObject<HTMLDivElement | null>, faceRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const shell = shellRef.current, face = faceRef.current;
    if (!shell || !face) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, disposed = false, boundsDirty = true;
    let bounds = { left: 0, top: 0, width: 1, height: 1 };
    let x = 0, y = 0, active = false;
    let drag: { id: number; x: number; y: number; locked: boolean } | null = null;
    const paint = () => {
      frame = 0;
      if (disposed) return;
      face.style.setProperty("--pointer-x", x.toFixed(3));
      face.style.setProperty("--pointer-y", y.toFixed(3));
      if (shell.dataset.tiltActive !== String(active)) shell.dataset.tiltActive = String(active);
    };
    const queue = () => { if (!frame && !disposed) frame = requestAnimationFrame(paint); };
    const reset = () => {
      const changed = active || x !== 0 || y !== 0 || frame !== 0;
      const current = drag; drag = null;
      if (current && shell.hasPointerCapture(current.id)) shell.releasePointerCapture(current.id);
      x = y = 0; active = false;
      if (changed) queue();
    };
    const measure = () => { bounds = shell.getBoundingClientRect(); boundsDirty = false; };
    const invalidate = () => { boundsDirty = true; reset(); };
    const follow = (event: PointerEvent) => {
      if (media.matches) return;
      if (boundsDirty) measure();
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height) * 2 - 1));
      active = true; queue();
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === "mouse") { measure(); follow(event); } };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary || media.matches) return;
      measure();
      if (event.pointerType === "mouse") follow(event);
      else drag = { id: event.pointerId, x: event.clientX, y: event.clientY, locked: false };
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") { follow(event); return; }
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      // A vertical gesture remains native page scroll. Horizontal touch drag
      // controls the image, including Y movement once the gesture is engaged.
      if (!drag.locked && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { reset(); return; }
      if (!drag.locked && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        drag.locked = true; shell.setPointerCapture(event.pointerId);
      }
      if (drag.locked) follow(event);
    };
    const leave = (event: PointerEvent) => { if (event.pointerType === "mouse" || !drag?.locked) reset(); };
    const end = (event: PointerEvent) => { if (event.pointerType !== "mouse" || event.type === "pointercancel") reset(); };
    const onVisibility = () => { if (document.hidden) { reset(); if (frame) { cancelAnimationFrame(frame); frame = 0; paint(); } } };
    // Touch starts with implicit capture on the image. Its release bubbles when
    // horizontal dragging transfers capture to the frame.
    const lostCapture = (event: PointerEvent) => {
      if (event.target === shell && drag?.id === event.pointerId) reset();
    };
    const events = { pointerenter: enter, pointerdown: down, pointermove: move, pointerleave: leave, pointerup: end, pointercancel: end, lostpointercapture: lostCapture };
    for (const [name, handler] of Object.entries(events)) shell.addEventListener(name, handler as EventListener, { passive: true });
    media.addEventListener("change", reset);
    window.addEventListener("resize", invalidate, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      reset(); disposed = true; cancelAnimationFrame(frame);
      for (const [name, handler] of Object.entries(events)) shell.removeEventListener(name, handler as EventListener);
      media.removeEventListener("change", reset);
      window.removeEventListener("resize", invalidate); window.removeEventListener("scroll", invalidate);
      document.removeEventListener("visibilitychange", onVisibility);
      face.style.removeProperty("--pointer-x"); face.style.removeProperty("--pointer-y");
      delete shell.dataset.tiltActive;
    };
  }, [shellRef, faceRef]);
}
