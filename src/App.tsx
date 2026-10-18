import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom'
import Header from './components/Header'
import { FloatingActions, Footer } from './components/Sections'
import { A } from './data/content'
import CookieBanner from './components/CookieBanner'
import EntryForm from './components/EntryForm'
import PrivacyPage from './components/Privacy'
import { AboutPage, ContactPage, HomePage, PortfolioPage, ProductsPage, ScrollToTop } from './pages'

import { NotFound } from './components/Tools'
import { warm3D } from './three/warm'

function PreLogo() {
  return (
    <div className="pre-logo">
      <div className="pre-ext">{[1, 2, 3, 4, 5].map((n) => <i key={n} className="abm-mk" style={{ ['--n' as string]: n }} />)}</div>
      <div className="pre-draw"><img src={A('logo-m.svg')} alt="" /></div>
      <div className="pre-gloss" />
    </div>
  )
}

function Preloader() {
  const [open, setOpen] = useState(false)
  // The intro animation is for phones and tablets only; laptops and desktops go straight in.
  const [gone, setGone] = useState(() => window.matchMedia('(min-width: 1081px)').matches)
  useEffect(() => {
    warm3D()
    if (gone) return
    document.body.style.overflow = 'hidden'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t1 = window.setTimeout(() => { setOpen(true); document.body.style.overflow = '' }, 2000)
    const t2 = window.setTimeout(() => setGone(true), reduce ? 2100 : 2650)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])
  if (gone) return null
  return (
    <div className={`pre ${open ? 'open' : ''}`} role="status" aria-label="Loading India Sports Infra">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="tear-top" clipPathUnits="objectBoundingBox"><path d="M0 0H1V0.106C0.65 0.306 0.3 0.606 0 0.906Z" /></clipPath>
          <clipPath id="tear-bot" clipPathUnits="objectBoundingBox"><path d="M0 0.9C0.3 0.6 0.65 0.3 1 0.1V1H0Z" /></clipPath>
        </defs>
      </svg>
      <div className="pre-half top" aria-hidden="true"><PreLogo /></div>
      <div className="pre-half bot" aria-hidden="true"><PreLogo /></div>
    </div>
  )
}

function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found | India Sports Infra' }, [])
  return <div className="dark-page"><NotFound /></div>
}

function PageRoutes({ location }: { location: Location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

/** Fade through: the new page fades in with a small upward drift. Only the incoming page is mounted. */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div className="pt">
      <div className="pt-in" key={location.pathname}><PageRoutes location={location} /></div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState<string>(() => document.documentElement.dataset.theme || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('isf-theme', theme) } catch { /* storage unavailable */ }
  }, [theme])
  return (
    <BrowserRouter>
      <Preloader />
      <ScrollToTop />
      <Header theme={theme} toggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
      <FloatingActions />
      <EntryForm />
      <CookieBanner />
      <Analytics />
    </BrowserRouter>
  )
}
