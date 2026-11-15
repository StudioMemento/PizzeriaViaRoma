/* PIZZERIA VIA ROMA V15.1 MICRO POLISH */
(function(){
  "use strict";
  if(window.__VIA_ROMA_V15__)return;
  window.__VIA_ROMA_V15__=true;
  const body=document.body;if(!body)return;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const $=(selector,scope=document)=>scope.querySelector(selector);
  const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];

  function syncAllergenOrder(){
    const menu=$("#menu");if(!menu)return;
    const mobile=matchMedia("(max-width:700px)").matches;
    $$(".item",menu).forEach(item=>{
      const row=$(":scope > .row",item),label=row&&$(".label",row);if(!row||!label)return;
      const direct=$(":scope > .allergens",item),nested=$(":scope > .allergens",label),allergen=direct||nested;if(!allergen)return;
      if(mobile){if(allergen.parentElement!==item)item.insertBefore(allergen,row)}
      else if(allergen.parentElement!==label)label.appendChild(allergen);
    });
  }

  function initUnifiedSliderMotion(){
    const category=$("#showrail"),pizza=$("#forno");
    if(!category||!pizza||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const speed=.018;
    function mount(rail,itemSelector,kind){
      let visible=false,interacting=false,programmatic=false,pausedUntil=0,raf=0,motionRaf=0,last=0,position=rail.scrollLeft;
      let list=[],centres=[],loopStart=0,loopEnd=0,loopBand=0,activeKey=null,activeItem=null,geometryRaf=0;
      const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      const nearestIndex=()=>{
        if(!centres.length)return-1;
        const centre=rail.scrollLeft+rail.clientWidth/2;let nearest=0,distance=Infinity;
        centres.forEach((itemCentre,index)=>{const d=Math.abs(itemCentre-centre);if(d<distance){distance=d;nearest=index}});
        return nearest;
      };
      const update=(force=false)=>{
        const nearest=list[nearestIndex()];if(!nearest)return;
        if(kind==="category"){
          const id=nearest.dataset.cat;if(!force&&id===activeKey)return;activeKey=id;
          const real=list.slice(Math.floor(list.length/3),Math.floor(list.length*2/3));
          const logical=Math.max(0,real.findIndex(item=>item.dataset.cat===id));
          list.forEach(item=>item.classList.toggle("is-active",item.dataset.cat===id));
          $$("#showdots i").forEach((dot,index)=>dot.classList.toggle("on",index===logical));
        }else{
          if(!force&&nearest===activeItem)return;
          activeItem?.classList.remove("mid");activeItem=nearest;activeItem.classList.add("mid");
          const logical=Number(nearest.dataset.fornoIndex)||0;
          $$("#fornodots i").forEach((dot,index)=>dot.classList.toggle("on",index===logical));
        }
      };
      const readGeometry=()=>{
        geometryRaf=0;list=$$(`:scope > ${itemSelector}`,rail);centres=list.map(item=>item.offsetLeft+item.offsetWidth/2);
        const count=Math.floor(list.length/3);loopStart=list[count]?.offsetLeft||0;loopEnd=list[count*2]?.offsetLeft||0;loopBand=Math.max(0,loopEnd-loopStart);
        if(kind==="pizza")list.forEach(item=>item.classList.remove("mid"));
        activeKey=null;activeItem=null;position=rail.scrollLeft;update(true);
      };
      const refreshGeometry=()=>{if(!geometryRaf)geometryRaf=requestAnimationFrame(readGeometry)};
      const normalize=()=>{
        if(loopBand<=0)return;
        if(rail.scrollLeft<loopStart-loopBand*.32)rail.scrollLeft+=loopBand;
        else if(rail.scrollLeft>loopEnd+loopBand*.32)rail.scrollLeft-=loopBand;
      };
      const schedule=()=>{if(visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick)};
      const tick=now=>{
        raf=0;if(!last)last=now;const dt=Math.min(80,Math.max(0,now-last));last=now;
        const hover=matchMedia("(hover:hover)").matches&&rail.matches(":hover");
        if(visible&&!interacting&&!programmatic&&!hover&&now>=pausedUntil&&!rail.classList.contains("dragging")&&!document.hidden){
          if(Math.abs(rail.scrollLeft-position)>8)position=rail.scrollLeft;
          position+=dt*speed;rail.scrollLeft=position;normalize();
          if(Math.abs(rail.scrollLeft-position)>8)position=rail.scrollLeft;
          update();
        }
        schedule();
      };
      const cancelMotion=()=>{if(motionRaf)cancelAnimationFrame(motionRaf);motionRaf=0;programmatic=false;position=rail.scrollLeft};
      const animateToIndex=index=>{
        if(!list.length)return;const targetItem=list[clamp(index,0,list.length-1)];if(!targetItem)return;
        cancelMotion();programmatic=true;const from=rail.scrollLeft,target=targetItem.offsetLeft-(rail.clientWidth-targetItem.offsetWidth)/2,delta=target-from;
        const duration=clamp(520+Math.abs(delta)*.34,560,920),started=performance.now();
        const frame=now=>{
          const t=clamp((now-started)/duration,0,1);position=from+delta*ease(t);rail.scrollLeft=position;update();
          if(t<1)motionRaf=requestAnimationFrame(frame);
          else{motionRaf=0;programmatic=false;normalize();position=rail.scrollLeft;pausedUntil=now+1300;last=0;update(true);schedule()}
        };
        motionRaf=requestAnimationFrame(frame);
      };
      const moveBy=delta=>{const index=nearestIndex();if(index>=0)animateToIndex(index+Number(delta||0))};
      const moveToLogical=logical=>{const count=Math.floor(list.length/3);if(count)animateToIndex(count+(((Number(logical)||0)%count)+count)%count)};
      rail.addEventListener("pointerdown",()=>{cancelMotion();interacting=true;position=rail.scrollLeft;last=0},{passive:true});
      ["pointerup","pointercancel","lostpointercapture"].forEach(type=>rail.addEventListener(type,()=>{interacting=false;position=rail.scrollLeft;pausedUntil=performance.now()+1500;last=0;schedule()},{passive:true}));
      rail.addEventListener("wheel",()=>{position=rail.scrollLeft;pausedUntil=performance.now()+1200;last=0},{passive:true});
      rail.addEventListener("focusin",()=>{interacting=true},{passive:true});
      rail.addEventListener("focusout",()=>{interacting=false;position=rail.scrollLeft;pausedUntil=performance.now()+900;last=0;schedule()},{passive:true});
      rail.addEventListener("scroll",()=>{if(interacting||performance.now()<pausedUntil)position=rail.scrollLeft;update()},{passive:true});
      if("ResizeObserver" in window)new ResizeObserver(refreshGeometry).observe(rail);
      if("MutationObserver" in window)new MutationObserver(refreshGeometry).observe(rail,{childList:true});
      addEventListener("load",refreshGeometry,{once:true,passive:true});document.fonts?.ready?.then(refreshGeometry).catch(()=>{});
      if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;if(visible)schedule();else if(raf){cancelAnimationFrame(raf);raf=0}},{rootMargin:"14% 0px 14%",threshold:.01}).observe(rail);
      else{visible=true;schedule()}
      readGeometry();
      return{rail,update,moveBy,moveToLogical,refreshGeometry};
    }
    window.__viaRomaSliderMotion={category:mount(category,".slide","category"),pizza:mount(pizza,"figure","pizza"),speed};
  }

  function initAnchorNavigation(){
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    let navRaf=0,navAnimating=false;
    const cancel=()=>{
      if(navRaf)cancelAnimationFrame(navRaf);
      navRaf=0;navAnimating=false;document.documentElement.classList.remove("v15-section-jump");
    };
    const animateTo=top=>{
      cancel();
      if(reduced){scrollTo({top,left:0,behavior:"auto"});return}
      const from=scrollY,distance=top-from;
      if(Math.abs(distance)<2)return;
      const duration=clamp(480+Math.abs(distance)/45,520,920),started=performance.now();
      navAnimating=true;document.documentElement.classList.add("v15-section-jump");
      const frame=now=>{
        const t=clamp((now-started)/duration,0,1),eased=1-Math.pow(1-t,4);
        scrollTo({top:from+distance*eased,left:0,behavior:"auto"});
        if(t<1&&navAnimating)navRaf=requestAnimationFrame(frame);
        else cancel();
      };
      navRaf=requestAnimationFrame(frame);
    };
    ["wheel","touchstart"].forEach(type=>addEventListener(type,()=>{if(navAnimating)cancel()},{passive:true}));
    $$(".top .brand,.home-scroll,.tabbar a[href^='#']").forEach(anchor=>anchor.addEventListener("click",event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const hash=anchor.getAttribute("href");
      if(!hash||hash==="#")return;
      const target=$(hash);if(!target)return;
      event.preventDefault();
      if(location.hash!==hash)history.pushState(null,"",hash);
      const top=Math.max(0,target.getBoundingClientRect().top+scrollY);
      requestAnimationFrame(()=>animateTo(top));
    }));
  }

  class ParticleField{
    constructor(canvas,mode){
      this.canvas=canvas;this.section=canvas.parentElement;this.mode=mode;this.ctx=canvas.getContext("2d",{alpha:true});
      this.w=1;this.h=1;this.dpr=1;this.visible=false;this.raf=0;this.last=0;this.start=performance.now();
      this.coarse=matchMedia("(pointer:coarse)").matches;this.reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.pointer={x:.5,y:.5,active:false,energy:0};
      this.resize=this.resize.bind(this);this.loop=this.loop.bind(this);this.onPointer=this.onPointer.bind(this);this.onDown=this.onDown.bind(this);
      this.bind();this.resize();if(this.reduced)this.draw(performance.now());
    }
    bind(){
      this.section.addEventListener("pointermove",this.onPointer,{passive:true});
      this.section.addEventListener("pointerdown",this.onDown,{passive:true});
      this.section.addEventListener("pointerup",event=>{if(event.pointerType==="touch")this.pointer.active=false},{passive:true});
      this.section.addEventListener("pointercancel",event=>{if(event.pointerType==="touch")this.pointer.active=false},{passive:true});
      this.section.addEventListener("pointerleave",()=>{this.pointer.active=false},{passive:true});
      if("ResizeObserver" in window)new ResizeObserver(this.resize).observe(this.section);else addEventListener("resize",this.resize,{passive:true});
      if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;if(this.visible)this.schedule();else if(this.raf){cancelAnimationFrame(this.raf);this.raf=0}},{rootMargin:"16% 0px 16%",threshold:.01}).observe(this.section);
      else{this.visible=true;this.schedule()}
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&this.raf){cancelAnimationFrame(this.raf);this.raf=0}else this.schedule()});
    }
    point(event){const r=this.section.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top}}
    onPointer(event){const p=this.point(event);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;this.pointer.energy=Math.min(1,this.pointer.energy+.12);this.schedule()}
    onDown(event){const p=this.point(event);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;this.pointer.energy=1;this.schedule()}
    resize(){const rect=this.section.getBoundingClientRect();this.w=Math.max(1,Math.round(rect.width));this.h=Math.max(1,Math.round(rect.height));this.dpr=Math.min(devicePixelRatio||1,this.coarse?1.25:1.6);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.reduced)this.draw(performance.now())}
    schedule(){if(!this.reduced&&this.visible&&!document.hidden&&!this.raf)this.raf=requestAnimationFrame(this.loop)}
    loop(now){this.raf=0;const minFrame=this.coarse?33:22;if(now-this.last>=minFrame){this.last=now;this.draw(now)}this.schedule()}
    draw(now){
      const {ctx,w,h}=this;ctx.clearRect(0,0,w,h);const home=this.mode==="home",spacing=this.coarse?(home?27:31):(home?31:35),elapsed=(now-this.start)/1000;
      this.pointer.energy*=.92;
      const cols=Math.ceil(w/spacing)+2,rows=Math.ceil(h/spacing)+2,ox=(w-(cols-1)*spacing)/2,oy=(h-(rows-1)*spacing)/2;
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const bx=ox+col*spacing,by=oy+row*spacing;let x=bx,y=by,force=0;
        const drift=Math.sin(elapsed*.48+col*.29+row*.21)*(home?.5:.35);y+=drift;
        if(this.pointer.active){const dx=bx-this.pointer.x,dy=by-this.pointer.y,d=Math.hypot(dx,dy)||1,radius=home?clamp(Math.min(w,h)*.43,230,360):clamp(Math.min(w,h)*.34,175,265);if(d<radius){const fall=Math.pow(1-d/radius,2),push=fall*(home?19:12)*(0.55+this.pointer.energy);x+=dx/d*push;y+=dy/d*push;force+=fall}}
        const centre=Math.hypot(bx-w*.5,by-h*(home?.45:.36)),centreFade=clamp(1-centre/Math.max(w,h)*.72,home?.38:.22,1),edge=clamp(Math.min(bx,w-bx)/(w*.15),.18,1),major=(row+col*2)%9===0;
        const base=home?.13:.075,alpha=(base+force*(home?.24:.19))*centreFade*edge*(major?1.32:1),radius=(major?.9:.58)+force*.9;
        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=`rgba(198,161,91,${clamp(alpha,.025,.44).toFixed(4)})`;ctx.fill();
      }
    }
  }

  function initParticles(){window.__viaRomaParticles=$$("[data-v14a-particles]").map(canvas=>new ParticleField(canvas,canvas.dataset.v14aParticles))}

  function boot(){
    body.classList.add("v14a-ready");
    syncAllergenOrder();
    const mq=matchMedia("(max-width:700px)");mq.addEventListener?.("change",()=>requestAnimationFrame(syncAllergenOrder));
    const menu=$("#menu");if(menu&&"MutationObserver" in window)new MutationObserver(()=>requestAnimationFrame(syncAllergenOrder)).observe(menu,{childList:true,subtree:true});
    initUnifiedSliderMotion();initParticles();initAnchorNavigation();
    document.documentElement.dataset.viaRomaBuild="15.1.0";
    requestAnimationFrame(()=>{dispatchEvent(new Event("resize"));dispatchEvent(new Event("scroll"));if(!location.hash)scrollTo(0,0)});
  }
  boot();
})();
