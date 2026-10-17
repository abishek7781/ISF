import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'zh' | 'th' | 'hi' | 'ta' | 'te' | 'ml' | 'ms'
export const LANGS: { code: Lang; short: string; name: string; flag: string }[] = [
  { code: 'en', short: 'EN', name: 'English', flag: 'gb' },
  { code: 'zh', short: '中文', name: '中文', flag: 'cn' },
  { code: 'th', short: 'ไทย', name: 'ไทย', flag: 'th' },
  { code: 'hi', short: 'HI', name: 'हिन्दी', flag: 'in' },
  { code: 'ta', short: 'TA', name: 'தமிழ்', flag: 'in' },
  { code: 'te', short: 'TE', name: 'తెలుగు', flag: 'in' },
  { code: 'ml', short: 'ML', name: 'മലയാളം', flag: 'in' },
  { code: 'ms', short: 'BM', name: 'Bahasa Melayu', flag: 'my' },
]

// Dictionaries are keyed by the English text. Anything not listed falls back to English.
/** Dictionaries are keyed by the English text and loaded on demand, so a visitor only downloads the language they use. */
const LOADERS: Record<Exclude<Lang, 'en'>, () => Promise<Record<string, string>>> = {
  zh: () => import('./langs/zh').then((m) => m.ZH),
  th: () => import('./langs/th').then((m) => m.TH),
  hi: () => import('./langs/hi').then((m) => m.HI),
  ta: () => import('./langs/ta').then((m) => m.TA),
  te: () => import('./langs/te').then((m) => m.TE),
  ml: () => import('./langs/ml').then((m) => m.ML),
  ms: () => import('./langs/ms').then((m) => m.MS),
}
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string }
const I18n = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (s) => s })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { const v = localStorage.getItem('isf-lang'); if (LANGS.some((l) => l.code === v)) return v as Lang } catch { /* storage unavailable */ }
    return 'en'
  })
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : lang
    try { localStorage.setItem('isf-lang', lang) } catch { /* storage unavailable */ }
  }, [lang])
  const [dict, setDict] = useState<Record<string, string>>({})
  useEffect(() => {
    if (lang === 'en') { setDict({}); return }
    let alive = true
    LOADERS[lang]().then((d) => { if (alive) setDict(d) }).catch(() => undefined)
    return () => { alive = false }
  }, [lang])
  const t = (s: string) => (lang === 'en' ? s : dict[s] ?? s)
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>
}

const LOCALES: Record<Lang, string> = { en: 'en-IN', zh: 'zh-CN', th: 'th-TH-u-ca-gregory', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', ms: 'ms-MY' }
export const localeOf = (l: Lang) => LOCALES[l]
export const useI18n = () => useContext(I18n)
