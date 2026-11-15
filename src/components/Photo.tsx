import data from "../data/images.json";
const images = data as Record<
  string,
  { width: number; height: number; small?: string }
>;
export function Photo({
  src,
  alt,
  className = "",
  eager = false,
  enabled = true,
  sizes = "(max-width: 700px) 90vw, 55vw",
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  /** Non-menu carousels can defer a resource without replacing its image element. */
  enabled?: boolean;
  sizes?: string;
}) {
  const meta = images[src];
  return (
    <img
      src={enabled ? `/${src}` : undefined}
      srcSet={
        enabled && meta?.small ? `/${meta.small} 768w, /${src} ${meta.width}w` : undefined
      }
      sizes={enabled && meta?.small ? sizes : undefined}
      alt={alt}
      width={meta?.width}
      height={meta?.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
