import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownRight, Hammer, Lightbulb, Layers, Pause, Play, RotateCcw } from 'lucide-react'
import { A } from '../data/content'
import { useI18n } from '../i18n'
import { Reveal } from './ui'
import { createStage, type Stage } from '../three/stage'
import { FLOOR_LAYERS, INSTALL_STEPS, buildFloor, type FloorApi } from '../three/floorScene'
import { LIGHT_STEPS, buildLighting, type SceneApi } from '../three/lightScene'
import { FAB_STEPS, buildFabrication } from '../three/fabScene'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Steps = readonly { key: string; a: number; b: number }[]

/** Hook: creates a WebGL stage inside `host`, builds a scene into it, and tears it down on unmount. */
// Scenes are built one at a time, in idle moments, so a phone never has to build two at once.
const queue: (() => void)[] = []
let busy = false
const pump = () => {
  if (busy) return
  const job = queue.shift()
  if (!job) return
  busy = true
  const run = () => { job(); busy = false; window.setTimeout(pump, 120) }
  const w = window as unknown as { requestIdleCallback?: (f: () => void, o: object) => void }
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 250 })
  else window.setTimeout(run, 16)
}
const enqueue = (job: () => void) => { queue.push(job); pump() }

function useScene<T>(build: (s: Stage) => T, cam: [number, number, number], target: [number, number, number], opts: { fov?: number; autoRotate?: boolean; exposure?: number; env?: number } = {}) {
  const host = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<T | null>(null)
  const stageRef = useRef<Stage | null>(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    let stage: Stage | null = null
    let timer = 0
    let wanted = false
    const create = () => {
      if (stage || !wanted) return
      try { stage = createStage(el, { cam, target, ...opts }) } catch { return }
      stageRef.current = stage
      setApi(build(stage))
    }
    const destroy = () => { if (!stage) return; stage.dispose(); stage = null; stageRef.current = null; setApi(null) }
    // Build a scene only as it approaches the screen, and free its GPU memory once it is well out of view.
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(timer)
      wanted = e.isIntersecting
      if (wanted) enqueue(create)
      else timer = window.setTimeout(destroy, 1500)
    }, { rootMargin: '100% 0px' })
    io.observe(el)
    return () => { io.disconnect(); clearTimeout(timer); destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { host, api, stageRef }
}

