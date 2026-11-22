import { HoloCard } from "./intro/HoloCard";
import { Chevron } from "./Icon";

type FeatureCardProps = {
  id: string;
  titleId: string;
  heading: string;
  caption?: string;
  imageBase: string;
  link?: { href: string; label: string };
};

export function FeatureCard({ id, titleId, heading, caption, imageBase, link }: FeatureCardProps) {
  return (
    <section className="takeaway" id={id} aria-labelledby={titleId}>
      <HoloCard>
        <img className="crust-photo" src={`${imageBase}-960.webp`}
          srcSet={`${imageBase}-480.webp 480w, ${imageBase}-960.webp 960w, ${imageBase}-1600.webp 1600w`}
          sizes="(min-width:2400px) 40vw, (min-width:1200px) 60vw, (min-width:768px) 70vw, 80vw"
          width="1600" height="900" loading="lazy" decoding="async" draggable={false} alt="" />
        <div className="crust-card-shade" aria-hidden="true" />
        <div className="takeaway-copy">
          <h2 id={titleId}>{heading}{link && <Chevron direction="right" />}</h2>
          {caption && <p>{caption}</p>}
        </div>
        {link && <a className="feature-card-link" href={link.href} target="_blank" rel="noopener noreferrer"
          aria-label={`${heading} ${link.label}`} />}
      </HoloCard>
    </section>
  );
}
