# Pizzeria Via Roma · V8.6

Vercel-ready static build.

## Deploy
Upload this folder or ZIP directly to Vercel as a static project. `index.html` is the entry point.

## V8.6 scroll-video walkthrough
- Four reversible, scroll-controlled architectural videos: Bancone, Entrata, Sala sinistra and Sala destra.
- First/final-frame holds, short reversible boundary crossfades and frame-rate-independent seek damping.
- True first-frame poster fallback for reduced motion, Save-Data and media decoding failures.
- Web media is H.264/1080p/24fps with six-frame closed GOPs, no audio and Fast Start.
- One `WALKTHROUGH_STEPS` manifest controls media, ordering, labels and copy mapping.
- Existing multilingual copy, step navigation, fixed bottom dock and 460svh page geometry are preserved.

## Preserved V8.5 polish
- Place copy + step indicator aligned to the shared site shell.
- Menu-category reel uses free glide, a restrained interaction cue, and no hard snapping.
- Pizza reel drifts slowly while idle; names/ingredients are larger and the lightbox includes ingredients.
- Draft-beer and house-wine variants align to the menu's right edge in three equal columns.
- Reviews ticker moved to compositor transforms for smoother continuous motion.
- Info live-status strip ends at the logo column.
- Maniago aerial artwork replaces the embedded map preview while preserving the Via Roma 43 Google Maps action.
