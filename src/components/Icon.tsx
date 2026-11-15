export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return <i className={`ph-thin ph-${name} ${className}`} aria-hidden="true" />;
}
export function Chevron({
  direction = "down",
}: {
  direction?: "left" | "right" | "down";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      style={{
        transform:
          direction === "left"
            ? "rotate(90deg)"
            : direction === "right"
              ? "rotate(-90deg)"
              : undefined,
      }}
    >
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
