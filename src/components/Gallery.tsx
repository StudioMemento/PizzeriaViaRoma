import data from "../data/photos.json";
import { useI18n } from "../i18n";
import { PhotoRibbon } from "./gallery/PhotoRibbon";

import { SpreadTitle } from "./SpreadTitle";

const rooms = ["esterno", "bancone", "sala_sinistra", "sala_destra", "via_roma"] as const;

export default function Gallery() {
  const { t, copy } = useI18n();
  return (
    <section id="gallery" className="venue-gallery" aria-label={copy.gallery}>
      {rooms.map(room => {
        const title = t.g_categories[room];
        const photos = data.GALLERY_ALBUMS[room].map((src, index) => ({
          src, caption: `${title} · ${copy.photo} ${index + 1}`,
        }));
        return <section className="screen-section venue-room" key={room} id={`album-${room}`} aria-labelledby={`title-${room}`}>
          <SpreadTitle id={`title-${room}`} text={title} />
          <PhotoRibbon photos={photos} title={title} />
        </section>;
      })}
    </section>
  );
}
