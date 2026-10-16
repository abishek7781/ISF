import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

const KEY = 'isf-consent'
export const getConsent = () => { try { return localStorage.getItem(KEY) } catch { return null } }

export default function CookieBanner() {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (getConsent()) return
    const id = window.setTimeout(() => setShow(true), 3000) // after the welcome screen has opened
    return () => clearTimeout(id)
  }, [])
  useEffect(() => {
    const reopen = () => { setLeaving(false); setShow(true) }
    window.addEventListener('isf-open-consent', reopen)
    return () => window.removeEventListener('isf-open-consent', reopen)
  }, [])
  const choose = (v: 'all' | 'essential') => {
    try { localStorage.setItem(KEY, v) } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent('isf-consent', { detail: v }))
    setLeaving(true)
    window.setTimeout(() => setShow(false), 350)
  }
  if (!show) return null
  return (
    <div className={`cookie ${leaving ? 'out' : ''}`} role="dialog" aria-label={t('We use cookies')}>
      <span className="cookie-ico"><Cookie size={22} /></span>
      <div className="cookie-tx">
        <strong>{t('We use cookies')}</strong>
        <p>{t('We use cookies to keep the site working, understand how it is used and improve your experience. You can accept all or keep essential cookies only.')} <Link to="/privacy">{t('Privacy Policy')}</Link></p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-yes" onClick={() => choose('all')}>{t('Accept all')}</button>
        <button className="cookie-no" onClick={() => choose('essential')}>{t('Essential only')}</button>
      </div>
    </div>
  )
}
