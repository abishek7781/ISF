import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUp, ArrowUpRight, ChevronDown, BadgeCheck, FileCheck, FlaskConical, ShieldCheck, Check, ChevronLeft, ChevronRight, ChevronsRight, Mail, MapPin, MessageCircle, Phone, Play, Plus, Send, User, Trophy, Clock, X } from 'lucide-react'
import {
  A, CAPABILITIES, CERTS, CONTACT, FAQS, GALLERY, NAV, ZOHO, PORTFOLIO, TESTIMONIALS, VIDEOS,
} from '../data/content'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { postLead } from '../lib/zoho'
import { getConsent } from './CookieBanner'
import { Facebook, Instagram, Linkedin, Youtube } from './Brand'
import CallDatePicker, { iso } from './CallDatePicker'
import { Counter, Reveal } from './ui'

export function Head({ num, label, title, aside }: { num?: string; label: string; title: string; aside?: string }) {
  const { t } = useI18n()
  return (
    <Reveal className="head">
      <div className="head-label">{num && <span>{num}</span>}{t(label)}</div>
      <div className="head-main">
        <h2>{t(title)}</h2>
        {aside && <p>{t(aside)}</p>}
      </div>
    </Reveal>
  )
}

const ABOUT_FACTS: [number, string, string][] = [[2017, '', 'Founded in Chennai'], [700, '+', 'Badminton courts built'], [10000, '+', 'Players on ISF floors'], [2, '', 'Offices, India and China']]
const PRINCIPLES = [
  ['Absorb shock', 'A professional player spends 15 hours a week on court. The floor has to protect knees and joints through every jump and lunge.'],
  ['Hold grip', 'An anti-slip surface lets players change direction with confidence, rally after rally.'],
  ['Stay consistent', 'Built to take intense daily use and play the same way for years, with easy maintenance.'],
]

const JOURNEY_PATH = 'M0 290 C140 290 200 140 330 150 C470 162 470 272 600 250 C720 230 760 90 860 110 C930 124 960 76 1000 54'
const JOURNEY: { t: number; kind: 'start' | 'photo' | 'node'; up?: boolean; img?: string; icon?: 'medal' | 'flag' | 'globe'; label?: string; title?: string; note?: string }[] = [
  { t: 0.05, kind: 'start', label: '2017', title: 'Founded in Chennai', note: 'A workshop making solid wooden sports floors.' },
  { t: 0.2, kind: 'photo', img: 'badminton4.jpg' },
  { t: 0.33, kind: 'photo', img: 'squash.webp' },
  { t: 0.45, kind: 'photo', img: 'tennis.webp' },
  { t: 0.62, kind: 'node', icon: 'medal', title: 'Olympic standards', note: 'Built on technical insights from Paris Olympic facilities.' },
  { t: 0.77, kind: 'node', icon: 'flag', up: true, title: 'National level', note: 'Courts for academies, leagues and national-level players.' },
  { t: 0.95, kind: 'node', icon: 'globe', title: 'International level', note: 'Projects delivered in China, the USA and Thailand.' },
]

function RingsLogo() {
  const r = [['#0081C8', 22, 22], ['#000', 50, 22], ['#EE334E', 78, 22], ['#FCB131', 36, 36], ['#00A651', 64, 36]] as const
  return (
    <svg viewBox="0 0 100 58" aria-hidden="true">
      {r.map(([c, x, y]) => <circle key={c} cx={x} cy={y} r="12" fill="none" stroke={c} strokeWidth="3.6" />)}
    </svg>
  )
}

function GlobeImage() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="gl-o" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#6fc3ff" /><stop offset=".6" stopColor="#1e6fd0" /><stop offset="1" stopColor="#0a3a86" /></radialGradient>
        <radialGradient id="gl-h" cx=".3" cy=".25" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <clipPath id="gl-c"><circle cx="50" cy="50" r="46" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#gl-o)" />
      <g clipPath="url(#gl-c)" fill="#43b05c">
        <path d="M10 28C18 22 28 24 30 32C32 40 26 46 28 54C30 62 24 68 18 64C12 58 8 40 10 28Z" />
        <path d="M44 22C48 17 58 18 62 23C60 28 52 31 44 29Z" />
        <path d="M44 38C50 35 58 38 60 45C62 54 58 64 54 72C50 80 44 77 42 68C40 59 38 46 44 38Z" />
        <path d="M62 24C70 19 84 22 90 31C92 40 84 44 76 42C74 50 70 58 66 52C66 47 64 44 62 39C60 33 59 28 62 24Z" />
        <path d="M74 56C80 54 86 58 84 64C80 68 74 64 74 56Z" />
      </g>
      <g clipPath="url(#gl-c)" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth=".8">
        <ellipse cx="50" cy="50" rx="46" ry="16" /><ellipse cx="50" cy="50" rx="18" ry="46" /><path d="M4 50H96M50 4V96" />
      </g>
      <circle cx="50" cy="50" r="46" fill="url(#gl-h)" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" />
    </svg>
  )
}

