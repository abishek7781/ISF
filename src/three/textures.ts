import * as THREE from 'three'
import { concrete_, plywood_, turf_, woodBoard_, type Raw, type RawPbr } from './texGen'

export type Pbr = { map: THREE.Texture; bump: THREE.Texture }

function toTexture(r: Raw): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = r.w; c.height = r.h
  c.getContext('2d')!.putImageData(new ImageData(r.data as Uint8ClampedArray<ArrayBuffer>, r.w, r.h), 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = r.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = 8
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}
const build = (p: RawPbr): Pbr => ({ map: toTexture(p.map), bump: toTexture(p.bump) })

/** Vertical alpha gradient used for volumetric light cones. */
export function beamTexture() {
  const c = document.createElement('canvas')
  c.width = 4; c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, 'rgba(255,244,222,0.9)')
  grad.addColorStop(0.5, 'rgba(255,240,215,0.28)')
  grad.addColorStop(1, 'rgba(255,238,210,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const cache = new Map<string, Pbr>()
// Textures are generated once (ideally in a worker while the loader is showing); each caller gets cheap clones sharing the same pixels.
const memo = (k: string, f: () => RawPbr): Pbr => {
  let v = cache.get(k)
  if (!v) { v = build(f()); cache.set(k, v) }
  const m = v.map.clone(); const b = v.bump.clone()
  m.needsUpdate = true; b.needsUpdate = true
  return { map: m, bump: b }
}
/** Store a texture pair that a worker has already generated. */
export const prime = (k: string, p: RawPbr) => { if (!cache.has(k)) cache.set(k, build(p)) }
export const woodBoard = (seed: number, tone: number) => memo(`w${seed}:${tone}`, () => woodBoard_(seed, tone))
export const concrete = () => memo('c', concrete_)
export const plywood = () => memo('p', plywood_)
export const turf = () => memo('t', turf_)
