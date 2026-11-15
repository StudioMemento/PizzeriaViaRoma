# Via Roma V22 — interaction performance

This pass retains the V21 interaction design, all original photographs, the five venue albums, the three cornicione offers, and the requested React Bits presets. It changes loading and scheduling rather than replacing functioning carousels. The paper menu, its copy/data/assets and every pre-existing stylesheet are unchanged by this lane.

## Concrete findings and changes

| V21 cost | V22 change |
| --- | --- |
| All 18 pizza/category images explicitly requested eagerly on mount | Persistent `<img>` elements keep their dimensions but receive sources only when their stage approaches the viewport and they are visible or within the prefetch buffer. Loaded sources stay attached through wrapping. |
| Every carousel frame writes transforms/distances for every card, including distant clipped cards | Only visible cards receive frame styles. Distant cards are hidden without unmounting; the next adjacent cards are prefetched. Compositor hints apply only during motion to visible cards. |
| A held pointer can keep the DOM carousel frame loop alive without moving | Pointer events wake one frame; settling animates only while position differs from target. Offscreen and hidden-page transitions cancel frames and idle timers immediately. |
| Five Accordions initialize GSAP and layout during the initial page load | GSAP is dynamically imported as an album comes within 360px of the viewport. Its original static geometry/anchors remain in the document. Images are enabled per approaching album, with existing responsive derivatives. |
| Each Accordion selection reconstructs its ResizeObserver and starts layout twice | A stable resize observer measures only actual size changes. Selection owns one layout transition. The initial layout applies before paint; immediate layouts use `gsap.set`, not zero-duration timelines. |
| Accordion panels and media keep compositor hints indefinitely | Hints exist only during an active visible transition. Leaving the viewport, hiding the page or enabling reduced motion completes and kills the current transition. Reduced-motion preference changes are subscribed live. |
| CircularGallery allocates WebGL and requests all 12 photographs on initial mount | The module itself is lazy-loaded within 600px while the SSR section/heading/reel geometry remains stable. Context creation waits until the component approaches the viewport. Texture requests originate from visible-frame layout and cover the view plus its adjacent buffer. Image callbacks queue uploads; they never upload to an offscreen context. Uploads are limited to one texture per visible frame. |
| CircularGallery continues RAF on hover/focus because it checks configured autoplay rather than actual eligibility | The frame scheduler uses actual autoplay eligibility. Hover, keyboard focus and explicit pause settle to an idle frame queue. A single timer resumes after the existing interaction delay. Offscreen/hidden transitions cancel all pending frame and idle work. |
| Flat photos use the original wave mesh: 32×24 cells, 1,536 triangles per draw | The requested `wave=0` preset uses a mathematically equivalent single quad, 2 triangles per draw. The original subdivided mesh remains available for nonzero wave. |
| Context loss has no recovery path | Context loss stops GPU work and enables the functional DOM fallback. Restoration rebuilds GPU resources and swaps back only after a photo is ready. Unsupported WebGL and shader initialization failures use the same fallback. |

## Preserved behavior

- Pizza: stable DOM, direct drag with horizontal-intent detection and vertical-touch pass-through, wraparound, keyboard arrows, 7.2-second autoplay interval, delayed restart after interaction and explicit pause.
- Categories: original category artwork/copy and links, stable dragging, 8.2-second interval and the same pause behavior.
- Venue: all five albums and their original 7/7/9/8/9 photos; Accordion `radius=0`, `tilt=20`, `ease="power4.out"`, `parallax=1`, `expandRatio=.6`, `gap=12`, `showLabels=false`. Keyboard selection moves focus; Enter opens the shared native lightbox. Touch expands before opening.
- Community: all 12 selected photographs; Circular `bend=0`, `gap=0`, `fadeEdges=.2`, `scrollEase=.3`, `borderRadius=0`, `shadow=1`, `itemAspect=1`, `wave=0`, `snap=false`, `autoScroll=.5`, `itemSize=1`. Shared lightbox and the existing functional DOM fallback remain.
- Cornicione: all three illustrated offers and prices still read from the unchanged source data.
- Reduced motion disables automatic motion; manual navigation remains available.

## Sources and license

The actual React Bits Accordion and Circular components remain adapted locally in `src/vendor/galleries/`. They are not CSS imitations. Upstream sources and preset documentation:

- https://reactbits.dev/components/accordion-gallery
- https://reactbits.dev/components/circular-gallery
- https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/AccordionGallery
- https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/CircularGallery

Copyright David Haz; MIT plus Commons Clause. The existing `licenses/react-bits-LICENSE.md` attribution is retained. V22 modifications are described above; no new dependency was added. The 17 unused upstream Picsum demonstration records were removed from the shipped wrappers; stable empty defaults and empty-items guards remain.

## Verification

TypeScript passes after the implementation and expert-review passes. Independent QA's deterministic scheduler harness executes the real useCarousel hook and passes offscreen zero-work, buffered image loading, autoplay deadlines, continuous motion, hover/explicit pause shutdown, live reduced motion, pointer cancellation/vertical intent and cleanup. Keyboard focus follows the selected category link or fallback photo, so Enter activates the item reached with arrow keys. Circular Home/End now also transfers focus to the selected photo before Enter, matching its arrow behavior. Producer/QA own independent production browser verification and immutable-menu checks. The runtime exposes `data-gallery-engine` (`deferred`, `webgl`, `fallback`), `data-gallery-animating`, `data-carousel-moving`, and Accordion activation/visibility/animation attributes for observing real state; these are diagnostics, not a performance-score claim.

Do not infer measured frame rate or device-level smoothness from the structural reductions above. Hardware touch, GPU availability, and browser evidence must be reported according to the producer's actual test environment.

Producer browser review reports the community fallback opens/closes the correct photo, pause settles, and the composition is accepted. This environment did not provide GUI pointer-drag operations or a verified GPU rendering path; those device-level outcomes are not claimed. The deterministic hook harness covers drag intent/cancellation and scheduling, not visual GPU performance.
