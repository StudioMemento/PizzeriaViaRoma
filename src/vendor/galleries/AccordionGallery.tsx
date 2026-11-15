'use client';
// React Bits Accordion Gallery, David Haz, MIT + Commons Clause.
// Via Roma: controlled selection, keyboard focus, photo callback and responsive CSS.

import { useRef, useEffect, useLayoutEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { gsap } from 'gsap';

import './AccordionGallery.css';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface AccordionGalleryItem {
  image: string;
  srcSet?: string;
  sizes?: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  onItemClick?: (item: AccordionGalleryItem, index: number) => void;
  ariaLabel?: string;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

// The application supplies all venue albums; no demo images ship in the bundle.
const DEFAULT_ITEMS: AccordionGalleryItem[] = [];

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  activeIndex,
  onActiveChange,
  onItemClick,
  ariaLabel = 'Image accordion gallery',
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = ''
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const gsapRef = useRef<typeof import('gsap').gsap | null>(null);
  const visibleRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [localActive, setLocalActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(0, count - 1)));
  const active = activeIndex ?? localActive;
  const setActive = (index: number) => { setLocalActive(index); onActiveChange?.(index); };

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      const gsap = gsapRef.current;
      if (!panels.length || !gsap) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && visibleRef.current && !document.hidden && !prefersReduced ? duration : 0;
      const root = rootRef.current;
      if (root) root.dataset.animating = String(dur > 0);
      const tl = dur > 0 ? gsap.timeline({ onComplete: () => { if (root) root.dataset.animating = 'false'; } }) : null;
      const animateTo = (target: gsap.TweenTarget, vars: gsap.TweenVars, at = 0) => {
        if (tl) tl.to(target, vars, at);
        else {
          const { duration: _duration, ease: _ease, stagger: _stagger, ...values } = vars;
          gsap.set(target, values);
        }
      };

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        animateTo(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          animateTo(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.35,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            animateTo([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            animateTo([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  const layoutRef = useRef(applyLayout);
  layoutRef.current = applyLayout;

  // Subscribe once. A selection must not recreate observers or start two timelines.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !count) return;
    let alive = true;
    let loading = false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setPrefersReduced(media.matches);
      if (media.matches) { tlRef.current?.progress(1); tlRef.current?.kill(); el.dataset.animating = 'false'; }
    };
    const stop = () => {
      tlRef.current?.progress(1);
      tlRef.current?.kill();
      el.dataset.animating = 'false';
    };
    const activate = () => {
      if (loading) return;
      loading = true;
      void import('gsap').then(module => {
        if (!alive) return;
        gsapRef.current = module.gsap;
        setReady(true);
      });
    };
    const near = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      activate(); near.disconnect();
    }, { rootMargin: '360px 0px' });
    const visible = new IntersectionObserver(entries => {
      visibleRef.current = entries.some(entry => entry.isIntersecting);
      el.dataset.visible = String(visibleRef.current);
      if (!visibleRef.current) stop();
    });
    const onVisibility = () => { if (document.hidden) stop(); };
    near.observe(el); visible.observe(el);
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', onVisibility);
    updateMotion();
    return () => {
      alive = false; stop(); near.disconnect(); visible.disconnect();
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count > 0]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const total = vertical ? el.clientHeight : el.clientWidth;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      if (Math.abs(size - mediaSizeRef.current) < .5) return;
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      layoutRef.current(false);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap, count, expandRatio, vertical]);

  useClientLayoutEffect(() => {
    if (!ready) return;
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
    return () => { tlRef.current?.kill(); };
  }, [applyLayout, ready]);

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    const previous = e.detail > 0 ? pointerStart.current ?? active : active;
    pointerStart.current = null;
    if (i !== previous) { e.preventDefault(); setActive(i); return; }
    if (onItemClick) { e.preventDefault(); onItemClick(items[i], i); }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (!count) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (i + 1) % count; setActive(next); panelRefs.current[next]?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (i - 1 + count) % count; setActive(next); panelRefs.current[next]?.focus({ preventScroll: true });
    }
  };

  const rootStyle = {
    '--ag-accent': accentColor,
    '--ag-overlay': overlayColor,
    '--ag-text': textColor,
    '--ag-gap': `${gap}px`,
    '--ag-radius': `${radius}px`,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      data-gallery-active={ready}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = 'button';
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{ borderRadius: `${radius}px`, flexGrow: !ready ? (isActive && count > 1 ? (Math.min(Math.max(expandRatio, .2), .9) * (count - 1)) / (1 - Math.min(Math.max(expandRatio, .2), .9)) : 1) : undefined }}
            type="button"
            onPointerDown={() => { pointerStart.current = active; }}
            onClick={e => handleClick(i, e)}
            onPointerEnter={e => { if (e.pointerType === "mouse") handleEnter(i); }}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            tabIndex={isActive ? 0 : -1}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
              >
                <img src={ready ? item.image : undefined} srcSet={ready ? item.srcSet : undefined} sizes={ready ? item.sizes : undefined} alt={item.alt || item.label || ''} draggable={false} loading="eager" decoding="async" />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  ref={(el: HTMLElement | null) => {
                    barRefs.current[i] = el;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(el: HTMLElement | null) => {
                    textRefs.current[i] = el;
                  }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
