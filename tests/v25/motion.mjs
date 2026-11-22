import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const code=stripTypeScriptTypes((await readFile('src/hooks/carouselMotion.ts','utf8')).replaceAll('export ',''));
const {createMotion,advance,seek,captionOpacity,loopDistance,releaseTarget}=runInNewContext(code+';({createMotion,advance,seek,captionOpacity,loopDistance,releaseTarget})');
for (const rate of [30,60,90,120]) {
  const model=createMotion();
  model.position=.37;
  seek(model,3);
  let previous=model.position;
  for(let i=0;i<rate*2;i++){
    advance(model,1/rate);
    assert.ok(model.position>=previous && model.position<=3);
    previous=model.position;
  }
  assert.equal(model.position,3); assert.equal(model.target,null);
  assert.equal(advance(model,1/rate),false);
  seek(model,-1,true); assert.equal(model.position,-1); assert.equal(model.target,null);
}
assert.equal(captionOpacity(0),1);assert.equal(captionOpacity(1),0);
for(let x=0;x<1;x+=.001){
  assert.ok(captionOpacity(x)>=captionOpacity(x+.001));
  assert.ok(Math.abs(captionOpacity(x)+captionOpacity(1-x)-1)<1e-8);
}
assert.equal(loopDistance(0,39.75,40),.25);assert.equal(loopDistance(39,.25,40),-1.25);
for (const sign of [-1, 1]) {
 const m = createMotion(), speed = sign * 8;
 m.position = sign * .7;
 const target = releaseTarget(m.position, speed);
 assert.ok(sign * target >= 3, 'A strong flick crosses several centers');
 seek(m, target, false, speed);
 const start = m.position; advance(m, .001);
 assert.ok(Math.abs((m.position-start)/.001 - speed)<.1, 'Release velocity is continuous');
 for (let n=0;n<150;n++) { const previous=m.position; advance(m,1/120); assert.ok(sign*(m.position-previous)>=-1e-10); }
 assert.equal(m.position,target); assert.equal(m.velocity,0);
}
console.log('MOTION_OK — centered rests, frame-rate independent easing, instant reduced-motion selection, caption fades and wraparound.');
