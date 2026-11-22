import { HERO_PRESET } from "./preset";

/** Liquid light follows the original alpha, without UV warping. Hover changes
 * its material from silver to palette gold; the logo silhouette stays intact. */
export function createLiquid(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return null;
  const vertexSource = `attribute vec2 position; varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragmentSource = `precision mediump float;
    varying vec2 uv; uniform sampler2D logo; uniform float time;
    uniform vec2 pointer; uniform float density; uniform float distortion;
    uniform float angle; uniform float lowGrey; uniform float highWhite; uniform float softness;
    uniform float hover; uniform vec3 gold; uniform vec3 highlight;
    void main(){
      float alpha=texture2D(logo,vec2(uv.x,1.-uv.y)).a;
      if(alpha<.001){gl_FragColor=vec4(0.);return;}
      vec2 p=(uv-.5)*density+pointer;
      float t=time*.28;
      float flow=sin(p.x*3.4+p.y*2.7+t)+.5*sin(p.x*6.2-p.y*4.1-t*.72);
      float bend=flow*distortion;
      float axis=p.x*cos(angle)+p.y*sin(angle);
      float ribbon=sin(axis*8.+bend*4.+sin(p.y*4.-t)*.72-t);
      float shade=smoothstep(-.82*softness,.96*softness,ribbon);
      float sheen=pow(max(0.,sin(axis*11.+bend*3.-t*.9)),12.);
      float grey=clamp(mix(lowGrey,highWhite*.98,shade)+sheen*.15,lowGrey,highWhite);
      vec3 metal=mix(gold*.68,highlight,shade)+highlight*sheen*.12;
      gl_FragColor=vec4(mix(vec3(grey),metal,hover)*alpha,alpha);
    }`;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!; gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, vertexSource), fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) { if (vertex) gl.deleteShader(vertex); if (fragment) gl.deleteShader(fragment); return null; }
  const program = gl.createProgram()!; gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  gl.useProgram(program);
  const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  const uTime = gl.getUniformLocation(program,"time"), uPointer = gl.getUniformLocation(program,"pointer");
  const uHover = gl.getUniformLocation(program,"hover");
  const p = HERO_PRESET.liquid;
  gl.uniform1f(gl.getUniformLocation(program,"density"),p.density);
  gl.uniform1f(gl.getUniformLocation(program,"distortion"),p.distortion);
  gl.uniform1f(gl.getUniformLocation(program,"angle"),p.angle*Math.PI/180);
  gl.uniform1f(gl.getUniformLocation(program,"lowGrey"),p.minimumGrey);
  gl.uniform1f(gl.getUniformLocation(program,"highWhite"),p.maximumWhite);
  gl.uniform1f(gl.getUniformLocation(program,"softness"),p.softness);
  gl.uniform3fv(gl.getUniformLocation(program,"gold"),p.gold);
  gl.uniform3fv(gl.getUniformLocation(program,"highlight"),p.highlight);
  gl.uniform1i(gl.getUniformLocation(program,"logo"),0);
  const resize = (size: number) => {
    const px = Math.round(size * Math.min(window.devicePixelRatio || 1, HERO_PRESET.maxPixelRatio));
    if (canvas.width !== px || canvas.height !== px) { canvas.width=canvas.height=px; gl.viewport(0,0,px,px); }
  };
  const draw = (seconds: number, x: number, y: number, hover = 0) => {
    gl.uniform1f(uTime,seconds*p.speed); gl.uniform2f(uPointer,x*p.pointerInfluence,y*p.pointerInfluence);
    gl.uniform1f(uHover,hover);
    gl.drawArrays(gl.TRIANGLES,0,6);
  };
  return { resize, draw, dispose: () => { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program); } };
}
