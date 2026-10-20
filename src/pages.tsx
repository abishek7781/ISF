import { Brochure } from './components/Tools'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import Hero from './components/Hero'
import {
  About, Certifications, Contact, FAQ, Head, Network, Products, Reach, Testimonials, Videos,
} from './components/Sections'
import { Counter, Odometer, Reveal } from './components/ui'
import { useI18n } from './i18n'
import { A, CLIENTS, CONTACT, OUR_SERVICES, PARTNERS, STATS } from './data/content'

const PortfolioBuilds = lazy(() => import('./components/PortfolioBuilds'))

function usePage(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | India Sports Infra` : 'India Sports Infra - Chennai'
  }, [title])
}

function PageHeader({ title }: { title: string; text?: string }) {
  const { t } = useI18n()
  usePage(t(title))
  return <h1 className="sr-only page-start">{t(title)}</h1>
}

function Intro() {
  const { t } = useI18n()
  return (
    <section className="section intro">
      <div className="container">
        <div className="intro-grid">
          <Reveal>
            <div className="head-label">{t('Who we are')}</div>
            <h2>{t('Turnkey sports infrastructure built to global federation standards.')}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              {t('We bring world-class sports flooring and specialised construction to India. Our solutions are shaped by international benchmarks and technical insights from Paris Olympic facilities, and every venue we design, engineer and build is made for athlete safety, consistent playability and long-term durability.')}
            </p>
            <Link to="/about" className="link">{t('More about ISF')} <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
        <dl className="figures">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="figure">
              <dt><span className="fig-n"><Counter to={s.value} suffix={s.suffix} /></span><Odometer to={s.value} suffix={s.suffix} /></dt>
              <dd><strong>{t(s.label)}</strong><span>{t(s.note)}</span></dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

const GROUPS = ['All', ...new Set(OUR_SERVICES.map((s) => s.group))]

function OurServices() {
  const { t } = useI18n()
  const [group, setGroup] = useState('All')
  const list = OUR_SERVICES.map((s, i) => ({ ...s, n: i + 1 })).filter((s) => group === 'All' || s.group === group)
  return (
    <section className="section svc-sec">
      <div className="container">
        <Head label="Our service" title="The best badminton flooring company in India." aside="A wide variety of high-quality services, delivered by our own team from design to handover." />
        <div className="filters" role="tablist" aria-label="Filter services">
          {GROUPS.map((g) => (
            <button key={g} role="tab" aria-selected={group === g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{t(g)}</button>
          ))}
        </div>
        <div className="bento" key={group}>
          {list.map((s, k) => (
            <article key={s.name} className="bt" style={{ animationDelay: `${k * 40}ms` }}>
              {s.image ? <img src={A(s.image)} alt="" loading="lazy" /> : <span className="bt-ph">{String(s.n).padStart(2, '0')}</span>}
              <div><small>{t(s.group)}</small><h3>{t(s.name)}</h3></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBand() {
  const { t } = useI18n()
  return (
    <section className="cta-band">
      <div className="container cta-in">
        <h2>{t('Hear from the experts in badminton court flooring and construction.')}</h2>
        <div className="cta-actions">
          <Link to="/contact" className="cta-main"><span>{t('Get a call back')}</span><i><ArrowRight size={18} /></i></Link>
          <a href={`tel:${CONTACT.phone}`} className="cta-call"><i><Phone size={17} /></i><span><small>{t('Call')}</small><b>{CONTACT.phone}</b></span></a>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  usePage('')
  return (
    <>
      <Hero />
      <Intro />
      <OurServices />
      <Certifications />
      <Network clients={CLIENTS} partners={PARTNERS} />
      <Testimonials />
      <Videos />
      <FAQ />
      <CtaBand />
    </>
  )
}

export function ProductsPage() {
  return (
    <div className="dark-page">
      <PageHeader title="Products" text="A wide range of high-quality flooring systems for badminton and every major sport." />
      <Products />
      <Brochure />
      <CtaBand />
    </div>
  )
}

export function PortfolioPage() {
  // The 3D builds start a moment after the page has loaded (or at the first scroll or tap), so the page itself appears and responds first.
  const [ready3d, setReady3d] = useState(false)
  useEffect(() => {
    let t = 0
    const go = () => { clearTimeout(t); setReady3d(true); void import('./three/warm').then((m) => m.warm3D()); off() }
    const evs = ['scroll', 'pointerdown', 'touchstart', 'keydown'] as const
    const off = () => evs.forEach((e) => window.removeEventListener(e, go))
    evs.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    const arm = () => { t = window.setTimeout(go, 2500) }
    if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm, { once: true })
    return () => { clearTimeout(t); off(); window.removeEventListener('load', arm) }
  }, [])
  return (
    <div className="dark-page">
      <PageHeader title="Portfolio" />
      {ready3d ? <Suspense fallback={<div style={{ minHeight: '100svh' }} />}><PortfolioBuilds /></Suspense> : <div style={{ minHeight: '100svh' }} aria-hidden="true" />}
      <Reach />
      <CtaBand />
    </div>
  )
}

export function AboutPage() {
  return (
    <>
      <PageHeader title="About" />
      <About />
      <Certifications />
      <Network clients={CLIENTS} partners={PARTNERS} />
      <CtaBand />
    </>
  )
}

export function ContactPage() {
  return (
    <div className="dark-page">
      <PageHeader title="Contact" text="Get a call back from our sports infrastructure team." />
      <Contact />
    </div>
  )
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
