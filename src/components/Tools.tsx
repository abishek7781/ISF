import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Download, Ruler } from 'lucide-react'
import { A, ZOHO } from '../data/content'
import { useI18n } from '../i18n'
import { postLead } from '../lib/zoho'
import { COUNTRY_CODES, asciiDigits } from './Sections'
import { Reveal } from './ui'

/* ------------------------------ Brochure download ------------------------------ */
const BROCHURE = A('ISF-brochure.pdf')

/* The brochure book: hops twice, opens, flips through its pages, then closes again. */
const BOOK_PAGES: { img?: string; head: string; body: string; back: string; backHead: string }[] = [
  { img: 'badminton4.jpg', head: 'Flooring systems', body: '', backHead: 'Seven layers', back: 'From the concrete slab to the court markings, every layer is chosen for spring and grip.' },
  { img: 'tt1.webp', head: 'Turf and courts', body: '', backHead: 'Built outdoors too', back: 'Artificial turf, futsal and multi-sport courts with fabricated enclosures.' },
  { img: 'track.webp', head: 'Running tracks', body: '', backHead: 'Marked lanes', back: 'Rubberised athletics tracks laid and marked to standard.' },
  { img: 'products/basketball.webp', head: 'Basketball', body: '', backHead: 'Shock absorbing', back: 'Indoor and outdoor courts that protect knees and keep the bounce true.' },
  { img: 'entry-badminton.jpeg', head: 'Indoor halls', body: '', backHead: 'Turnkey delivery', back: 'Floor, lighting and fabrication from one team, in one schedule.' },
  { head: 'Lighting', body: 'Glare-controlled lighting for halls and floodlights for open turfs.', backHead: 'Planned for play', back: 'Even light across the court, so players never lose the shuttle.' },
  { head: 'BWF approved', body: 'Test reports and certificates for our wooden and synthetic systems.', backHead: 'On paper', back: 'Every approval and installation certificate, included in this PDF.' },
  { head: 'Talk to us', body: 'Chennai, India', backHead: '1800 419 0106', back: 'Call Monday to Saturday, 10:00 AM to 5:00 PM.' },
]

const bookWait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const bookAn = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions = {}) =>
  el.animate(kf, { duration: 600, easing: 'ease-in-out', fill: 'forwards', ...o }).finished.catch(() => undefined)

async function playBook(book: HTMLElement) {
  const cover = book.querySelector<HTMLElement>('.bk-cover')!
  const pgs = Array.from(book.querySelectorAll<HTMLElement>('.bk-pg')).sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i))
  const n = pgs.length
  const rest = 'rotateZ(-6deg) rotateY(-14deg) rotateX(5deg)'
  book.getAnimations().forEach((a) => a.cancel())
  ;[cover, ...pgs].forEach((e) => e.getAnimations().forEach((a) => a.cancel()))
  await bookAn(book, [{ transform: `${rest} translateY(0)` }, { transform: `${rest} translateY(-24px)` }, { transform: `${rest} translateY(0)` }, { transform: `${rest} translateY(-13px)` }, { transform: `${rest} translateY(0)` }], { duration: 900 })
  void bookAn(book, [{ transform: rest }, { transform: 'translateX(var(--bk-slide)) rotateZ(-3deg) rotateY(0) rotateX(8deg)' }], { duration: 700 })
  await bookAn(cover, [{ transform: 'translateZ(2px) rotateY(0)' }, { transform: 'translateZ(2px) rotateY(-168deg)' }], { duration: 700 })
  // a flipped page lands on top of the stack on the left, so each one sits a little nearer the viewer than the last
  const zr = (i: number) => `${1 - i * 0.3}px`
  const zl = (i: number) => `${3 + i * 0.6}px`
  await Promise.all(pgs.map((p, i) => bookAn(p, [{ transform: `translateZ(${zr(i)}) rotateY(0)` }, { transform: `translateZ(${zl(i)}) rotateY(-165deg)` }], { duration: 560, delay: i * 520 })))
  await bookWait(900)
  await Promise.all(pgs.map((p, i) => bookAn(p, [{ transform: `translateZ(${zl(i)}) rotateY(-165deg)` }, { transform: `translateZ(${zr(i)}) rotateY(0)` }], { duration: 480, delay: (n - 1 - i) * 90 })))
  await bookAn(cover, [{ transform: 'translateZ(2px) rotateY(-168deg)' }, { transform: 'translateZ(2px) rotateY(0)' }], { duration: 650 })
  await bookAn(book, [{ transform: 'translateX(var(--bk-slide)) rotateZ(-3deg) rotateY(0) rotateX(8deg)' }, { transform: rest }], { duration: 600 })
  ;[cover, ...pgs, book].forEach((e) => e.getAnimations().forEach((a) => a.cancel()))
}

