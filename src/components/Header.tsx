import { useEffect, useState } from 'react'
import { Check, Globe, Menu, Moon, Sun, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { A, CONTACT, NAV } from '../data/content'
import { Facebook, Instagram, Linkedin, Youtube } from './Brand'
import { LANGS, useI18n } from '../i18n'

/** English gets the globe; every other language gets its national flag. */
function LangMark({ l }: { l: (typeof LANGS)[number] }) {
  return l.code === 'en' ? <Globe size={17} /> : <img className="lang-cur" src={A(`flags/${l.flag}.svg`)} alt="" width="20" height="14" />
}

export default function Header({ theme, toggle }: { theme: string; toggle: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1081px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1081px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const { lang, setLang, t } = useI18n()
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])
  useEffect(() => {
    let x = 0, y = 0, ok = false
    const start = (e: TouchEvent) => {
      const t = e.touches[0]
      x = t.clientX; y = t.clientY
      ok = e.touches.length === 1 && window.innerWidth <= 1080 && !(e.target as Element).closest('.cert-loop,.tm,.bento,.filters,.pg-grid,.net-mq,.bd-view,.bd-bottom,canvas,.lightbox,.vd-list,input,textarea,select,.dp-pop,.cookie')
    }
    const end = (e: TouchEvent) => {
      if (!ok) return
      const t = e.changedTouches[0]
      const dx = t.clientX - x, dy = Math.abs(t.clientY - y)
      if (dy > 60 || Math.abs(dx) < 80) return
      if (dx > 0) setOpen(true)
      else setOpen(false)
    }
    document.addEventListener('touchstart', start, { passive: true })
    document.addEventListener('touchend', end, { passive: true })
    return () => { document.removeEventListener('touchstart', start); document.removeEventListener('touchend', end) }
  }, [])
  // On desktop in dark mode every page shares the home page's transparent bar until you scroll.
  return (
    <header className={`header ${scrolled || (pathname !== '/' && !(wide && theme === 'dark')) ? 'scrolled' : ''}`}>
      <div className="container header-in">
        <Link to="/" className="brand" aria-label="India Sports Infra home">
          <img src={A(theme === 'dark' ? 'logo-dark.webp' : 'logo.webp')} alt="India Sports Infra" width="900" height="344" />
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map(([l, h]) => <NavLink key={h} to={h} end>{t(l)}</NavLink>)}
        </nav>
        <div className="header-actions">
          <div className="lang" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setLangOpen(false) }}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)} aria-label={t('Language')} aria-expanded={langOpen}>
              <LangMark l={LANGS.find((l) => l.code === lang)!} /><span>{LANGS.find((l) => l.code === lang)!.name}</span>
            </button>
            {langOpen && (
              <ul className="lang-menu">
                {LANGS.map((l) => (
                  <li key={l.code}><button onClick={() => { setLang(l.code); setLangOpen(false) }}><span className="lang-it"><LangMark l={l} />{l.name}</span>{l.code === lang && <Check size={14} />}</button></li>
                ))}
              </ul>
            )}
          </div>
          <button className="icon-btn theme-btn" onClick={toggle} aria-label={t(theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}>
            <span className="tg"><Sun size={19} className="tg-sun" /><Moon size={19} className="tg-moon" /></span>
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-nav">{NAV.map(([l, h]) => <NavLink key={h} to={h} end>{t(l)}</NavLink>)}</div>
        <div className="foot-soc drawer-soc">
          {([['Facebook', Facebook], ['YouTube', Youtube], ['Instagram', Instagram], ['LinkedIn', Linkedin]] as const).map(([k, I]) => (
            <a key={k} data-net={k} href={CONTACT.social[k]} target="_blank" rel="noreferrer" aria-label={k}><I size={20} /></a>
          ))}
        </div>
      </div>
    </header>
  )
}
