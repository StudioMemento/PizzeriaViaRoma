import { useEffect, useRef, type RefObject } from "react";
import { useDialog } from "../DialogContext";
import { createGlimmer, type HeroGeometry } from "./glimmer";
import { createLiquid } from "./liquid";
import { HERO_PRESET } from "./preset";
import { LOGO_MARK } from "./logoGeometry";

/** One clock for both effects; no React updates or layout reads per frame. */
export function useHeroEffects(sectionRef: RefObject<HTMLElement | null>, logoRef: RefObject<HTMLDivElement | null>, particlesRef: RefObject<HTMLCanvasElement | null>, liquidRef: RefObject<HTMLCanvasElement | null>) {
  const modalOpen = Boolean(useDialog().modal);
  const obscured = useRef(modalOpen);
  const refreshVisibility = useRef<(() => void) | null>(null);
  useEffect(() => {
    obscured.current = modalOpen;
    refreshVisibility.current?.();
  }, [modalOpen]);
  useEffect(() => {
    const section=sectionRef.current, logo=logoRef.current, particles=particlesRef.current, canvas=liquidRef.current;
    if (!section || !logo || !particles || !canvas) return;
    const img=logo.querySelector("img")!;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = reduced.matches;
    const glimmer=createGlimmer(particles);
    let liquid: ReturnType<typeof createLiquid> = null;
    let disposed=false, inView=false, frame=0, measureFrame=0, last=0, time=0, contextLost=false;
    let pointerX=0, pointerY=0, smoothX=0, smoothY=0, hover=0, hoverTarget=0;
    let logoBounds={left:0,top:0,width:1,height:1};
    let g: HeroGeometry={width:1,height:1,x:0,y:0,logoWidth:1};
    const eligible = () => inView && !document.hidden && !reduceMotion && !obscured.current;
    const draw = (now: number) => {
      frame=0;
      if (!eligible() || disposed) return;
      const interval=1000/(g.width<768?HERO_PRESET.mobileFps:HERO_PRESET.desktopFps);
      if (!last || now-last>=interval-0.5) {
        const elapsed=last ? Math.min((now-last)/1000,0.08) : 0;
        time += elapsed;
        last=now;
        smoothX+=(pointerX-smoothX)*0.07; smoothY+=(pointerY-smoothY)*0.07;
        hover+=(hoverTarget-hover)*(1-Math.exp(-elapsed*5));
        glimmer?.draw(time);
        if (!contextLost && liquid) {
          liquid.draw(time,smoothX,smoothY,hover);
          if (logo.dataset.liquidReady !== "true") logo.dataset.liquidReady="true";
        }
      }
      frame=requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame=0; last=0;
      if (disposed) return;
      const running=eligible();
      section.dataset.fxState=running?"running":reduceMotion?"reduced":"paused";
      if (!running) glimmer?.release();
      if (reduceMotion) { logo.dataset.liquidReady="false"; glimmer?.draw(time); }
      if (running) frame=requestAnimationFrame(draw);
    };
    const measure = () => {
      measureFrame=0;
      if (disposed) return;
      const s=section.getBoundingClientRect(), l=logo.getBoundingClientRect();
      logoBounds={left:l.left,top:l.top+window.scrollY,width:l.width,height:l.height};
      g={width:s.width,height:s.height,x:l.left-s.left+l.width*LOGO_MARK.centerX,y:l.top-s.top+l.height*LOGO_MARK.centerY,logoWidth:l.width};
      glimmer?.resize(g); glimmer?.draw(time); liquid?.resize(l.width);
      if (liquid && !contextLost && !reduceMotion) liquid.draw(time,smoothX,smoothY,hover);
    };
    const queueMeasure = () => { if (!measureFrame) measureFrame=requestAnimationFrame(measure); };
    const setupLiquid = () => {
      if (disposed || liquid || reduceMotion || !img.complete || !img.naturalWidth) return;
      try { liquid=createLiquid(canvas,img); liquid?.resize(g.logoWidth); } catch { liquid=null; }
    };
    const imageReady = () => { setupLiquid(); queueMeasure(); };
    const motionChanged = () => {
      reduceMotion = reduced.matches;
      setupLiquid(); sync();
    };
    const onLost = (event: Event) => { event.preventDefault(); contextLost=true; logo.dataset.liquidReady="false"; };
    const onRestored = () => { contextLost=false; liquid=null; setupLiquid(); };
    const setHover = (active: boolean) => {
      if (hoverTarget === Number(active)) return;
      hoverTarget=Number(active);
      logo.dataset.gold=String(active);
    };
    const overMark = (event: PointerEvent) => Math.hypot(
      event.clientX-logoBounds.left-logoBounds.width*LOGO_MARK.centerX,
      event.clientY+window.scrollY-logoBounds.top-logoBounds.height*LOGO_MARK.centerY
    ) <= logoBounds.width*LOGO_MARK.radius;
    const pointer = (event: PointerEvent) => {
      if (event.pointerType!=="mouse") return;
      // Relative offsets from cached hero geometry; scroll does not drive pointer math.
      pointerX=(event.clientX/window.innerWidth-0.5)*2;
      pointerY=(event.clientY/window.innerHeight-0.5)*2;
      setHover(overMark(event));
    };
    const leave = () => { pointerX=pointerY=0; setHover(false); };
    const press = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || !eligible() || (event.target as Element).closest("a,button")) return;
      const bounds = section.getBoundingClientRect();
      glimmer?.press(event.clientX - bounds.left, event.clientY - bounds.top);
      if (event.pointerType !== "mouse") setHover(overMark(event));
    };
    const release = (event: PointerEvent) => { glimmer?.release(); if(event.pointerType!=="mouse") setHover(false); };
    const resize=new ResizeObserver(queueMeasure); resize.observe(section); resize.observe(logo);
    const visibility=new IntersectionObserver(entries=> { inView=entries[0].isIntersecting; sync(); },{threshold:0}); visibility.observe(section);
    refreshVisibility.current=sync;
    document.addEventListener("visibilitychange",sync);
    reduced.addEventListener("change",motionChanged);
    window.addEventListener("resize",queueMeasure,{passive:true});
    section.addEventListener("pointermove",pointer,{passive:true}); section.addEventListener("pointerleave",leave);
    section.addEventListener("pointerdown",press,{passive:true});
    window.addEventListener("pointerup",release,{passive:true}); window.addEventListener("pointercancel",release,{passive:true});
    window.addEventListener("scroll",leave,{passive:true});
    canvas.addEventListener("webglcontextlost",onLost); canvas.addEventListener("webglcontextrestored",onRestored);
    img.addEventListener("load",imageReady);
    measure(); setupLiquid();
    void document.fonts.ready.then(()=> { if(!disposed) queueMeasure(); });
    return () => {
      disposed=true; cancelAnimationFrame(frame); cancelAnimationFrame(measureFrame);
      refreshVisibility.current=null;
      resize.disconnect(); visibility.disconnect(); liquid?.dispose();
      document.removeEventListener("visibilitychange",sync); reduced.removeEventListener("change",motionChanged);
      window.removeEventListener("resize",queueMeasure); section.removeEventListener("pointermove",pointer); section.removeEventListener("pointerleave",leave);
      section.removeEventListener("pointerdown",press); window.removeEventListener("pointerup",release); window.removeEventListener("pointercancel",release); window.removeEventListener("scroll",leave);
      canvas.removeEventListener("webglcontextlost",onLost); canvas.removeEventListener("webglcontextrestored",onRestored); img.removeEventListener("load",imageReady);
      logo.dataset.liquidReady="false";
      logo.dataset.gold="false";
    };
  },[sectionRef,logoRef,particlesRef,liquidRef]);
}
