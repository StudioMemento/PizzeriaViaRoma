type Handlers = {
  begin(): void;
  move(pixels: number, seconds: number): void;
  end(coast: boolean): void;
};

type Gesture = {
  id: number; touch: boolean; x: number; y: number; lastX: number;
  time: number; horizontal: boolean;
};

/** A single contact owns one axis until release. Touch scrolling and zoom stay native. */
export function bindHorizontalDrag(stage: HTMLElement, signal: AbortSignal, handlers: Handlers, edgeInset = 16) {
  const passive = { signal, passive: true };
  let gesture: Gesture | undefined;
  let skipClick = false;

  function begin(id: number, x: number, y: number, time: number, touch: boolean) {
    skipClick = false;
    gesture = { id, touch, x, y, lastX: x, time, horizontal: false };
    handlers.begin();
  }
  function finish(coast = false, time = 0) {
    if (!gesture) return;
    const g = gesture;
    gesture = undefined;
    skipClick = g.horizontal;
    stage.classList.remove("is-dragging");
    if (!g.touch && stage.hasPointerCapture(g.id)) stage.releasePointerCapture(g.id);
    handlers.end(coast && g.horizontal && time - g.time < 110);
  }
  function move(x: number, y: number, time: number, touch?: TouchEvent) {
    const g = gesture;
    if (!g) return;
    if (!g.horizontal) {
      const dx = Math.abs(x - g.x), dy = Math.abs(y - g.y);
      if (Math.max(dx, dy) < 4) return;
      if (dy >= dx * .8) { finish(); return; }
      g.horizontal = true;
      stage.classList.add("is-dragging");
      if (!touch) stage.setPointerCapture(g.id);
    }
    if (touch) {
      if (!touch.cancelable) { finish(); return; }
      touch.preventDefault();
    }
    if (g.lastX === x) return;
    handlers.move(g.lastX - x, Math.max(.008, (time - g.time) / 1000));
    g.lastX = x;
    g.time = time;
  }
  stage.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) { finish(); return; }
    const finger = e.touches[0];
    if (finger.clientX < edgeInset || finger.clientX > window.innerWidth - edgeInset) return;
    begin(finger.identifier, finger.clientX, finger.clientY, e.timeStamp, true);
  }, passive);
  stage.addEventListener("touchmove", e => {
    if (!gesture?.touch) return;
    if (e.touches.length !== 1) { finish(); return; }
    const finger = e.touches[0];
    if (finger.identifier === gesture.id) move(finger.clientX, finger.clientY, e.timeStamp, e);
  }, { signal, passive: false });
  function endTouch(e: TouchEvent) {
    if (gesture?.touch && Array.from(e.changedTouches).some(t => t.identifier === gesture?.id)) {
      finish(e.type === "touchend", e.timeStamp);
    }
  }
  stage.addEventListener("touchend", endTouch, passive);
  stage.addEventListener("touchcancel", endTouch, passive);
  stage.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch" && e.isPrimary && e.button === 0) begin(e.pointerId, e.clientX, e.clientY, e.timeStamp, false);
  }, passive);
  stage.addEventListener("pointermove", e => {
    if (gesture && !gesture.touch && gesture.id === e.pointerId) move(e.clientX, e.clientY, e.timeStamp);
  }, passive);
  function endPointer(e: PointerEvent) {
    if (gesture && !gesture.touch && gesture.id === e.pointerId) finish(e.type === "pointerup", e.timeStamp);
  }
  window.addEventListener("pointerup", endPointer, passive);
  window.addEventListener("pointercancel", endPointer, passive);
  stage.addEventListener("lostpointercapture", e => { if (e.target === stage) endPointer(e); }, passive);
  stage.addEventListener("click", e => {
    if (skipClick && e.detail) { e.preventDefault(); e.stopPropagation(); }
    skipClick = false;
  }, { signal, capture: true });
  window.addEventListener("pagehide", () => finish(), passive);
  signal.addEventListener("abort", () => finish(), { once: true });
}
