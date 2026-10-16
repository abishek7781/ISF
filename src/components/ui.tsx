import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

export function Reveal({ children, delay = 0, className = '', y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export function Counter({ to, suffix = '', duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref}>{v.toLocaleString('en-IN')}{suffix}</span>
}

/** Phone version of a counter: every digit sits in its own box and rolls like a car odometer when it scrolls into view. */
export function Odometer({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const on = useInView(ref, { once: true })
  const text = String(to)
  return (
    <span className="od" ref={ref}>
      <span className="sr">{to}{suffix}</span>
      <span aria-hidden="true" className="od-row">
        {text.split('').map((c, i) => (
          <i key={i} className="od-d">
            <b style={{ transform: on ? `translateY(-${Number(c) * 10}%)` : undefined, transitionDelay: `${i * 0.12}s` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <em key={n}>{n}</em>)}
            </b>
          </i>
        ))}
        {suffix && <i className="od-s">{suffix}</i>}
      </span>
    </span>
  )
}

export function SectionHead({ eyebrow, title, text, center = true }: { eyebrow: string; title: ReactNode; text?: string; center?: boolean }) {
  return (
    <Reveal className={`section-head ${center ? 'center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p className="lead">{text}</p>}
    </Reveal>
  )
}
