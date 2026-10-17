import { INDIA_PATH } from '../data/indiaPath'
import { STATS } from '../data/content'
import { Counter, Reveal } from './ui'
import { useI18n } from '../i18n'

const K = 10
const CS = Math.cos((22 * Math.PI) / 180)
const project = (lon: number, lat: number): [number, number] => [(lon - 68) * K * CS, (36.5 - lat) * K]

/** Places on the map. Add more (longitude, latitude) here as project locations are confirmed. */
const SITES: { name: string; lon: number; lat: number }[] = [
  { name: 'Chennai', lon: 80.27, lat: 13.08 },
  { name: 'Andaman', lon: 92.74, lat: 11.62 },
]

/** "Where we have built": India's outline with glowing pins, and glass stat cards floating over it. */
export default function IndiaMap() {
  const { t } = useI18n()
  return (
    <Reveal className="imap" >
      <div className="imap-glow" aria-hidden="true" />
      <svg className="imap-svg" viewBox="-6 -4 290 312" role="img" aria-label={t('Map of India with our project locations')}>
        <path className="imap-land" d={INDIA_PATH} />
        {SITES.map((s) => {
          const [x, y] = project(s.lon, s.lat)
          return (
            <g key={s.name}>
              <circle className="imap-ring" cx={x} cy={y} r="2" />
              <circle className="imap-pin" cx={x} cy={y} r="3.2" />
              <text className="imap-lab" x={x + 7} y={y + 3}>{t(s.name)}</text>
            </g>
          )
        })}
      </svg>
      <div className="imap-card c1"><b><Counter to={STATS[0].value} suffix="+" /></b><span>{t('Projects completed')}</span></div>
      <div className="imap-card c2"><b><Counter to={STATS[1].value} suffix="+" /></b><span>{t('Courts built')}</span></div>
      <div className="imap-card c3"><b><Counter to={STATS[2].value} /></b><span>{t('Countries')}</span></div>
    </Reveal>
  )
}
