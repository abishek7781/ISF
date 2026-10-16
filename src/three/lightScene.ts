import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { type Stage, easeOut, easeInOut, seg } from './stage'
import { beamTexture, woodBoard } from './textures'
import { addBadmintonCourt } from './badminton'

export const LIGHT_STEPS = [
  { key: 'steel', a: 0, b: 0.2 }, { key: 'hang', a: 0.2, b: 0.62 }, { key: 'wire', a: 0.62, b: 0.72 }, { key: 'on', a: 0.72, b: 1 },
] as const

export type SceneApi = { setProgress: (t: number) => void; dispose: () => void }

const L = 9, W = 5.4, SL = 0.12, RIG_H = 3.4, FIX_Y = 2.85

/** One badminton court on a sprung floor with an overhead steel rig. Two rows of linear LED battens hang along the sides of the court, then power on. */
export function buildLighting(stage: Stage): SceneApi {
  const scene = stage.scene
  const hemi = new THREE.HemisphereLight(0xbcd2ff, 0x1a1208, 0.25)
  scene.add(hemi)
  const moon = new THREE.DirectionalLight(0xa9c4ff, 0.7); moon.position.set(-5, 9, 7); moon.castShadow = true
  moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.02
  scene.add(moon)
  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.ShadowMaterial({ opacity: 0.45 }))
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; ground.receiveShadow = true; scene.add(ground)

  // the floor: a wooden court slab, nothing else in the scene
  const wood = woodBoard(61, 0); wood.map.repeat.set(1, 8); wood.bump.repeat.set(1, 8)
  const floorTop = new THREE.MeshPhysicalMaterial({ map: wood.map, bumpMap: wood.bump, bumpScale: 0.8, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.1 })
  const side = new THREE.MeshStandardMaterial({ color: 0x6b4f30, roughness: 0.8 })
  const slab = new THREE.Mesh(new RoundedBoxGeometry(L, SL, W, 3, 0.012), [side, side, floorTop, side, side, side])
  slab.position.y = SL / 2; slab.castShadow = true; slab.receiveShadow = true; scene.add(slab)
  const root = new THREE.Group(); root.position.y = SL; scene.add(root)
  addBadmintonCourt(root, { scale: 0.6, y: 0.002 })

  const steel = new THREE.MeshStandardMaterial({ color: 0x8e969e, metalness: 0.9, roughness: 0.38 })
  const sh = <T extends THREE.Mesh>(m: T): T => { m.castShadow = true; m.receiveShadow = true; return m }
  const posts = [[-L / 2 + 0.2, -W / 2 + 0.2], [L / 2 - 0.2, -W / 2 + 0.2], [-L / 2 + 0.2, W / 2 - 0.2], [L / 2 - 0.2, W / 2 - 0.2]].map(([x, z]) => {
    const g = new THREE.Group(); g.position.set(x, SL, z); scene.add(g)
    const pl = sh(new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.03, 0.3, 2, 0.006), steel)); pl.position.y = 0.015; g.add(pl)
    const p = sh(new THREE.Mesh(new RoundedBoxGeometry(0.13, RIG_H, 0.13, 2, 0.01), steel)); p.geometry.translate(0, RIG_H / 2, 0); p.position.y = 0.03; g.add(p)
    return p
  })
  const beams = [-W / 2 + 0.2, W / 2 - 0.2].map((z) => {
    const g = new THREE.Group(); g.position.set(-L / 2 + 0.2, SL + RIG_H + 0.03, z); scene.add(g)
    const bm = sh(new THREE.Mesh(new RoundedBoxGeometry(L - 0.4, 0.2, 0.13, 2, 0.012), steel)); bm.position.x = (L - 0.4) / 2; g.add(bm)
    return g
  })
  const cross = [-L / 2 + 0.2, L / 2 - 0.2].map((x) => { const c = sh(new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.14, W - 0.4, 2, 0.01), steel)); c.position.set(x, SL + RIG_H + 0.03, 0); scene.add(c); return c })

  const beam = beamTexture()
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x23272c, metalness: 0.85, roughness: 0.34 })
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xc8ced4, metalness: 1, roughness: 0.25 })
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.7 })
  type Fix = { g: THREE.Group; lens: THREE.MeshStandardMaterial; light: THREE.SpotLight; cone: THREE.Mesh; rods: THREE.Mesh[] }
  const fixes: Fix[] = []
  const top = SL + RIG_H - 0.07
  ;[-W / 2 + 0.55, W / 2 - 0.55].forEach((z) => [-3.3, -1.1, 1.1, 3.3].forEach((x) => {
    const g = new THREE.Group(); g.position.set(x, SL + FIX_Y, z); scene.add(g)
    const body = sh(new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.1, 0.2, 3, 0.03), housingMat)); g.add(body)
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, emissive: 0xfff0d6, emissiveIntensity: 0, roughness: 0.3 })
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.14), lensMat); lens.rotation.x = Math.PI / 2; lens.position.y = -0.052; g.add(lens)
    const rods = [-0.65, 0.65].map((dx) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), rodMat); r.position.set(dx, 0, 0); g.add(r); return r })
    const light = new THREE.SpotLight(0xfff1dc, 0, 9, 1.0, 0.85, 1.5)
    light.position.set(0, -0.1, 0); const tgt = new THREE.Object3D(); tgt.position.set(0, -FIX_Y, -z * 0.45); g.add(tgt); light.target = tgt; g.add(light)
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, FIX_Y, 36, 1, true), new THREE.MeshBasicMaterial({ map: beam, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
    cone.position.y = -FIX_Y / 2 - 0.06; g.add(cone)
    fixes.push({ g, lens: lensMat, light, cone, rods })
  }))
  void top
  const cables = [-W / 2 + 0.2, W / 2 - 0.2].map((z) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), cableMat); c.geometry.translate(0, 0.5, 0); c.rotation.z = -Math.PI / 2; c.position.set(-L / 2 + 0.3, SL + RIG_H - 0.12, z + (z > 0 ? -0.1 : 0.1)); scene.add(c); return c })

  const setProgress = (t: number) => {
    const s0 = seg(t, 0, 0.2)
    posts.forEach((p, i) => { const q = easeOut(seg(s0, i * 0.12, i * 0.12 + 0.5)); p.visible = q > 0; p.scale.y = Math.max(0.001, q) })
    beams.forEach((b, i) => { const q = easeInOut(seg(s0, 0.45 + i * 0.1, 0.9 + i * 0.1)); b.visible = q > 0; b.scale.x = Math.max(0.001, q) })
    cross.forEach((c, i) => { const q = easeOut(seg(s0, 0.6 + i * 0.1, 1)); c.visible = q > 0; c.scale.set(1, 1, Math.max(0.001, q)) })
    const hang = seg(t, 0.2, 0.62)
    fixes.forEach((f, i) => {
      const q = easeInOut(seg(hang, (i / fixes.length) * 0.7, (i / fixes.length) * 0.7 + 0.3))
      f.g.visible = q > 0
      const y0 = SL + RIG_H - 0.07
      const y = y0 + (SL + FIX_Y - y0) * q
      f.g.position.y = y
      const len = Math.max(0.01, y0 - y)
      f.rods.forEach((r) => { r.scale.y = len; r.position.y = len / 2 + 0.05 })
    })
    const w = easeOut(seg(t, 0.62, 0.72))
    cables.forEach((c) => { c.visible = w > 0; c.scale.y = Math.max(0.001, w * (L - 0.6)) })
    const on = easeOut(seg(t, 0.72, 1))
    fixes.forEach((f) => {
      f.light.intensity = 26 * on
      f.lens.emissiveIntensity = 3.2 * on
      ;(f.cone.material as THREE.MeshBasicMaterial).opacity = 0.1 * on
    })
    hemi.intensity = 0.18 + 0.12 * on
    stage.scene.environmentIntensity = 0.12 + 0.2 * on
  }
  setProgress(1)
  return { setProgress, dispose: () => { beam.dispose() } }
}
