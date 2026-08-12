# Pizzeria Via Roma · V8.1 Vercel Deploy

This package is ready for a static Vercel deployment. The archive contains `index.html`, `README_DEPLOY.md`, and the complete `assets/` directory directly at its root.

## Deploy on Vercel

1. Extract the ZIP.
2. Upload the extracted contents to the root of the repository connected to Vercel.
3. Select the framework preset **Other**.
4. Leave **Build Command**, **Output Directory**, and environment variables empty.
5. Deploy.

No API keys, package installation, or build process are required. The location section uses a simple embedded Google Maps place map.

## V8.1 update

- Made every menu-category artwork a reliable direct link to its matching menu section, with the sticky navigation offset accounted for.
- Moved the printed category subcopy below the artwork and reserved consistent title/copy rows, so **Bevande** and wrapped headings remain aligned.
- Reordered the pizza reel to: artwork, pizza name, printed ingredients, navigation dots.
- Added a slight top inset to the gallery reel and restored a visibly animated 5-second progress fill for the active frame.
- Reordered the bottom navigation to: **Storia · Menù · Dove · Chiama**, keeping the external phone action last.
- Preserved the V8 printed-menu copy, integrated gallery albums, parallax, social/review system, footer and static Vercel deployment structure.

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
