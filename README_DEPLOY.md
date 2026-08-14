# Pizzeria Via Roma · V9

Vercel-ready static build. Upload this folder or the packaged ZIP directly to Vercel; `index.html` is the entry point.

## V9 cinematic walkthrough

- Four full-viewport checkpoints: Bancone, Entrata, Sala sinistra and Sala destra.
- One wheel, swipe or keyboard intent advances exactly one checkpoint and plays its complete clip.
- Each clip resolves into a soft cinematic blend; its logo or copy remains visible until the next intent.
- Minimal chapter counter and four fine progress segments replace the previous side indicator.
- Poster, reduced-motion, Save-Data and playback-error fallbacks remain available.

## V9 interaction and media cleanup

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
