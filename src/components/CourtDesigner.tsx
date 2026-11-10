// @ts-nocheck: direct port of the approved preview script (untyped 3D code). Typing is a follow-up.
// Court designer page. The 3D code and the step logic were ported from the approved preview.
// Layout and colours follow the site theme (data-theme on the html element).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useEffect, useRef } from 'react'
import { A } from '../data/content'
import './court-designer.css'

const MARKUP = `<section class="cd-hx" aria-label="Court designer introduction">
  <div class="cd-hx-grid"></div>
  <div class="cd-hx-in">
    <div class="cd-hx-copy">
      <span class="cd-hx-tag"><i></i>Court designer · Chennai</span>
      <h1>Design it <em>before</em> you build it.</h1>
      <p>Choose the sport, the setting and the parts. See your court from above or from inside, then request a quote built from the same choices.</p>
      <div class="cd-hx-actions"><a class="cd-hx-cta" href="#designer">Start designing</a><a class="cd-hx-alt" href="/contact">Talk to our team</a></div>
      <ol class="cd-hx-steps">
        <li><b>01</b><span>Sport</span></li><li><b>02</b><span>Setting</span></li><li><b>03</b><span>Parts</span></li>
      </ol>
    </div>
    <figure class="cd-hx-fig"><svg class="hx-iso" viewBox="120 120 360 250" role="img" aria-label="Isometric badminton court with its dimensions">
<g class="hx-grid" transform="translate(-120 -120)"><line x1="0" y1="0" x2="500" y2="0"/><line x1="0" y1="20" x2="500" y2="20"/><line x1="0" y1="40" x2="500" y2="40"/><line x1="0" y1="60" x2="500" y2="60"/><line x1="0" y1="80" x2="500" y2="80"/><line x1="0" y1="100" x2="500" y2="100"/><line x1="0" y1="120" x2="500" y2="120"/><line x1="0" y1="140" x2="500" y2="140"/><line x1="0" y1="160" x2="500" y2="160"/><line x1="0" y1="180" x2="500" y2="180"/><line x1="0" y1="200" x2="500" y2="200"/><line x1="0" y1="220" x2="500" y2="220"/><line x1="0" y1="240" x2="500" y2="240"/><line x1="0" y1="260" x2="500" y2="260"/><line x1="0" y1="280" x2="500" y2="280"/><line x1="0" y1="300" x2="500" y2="300"/><line x1="0" y1="320" x2="500" y2="320"/><line x1="0" y1="340" x2="500" y2="340"/><line x1="0" y1="360" x2="500" y2="360"/></g>
<polygon class="hx-floor" points="250.0,150.0 447.3,263.9 357.5,315.8 160.2,201.8"/><polygon class="hx-line" fill="none" points="250.0,150.0 447.3,263.9 357.5,315.8 160.2,201.8"/><polygon class="hx-line" fill="none" points="243.2,153.9 440.5,267.8 364.2,311.8 167.0,197.9"/><line class="hx-line" x1="337.5" y1="200.5" x2="247.6" y2="252.3"/><line class="hx-line" x1="359.8" y1="213.4" x2="270.0" y2="265.3"/><line class="hx-line" x1="312.7" y1="194.0" x2="236.5" y2="238.1"/><line class="hx-line" x1="371.0" y1="227.7" x2="294.8" y2="271.7"/><line class="hx-line" x1="348.6" y1="206.9" x2="258.8" y2="258.8"/><line class="hx-net" x1="354.5" y1="203.5" x2="252.9" y2="262.2"/><line class="hx-net-top" x1="354.5" y1="165.5" x2="252.9" y2="224.2"/><line class="hx-post" x1="354.5" y1="203.5" x2="354.5" y2="163.5"/><line class="hx-post" x1="252.9" y1="262.2" x2="252.9" y2="222.2"/>
<line class="hx-dim" x1="146.9" y1="209.5" x2="344.2" y2="323.4"/><text class="hx-dimt" x="245.55" y="284.45" text-anchor="middle">13.40 m</text><line class="hx-dim" x1="460.5" y1="271.6" x2="370.7" y2="323.4"/><text class="hx-dimt" x="421.6" y="311.5" text-anchor="middle">6.10 m</text>
<circle class="hx-pulse" cx="303.7" cy="232.9" r="6"/><circle class="hx-dotc" cx="303.7" cy="232.9" r="3"/>
</svg><figcaption><span>Live sample</span> Badminton · indoor · 1 court</figcaption></figure>
  </div>
  <div class="cd-hx-facts">
    <div><strong>700+</strong><span>Badminton courts built</span></div>
    <div><strong>BWF</strong><span>Approved systems</span></div>
    <div><strong>10 ft</strong><span>Pole spacing for netting</span></div>
    <div><strong>2 views</strong><span>Bird and inside court</span></div>
  </div>
</section>
<section id="designer"></section>
<div class="cd-wrap"><div class="cd-sec-h"><div><div class="cd-eyebrow" style="color:var(--green)">Step by step</div><h2>Your court</h2><p>Answer the questions on the left. Your court, its netting and its lights appear on the right.</p></div><div class="cd-seg"><button id="vBird" class="cd-on">Bird view</button><button id="vInside">Inside court view</button></div></div>
<aside class="cd-panel" id="panel"></aside>
<section class="cd-stage"><div id="c"></div><div class="cd-toolbar"><span></span><div style="display:flex;gap:8px"><button class="cd-iconbtn" id="reset">Reset view</button><button class="cd-iconbtn" id="snap">Download image</button></div></div><div class="cd-sum" id="sum"></div></section></div>
`

