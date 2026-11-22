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
  const pizza = src.startsWith("assets/pizze/");
  const revision = pizza ? "?v=47" : src.startsWith("assets/gallery/") ? "?v=25" : "";
  const assetUrl = (path: string) => "/" + path + revision;
  const small = meta?.small === "-768.webp" ? src.replace(/\.webp$/, meta.small) : meta?.small;
  const srcSet = small ? `${assetUrl(small)} 768w, ${assetUrl(src)} ${meta.width}w` : undefined;
  return (
    <img
      sizes={small ? sizes : undefined}
      src={enabled && !(pizza && srcSet) ? assetUrl(src) : undefined}
      srcSet={enabled ? srcSet : undefined}
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
