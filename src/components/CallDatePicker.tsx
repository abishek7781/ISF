import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { localeOf, useI18n } from '../i18n'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function CallDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { lang, t } = useI18n()
  const loc = localeOf(lang)
  const dow = (i: number) => new Date(2026, 0, 5 + i).toLocaleDateString(loc, { weekday: 'short' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])

  const pop = useRef<HTMLDivElement>(null)
  const [up, setUp] = useState(false)
  const placed = useRef(false)
  useLayoutEffect(() => {
    if (!open) { placed.current = false; setUp(false); return }
    if (!pop.current || !box.current) return
    if (pop.current.closest('.entry')) return   // centred over the entry form, no placement needed
    const HEAD = 88
    const r = pop.current.getBoundingClientRect()
    const t = box.current.getBoundingClientRect()
    const fitsBelow = t.bottom + 8 + r.height <= window.innerHeight - 8
    const fitsAbove = t.top - 8 - r.height >= HEAD
    setUp(!fitsBelow && fitsAbove)
    if (!placed.current && !fitsBelow && !fitsAbove) {
      placed.current = true
      const over = t.bottom + 8 + r.height - (window.innerHeight - 12)
      const room = t.top - HEAD - 8
      window.scrollBy({ top: Math.min(over, Math.max(0, room)), behavior: 'instant' as ScrollBehavior })
    }
    placed.current = true
  }, [open, view])

  const first = new Date(view.getFullYear(), view.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)
  const label = value ? new Date(value + 'T00:00:00').toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div className="dp" ref={box}>
      <button type="button" className="dp-trigger" onClick={() => setOpen(!open)} aria-haspopup="dialog" aria-expanded={open}>
        <span className={label ? '' : 'ph'}>{label || t('Select a date')}</span>
        <CalendarDays size={18} />
      </button>
      {open && (
        <div className={`dp-pop ${up ? 'up' : ''}`} ref={pop} role="dialog" aria-label="Choose a date for the call">
          <div className="dp-head">
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Previous month"><ChevronLeft size={18} /></button>
            <strong>{view.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</strong>
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
          </div>
          <div className="dp-grid">
            {DAYS.map((d, i) => <span key={d} className={`dp-dow ${d === 'Sun' ? 'sun' : ''}`}>{dow(i)}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />
              const sunday = d.getDay() === 0
              const past = d < today
              const off = sunday || past
              const sel = value === iso(d)
              return (
                <button type="button" key={iso(d)} disabled={off} aria-disabled={off}
                  title={sunday ? t('Closed on Sundays') : undefined}
                  className={`dp-day ${off ? 'off' : ''} ${sunday ? 'sun' : ''} ${sel ? 'sel' : ''} ${iso(d) === iso(today) ? 'today' : ''}`}
                  onClick={() => { onChange(iso(d)); setOpen(false) }}>
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          <p className="dp-note">{t('Calls are made Monday to Saturday. Sundays are closed.')}</p>
        </div>
      )}
    </div>
  )
}
