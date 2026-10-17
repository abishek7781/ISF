import { useRef } from 'react'
import { INDIA_PATH } from '../data/indiaPath'
import { STATS } from '../data/content'
import { Counter, Reveal } from './ui'
import { useI18n } from '../i18n'

const K = 10
const CS = Math.cos((22 * Math.PI) / 180)
const project = (lon: number, lat: number): [number, number] => [(lon - 68) * K * CS, (36.5 - lat) * K]

/** Places on the map. Add more (longitude, latitude) here as project locations are confirmed. */
const SITES: { name: string; lon: number; lat: number; left?: boolean }[] = [
  { name: 'Chennai', lon: 80.27, lat: 13.08 },
  { name: 'Bengaluru', lon: 77.59, lat: 12.97, left: true },
  { name: 'Telangana', lon: 78.49, lat: 17.38, left: true },
  { name: 'Andhra Pradesh', lon: 80.65, lat: 16.51 },
  { name: 'Kolkata', lon: 88.36, lat: 22.57 },
  { name: 'Andaman', lon: 92.74, lat: 11.62 },
]

/** "Where we have built": India's outline with glowing pins, and glass stat cards floating over it. */
export default function IndiaMap() {
  const { t } = useI18n()
  const card = useRef<HTMLDivElement>(null)
  // On a desktop mouse the card leans toward the cursor; touch screens and reduced-motion visitors get a still card.
  const lean = (e: React.PointerEvent) => {
    const el = card.current
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
  }
  const level = () => { card.current?.style.removeProperty('--ry'); card.current?.style.removeProperty('--rx') }
  return (
    <Reveal className="imap-persp">
     <div className="imap" ref={card} onPointerMove={lean} onPointerLeave={level}>
      <div className="imap-bgl" aria-hidden="true"><div className="imap-glow" /></div>
      <svg className="imap-svg" viewBox="-6 -4 290 312" role="img" aria-label={t('Map of India with our project locations')}>
        <path className="imap-land" d={INDIA_PATH} />
        {SITES.map((s) => {
          const [x, y] = project(s.lon, s.lat)
          return (
            <g key={s.name}>
              <circle className="imap-ring" cx={x} cy={y} r="2" />
              <circle className="imap-pin" cx={x} cy={y} r="3.2" />
              <text className="imap-lab" x={s.left ? x - 7 : x + 7} y={y + 3} textAnchor={s.left ? 'end' : 'start'}>{t(s.name)}</text>
            </g>
          )
        })}
      </svg>
      <div className="imap-card c1"><b><Counter to={STATS[0].value} suffix="+" /></b><span>{t('Projects completed')}</span></div>
      <div className="imap-card c2"><b><Counter to={STATS[1].value} suffix="+" /></b><span>{t('Courts built')}</span></div>
      <div className="imap-card c3"><b><Counter to={STATS[2].value} /></b><span>{t('Countries')}</span></div>
     </div>
    </Reveal>
  )
}
