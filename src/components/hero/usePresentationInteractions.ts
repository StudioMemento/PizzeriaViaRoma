import { useEffect } from "react";

/** Suppress the requested browser gestures without intercepting wheel/touch
 * scrolling, primary clicks, slider drags, keyboard navigation or form editing. */
export function usePresentationInteractions() {
  useEffect(() => {
    const editable = (target: EventTarget | null) => target instanceof Element
      && Boolean(target.closest('input,textarea,[contenteditable="true"]'));
    const blockMenu = (event: Event) => event.preventDefault();
    const blockMiddle = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
    const blockSelection = (event: Event) => { if (!editable(event.target)) event.preventDefault(); };
    document.addEventListener("contextmenu", blockMenu);
    document.addEventListener("mousedown", blockMiddle);
    document.addEventListener("auxclick", blockMiddle);
    document.addEventListener("selectstart", blockSelection);
    document.addEventListener("dragstart", blockSelection);
    return () => {
      document.removeEventListener("contextmenu", blockMenu);
      document.removeEventListener("mousedown", blockMiddle);
      document.removeEventListener("auxclick", blockMiddle);
      document.removeEventListener("selectstart", blockSelection);
      document.removeEventListener("dragstart", blockSelection);
    };
  }, []);
}
