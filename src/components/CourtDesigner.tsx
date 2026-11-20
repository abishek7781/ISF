// @ts-nocheck: direct port of the approved preview script (untyped 3D code). Typing is a follow-up.
// Court designer page. The 3D code and the step logic were ported from the approved preview.
// Layout and colours follow the site theme (data-theme on the html element).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import { A } from '../data/content'
import './court-designer.css'

const MARKUP = `<section class="cd-hx" aria-label="Court designer introduction">
  <div class="cd-hx-bg" aria-hidden="true">
    <div class="cd-hx-glow cd-hx-glow1"></div>
    <div class="cd-hx-glow cd-hx-glow2"></div>
    <div class="cd-hx-glow cd-hx-glow3"></div>
    <div class="cd-hx-grid-lines"></div>
    <div class="cd-hx-curve cd-hx-curve-tl"></div>
    <div class="cd-hx-curve cd-hx-curve-br"></div>
  </div>
  <div class="cd-hx-3d" id="hx3d" aria-hidden="true"></div>
  <div class="cd-hx-in">
    <div class="cd-hx-copy">
      <span class="cd-hx-tag"><i></i>Sports Infrastructure &bull; India</span>
      <h1>Craft Your <span class="cd-hx-out">Court</span></h1>
      <p>Choose the sport, the setting and the parts. Visualize your court from above or from inside, then request a quote built from the same choices.</p>
      <div class="cd-hx-actions">
        <a class="cd-hx-cta" href="#designer">Start Designing <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <a class="cd-hx-alt" href="/contact"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><polygon points="6.5,5.5 11,8 6.5,10.5" fill="currentColor"/></svg> Talk to Our Team</a>
      </div>
    </div>
  </div>
  <!-- Feature strip -->
  <div class="cd-hx-strip">
    <div class="cd-hx-strip-in">
      <div class="cd-hx-feat">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><rect x="2" y="6" width="18" height="13" rx="1.5" stroke="#39ff14" stroke-width="1.5"/><line x1="2" y1="10" x2="20" y2="10" stroke="#39ff14" stroke-width="1.2"/><line x1="11" y1="6" x2="11" y2="19" stroke="#39ff14" stroke-width="1.2"/></svg>
        <span>Craft Your Court</span>
      </div>
      <div class="cd-hx-feat-div"></div>
      <div class="cd-hx-feat">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="#39ff14" stroke-width="1.5" stroke-linejoin="round"/><line x1="11" y1="2" x2="11" y2="20" stroke="#39ff14" stroke-width="1.2"/></svg>
        <span>Premium Materials</span>
      </div>
      <div class="cd-hx-feat-div"></div>
      <div class="cd-hx-feat">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="8.5" stroke="#39ff14" stroke-width="1.5"/><path d="M8 11l2 2 4-4" stroke="#39ff14" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Expert Installation</span>
      </div>
      <div class="cd-hx-feat-div"></div>
      <div class="cd-hx-feat">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3l2.2 6.6H20l-5.6 4.1 2.2 6.6L11 16.2l-5.6 4.1 2.2-6.6L2 9.6h6.8L11 3z" stroke="#39ff14" stroke-width="1.5" stroke-linejoin="round"/></svg>
        <span>World-Class Sports Infra</span>
      </div>
      <div class="cd-hx-feat-tagline">BUILD &bull; PLAY &bull; EXCEL</div>
    </div>
  </div>
</section>
<section id="designer"></section>
<div class="cd-wrap"><div class="cd-sec-h"><div><div class="cd-eyebrow" style="color:var(--green)">Step by step</div><h2>Craft Your Court</h2><p>Answer the questions on the left. Your court, its netting and its lights appear on the right.</p></div><div class="cd-seg"><button id="vBird" class="cd-on">Bird view</button><button id="vInside">Inside court view</button></div></div>
<aside class="cd-panel" id="panel"></aside>
<section class="cd-stage"><div id="c"></div><div class="cd-empty" id="cdEmpty" aria-live="polite"></div><div class="cd-toolbar"><span></span><div style="display:flex;gap:8px"><button class="cd-iconbtn" id="startFresh">Start fresh</button><button class="cd-iconbtn" id="reset">Reset view</button><button class="cd-iconbtn" id="snap">Download image</button></div></div><div class="cd-sum" id="sum"><button class="cd-sum-toggle" id="sumToggle" aria-label="Toggle details">i</button><div class="cd-sum-body" id="sumBody"></div></div></section></div>
`


