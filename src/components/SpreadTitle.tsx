import type { CSSProperties } from "react";

export function SpreadLetters({ text }: { text: string }) {
  return Array.from(text).map((char, i) => <span className={char === " " ? "spread-space" : undefined} key={i}>{char}</span>);
}

export function SpreadTitle({ id, text, splitAfter }: { id: string; text: string; splitAfter?: number }) {
  const words = text.trim().split(/\s+/);
  const lines = splitAfter ? [words.slice(0, splitAfter).join(" "), words.slice(splitAfter).join(" ")] : [text];
  const style = { "--line-letters": Math.max(...lines.map(line => Array.from(line).length)) } as CSSProperties;
  return <h2 id={id} className="spread-title" aria-label={text} style={style}>
    <span className="spread-ink" aria-hidden="true">
      {lines.map((line, row) => <span className="spread-line" key={row}>
        <SpreadLetters text={line} />
      </span>)}
    </span>
  </h2>;
}
