import { INDIA_PATH } from '../data/indiaPath'
import { STATS } from '../data/content'
import { Counter, Reveal } from './ui'
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

/** "Where we have built": India's outline on a faint dot grid, glowing pins with white name tags, and the totals underneath. */
export default function IndiaMap() {
  const { t } = useI18n()
  return (
    <Reveal className="imap2">
      <div className="imap2-dots" aria-hidden="true" />
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
      <dl className="imap2-stats">
        <div><dt><Counter to={STATS[0].value} suffix="+" /></dt><dd>{t('Projects completed')}</dd></div>
        <div><dt><Counter to={STATS[1].value} suffix="+" /></dt><dd>{t('Courts built')}</dd></div>
        <div><dt><Counter to={STATS[2].value} /></dt><dd>{t('Countries')}</dd></div>
      </dl>
    </Reveal>
  )
}
