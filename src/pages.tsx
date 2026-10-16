import { Brochure } from './components/Tools'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Hero from './components/Hero'
import {
  About, Certifications, Contact, FAQ, Head, Network, Products, Reach, Testimonials, Videos,
} from './components/Sections'
import { Counter, Reveal } from './components/ui'
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
              <dt><Counter to={s.value} suffix={s.suffix} /></dt>
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
    <section className="section">
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
          <Link to="/contact" className="btn btn-primary">{t('Get a call back')} <ArrowRight size={18} /></Link>
          <a href={`tel:${CONTACT.phone}`} className="btn btn-outline-light">{t('Call')} {CONTACT.phone}</a>
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
  return (
    <div className="dark-page">
      <PageHeader title="Portfolio" />
      <Suspense fallback={<div style={{ minHeight: '100svh' }} />}><PortfolioBuilds /></Suspense>
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
