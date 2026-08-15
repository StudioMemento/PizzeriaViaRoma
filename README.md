# Pizzeria Via Roma — V10 Single Scroll Film

Baseline mode: **standalone**

## What changed

- Replaced the multi-clip walkthrough logic with one continuous 12-second film.
- Added dense-keyframe desktop and mobile H.264 encodes for bidirectional scroll seeking.
- Added a sticky four-chapter timeline: Entrata, Sala sinistra, Sala destra, Dettaglio.
- Added adaptive damping, decoder unlock, buffered progress, poster fallback, reduced-motion behavior, and skip-safe reverse scrubbing.
- Kept transition blur inside the authored film rather than recreating it with overlapping DOM videos.
- Preserved the lower V9+ page whenever a Via Roma baseline was recoverable.

## Run locally

```bash
npm run dev
```

## Validate production build

```bash
npm run build
npm run preview
```

Vercel uses `npm run build` and serves `dist/`.
