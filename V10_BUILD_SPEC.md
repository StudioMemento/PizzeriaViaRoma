# Pizzeria Via Roma — V10 Single Scroll Film Build Specification

## 1. Execution directive

Build **Pizzeria Via Roma V10** from the latest complete website source, preserving the existing visual system, content, translations, menu, gallery, community, reviews, information section, navigation and responsive layouts.

Replace the V9 multi-video walkthrough engine completely with one continuous, scroll-scrubbed, 12-second film.

Do not stop at analysis. Implement the engine, transcode the supplied test film, validate the complete site, browser-check desktop and mobile behavior, and output a clean Vercel-ready ZIP only after the release gates pass.

The supplied test asset is:

```text
SCROLL12sec_FHD.mov
```

This MOV is a temporary implementation asset. The final corrected edit will replace it later without requiring changes to the V10 engine or timing model.

---

## 2. Locked V10 reasoning

V10 uses one visual film and one video element.

The following effects are authored directly inside the edit:

- checkpoint blur;
- blur release;
- end-of-shot blur;
- crossfades between scenes;
- the exact incoming first frame at every checkpoint;
- visual color treatment.

The website remains responsible only for:

- mapping native scroll progress to film frames;
- smoothing rapid scroll input;
- displaying localized HTML copy at the authored checkpoints;
- displaying the chapter progress rail;
- accessibility, responsive layout and media fallbacks.

### V10 must not use

- four independent video elements;
- live CSS blur on full-screen video;
- duplicated blurred bridge layers;
- JavaScript-generated scene crossfades;
- runtime switching between separate clips;
- simultaneous media warm-up;
- text baked into the film;
- autoplay as the primary playback model;
- forced scroll snapping.

This architecture must remain fully reversible: scrolling upward reconstructs the same film frames and copy states in reverse.

---

## 3. Verified test-film properties

The supplied test MOV has been inspected and contains:

| Property | Verified value |
|---|---:|
| Video dimensions | 1920 × 1080 |
| Video frame rate | Constant 24 fps |
| Video frame count | Exactly 288 frames |
| Intended visual duration | Exactly 12.000 seconds |
| Container duration | 12.010667 seconds because of additional streams |
| Video codec | H.264 High Profile |
| Pixel format | YUV 4:2:0 |
| Color metadata | BT.709 |
| Current B-frames | Present |
| Current keyframe spacing | 24 frames / 1 second |
| Audio | AAC stream present |
| File size | Approximately 32.5 MB |

The MOV must **not** be served directly on the website. It is an editing master/input and must be converted into scrub-optimized MP4 variants.

The temporary edit contains one full green failure frame at:

```text
Frame 240
Timecode 00:00:10:00 at 24 fps
```

This is accepted only for the temporary V10 implementation test. Do not hide or compensate for it in website code. The final film must replace the media and contain no green, black, corrupt or duplicated failure frames.

---

## 4. Master film timeline

### Global contract

```text
Frame rate:       24 fps constant
Total frames:     288
Valid frame IDs:  0–287
Duration:         12.000 seconds
Chapter length:   72 frames / 3.000 seconds
Checkpoints:      0, 72, 144, 216
```

Frame 288 is not a display frame; it is the exclusive end boundary.

### Locked chapter order

| Chapter | Film frames | Time range | Visual role | HTML overlay |
|---|---:|---:|---|---|
| 01 Entrata | 0–71 | 00:00:00:00–00:00:02:23 | Entrance/opening film and first checkpoint | Logo, location kicker and existing claim |
| 02 Sala sinistra | 72–143 | 00:00:03:00–00:00:05:23 | Left-room film | Existing localized “Luce calda, tempo lento” copy |
| 03 Sala destra | 144–215 | 00:00:06:00–00:00:08:23 | Right-room film | Existing localized “Materia, colore, carattere” copy |
| 04 Dettaglio | 216–287 | 00:00:09:00–00:00:11:23 | Entrance/detail-oriented closing film | Existing localized “A Via Roma, all’angolo di sempre” copy |

Do not rewrite the existing copy. Remap the existing localized strings to this new chapter order.

### Editorial checkpoint contract

Every 72-frame chapter must follow the same visual logic:

