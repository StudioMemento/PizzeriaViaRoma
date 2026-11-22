import { useLayoutEffect, useRef } from "react";
import { useIntroVisibility } from "../intro/useIntroVisibility";

/** Fit the real type, including translations, without stretching its glyphs. */
export function useTitleFit(text: string) {
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const el = heading.current;
    const label = el?.firstElementChild as HTMLElement | null;
    if (!el || !label) return;
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      const type = getComputedStyle(label);
      // The final tracking advance sits outside the visible word. Store a ratio
      // so CSS can resize the type in the same layout pass as its container.
      const wordWidth = label.getBoundingClientRect().width - (parseFloat(type.letterSpacing) || 0);
      if (wordWidth > 0) el.style.setProperty("--menu-title-scale", String(parseFloat(type.fontSize) / wordWidth));
    };
    fit();
    void document.fonts.ready.then(fit);
    return () => { disposed = true; };
  }, [text]);
  return heading;
}

export function MenuTitle({ text }: { text: string }) {
  const visibility = useIntroVisibility();
  const heading = useTitleFit(text);
  return <header className="menu-head" ref={visibility}>
    <h2 ref={heading}><span>{text}</span></h2>
  </header>;
}
