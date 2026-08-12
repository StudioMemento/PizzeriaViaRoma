# Pizzeria Via Roma · V8.2 Vercel Deploy

This package is ready for a static Vercel deployment. The archive contains `index.html`, `README_DEPLOY.md`, and the complete `assets/` directory directly at its root.

## Deploy on Vercel

1. Extract the ZIP.
2. Upload the extracted contents to the root of the repository connected to Vercel.
3. Select the framework preset **Other**.
4. Leave **Build Command**, **Output Directory**, and environment variables empty.
5. Deploy.

No API keys, package installation, or build process are required. The location section uses a simple embedded Google Maps place map.

## V8.2 update

- Replaced the three opening-room copy blocks with the shorter approved Italian copy and concise equivalents in the other supported languages.
- Matched the pizza reel section to the pure-black source artwork, making the radial mask edges effectively disappear.
- Removed the introductory subcopy below **Il Menù**.
- Rebalanced the allergen legend to **1–8** on the left and **9–14 plus the \*** note on the right, with the complete numbering preserved.
- Aligned draft-beer and house-wine item names with their full price groups on one dotted-leader row on desktop, with clean responsive wrapping on smaller screens.
- Preserved the V8.1 category interactions, pizza hierarchy, gallery reel, parallax, social/review system, footer and static Vercel deployment structure.

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
