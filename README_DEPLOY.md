# Pizzeria Via Roma · V9.2

Vercel-ready static build. Upload this folder or the packaged ZIP directly to Vercel; `index.html` is the entry point.

## V9.2 cinematic scroll film

- Four full-viewport checkpoints: Bancone, Entrata, Sala sinistra and Sala destra.
- The opening frame is static with a restrained idle drift, logo and claim.
- Native scrolling drives a continuous, eased video scrub in both directions; nothing force-snaps the page.
- Every clip remains fully visible through its eased first-to-last-frame motion.
- Only after the final frame does a short blur blend reveal the exact first frame of the following clip.
- Full-screen copy enters near the end of each transition and leaves with a reversible fade-and-blur treatment.
- Headlines remain on one line on desktop and exactly two authored lines on mobile.
- High-velocity scrolling suppresses intermediate copy and rapidly follows the destination, so all checkpoints can be skipped without snapping.
- One quiet four-segment progress rail replaces the duplicated chapter indicators.
- Poster-only reduced-motion, Save-Data and playback-error fallbacks remain available.

## Interaction and media cleanup

- Context menus, long-press callouts, image dragging and accidental text selection are suppressed site-wide.
- Device-orientation and gyroscope permission code has been removed.
- Menu-category and pizza rails now drift continuously at restrained speeds, pause for interaction and remain free-glide on touch.
- Mobile category artwork uses its full 4.2:1 composition without cropping or overflowing the viewport.
- Gallery rebuilt around five albums using the supplied 3840 × 2440 images: Bancone, Sala sinistra, Sala destra, Esterno and Via Roma.
- Superseded gallery files, covers and legacy hero stills have been removed from the deploy package.

## Preserved experience

- Multilingual Italian, English, German and French content.
- Printed menu, allergen guide, pizza lightbox with ingredients, community reel, reviews ticker, social links and live opening state.
- Responsive bottom navigation and desktop/mobile layouts.
