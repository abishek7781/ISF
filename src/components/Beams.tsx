import { useEffect, useRef } from 'react'

type Props={className?:string;color?:string;backgroundColor?:string;beamWidth?:number;rotation?:number;speed?:number;glow?:number;opacity?:number;lightMode?:boolean}
const rgb=(v:string)=>{const h=v.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
export default function Beams({className='',color='#7FA5E6',backgroundColor='#0E2447',beamWidth=140,rotation=30,speed=1,glow=.6,opacity=1,lightMode=false}:Props){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{const c=ref.current;if(!c)return;const x=c.getContext('2d')!;let id=0,w=0,h=0,mx=.5,my=.5;const col=rgb(color)
 const size=()=>{const d=Math.min(devicePixelRatio||1,1.6),r=c.getBoundingClientRect();w=r.width;h=r.height;c.width=w*d;c.height=h*d;x.setTransform(d,0,0,d,0,0)}
 const move=(e:PointerEvent)=>{const r=c.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height};const ro=new ResizeObserver(size);ro.observe(c);size();c.parentElement?.addEventListener('pointermove',move)
 const draw=(n:number)=>{const t=n*.00035*speed;x.clearRect(0,0,w,h);x.fillStyle=backgroundColor;x.fillRect(0,0,w,h);x.save();x.translate(w/2+(mx-.5)*22,h/2+(my-.5)*14);x.rotate((rotation+(mx-.5)*5)*Math.PI/180);x.translate(-w/2,-h/2);const diagonal=Math.hypot(w,h),count=Math.ceil(diagonal/beamWidth)+4
 for(let i=-2;i<count;i++){const drift=Math.sin(t*2.4+i*.42)*beamWidth*.7;const px=i*beamWidth+drift+(mx-.5)*90;const phase=Math.sin(t*3+i*.9+my*3);const g=x.createLinearGradient(px-beamWidth*.55,0,px+beamWidth*.55,0);g.addColorStop(0,'transparent');g.addColorStop(.32,`rgba(0,0,0,${lightMode?.04:.22})`);g.addColorStop(.5,`rgba(${col.join(',')},${(lightMode?.18:.34)+phase*.07})`);g.addColorStop(.57,`rgba(255,255,255,${(lightMode?.12:.25)*glow})`);g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(px-beamWidth,-diagonal,beamWidth*2,diagonal*3)}x.restore();const light=x.createRadialGradient(mx*w,my*h,0,mx*w,my*h,Math.max(w,h)*.38);light.addColorStop(0,`rgba(${col.join(',')},${lightMode?.11:.18})`);light.addColorStop(1,'transparent');x.fillStyle=light;x.fillRect(0,0,w,h);id=requestAnimationFrame(draw)}
 id=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(id);ro.disconnect();c.parentElement?.removeEventListener('pointermove',move)}},[color,backgroundColor,beamWidth,rotation,speed,glow,lightMode])
 return <canvas ref={ref} className={`beams-canvas ${className}`} style={{opacity}} aria-hidden="true"/>
}