1. Begin on an intentionally blurred checkpoint frame.
2. Hold enough blur for the HTML copy to remain legible.
3. Release the blur only after the copy has disappeared.
4. Show the moving scene clearly.
5. Begin the end blur while the shot is still moving.
6. Transition to the next scene while both sides of the edit are fully masked by blur.
7. Land on the next scene’s exact blurred first frame at the checkpoint.

The final corrected film should keep the checkpoint blur active for at least the first 24 frames of each chapter and introduce the next checkpoint blur during the final 8–12 frames of the preceding chapter.

---

## 5. HTML copy timing

Copy remains live HTML. It must never be baked into the film.

This preserves:

- Italian, English, German and French translations;
- sharp typography at every resolution;
- responsive authored line breaks;
- accessible text;
- future copy edits without re-rendering video.

### Initial timing values

Use frame-based timing, never hard-coded wall-clock timers.

| Overlay | Fade in | Full visibility | Fade out |
|---|---:|---:|---:|
| Entrata / logo | Already visible at frame 0 | 0–11 | 12–23 |
| Sala sinistra | 64–73 | 74–83 | 84–95 |
| Sala destra | 136–145 | 146–155 | 156–167 |
| Dettaglio | 208–217 | 218–227 | 228–239 |

The incoming copy begins during the blurred end transition of the previous chapter and remains visible over the blurred beginning of its own chapter.

If the final edit changes its internal blur windows, update these constants only. Do not restructure the renderer.

### Copy constraints

- Copy opacity must be zero whenever the film is clear.
- Desktop story headlines remain on one authored line.
- Mobile story headlines retain exactly two authored lines.
- The first checkpoint uses the existing Via Roma logo and claim.
- Story copy uses the current premium centered composition.
- Copy transitions use opacity, a restrained vertical offset and a very small text-only blur.
- Never blur the full-screen video in CSS.

---

## 6. Single-video DOM architecture

The walkthrough must contain one persistent video element:

```html
<section id="storia" class="place-experience place-experience-v10">
  <div class="place-sticky">
    <div class="place-film" aria-hidden="true">
      <img class="place-film-poster" src="assets/video/walkthrough-v10/scroll-v10-poster.webp" alt="">
      <video
        class="place-film-video"
        muted
        playsinline
        webkit-playsinline
        preload="auto"
        disablepictureinpicture
        controlslist="nodownload noplaybackrate nofullscreen"
        tabindex="-1"
        aria-hidden="true"
      ></video>
    </div>
    <div class="place-copy-layer"></div>
    <nav class="place-stepper"></nav>
  </div>
</section>
```

Use JavaScript to select the desktop or mobile source before assigning `video.src`:

```text
Desktop/fine pointer: scroll-v10-desktop.mp4
Mobile/coarse pointer: scroll-v10-mobile.mp4
Save-Data/reduced motion: static checkpoint fallback
```

There must never be more than one walkthrough video decoder active.

---

## 7. Scroll-to-frame engine

### Canonical mapping

```text
progress    = clamp((scrollY - sectionTop) / scrollRange, 0, 1)
targetFrame = round(progress × 287)
targetTime  = targetFrame / 24
```

The engine must use the frame count, not the container’s audio-influenced duration.

### Initial scroll length

Start with:

```css
#storia.place-experience-v10 {
  height: 720svh;
}

#storia .place-sticky {
  position: sticky;
  top: 0;
  height: 100svh;
}
```

This gives each three-second chapter approximately 155 viewport-heights of active scroll range. Tune only after physical mobile testing; never reduce the scroll range so far that individual frames chatter under normal finger movement.

### Smoothing behavior

- Native page scroll remains authoritative.
- Do not intercept wheel or touch movement.
- Do not force chapter snapping.
- Maintain `targetFrame` and a separate damped `renderedFrame`.
- Approach the target with a time-based exponential response.
- Use an adaptive maximum catch-up delta so a fast fling crosses intermediate transition frames instead of teleporting between scenes.
- Seek only when the requested source frame changes.
- Quantize every request to an integer source frame.
- Stop the animation loop when the rendered frame reaches the target.
- Stop all walkthrough work when the section is outside the viewport.
- Reverse scroll must use exactly the same mapping and state functions.

