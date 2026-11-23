import { useEffect, useRef } from 'react'
import { Reveal } from './ui'
import { useI18n } from '../i18n'
import landTopology from 'world-atlas/land-110m.json'
import countriesTopology from 'world-atlas/countries-110m.json'
import { feature } from 'topojson-client'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { geoOrthographic, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'

type Place = { name: string; lat: number; lon: number }

// Kept in lockstep with the five destination cards in Reach.
const LOCATIONS: Place[] = [
  { name: 'Chennai, India', lat: 13.08, lon: 80.27 },
  { name: 'Andaman & Nicobar Islands', lat: 11.74, lon: 92.66 },
  { name: 'Baoding, China', lat: 38.87, lon: 115.46 },
  { name: 'United States', lat: 39.83, lon: -98.58 },
  { name: 'Thailand', lat: 15.87, lon: 100.99 },
]

const rad = (value: number) => value * Math.PI / 180

const land = (feature(landTopology as never, landTopology.objects.land as never) as unknown as FeatureCollection<Polygon | MultiPolygon>).features[0]
const countries = feature(countriesTopology as never, countriesTopology.objects.countries as never) as unknown as FeatureCollection<Polygon | MultiPolygon>
const FLAG_COUNTRIES = new Map([['356', 'in'], ['156', 'cn'], ['840', 'us'], ['764', 'th']])
const flaggedCountries = countries.features.flatMap((country) => {
  const flag = FLAG_COUNTRIES.get(String(country.id))
  return flag ? [{ country, flag }] : []
})

function point(lat: number, lon: number, yaw: number, pitch: number): [number, number, number] {
  const la = rad(lat), lo = rad(lon) + yaw
  const x = Math.cos(la) * Math.sin(lo)
  const y = Math.sin(la)
  const z = Math.cos(la) * Math.cos(lo)
  return [x, y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)]
}

