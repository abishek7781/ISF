import { INDIA_PATH } from '../data/indiaPath'
import { useEffect, useRef } from 'react'
import { Reveal } from './ui'
import { useI18n } from '../i18n'

const K = 10
const CS = Math.cos((22 * Math.PI) / 180)
const project = (lon: number, lat: number): [number, number] => [(lon - 68) * K * CS, (36.5 - lat) * K]

/** Places on the map. Add more (longitude, latitude) here as project locations are confirmed.
 *  dx / dy place the name tag around its pin, as a share of the tag's own size. */
const SITES: { name: string; lon: number; lat: number; dx: number; dy: number }[] = [
  { name: 'Chennai', lon: 80.27, lat: 13.08, dx: 6, dy: 30 },
  { name: 'Bengaluru', lon: 77.59, lat: 12.97, dx: -112, dy: 30 },
  { name: 'Telangana', lon: 78.49, lat: 17.38, dx: -112, dy: -150 },
  { name: 'Andhra Pradesh', lon: 80.65, lat: 16.51, dx: -30, dy: -160 },
  { name: 'Kolkata', lon: 88.36, lat: 22.57, dx: -50, dy: -150 },
  { name: 'Andaman', lon: 92.74, lat: 11.62, dx: -50, dy: -150 },
]

/** "Where we have built": India's outline on a faint dot grid, with glowing pins and white name tags. */
export default function IndiaMap() {
  const { t } = useI18n()
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  // The dot grid is drawn on a canvas. It stays still until the mouse moves over it; then the dots near the cursor
  // light up and grow, and settle again when the mouse leaves.
  useEffect(() => {
    const c = cv.current, box = wrap.current
    if (!c || !box) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const S = 18, R = 150
    const st = { mx: 0, my: 0, on: false, k: 0, raf: 0, w: 0, h: 0, dpr: 1 }
    const dark = () => document.documentElement.dataset.theme === 'dark'
    const draw = () => {
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0)
      ctx.clearRect(0, 0, st.w, st.h)
      const rgb = dark() ? '255,255,255' : '14,36,71'
      const base = dark() ? 0.16 : 0.2
      for (let y = S / 2; y < st.h; y += S) {
        for (let x = S / 2; x < st.w; x += S) {
          let lit = 0
          if (st.k > 0.01) {
            const d = Math.hypot(x - st.mx, y - st.my)
            if (d < R) lit = (1 - d / R) ** 2 * st.k
          }
          ctx.fillStyle = `rgba(${rgb},${Math.min(1, base + lit * 0.8)})`
          ctx.beginPath()
          ctx.arc(x, y, 1.3 + lit * 1.7, 0, 6.2832)
          ctx.fill()
        }
      }
    }
    const tick = () => {
      st.k += ((st.on ? 1 : 0) - st.k) * 0.14
      draw()
      st.raf = st.k > 0.01 || st.on ? requestAnimationFrame(tick) : 0
      if (!st.raf) { st.k = 0; draw() }
    }
    const kick = () => { if (!st.raf) st.raf = requestAnimationFrame(tick) }
    const size = () => {
      st.dpr = Math.min(window.devicePixelRatio || 1, 2)
      st.w = c.clientWidth; st.h = c.clientHeight
      c.width = Math.round(st.w * st.dpr); c.height = Math.round(st.h * st.dpr)
      draw()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = c.getBoundingClientRect()
      st.mx = e.clientX - r.left; st.my = e.clientY - r.top; st.on = true; kick()
    }
    const leave = () => { st.on = false; kick() }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(c)
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) { box.addEventListener('pointermove', move); box.addEventListener('pointerleave', leave) }
    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(st.raf); box.removeEventListener('pointermove', move); box.removeEventListener('pointerleave', leave) }
  }, [])
  return (
    <Reveal className="imap2">
     <div className="imap2-in" ref={wrap}>
      <div className="imap2-dots" aria-hidden="true"><canvas ref={cv} /></div>
      <div className="imap2-box">
        <svg className="imap2-svg" viewBox="-6 -4 290 312" role="img" aria-label={t('Map of India with our project locations')}>
          <path className="imap2-land" d={INDIA_PATH} />
          {SITES.map((s) => {
            const [x, y] = project(s.lon, s.lat)
            return (
              <g key={s.name}>
                <circle className="imap2-ring" cx={x} cy={y} r="2" />
                <circle className="imap2-pin" cx={x} cy={y} r="3.2" />
              </g>
            )
          })}
        </svg>
        {SITES.map((s) => {
          const [x, y] = project(s.lon, s.lat)
          return (
            <span key={s.name} className="imap2-tag" style={{ left: `${((x + 6) / 290) * 100}%`, top: `${((y + 4) / 312) * 100}%`, transform: `translate(${s.dx}%, ${s.dy}%)` }}>
              {t(s.name)}
            </span>
          )
        })}
      </div>
     </div>
    </Reveal>
  )
}