Suggested starting constants:

```js
const FILM_FPS = 24;
const FILM_FRAMES = 288;
const FILM_LAST_FRAME = 287;
const RESPONSE = 8.0;
const MOBILE_MIN_SEEK_INTERVAL = 42; // milliseconds
const DESKTOP_MIN_SEEK_INTERVAL = 30;
```

Catch-up may increase from 2 to a maximum of 6 source frames per rendered update according to the target gap. It must never hard-jump directly over a 72-frame checkpoint.

### Video readiness

- Display the exact frame-0 poster immediately.
- Assign only one source.
- Wait for `loadedmetadata` before seeking.
- Unlock mobile decoding on the first genuine user interaction by briefly calling `play()`, waiting for a decoded frame, then pausing.
- Prefer `requestVideoFrameCallback` when available.
- Reveal the video after a decoded frame is confirmed.
- Do not depend exclusively on a `seeked` event to reveal the video.
- Keep the poster underneath the video until readiness is confirmed.
- Never leave the media permanently at `opacity: 0` after a recoverable readiness event.
- Pause on document visibility loss.
- Recompute section metrics on resize, orientation change and page restore.

---

## 8. Chapter and progress UI

The existing restrained four-segment progress rail remains.

Update its labels to:

```text
01 Entrata
02 Sala sinistra
03 Sala destra
04 Dettaglio
```

Rules:

- Chapter index derives from `floor(frame / 72)` clamped to `0–3`.
- Each segment fill derives from the film’s exact frame progress.
- Clicking a chapter scrolls smoothly to `checkpointFrame / 287` of the section range.
- Clicking does not seek the video separately; scroll remains the single source of truth.
- The rail must remain readable across light and dark footage.
- Do not reintroduce duplicate chapter indicators.

---

## 9. Media pipeline

### Deploy structure

```text
assets/
  video/
    walkthrough-v10/
      scroll-v10-desktop.mp4
      scroll-v10-mobile.mp4
      scroll-v10-poster.webp
      checkpoint-01-entrata.webp
      checkpoint-02-sala-sinistra.webp
      checkpoint-03-sala-destra.webp
      checkpoint-04-dettaglio.webp
```

The source MOV must not be included in the Vercel deploy ZIP.

### Desktop web encode

```bash
ffmpeg -i SCROLL12sec_FHD.mov \
  -map 0:v:0 -an -frames:v 288 \
  -vf "fps=24,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 \
  -profile:v high -level:v 4.1 \
  -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 -refs 1 \
  -tune fastdecode -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  assets/video/walkthrough-v10/scroll-v10-desktop.mp4
```

### Mobile web encode

```bash
ffmpeg -i SCROLL12sec_FHD.mov \
  -map 0:v:0 -an -frames:v 288 \
  -vf "scale=960:540:flags=lanczos,fps=24,format=yuv420p" \
  -c:v libx264 -preset slow -crf 21 \
  -profile:v high -level:v 3.1 \
  -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 -refs 1 \
  -tune fastdecode -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  assets/video/walkthrough-v10/scroll-v10-mobile.mp4
```

Both outputs must contain exactly 288 frames at constant 24 fps with no audio and no B-frames.

### Media budget

| Asset | Target budget |
|---|---:|
| Desktop MP4 | Preferably below 25 MB |
| Mobile MP4 | Preferably below 10 MB |
| Initial poster | Below 150 KB |
| Each fallback checkpoint | Below 150 KB |

Quality may be tuned through CRF, but timing, frame count, keyframe spacing and B-frame restrictions are not negotiable.

---

## 10. Fallback behavior

### Reduced motion or Save-Data

- Do not load the MP4 automatically.
- Show the four exported checkpoint WebP files.
- Map scroll to the nearest chapter.
- Use a restrained opacity crossfade only.
- Keep the same localized copy and progress rail.
- Do not animate full-screen blur.

### Media error

- Keep the current checkpoint poster visible.
- Never expose an empty black hero.
- Never collapse the sticky section.
- Mark the failed media state once and stop retry loops.
- Navigation, copy and the rest of the website remain usable.

---

## 11. V9 cleanup requirements

