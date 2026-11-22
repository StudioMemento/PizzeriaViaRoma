import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {runInNewContext} from "node:vm";
const code=stripTypeScriptTypes((await readFile("src/hooks/carouselMotion.ts","utf8")).replaceAll("export ",""));
const {carouselWindow,loopDistance,pizzaPose}=runInNewContext(code+";({carouselWindow,loopDistance,pizzaPose})");
for(const [width,plate] of [[320,180],[390,241],[768,360],[1440,468],[2560,560],[3440,640],[5120,500],[7680,500]]){
  const count=10, w=carouselWindow(width,plate,count);
  assert.ok(w.renderCount>=count && w.renderCount%count===0);
  const center=pizzaPose(0,w.step,w.focusStep), side=pizzaPose(1,w.step,w.focusStep);
  assert.equal(center.scale,1); assert.ok(side.scale<.75);
  const gap=side.x-plate*side.scale/2-plate/2;
  assert.ok(gap>=47.999 && gap<=104.001);
  const outer=pizzaPose(2,w.step,w.focusStep);
  assert.ok(outer.x-side.x-plate*side.scale<gap);
  const previous=new Map();
  for(let offset=0;offset<=w.renderCount*2*32;offset++){
    const position=offset/32;
    const painted=new Set();
    for(let i=0;i<w.renderCount;i++){
      const d=loopDistance(i,position,w.renderCount);
      const {x,scale}=pizzaPose(d,w.step,w.focusStep);
      const inFrame=Math.abs(x)<=width/2+plate*scale/2;
      if(inFrame){
        assert.ok(Math.abs(d)<w.radius);
        assert.ok(Math.abs(loopDistance(i%count,Math.round(position),count))<=w.preload);
        painted.add(Math.round(d*32));
      }
      const old=previous.get(i);
      if(old && Math.abs(x-old.x)>2*w.focusStep) assert.ok(!inFrame && !old.inFrame,"Visible wrap");
      previous.set(i,{x,inFrame});
    }
    for(let logical=Math.floor(position-w.radius);logical<=position+w.radius;logical++){
      const d=logical-position, pose=pizzaPose(d,w.step,w.focusStep);
      if(Math.abs(pose.x)<=width/2+plate*pose.scale/2) assert.ok(painted.has(Math.round(d*32)),"Missing visible plate");
    }
  }
}
await import("./carousel-runtime.mjs");
console.log("INTRO_CAROUSEL_OK — smooth scale, central and outer spacing, culling, image preload and offscreen recycling at 320–7680px.");
