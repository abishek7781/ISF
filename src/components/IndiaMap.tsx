import { INDIA_PATH } from '../data/indiaPath'
import { useEffect, useRef, useState } from 'react'
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
  const dots = useRef<HTMLDivElement>(null)
  const [glows, setGlows] = useState<{ x: number; y: number; d: number; dl: number }[]>([])
  // A few of the grid dots light up now and then, each on its own random rhythm.
  useEffect(() => {
    const el = dots.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const make = () => {
      const w = el.clientWidth, h = el.clientHeight
      const cols = Math.floor(w / 18), rows = Math.floor(h / 18)
      const count = Math.min(70, Math.round((cols * rows) / 45))
      const out: { x: number; y: number; d: number; dl: number }[] = []
      const seen = new Set<string>()
      while (out.length < count && seen.size < cols * rows) {
        const c = Math.floor(Math.random() * cols), r = Math.floor(Math.random() * rows)
        const k = `${c}:${r}`
        if (seen.has(k)) continue
        seen.add(k)
        // keep to the part of the grid that is visible (the grid fades out toward the edges)
        const nx = (c * 18 + 9) / w - 0.5, ny = (r * 18 + 9) / h - 0.45
        if ((nx / 0.6) ** 2 + (ny / 0.7) ** 2 > 0.9) continue
        out.push({ x: c * 18 + 9, y: r * 18 + 9, d: 2.6 + Math.random() * 3.6, dl: -Math.random() * 6 })
      }
      setGlows(out)
    }
    make()
    const ro = new ResizeObserver(make)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <Reveal className="imap2">
      <div className="imap2-dots" aria-hidden="true" ref={dots}>
        {glows.map((g, i) => <i key={i} style={{ left: g.x, top: g.y, animationDuration: `${g.d.toFixed(2)}s`, animationDelay: `${g.dl.toFixed(2)}s` }} />)}
      </div>
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
    </Reveal>
  )
}