function mountHero3D(el: HTMLElement): () => void {
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio,2));r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
  el.appendChild(r.domElement);
  const sc=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(32,1,0.1,100);cam.position.set(17,11,20);cam.lookAt(0,0.9,0);
  sc.add(new THREE.HemisphereLight('#cfe3ff','#1a2a44',1.1));
  const sun=new THREE.DirectionalLight('#fff3e0',2.4);sun.position.set(-6,12,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,far:40});sc.add(sun);
  const rim=new THREE.DirectionalLight('#39ff14',0.8);rim.position.set(8,3,-8);sc.add(rim);
  const root=new THREE.Group();root.scale.setScalar(1);sc.add(root);
  const W=6.1,L=13.4,sx=0.46;
  // court texture with BWF markings
  const k=60,cv=document.createElement('canvas');cv.width=W*k;cv.height=L*k;const g=cv.getContext('2d')!;
  g.fillStyle='#1c6b3f';g.fillRect(0,0,cv.width,cv.height);
  for(let i=0;i<9000;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*0.07})`;g.fillRect(Math.random()*cv.width,Math.random()*cv.height,2,2);}
  g.strokeStyle='#f4f6f8';g.lineWidth=4;
  const X=(x:number)=>(x+W/2)*k,Z=(z:number)=>(z+L/2)*k;
  const ln=(a:number,b:number,c:number,d:number)=>{g.beginPath();g.moveTo(X(a),Z(b));g.lineTo(X(c),Z(d));g.stroke();};
  g.strokeRect(2,2,cv.width-4,cv.height-4);ln(-2.59,-L/2,-2.59,L/2);ln(2.59,-L/2,2.59,L/2);
  ln(-W/2,-5.94,W/2,-5.94);ln(-W/2,5.94,W/2,5.94);ln(-2.59,-1.98,2.59,-1.98);ln(-2.59,1.98,2.59,1.98);ln(0,-L/2,0,-1.98);ln(0,1.98,0,L/2);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=16;
  // wood grain for the sub-floor
  const wc=document.createElement('canvas');wc.width=512;wc.height=512;const w=wc.getContext('2d')!;
  for(let y=0;y<512;y+=32){w.fillStyle=['#c99a5b','#bd8b4c','#d3a566','#c4944f'][(y/32)%4];w.fillRect(0,y,512,32);for(let i=0;i<14;i++){w.strokeStyle=`rgba(90,55,20,${0.1+Math.random()*0.15})`;w.beginPath();const gy=y+Math.random()*32;w.moveTo(0,gy);w.bezierCurveTo(150,gy+4,330,gy-4,512,gy+2);w.stroke();}w.fillStyle='rgba(50,28,8,.4)';w.fillRect(0,y,512,2);}
  const wt=new THREE.CanvasTexture(wc);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(2,3);wt.colorSpace=THREE.SRGBColorSpace;wt.anisotropy=8;
  const slab=(w2:number,l2:number,h:number,y:number,mat:any)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w2,h,l2),mat);m.position.y=y;m.castShadow=m.receiveShadow=true;root.add(m);return m;};
  const std=(o:any)=>new THREE.MeshStandardMaterial(o);
  slab(W+1.2,L+1.2,0.5,-0.55,std({color:'#8d9298',roughness:0.95}));              // concrete base
  slab(W+0.6,L+0.6,0.14,-0.21,std({color:'#1d1f24',roughness:0.9}));               // shock-pad foam
  slab(W+0.3,L+0.3,0.16,-0.06,std({map:wt,roughness:0.55}));                       // sprung wood
  const top=std({map:tx,roughness:0.42,metalness:0.02});
  const t=new THREE.Mesh(new THREE.BoxGeometry(W,0.07,L),[std({color:'#1c6b3f'}),std({color:'#1c6b3f'}),top,std({color:'#145230'}),std({color:'#1c6b3f'}),std({color:'#1c6b3f'})]);
  t.position.y=0.055;t.castShadow=t.receiveShadow=true;root.add(t);
  // net + posts
  const steel=std({color:'#2b323d',metalness:0.8,roughness:0.28});
  [-1,1].forEach(s2=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,1.65,16),steel);p.position.set(s2*(W/2+0.35),0.9,0);p.castShadow=true;root.add(p);});
  const nc=document.createElement('canvas');nc.width=nc.height=32;const n=nc.getContext('2d')!;n.strokeStyle='rgba(240,244,250,.95)';n.lineWidth=3;n.strokeRect(0,0,32,32);
  const nt=new THREE.CanvasTexture(nc);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.repeat.set(W/0.05*0.5,15);
  const net=new THREE.Mesh(new THREE.PlaneGeometry(W+0.7,0.76),new THREE.MeshBasicMaterial({map:nt,transparent:true,side:THREE.DoubleSide,alphaTest:0.1}));net.position.set(0,1.27,0);net.rotation.y=Math.PI/2;net.rotation.set(0,0,0);root.add(net);
  const tape=new THREE.Mesh(new THREE.BoxGeometry(W+0.7,0.08,0.02),std({color:'#f5f5f5',roughness:0.6}));tape.position.set(0,1.65,0);root.add(tape);
  // shuttlecock
  const sh=new THREE.Group();
  const cork=new THREE.Mesh(new THREE.SphereGeometry(0.13,32,24),std({color:'#e8d2a6',roughness:0.7}));sh.add(cork);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(0.135,32,12,0,Math.PI*2,0,Math.PI*0.42),std({color:'#b8892f',roughness:0.45}));cap.rotation.x=Math.PI;cap.position.y=0;sh.add(cap);
  const fe=std({color:'#fbfbf6',roughness:0.55,side:THREE.DoubleSide,transparent:true,opacity:0.96});
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const geo=new THREE.PlaneGeometry(0.2,0.62,1,4);const pos=geo.attributes.position;for(let v=0;v<pos.count;v++){const yy=pos.getY(v)+0.31;pos.setX(v,pos.getX(v)*(0.35+yy*1.1));}geo.computeVertexNormals();const f=new THREE.Mesh(geo,fe);f.position.set(Math.cos(a)*0.12,0.38,Math.sin(a)*0.12);f.rotation.set(0,-a+Math.PI/2,0);f.rotateX(0.0);const pv=new THREE.Group();pv.rotation.y=a;const fm=new THREE.Mesh(geo,fe);fm.position.set(0.15,0.4,0);fm.rotation.y=Math.PI/2;fm.rotation.z=-0.0;fm.rotateX(0);const t2=new THREE.Group();t2.add(fm);t2.rotation.z=-0.22;pv.add(t2);sh.add(pv);}
  [0.34,0.62].forEach((y,i)=>{const rg=new THREE.Mesh(new THREE.TorusGeometry(0.12+y*0.38,0.006,6,48),std({color:'#e9e2cf',roughness:0.5}));rg.rotation.x=Math.PI/2;rg.position.y=y+0.06;sh.add(rg);});
  sh.scale.setScalar(1.5);sh.rotation.z=0;sh.position.set(-0.8,3.1,-1.5);
  root.rotation.y=-0.6;
  const ctl=new OrbitControls(cam,r.domElement);ctl.target.set(0,0.5,0);ctl.enableZoom=false;ctl.enablePan=false;ctl.enableDamping=true;ctl.minPolarAngle=0.3;ctl.maxPolarAngle=Math.PI*0.48;ctl.update();
  const size=()=>{const w2=el.clientWidth,h2=el.clientHeight;if(!w2||!h2)return;r.setSize(w2,h2);cam.aspect=w2/h2;cam.updateProjectionMatrix();};
  size();addEventListener('resize',size);
  let raf=0,t0=performance.now();
  (function loop(){const tt=(performance.now()-t0)/1000;ctl.update();r.render(sc,cam);raf=requestAnimationFrame(loop);})();
  return ()=>{cancelAnimationFrame(raf);removeEventListener('resize',size);ctl.dispose();r.dispose();el.innerHTML='';};
}

function mountCourtDesigner(root: HTMLElement, tr: (s: string) => string): { dispose: () => void; relocalize: () => void } {
  root.innerHTML = MARKUP
  const hero3dOff = mountHero3D(root.querySelector('#hx3d') as HTMLElement)
  const $ = (id: string): any => root.querySelector('#' + id)
  const T = (s: string) => tr(s)
  // Translates every text node under `el`. The English original is remembered on the node, so it can be re-translated when the language changes.
  function localize(el: Node) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let n: any
    while ((n = w.nextNode())) {
      if (n.__en === undefined) n.__en = n.nodeValue
      const en = n.__en.trim()
      if (!en) continue
      const out = T(en)
      n.nodeValue = n.__en.match(/^\s*/)[0] + out + (/[\u3000-\u9fff]$/.test(out) ? '' : n.__en.match(/\s*$/)[0])
    }
  }
  
  
  
  
  // ---------- data ----------
  const SPORTS={
   badminton:{n:'Badminton',L:13.4,W:6.1,net:'net',netH:1.55},
   pickleball:{n:'Pickleball',L:13.41,W:6.1,net:'net',netH:0.91},
   tennis:{n:'Tennis',L:23.77,W:10.97,net:'net',netH:0.91},
   basketball:{n:'Basketball',L:28,W:15,net:'hoop'},
  };
  const CATS={indoor:'Indoor',outdoor:'Outdoor',semi:'Semi-indoor'};
  // flooring lists
  const PLAY_FLOORS=['Rubber with PVC Synthetic Mat','PVC Synthetic Mat','Wooden with PVC Synthetic Mat','Wooden Flooring','Interlocking Tiles with PVC Synthetic Mat','Acrylic Flooring'];
  const PLAY_COLOR={'Rubber with PVC Synthetic Mat':'#2E7D41','PVC Synthetic Mat':'#1A6EC4','Wooden with PVC Synthetic Mat':'#B58A57','Wooden Flooring':'#B58A57','Interlocking Tiles with PVC Synthetic Mat':'#2B5FA8','Acrylic Flooring':'#F4A7B9'};
  // mat-type play floors that cover the whole slab (no concrete surround needed)
  const MAT_FLOORS=new Set([]);
  const NONPLAY_COLOR={'Acrylic (Concrete)':'#8A9BAA','Interlocking Tile':'#D4849A','Wood with Mat':'#B58A57','-None-':'#B9BDC4'};
  // which play floors support NPA, and what NPA they map to
  const NPA_MAP={'Wooden Flooring':'Wood with Mat','Wooden with PVC Synthetic Mat':'Wood with Mat','Interlocking Tiles with PVC Synthetic Mat':'Interlocking Tile','Acrylic Flooring':'Acrylic (Concrete)'};
  function npaFor(playFloor:string):string|null{return NPA_MAP[playFloor]||null;}
  // floors where NPA is always shown (no toggle)
  const NPA_ALWAYS=new Set(['Interlocking Tiles with PVC Synthetic Mat','Wooden with PVC Synthetic Mat']);
  const LIGHT_OUT={'100 W':100,'150 W':150,'200 W':200};   // per light post, one post every 10 ft
  const LIGHT_IND={'Basic (1500 W per court)':1500,'Advanced (2000 W per court)':2000};
  const ACC=['Scoreboard','Player benches','Court numbers','Umpire chair','Seating (spectator)','Water station'];
  
  const S={sport:null,cat:null,courts:1,view:'bird',
   parts:{fab:false,floor:false,light:false,acc:true},
  open:'sport',
   fab:{louvers:true,roof:true,walls:'Closed',side:true,top:true},
   floor:{play:'PVC Synthetic Mat',nonplay:'-None-',nonplayOn:true},
   light:{type:'100 W'},
   accs:{}};
  
  // ---------- 3D ----------
  const host=$('c');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,1,0.1,500);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.49;controls.minDistance=4;controls.maxDistance=110;
  scene.add(new THREE.HemisphereLight('#ffffff','#7a8594',1.0));
  const sun=new THREE.DirectionalLight('#ffffff',0.7);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,far:150});scene.add(sun);
  const G=Object.fromEntries(['ground','court','shell','roof','lights','net','enc','acc','city'].map(k=>{const g=new THREE.Group();scene.add(g);return [k,g];}));
  const postMat=new THREE.MeshStandardMaterial({color:'#28303E',metalness:0.75,roughness:0.25});
  const steelMat=new THREE.MeshStandardMaterial({color:'#8A939E',metalness:0.78,roughness:0.22});
  const louverMat=new THREE.MeshStandardMaterial({color:'#B8C4CE',metalness:0.55,roughness:0.35});
  const roofSheetMat=new THREE.MeshStandardMaterial({color:'#7A8591',metalness:0.45,roughness:0.45,side:THREE.DoubleSide,transparent:true,opacity:1,depthWrite:false});
  const wallMat=new THREE.MeshStandardMaterial({color:'#DDE2E9',roughness:0.88,metalness:0.04});
  const ledMat=new THREE.MeshStandardMaterial({color:'#FFFFFF',emissive:'#E8F4FF',emissiveIntensity:2.2,metalness:0.1,roughness:0.2});
  const floorMat=new THREE.MeshStandardMaterial({roughness:0.6});
  const nonPlayMat=new THREE.MeshStandardMaterial({roughness:0.8});
  const tex=document.createElement('canvas');const floorTex=new THREE.CanvasTexture(tex);floorTex.colorSpace=THREE.SRGBColorSpace;floorTex.anisotropy=16;
  floorMat.map=floorTex;
  const courtLight=new THREE.PointLight('#fff8e8',0,120,1.1);scene.add(courtLight);
  const add=(g,geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
  const FT=0.3048;
  
  // realistic floor texture generator
  function makeFloorTex(floorType:string,baseColor:string){
    const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d')!;
    const ft=floorType||'';
    if(ft==='Acrylic (Concrete)'){
      // grey concrete base with acrylic topcoat sheen
      g.fillStyle='#8A9BAA';g.fillRect(0,0,512,512);
      for(let i=0;i<2000;i++){const r=Math.random();g.fillStyle=`rgba(0,0,0,${0.01+r*0.025})`;g.beginPath();g.arc(Math.random()*512,Math.random()*512,0.5+r,0,Math.PI*2);g.fill();}
      g.strokeStyle='rgba(0,0,0,0.07)';g.lineWidth=1;
      for(let x=0;x<512;x+=48){g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke();}
      for(let y=0;y<512;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}
      const sh=g.createLinearGradient(0,0,512,512);sh.addColorStop(0,'rgba(255,255,255,0.08)');sh.addColorStop(1,'rgba(0,0,0,0.04)');g.fillStyle=sh;g.fillRect(0,0,512,512);
      const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=16;return t;
    }
    if(ft.includes('Wooden')||ft.includes('Wood')){
      // wood grain: plank rows with grain lines
      const plankW=512,plankH=36;
      const woodBases=['#C4894E','#B87940','#D4985C','#BF8448'];
      for(let y=0;y<512;y+=plankH){
        const bi=Math.floor(y/plankH)%woodBases.length;
        g.fillStyle=woodBases[bi];g.fillRect(0,y,512,plankH);
        // grain lines
        for(let i=0;i<22;i++){
          const gx=Math.random()*512,gy=y+Math.random()*plankH;
          g.strokeStyle=`rgba(80,45,10,${0.08+Math.random()*0.12})`;
          g.lineWidth=0.5+Math.random()*1.2;
          g.beginPath();g.moveTo(gx,gy);g.bezierCurveTo(gx+40,gy+(Math.random()-0.5)*6,gx+80,gy+(Math.random()-0.5)*6,gx+120,gy+(Math.random()-0.5)*4);g.stroke();
        }
        // knot occasionally
        if(Math.random()<0.15){const kx=Math.random()*480+16,ky=y+plankH/2;g.strokeStyle='rgba(90,50,15,0.18)';g.lineWidth=2;g.beginPath();g.ellipse(kx,ky,8,5,0,0,Math.PI*2);g.stroke();}
        // plank gap
        g.fillStyle='rgba(60,35,10,0.35)';g.fillRect(0,y,512,1.5);
      }
      // subtle sheen
      const sh=g.createLinearGradient(0,0,512,0);sh.addColorStop(0,'rgba(255,230,180,0.08)');sh.addColorStop(0.5,'rgba(255,230,180,0.18)');sh.addColorStop(1,'rgba(255,230,180,0.05)');
      g.fillStyle=sh;g.fillRect(0,0,512,512);
    } else if(ft.includes('Interlocking')){
      // interlocking rubber tiles: 64×64 squares with bevelled edges
      const tileS=64;
      const col1=baseColor,col2=shadeHex(baseColor,-20);
      for(let ty=0;ty<512;ty+=tileS)for(let tx=0;tx<512;tx+=tileS){
        const even=((tx/tileS)+(ty/tileS))%2===0;
        g.fillStyle=even?col1:col2;g.fillRect(tx,ty,tileS,tileS);
        // bevel highlight
        g.strokeStyle='rgba(255,255,255,0.15)';g.lineWidth=2;
        g.beginPath();g.moveTo(tx+2,ty+tileS-2);g.lineTo(tx+2,ty+2);g.lineTo(tx+tileS-2,ty+2);g.stroke();
        // bevel shadow
        g.strokeStyle='rgba(0,0,0,0.25)';g.lineWidth=2;
        g.beginPath();g.moveTo(tx+tileS-2,ty+2);g.lineTo(tx+tileS-2,ty+tileS-2);g.lineTo(tx+2,ty+tileS-2);g.stroke();
        // gap
        g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(tx,ty,2,tileS);g.fillRect(tx,ty,tileS,2);
      }
    } else if(ft.includes('Acrylic')){
      // acrylic: smooth coloured surface with faint texture
      g.fillStyle=baseColor;g.fillRect(0,0,512,512);
      for(let i=0;i<800;i++){g.fillStyle=`rgba(255,255,255,${0.015+Math.random()*0.025})`;g.fillRect(Math.random()*512,Math.random()*512,2,2);}
      const sh2=g.createLinearGradient(0,0,0,512);sh2.addColorStop(0,'rgba(255,255,255,0.12)');sh2.addColorStop(1,'rgba(0,0,0,0.08)');g.fillStyle=sh2;g.fillRect(0,0,512,512);
    } else if(ft.includes('Vinyl')){
      // vinyl: subtle diagonal grain
      g.fillStyle=baseColor;g.fillRect(0,0,512,512);
      g.strokeStyle='rgba(0,0,0,0.06)';g.lineWidth=1;
      for(let i=-512;i<1024;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i+512,512);g.stroke();}
    } else {
      // PVC / rubber: subtle stipple
      g.fillStyle=baseColor;g.fillRect(0,0,512,512);
      for(let i=0;i<2000;i++){const r=Math.random();g.fillStyle=`rgba(0,0,0,${0.02+r*0.04})`;g.beginPath();g.arc(Math.random()*512,Math.random()*512,0.6+r*1.2,0,Math.PI*2);g.fill();}
      // subtle grid sheen for PVC
      if(ft.includes('PVC')){g.strokeStyle='rgba(255,255,255,0.08)';g.lineWidth=1;for(let x=0;x<512;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke();}for(let y=0;y<512;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}}
    }
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=16;return t;
  }
  function shadeHex(hex:string,amt:number){const n=parseInt(hex.replace('#',''),16);const r=Math.max(0,Math.min(255,((n>>16)&255)+amt));const g2=Math.max(0,Math.min(255,((n>>8)&255)+amt));const b=Math.max(0,Math.min(255,(n&255)+amt));return '#'+[r,g2,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
  function floorProps(floorType:string):{roughness:number,metalness:number}{
    if(floorType.includes('Wooden')||floorType.includes('Wood'))return{roughness:0.55,metalness:0.03};
    if(floorType.includes('Acrylic'))return{roughness:0.3,metalness:0.05};
    if(floorType.includes('Vinyl'))return{roughness:0.5,metalness:0.02};
    if(floorType.includes('Interlocking'))return{roughness:0.75,metalness:0.0};
    return{roughness:0.65,metalness:0.0};
  }
  function drawPlay(sp:any,colour:string,floorType:string,npaFloor:string,npaCol:string){
    const k=60,pad=3*k,W=sp.W*k,L=sp.L*k;
    tex.width=W+pad*2;tex.height=L+pad*2;const g=tex.getContext('2d')!;
    const P=(x:number,z:number)=>[pad+(x+sp.W/2)*k,pad+(z+sp.L/2)*k];
    const rect=(x1:number,z1:number,x2:number,z2:number)=>{const a=P(x1,z1),b=P(x2,z2);g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);};
    const line=(a:[number,number],b:[number,number])=>{const p=P(...a),q=P(...b);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();};
    const hw=sp.W/2,hl=sp.L/2;
    const isMat=MAT_FLOORS.has(floorType);
    const ftx=makeFloorTex(floorType,colour);
    const fPat=g.createPattern(ftx.image as HTMLCanvasElement,'repeat');
    if(isMat){
      // ── Mat floor: same surface covers the whole slab, no surround split ───
      if(fPat){g.fillStyle=fPat;}else{g.fillStyle=colour;}
      g.fillRect(0,0,tex.width,tex.height);
    } else {
      // ── Non-play area ──────────────────────────────────────────────────────
      if(npaFloor&&npaFloor!=='-None-'){
        const nftx=makeFloorTex(npaFloor,npaCol);
        const npat=g.createPattern(nftx.image as HTMLCanvasElement,'repeat');
        if(npat){g.fillStyle=npat;}else{g.fillStyle=npaCol;}
        g.fillRect(0,0,tex.width,tex.height);
      } else {
        // plain concrete when no NPA selected
        g.fillStyle='#A8A39A';g.fillRect(0,0,tex.width,tex.height);
        for(let i=0;i<4000;i++){const r=Math.random();g.fillStyle=`rgba(0,0,0,${0.015+r*0.03})`;g.beginPath();g.arc(Math.random()*tex.width,Math.random()*tex.height,0.5+r,0,Math.PI*2);g.fill();}
        g.strokeStyle='rgba(0,0,0,0.08)';g.lineWidth=1;
        for(let x=0;x<tex.width;x+=k*2){g.beginPath();g.moveTo(x,0);g.lineTo(x,tex.height);g.stroke();}
        for(let y=0;y<tex.height;y+=k*2){g.beginPath();g.moveTo(0,y);g.lineTo(tex.width,y);g.stroke();}
      }
      // ── Play area: sport surface clipped to court boundary ─────────────────
      const tl=P(-hw,-hl),courtW=(sp.W)*k,courtH=(sp.L)*k;
      g.save();g.beginPath();g.rect(tl[0],tl[1],courtW,courtH);g.clip();
      if(fPat){g.fillStyle=fPat;}else{g.fillStyle=colour;}
      g.fillRect(tl[0],tl[1],courtW,courtH);
      g.restore();
    }
    // ── Court lines ──────────────────────────────────────────────────────────
    g.strokeStyle='rgba(255,255,255,0.95)';g.lineWidth=Math.max(3,k*0.055);
    if(sp.id==='badminton'){rect(-hw,-hl,hw,hl);rect(-2.59,-hl,2.59,hl);line([-hw,-5.94],[hw,-5.94]);line([-hw,5.94],[hw,5.94]);line([-2.59,-1.98],[2.59,-1.98]);line([-2.59,1.98],[2.59,1.98]);line([0,-hl],[0,-1.98]);line([0,1.98],[0,hl]);}
    else if(sp.id==='pickleball'){
      // outer boundary
      rect(-hw,-hl,hw,hl);
      // kitchen (non-volley zone) line - 2.235m from net each side
      line([-hw,-2.235],[hw,-2.235]);line([-hw,2.235],[hw,2.235]);
      // centre service line from kitchen line to baseline (each half)
      line([0,-hl],[0,-2.235]);line([0,2.235],[0,hl]);
    }
    else if(sp.id==='tennis'){
      // outer doubles boundary
      rect(-hw,-hl,hw,hl);
      // singles sidelines (vertical only — no extra baseline overlap)
      line([-4.115,-hl],[-4.115,hl]);line([4.115,-hl],[4.115,hl]);
      // service lines (run full singles width)
      line([-4.115,-6.4],[4.115,-6.4]);line([-4.115,6.4],[4.115,6.4]);
      // centre service line (between the two service lines, through the net)
      line([0,-6.4],[0,6.4]);
      // centre marks on baseline (0.3m to be visible)
      line([0,-hl],[0,-hl+0.3]);line([0,hl],[0,hl-0.3]);
    }
    else if(sp.id==='volleyball'){rect(-hw,-hl,hw,hl);line([-hw,-3],[hw,-3]);line([-hw,3],[hw,3]);}
    else if(sp.id==='basketball'){
      // outer boundary + half-court line
      rect(-hw,-hl,hw,hl);line([-hw,0],[hw,0]);
      // key/paint areas — FIBA: 4.9m wide × 5.8m long
      const kw=4.9,kl=5.8;
      rect(-kw/2,-hl,kw/2,-hl+kl);rect(-kw/2,hl-kl,kw/2,hl);
      // darc: draw arc using native canvas g.arc (canvas coords: z maps to y, same angle convention)
      const darc=(cx:number,cz:number,r:number,a0:number,a1:number,ccw=false)=>{const[pcx,pcy]=P(cx,cz);g.beginPath();g.arc(pcx,pcy,r*k,a0,a1,ccw);g.stroke();};
      // free throw semicircles (r=1.8m); canvas bottom half = toward mid-court
      darc(0,-hl+kl,1.8,0,Math.PI);darc(0,hl-kl,1.8,Math.PI,Math.PI*2);
      // restricted area arcs (r=1.25m from basket)
      darc(0,-hl+1.575,1.25,0,Math.PI);darc(0,hl-1.575,1.25,Math.PI,Math.PI*2);
      // 3-point: FIBA r=6.75m from basket; straight lines at 0.9m from sideline
      const cr=6.75,sx=hw-0.9;
      const dz=Math.sqrt(cr*cr-sx*sx);
      const bz=-hl+1.575;
      line([-sx,-hl],[-sx,bz+dz]);line([sx,-hl],[sx,bz+dz]);
      line([-sx,hl],[-sx,-bz-dz]);line([sx,hl],[sx,-bz-dz]);
      const ab=Math.atan2(dz,sx);
      darc(0,bz,cr,ab,Math.PI-ab);           // bottom basket arc (clockwise through 90°=mid-court)
      darc(0,-bz,cr,-ab,Math.PI+ab,true);    // top basket arc (anticlockwise through 270°=mid-court)
      // centre circles
      darc(0,0,1.8,0,Math.PI*2);darc(0,0,0.45,0,Math.PI*2);
    }
    else{rect(-hw,-hl,hw,hl);line([-hw,0],[hw,0]);}
    floorTex.dispose();floorTex.needsUpdate=true;
  }
  // realistic netting texture: fine hexagonal mesh
  function netTex(color:string,alpha:number){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d')!;g.clearRect(0,0,128,128);const cell=12;g.strokeStyle=color;g.lineWidth=1.2;for(let y=0;y<128+cell;y+=cell){for(let x=0;x<128+cell;x+=cell){g.beginPath();g.moveTo(x,y);g.lineTo(x+cell/2,y+cell);g.stroke();g.beginPath();g.moveTo(x+cell,y);g.lineTo(x+cell/2,y+cell);g.stroke();}}for(let y=0;y<128+cell;y+=cell){g.beginPath();g.moveTo(0,y);g.lineTo(128,y);g.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
  function boxNetTex(color:string){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;g.clearRect(0,0,64,64);g.fillStyle=color;g.fillRect(0,0,64,6);g.fillRect(0,0,6,64);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=16;return t;}
  function gridTex(color:string){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d')!;g.clearRect(0,0,128,128);g.strokeStyle=color;g.lineWidth=1.5;const cell=10;for(let y=0;y<128+cell;y+=cell){for(let x=0;x<128+cell;x+=cell){g.beginPath();g.moveTo(x,y);g.lineTo(x+cell,y+cell);g.stroke();g.beginPath();g.moveTo(x+cell,y);g.lineTo(x,y+cell);g.stroke();}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
  
  let curSp=null;
  let curEnc=null;
  
  // seeded random so the city is the same each time
  function rng(seed){return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  
  function windowTex(){const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.fillStyle='#8FA3B8';g.fillRect(0,0,128,256);for(let y=0;y<256;y+=32)for(let x=0;x<128;x+=24){g.fillStyle=Math.random()<0.25?'#FFE9A8':'#2C3E55';g.fillRect(x+6,y+8,14,18);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
  function buildCity(sp){
    // a neighbourhood around the pitch: street grid, pavements, blocks of buildings, trees, lamps and parked cars
    const R=rng(23);
    const hw=sp.W/2+6, hl=sp.L/2+6;           // pitch edge incl. run-off
    const PAVE=4, ROAD=14;
    const roadZ=hl+PAVE+ROAD/2, roadX=hw+PAVE+ROAD/2;
    const asphalt=new THREE.MeshStandardMaterial({color:'#3A3F47',roughness:.95});
    const pave=new THREE.MeshStandardMaterial({color:'#CDD2D9',roughness:.92});
    const kerb=new THREE.MeshStandardMaterial({color:'#EEF1F5',roughness:.9});
    const paint=new THREE.MeshStandardMaterial({color:'#F7F7F2',roughness:.8});
    const lawn=new THREE.MeshStandardMaterial({color:'#7DB06A',roughness:1});
    const EXT=420;
    // lawn and roads
    add(G.city,new THREE.PlaneGeometry(EXT,EXT),lawn,0,-0.03,0,-Math.PI/2);
    [-1,1].forEach(sz=>add(G.city,new THREE.PlaneGeometry(EXT,ROAD),asphalt,0,-0.02,sz*roadZ,-Math.PI/2));
    [-1,1].forEach(sx=>add(G.city,new THREE.PlaneGeometry(ROAD,EXT),asphalt,sx*roadX,-0.02,0,-Math.PI/2));
    // pavements and kerbs
    [-1,1].forEach(sz=>add(G.city,new THREE.BoxGeometry(EXT,0.12,PAVE),pave,0,0.06,sz*(hl+PAVE/2)));
    [-1,1].forEach(sx=>add(G.city,new THREE.BoxGeometry(PAVE,0.12,EXT),pave,sx*(hw+PAVE/2),0.06,0));
    [-1,1].forEach(sz=>add(G.city,new THREE.BoxGeometry(EXT,0.16,0.25),kerb,0,0.08,sz*(hl+PAVE)));
    [-1,1].forEach(sx=>add(G.city,new THREE.BoxGeometry(0.25,0.16,EXT),kerb,sx*(hw+PAVE),0.08,0));
    // centre dashes and edge lines
    for(let t=-EXT/2+4;t<EXT/2;t+=8){
      [-1,1].forEach(sz=>add(G.city,new THREE.PlaneGeometry(3.2,0.22),paint,t,-0.01,sz*roadZ,-Math.PI/2));
      [-1,1].forEach(sx=>add(G.city,new THREE.PlaneGeometry(0.22,3.2),paint,sx*roadX,-0.01,t,-Math.PI/2));
    }
    // zebra crossings where each road meets the pavement, near the pitch
    for(let k=-3;k<=3;k++){
      [-1,1].forEach(sz=>add(G.city,new THREE.PlaneGeometry(0.6,ROAD*0.6),paint,k*1.6-0.8+(k*0),-0.01,sz*(hl+PAVE+ROAD*0.3),-Math.PI/2));
    }
    // blocks of buildings
    const cols=['#E4DCCD','#D2C6B2','#BFCAD6','#EFE9DE','#A9B9C9','#CBB8A0','#B3C4B0','#D9D2C6'];
    const roofM=new THREE.MeshStandardMaterial({color:'#7B8491',roughness:.8});
    const win=windowTex();
    for(let i=-7;i<=7;i++)for(let j=-7;j<=7;j++){
      const cx=i*48, cz=j*48;
      if(Math.abs(cx)<roadX+18 && Math.abs(cz)<roadZ+18) continue;     // keep the streets and the pitch clear
      const n=2+Math.floor(R()*2);
      for(let k=0;k<n;k++){
        const bw=11+R()*11, bd=11+R()*11, bh=12+Math.floor(R()*10)*4+R()*3;
        const x=cx+(R()*2-1)*8, z=cz+(R()*2-1)*8;
        const m=new THREE.MeshStandardMaterial({color:cols[Math.floor(R()*cols.length)],roughness:.75});
        const t=win.clone();t.repeat.set(Math.max(1,Math.round(bw/3.2)),Math.max(1,Math.round(bh/3.2)));t.needsUpdate=true;
        m.map=t;
        add(G.city,new THREE.BoxGeometry(bw,bh,bd),m,x,bh/2,z);
        add(G.city,new THREE.BoxGeometry(bw+0.6,0.8,bd+0.6),roofM,x,bh+0.4,z);
      }
    }
    // trees along the pavements and in the park strips
    const trunk=new THREE.MeshStandardMaterial({color:'#5B4330',roughness:1});
    const leaf=new THREE.MeshStandardMaterial({color:'#3F7D3F',roughness:.95});
    const leaf2=new THREE.MeshStandardMaterial({color:'#4E8F48',roughness:.95});
    const treeAt=(x,z)=>{
      add(G.city,new THREE.CylinderGeometry(0.16,0.22,2.8,8),trunk,x,1.4,z);
      const r=1.7+R()*0.5;
      add(G.city,new THREE.SphereGeometry(r,10,8),R()<0.5?leaf:leaf2,x,3.6,z);
      add(G.city,new THREE.SphereGeometry(r*0.7,8,6),leaf2,x+0.5,4.9,z-0.3);
    };
    for(let t=-EXT/2+6;t<EXT/2-6;t+=9){
      if(Math.abs(t)>roadX+PAVE+2 || true){
        [-1,1].forEach(sz=>{ if(R()<0.85) treeAt(t+(R()-0.5)*2, sz*(hl+PAVE+1.2)); });
        [-1,1].forEach(sx=>{ if(R()<0.85) treeAt(sx*(hw+PAVE+1.2), t+(R()-0.5)*2); });
      }
    }
    // street lamps with arms
    const pole=new THREE.MeshStandardMaterial({color:'#4A5160',metalness:.5,roughness:.5});
    const lampHead=new THREE.MeshStandardMaterial({color:'#FFF6DA',emissive:'#FFF2C7',emissiveIntensity:1.1});
    for(let t=-EXT/2+10;t<EXT/2-10;t+=24){
      [-1,1].forEach(sz=>{const z=sz*(hl+PAVE*0.5);add(G.city,new THREE.CylinderGeometry(0.1,0.13,8,8),pole,t,4,z);add(G.city,new THREE.BoxGeometry(1.4,0.1,0.1),pole,t+0.7,7.9,z);add(G.city,new THREE.BoxGeometry(0.9,0.22,0.4),lampHead,t+1.3,7.8,z);});
      [-1,1].forEach(sx=>{const x=sx*(hw+PAVE*0.5);add(G.city,new THREE.CylinderGeometry(0.1,0.13,8,8),pole,x,4,t);add(G.city,new THREE.BoxGeometry(0.1,0.1,1.4),pole,x,7.9,t+0.7);add(G.city,new THREE.BoxGeometry(0.4,0.22,0.9),lampHead,x,7.8,t+1.3);});
    }
    // parked cars on the kerb and a few driving in the lanes
    const carCols=['#B3261E','#F2F2F2','#23324A','#D9A21B','#2F6FA8','#3C8D5A','#7D8794'];
    const glass=new THREE.MeshStandardMaterial({color:'#1B2430',roughness:.2,metalness:.3});
    const car=(x,z,rot)=>{
      const c=new THREE.MeshStandardMaterial({color:carCols[Math.floor(R()*carCols.length)],metalness:.45,roughness:.35});
      const g=new THREE.Group();
      const body=new THREE.Mesh(new THREE.BoxGeometry(4.2,0.95,1.9),c);body.position.y=0.7;g.add(body);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.7,1.7),glass);cab.position.set(-0.1,1.45,0);g.add(cab);
      g.traverse(o=>{o.castShadow=o.receiveShadow=true;});
      g.position.set(x,0,z);g.rotation.y=rot;G.city.add(g);
    };
    for(let t=-EXT/2+20;t<EXT/2-20;t+=11){
      if(R()<0.55) car(t, roadZ+(R()<0.5?-4.4:4.4), 0);
      if(R()<0.55) car(roadX+(R()<0.5?-4.4:4.4), t, Math.PI/2);
    }
    for(let t=-120;t<120;t+=36){ if(R()<0.7) car(t,roadZ+(R()<0.5?-2.6:2.6)*0+3.4*(R()<0.5?-1:1),0); }
  }

  const COURT_SVG={
    badminton:'<rect x="4" y="4" width="52" height="92"/><line x1="4" y1="50" x2="56" y2="50"/><line x1="10" y1="4" x2="10" y2="96"/><line x1="50" y1="4" x2="50" y2="96"/><line x1="4" y1="30" x2="56" y2="30"/><line x1="4" y1="70" x2="56" y2="70"/><line x1="30" y1="4" x2="30" y2="30"/><line x1="30" y1="70" x2="30" y2="96"/>',
    pickleball:'<rect x="4" y="4" width="52" height="92"/><line x1="4" y1="50" x2="56" y2="50" stroke-dasharray="3 3"/><line x1="4" y1="34" x2="56" y2="34"/><line x1="4" y1="66" x2="56" y2="66"/><line x1="30" y1="4" x2="30" y2="34"/><line x1="30" y1="66" x2="30" y2="96"/>',
    tennis:'<rect x="4" y="4" width="52" height="92"/><line x1="11" y1="4" x2="11" y2="96"/><line x1="49" y1="4" x2="49" y2="96"/><line x1="11" y1="27" x2="49" y2="27"/><line x1="11" y1="73" x2="49" y2="73"/><line x1="30" y1="27" x2="30" y2="73"/><line x1="4" y1="50" x2="56" y2="50" stroke-dasharray="3 3"/>',
    basketball:'<rect x="4" y="4" width="52" height="92"/><line x1="4" y1="50" x2="56" y2="50"/><circle cx="30" cy="50" r="8"/><rect x="21" y="4" width="18" height="22"/><rect x="21" y="74" width="18" height="22"/><path d="M12 4V18A18 18 0 0 0 48 18V4"/><path d="M12 96V82A18 18 0 0 1 48 82V96"/>'
  };
  const SET_SVG={
    indoor:'<path d="M6 24 L30 6 L54 24 V54 H6 Z"/><path d="M23 54 V36 H37 V54"/>',
    outdoor:'<circle cx="30" cy="22" r="10"/><line x1="6" y1="48" x2="54" y2="48"/><line x1="14" y1="56" x2="46" y2="56"/>',
    semi:'<path d="M6 16 H54"/><line x1="12" y1="16" x2="12" y2="54"/><line x1="48" y1="16" x2="48" y2="54"/><path d="M18 30 H42 M18 38 H42"/>'
  };
  function paintEmpty(em){
    const sportStep=!S.sport;
    const cards=sportStep
      ?Object.keys(SPORTS).map(k=>`<button class="cd-ecard" data-pick="${k}"><svg viewBox="0 0 60 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${COURT_SVG[k]}</svg><b>${SPORTS[k].n}</b><i>${SPORTS[k].L} × ${SPORTS[k].W} m</i></button>`).join('')
      :Object.keys(CATS).map(k=>`<button class="cd-ecard cd-ecard-w" data-pick="${k}"><svg viewBox="0 0 60 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SET_SVG[k]}</svg><b>${CATS[k]}</b><i>${CAT_TEXT[k]}</i></button>`).join('');
    em.innerHTML=`<div class="cd-estep"><span>Step ${sportStep?1:2} of 3</span></div><h3>${sportStep?'Choose your sport':T('Choose the setting for {sport}').replace('{sport}',T(SPORTS[S.sport].n))}</h3><p>${sportStep?'Pick a court to start. Your design builds here in 3D as you answer each step.':'Indoor, outdoor or semi-indoor decides the structure built around your court.'}</p><div class="cd-egrid ${sportStep?'':'cd-egrid-3'}">${cards}</div>`;
    em.querySelectorAll('[data-pick]').forEach(btn=>btn.onclick=()=>{(panel.querySelector('.cd-tile[data-k="'+btn.dataset.pick+'"]') as HTMLElement|null)?.click();});localize(em);
  }

  function build(){
    Object.values(G).forEach(g=>{while(g.children.length){const c=g.children.pop();c.geometry&&c.geometry.dispose();}});
    const em=$('cdEmpty');if(em){const idle=!S.sport||!S.cat;em.classList.toggle('cd-show',idle);if(idle)paintEmpty(em);}
    if(!S.sport||!S.cat){scene.background=null;scene.fog=null;summary();return;}
    const sp={...SPORTS[S.sport],id:S.sport};
    curSp=sp;
    curEnc=null;
    const indoor=S.cat==='indoor', semi=S.cat==='semi';
    const runoff=indoor?3.5:6;
    const RW=sp.W+runoff*2,RL=sp.L+runoff*2;
    // play area and non-play area flooring
    const playFloor=S.parts.floor?S.floor.play:'PVC Synthetic Mat';
    const playCol=PLAY_COLOR[playFloor]||'#2E7D41';
    const autoNpa=npaFor(playFloor);
    const npFloor=S.parts.floor&&S.floor.nonplayOn&&autoNpa?autoNpa:'-None-';
    const npCol=npFloor!=='-None-'?(NONPLAY_COLOR[npFloor]||'#B9BDC4'):(indoor?'#B9BDC4':'#6DAA5B');
    drawPlay(sp,playCol,playFloor,npFloor,npCol);
    const fp=floorProps(playFloor);
    floorMat.roughness=fp.roughness;floorMat.metalness=fp.metalness;
    const playMat=floorMat;
    add(G.court,new THREE.PlaneGeometry(sp.W+6,sp.L+6),playMat,0,0.005,0,-Math.PI/2);
    const npFp=floorProps(npFloor);
    const npTex=makeFloorTex(npFloor,npCol);npTex.repeat.set(RW/4,RL/4);npTex.needsUpdate=true;
    const npMat=new THREE.MeshStandardMaterial({map:npTex,roughness:npFp.roughness,metalness:npFp.metalness});
    add(G.ground,new THREE.PlaneGeometry(RW,RL),npMat,0,-0.01,0,-Math.PI/2);
    if(!indoor) add(G.ground,new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:'#5A9448',roughness:1}),0,-0.02,0,-Math.PI/2);
    const dk=document.documentElement.dataset.theme==='dark';
    const sky=dk?(indoor?'#0E1A2E':'#0C1F36'):(indoor?'#E9EEF6':'#BFD9F2');
    scene.background=new THREE.Color(sky);
    scene.fog=indoor?null:new THREE.Fog(sky,120,330);
    // fabrication
    if(S.parts.fab){
      if(indoor){
        const H=8.5,hw=RW/2,hl=RL/2;
        // closed walls with a louvre band near the top
        const wallH=H-1.6;
        add(G.shell,new THREE.BoxGeometry(RW,wallH,0.2),wallMat,0,wallH/2,-hl);
        add(G.shell,new THREE.BoxGeometry(RW,wallH,0.2),wallMat,0,wallH/2,hl);
        add(G.shell,new THREE.BoxGeometry(0.2,wallH,RL),wallMat,-hw,wallH/2,0);
        add(G.shell,new THREE.BoxGeometry(0.2,wallH,RL),wallMat,hw,wallH/2,0);
        if(S.fab.louvers){
          // 5 ft (1.524 m) louvre band under the roof edge on every side
          const band=1.524, y0=H-band;
          for(let y=y0;y<H-0.05;y+=0.2){
            add(G.shell,new THREE.BoxGeometry(RW,0.1,0.06),louverMat,0,y,-hl-0.12);
            add(G.shell,new THREE.BoxGeometry(RW,0.1,0.06),louverMat,0,y,hl+0.12);
            add(G.shell,new THREE.BoxGeometry(0.06,0.1,RL),louverMat,-hw-0.12,y,0);
            add(G.shell,new THREE.BoxGeometry(0.06,0.1,RL),louverMat,hw+0.12,y,0);
          }
        }
        // steel portal frame
        for(let z=-hl+1.5;z<=hl-1.5;z+=3.8){add(G.shell,new THREE.BoxGeometry(0.28,H,0.28),steelMat,-hw,H/2,z);add(G.shell,new THREE.BoxGeometry(0.28,H,0.28),steelMat,hw,H/2,z);add(G.shell,new THREE.BoxGeometry(RW,0.28,0.28),steelMat,0,H+0.14,z);}
        if(S.fab.roof){
          const rise=2.6,geo=new THREE.BufferGeometry();
          geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-hw,H,-hl, 0,H+rise,-hl, 0,H+rise,hl, -hw,H,-hl, 0,H+rise,hl, -hw,H,hl, hw,H,-hl, hw,H,hl, 0,H+rise,hl, hw,H,-hl, 0,H+rise,hl, 0,H+rise,-hl]),3));geo.computeVertexNormals();
          add(G.roof,geo,roofSheetMat,0,0,0);
          // gable ends closed with roofing sheets
          const gable=new THREE.BufferGeometry();
          gable.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-hw,H,-hl-0.02, hw,H,-hl-0.02, 0,H+rise,-hl-0.02]),3));gable.computeVertexNormals();
          add(G.roof,gable,roofSheetMat,0,0,0);
          const gable2=new THREE.BufferGeometry();
          gable2.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-hw,H,hl+0.02, hw,H,hl+0.02, 0,H+rise,hl+0.02]),3));gable2.computeVertexNormals();
          add(G.roof,gable2,roofSheetMat,0,0,0);
        }
      } else if(semi){
        // open-sided frame with a roof and louvre screens to 3 m
        const H=6.5,hw=RW/2,hl=RL/2;
        for(let z=-hl+1.5;z<=hl-1.5;z+=3.8){add(G.shell,new THREE.BoxGeometry(0.28,H,0.28),steelMat,-hw,H/2,z);add(G.shell,new THREE.BoxGeometry(0.28,H,0.28),steelMat,hw,H/2,z);add(G.shell,new THREE.BoxGeometry(RW,0.28,0.28),steelMat,0,H+0.14,z);}
        if(S.fab.roof){const geo=new THREE.BoxGeometry(RW,0.1,RL);add(G.roof,geo,roofSheetMat,0,H+1.2,0);}
        if(S.fab.louvers){for(let y=0.4;y<3;y+=0.22){add(G.shell,new THREE.BoxGeometry(RW,0.1,0.06),louverMat,0,y,-hl);add(G.shell,new THREE.BoxGeometry(RW,0.1,0.06),louverMat,0,y,hl);}}
      } else {
        // outdoor: side and top netting around the court, on poles spaced every 10 ft
        const CL=3.05, PH=6.1, PS=3.05;          // clearance 10 ft, pole height 20 ft, pole spacing 10 ft
        const fx=sp.W/2+CL, fz=sp.L/2+CL;
        const pts=[];
        const edge=(ax,az,bx,bz)=>{const len=Math.hypot(bx-ax,bz-az);const n=Math.max(1,Math.ceil(len/PS));for(let i=0;i<n;i++){const t=i/n;pts.push([ax+(bx-ax)*t,az+(bz-az)*t]);}};
        edge(-fx,-fz,fx,-fz);edge(fx,-fz,fx,fz);edge(fx,fz,-fx,fz);edge(-fx,fz,-fx,-fz);
        pts.push([fx,fz]);pts.push([-fx,fz]);pts.push([fx,-fz]);pts.push([-fx,-fz]);
        const uniq=[...new Map(pts.map(p=>[p[0].toFixed(2)+','+p[1].toFixed(2),p])).values()];
        uniq.forEach(([x,z])=>add(G.shell,new THREE.CylinderGeometry(0.06,0.07,PH,10),steelMat,x,PH/2,z));
        // top rail around the top of the poles
        const rail=(ax,az,bx,bz)=>{const len=Math.hypot(bx-ax,bz-az);const m=new THREE.Mesh(new THREE.BoxGeometry(len,0.06,0.06),steelMat);m.position.set((ax+bx)/2,PH,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);G.shell.add(m);};
        rail(-fx,-fz,fx,-fz);rail(fx,-fz,fx,fz);rail(fx,fz,-fx,fz);rail(-fx,fz,-fx,-fz);
        if(S.fab.side){
          const nt=boxNetTex('#E8EEF5');
          const sm=new THREE.MeshBasicMaterial({map:nt,transparent:true,opacity:0.95,alphaTest:0.05,side:THREE.DoubleSide,depthWrite:false});
          const wall=(ax:number,az:number,bx:number,bz:number)=>{const len=Math.hypot(bx-ax,bz-az);const g=new THREE.PlaneGeometry(len,PH);const mat=sm.clone() as any;mat.map=nt.clone();mat.map.repeat.set(len/0.15,PH/0.15);mat.map.needsUpdate=true;const m=new THREE.Mesh(g,mat);m.position.set((ax+bx)/2,PH/2,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);G.net.add(m);};
          wall(-fx,-fz,fx,-fz);wall(fx,-fz,fx,fz);wall(fx,fz,-fx,fz);wall(-fx,fz,-fx,-fz);
        }
        if(S.fab.top){
          const nt=boxNetTex('#E8EEF5');nt.repeat.set((fx*2)/0.15,(fz*2)/0.15);nt.needsUpdate=true;
          const tm=new THREE.Mesh(new THREE.PlaneGeometry(fx*2,fz*2),new THREE.MeshBasicMaterial({map:nt,transparent:true,opacity:0.95,alphaTest:0.05,side:THREE.DoubleSide,depthWrite:false}));
          tm.rotation.x=-Math.PI/2;tm.position.y=PH;G.net.add(tm);
        }
        // numbers for the summary
        curEnc={poles:uniq.length,pole:PH,sideArea:(S.fab.side?2*(fx*2)+2*(fz*2):0)*PH,topArea:S.fab.top?(fx*2)*(fz*2):0,perimeter:4*(fx+fz)};
      }
    }
    // lighting
    if(S.parts.light){
      if(indoor||semi){
        const count=Math.max(1,S.courts);
        const H=8.2;const per=Math.min(count*2,6);
        const ledLen=Math.min(5.5,sp.L*0.7);
        const houseMat=new THREE.MeshStandardMaterial({color:'#C8CDD5',metalness:0.5,roughness:0.4});
        for(let i=0;i<per;i++){
          const lx=(i-(per-1)/2)*(sp.W/(per-1||1)*0.85);
          // housing
          add(G.lights,new THREE.BoxGeometry(0.22,0.1,ledLen),houseMat,lx,H,0);
          // LED panel strip inside housing
          add(G.lights,new THREE.BoxGeometry(0.17,0.04,ledLen*0.9),ledMat,lx,H-0.07,0);
          // mount bracket
          add(G.lights,new THREE.CylinderGeometry(0.015,0.015,0.35,8),new THREE.MeshStandardMaterial({color:'#5A6270',metalness:0.8,roughness:0.2}),lx,H+0.17,0);
        }
        courtLight.position.set(0,H-0.5,0);courtLight.intensity=70;
      } else {
        // 5 flood-light poles on each of the two longer sides only
        const wattage=LIGHT_OUT[S.light.type]||100;
        const COUNT=5;
        // longer axis is Z (length), so poles go along ±X sides
        const px=sp.W/2+3.5;
        const floodMat=new THREE.MeshStandardMaterial({color:'#D0D6DE',metalness:0.5,roughness:0.4});
        const floodLedMat=new THREE.MeshStandardMaterial({color:'#FFF8E8',emissive:'#FFF4D0',emissiveIntensity:2.0,roughness:0.1});
        const armMat=new THREE.MeshStandardMaterial({color:'#5A6270',metalness:0.75,roughness:0.25});
        const polePositions:number[]=[];
        for(let i=0;i<COUNT;i++){polePositions.push(-sp.L/2+(sp.L/(COUNT-1))*i);}
        [-px,px].forEach(sx=>{
          polePositions.forEach(pz=>{
            add(G.lights,new THREE.CylinderGeometry(0.09,0.14,8.5,12),postMat,sx,4.25,pz);
            // crossarm reaching toward the court
            const armDir=sx<0?1:-1;
            add(G.lights,new THREE.CylinderGeometry(0.025,0.025,1.4,8),armMat,sx+armDir*0.7,8.6,pz,0,0,Math.PI/2);
            // flood head at arm tip
            add(G.lights,new THREE.BoxGeometry(0.55,0.14,0.34),floodMat,sx+armDir*1.4,8.52,pz);
            add(G.lights,new THREE.BoxGeometry(0.42,0.06,0.26),floodLedMat,sx+armDir*1.4,8.44,pz);
          });
        });
        courtLight.position.set(0,10,0);courtLight.intensity=wattage*COUNT*2/100;
      }
    } else { courtLight.intensity=0; }
    if(!indoor&&!semi) buildCity(sp);
    // play-area court net
    if(sp.net==='hoop'){
      // two basketball goals: pole behind the baseline, arm, glass backboard, orange rim and net
      const hl2=sp.L/2;
      const steelM=new THREE.MeshStandardMaterial({color:'#2B323D',metalness:0.8,roughness:0.3});
      const glassM=new THREE.MeshStandardMaterial({color:'#DDEBF5',transparent:true,opacity:0.38,roughness:0.08,metalness:0.1,side:THREE.DoubleSide});
      const rimM=new THREE.MeshStandardMaterial({color:'#E8541E',metalness:0.5,roughness:0.35});
      const padM=new THREE.MeshStandardMaterial({color:'#C73A14',roughness:0.7});
      const ht=netTex('rgba(250,250,250,0.95)',0.9);ht.repeat.set(10,2);ht.needsUpdate=true;
      [-1,1].forEach(sd=>{
        const bz=sd*(hl2-1.2);                 // backboard plane
        const pz=sd*(hl2+1.1);                 // support pole
        add(G.net,new THREE.CylinderGeometry(0.1,0.12,3.7,16),steelM,0,1.85,pz);
        add(G.net,new THREE.BoxGeometry(0.7,0.12,0.9),steelM,0,0.06,pz+sd*0.1);
        add(G.net,new THREE.BoxGeometry(0.12,0.12,Math.abs(pz-bz)+0.1),steelM,0,3.55,(pz+bz)/2);
        add(G.net,new THREE.BoxGeometry(1.8,1.05,0.04),glassM,0,3.425,bz);
        add(G.net,new THREE.BoxGeometry(1.84,0.04,0.05),steelM,0,2.9,bz);
        add(G.net,new THREE.BoxGeometry(1.84,0.04,0.05),steelM,0,3.95,bz);
        add(G.net,new THREE.BoxGeometry(0.04,1.05,0.05),steelM,-0.9,3.425,bz);
        add(G.net,new THREE.BoxGeometry(0.04,1.05,0.05),steelM,0.9,3.425,bz);
        add(G.net,new THREE.BoxGeometry(0.59,0.45,0.045),new THREE.MeshStandardMaterial({color:'#C73A14',transparent:true,opacity:0.0}),0,3.2,bz);
        const rz=sd*(hl2-1.575);               // rim centre, 1.575 m from the baseline
        add(G.net,new THREE.TorusGeometry(0.225,0.011,10,40),rimM,0,3.05,rz,Math.PI/2);
        add(G.net,new THREE.BoxGeometry(0.1,0.03,Math.abs(rz-bz)-0.2),rimM,0,3.05,(rz+bz)/2+sd*0.1);
        const net=add(G.net,new THREE.CylinderGeometry(0.225,0.14,0.42,24,1,true),new THREE.MeshBasicMaterial({map:ht,transparent:true,alphaTest:0.1,side:THREE.DoubleSide,depthWrite:false}),0,2.84,rz);
        net.castShadow=false;
      });
    }
    if(sp.net==='net'){
      // net posts - polished steel
      [-(sp.W/2+0.9),sp.W/2+0.9].forEach(x=>{add(G.net,new THREE.CylinderGeometry(0.04,0.045,sp.netH+0.3,16),new THREE.MeshStandardMaterial({color:'#8A939E',metalness:0.85,roughness:0.15}),x,(sp.netH+0.3)/2,0);});
      // top cable
      add(G.net,new THREE.CylinderGeometry(0.012,0.012,sp.W+1.8,8),new THREE.MeshStandardMaterial({color:'#C0C8D0',metalness:0.9,roughness:0.1}),0,sp.netH+0.12,0,0,0,Math.PI/2);
      // net mesh
      const nt=netTex('rgba(230,235,245,0.9)',0.85);nt.repeat.set((sp.W+1.8)/0.3,sp.netH/0.3);
      const net=new THREE.Mesh(new THREE.PlaneGeometry(sp.W+1.8,sp.netH),new THREE.MeshBasicMaterial({map:nt,transparent:true,side:THREE.DoubleSide,alphaTest:0.08,depthWrite:false}));net.position.set(0,sp.netH/2+0.1,0);G.net.add(net);}
    else if(sp.net==='goal'){
      // goal frames with crossbar, posts, netting
      [-1,1].forEach(s=>{
        const gw=7.32,gh=2.44;
        add(G.net,new THREE.CylinderGeometry(0.055,0.055,gh,10),new THREE.MeshStandardMaterial({color:'#E8E8E8',metalness:0.7,roughness:0.2}),-gw/2,gh/2,s*(sp.L/2));
        add(G.net,new THREE.CylinderGeometry(0.055,0.055,gh,10),new THREE.MeshStandardMaterial({color:'#E8E8E8',metalness:0.7,roughness:0.2}),gw/2,gh/2,s*(sp.L/2));
        add(G.net,new THREE.CylinderGeometry(0.055,0.055,gw,10),new THREE.MeshStandardMaterial({color:'#E8E8E8',metalness:0.7,roughness:0.2}),0,gh,s*(sp.L/2),0,0,Math.PI/2);
        const gt=netTex('rgba(255,255,255,0.7)',0.7);gt.repeat.set(gw/0.25,gh/0.25);
        const gnet=new THREE.Mesh(new THREE.PlaneGeometry(gw,gh),new THREE.MeshBasicMaterial({map:gt,transparent:true,side:THREE.DoubleSide,alphaTest:0.05,depthWrite:false}));gnet.position.set(0,gh/2,s*(sp.L/2));G.net.add(gnet);
      });
    }
    // accessories
    if(S.parts.acc){
      if(S.accs['Scoreboard']&&indoor){
        // scoreboard: hanging above court center, two-sided so visible from both ends
        const sbH=4.2;
        add(G.acc,new THREE.BoxGeometry(2.8,1.4,0.15),new THREE.MeshStandardMaterial({color:'#0C0F14',metalness:0.3,roughness:0.6}),0,sbH,0);
        // suspension rod
        add(G.acc,new THREE.CylinderGeometry(0.03,0.03,1.0,8),new THREE.MeshStandardMaterial({color:'#444950',metalness:0.8}),0,sbH+1.1,0);
        // LED screen canvas with ISI digital text
        const sbCanvas=document.createElement('canvas');sbCanvas.width=512;sbCanvas.height=200;
        const sbG=sbCanvas.getContext('2d');
        sbG.fillStyle='#010a14';sbG.fillRect(0,0,512,200);
        sbG.font='bold 120px "Courier New", monospace';
        sbG.textAlign='center';sbG.textBaseline='middle';
        sbG.shadowColor='#00cfff';sbG.shadowBlur=30;
        sbG.fillStyle='#00e5ff';
        sbG.fillText('ISI',256,105);
        const sbTex=new THREE.CanvasTexture(sbCanvas);
        // front face (-Z)
        const sbFront=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.0),new THREE.MeshBasicMaterial({map:sbTex}));
        sbFront.position.set(0,sbH,-0.09);G.acc.add(sbFront);
        // back face (+Z)
        const sbBack=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.0),new THREE.MeshBasicMaterial({map:sbTex}));
        sbBack.position.set(0,sbH,0.09);sbBack.rotation.y=Math.PI;G.acc.add(sbBack);
      }
      if(S.accs['Player benches']){
        // one bench each side: left side near one end, right side near other end
        const benchSides=[[-sp.W/2-1.2,-sp.L/4],[sp.W/2+1.2,sp.L/4]];
        benchSides.forEach(([x,z])=>{
          add(G.acc,new THREE.BoxGeometry(0.4,0.04,3.0),new THREE.MeshStandardMaterial({color:'#C88040',roughness:0.6,metalness:0.0}),x,0.46,z);
          [[-1.3],[1.3]].forEach(([dz])=>add(G.acc,new THREE.CylinderGeometry(0.025,0.025,0.46,8),new THREE.MeshStandardMaterial({color:'#5A6270',metalness:0.7,roughness:0.3}),x,0.23,z+dz));
        });
      }
      if(S.accs['Seating (spectator)']){
        // tiered spectator stands on both long sides, stepping up away from the court
        const len=Math.min(sp.L*0.8,16),so=runoff-2.25;
        const stepMat=new THREE.MeshStandardMaterial({color:'#B9C0CA',roughness:0.85});
        const seatMat=new THREE.MeshStandardMaterial({color:'#1F5FBF',roughness:0.45});
        const backMat=new THREE.MeshStandardMaterial({color:'#164A96',roughness:0.5});
        const railMat=new THREE.MeshStandardMaterial({color:'#2B323D',metalness:0.7,roughness:0.3});
        [-1,1].forEach(sd=>{
          for(let i=0;i<3;i++){
            const hy=0.4*(i+1),cx=sd*(sp.W/2+so+0.4+i*0.8);
            add(G.acc,new THREE.BoxGeometry(0.8,hy,len),stepMat,cx,hy/2,0);
            const n=Math.floor(len/0.6);
            for(let k=0;k<n;k++){
              const z=-len/2+0.3+k*(len/n)+((len/n)-0.6)/2;
              add(G.acc,new THREE.BoxGeometry(0.42,0.07,0.5),seatMat,cx-sd*0.08,hy+0.28,z);
              add(G.acc,new THREE.BoxGeometry(0.06,0.34,0.5),backMat,cx+sd*0.17,hy+0.46,z);
            }
          }
          // safety rail at the back of the stand
          const rx=sd*(sp.W/2+so+0.4+2*0.8+0.45);
          add(G.acc,new THREE.BoxGeometry(0.05,0.05,len),railMat,rx,1.9,0);
          [-len/2,0,len/2].forEach(z=>add(G.acc,new THREE.CylinderGeometry(0.025,0.025,0.8,8),railMat,rx,1.5,z));
        });
      }
      if(S.accs['Water station']){
        // water cooler: body, tank on top, tap, drip tray
        const wx=sp.W/2+1.0, wz=sp.L/2-0.5;
        add(G.acc,new THREE.BoxGeometry(0.4,0.9,0.4),new THREE.MeshStandardMaterial({color:'#E8EEF4',roughness:0.4,metalness:0.1}),wx,0.45,wz);
        add(G.acc,new THREE.CylinderGeometry(0.14,0.14,0.35,12),new THREE.MeshStandardMaterial({color:'#1A6EC4',roughness:0.3,metalness:0.05,transparent:true,opacity:0.75}),wx,1.08,wz);
        add(G.acc,new THREE.BoxGeometry(0.08,0.06,0.12),new THREE.MeshStandardMaterial({color:'#5A6270',metalness:0.6}),wx+0.17,0.65,wz);
        add(G.acc,new THREE.BoxGeometry(0.42,0.04,0.44),new THREE.MeshStandardMaterial({color:'#A0B4C8',roughness:0.5}),wx,0.02,wz);
      }
      if(S.accs['Umpire chair']&&sp.net==='net'){
        // umpire chair: legs, seat, backrest
        add(G.acc,new THREE.BoxGeometry(0.55,0.04,0.55),new THREE.MeshStandardMaterial({color:'#C88040',roughness:0.6}),-sp.W/2-2,1.5,0);
        add(G.acc,new THREE.BoxGeometry(0.5,1.5,0.06),new THREE.MeshStandardMaterial({color:'#2F7F35',roughness:0.7}),-sp.W/2-2,0.8,0.25);
        [[-0.22,-0.22],[0.22,-0.22],[0.22,0.22],[-0.22,0.22]].forEach(([dx,dz])=>add(G.acc,new THREE.CylinderGeometry(0.025,0.025,1.5,8),new THREE.MeshStandardMaterial({color:'#5A6270',metalness:0.7,roughness:0.3}),-sp.W/2-2+dx,0.75,dz));
      }
    }
    G.roof.visible=S.view!=='inside';
    roofSheetMat.opacity=S.view==='bird'?0.28:1;
    summary(sp);
  }
  
  function frame(sp){
    if(!sp)return;
    const runoff=S.cat==='indoor'?3.5:6;
    const hw=sp.W/2+runoff, hl=sp.L/2+runoff;
    if(S.view==='inside'){
      // standing at the side of the court, looking across it at player height
      camera.position.set(sp.W/2+runoff*0.5,1.7,-(sp.L/2)+1.2);
      controls.target.set(0,1.2,sp.L/4);
      controls.minDistance=1;controls.maxDistance=60;
    } else {
      // bird view: angled from above-side so court reads as 3D
      const d=Math.max(sp.L,sp.W)*(S.cat==='outdoor'?2.7:1.5);
      camera.position.set(-d*0.55,d*1.1,d*0.55);
      controls.target.set(0,0,0);
      controls.minDistance=4;controls.maxDistance=110;
    }
    camera.updateProjectionMatrix();
    G.roof.visible=S.view!=='inside';
    roofSheetMat.opacity=S.view==='bird'?0.28:1;
  }
  
  function courtCount(){return S.courts;}
  
  // ---------- summary ----------
  function summary(sp?:any){summaryInner(sp);const sb=$('sumBody');if(sb)localize(sb);}
  function summaryInner(sp?:any){
    const body=$('sumBody');if(!body)return;
    if(!S.sport||!S.cat){body.innerHTML='<span class="cd-sum-empty">'+(S.sport?'Choose a setting to preview your court':'Choose a sport to preview your court')+'</span>';return;}
    const rows:string[]=[];
    rows.push(`<span class="cd-sum-row"><b>${SPORTS[S.sport].n}</b><i>Sport</i></span>`);
    rows.push(`<span class="cd-sum-row"><b>${SPORTS[S.sport].L} × ${SPORTS[S.sport].W} m</b><i>Court size</i></span>`);
    rows.push(`<span class="cd-sum-row"><b>${CATS[S.cat]}</b><i>Category</i></span>`);
    rows.push(`<span class="cd-sum-row"><b>${S.courts} ${T(S.courts>1?'courts':'court')}</b><i>Count</i></span>`);
    if(S.parts.floor){rows.push(`<span class="cd-sum-row"><b>${T(S.floor.play)}</b><i>Flooring</i></span>`);}
    if(S.parts.light&&sp){
      const lbl=S.cat==='outdoor'?S.light.type:`${(LIGHT_IND[S.light.type]||1500)*S.courts} W`;
      rows.push(`<span class="cd-sum-row"><b>${lbl}</b><i>Lighting</i></span>`);
    }
    if(S.parts.fab){
      let fab='';
      if(S.cat==='indoor')fab=T('Closed hall');
      else if(S.cat==='semi')fab=T('Semi frame');
      else fab=T('Cage')+(S.fab.side?' + '+T('side net'):'')+(S.fab.top?' + '+T('top'):'');
      rows.push(`<span class="cd-sum-row"><b>${fab}</b><i>Structure</i></span>`);
    }
    body.innerHTML=rows.join('<span class="cd-sum-div"></span>');
  }
  
  // ---------- wizard panel ----------
  const panel=$('panel');
  function h(tag,attrs={},...kids){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='on')e.onclick=v;else if(k==='cls')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.includes('-'))e.setAttribute(k,v);else e[k]=v;});kids.flat().forEach(c=>e.append(c));return e;}
  // simple line icons for the tiles
  const SPORT_ICON=(ratio)=>{const w=44,hh=Math.max(20,Math.min(34,44/ratio));const x0=(48-w)/2,y0=(40-hh)/2;return `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="${x0}" y="${y0}" width="${w}" height="${hh}" rx="2"/><line x1="24" y1="${y0}" x2="24" y2="${y0+hh}"/><line x1="${x0+w*0.2}" y1="${y0}" x2="${x0+w*0.2}" y2="${y0+hh}"/><line x1="${x0+w*0.8}" y1="${y0}" x2="${x0+w*0.8}" y2="${y0+hh}"/></svg>`;};
  const CAT_ICON={
    indoor:'<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M8 20 L24 7 L40 20 V34 H8 Z"/><path d="M20 34 V25 H28 V34"/></svg>',
    outdoor:'<svg viewBox="0 0 48 40" aria-hidden="true"><circle cx="24" cy="18" r="7"/><line x1="6" y1="32" x2="42" y2="32"/><line x1="12" y1="37" x2="36" y2="37"/></svg>',
    semi:'<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M6 12 H42"/><line x1="10" y1="12" x2="10" y2="34"/><line x1="38" y1="12" x2="38" y2="34"/><path d="M14 22 H34 M14 27 H34"/></svg>'
  };
  const CAT_TEXT={indoor:'Closed hall with louvres and roofing',outdoor:'Open turf with side and top netting',semi:'Roof and louvre screens, open sides'};
  function tiles(list,current,onpick,meta?:any){
    return h('div',{cls:'cd-tiles'},...list.map(k=>{
      const label=meta?meta(k).title:k;
      return h('button',{cls:'cd-tile'+(current===k?' cd-on':''),'data-k':k,on:()=>onpick(k),'aria-pressed':current===k?'true':'false'},
        h('span',{cls:'cd-tile-t'},label));
    }));
  }
  function choice(list,current,onpick,labelFn=x=>x){return h('div',{cls:'cd-opts'},...list.map(x=>h('button',{cls:'cd-opt'+(current===x?' cd-on':''),on:()=>onpick(x)},labelFn(x))));}
  function collapsed(n,title,text){
    return h('div',{cls:'cd-coll'},h('span',{cls:'cd-dot cd-done'},n),h('div',{cls:'cd-coll-t'},h('b',{},title),h('span',{},text)));
  }
  function pipeline(){
    const cur=!S.sport?0:!S.cat?1:2;
    const names=['Sport','Category','Parts'];
    const items=[];
    names.forEach((n,i)=>{
      items.push(h('div',{cls:'cd-pn'+(i<cur?' cd-done':'')+(i===cur?' cd-now':'')},h('span',{cls:'cd-dot'},String(i+1)),h('span',{cls:'cd-pl'},n)));
      if(i<names.length-1) items.push(h('div',{cls:'cd-pipe-line'+(i<cur?' cd-done':'')}));
    });
    return h('div',{cls:'cd-pipe','aria-label':'Progress'},...items);
  }
  function render(){renderInner();localize(panel);}
  function renderInner(){
    panel.innerHTML='';
    const card=h('div',{cls:'cd-card-s cd-flowcard'});
    panel.append(card);
    card.append(pipeline());
    // Q1 sport: collapses to one line once chosen
    if(S.sport&&S.open!=='sport'){
      card.append(collapsed('1','Sport',T(SPORTS[S.sport].n)+' · '+SPORTS[S.sport].L+' × '+SPORTS[S.sport].W+' m'));
    } else {
      card.append(h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'1'),'Sport'),tiles(Object.keys(SPORTS),S.sport,v=>{S.sport=v;S.open='category';render();build();frame(SPORTS[v]);},k=>({title:SPORTS[k].n}))));
    }
    if(!S.sport){build();return;}
    // Q2 category: collapses to one line once chosen
    if(S.cat&&S.open!=='category'){
      card.append(collapsed('2','Category',T(CATS[S.cat])+' · '+T(CAT_TEXT[S.cat])));
    } else {
      card.append(h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'2'),'Category'),tiles(Object.keys(CATS),S.cat,v=>{S.cat=v;S.open=null;render();build();frame(SPORTS[S.sport]);},k=>({title:CATS[k]})),h('div',{cls:'cd-courts'},'Number of courts',h('input',{type:'number',min:1,max:20,value:S.courts,onchange:e=>{S.courts=Math.max(1,Math.min(20,+e.target.value||1));build();}}))));
    }
    if(!S.cat){build();return;}
    // Step 3 parts
    const partsSec=h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'3'),'Parts'));
    card.append(partsSec);
    const part=(key,label,body)=>{
      const blk=h('div',{cls:'cd-part'});
      const cb=h('input',{type:'checkbox',checked:S.parts[key],onchange:e=>{S.parts[key]=e.target.checked;render();build();}});
      blk.append(h('label',{cls:'cd-ck'},cb,label));
      if(S.parts[key]&&body)blk.append(h('div',{cls:'cd-sub'},body()));
      partsSec.append(blk);
    };
    part('fab','Fabrication (frame, walls, roof)',()=>{
      const out=[];
      if(S.cat==='indoor'){
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.louvers,onchange:e=>{S.fab.louvers=e.target.checked;build();}}),' Louvres'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.roof,onchange:e=>{S.fab.roof=e.target.checked;build();}}),' Roofing sheets (top and sides)'));
      } else if(S.cat==='semi'){
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.roof,onchange:e=>{S.fab.roof=e.target.checked;build();}}),' Roof'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.louvers,onchange:e=>{S.fab.louvers=e.target.checked;build();}}),' Louvre screens to 3 m'));
      } else {
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.side,onchange:e=>{S.fab.side=e.target.checked;build();}}),' Side netting'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.top,onchange:e=>{S.fab.top=e.target.checked;build();}}),' Top netting'));
      }
      return out;
    });
    part('floor','Flooring',()=>{
      // basketball flooring rules
      let availFloors=PLAY_FLOORS;
      if(S.sport==='basketball'){
        if(S.cat==='outdoor') availFloors=['Acrylic Flooring'];
        else availFloors=['Wooden Flooring'];
        if(!availFloors.includes(S.floor.play)){S.floor.play=availFloors[0];}
      }
      const autoNpa=npaFor(S.floor.play);
      const alwaysNpa=NPA_ALWAYS.has(S.floor.play)||(S.sport==='basketball'&&S.cat!=='outdoor');
      if(alwaysNpa) S.floor.nonplayOn=true;
      const rows:any[]=[
        h('h4',{},'Play area'),
        h('select',{cls:'cd-sel',onchange:e=>{S.floor.play=e.target.value;if(!npaFor(e.target.value))S.floor.nonplayOn=false;render();build();}},...availFloors.map(f=>h('option',{value:f,selected:S.floor.play===f},f))),
      ];
      if(autoNpa){
        if(!alwaysNpa){
          rows.push(h('label',{cls:'cd-row',style:'margin-top:10px'},h('input',{type:'checkbox',checked:S.floor.nonplayOn,onchange:e=>{S.floor.nonplayOn=e.target.checked;render();build();}}),' Include non-play area'));
        }
        if(S.floor.nonplayOn) rows.push(h('div',{cls:'cd-npa-badge'},h('span',{cls:'cd-npa-label'},'Non-play area'),h('span',{cls:'cd-npa-val'},autoNpa)));
      }
      return rows;
    });
    part('light','Lighting',()=>{
      if(S.cat==='outdoor')return [h('h4',{},'Per light post'),choice(Object.keys(LIGHT_OUT),S.light.type,v=>{S.light.type=v;render();build();})];
      if(S.light.type&&!LIGHT_IND[S.light.type])S.light.type=Object.keys(LIGHT_IND)[0];
      return [h('h4',{},'Per court'),choice(Object.keys(LIGHT_IND),S.light.type,v=>{S.light.type=v;render();build();})];
    });
    const accSec=h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'3'),'Accessories'),h('div',{cls:'cd-accs'},...ACC.map(a=>h('label',{cls:'cd-acc'+(S.accs[a]?' cd-on':'')},h('input',{type:'checkbox',checked:!!S.accs[a],onchange:e=>{S.accs[a]=e.target.checked;render();build();}}),a))));
    card.append(accSec);
    build();
  }
  render();
  localize(root);
  
  // ---------- camera and loop ----------
  function size(){const w=host.clientWidth,hh=host.clientHeight;renderer.setSize(w,hh);camera.aspect=w/hh;camera.updateProjectionMatrix();}
  const onResize=()=>size();addEventListener('resize',onResize);size();const ro=new ResizeObserver(()=>size());ro.observe(host);
  function setView(v){S.view=v;$('vBird').classList.toggle('cd-on',v==='bird');$('vInside').classList.toggle('cd-on',v==='inside');if(S.sport){frame(SPORTS[S.sport]);summary(SPORTS[S.sport]);}}
  $('vBird').onclick=()=>setView('bird');
  $('vInside').onclick=()=>setView('inside');
  $('reset').onclick=()=>{if(S.sport)frame(SPORTS[S.sport]);};
  $('startFresh').onclick=()=>{S.sport=null;S.cat=null;S.open='sport';S.courts=1;S.parts={fab:false,floor:false,light:false,acc:true};S.accs={};S.floor={play:'PVC Synthetic Mat',nonplay:'-None-',nonplayOn:true};setView('bird');render();build();};
  setView('bird');
  $('snap').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='my-court.png';a.href=renderer.domElement.toDataURL('image/png');a.click();};
  frame(SPORTS.badminton);
  // keep the camera inside the hall when looking from inside
  function clampInside(){
    if(S.view!=='inside'||S.cat!=='indoor'||!curSp)return;
    const runoff=3.5, hw=curSp.W/2+runoff-0.35, hl=curSp.L/2+runoff-0.35;
    const p=camera.position;
    p.x=Math.max(-hw,Math.min(hw,p.x));p.z=Math.max(-hl,Math.min(hl,p.z));p.y=Math.max(0.8,Math.min(7.4,p.y));
    const t=controls.target;
    t.x=Math.max(-hw,Math.min(hw,t.x));t.z=Math.max(-hl,Math.min(hl,t.z));t.y=Math.max(0.2,Math.min(7.4,t.y));
  }
  let raf=0;(function loop(){controls.update();clampInside();renderer.render(scene,camera);raf=requestAnimationFrame(loop);})();
  
  const sumToggle=$('sumToggle');
  if(sumToggle){sumToggle.onclick=(e)=>{e.stopPropagation();$('sumBody').classList.toggle('cd-hidden');sumToggle.classList.toggle('cd-active');};}
  const themeObs = new MutationObserver(() => build())
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const dispose = () => {
    hero3dOff()
    ro.disconnect()
    cancelAnimationFrame(raf)
    themeObs.disconnect()
    removeEventListener('resize', onResize)
    controls.dispose()
    renderer.dispose()
    root.innerHTML = ''
  }
  return { dispose, relocalize: () => { localize(root); render() } }
}

export function CourtDesignerPage() {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const tRef = useRef(t)
  tRef.current = t
  const handle = useRef<{ dispose: () => void; relocalize: () => void } | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const h = mountCourtDesigner(ref.current, (s) => tRef.current(s))
    handle.current = h
    return () => { handle.current = null; h.dispose() }
  }, [])
  // the dictionary loads after the language is picked, so this string changes once the translations are ready
  const sig = t('Choose your sport')
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    handle.current?.relocalize()
  }, [sig])
  return (
    <div className="cd-page-wrap">
      <div className="cd-mobile-gate">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="12" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="3"/>
          <rect x="22" y="52" width="20" height="4" rx="2" fill="currentColor" opacity=".4"/>
          <line x1="4" y1="44" x2="60" y2="44" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
        <h2>{t('Desktop only')}</h2>
        <p>{t('Craft Your Court works best on a larger screen. Open it on your laptop or desktop to design your court in 3D.')}</p>
        <a href="/contact">{t('Talk to our team instead →')}</a>
      </div>
      <div className="cd-page" ref={ref} />
    </div>
  )
}