function useOnceVisible(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); io.disconnect() } }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/* ------------------------------------------------------------------ */
/* Timeline player: a scene that builds from 0 to 1 with play/scrub/steps */
/* ------------------------------------------------------------------ */
function Timeline({ api, steps, duration, labels, wrap, start = 0, hold = false }: { start?: number; hold?: boolean; api: SceneApi | FloorApi | null; steps: Steps; duration: number; labels: Record<string, string>; wrap: React.RefObject<HTMLElement | null> }) {
  const { t } = useI18n()
  const [p, setP] = useState(() => (reducedMotion() ? 1 : start))
  const [playing, setPlaying] = useState(false)
  const pRef = useRef(reducedMotion() ? 1 : start)
  const started = useRef(false)

  const apply = useCallback((v: number) => { pRef.current = v; api?.setProgress(v); setP(v) }, [api])
  useEffect(() => { if (api) apply(pRef.current) }, [api, apply])
  const seen = useRef(false)
  useOnceVisible(wrap, () => { seen.current = true; if (!reducedMotion() && !hold) { started.current = true; setPlaying(true) } })
  useEffect(() => { if (!hold && seen.current && !started.current && !reducedMotion()) { started.current = true; setPlaying(true) } }, [hold])

  useEffect(() => {
    if (!playing || !api) return
    let raf = 0
    let last = performance.now()
    const tick = (n: number) => {
      const dt = Math.min(0.05, (n - last) / 1000)
      last = n
      apply(Math.min(1, pRef.current + dt / duration))
      if (pRef.current < 1) raf = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, api, duration, apply])

  let cur = 0
  steps.forEach((s, i) => { if (p >= s.a) cur = i })
  const done = p >= 1
  return (
    <div className="bd-bar">
      <div className="bd-controls">
        <button className="bd-play" onClick={() => { if (done) apply(0); setPlaying(!playing || done) }} aria-label={playing ? t('Pause') : done ? t('Replay') : t('Play')}>
          {playing ? <Pause size={16} /> : done ? <RotateCcw size={16} /> : <Play size={16} />}
        </button>
        <input className="bd-scrub" type="range" min={0} max={1000} value={Math.round(p * 1000)} aria-label={t('Progress')}
          style={{ ['--p' as string]: `${p * 100}%` }}
          onChange={(e) => { setPlaying(false); apply(+e.target.value / 1000) }} />
      </div>
      <ol className="bd-steps">
        {steps.map((s, i) => (
          <li key={s.key}>
            <button className={i === cur && !done ? 'on' : p >= s.b - 0.0001 ? 'done' : ''} onClick={() => { setPlaying(false); apply(Math.min(1, s.b)) }}>
              <span>{String(i + 1).padStart(2, '0')}</span>{t(labels[s.key])}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CanvasArea({ host, children }: { host: React.RefObject<HTMLDivElement | null>; children?: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="bd-view">
      <div className="bd-canvas" ref={host} />
      <span className="bd-hint"><ArrowDownRight size={14} /> {t('Drag to rotate')}</span>
      {children}
    </div>
  )
}

/* ------------------------------ Hero ------------------------------ */
/** The badminton court play area (13.4 m x 6.1 m: boundary, singles lines, service lines, centre line, net) traced line by line, and dragged to rotate. */
function CourtDrawing() {
  const [play, setPlay] = useState(false)
  const x = 0, y = 0, w = 260, h = 118
  const sx = w / 13.4, sy = h / 6.1
  const cx = x + w / 2
  const box = useRef<HTMLDivElement>(null)
  const orbit = useRef<HTMLDivElement>(null)
  const rot = useRef({ x: 8, z: -31 })
  const drag = useRef<{ px: number; py: number; x: number; z: number } | null>(null)
  const apply = () => { if (box.current) box.current.style.transform = `rotateX(${rot.current.x}deg) rotateZ(${rot.current.z}deg)` }
  useEffect(() => {
    apply()
  }, [])
  const interacted = useRef(false)
  // Draw the lines once each time the hero scrolls into view; leaving the hero resets them.
  useEffect(() => {
    const el = orbit.current?.closest('.pf-hero') || orbit.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPlay(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const down = (e: React.PointerEvent) => { drag.current = { px: e.clientX, py: e.clientY, x: rot.current.x, z: rot.current.z }; interacted.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
  const move = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    rot.current.z = d.z + (e.clientX - d.px) * 0.45
    if (e.pointerType !== 'touch') rot.current.x = Math.max(8, Math.min(82, d.x - (e.clientY - d.py) * 0.35))
    apply()
  }
  const up = () => { drag.current = null }
  let n = 0
  const L = (d: string, k: 'l' | 'm' = 'l') => <path key={n} className={k} pathLength={1} d={d} style={{ ['--d' as string]: `${(n++ % 24) * 0.12}s` }} />
  const ln = (x1: number, y1: number, x2: number, y2: number, k: 'l' | 'm' = 'l') => L(`M${x1} ${y1}L${x2} ${y2}`, k)
  return (
    <div className={`pf-orbit ${play ? 'drawn' : ''}`} ref={orbit} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="pf-rot" ref={box}>
        <svg className="pf-draw" viewBox="-6 -6 272 130" aria-hidden="true">
          {L(`M${x} ${y}h${w}v${h}h${-w}z`)}
          {ln(x, y + 0.46 * sy, x + w, y + 0.46 * sy)}{ln(x, y + h - 0.46 * sy, x + w, y + h - 0.46 * sy)}
          {ln(x + 0.76 * sx, y, x + 0.76 * sx, y + h)}{ln(x + w - 0.76 * sx, y, x + w - 0.76 * sx, y + h)}
          {ln(cx - 1.98 * sx, y + 0.46 * sy, cx - 1.98 * sx, y + h - 0.46 * sy)}{ln(cx + 1.98 * sx, y + 0.46 * sy, cx + 1.98 * sx, y + h - 0.46 * sy)}
          {ln(x, y + h / 2, cx - 1.98 * sx, y + h / 2)}{ln(cx + 1.98 * sx, y + h / 2, x + w, y + h / 2)}
          {ln(cx, y, cx, y + h, 'm')}
        </svg>
      </div>
    </div>
  )
}

/** Phone version: a full basketball court marked in slanted line work. */
function MultiCourt() {
  const [on, setOn] = useState(false)
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = el.current?.closest('.pf-hero') || el.current
    if (!t) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 })
    io.observe(t)
    return () => io.disconnect()
  }, [])
  const S = 11.4
  let n = 0
  const P = (d: string, base: number) => <path key={n} pathLength={1} d={d} style={{ ['--d' as string]: `${base + (n++ % 12) * 0.08}s` }} />
  const m = (v: number) => +(v * S).toFixed(1)
  const R = (x: number, y: number, w: number, h: number, b: number) => P(`M${m(x)} ${m(y)}h${m(w)}v${m(h)}h${-m(w)}z`, b)
  const Ln = (x1: number, y1: number, x2: number, y2: number, b: number) => P(`M${m(x1)} ${m(y1)}L${m(x2)} ${m(y2)}`, b)
  const Ci = (cx: number, cy: number, r: number, b: number) => P(`M${m(cx - r)} ${m(cy)}a${m(r)} ${m(r)} 0 1 0 ${m(2 * r)} 0a${m(r)} ${m(r)} 0 1 0 ${-m(2 * r)} 0`, b)
  const half = (flip: boolean, b: number) => {
    const X = (v: number) => (flip ? 28 - v : v)
    return [
      R(flip ? 22.2 : 0, 5.05, 5.8, 4.9, b),
      P(`M${m(X(5.8))} ${m(5.7)}A${m(1.8)} ${m(1.8)} 0 0 ${flip ? 0 : 1} ${m(X(5.8))} ${m(9.3)}`, b),
      Ci(X(1.575), 7.5, 0.23, b),
      Ln(X(1.2), 6.6, X(1.2), 8.4, b),
      Ln(X(0), 0.9, X(3), 0.9, b), Ln(X(0), 14.1, X(3), 14.1, b),
      P(`M${m(X(3))} ${m(0.9)}A${m(6.75)} ${m(6.75)} 0 0 ${flip ? 0 : 1} ${m(X(3))} ${m(14.1)}`, b),
    ]
  }
  return (
    <div className={`pf-multi ${on ? 'drawn' : ''}`} ref={el}>
      <svg viewBox="-6 -6 331 183" aria-hidden="true">
        {R(0, 0, 28, 15, 0)}{Ln(14, 0, 14, 15, 0)}{Ci(14, 7.5, 1.8, 0)}{half(false, 0.3)}{half(true, 0.3)}
      </svg>
    </div>
  )
}

export function PortfolioHero() {
  const { t } = useI18n()
  const items = [
    { href: '#layers', icon: Layers, label: 'Flooring system' },
    { href: '#lighting', icon: Lightbulb, label: 'Lighting' },
    { href: '#fabrication', icon: Hammer, label: 'Fabrication' },
  ]
  const go = (e: React.MouseEvent, href: string) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const words = t('Built layer by layer.').split(' ')
  return (
    <section className="pf-hero">
      <div className="pf-grid" aria-hidden="true" />
      <div className="pf-in">
        <div className="pf-copy">
          <span className="pf-kicker"><i /> {t('Portfolio')}</span>
          <h2>{words.map((w, i) => <span key={i} className={words.length > 1 && i >= words.length - 2 ? 'out' : ''}>{w} </span>)}</h2>
          <p>{t('See how an ISF floor, its lighting and its steelwork go in, in the same order our crews build them.')}</p>
          <ul className="pf-jump">
            {items.map((i) => (
              <li key={i.href}><a href={i.href} onClick={(e) => go(e, i.href)}><i.icon size={16} /> {t(i.label)}</a></li>
            ))}
          </ul>
          <dl className="pf-facts">
            <div><dt>700+</dt><dd>{t('Badminton courts')}</dd></div>
            <div><dt>7</dt><dd>{t('Floor layers')}</dd></div>
            <div><dt>BWF</dt><dd>{t('Approved systems')}</dd></div>
          </dl>
        </div>
        <div className="pf-art"><CourtDrawing /><MultiCourt /></div>
      </div>
    </section>
  )
}

/* -------------------------- Flooring layers -------------------------- */
const LAYER_COPY: Record<string, [string, string]> = {
  slab: ['Concrete slab', 'A level, cured RCC base. Flatness is checked before anything is laid.'],
  membrane: ['Moisture membrane', 'A polythene damp-proof layer that keeps ground moisture away from the timber.'],
  pads: ['Shock pads', 'Rubber pads set on a grid. They give the floor its spring and absorb impact.'],
  battens: ['Battens', 'Treated timber battens carry the load across the pads.'],
  plywood: ['Plywood sub-floor', 'Plywood sheets spread the load and give a flat, stable base.'],
  boards: ['Maple boards', 'Prefinished solid wood boards with a lacquered, anti-slip finish.'],
  markings: ['Court markings', 'Lines are set out to BWF dimensions and sealed under the finish.'],
}

const LAYER_COLOR: Record<string, string> = { slab: '#9aa3a8', membrane: '#2f3f4a', pads: '#4a7bc4', battens: '#c9a26a', plywood: '#d8b887', boards: '#e8c48e', markings: '#ffffff' }

export function LayersSection() {
  const { t } = useI18n()
  const wrap = useRef<HTMLElement>(null)
  const { host, api, stageRef } = useScene((s) => buildFloor(s, 'layers'), [10.6, 6.0, 12.6], [0, 0, 0], { fov: 33, autoRotate: !reducedMotion(), exposure: 1.05, env: 0.55 })
  const [mode, setMode] = useState<'layers' | 'install'>('layers')
  const [shown, setShown] = useState<'layers' | 'install'>('layers')
  const [placed, setPlaced] = useState(false)
  const swapRaf = useRef(0)
  const firstPose = useRef(true)
  const [open, setOpen] = useState(true)
  const target = useRef(0)
  const cur = useRef(0)
  const modeRef = useRef(mode)
  const [hover, setHover] = useState<number | null>(null)
  useEffect(() => { modeRef.current = shown }, [shown])
  useEffect(() => () => cancelAnimationFrame(swapRaf.current), [])
  const run = (phase: 'in' | 'out' | 'side', ms: number, done: () => void) => {
    const t0 = performance.now()
    const tick = (n: number) => {
      const k = Math.min(1, (n - t0) / ms)
      api?.setFall(phase, k)
      if (k < 1) swapRaf.current = requestAnimationFrame(tick)
      else done()
    }
    swapRaf.current = requestAnimationFrame(tick)
  }
  const pick = (m: 'layers' | 'install') => {
    if (m === mode) return
    setMode(m)
    setPlaced(false)
    cancelAnimationFrame(swapRaf.current)
    if (!api || reducedMotion()) { setShown(m); return }
    run('out', 1000, () => setShown(m))
  }
  useEffect(() => {
    if (!api || !stageRef.current) return
    api.setExplode(cur.current)
    stageRef.current.setZoom(1.28 - 0.28 * cur.current)
    stageRef.current.onFrame((dt) => {
      if (modeRef.current !== 'layers') return
      if (Math.abs(target.current - cur.current) > 0.0005) {
        cur.current += (target.current - cur.current) * Math.min(1, dt * 3.4)
        api.setExplode(cur.current)
        stageRef.current!.setZoom(1.28 - 0.28 * cur.current)
      }
    })
  }, [api, stageRef])
  useOnceVisible(wrap, () => { target.current = 1 })
  useEffect(() => { if (api && reducedMotion()) { cur.current = 1; target.current = 1; api.setExplode(1); stageRef.current?.setZoom(1) } }, [api])
  useEffect(() => { api?.highlight(shown === 'layers' ? hover : null) }, [api, hover, shown])
  // Switching tabs re-poses the same floor model: exploded stack for the layers, built-up sequence for the installation.
  useEffect(() => {
    const st = stageRef.current
    if (!api || !st) return
    api.setMode(shown)
    if (shown === 'layers') {
      st.controls.autoRotate = !reducedMotion()
      api.setProgress(1)
      api.setExplode(cur.current)
      st.setZoom(1.28 - 0.28 * cur.current)
    } else {
      st.controls.autoRotate = false
      // always the same viewing angle, so the slab slides in along the axis the build video uses
      st.camera.position.set(10.6, 6.0, 12.6)
      st.controls.target.set(0, 0, 0)
      st.controls.update()
      api.setProgress(reducedMotion() ? 0 : 0.1)
      st.setZoom(1.05)
    }
    if (firstPose.current) { firstPose.current = false; return }
    if (reducedMotion()) { api.setFall(null, 0); setPlaced(true); return }
    // layers drop in from above; only the concrete slab slides in from the sides, and only once it is in place does the build video play
    if (shown === 'layers') run('in', 1100, () => api.setFall(null, 0))
    else run('side', 1200, () => { api.setFall(null, 0); setPlaced(true) })
  }, [api, shown, stageRef])
  const toggle = () => { const n = !open; setOpen(n); target.current = n ? 1 : 0 }
  const active = hover
  return (
    <section id="layers" className="bd-screen" ref={wrap}>
      <CanvasArea host={host}>{shown === 'layers' && <button className="bd-toggle" onClick={toggle}>{open ? t('Assemble') : t('Explode')}</button>}</CanvasArea>
      <div className="container bd-over">
        <Reveal className="bd-copy">
          <span className="bd-eyebrow">01 · {t('The flooring system')}</span>
          <h3>{t('Seven layers between the slab and the game.')}</h3>
          <div className="bd-tabs" role="tablist" aria-label={t('Floor viewer mode')}>
            <button role="tab" aria-selected={mode === 'layers'} onClick={() => pick('layers')}>{t('Flooring system')}</button>
            <button role="tab" aria-selected={mode === 'install'} onClick={() => pick('install')}>{t('Installation')}</button>
          </div>
          <ol className="bl" aria-label={t('Floor layers')}>
            {FLOOR_LAYERS.map((k, i) => (
            <li key={k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} className={active === i ? 'on' : ''} style={{ ['--c' as string]: LAYER_COLOR[k] }}>
                <span className="bl-sw" aria-hidden="true" />
                <span className="bd-n">{String(7 - i).padStart(2, '0')}</span>
                <strong>{t(LAYER_COPY[k][0])}</strong>
                <span className="bl-note"><span>{t(LAYER_COPY[k][1])}</span></span>
            </li>
            ))}
            </ol>
        </Reveal>
      </div>
      {shown === 'install' && <div className="container bd-bottom" style={placed ? { transition: 'opacity .4s' } : { opacity: 0, pointerEvents: 'none' }}><Timeline api={api} steps={INSTALL_STEPS} duration={16} labels={FLOOR_LABELS} wrap={wrap} start={0.1} hold={!placed} /></div>}
    </section>
  )
}

/* --------------------------- Installation labels --------------------------- */
const FLOOR_LABELS: Record<string, string> = { slab: 'Slab', membrane: 'Membrane', pads: 'Shock pads', battens: 'Battens', plywood: 'Plywood', boards: 'Boards', markings: 'Markings' }

/* ----------------------------- Lighting ----------------------------- */
const LIGHT_LABELS: Record<string, string> = { steel: 'Roof steel', hang: 'Fixtures', wire: 'Wiring', on: 'Power on' }

export function LightingSection() {
  const { t } = useI18n()
  const wrap = useRef<HTMLElement>(null)
  const { host, api } = useScene(buildLighting, [10.4, 5.9, 12.2], [0, 1.2, 0], { fov: 33, autoRotate: false, exposure: 1.15, env: 0.3 })
  const specs = ['Even light over the whole court', 'Glare-controlled LED optics', 'Fixtures set beside the court, never over the shuttle', 'Wired and commissioned on site']
  return (
    <section id="lighting" className="bd-screen" ref={wrap}>
      <CanvasArea host={host} />
      <div className="container bd-over">
        <Reveal className="bd-copy">
          <span className="bd-eyebrow">02 · {t('Lighting')}</span>
          <h3>{t('Lighting, installed and switched on.')}</h3>
          <p>{t('In a badminton hall the shuttle flies high, so the LED fixtures hang along both sides of the court, then are wired and commissioned for even, glare-free light.')}</p>
          <ol className="bd-layers bd-speclist">{specs.map((s, i) => <li key={s}><span className="bd-n">{String(i + 1).padStart(2, '0')}</span><strong>{t(s)}</strong></li>)}</ol>
        </Reveal>
      </div>
      <div className="container bd-bottom"><Timeline api={api} steps={LIGHT_STEPS} duration={12} labels={LIGHT_LABELS} wrap={wrap} /></div>
    </section>
  )
}

/* ---------------------------- Fabrication ---------------------------- */
const FAB_LABELS: Record<string, string> = { plates: 'Footings', posts: 'Posts', rails: 'Rails', net: 'Side nets', roof: 'Top net', done: 'Handover' }

export function FabricationSection() {
  const { t } = useI18n()
  const wrap = useRef<HTMLElement>(null)
  const { host, api } = useScene(buildFabrication, [11.6, 6.1, 13.7], [0, 1.4, 0], { fov: 33, autoRotate: false, exposure: 1.05, env: 0.5 })
  const specs = ['Hot-dip galvanised steel posts and rails', 'Bolted base plates on concrete footings', 'Knotless HDPE net, pulled tight on site', 'Built to the size of your turf or court']
  return (
    <section id="fabrication" className="bd-screen alt" ref={wrap}>
      <CanvasArea host={host} />
      <div className="container bd-over">
        <Reveal className="bd-copy">
          <span className="bd-eyebrow">03 · {t('Fabrication')}</span>
          <h3>{t('Steelwork, fabricated and erected on site.')}</h3>
          <p>{t('Galvanised portal frames go up around the court on concrete footings, then the side nets and the top net are pulled tight to keep every shuttle in play.')}</p>
          <ol className="bd-layers bd-speclist">{specs.map((s, i) => <li key={s}><span className="bd-n">{String(i + 1).padStart(2, '0')}</span><strong>{t(s)}</strong></li>)}</ol>
        </Reveal>
      </div>
      <div className="container bd-bottom"><Timeline api={api} steps={FAB_STEPS} duration={11} labels={FAB_LABELS} wrap={wrap} /></div>
    </section>
  )
}