function mountCourtDesigner(root: HTMLElement): () => void {
  root.innerHTML = MARKUP
  const $ = (id: string): any => root.querySelector('#' + id)
  
  
  
  
  // ---------- data ----------
  const SPORTS={
   badminton:{n:'Badminton',L:13.4,W:6.1,net:'net',netH:1.55},
   pickleball:{n:'Pickleball',L:13.41,W:6.1,net:'net',netH:0.91},
   volleyball:{n:'Volleyball',L:18,W:9,net:'net',netH:2.43},
   tennis:{n:'Tennis',L:23.77,W:10.97,net:'net',netH:0.91},
   basketball:{n:'Basketball',L:28,W:15,net:'hoop'},
   futsal:{n:'Futsal',L:40,W:20,net:'goal'},
   turf:{n:'Turf football (5-a-side)',L:40,W:20,net:'goal'},
   cricket:{n:'Cricket nets',L:20,W:3.05,net:null}
  };
  const CATS={indoor:'Indoor',outdoor:'Outdoor',semi:'Semi-indoor'};
  // flooring lists copied from the client's system (play area and non-play area)
  const PLAY_FLOORS=['Rubber with PVC Synthetic Mat','PVC Synthetic Mat','Wooden with PVC Synthetic Mat','Wooden Flooring','Interlocking Tiles with PVC Synthetic Mat'];
  const NONPLAY_FLOORS=['-None-','Acrylic Flooring','Interlocking Tile','Vinyl with Rubber','Wood with Mat'];
  const PLAY_COLOR={'Rubber with PVC Synthetic Mat':'#2E7D41','PVC Synthetic Mat':'#2E7D41','Wooden with PVC Synthetic Mat':'#B58A57','Wooden Flooring':'#B58A57','Interlocking Tiles with PVC Synthetic Mat':'#2B5FA8'};
  const NONPLAY_COLOR={'-None-':'#B9BDC4','Acrylic Flooring':'#3E9A4A','Interlocking Tile':'#2B5FA8','Vinyl with Rubber':'#7A4A3A','Wood with Mat':'#B58A57'};
  const LIGHT_OUT={'100 W':100,'150 W':150,'200 W':200};   // per light post, one post every 10 ft
  const LIGHT_IND={'Basic (1500 W per court)':1500,'Advanced (2000 W per court)':2000};
  const ACC=['Scoreboard','Player benches','Court numbers','Umpire chair','Seating (spectator)','Water station'];
  
  const S={sport:null,cat:null,courts:1,view:'bird',
   parts:{fab:false,floor:false,light:false,acc:false},
   fab:{louvers:true,roof:true,walls:'Closed',side:true,top:true},
   floor:{play:'PVC Synthetic Mat',nonplay:'-None-',nonplayOn:false},
   light:{type:'100 W'},
   accs:{}};
  
  // ---------- 3D ----------
  const host=$('c');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,1,0.1,500);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.49;controls.minDistance=4;controls.maxDistance=110;
  scene.add(new THREE.HemisphereLight('#ffffff','#7a8594',1.0));
  const sun=new THREE.DirectionalLight('#ffffff',0.7);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,far:150});scene.add(sun);
  const G=Object.fromEntries(['ground','court','shell','roof','lights','net','enc','acc','city'].map(k=>{const g=new THREE.Group();scene.add(g);return [k,g];}));
  const postMat=new THREE.MeshStandardMaterial({color:'#2A3140',metalness:0.5,roughness:0.4});
  const steelMat=new THREE.MeshStandardMaterial({color:'#9AA3AE',metalness:0.6,roughness:0.4});
  const louverMat=new THREE.MeshStandardMaterial({color:'#C9D0DA',metalness:0.4,roughness:0.5});
  const roofSheetMat=new THREE.MeshStandardMaterial({color:'#8E97A3',metalness:0.35,roughness:0.55,side:THREE.DoubleSide,transparent:true,opacity:1,depthWrite:false});
  const wallMat=new THREE.MeshStandardMaterial({color:'#D5DAE1',roughness:0.85});
  const ledMat=new THREE.MeshStandardMaterial({color:'#FFFFFF',emissive:'#F4F9FF',emissiveIntensity:1.6});
  const floorMat=new THREE.MeshStandardMaterial({roughness:0.6});
  const nonPlayMat=new THREE.MeshStandardMaterial({roughness:0.8});
  const tex=document.createElement('canvas');const floorTex=new THREE.CanvasTexture(tex);floorTex.colorSpace=THREE.SRGBColorSpace;floorTex.anisotropy=8;
  floorMat.map=floorTex;
  const courtLight=new THREE.PointLight('#fff8e8',0,120,1.1);scene.add(courtLight);
  const add=(g,geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
  const FT=0.3048;
  
  function drawPlay(sp,colour){
    const k=60,pad=3*k,W=sp.W*k,L=sp.L*k;
    tex.width=W+pad*2;tex.height=L+pad*2;const g=tex.getContext('2d');
    const P=(x,z)=>[pad+(x+sp.W/2)*k,pad+(z+sp.L/2)*k];
    const rect=(x1,z1,x2,z2)=>{const a=P(x1,z1),b=P(x2,z2);g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);};
    const line=(a,b)=>{const p=P(...a),q=P(...b);g.beginPath();g.moveTo(...p);g.lineTo(...q);g.stroke();};
    g.fillStyle=colour;g.fillRect(0,0,tex.width,tex.height);
    g.strokeStyle='#FFFFFF';g.lineWidth=Math.max(3,k*0.05);
    const hw=sp.W/2,hl=sp.L/2;
    if(sp.id==='badminton'||sp.id==='pickleball'){rect(-hw,-hl,hw,hl);rect(-2.59,-hl,2.59,hl);line([-hw,-5.94],[hw,-5.94]);line([-hw,5.94],[hw,5.94]);line([-2.59,-1.98],[2.59,-1.98]);line([-2.59,1.98],[2.59,1.98]);line([0,-hl],[0,-1.98]);line([0,1.98],[0,hl]);}
    else if(sp.id==='tennis'){rect(-hw,-hl,hw,hl);rect(-4.115,-hl,4.115,hl);line([-4.115,-6.4],[4.115,-6.4]);line([-4.115,6.4],[4.115,6.4]);line([0,-6.4],[0,6.4]);}
    else if(sp.id==='volleyball'){rect(-hw,-hl,hw,hl);line([-hw,-3],[hw,-3]);line([-hw,3],[hw,3]);}
    else if(sp.id==='basketball'){rect(-hw,-hl,hw,hl);line([-hw,0],[hw,0]);}
    else {rect(-hw,-hl,hw,hl);line([-hw,0],[hw,0]);}
    floorTex.needsUpdate=true;
  }
  function gridTex(color,op){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.strokeStyle=color;g.lineWidth=5;for(let x=0;x<=256;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();}for(let y=0;y<=256;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
  
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

  function build(){
    Object.values(G).forEach(g=>{while(g.children.length){const c=g.children.pop();c.geometry&&c.geometry.dispose();}});
    if(!S.sport||!S.cat){scene.background=new THREE.Color(document.documentElement.dataset.theme==='dark'?'#0E1A2E':'#E9EEF6');summary();return;}
    const sp={...SPORTS[S.sport],id:S.sport};
    curSp=sp;
    curEnc=null;
    const indoor=S.cat==='indoor', semi=S.cat==='semi';
    const runoff=indoor?3.5:6;
    const RW=sp.W+runoff*2,RL=sp.L+runoff*2;
    // play area and non-play area flooring
    const playCol=PLAY_COLOR[S.floor.play]||'#2E7D41';
    drawPlay(sp,playCol);
    const playMat=floorMat;
    add(G.court,new THREE.PlaneGeometry(sp.W+6,sp.L+6),playMat,0,0.005,0,-Math.PI/2);
    // non-play area (surround) if ticked
    const npCol=S.parts.floor&&S.floor.nonplayOn?(NONPLAY_COLOR[S.floor.nonplay]||'#B9BDC4'):(indoor?'#B9BDC4':'#6DAA5B');
    add(G.ground,new THREE.PlaneGeometry(RW,RL),new THREE.MeshStandardMaterial({color:npCol,roughness:0.9}),0,-0.01,0,-Math.PI/2);
    if(!S.parts.floor||!S.floor.nonplayOn){/* default surround */}
    if(!indoor) add(G.ground,new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:'#6DAA5B',roughness:1}),0,-0.02,0,-Math.PI/2);
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
          const grid=gridTex('#2B3A4E');grid.repeat.set(1,1);
          const sm=new THREE.MeshBasicMaterial({map:grid,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false});
          const wall=(ax,az,bx,bz)=>{const len=Math.hypot(bx-ax,bz-az);const g=new THREE.PlaneGeometry(len,PH);const m=new THREE.Mesh(g,sm.clone());m.material.map=grid.clone();m.material.map.repeat.set(len/0.8,PH/0.8);m.material.map.needsUpdate=true;m.position.set((ax+bx)/2,PH/2,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);G.net.add(m);};
          wall(-fx,-fz,fx,-fz);wall(fx,-fz,fx,fz);wall(fx,fz,-fx,fz);wall(-fx,fz,-fx,-fz);
        }
        if(S.fab.top){
          const grid=gridTex('#2B3A4E');grid.repeat.set((fx*2)/0.8,(fz*2)/0.8);
          const tm=new THREE.Mesh(new THREE.PlaneGeometry(fx*2,fz*2),new THREE.MeshBasicMaterial({map:grid,transparent:true,opacity:0.4,side:THREE.DoubleSide,depthWrite:false}));
          tm.rotation.x=-Math.PI/2;tm.position.y=PH;G.net.add(tm);
        }
        // numbers for the summary
        curEnc={poles:uniq.length,pole:PH,sideArea:(S.fab.side?2*(fx*2)+2*(fz*2):0)*PH,topArea:S.fab.top?(fx*2)*(fz*2):0,perimeter:4*(fx+fz)};
      }
    }
    // lighting
    if(S.parts.light){
      if(indoor||semi){
        const W=LIGHT_IND[S.light.type]||1500;const count=Math.max(1,S.courts);
        const H=8;const per=Math.min(count,6);
        for(let i=0;i<per;i++){add(G.lights,new THREE.BoxGeometry(0.12,0.12,Math.min(5.2,sp.L)),ledMat,(i-(per-1)/2)*(sp.W+1),H-0.6,0);}
        courtLight.position.set(0,H-1,0);courtLight.intensity=60;
      } else {
        // one light post every 10 ft (3.05 m) along the perimeter
        const wattage=LIGHT_OUT[S.light.type]||100;
        const x=sp.W/2+4, z=sp.L/2+4;
        const pts=[];
        for(let t=-z;t<=z;t+=10*FT){pts.push([-x,t]);pts.push([x,t]);}
        for(let t=-x;t<=x;t+=10*FT){pts.push([t,-z]);pts.push([t,z]);}
        const seen=new Set();
        pts.forEach(([px,pz])=>{const key=px.toFixed(2)+','+pz.toFixed(2);if(seen.has(key))return;seen.add(key);add(G.lights,new THREE.CylinderGeometry(0.12,0.16,8,12),postMat,px,4,pz);add(G.lights,new THREE.BoxGeometry(0.8,0.3,0.4),new THREE.MeshStandardMaterial({color:'#D8DDE5',emissive:'#FFF6DA',emissiveIntensity:1.2}),px,8.1,pz);});
        courtLight.position.set(0,12,0);courtLight.intensity=wattage/3;
      }
    } else { courtLight.intensity=0; }
    if(!indoor&&!semi) buildCity(sp);
    // play-area court net
    if(sp.net==='net'){[-(sp.W/2+0.9),sp.W/2+0.9].forEach(x=>add(G.net,new THREE.CylinderGeometry(0.05,0.05,sp.netH+0.15,12),postMat,x,(sp.netH+0.15)/2,0));
      const net=new THREE.Mesh(new THREE.PlaneGeometry(sp.W+1.8,sp.netH),new THREE.MeshBasicMaterial({map:gridTex('#EEF1F5'),transparent:true,side:THREE.DoubleSide,alphaTest:0.05}));net.position.set(0,sp.netH/2+0.1,0);G.net.add(net);}
    else if(sp.net==='goal'){[-1,1].forEach(s=>add(G.net,new THREE.BoxGeometry(7.32,2.44,0.1),new THREE.MeshStandardMaterial({color:'#FFFFFF'}),0,1.22,s*(sp.L/2)));}
    // accessories
    if(S.parts.acc){
      if(S.accs['Scoreboard']&&indoor){const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.2,0.12),new THREE.MeshStandardMaterial({color:'#0C0F14'}));b.position.set(0,3.2,-(RL/2)+0.4);G.acc.add(b);}
      if(S.accs['Player benches']){[-sp.W/2-1.2,sp.W/2+1.2].forEach(x=>add(G.acc,new THREE.BoxGeometry(0.5,0.45,3),new THREE.MeshStandardMaterial({color:'#2F5C94'}),x,0.25,-sp.L/4));}
      if(S.accs['Umpire chair']&&sp.net==='net'){add(G.acc,new THREE.BoxGeometry(0.6,1.6,0.6),new THREE.MeshStandardMaterial({color:'#2F7F35'}),-sp.W/2-2,0.8,0);}
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
      // bird view: from above, slightly angled so the sides read as 3D
      const d=Math.max(sp.L,sp.W)*(S.cat==='outdoor'?2.7:1.5);
      camera.position.set(0,d*1.05,d*0.35);
      controls.target.set(0,0,0);
      controls.minDistance=4;controls.maxDistance=110;
    }
    camera.updateProjectionMatrix();
    G.roof.visible=S.view!=='inside';
    roofSheetMat.opacity=S.view==='bird'?0.28:1;
  }
  
  function courtCount(){return S.courts;}
  
  // ---------- summary ----------
  function summary(sp){
    const L=[];
    if(S.sport)L.push(`<div><b>Sport:</b> ${SPORTS[S.sport].n}</div>`);
    if(S.cat)L.push(`<div><b>Category:</b> ${CATS[S.cat]}</div>`);
    L.push(`<div><b>View:</b> ${S.view==='inside'?'Inside court':'Bird view'}</div>`);
    if(S.cat)L.push(`<div><b>Courts:</b> ${S.courts}</div>`);
    if(S.parts.fab){const f=[];if(S.cat==='indoor'){f.push('closed walls');if(S.fab.louvers)f.push('louvers');if(S.fab.roof)f.push('roofing sheets top and sides');}else if(S.cat==='semi'){f.push('open-sided frame');if(S.fab.roof)f.push('roof');if(S.fab.louvers)f.push('louvre screens');}else{if(S.fab.side)f.push('side netting');if(S.fab.top)f.push('top netting');f.push('poles');}L.push(`<div><b>Fabrication:</b> ${f.join(', ')}</div>`);if(S.cat==='indoor'&&S.fab.louvers)L.push(`<div><b>Louvres:</b> 5 ft band on all four walls</div>`);if(S.cat==='outdoor'&&curEnc){const ft=x=>Math.round(x*3.2808);L.push(`<div><b>Poles:</b> ${curEnc.poles} × 20 ft (6.1 m)</div><div><b>Perimeter:</b> ${ft(curEnc.perimeter)} ft</div>`);L.push(`<div><b>Side net:</b> ${Math.round(curEnc.sideArea*10.764)} sq ft</div><div><b>Top net:</b> ${Math.round(curEnc.topArea*10.764)} sq ft</div>`);}}
    if(S.parts.floor){L.push(`<div><b>Play area flooring:</b> ${S.floor.play}</div>`);if(S.floor.nonplayOn)L.push(`<div><b>Non-play area flooring:</b> ${S.floor.nonplay}</div>`);}
    if(S.parts.light&&S.cat){
      if(S.cat==='outdoor'&&sp){const pl=Math.round(((sp.W+8)+(sp.L+8))*2/(10*FT));L.push(`<div><b>Lighting:</b> ${S.light.type} per post, about ${pl} posts (one every 10 ft)</div>`);}
      else{const w=LIGHT_IND[S.light.type]||1500;L.push(`<div><b>Lighting:</b> ${S.light.type} · ${w*S.courts} W total for ${S.courts} court(s)</div>`);}
    }
    if(S.parts.acc){const a=Object.keys(S.accs).filter(k=>S.accs[k]);L.push(`<div><b>Accessories:</b> ${a.length?a.join(', '):'None'}</div>`);}
    $('sum').innerHTML=(L.length?L.join(''):'<div>Start with your sport on the left.</div>')+'<div class="cd-fine">Stylised preview. Dimensions and wattages are indicative; confirm before quoting.</div>';
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
  function tiles(list,current,onpick,meta){
    return h('div',{cls:'cd-tiles'},...list.map(k=>{
      const m=meta(k);
      return h('button',{cls:'cd-tile'+(current===k?' cd-on':''),on:()=>onpick(k),'aria-pressed':current===k?'true':'false'},
        h('span',{cls:'cd-tile-ic',html:m.icon}),
        h('span',{cls:'cd-tile-t'},m.title),
        h('span',{cls:'cd-tile-s'},m.sub));
    }));
  }
  function choice(list,current,onpick,labelFn=x=>x){return h('div',{cls:'cd-opts'},...list.map(x=>h('button',{cls:'cd-opt'+(current===x?' cd-on':''),on:()=>onpick(x)},labelFn(x))));}
  function pipeline(){
    const cur=!S.sport?0:!S.cat?1:2;
    const names=['Sport','Category','Parts'];
    return h('div',{cls:'cd-pipe','aria-label':'Progress'},...names.map((n,i)=>h('div',{cls:'cd-pn'+(i<cur?' cd-done':'')+(i===cur?' cd-now':'')},h('span',{cls:'cd-dot'},String(i+1)),h('span',{cls:'cd-pl'},n))));
  }
  function render(){
    panel.innerHTML='';
    const card=h('div',{cls:'cd-card-s cd-flowcard'});
    panel.append(card);
    card.append(pipeline());
    // Q1 sport
    card.append(h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'1'),'Sport'),h('div',{cls:'cd-q'},'Which sport?'),tiles(Object.keys(SPORTS),S.sport,v=>{S.sport=v;render();build();frame(SPORTS[v]);},k=>({icon:SPORT_ICON(SPORTS[k].L/SPORTS[k].W),title:SPORTS[k].n,sub:SPORTS[k].L+' × '+SPORTS[k].W+' m'}))));
    if(!S.sport){build();return;}
    // Q2 category
    card.append(h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'2'),'Category'),h('div',{cls:'cd-q'},'Where will it be built?'),tiles(Object.keys(CATS),S.cat,v=>{S.cat=v;render();build();frame(SPORTS[S.sport]);},k=>({icon:CAT_ICON[k],title:CATS[k],sub:CAT_TEXT[k]})),h('div',{cls:'cd-courts'},'Number of courts',h('input',{type:'number',min:1,max:20,value:S.courts,onchange:e=>{S.courts=Math.max(1,Math.min(20,+e.target.value||1));build();}}))));
    if(!S.cat){build();return;}
    // Step 3 parts
    const partsSec=h('div',{cls:'cd-sec'},h('div',{cls:'cd-step'},h('b',{},'3'),'Parts'),h('div',{cls:'cd-q'},'What do you want to include?'));
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
        out.push(h('h4',{},'Closed hall'),h('div',{cls:'cd-note'},'Indoor halls are closed with roofing sheets on the top and the sides, with louvres for air flow.'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.louvers,onchange:e=>{S.fab.louvers=e.target.checked;build();}}),' Louvres'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.roof,onchange:e=>{S.fab.roof=e.target.checked;build();}}),' Roofing sheets (top and sides)'));
      } else if(S.cat==='semi'){
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.roof,onchange:e=>{S.fab.roof=e.target.checked;build();}}),' Roof'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.louvers,onchange:e=>{S.fab.louvers=e.target.checked;build();}}),' Louvre screens to 3 m'));
      } else {
        out.push(h('h4',{},'Outdoor cage'),h('div',{cls:'cd-note'},'Net on poles every 10 ft, 20 ft high, with a 10 ft clearance around the court.'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.side,onchange:e=>{S.fab.side=e.target.checked;build();}}),' Side netting'));
        out.push(h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:S.fab.top,onchange:e=>{S.fab.top=e.target.checked;build();}}),' Top netting'));
      }
      return out;
    });
    part('floor','Flooring',()=>{
      return [
        h('h4',{},'Play area'),
        h('select',{cls:'cd-sel',onchange:e=>{S.floor.play=e.target.value;build();}},...PLAY_FLOORS.map(f=>h('option',{value:f,selected:S.floor.play===f},f))),
        h('label',{cls:'cd-row',style:'margin-top:12px'},h('input',{type:'checkbox',checked:S.floor.nonplayOn,onchange:e=>{S.floor.nonplayOn=e.target.checked;render();build();}}),' Include non-play area flooring'),
        ...(S.floor.nonplayOn?[h('h4',{},'Non-play area'),h('select',{cls:'cd-sel',onchange:e=>{S.floor.nonplay=e.target.value;build();}},...NONPLAY_FLOORS.map(f=>h('option',{value:f,selected:S.floor.nonplay===f},f)))]:[])
      ];
    });
    part('light','Lighting',()=>{
      if(S.cat==='outdoor')return [h('h4',{},'Per light post'),choice(Object.keys(LIGHT_OUT),S.light.type,v=>{S.light.type=v;render();build();}),h('div',{cls:'cd-note'},'One light post every 10 ft around the court.')];
      if(S.light.type&&!LIGHT_IND[S.light.type])S.light.type=Object.keys(LIGHT_IND)[0];
      return [h('h4',{},'Per court'),choice(Object.keys(LIGHT_IND),S.light.type,v=>{S.light.type=v;render();build();})];
    });
    part('acc','Accessories',()=>ACC.map(a=>h('label',{cls:'cd-row'},h('input',{type:'checkbox',checked:!!S.accs[a],onchange:e=>{S.accs[a]=e.target.checked;build();}}),' '+a)));
    panel.append(h('div',{cls:'cd-cta'},h('div',{},h('b',{},'Happy with the design?'),h('span',{},'We will turn these choices into a quote.')),h('a',{cls:'cd-pill',href:'/contact'},'Request a quote')));
    build();
  }
  render();
  
  // ---------- camera and loop ----------
  function size(){const w=host.clientWidth,hh=host.clientHeight;renderer.setSize(w,hh);camera.aspect=w/hh;camera.updateProjectionMatrix();}
  const onResize=()=>size();addEventListener('resize',onResize);size();
  function setView(v){S.view=v;$('vBird').classList.toggle('cd-on',v==='bird');$('vInside').classList.toggle('cd-on',v==='inside');if(S.sport){frame(SPORTS[S.sport]);summary(SPORTS[S.sport]);}}
  $('vBird').onclick=()=>setView('bird');
  $('vInside').onclick=()=>setView('inside');
  $('reset').onclick=()=>{if(S.sport)frame(SPORTS[S.sport]);};
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
  
  $('sum').onclick = () => $('sum').classList.toggle('cd-open')
  const themeObs = new MutationObserver(() => build())
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => {
    cancelAnimationFrame(raf)
    themeObs.disconnect()
    removeEventListener('resize', onResize)
    controls.dispose()
    renderer.dispose()
    root.innerHTML = ''
  }
}

export function CourtDesignerPage() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    return mountCourtDesigner(ref.current)
  }, [])
  return (
    <div className="cd-page" ref={ref} />
  )
}