Remove from the V10 walkthrough implementation:

- `WALKTHROUGH_STEPS` entries containing four individual MP4 sources;
- the four `.place-scene` video elements;
- `.place-bridge` markup and renderer logic;
- live scene blur variables;
- multiple seek-state arrays;
- all-video warm-up code;
- obsolete mobile bridge images from the deploy;
- old walkthrough videos from the deploy once the V10 media is installed;
- debug data attributes that mutate on every animation frame;
- perpetual walkthrough RAF loops.

Preserve unrelated website behavior and assets.

---

## 12. Performance requirements

- One active walkthrough video decoder maximum.
- Zero live CSS blur on the film.
- Zero offscreen walkthrough animation frames.
- No scroll handler performs layout reads and style writes repeatedly in the same event.
- Cache section metrics outside the frame loop and invalidate them only when required.
- Batch UI writes inside `requestAnimationFrame`.
- Keep video seeks frame-quantized and rate-limited.
- Offscreen menu, pizza, review and decorative tickers must suspend their animation loops.
- Mobile must load only the 960 × 540 encode.
- Desktop must not download the mobile encode.
- The film poster must remain the immediate visual fallback.

---

## 13. Final-film editorial acceptance

The later final replacement video must preserve the V10 media contract:

```text
1920 × 1080 master
24 fps constant
288 frames exactly
12.000 seconds exactly
Chapter boundaries at 0 / 72 / 144 / 216
Same scene order
Same copy-safe blur windows
```

Reject the final media if any of the following occur:

- green or magenta flash;
- black corrupt frame;
- duplicated or missing transition frame;
- unexpected exposure jump;
- mismatched first frame at a checkpoint;
- blur disappears while HTML copy is visible;
- transition starts before the moving shot is visually complete;
- variable frame rate;
- non-288 frame count;
- audio or additional data streams in the web encode;
- B-frames;
- keyframe interval longer than three source frames.

Replacing the final media must not require editing HTML, CSS, JavaScript or copy timing if it follows this contract.

---

## 14. Validation gates

### Source and deploy

- JavaScript parses without errors.
- CSS braces and media queries are valid.
- Every local asset reference resolves.
- No zero-byte files exist.
- `index.html` is at the ZIP root.
- No MOV, unused V9 walkthrough media or platform metadata is packaged.
- ZIP integrity test passes.

### Media

- Both MP4 variants decode without errors.
- Both are H.264, YUV420P, constant 24 fps.
- Both contain exactly 288 frames.
- Both contain no audio.
- Both report `has_b_frames=0`.
- Keyframes occur every two frames, with three frames permitted only if required for final size.
- `moov` metadata appears before `mdat`.
- Poster frame matches film frame 0.
- Checkpoint posters match frames 0, 72, 144 and 216.

### Timeline

- Scroll start resolves to frame 0.
- Scroll end resolves to frame 287.
- Checkpoint buttons resolve to frames 0, 72, 144 and 216.
- Forward and reverse traversal return identical visual/copy states for the same frame.
- Copy opacity is zero outside the authored blurred ranges.
- Fast scrolling does not expose a hard scene teleport.
- Renderer reaches rest and stops requesting frames.

### Browser and device

- Desktop Chromium: full forward/reverse walkthrough.
- Desktop Safari/WebKit where available.
- iOS Safari physical-device check.
- Android Chrome physical-device check.
- Portrait and landscape orientation.
- Low Power Mode behavior.
- Save-Data fallback.
- Reduced-motion fallback.
- Reload at the middle of the walkthrough.
- Page restore from browser history.
- No console errors or unhandled media promise rejections.
- Menu, gallery, community, reviews, language switching, information and navigation remain unchanged and functional.

---

## 15. V10 deliverable

Output:

```text
Pizzeria_Via_Roma_V10_Vercel_Deploy.zip
```

The final handoff must include:

- the complete Vercel-ready website;
- one desktop scrub encode;
- one mobile scrub encode;
- the poster and four checkpoint fallbacks;
- an updated `README_DEPLOY.md` describing the single-film engine;
- a concise verification summary.

Do not publish or push externally unless explicitly authorized. Do not claim physical-device verification unless it was actually completed.

