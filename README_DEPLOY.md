# Pizzeria Via Roma · V9.4

Vercel-ready static build. Upload this folder or the packaged ZIP directly to Vercel; `index.html` is the entry point.

## V9.4 masked bridge cinematic scroll film

- Four full-viewport checkpoints: Bancone, Entrata, Sala sinistra and Sala destra.
- The opening frame is static with a restrained idle drift, logo and claim.
- Native scrolling drives a damped, continuous video scrub in both directions; nothing force-snaps the page.
- Each checkpoint follows one reversible rhythm: blurred first frame and copy, copy dissolve, blur release, complete clip, moving end blur, masked hand-off, then the next first frame.
- The walkthrough has enough scroll distance to preserve the original full-clip frame density while adding the new text and blur holds.
- The final part of every clip continues moving while the blur rises instead of freezing before the transition.
- A dedicated, strongly blurred copy of the next exact first frame becomes fully opaque before the real scene changes underneath it.
- The incoming copy appears before that bridge closes, remains across the hidden switch and dissolves only while the new first frame is still masked.
- Full-screen copy can only become visible while the active photographic layers are already strongly blurred.
- Headlines remain on one line on desktop and exactly two authored lines on mobile.
- High-velocity scrolling traverses the longer bridge through a stricter visual delta cap, so checkpoints can be skipped without exposing a scene teleport.
- One quiet four-segment progress rail replaces the duplicated chapter indicators.
- The progress rail has a restrained local contrast bed so it remains readable over bright and dark frames.
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