/** An interactive 3D globe using Natural Earth land geometry. */
export default function ProjectGlobe() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { t } = useI18n()

  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const context = element.getContext('2d')
    if (!context) return
    let frame = 0
    let width = 0, height = 0, dpr = 1
    let yaw = -.8, pitch = -.18, velocityYaw = 0
    let dragging = false, pointerId: number | null = null
    let lastX = 0, lastY = 0, lastTime = performance.now()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const flagImages = new Map<string, HTMLImageElement>()
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight
      dpr = Math.min(devicePixelRatio || 1, 2)
      element.width = Math.round(width * dpr); element.height = Math.round(height * dpr)
    }
    const render = (time = 0) => {
      const elapsed = Math.min(time - lastTime, 48)
      lastTime = time
      if (!dragging && !reduce) {
        yaw += .000075 * elapsed + velocityYaw
        velocityYaw *= .92
      }
      const dark = document.documentElement.dataset.theme === 'dark'
      const cx = width / 2, cy = height / 2
      const radius = Math.min(width * .38, height * .43)
      const projection = geoOrthographic()
        .translate([cx, cy])
        .scale(radius)
        .rotate([yaw * 180 / Math.PI, pitch * 180 / Math.PI])
        .clipAngle(90)
        .precision(.35)
      const landPath = geoPath(projection, context)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const glow = context.createRadialGradient(cx, cy, radius * .15, cx, cy, radius * 1.2)
      glow.addColorStop(0, dark ? 'rgba(99,229,59,.20)' : 'rgba(63,158,69,.14)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = glow; context.fillRect(0, 0, width, height)
      context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.fillStyle = dark ? 'rgba(32,112,190,.50)' : 'rgba(73,157,224,.50)'; context.fill()
      context.strokeStyle = dark ? 'rgba(190,222,255,.24)' : 'rgba(14,36,71,.22)'; context.lineWidth = 1; context.stroke()
      // Soft contact shadow grounds the globe against the section background.
      const shadow = context.createRadialGradient(cx, cy + radius * .92, radius * .04, cx, cy + radius * .92, radius * .72)
      shadow.addColorStop(0, dark ? 'rgba(0,0,0,.42)' : 'rgba(14,36,71,.20)')
      shadow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = shadow
      context.beginPath(); context.ellipse(cx, cy + radius * 1.02, radius * .63, radius * .10, 0, 0, Math.PI * 2); context.fill()
      // Subtle latitude lines make the spherical surface legible without decorative dots.
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        context.beginPath()
        let visible = false
        for (let longitude = -180; longitude <= 180; longitude += 3) {
          const [x, y, z] = point(latitude, longitude, yaw, pitch)
          if (z <= 0) { visible = false; continue }
          const px = cx + x * radius, py = cy - y * radius
          if (!visible) { context.moveTo(px, py); visible = true } else context.lineTo(px, py)
        }
        context.strokeStyle = dark ? 'rgba(194,220,250,.08)' : 'rgba(14,36,71,.06)'
        context.lineWidth = .6; context.stroke()
      }
      // Canonical Natural Earth land geometry, correctly clipped at the globe horizon.
      context.save()
      context.beginPath()
      landPath(land as GeoPermissibleObjects)
      context.fillStyle = dark ? 'rgba(70,166,78,.78)' : 'rgba(63,158,69,.62)'
      context.shadowColor = dark ? 'rgba(122,232,59,.22)' : 'rgba(47,127,53,.15)'
      context.shadowBlur = radius * .035
      context.fill()
      context.shadowBlur = 0
      context.strokeStyle = dark ? 'rgba(207,255,211,.9)' : 'rgba(20,96,42,.88)'
      context.lineWidth = .8
      context.stroke()
      context.restore()
      const projected = LOCATIONS.map((location) => ({ ...location, p: point(location.lat, location.lon, yaw, pitch) }))
      projected.forEach((location) => {
        if (location.p[2] < 0) return
        const x = cx + location.p[0] * radius, y = cy - location.p[1] * radius
        context.beginPath(); context.arc(x, y, 3.2, 0, Math.PI * 2)
        context.fillStyle = dark ? '#80D5FF' : '#1769D2'; context.fill()
        context.strokeStyle = dark ? '#071426' : '#fff'; context.lineWidth = 1.3; context.stroke()
      })
      // One continuous flag image per country, clipped to the exact country outline.
      flaggedCountries.forEach(({ country, flag }) => {
        const image = flagImages.get(flag)
        if (!image?.complete || !image.naturalWidth) return
        const [[x0, y0], [x1, y1]] = landPath.bounds(country as GeoPermissibleObjects)
        if (!Number.isFinite(x0) || !Number.isFinite(y0) || x1 <= x0 || y1 <= y0) return
        context.save()
        context.beginPath()
        landPath(country as GeoPermissibleObjects)
        context.clip()
        // Fill the currently visible country footprint with one non-repeating image.
        // Clipping follows the real outline, so the flag never spills into neighbours.
        const boxWidth = x1 - x0, boxHeight = y1 - y0
        const scale = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight)
        const drawWidth = image.naturalWidth * scale, drawHeight = image.naturalHeight * scale
        context.drawImage(image, x0 + (boxWidth - drawWidth) / 2, y0 + (boxHeight - drawHeight) / 2, drawWidth, drawHeight)
        context.restore()
        context.beginPath(); landPath(country as GeoPermissibleObjects)
        context.strokeStyle = dark ? 'rgba(236,255,238,.92)' : 'rgba(20,96,42,.9)'; context.lineWidth = .85; context.stroke()
      })
      if (!reduce) frame = requestAnimationFrame(render)
    }
    const onPointerDown = (event: PointerEvent) => {
      dragging = true; pointerId = event.pointerId
      lastX = event.clientX; lastY = event.clientY
      velocityYaw = 0
      element.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return
      const dx = event.clientX - lastX
      const nextYaw = dx * .009
      yaw += nextYaw
      velocityYaw = nextYaw
      lastX = event.clientX
    }
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      dragging = false; pointerId = null
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerEnd)
    element.addEventListener('pointercancel', onPointerEnd)
    ;['in', 'cn', 'us', 'th'].forEach((flag) => {
      const image = new Image()
      image.src = `/assets/flags/${flag}.svg`
      // Animated globes pick this up on the next frame; reduced-motion mode needs one repaint.
      image.onload = () => { if (reduce) render(performance.now()) }
      flagImages.set(flag, image)
    })
    const observer = new ResizeObserver(() => { resize(); render() })
    observer.observe(element); resize(); render()
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame)
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerEnd)
      element.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [])

  return <Reveal className="project-globe"><canvas ref={canvas} role="img" aria-label={t('Global map of our project locations')} /></Reveal>
}