function Journey() {
  const { t } = useI18n()
  const path = useRef<SVGPathElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[] | null>(null)
  const [ribbon, setRibbon] = useState({ main: '', echo: '' })
  const [seen, setSeen] = useState(false)
  useLayoutEffect(() => {
    const el = path.current
    if (!el) return
    const len = el.getTotalLength()
    setPts(JOURNEY.map((j) => { const p = el.getPointAtLength(len * j.t); return { x: p.x / 10, y: (p.y / 340) * 100 } }))
    const N = 140
    const P = Array.from({ length: N + 1 }, (_, i) => el.getPointAtLength((len * i) / N))
    const build = (maxW: number, off: number) => {
      const top: string[] = []
      const bot: string[] = []
      P.forEach((p, i) => {
        const a = P[Math.max(0, i - 1)]
        const b = P[Math.min(N, i + 1)]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const l = Math.hypot(dx, dy) || 1
        const nx = -dy / l
        const ny = dx / l
        const w = maxW * Math.pow(Math.sin(Math.PI * (i / N)), 0.85) + 0.6
        top.push(`${(p.x + nx * (w + off)).toFixed(1)} ${(p.y + ny * (w + off)).toFixed(1)}`)
        bot.push(`${(p.x - nx * (w - off)).toFixed(1)} ${(p.y - ny * (w - off)).toFixed(1)}`)
      })
      return `M${top.join('L')}L${bot.reverse().join('L')}Z`
    }
    setRibbon({ main: build(10.5, 0), echo: build(3, 19) })
  }, [])
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const icon = (k?: string) => k === 'medal' ? <RingsLogo /> : k === 'globe' ? <GlobeImage /> : <img src={A('flags/in.svg')} alt="" />
  return (
    <section id="story" className="ab-story">
      <div className="container">
        <div className="st3">
          <Reveal className="st3-c">
            <span className="st3-num" aria-hidden="true">2017</span>
            <div className="st3-in">
              <span className="st3-rule" aria-hidden="true" />
              <h3>{t('Where we started')}</h3>
              <p>{t('India Sports Floorings began in 2017 manufacturing solid wooden sports flooring and importing badminton court mats for Chennai, then expanded across South India and into a wider range of flooring products.')}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="st3-c st3-now">
            <span className="st3-num" aria-hidden="true">{t('Today')}</span>
            <div className="st3-in">
              <span className="st3-rule" aria-hidden="true" />
              <h3>{t('What we build today')}</h3>
              <p>{t('Our ISF Sports Floor system of prefinished solid wood is now the core of the business, alongside subfloor systems, BWF-approved synthetic courts and turnkey construction customised to local climate.')}</p>
            </div>
          </Reveal>
        </div>
        <div className={`jp-stage ${seen ? 'in' : ''}`} ref={stage}>
          <svg className="jp-svg" viewBox="0 0 1000 340" aria-hidden="true">
            <defs>
              <linearGradient id="jp-g" x1="0" x2="1"><stop offset="0" stopColor="#9aa7bf" /><stop offset=".5" stopColor="#7AD680" /><stop offset="1" stopColor="#3564AE" /></linearGradient>
              <clipPath id="jp-clip"><rect className="jp-reveal" x="0" y="-40" height="420" /></clipPath>
              <filter id="jp-glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path ref={path} d={JOURNEY_PATH} className="jp-base" />
            <g clipPath="url(#jp-clip)">
              <path d={ribbon.echo} className="jp-echo" />
              <path d={ribbon.main} className="jp-ribbon" filter="url(#jp-glow)" />
              <path d={JOURNEY_PATH} className="jp-road" />
            </g>
            
          </svg>
          {pts && JOURNEY.map((j, i) => (
            <div key={i} className={`jp-item ${j.kind} ${j.up ? 'up' : ''} ${i === JOURNEY.length - 1 ? 'last' : ''} ${i === 0 ? 'first' : ''}`} style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%`, ['--i' as string]: i }}>
              {j.kind === 'photo' && <span className="jp-photo"><img src={A(j.img!)} alt="" loading="lazy" /></span>}
              {j.kind === 'start' && <span className="jp-badge start">{j.label}</span>}
              {j.kind === 'node' && <span className={`jp-badge ${j.icon === 'flag' ? '' : 'logo'}`}>{icon(j.icon)}</span>}
              {j.kind !== 'photo' && <span className="jp-cap"><strong>{t(j.title!)}</strong><small>{t(j.note!)}</small></span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function About() {
  const { t } = useI18n()
  const wrap = useRef<HTMLDivElement>(null)
  return (
    <div className="about-dark" ref={wrap}>
      <section id="about" className="ab-hero ab2">
        <svg className="ab2-rings" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none">
            {[110, 190, 270, 350, 430].map((r, i) => <circle key={r} cx="740" cy="400" r={r} pathLength="1" style={{ ['--d' as string]: `${i * 0.35}s` }} />)}
            <line x1="740" y1="-40" x2="740" y2="840" pathLength="1" style={{ ['--d' as string]: '1.6s' }} />
            <line x1="200" y1="400" x2="1280" y2="400" pathLength="1" style={{ ['--d' as string]: '1.9s' }} />
          </g>
        </svg>
        <span className="ab2-year" aria-hidden="true">2017</span>
        <div className="container ab-hero-grid">
          <Reveal>
            <span className="ab2-kicker"><i /> {t('About India Sports Floorings')}</span>
            <h2 className="ab-title">{t('Building the floors India plays on,')} <em>{t('since 2017.')}</em></h2>
            <p className="ab-lead">{t('From one workshop in Chennai making solid wooden sports floors to a team that builds complete venues for more than a dozen sports.')}</p>
            <div className="ab2-cta">
              <Link to="/contact" className="ab2-b1"><span>{t('Talk to our team')}</span><i><ArrowRight size={17} /></i></Link>
              <a className="ab2-b2" href="#story" onClick={(e) => { e.preventDefault(); document.querySelector('.ab-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}><span>{t('Where we started')}</span><i><ChevronDown size={16} /></i></a>
            </div>
          </Reveal>
          <div className="ab2-logo" aria-hidden="true">
            <img className="ab2-m" src={A('logo-m.svg')} alt="" />
            <span className="ab2-shadow" />
          </div>
        </div>
      </section>

      <section className="ab-facts">
        <div className="container">
          <dl className="ab-fact-row">
            {ABOUT_FACTS.map(([v, suf, l], i) => (
              <Reveal key={l} delay={i * 0.08} className="ab-fact"><dt>{v === 2017 ? v : <Counter to={v} suffix={suf} />}</dt><dd>{t(l)}</dd></Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Journey />

      <section className="ab-founder">
        <div className="container founder-grid">
          <Reveal className="founder-photo">
            <div className="fp" role="img" aria-label={t('Manendra, founder of India Sports Floorings')}>
              <div className="fp-print fp-back" aria-hidden="true"><img src={A('founder.webp')} alt="" loading="lazy" /></div>
              <div className="fp-print fp-front">
                <img src={A('founder.webp')} alt="" loading="lazy" />
                <span className="fp-sign">Manendra</span>
              </div>
              <span className="fp-tape" aria-hidden="true" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="founder-text">
            <span className="ab-kicker">{t('The founder')}</span>
            <h2 className="founder-name">Manendra</h2>
            <p className="founder-role">{t('Founder, India Sports Floorings')}</p>
            <blockquote className="founder-quote">{t('A vision to build, not to follow.')}</blockquote>
            <p>{t('From a humble background and without a big name behind him, Manendra started India Sports Floorings in Chennai in 2017. He failed, learned and kept building, until the company was delivering BWF-certified badminton courts made in India.')}</p>
            <p>{t('Today he leads the team that has built more than 700 courts, with the same belief he started with: players deserve floors that protect them.')}</p>
          </Reveal>
        </div>
      </section>

      <section className="ab-principles">
        <div className="container">
          <Reveal><h2 className="ab-h2">{t('Three things every floor we build must do.')}</h2></Reveal>
          <ol className="ab-list">
            {PRINCIPLES.map(([title, d], i) => (
              <Reveal key={title} delay={i * 0.06} className="ab-item">
                <span className="ab-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t(title)}</h3>
                <p>{t(d)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="ab-vision">
        <div className="container">
          <Reveal>
            <span className="ab-kicker">{t('Our vision')}</span>
            <blockquote>{t('To give every player ')}<em>{t('the best playing experience')}</em>{t(', on floors and arenas scientifically designed to minimise injury.')}</blockquote>
            <Link to="/contact" className="vis-btn"><span className="vis-t">{t('Talk to our team')}</span><span className="vis-a"><ArrowRight size={18} /></span></Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

const LANES: { img: string; label: string; desc: string; to: string; pos?: string }[] = [
  { img: 'badminton4.jpg', label: 'Badminton', desc: 'BWF-approved sprung maple floor for competition and training halls.', to: 'flooring' },
  { img: 'products/pickleball.webp', label: 'Pickleball', desc: 'Court surfaces and markings made for pickleball play.', to: 'flooring', pos: '80% 100%' },
  { img: 'tt2.webp', label: 'Floodlights', desc: 'LED lighting installed, wired and commissioned on site.', to: 'lighting' },
  { img: 'products/basketball.webp', label: 'Basketball', desc: 'Shock-absorbing flooring for indoor and outdoor basketball.', to: 'flooring', pos: '78% 50%' },
]

export function Products() {
  const { t } = useI18n()
  const [act, setAct] = useState<number | null>(null)
  const pgRef = useRef<HTMLElement>(null)
  // phones: when a product row scrolls into view, nudge it left and back to show it can be swiped
  useEffect(() => {
    if (!window.matchMedia('(max-width: 680px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const grids = pgRef.current?.querySelectorAll<HTMLElement>('.pg-grid')
    if (!grids?.length) return
    const timers: number[] = []
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      const g = e.target as HTMLElement
      io.unobserve(g)
      g.classList.add('nudge')
      timers.push(window.setTimeout(() => g.classList.remove('nudge'), 1900))
    }), { threshold: 0.7 })
    grids.forEach((g) => io.observe(g))
    return () => { io.disconnect(); timers.forEach(clearTimeout) }
  }, [])
  const heading = t('Everything a sports venue needs, from the floor up.').split(' ')
  return (
    <>
    <section className="ph2">
      <div className="ph2-in">
        <div className="ph2-copy">
          <span className="ph2-eyebrow"><i /> ISF {t('Product guide')}</span>
          <h2>{heading.map((w, i) => <span key={i} className={heading.length > 1 && i >= heading.length - (heading.length > 4 ? 4 : 1) ? 'out' : ''}>{w} </span>)}</h2>
          <p>{t('Sports flooring, fabrication and lighting, supplied and installed by our own team.')}</p>
          <ul className="ph2-doors">
            {CAPABILITIES.map((c, i) => (
              <li key={c.key}>
                <a href={`#${c.key}`} onClick={(e) => { e.preventDefault(); document.getElementById(c.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{t(c.title)}</strong>
                  <small>{c.items.length} {t('Products')}</small>
                  <ArrowUpRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="ph2-art">
          <span className="ph2-chip"><i /> {t('BWF approved')}</span>
          <div className={`ph2-strips ${act !== null ? 'has' : ''}`} onMouseLeave={() => setAct(null)}>
            {LANES.map((l, i) => (
              <button key={l.label} type="button" className={`sp ${act === i ? 'on' : ''}`} style={{ ['--h' as string]: `${58 + i * 12}%` }} onMouseEnter={() => setAct(i)} onFocus={() => setAct(i)} onBlur={() => setAct(null)} onClick={() => (act === i ? document.getElementById(l.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : setAct(i))} aria-label={t(l.label)}>
                <img src={A(l.img)} alt="" loading={i ? 'lazy' : undefined} style={l.pos ? { objectPosition: l.pos } : undefined} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
    <section id="products" className="pg" ref={pgRef}>
      <div className="container">
        {CAPABILITIES.map((c, i) => (
          <div key={c.key} id={c.key} className="pg-group">
            <div className="pg-head">
              <span className="pg-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t(c.title)}</h3>
              <p>{t(c.text)}</p>
            </div>
            <div className="pg-grid">
              {c.items.map((p) => (
                <Link key={p.name} to="/contact" className="pg-card">
                  <span className="pg-img">{p.image ? <img src={A(p.image)} alt="" loading="lazy" /> : <img className="ph" src={A('logo-mark.png')} alt="" />}</span>
                  <strong>{t(p.name)}</strong>
                  <span className="pg-tx">{p.text ? t(p.text) : null}</span>
                  <em>{t('Learn more')} <ArrowUpRight size={15} /></em>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  )
}

const PLACES = [
  { name: 'Chennai, India', role: 'Head office', flag: 'in', flagName: 'India', note: 'Manikandan Nagar, Kundrathur. Where every ISF project is planned and managed.', origin: true },
  { name: 'Andaman & Nicobar Islands', role: 'Projects', flag: 'in', flagName: 'India', note: 'Sports flooring projects delivered in the Andaman and Nicobar Islands, India.' },
  { name: 'Baoding, China', role: 'Sourcing office', flag: 'cn', flagName: 'China', note: 'Hebei Province. Our office in China.' },
  { name: 'United States', role: 'Projects', flag: 'us', flagName: 'the United States', note: 'Sports flooring projects delivered in the USA.' },
  { name: 'Thailand', role: 'Projects', flag: 'th', flagName: 'Thailand', note: 'Sports flooring projects delivered in Thailand.' },
]

const SPORT_IMG: Record<string, string> = {
  'Badminton courts': 'badminton4.jpg', 'Turf courts': 'tt1.webp', 'Tennis courts': 'tennis.webp',
  'Squash courts': 'squash.webp', 'Skating rinks': 'skating.webp', 'Gym projects': 'hyrox.webp',
}

export function Reach() {
  const { t } = useI18n()
  return (
    <section className="section reach-sec">
        <div className="container">
          <div className="reach-head">
            <h2>{t('Where we have worked.')}</h2>
            <dl className="reach-stats">
              <div><dt>5</dt><dd>{t('Locations')}</dd></div>
              <div><dt>4</dt><dd>{t('Countries')}</dd></div>
              <div><dt>2</dt><dd>{t('Offices')}</dd></div>
            </dl>
          </div>
          <div className="tickets">
            {PLACES.map((pl, i) => (
              <Reveal key={pl.name} delay={(i % 3) * 0.07} className={`ticket ${pl.origin ? 'origin' : ''}`}>
                <div className="ticket-main">
                  <span className="ticket-tag">{t(pl.role)}</span>
                  <img className="flag" src={A(`flags/${pl.flag}.svg`)} alt={`Flag of ${pl.flagName}`} />
                  <h3>{t(pl.name)}</h3>
                  <p>{t(pl.note)}</p>
                </div>
                <div className="ticket-stub">
                  <small>{t(pl.origin ? 'Origin' : 'From')}</small>
                  <strong>MAA</strong>
                  <span>{t('Chennai')}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
  )
}

export function Certifications() {
  const { t } = useI18n()
  const [sel, setSel] = useState<number | null>(null)
  const n = CERTS.length
  const heading = t('Tested and Approved.').split(' ')
  const go = (d: number) => setSel((i) => (i === null ? i : (i + d + n) % n))
  const loop = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = loop.current
    if (!el) return
    let raf = 0
    const mark = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best: HTMLElement | null = null
      let dist = Infinity
      el.querySelectorAll<HTMLElement>('.cert').forEach((c) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
        c.classList.remove('mid')
        if (d < dist) { dist = d; best = c }
      })
      best && (best as HTMLElement).classList.add('mid')
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(mark) }
    mark()
    const mq = window.matchMedia('(max-width: 680px)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let paused = false
    let resume = 0
    const hold = () => { paused = true; clearTimeout(resume) }
    const release = () => { clearTimeout(resume); resume = window.setTimeout(() => { paused = false }, 3500) }
    const tick = window.setInterval(() => {
      if (!mq.matches || reduce || paused || document.hidden) return
      const cards = el.querySelectorAll<HTMLElement>('.cert')
      const half = cards[n].offsetLeft - cards[0].offsetLeft
      const step = cards[1].offsetLeft - cards[0].offsetLeft
      if (el.scrollLeft >= half) {
        el.style.scrollSnapType = 'none'
        el.scrollLeft -= half
        requestAnimationFrame(() => { el.style.scrollSnapType = '' ; el.scrollBy({ left: step, behavior: 'smooth' }) })
      } else el.scrollBy({ left: step, behavior: 'smooth' })
    }, 2600)
    el.addEventListener('touchstart', hold, { passive: true })
    el.addEventListener('touchend', release, { passive: true })
    el.addEventListener('pointerdown', hold)
    el.addEventListener('pointerup', release)
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { clearInterval(tick); clearTimeout(resume); el.removeEventListener('touchstart', hold); el.removeEventListener('touchend', release); el.removeEventListener('pointerdown', hold); el.removeEventListener('pointerup', release); el.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => {
    if (sel === null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSel(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [sel])
  return (
    <section id="certifications" className="section">
      <div className="container">
        <div className="cert-head">
          <span className="cert-kicker"><ShieldCheck size={15} /> {t('Certification')}</span>
          <h2>{heading.map((w, i) => (i === heading.length - 1 ? <em key={i}>{w}</em> : <span key={i}>{w} </span>))}</h2>
          <p>{t('BWF equipment approvals and laboratory reports for shock absorption, vertical deformation and friction. Select a document to view it.')}</p>
          <ul className="cert-badges">
            <li><BadgeCheck size={17} /> {t('BWF approved')}</li>
            <li><FlaskConical size={17} /> {t('Lab tested')}</li>
            <li><FileCheck size={17} /> {n} {t('documents')}</li>
          </ul>
        </div>
      </div>
      <div className="cert-loop" ref={loop}>
        <div className="cert-track">
          {[...CERTS, ...CERTS].map((c, k) => {
            const i = k % CERTS.length
            return (
              <button key={k} className="cert" onClick={() => setSel(i)} aria-hidden={k >= CERTS.length} tabIndex={k >= CERTS.length ? -1 : 0}>
                <span className="cert-paper"><img src={A(c.image)} alt={t(c.title)} loading="lazy" /></span>
                <span className="cert-name">{t(c.title)}</span>
              </button>
            )
          })}
        </div>
      </div>
      {createPortal(<AnimatePresence>
        {sel !== null && (
          <motion.div className="lightbox cert-lb" role="dialog" aria-modal="true" aria-label={t(CERTS[sel].title)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}>
            <button className="lb-close" aria-label="Close" autoFocus><X size={22} /></button>
            <button className="lb-arrow prev" aria-label="Previous document" onClick={(e) => { e.stopPropagation(); go(-1) }}><ChevronLeft size={24} /></button>
            <figure className="cert-fig" onClick={(e) => e.stopPropagation()}>
              <img key={sel} src={A(`large/${CERTS[sel].image}`)} onError={(e) => { e.currentTarget.src = A(CERTS[sel].image) }} alt={t(CERTS[sel].title)} />
              <figcaption>{t(CERTS[sel].title)} <span>{sel + 1} / {n}</span></figcaption>
            </figure>
            <button className="lb-arrow next" aria-label="Next document" onClick={(e) => { e.stopPropagation(); go(1) }}><ChevronRight size={24} /></button>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </section>
  )
}

export function Videos() {
  const { t } = useI18n()
  const [cur, setCur] = useState(0)
  const [playing, setPlaying] = useState(false)
  const v = VIDEOS[cur]
  const next = (cur + 1) % VIDEOS.length
  const pick = (i: number) => { setCur(i); setPlaying(true) }
  return (
    <section id="videos" className="section dark vd">
      <div className="container vd-grid">
        <div className="vd-copy">
          <span className="vd-kicker">{t('Video')}</span>
          <h2>{t('On court with our clients.')}</h2>
          <p>{t('Project walkthroughs and testimonials from academies that play on ISF floors.')}</p>
          <ol className="vd-list">
            {VIDEOS.map((x, i) => (
              <li key={x.id}>
                <button className={i === cur ? 'on' : ''} onClick={() => pick(i)} aria-current={i === cur}>
                  <span className="vd-n">{i + 1}</span>
                  <span><b>{t(x.title)}</b><small>{t(x.by)}</small></span>
                </button>
              </li>
            ))}
          </ol>
          <a className="link light" href={CONTACT.social.YouTube} target="_blank" rel="noreferrer">{t('More on our YouTube channel')} <ArrowUpRight size={16} /></a>
        </div>
        <div className="vd-stage">
          <div className="vd-frame">
            {playing ? (
              <iframe key={v.id} src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            ) : (
              <button onClick={() => setPlaying(true)} aria-label={`Play video: ${v.title}`}>
                <img src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`} alt="" onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }} />
                <span className="play big"><Play size={26} fill="currentColor" /></span>
              </button>
            )}
          </div>
          <button className="vd-next" onClick={() => pick(next)} aria-label={`${t('Up next')}: ${VIDEOS[next].title}`}>
            <img src={`https://i.ytimg.com/vi/${VIDEOS[next].id}/mqdefault.jpg`} alt="" loading="lazy" />
            <span><small>{t('Up next')}</small><b>{t(VIDEOS[next].title)}</b></span>
          </button>
        </div>
      </div>
    </section>
  )
}

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')

export function Testimonials() {
  const { t } = useI18n()
  const n = TESTIMONIALS.length
  const [all, setAll] = useState(false)
  const players = TESTIMONIALS.filter((x) => x.role !== 'Client').length
  const words = t('What players and clients say.').split(' ')
  return (
    <section id="testimonials" className="section tm-sec">
      <div className="container">
        <div className="tm-head">
          <div className="tm-title">
            <span className="tm-kicker"><i /> {t('Testimonials')}</span>
            <h2>{words.map((w, i) => (i >= words.length - 2 ? <em key={i}>{w} </em> : <span key={i}>{w} </span>))}</h2>
            <p>{t('In their own words')}</p>
          </div>
          <div className="tm-sum" aria-label={`${players} ${t('Players')}, ${n - players} ${t('Clients')}`}>
            <div className="tm-avs" aria-hidden="true">
              {TESTIMONIALS.map((x, i) => <span key={x.name} className={x.role === 'Client' ? 'c' : ''} style={{ zIndex: n - i }}>{initials(x.name)}</span>)}
            </div>
            <div className="tm-tot"><strong>{n}</strong><span>{t('Voices')}</span></div>
            <div className="tm-split" aria-hidden="true"><i style={{ flex: players }} /><i className="c" style={{ flex: n - players }} /></div>
            <ul className="tm-key">
              <li><b className="p" />{players} {t('Players')}</li>
              <li><b className="c" />{n - players} {t('Clients')}</li>
            </ul>
          </div>
        </div>
        <div className={`tm-grid ${all ? 'all' : ''}`} role="list">
          {TESTIMONIALS.map((x, i) => (
            <Reveal key={x.name} delay={(i % 3) * 0.06} className="tm-cell">
              <figure className={`tm-card ${i % 2 ? 'alt' : ''}`} role="listitem">
                <span className="tm-mark" aria-hidden="true">&ldquo;</span>
                <blockquote>{t(x.quote)}</blockquote>
                <figcaption className="who"><span className="ini">{initials(x.name)}</span><span><strong>{x.name}</strong><small>{t(x.role)}</small></span></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <button type="button" className="tm-more" onClick={() => setAll(!all)} aria-expanded={all}>
          {all ? t('See less') : t('See more')} <ChevronDown size={16} className={all ? 'up' : ''} />
        </button>
      </div>
    </section>
  )
}

export function Network({ clients, partners }: { clients: string[]; partners: string[] }) {
  const { t } = useI18n()
  const row = (logos: string[], label: string, reverse = false) => (
    <div className="net-row">
      <span className="net-tag">{t(label)}</span>
      <div className="net-mq">
        <div className={`net-track ${reverse ? 'rev' : ''}`}>
          {[...logos, ...logos, ...(logos.length < 12 ? [...logos, ...logos] : [])].map((c, k) => (
            <img key={k} src={A(c)} alt="" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  )
  return (
    <section className="network">
      <div className="container net-top">
        <Reveal>
          <div className="head-label">{t('Clients and partners')}</div>
          <h2>{t('The names behind 700+ courts.')}</h2>
        </Reveal>
        <div className="net-stat"><strong>{clients.length}+</strong><span>{t('Clients featured')}</span></div>
        <div className="net-stat"><strong>{partners.length}</strong><span>{t('Partners')}</span></div>
      </div>
      {row(clients, 'Clients')}
      {row(partners, 'Partners', true)}
    </section>
  )
}

export function FAQ() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(0)
  const [all, setAll] = useState(false)
  const shown = all ? FAQS : FAQS.slice(0, 4)
  return (
    <section id="faq" className="section tint">
      <div className="container faq-grid">
        <div className="faq-side">
          <div className="head-label">{t('FAQ')}</div>
          <h2>{t('Common questions.')}</h2>
          <div className="help">
            <strong>{t('Still have a question?')}</strong>
            <p>{t('Speak to our court construction team on the toll-free line.')}</p>
            <a className="btn btn-primary" href={`tel:${CONTACT.phone}`}><Phone size={16} /> {t('Call')} {CONTACT.phone}</a>
          </div>
        </div>
        <div className="faq">
          {shown.map((f, k) => (
            <div key={f.q} className={`faq-item ${open === k ? 'open' : ''}`}>
              <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k}>
                <span><span className="faq-n">{String(k + 1).padStart(2, '0')}</span>{t(f.q)}</span>
                <span className="pm"><Plus size={16} /></span>
              </button>
              <div className="faq-a"><div><p>{t(f.a)}</p></div></div>
            </div>
          ))}
          {FAQS.length > 4 && (
            <button className="faq-more" onClick={() => setAll(!all)} aria-expanded={all}>
              {all ? t('See less') : t('See more')} <ChevronDown size={16} className={all ? 'up' : ''} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function toZohoTime(value: string) {
  const [h, m] = value.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return { hour: String(h12).padStart(2, '0'), minute: String(m).padStart(2, '0'), ampm }
}

/** Phone digits typed in Tamil, Hindi, Arabic-Indic and other numerals are sent as plain 0-9 digits. */
export const asciiDigits = (v: string) => v.replace(/\p{Nd}/gu, (d) => {
  let cp = d.codePointAt(0)!
  if (cp >= 48 && cp <= 57) return d
  let start = cp
  while (/\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--
  return String((cp - start) % 10)
})

export const COUNTRY_CODES = [['+91', 'India'], ['+1', 'USA / Canada'], ['+44', 'UK'], ['+971', 'UAE'], ['+966', 'Saudi Arabia'], ['+974', 'Qatar'], ['+65', 'Singapore'], ['+60', 'Malaysia'], ['+66', 'Thailand'], ['+86', 'China'], ['+94', 'Sri Lanka'], ['+977', 'Nepal'], ['+61', 'Australia']]
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => { const mins = 600 + i * 30; return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}` })
const slotLabel = (v: string) => { const [h, m] = v.split(':').map(Number); return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }

export function ContactForm() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const asked = params.get('project') || ''
  const [project, setProject] = useState(ZOHO.projectTypes.includes(asked) ? asked : '')
  const [code, setCode] = useState('+91')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [problem, setProblem] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const todayIso = iso(new Date())
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes()

  useEffect(() => {
    // Zoho's form analytics script is only loaded once the visitor has accepted all cookies.
    const load = () => {
      if (document.getElementById('wf_anal')) return
      const s = document.createElement('script')
      s.id = 'wf_anal'
      s.src = ZOHO.analytics
      s.async = true
      document.body.appendChild(s)
    }
    if (getConsent() === 'all') load()
    const on = (e: Event) => { if ((e as CustomEvent).detail === 'all') load() }
    window.addEventListener('isf-consent', on)
    return () => window.removeEventListener('isf-consent', on)
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    if (!date) { setProblem(t('Please choose a date for the call. Sundays are closed.')); return }
    if (!time) { setProblem(t('Please choose a time between 10:00 AM and 5:00 PM.')); return }
    setProblem('')
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>
    const [y, mo, day] = date.split('-')
    const tz = toZohoTime(time)
    const digits = asciiDigits(d.phone).replace(/\D/g, '').replace(/^0+/, '')
    const fields: Record<string, string> = {
      'Last Name': d.name.trim(),
      Phone: `${code}${digits}`,
      LEADCF4: d.project,
      LEADCF5: d.project === 'Other' ? d.other.trim() : d.project,
      LEADCF118: `${day}/${mo}/${y}`,
      LEADCF118hour: tz.hour,
      LEADCF118minute: tz.minute,
      LEADCF118ampm: tz.ampm,
      ...(optIn ? { LEADCF65: 'on' } : {}),
    }
    setStatus('sending')
    try {
      await postLead(fields)
      setMessage(t('Thank you. Our team will call you back at your preferred time.'))
      setStatus('done')
      form.reset()
      setProject(''); setDate(''); setTime(''); setCode('+91'); setOptIn(false)
    } catch {
      setStatus('error')
    }
  }
  return (
  <form className="cform" onSubmit={submit} noValidate>
      <h3>{t('Get in Touch')}</h3>
      <p className="cform-sub">{t('Hear from the experts in badminton court flooring and construction. Calls are made Monday to Saturday, 10:00 AM to 5:00 PM.')}</p>
      <label className="field"><i className="fi"><User size={17} /></i><span className="sr">{t('Full name')}</span><input name="name" required maxLength={80} autoComplete="name" placeholder={t('Full Name')} /></label>
      <div className="field phone-field">
        <span className="sr">{t('WhatsApp number')}</span>
        <select aria-label="Country code" value={code} onChange={(e) => setCode(e.target.value)}>
          {COUNTRY_CODES.map(([c, n]) => <option key={c + n} value={c}>{c} {n}</option>)}
        </select>
        <input name="phone" required maxLength={15} inputMode="tel" autoComplete="tel-national" pattern="[\p{Nd} ]{6,15}" title="Enter your number without the country code, digits only" placeholder={t('WhatsApp No.')} />
      </div>
      <label className="field"><i className="fi"><Trophy size={17} /></i><span className="sr">{t('Project type')}</span>
        <select name="project" required value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="" disabled>{t('Project Type')}</option>
          {ZOHO.projectTypes.map((o) => <option key={o} value={o}>{t(o)}</option>)}
        </select>
      </label>
      {project === 'Other' && (
        <label className="field"><i className="fi"><Trophy size={17} /></i><span className="sr">{t('Other sport')}</span><input name="other" required maxLength={255} placeholder={t('Specify the sport (e.g. Squash, Running track)')} /></label>
      )}
      <div className="row">
        <div className="field"><span className="sr">{t('Preferred date')}</span><CallDatePicker value={date} onChange={(v) => { setDate(v); setTime('') }} /></div>
        <label className="field"><i className="fi"><Clock size={17} /></i><span className="sr">{t('Preferred time')}</span>
          <select value={time} onChange={(e) => setTime(e.target.value)} aria-label="Preferred time between 10:00 AM and 5:00 PM">
            <option value="" disabled>{t('Preferred Time')}</option>
            {TIME_SLOTS.map((v) => {
              const [h, m] = v.split(':').map(Number)
              const past = date === todayIso && h * 60 + m <= nowMins
              return <option key={v} value={v} disabled={past}>{slotLabel(v)}</option>
            })}
          </select>
        </label>
      </div>
      <label className="opt-in"><input type="checkbox" name="optin" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} /><span>{t('I agree to receive WhatsApp updates')}</span></label>
      <button className="send-btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('Sending...') : t('Send Message')} <Send size={16} className="send-ico" />
      </button>
      <p className="ct-note">{t('Calls are made Monday to Saturday. Sundays are closed.')}</p>
      {problem && <p className="err" role="alert">{problem}</p>}
      {status === 'done' && <p className="ok" role="status"><Check size={16} /> {message}</p>}
      {status === 'error' && <p className="err" role="alert">{t('Something went wrong. Please call us on')} {CONTACT.phone} {t('or try again.')}</p>}
    </form>
  )
}

export function Contact() {
  const { t } = useI18n()
  const channels = [
    { icon: Phone, label: t('Phone Number'), value: CONTACT.phone, href: `tel:${CONTACT.phone}` },
    { icon: MessageCircle, label: 'WhatsApp', value: '+91 87545 52007', href: `https://api.whatsapp.com/send?phone=${CONTACT.whatsapp}` },
    { icon: Mail, label: t('Email Address'), value: CONTACT.emails[1], href: `mailto:${CONTACT.emails[1]}` },
  ]
  return (
    <>
      <section id="contact" className="section contact-sec">
        <div className="container contact-grid">
          <div className="contact-side">
            <span className="c-kicker"><ChevronsRight size={16} /> {t('Contact')}</span>
            <h2>{(() => { const w = t('Contact with us').split(' '); return w.map((x, i) => (w.length > 1 && i >= w.length - 2 ? <span key={i} className="out">{x} </span> : <span key={i}>{x} </span>)) })()}</h2>
            <p className="lead">{t('Tell us about your court, turf or training facility. Our team will call you back at a time that suits you with a plan and a quote.')}</p>
            <ul className="channels">
              {channels.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    <span className="ch-ico"><c.icon size={26} strokeWidth={1.6} /></span>
                    <span className="ch-txt"><strong>{c.label}</strong><em>{c.value}</em></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="section tint visit-sec">
        <div className="container">
          <Head label="Offices" title="Visit us." />
          <div className="visit">
            <div className="visit-map">
              <iframe title="India Sports Floorings on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=India+Sports+Floorings+Kundrathur+Chennai&output=embed" />
            </div>
            <div className="visit-side">
              <div className="visit-card">
                <span className="visit-code" aria-hidden="true">MAA</span>
                <small>{t('Head office')}</small>
                <h3>{t('Chennai, India')}</h3>
                <p>{CONTACT.address.join(', ')}</p>
                <div className="visit-act">
                  <a className="btn btn-primary" href={CONTACT.map} target="_blank" rel="noreferrer">{t('Get directions')} <ArrowUpRight size={16} /></a>
                  <a className="visit-call" href={`tel:${CONTACT.phone}`}><Phone size={16} /> {CONTACT.phone}</a>
                </div>
              </div>
              <div className="visit-alt">
                <img src={A('logo-mark.png')} alt="" className="visit-mark" />
                <small>{t('Sourcing office')}</small>
                <h3>{t('Baoding, China')}</h3>
                <p>{CONTACT.overseas}</p>
                <div className="visit-mail">
                  {CONTACT.emails.map((m) => <a key={m} href={`mailto:${m}`}><Mail size={15} /> {m}</a>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export function Footer() {
  const { t } = useI18n()
  const soc = { Facebook, YouTube: Youtube, Instagram, LinkedIn: Linkedin } as const
  return (
    <footer className="footer">
      <div className="foot-m">
        <div className="foot-m-tag"><i />{t('Chennai, India')} · 2017</div>
        <div className="foot-m-word" aria-label="India Sports Infra"><span className="r1"><span className="in">INDIA</span><span>SPORTS</span></span><span className="g">INFRA</span></div>
        <div className="foot-m-row">
          <div className="foot-m-soc">
            {(Object.keys(soc) as (keyof typeof soc)[]).map((k) => {
              const I = soc[k]
              return <a key={k} href={CONTACT.social[k]} target="_blank" rel="noreferrer" aria-label={k}><I size={18} /></a>
            })}
          </div>
          <button type="button" className="foot-m-top" aria-label={t('Back to top')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18} /></button>
        </div>
        <div className="foot-m-info">
          <div><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a><small>{t('Chennai, India')}</small></div>
          <div className="r"><span>© 2026</span><Link to="/privacy">{t('Privacy Policy')}</Link></div>
        </div>
      </div>
      <div className="container foot-desk">
        <div className="foot-grid">
          <div className="foot-brand">
            <img src={A('logo-dark.webp')} alt="India Sports Infra" width="900" height="344" />
            <div className="foot-soc">
              {(Object.keys(soc) as (keyof typeof soc)[]).map((k) => {
                const I = soc[k]
                return <a key={k} data-net={k} href={CONTACT.social[k]} target="_blank" rel="noreferrer" aria-label={k} title={k}><I size={20} /></a>
              })}
            </div>
          </div>
          <nav aria-label="Footer">
            <h4>{t('Company')}</h4>
            <ul>{NAV.map(([l, h]) => <li key={h}><Link to={h}>{t(l)}</Link></li>)}</ul>
          </nav>
          <div>
            <h4>{t('Contact')}</h4>
            <ul>
              <li><span className="fl">{t('Phone')}</span><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>
              <li><span className="fl">WhatsApp</span><a href={`https://api.whatsapp.com/send?phone=${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">+91 87545 52007</a></li>
              <li><span className="fl">{t('Email')}</span><a href={`mailto:${CONTACT.emails[1]}`}>{CONTACT.emails[1]}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t('Offices')}</h4>
            <ul>
              <li><span className="fl">{t('Chennai, India')}</span><a href={CONTACT.map} target="_blank" rel="noreferrer">{CONTACT.address.join(', ')}</a></li>
              <li><span className="fl">{t('Baoding, China')}</span><span>{CONTACT.overseas}</span></li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>{t('© 2026 India Sports Floorings. All rights reserved.')} <Link className="foot-priv" to="/privacy">{t('Privacy Policy')}</Link></span>
          <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('Back to top')} <ArrowUp size={15} /></button>
        </div>
      </div>
    </footer>
  )
}

export function FloatingActions() {
  // the WhatsApp button steps aside while the footer is on screen, so it never covers the footer text
  const [hide, setHide] = useState(false)
  useEffect(() => {
    const el = document.querySelector('footer.footer')
    if (!el) return
    const io = new IntersectionObserver(([e]) => setHide(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <a className={`wa-fab ${hide ? 'wa-hide' : ''}`} href={`https://api.whatsapp.com/send?phone=${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" tabIndex={hide ? -1 : 0}>
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.01L4 29l8.12-1.57a12 12 0 0 0 3.92.66C22.68 28.09 28 22.69 28 16.05 28 9.4 22.68 3 16.04 3Zm0 22.03c-1.2 0-2.37-.32-3.4-.93l-.5-.29-4.82.93.95-4.7-.32-.52a9.9 9.9 0 0 1-1.52-5.27c0-5.5 4.48-9.98 9.99-9.98 5.5 0 9.98 4.48 9.98 9.98 0 5.5-4.48 9.78-9.98 9.78Zm5.47-7.46c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
    </a>
  )
}
