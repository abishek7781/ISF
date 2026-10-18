import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Cookie } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getPrefs, savePrefs } from '../lib/consent'

/** A slim bar along the bottom. "Manage" opens a drawer with the three categories side by side. */
export default function CookieBanner() {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [media, setMedia] = useState(true)
  const bar = useRef<HTMLDivElement>(null)

  // On the home page the call-back popup comes first; the cookie bar appears once that popup is closed.
  // On other pages (or if the popup never opens) it appears after a short wait.
  useEffect(() => {
    if (getPrefs().decided) return
    let entryOpen = false
    let timer = 0
    const showSoon = (ms: number) => { clearTimeout(timer); timer = window.setTimeout(() => setShow(true), ms) }
    const onOpen = () => { entryOpen = true; clearTimeout(timer) }
    const onClosed = () => showSoon(500)
    window.addEventListener('isf-entry-open', onOpen)
    window.addEventListener('isf-entry-closed', onClosed)
    showSoon(window.location.pathname === '/' ? 8000 : 3000)
    return () => { clearTimeout(timer); window.removeEventListener('isf-entry-open', onOpen); window.removeEventListener('isf-entry-closed', onClosed); void entryOpen }
  }, [])
  useEffect(() => {
    const reopen = () => {
      const p = getPrefs()
      setAnalytics(p.analytics); setMedia(p.media)
      setLeaving(false); setOpen(true); setShow(true)
    }
    window.addEventListener('isf-open-consent', reopen)
    return () => window.removeEventListener('isf-open-consent', reopen)
  }, [])
  // keep the WhatsApp button clear of the bar
  useEffect(() => {
    const el = bar.current
    const root = document.documentElement
    if (!show || !el) { root.classList.remove('has-cookie-bar'); root.style.removeProperty('--cbh'); return }
    root.classList.add('has-cookie-bar')
    const ro = new ResizeObserver(() => root.style.setProperty('--cbh', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => { ro.disconnect(); root.classList.remove('has-cookie-bar'); root.style.removeProperty('--cbh') }
  }, [show])

  const done = (a: boolean, m: boolean) => {
    savePrefs(a, m)
    setLeaving(true)
    window.setTimeout(() => { setShow(false); setOpen(false) }, 350)
  }
  if (!show) return null
  const cats: { key: string; title: string; text: string; on: boolean; lock?: boolean; set?: (v: boolean) => void }[] = [
    { key: 'ess', title: t('Essential'), text: t('Keeps the site working: your language, theme and this choice. Always on.'), on: true, lock: true },
    { key: 'ana', title: t('Analytics'), text: t('Shows us how the site and the contact form are used, so we can improve them.'), on: analytics, set: setAnalytics },
    { key: 'med', title: t('Embedded media'), text: t('Plays YouTube videos and shows Google Maps. They may set their own cookies.'), on: media, set: setMedia },
  ]
  return (
    <div ref={bar} className={`cb ${open ? 'open' : ''} ${leaving ? 'out' : ''}`} role="dialog" aria-label={t('We use cookies')}>
      <div className="cb-in">
        <div className="cb-top">
          <span className="cb-ico"><Cookie size={20} /></span>
          <p>{t('We use cookies to keep the site working, understand how it is used and improve your experience. You can accept all or keep essential cookies only.')} <Link to="/privacy">{t('Privacy Policy')}</Link></p>
          <button type="button" className="cb-manage" aria-expanded={open} onClick={() => setOpen(!open)}>{t('Manage')} <ChevronDown size={14} /></button>
          <button type="button" className="cb-yes" onClick={() => done(true, true)}>{t('Accept all')}</button>
        </div>
        <div className="cb-drawer" aria-hidden={!open}>
          <div className="cb-cols">
            {cats.map((c) => (
              <div className={`cb-cat ${c.on ? 'on' : ''}`} key={c.key}>
                <div><b>{c.title}</b><span>{c.text}</span></div>
                <button type="button" className={`cb-sw ${c.on ? 'on' : ''}`} role="switch" aria-checked={c.on} aria-label={c.title} disabled={c.lock} tabIndex={open ? 0 : -1} onClick={() => c.set?.(!c.on)} />
              </div>
            ))}
          </div>
          <div className="cb-acts">
            <button type="button" className="cb-save" tabIndex={open ? 0 : -1} onClick={() => done(analytics, media)}>{t('Save choices')}</button>
            <button type="button" className="cb-no" tabIndex={open ? 0 : -1} onClick={() => done(false, false)}>{t('Essential only')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
