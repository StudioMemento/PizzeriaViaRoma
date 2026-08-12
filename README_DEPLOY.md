# Pizzeria Via Roma · V8.3 Vercel Deploy

This package is ready for a static Vercel deployment. The archive contains `index.html`, `README_DEPLOY.md`, and the complete `assets/` directory directly at its root.

## Deploy on Vercel

1. Extract the ZIP.
2. Upload the extracted contents to the root of the repository connected to Vercel.
3. Select the framework preset **Other**.
4. Leave **Build Command**, **Output Directory**, and environment variables empty.
5. Deploy.

No API keys, package installation, or build process are required. The location section uses a simple embedded Google Maps place map.

## V8.3 final polish

- Restored full menu consistency for **Birre alla spina** and **Vini della casa**: price numerals now match the rest of the menu and the three size variants distribute evenly on desktop/tablet, with clean mobile stacking.
- Consolidated the gallery into one intentional control dock containing **previous / play-pause / next / current album / current image count**.
- Kept the gallery autoplay cue visible as a thin advancing segmented reel across the top edge of the player.
- Moved the album selector directly below the gallery player and made it scale to the player width, with horizontal scrolling only where smaller screens need it.
- Simplified Social copy to **“La serata continua. Seguici, taggaci e condividi il tuo momento.”**
- Strengthened the review ticker autoplay on desktop while preserving hover/focus pause and manual swipe/drag behavior.
- Reworked the Info header into a **brand + utility** composition: large Via Roma logo, live **Aperto ora / Chiuso ora** status, and no redundant descriptive paragraph.
- Updated the bottom navigation to **Via Roma / Menù / Gallery / Info / Chiama**.
- Added a subtle continuous scroll-progress line to the bottom edge of the navbar plus clearer active-section feedback.
- Added a desktop-only ambient particle field with slow curl-like drift and restrained cursor response, weighted toward screen edges so content remains dominant.
- Preserved the existing parallax, menu category interactions, pizza reel, community gallery, review cards, Google Maps embed, multi-language support, and static Vercel deployment structure.

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
