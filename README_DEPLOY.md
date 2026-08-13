# Pizzeria Via Roma · V8.4 Vercel Deploy

This package is ready for a static Vercel deployment. The archive contains `index.html`, `README_DEPLOY.md`, and the complete `assets/` directory directly at its root.

## Deploy on Vercel

1. Extract the ZIP.
2. Upload the extracted contents to the root of the repository connected to Vercel.
3. Select the framework preset **Other**.
4. Leave **Build Command**, **Output Directory**, and environment variables empty.
5. Deploy.

No API keys, package installation, or build process are required. The location section uses a simple embedded Google Maps place map.

## V8.4 micro polish

- Rebuilt **Bancone / Entrata / Sala sinistra / Sala destra** as one scroll-driven place experience: a single sticky viewport with four cross-fading steps, direct step controls, image depth, and mobile-friendly navigation before the food sections begin.
- The bottom **Menù** navigation now lands on the pizza/category slider, so the visual pizza preview is the first menu checkpoint rather than being skipped.
- Kept the three equal price variants for **Birre alla spina** and **Vini della casa**, while right-aligning their labels and prices to match the printed-menu rhythm.
- Moved the gallery reel/progress cue **below the gallery dock** while preserving autoplay, pause/play, image count, album controls, and responsive albums.
- Rebuilt **La community** as a finite horizontal photo composition with swipe/drag, snapping, and a small progress line. Mobile users are no longer forced through a long vertical wall of raw customer photographs.
- Updated Social copy to **“Socials”** and **“Vivi l'attimo. Se ti va condividi il tuo ricordo.”** with equivalent EN / DE / FR copy.
- Removed the duplicated opening time in Info: the hours card now shows the time once, with the closure note on the secondary line.
- Aligned the Info logo box to the exact grid used by the map / utility dashboard below it.
- Made the live **Aperto ora / Chiuso ora** status a full-width end-to-end strip across the Info header.
- Replaced the older random ambient particle/orbit treatment with a shared **geometric dot-field system** across Community, Social and Info. Each section uses the same evenly spaced dot grammar but a different restrained idle motion: wave, diagonal drift, or radial ripple.
- Preserved the existing menu, pizza reel, gallery albums, review ticker, Google Maps embed, multi-language support, responsive behavior, parallax depth, and static Vercel deployment structure.

## Project structure

```text
index.html
README_DEPLOY.md
assets/
  community/
  gallery/
  menu/
  pizze/
  ...
```

Keep the relative paths and folder names unchanged when deploying.

## Adding community photographs later

1. Add an optimized WebP image inside `assets/community/`.
2. Add one object to the `CUSTOMER` array in `index.html` using the image path, contributor nickname, and aspect ratio.

Example:

```js
{src:"assets/community/new-photo.webp", name:"Nickname", ratio:"4 / 3"}
```

The horizontal reel automatically classifies portrait / regular / wide images from the ratio and keeps the section bounded on desktop and mobile.
