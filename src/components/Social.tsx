import { useI18n } from "../i18n";
import { socialProfiles } from "../data/venue-links";
import { BentoGrid, TileArrow } from "./BentoGrid";
import { SpreadTitle } from "./SpreadTitle";

export default function Social() {
  const { t } = useI18n();
  return <section id="social" className="closing-section" aria-labelledby="social-title">
    <SpreadTitle id="social-title" text={t.so_title} />
    <BentoGrid className="social-bento">
      {socialProfiles.map(({ id, href, name, artHeight }) => <a key={id} className={`bento-tile social-tile platform-${id}`}
        href={href} target="_blank" rel="noopener noreferrer">
        <img className="tile-art" src={`/assets/social/${id}.webp?v=46`} width="640" height={artHeight} loading="lazy" decoding="async" alt="" />
        <span className="tile-bottom"><span>{name}</span><TileArrow /></span>
      </a>)}
    </BentoGrid>
  </section>;
}
