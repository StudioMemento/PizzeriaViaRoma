# Pizzeria Via Roma · V8 Vercel Deploy

This package is ready for a static Vercel deployment. The archive contains `index.html`, `README_DEPLOY.md`, and the complete `assets/` directory directly at its root.

## Deploy on Vercel

1. Extract the ZIP.
2. Upload the extracted contents to the root of the repository connected to Vercel.
3. Select the framework preset **Other**.
4. Leave **Build Command**, **Output Directory**, and environment variables empty.
5. Deploy.

No API keys, package installation, or build process are required. The location section uses a simple embedded Google Maps place map.

## V8 update

- Replaced the menu-category descriptions with the final wording from the printed menu.
- Reordered the category slider as title, printed subcopy, clickable artwork, and navigation dots.
- Removed “Scopri la selezione”; clicking the category artwork now opens the matching menu section.
- Rebuilt the pizza reel hierarchy with the pizza name above the image and the exact printed ingredients below it.
- Integrated the gallery albums directly into the gallery player.
- Moved the reel sequence to the full-width top edge of the gallery player.
- Reordered gallery albums to: Bancone, Sala sinistra, Sala destra, Esterno, Entrata, Locale.
- Removed the Google Maps image overlay from the Google Reviews rating card.
- Preserved the existing parallax, menu, community, review ticker, footer, multilingual controls, and Vercel-ready static structure.

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
