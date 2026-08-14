# Pizzeria Via Roma · V9.3

Vercel-ready static build. Upload this folder or the packaged ZIP directly to Vercel; `index.html` is the entry point.

## V9.3 continuous cinematic scroll film

- Four full-viewport checkpoints: Bancone, Entrata, Sala sinistra and Sala destra.
- The opening frame is static with a restrained idle drift, logo and claim.
- Native scrolling drives a damped, continuous video scrub in both directions; nothing force-snaps the page.
- Each checkpoint follows one reversible rhythm: blurred first frame and copy, copy dissolve, blur release, complete clip, end blur, then the next first frame.
- The walkthrough has enough scroll distance to preserve the original full-clip frame density while adding the new text and blur holds.
- Every clip reaches its exact last frame before the scene hand-off; the incoming scene is layered over the outgoing frame without a mid-fade brightness dip.
- Full-screen copy can only become visible while the active photographic layers are already strongly blurred.
- Headlines remain on one line on desktop and exactly two authored lines on mobile.
- High-velocity scrolling still traverses every blend window through a capped visual delta, so checkpoints can be skipped without a scene teleport.
- One quiet four-segment progress rail replaces the duplicated chapter indicators.
- Poster-only reduced-motion, Save-Data and playback-error fallbacks remain available.
- All four H.264 clips are fast-start encoded for reversible scrubbing, with no B-frames and a 125 ms keyframe interval.

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