function BrochureBook({ bookRef }: { bookRef: React.RefObject<HTMLDivElement | null> }) {
  const { t } = useI18n()
  return (
    <div className="bk-stage" aria-hidden="true">
      <div className="bk" ref={bookRef}>
        <div className="bk-back"><b>{t('Contents')}</b><small>{t('Floors, fabrication, lighting and BWF reports')}</small></div>
        {BOOK_PAGES.map((p, i) => ({ p, i })).reverse().map(({ p, i }) => (
          <div className="bk-pg" key={i} data-i={i} style={{ ['--i' as string]: i }}>
            <div className="bk-front">
              {p.img ? <img src={A(p.img)} alt="" loading="lazy" /> : <span className="bk-ph" />}
              <strong>{t(p.head)}</strong>
              {p.body && <small>{t(p.body)}</small>}
            </div>
            <div className="bk-flip"><strong>{t(p.backHead)}</strong><small>{t(p.back)}</small><i /><i /><i /></div>
          </div>
        ))}
        <div className="bk-cover" data-i="c">
          <div className="bk-ct">India Sports<br />Infra<small>{t('Brochure')}</small></div>
          <div className="bk-cin"><b>{t('Inside')}</b><ul>{BOOK_PAGES.map((p, i) => <li key={i}>{t(p.head)}</li>)}</ul></div>
        </div>
      </div>
    </div>
  )
}

export function Brochure() {
  const { t } = useI18n()
  const [code, setCode] = useState('+91')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ready' | 'missing' | 'error'>('idle')
  const bookRef = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const open = async () => {
    const b = bookRef.current
    if (!b || busy.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    busy.current = true
    try { await playBook(b) } finally { busy.current = false }
  }
  // The book plays on a loop while the card is on screen, and again straight away when the download is pressed.
  useEffect(() => {
    const el = card.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let alive = true
    let inView = false
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { threshold: 0.5 })
    io.observe(el)
    ;(async () => {
      await bookWait(700)
      while (alive) {
        if (inView) { await open(); await bookWait(1800) } else await bookWait(400)
      }
    })()
    return () => { alive = false; io.disconnect() }
  }, [])
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    void open()
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>
    const fields: Record<string, string> = {
      'Last Name': d.name.trim(),
      Phone: `${code}${asciiDigits(d.phone).replace(/\D/g, '').replace(/^0+/, '')}`,
      LEADCF4: ZOHO.brochureType,
      LEADCF5: 'Brochure download',
      'Lead Source': 'Web Download',
    }
    setStatus('sending')
    try {
      await postLead(fields)
      const head = await fetch(BROCHURE, { method: 'HEAD' }).catch(() => null)
      if (head && head.ok && (head.headers.get('Content-Type') || '').includes('pdf')) {
        setStatus('ready')
        const a = document.createElement('a')
        a.href = BROCHURE; a.download = 'ISF-brochure.pdf'
        document.body.appendChild(a); a.click(); a.remove()
      } else setStatus('missing')
      form.reset()
    } catch {
      setStatus('error')
    }
  }
  return (
    <section className="section brochure-sec" id="brochure" ref={card}>
      <div className="container">
        <Reveal className="brochure">
          <div className="br-bg" aria-hidden="true"><i className="sp1" /><i className="sp2" /></div>
          <BrochureBook bookRef={bookRef} />
          <div className="br-fan" aria-hidden="true">
            {[['tt1.webp', 'Turf and courts'], ['badminton4.jpg', 'Flooring systems'], ['track.webp', 'Running tracks']].map(([img, label]) => (
              <span className="br-fp" key={img}><img src={A(img)} alt="" loading="lazy" /><b>{t(label)}</b></span>
            ))}
          </div>
          <div className="br-main">
            <div className="br-text">
              <h2>{t('Take our brochure with you.')}</h2>
              <p>{t('Floors, fabrication, lighting and our BWF test reports in one PDF. Leave your name and number and the download starts right away.')}</p>
            </div>
          <form className="br-form" onSubmit={submit} noValidate>
            <input name="name" required maxLength={80} autoComplete="name" placeholder={t('Full Name')} aria-label={t('Full name')} />
            <div className="br-phone">
              <select aria-label="Country code" value={code} onChange={(e) => setCode(e.target.value)}>
                {COUNTRY_CODES.map(([c, nme]) => <option key={c + nme} value={c}>{c} {nme}</option>)}
              </select>
              <input name="phone" required maxLength={15} inputMode="tel" autoComplete="tel-national" pattern="[\p{Nd} ]{6,15}" placeholder={t('WhatsApp No.')} aria-label={t('WhatsApp number')} />
            </div>
            <button className="btn btn-primary br-dl" type="submit" disabled={status === 'sending'}>{status === 'sending' ? t('Sending...') : t('Download brochure')} <Download size={16} /></button>
            {status === 'ready' && <p className="ok" role="status"><Check size={16} /> {t('Thank you. Your download has started.')}</p>}
            {status === 'missing' && <p className="ok" role="status"><Check size={16} /> {t('Thank you. Our team will send the brochure to your WhatsApp shortly.')}</p>}
            {status === 'error' && <p className="err" role="alert">{t('Something went wrong. Please try again.')}</p>}
          </form>
          </div>
          <div className="br-ball" aria-hidden="true"><span className="br-sh" /><span className="br-b"><span><svg viewBox="0 0 100 100"><path d="M-6 30C26 38 38 62 30 106" /><path d="M106 70C74 62 62 38 70 -6" /></svg></span></span></div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ Page not found ------------------------------ */
export function NotFound() {
  const { t } = useI18n()
  return (
    <section className="nf">
      <div className="container nf-in">
        <span className="nf-oops" aria-hidden="true">Oops!</span>
        <h1>{t('This page does not exist.')}</h1>
        <p>{t('The link may be broken, or the page has moved.')}</p>
        <Link className="btn btn-primary" to="/">{t('Take me home')}</Link>
        <span className="nf-code">404</span>
      </div>
    </section>
  )
}
