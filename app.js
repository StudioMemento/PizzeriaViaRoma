/* PIZZERIA VIA ROMA V14A CLEAN */
(function(){
  "use strict";
  if(window.__VIA_ROMA_V14A__)return;
  window.__VIA_ROMA_V14A__=true;
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

  function installAutoplay({section,rail,delay,next}){
    if(!section||!rail||typeof next!=="function"||matchMedia("(prefers-reduced-motion: reduce)").matches)return null;
    let visible=false,timer=0,pausedUntil=0;
    const clear=()=>{if(timer){clearTimeout(timer);timer=0}};
    const schedule=(wait=delay)=>{
      clear();if(!visible||document.hidden)return;
      const remaining=Math.max(wait,pausedUntil-performance.now());
      timer=setTimeout(advance,Math.max(320,remaining));
    };
    const pause=(wait=1800)=>{pausedUntil=performance.now()+wait;schedule(wait)};
    const advance=()=>{
      timer=0;
      if(!visible||document.hidden||rail.classList.contains("dragging")||rail.matches(":hover")||rail.matches(":focus-within")){schedule(900);return}
      next();schedule(delay);
    };
    ["pointerdown","touchstart","wheel","focusin"].forEach(type=>section.addEventListener(type,()=>pause(type==="wheel"?1500:2300),{passive:true}));
    ["pointerup","pointercancel","touchend","focusout"].forEach(type=>section.addEventListener(type,()=>pause(1400),{passive:true}));
    document.addEventListener("visibilitychange",()=>{if(document.hidden)clear();else schedule(600)});
    if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>.08;if(visible)schedule(900);else clear()},{threshold:[0,.08,.35],rootMargin:"12% 0px 12%"}).observe(section);
    else{visible=true;schedule(900)}
    return{advance:()=>{visible=true;clear();advance()},pause};
  }

  function initSliderAutoplay(){
    const category=installAutoplay({
      section:$("#catshow"),rail:$("#showrail"),delay:5000,
      next:()=>{if(typeof showRailCenter==="function"&&typeof nearestShowDom==="function")showRailCenter(nearestShowDom()+1,"smooth")}
    });
    const pizza=installAutoplay({
      section:$("#pizza-slider"),rail:$("#forno"),delay:5900,
      next:()=>{if(typeof scrollToDom==="function"&&typeof nearestDom==="function")scrollToDom(nearestDom()+1,"smooth")}
    });
    window.__viaRomaAutoplay={category,pizza};
  }

  class ParticleField{
    constructor(canvas,mode){
      this.canvas=canvas;this.section=canvas.parentElement;this.mode=mode;this.ctx=canvas.getContext("2d",{alpha:true});
      this.w=1;this.h=1;this.dpr=1;this.visible=false;this.raf=0;this.last=0;this.start=performance.now();
      this.coarse=matchMedia("(pointer:coarse)").matches;this.reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.pointer={x:.5,y:.5,active:false,energy:0};this.ripples=[];this.sparks=[];
      this.resize=this.resize.bind(this);this.loop=this.loop.bind(this);this.onPointer=this.onPointer.bind(this);this.onDown=this.onDown.bind(this);
      this.bind();this.resize();if(this.reduced)this.draw(performance.now());
    }
    bind(){
      this.section.addEventListener("pointermove",this.onPointer,{passive:true});
      this.section.addEventListener("pointerdown",this.onDown,{passive:true});
      this.section.addEventListener("pointerleave",()=>{this.pointer.active=false},{passive:true});
      if("ResizeObserver" in window)new ResizeObserver(this.resize).observe(this.section);else addEventListener("resize",this.resize,{passive:true});
      if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;if(this.visible)this.schedule();else if(this.raf){cancelAnimationFrame(this.raf);this.raf=0}},{rootMargin:"16% 0px 16%",threshold:.01}).observe(this.section);
      else{this.visible=true;this.schedule()}
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&this.raf){cancelAnimationFrame(this.raf);this.raf=0}else this.schedule()});
    }
    point(event){const r=this.section.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top}}
    onPointer(event){const p=this.point(event);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;this.pointer.energy=Math.min(1,this.pointer.energy+.08);if(this.coarse&&event.pointerType==="touch")this.addRipple(p,.45)}
    onDown(event){const p=this.point(event);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;this.pointer.energy=1;this.addRipple(p,1);const amount=this.mode==="info"?9:6;for(let i=0;i<amount;i++){const angle=Math.PI*2*i/amount+Math.random()*.35,speed=12+Math.random()*18;this.sparks.push({x:p.x,y:p.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,born:performance.now(),life:650+Math.random()*450,size:.55+Math.random()*.75})}}
    addRipple(p,strength){const now=performance.now(),last=this.ripples[this.ripples.length-1];if(last&&now-last.born<100&&Math.hypot(last.x-p.x,last.y-p.y)<18)return;this.ripples.push({x:p.x,y:p.y,born:now,strength});if(this.ripples.length>5)this.ripples.shift();this.schedule()}
    resize(){const rect=this.section.getBoundingClientRect();this.w=Math.max(1,Math.round(rect.width));this.h=Math.max(1,Math.round(rect.height));this.dpr=Math.min(devicePixelRatio||1,this.coarse?1.25:1.6);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.reduced)this.draw(performance.now())}
    schedule(){if(!this.reduced&&this.visible&&!document.hidden&&!this.raf)this.raf=requestAnimationFrame(this.loop)}
    loop(now){this.raf=0;const minFrame=this.coarse?33:22;if(now-this.last>=minFrame){this.last=now;this.draw(now)}this.schedule()}
    draw(now){
      const {ctx,w,h}=this;ctx.clearRect(0,0,w,h);const home=this.mode==="home",spacing=this.coarse?(home?27:31):(home?31:35),elapsed=(now-this.start)/1000;
      this.pointer.energy*=.94;this.ripples=this.ripples.filter(r=>now-r.born<1450);this.sparks=this.sparks.filter(s=>now-s.born<s.life);
      const cols=Math.ceil(w/spacing)+2,rows=Math.ceil(h/spacing)+2,ox=(w-(cols-1)*spacing)/2,oy=(h-(rows-1)*spacing)/2;
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const bx=ox+col*spacing,by=oy+row*spacing;let x=bx,y=by,force=0;
        const drift=Math.sin(elapsed*.48+col*.29+row*.21)*(home?.5:.35);y+=drift;
        if(this.pointer.active){const dx=bx-this.pointer.x,dy=by-this.pointer.y,d=Math.hypot(dx,dy)||1,radius=home?175:145;if(d<radius){const fall=Math.pow(1-d/radius,2),push=fall*(home?15:10)*(0.45+this.pointer.energy);x+=dx/d*push;y+=dy/d*push;force+=fall}}
        this.ripples.forEach(r=>{const dx=bx-r.x,dy=by-r.y,d=Math.hypot(dx,dy)||1,age=(now-r.born)/1000,front=age*(home?220:190),band=Math.max(0,1-Math.abs(d-front)/65),fade=Math.max(0,1-age/1.45),pulse=band*fade*r.strength;if(pulse){x+=dx/d*pulse*8;y+=dy/d*pulse*8;force+=pulse*.85}});
        const centre=Math.hypot(bx-w*.5,by-h*(home?.45:.36)),centreFade=clamp(1-centre/Math.max(w,h)*.72,home?.38:.22,1),edge=clamp(Math.min(bx,w-bx)/(w*.15),.18,1),major=(row+col*2)%9===0;
        const base=home?.13:.075,alpha=(base+force*(home?.24:.19))*centreFade*edge*(major?1.32:1),radius=(major?.9:.58)+force*.9;
        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=`rgba(198,161,91,${clamp(alpha,.025,.44).toFixed(4)})`;ctx.fill();
      }
      this.sparks.forEach(s=>{const p=clamp(1-(now-s.born)/s.life,0,1);s.x+=s.vx/30;s.y+=s.vy/30;s.vx*=.95;s.vy*=.95;s.vy+=.18;ctx.beginPath();ctx.arc(s.x,s.y,s.size*(.45+p*.55),0,Math.PI*2);ctx.fillStyle=`rgba(217,179,106,${(p*.28).toFixed(4)})`;ctx.fill()});
    }
  }

  function initParticles(){window.__viaRomaParticles=$$("[data-v14a-particles]").map(canvas=>new ParticleField(canvas,canvas.dataset.v14aParticles))}

  function boot(){
    body.classList.add("v14a-ready");
    syncAllergenOrder();
    const mq=matchMedia("(max-width:700px)");mq.addEventListener?.("change",()=>requestAnimationFrame(syncAllergenOrder));
    const menu=$("#menu");if(menu&&"MutationObserver" in window)new MutationObserver(()=>requestAnimationFrame(syncAllergenOrder)).observe(menu,{childList:true,subtree:true});
    initSliderAutoplay();initParticles();
    document.documentElement.dataset.viaRomaBuild="14.1.0";
    requestAnimationFrame(()=>{dispatchEvent(new Event("resize"));dispatchEvent(new Event("scroll"));if(!location.hash)scrollTo(0,0)});
  }
  boot();
})();
