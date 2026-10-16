import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { A } from '../data/content'
import { useI18n } from '../i18n'
import { ContactForm } from './Sections'


const ease = (x: number) => x * x * (3 - 2 * x)
const clamp = (x: number) => Math.min(1, Math.max(0, x))

/**
 * Genie warp: the card is cut into thin horizontal strips (copies of the real card), and each strip is pulled
 * toward the menu link. The strips nearest the link go first, so the sides bend into the classic funnel.
 */
export function buildGenie(card: HTMLElement, target: HTMLElement) {
  const r = card.getBoundingClientRect()
  const g = target.getBoundingClientRect()
  const tx = g.left + g.width / 2
  const ty = g.top + g.height / 2
  const cx = r.left + r.width / 2
  const N = 72
  const h = r.height / N
  const layer = document.createElement('div')
  layer.className = 'genie-layer'
  const strips: { el: HTMLElement; y: number }[] = []
  for (let i = 0; i < N; i++) {
    const strip = document.createElement('div')
    strip.className = 'genie-strip'
    strip.style.cssText = `left:${r.left}px;top:${r.top + i * h}px;width:${r.width}px;height:${h + 1}px`
    const copy = card.cloneNode(true) as HTMLElement
    copy.removeAttribute('id')
    copy.classList.add('genie-copy')
    copy.style.cssText = `position:absolute;left:0;top:${-i * h}px;width:${r.width}px;height:${r.height}px;margin:0;animation:none;transform:none`
    strip.appendChild(copy)
    layer.appendChild(strip)
    strips.push({ el: strip, y: r.top + (i + 0.5) * h })
  }
  document.body.appendChild(layer)
  card.style.visibility = 'hidden'
  const frame = (t: number) => {
    // every strip edge is moved by the same warp, so neighbouring strips always meet: a continuous, bending surface
    const edge = (k: number) => {
      const y = r.top + k * h
      const f = ease(clamp(t * 1.6 - (k / N) * 0.6))
      return { f, p: y + (ty - y) * f }
    }
    let lo = edge(0)
    // cloth: a ripple travels down the sheet as it is pulled, strongest in the loose lower part, dying out as it is gathered up
    const swing = Math.sin(Math.PI * clamp(t * 1.05))
    strips.forEach((s, i) => {
      const hi = edge(i + 1)
      const f = (lo.f + hi.f) / 2
      const v = i / (N - 1)
      const bend = ease(f)
      const phase = v * 9.5 - t * 13
      const wave = Math.sin(phase) * swing * (0.25 + 0.75 * v) * (1 - 0.7 * f) * r.width * 0.075
      const fold = Math.cos(phase) * swing * (0.25 + 0.75 * v)
      const dx = (tx - cx) * bend + wave
      const sx = 1 - 0.965 * Math.pow(f, 0.85)
      const sy = Math.min(2.2, Math.max(0.02, (hi.p - lo.p) / h))
      const dy = (lo.p + hi.p) / 2 - s.y
      s.el.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) skewX(${(fold * 7).toFixed(2)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`
      s.el.style.filter = `brightness(${(1 + fold * 0.22).toFixed(3)})`
      lo = hi
    })
    layer.style.opacity = String(1 - clamp((t - 0.9) / 0.1))
  }
  frame(0)
  return { frame, destroy: () => layer.remove() }
}

/** Shown once per visit, a moment after the visitor lands: the same call-back form as the contact page on a frosted glass card. */
export default function EntryForm() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  // Only on arriving at the site (a fresh load of the home page): never when moving around inside the site.
  useEffect(() => {
    if (window.location.pathname !== '/') return
    const id = window.setTimeout(() => setOpen(true), window.matchMedia('(min-width: 1081px)').matches ? 1500 : 3200)
    return () => clearTimeout(id)
  }, [])
  const finish = () => {
    setOpen(false); setLeaving(false)
  }
  // Closing slides the card down off the screen while it fades out.
  const close = () => {
    if (leaving) return
    const el = card.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return }
    setLeaving(true)
    const an = el.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(110%)' }],
      { duration: 550, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' },
    )
    an.onfinish = finish
    window.setTimeout(finish, 900)   // safety net if the browser pauses animations (background tab)
  }
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className={`entry ${leaving ? 'leaving' : ''}`} role="dialog" aria-modal="true" aria-label={t('Get in Touch')} onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="entry-card" ref={card}>
        <button className="entry-x" onClick={close} aria-label="Close"><X size={18} /></button>
        <div className="entry-photo" style={{ backgroundImage: `url(${A('entry-badminton.jpeg')})` }}>
          <span className="entry-blur" style={{ backgroundImage: `url(${A('entry-badminton.jpeg')})` }} aria-hidden="true" />
          <span className="entry-kick">{t('India Sports Infra')}</span>
          <h2>{lang === 'en' ? <>Get a call back from our <em>Experts</em></> : t('Get a call back from our Experts')}</h2>
        </div>
        <div className="entry-form"><ContactForm /></div>
      </div>
    </div>
  )
}
