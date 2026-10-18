import { useEffect, useState } from 'react'

const KEY = 'isf-consent'          // 'all' | 'essential' | 'custom'
const PREFS = 'isf-consent-prefs'  // {"analytics":bool,"media":bool}, used when the choice is 'custom'
const PAGESENSE = 'https://cdn-in.pagesense.io/js/60087298656/dedf834648584d1fbd2d41cb4cd535e9.js'

export type Prefs = { decided: boolean; analytics: boolean; media: boolean }

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }

/** What the visitor allows. Until they choose: analytics off, and embedded media on (the videos use YouTube's privacy-enhanced player). */
export function getPrefs(): Prefs {
  const v = read(KEY)
  if (v === 'all') return { decided: true, analytics: true, media: true }
  if (v === 'essential') return { decided: true, analytics: false, media: false }
  if (v === 'custom') {
    try { const p = JSON.parse(read(PREFS) || '{}'); return { decided: true, analytics: !!p.analytics, media: !!p.media } } catch { /* fall through */ }
  }
  return { decided: false, analytics: false, media: true }
}

export function savePrefs(analytics: boolean, media: boolean) {
  const v = analytics && media ? 'all' : !analytics && !media ? 'essential' : 'custom'
  try {
    localStorage.setItem(KEY, v)
    localStorage.setItem(PREFS, JSON.stringify({ analytics, media }))
  } catch { /* storage unavailable */ }
  applyConsent()
  window.dispatchEvent(new CustomEvent('isf-consent', { detail: getPrefs() }))
}

export const openCookieSettings = () => window.dispatchEvent(new Event('isf-open-consent'))

/** Loads Zoho PageSense only when analytics is allowed. */
export function applyConsent() {
  if (getPrefs().analytics && !document.getElementById('pagesense')) {
    const s = document.createElement('script')
    s.id = 'pagesense'
    s.src = PAGESENSE
    s.async = true
    document.body.appendChild(s)
  }
}

/** Re-renders when the visitor changes their choice. */
export function useConsent(): Prefs {
  const [p, setP] = useState(getPrefs)
  useEffect(() => {
    const on = () => setP(getPrefs())
    window.addEventListener('isf-consent', on)
    return () => window.removeEventListener('isf-consent', on)
  }, [])
  return p
}
