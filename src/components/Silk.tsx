import { useEffect, useRef } from 'react'

type SilkProps = {
  className?: string; color?: string; sheenColor?: string; speed?: number; scale?: number;
  rotation?: number; sheen?: number; depth?: number; glow?: number; noiseIntensity?: number;
  ripple?: number; wave?: number; lightMode?: boolean; opacity?: number;
}

const hex = (v: string) => {
  const h = v.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export default function Silk({ className = '', color = '#0E2447', sheenColor = '#78E83B', speed = 1.2, scale = 1,
  rotation = -.18, sheen = .55, depth = .7, glow = .32, noiseIntensity = .12, ripple = 1, wave = 1,
  lightMode = false, opacity = 1 }: SilkProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0, w = 0, h = 0, mx = .7, my = .35, tx = mx, ty = my, pulse = 0
    const base = hex(color), hi = hex(sheenColor)
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.6), r = canvas.getBoundingClientRect()
      w = r.width; h = r.height; canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const move = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); tx = (e.clientX-r.left)/r.width; ty=(e.clientY-r.top)/r.height }
    const click = () => { pulse = 1 }
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize()
    canvas.parentElement?.addEventListener('pointermove', move); canvas.parentElement?.addEventListener('pointerdown', click)
    const draw = (now: number) => {
      const t = now * .00018 * speed; mx += (tx-mx)*.025; my += (ty-my)*.025; pulse *= .965
      ctx.clearRect(0,0,w,h); ctx.fillStyle=`rgb(${base.join(',')})`; ctx.fillRect(0,0,w,h)
      ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(rotation); ctx.translate(-w/2,-h/2)
      const count = Math.max(6, Math.round(8 * scale)), spacing = h / (count - 1)
      for(let i=-2;i<count+2;i++){
        const y0=i*spacing + Math.sin(t*2+i*.9)*spacing*.35 + (my-.5)*24
        const path=()=>{ctx.beginPath();for(let x=-w*.15;x<=w*1.15;x+=18){
          const y=y0 + Math.sin(x*.006*ripple+i*.85+t*3)*spacing*.42*wave + Math.sin(x*.013-t*2+i)*spacing*.14
          x===-w*.15?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }}
        path();ctx.strokeStyle=`rgba(0,0,0,${depth*(lightMode?.09:.28)})`;ctx.lineWidth=spacing*1.05;ctx.lineCap='round';ctx.filter=`blur(${spacing*.24}px)`;ctx.stroke()
        path();ctx.strokeStyle=`rgba(${hi.join(',')},${(.24+sheen*.52)*(lightMode?.55:1)})`;ctx.lineWidth=spacing*.46;ctx.filter=`blur(${spacing*.12}px)`;ctx.stroke()
        path();ctx.strokeStyle=`rgba(255,255,255,${sheen*(lightMode?.28:.42)})`;ctx.lineWidth=Math.max(2,spacing*.095);ctx.filter=`blur(${spacing*.035}px)`;ctx.stroke()
      }
      ctx.filter='none'
      ctx.restore()
      const g=ctx.createRadialGradient(mx*w,my*h,0,mx*w,my*h,Math.max(w,h)*.58)
      g.addColorStop(0,`rgba(${hi.join(',')},${glow*(.35+pulse*.35)})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)
      if(noiseIntensity){ctx.globalAlpha=noiseIntensity*.08;for(let i=0;i<180;i++){ctx.fillStyle=i%3?'#fff':'#000';ctx.fillRect(Math.random()*w,Math.random()*h,1,1)}ctx.globalAlpha=1}
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);ro.disconnect();canvas.parentElement?.removeEventListener('pointermove',move);canvas.parentElement?.removeEventListener('pointerdown',click)}
  },[color,sheenColor,speed,scale,rotation,sheen,depth,glow,noiseIntensity,ripple,wave,lightMode])
  return <canvas ref={ref} className={`silk-canvas ${className}`} style={{opacity}} aria-hidden="true" />
}
