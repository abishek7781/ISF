import { useEffect, useRef } from 'react'

const W = 232
const H = 62
const LEVEL = 30                       // water surface, from the top of the letters
const WAVE = `M-120 0${' q11.5 -5 23 0 t23 0'.repeat(16)} V200 H-120 Z`

type Sensor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * "INFRA" drawn as letters half filled with water. On a phone the water behaves like it does in a half full bottle:
 * its surface stays level while the phone tilts, and it sloshes (overshoots and settles) when the phone is shaken.
 */
export default function FooterWater() {
  const svg = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const el = svg.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let target = 0, ang = 0, vel = 0, visible = false, raf = 0, last = 0, listening = false
    const idle = () => Math.sin(performance.now() / 1100) * 2.2
    let tilted = false

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      tilted = true
      // the surface stays level, so relative to the letters it turns the opposite way to the phone
      target = Math.max(-42, Math.min(42, -e.gamma))
    }
    let prev = { x: 0, y: 0, z: 0 }
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x == null || a.y == null || a.z == null) return
      const d = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z)
      prev = { x: a.x, y: a.y, z: a.z }
      if (d > 14) vel += Math.sign(a.x - 0.0001) * Math.min(d, 60) * -4   // a shake kicks the water sideways
    }
    const listen = () => {
      if (listening) return
      listening = true
      window.addEventListener('deviceorientation', onOrient)
      window.addEventListener('devicemotion', onMotion)
    }
    const Sensor = window.DeviceOrientationEvent as Sensor | undefined
    const needsPermission = typeof Sensor?.requestPermission === 'function'
    if (!needsPermission) listen()
    // iPhones only share motion after a tap and a yes from the visitor
    const ask = () => { Sensor?.requestPermission?.().then((r) => { if (r === 'granted') listen() }).catch(() => undefined) }
    const foot = el.closest('.foot-m')
    if (needsPermission) foot?.addEventListener('pointerup', ask, { once: true })

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016)
      last = t
      const goal = tilted ? target : idle()
      vel += (-70 * (ang - goal) - 4.2 * vel) * dt     // spring with little damping: overshoots, then settles
      ang += vel * dt
      el.style.setProperty('--a', ang.toFixed(2) + 'deg')
      if (visible) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) { last = performance.now(); raf = requestAnimationFrame(frame) }
    })
    io.observe(el)
    return () => {
      io.disconnect(); cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('devicemotion', onMotion)
      foot?.removeEventListener('pointerup', ask)
    }
  }, [])
  return (
    <svg ref={svg} className="fw" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="INFRA">
      <defs>
        <clipPath id="fw-clip"><text x="0" y="52" textLength={W} lengthAdjust="spacingAndGlyphs">INFRA</text></clipPath>
        <linearGradient id="fw-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7AD680" stopOpacity=".95" />
          <stop offset="1" stopColor="#3564AE" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <g clipPath="url(#fw-clip)">
        <g className="fw-tilt">
          <g transform={`translate(0 ${LEVEL})`}>
            <path className="fw-wave" d={WAVE} fill="url(#fw-water)" />
          </g>
        </g>
      </g>
      <text className="fw-line" x="0" y="52" textLength={W} lengthAdjust="spacingAndGlyphs" fill="none">INFRA</text>
    </svg>
  )
}
