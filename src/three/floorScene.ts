import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { type Stage, easeOut, seg } from './stage'
import { concrete, plywood, woodBoard } from './textures'

export const FLOOR_LAYERS = ['slab', 'membrane', 'pads', 'battens', 'plywood', 'boards', 'markings'] as const
export const INSTALL_STEPS = [
  { key: 'slab', a: 0, b: 0.1 }, { key: 'membrane', a: 0.1, b: 0.22 }, { key: 'pads', a: 0.22, b: 0.36 }, { key: 'battens', a: 0.36, b: 0.48 },
  { key: 'plywood', a: 0.48, b: 0.62 }, { key: 'boards', a: 0.62, b: 0.88 }, { key: 'markings', a: 0.88, b: 1 },
] as const

export type FloorApi = {
  setExplode: (v: number) => void
  setProgress: (t: number) => void
  setMode: (m: 'layers' | 'install') => void
  setFall: (phase: 'in' | 'out' | 'side' | null, t: number) => void
  highlight: (i: number | null) => void
  dispose: () => void
}

const L = 6.4
const D = 4.2
const H = [0.34, 0.016, 0.12, 0.09, 0.08, 0.06, 0.004]
const YS = H.reduce<number[]>((a, h, i) => { a.push(i === 0 ? 0 : a[i - 1] + H[i - 1]); return a }, [])

export function buildFloor(stage: Stage, initialMode: 'layers' | 'install'): FloorApi {
  let mode = initialMode
  const scene = stage.scene
  const key = new THREE.DirectionalLight(0xfff0dd, 2.8)
  key.position.set(5, 9, 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 })
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  key.shadow.radius = 5
  const rim = new THREE.DirectionalLight(0x9ec6ff, 1.1)
  rim.position.set(-6, 4, -5)
  scene.add(key, rim)

  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.ShadowMaterial({ opacity: 0.42 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.002
  ground.receiveShadow = true
  scene.add(ground)

  const rep = (p: { map: THREE.Texture; bump: THREE.Texture }, x: number, y: number) => { [p.map, p.bump].forEach((t) => t.repeat.set(x, y)); return p }
  const conc = rep(concrete(), 3, 2)
  const ply = rep(plywood(), 1.5, 1.5)
  const pine = rep(woodBoard(33, -3), 1, 1)
  const boardTex = [0, 1, 2, 3].map((i) => woodBoard(40 + i * 7, (i % 3) - 1))

  const mats = {
    slab: new THREE.MeshStandardMaterial({ map: conc.map, bumpMap: conc.bump, bumpScale: 1.4, roughness: 0.95, metalness: 0 }),
    membrane: new THREE.MeshPhysicalMaterial({ color: 0x2c74c4, roughness: 0.22, metalness: 0, clearcoat: 0.8, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    pads: new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.85 }),
    battens: new THREE.MeshStandardMaterial({ map: pine.map, bumpMap: pine.bump, bumpScale: 0.6, roughness: 0.72 }),
    plywood: new THREE.MeshStandardMaterial({ map: ply.map, bumpMap: ply.bump, bumpScale: 0.5, roughness: 0.7 }),
    boards: boardTex.map((t) => new THREE.MeshPhysicalMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 0.9, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 })),
    lines: new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.5 }),
  }

  const G = FLOOR_LAYERS.map(() => { const g = new THREE.Group(); scene.add(g); return g })
  const shade = <T extends THREE.Mesh | THREE.InstancedMesh>(m: T): T => { m.castShadow = true; m.receiveShadow = true; return m }

  // 0 slab (origin at its base so it can grow upward)
  const slabGeo = new RoundedBoxGeometry(L, H[0], D, 3, 0.012); slabGeo.translate(0, H[0] / 2, 0)
  const slab = shade(new THREE.Mesh(slabGeo, mats.slab)); G[0].add(slab)
  // 1 membrane
  const memW = L - 0.1
  const membrane = shade(new THREE.Mesh(new THREE.BoxGeometry(memW, H[1], D - 0.1), mats.membrane)); membrane.position.y = H[1] / 2; G[1].add(membrane)
  const roll = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, D - 0.1, 32), mats.membrane)); roll.rotation.x = Math.PI / 2; roll.visible = false; G[1].add(roll)
  // 2 shock pads
  const xs = Array.from({ length: 8 }, (_, i) => -2.8 + i * 0.8)
  const zs = Array.from({ length: 7 }, (_, j) => -1.8 + j * 0.6)
  const padPos: THREE.Vector3[] = []
  xs.forEach((x) => zs.forEach((z) => padPos.push(new THREE.Vector3(x, H[2] / 2, z))))
  const pads = shade(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.105, H[2], 28), mats.pads, padPos.length)); G[2].add(pads)
  const dummy = new THREE.Object3D()
  const setPad = (i: number, dy: number, s: number) => { dummy.position.set(padPos[i].x, padPos[i].y + dy, padPos[i].z); dummy.scale.setScalar(s); dummy.updateMatrix(); pads.setMatrixAt(i, dummy.matrix) }
  padPos.forEach((_, i) => setPad(i, 0, 1))
  // 3 battens
  const battens = zs.map((z) => { const m = shade(new THREE.Mesh(new RoundedBoxGeometry(L - 0.2, H[3], 0.1, 2, 0.008), mats.battens)); m.position.set(0, H[3] / 2, z); G[3].add(m); return m })
  // 4 plywood
  const panels = [-1, 1].map((s) => { const m = shade(new THREE.Mesh(new RoundedBoxGeometry(3.12, H[4], D - 0.2, 2, 0.01), mats.plywood)); m.position.set(s * 1.58, H[4] / 2, 0); G[4].add(m); return m })
  // 5 boards
  const nb = 15
  const boards = Array.from({ length: nb }, (_, i) => {
    const m = shade(new THREE.Mesh(new RoundedBoxGeometry(L - 0.1, H[5], 0.268, 2, 0.006), mats.boards[i % 4]))
    m.position.set(0, H[5] / 2, -1.96 + i * 0.28); G[5].add(m); return m
  })
  // 6 court markings (badminton court, simplified)
  const lines: THREE.Mesh[] = []
  const addLine = (x1: number, z1: number, x2: number, z2: number) => {
    const len = Math.hypot(x2 - x1, z2 - z1)
    const geo = new THREE.BoxGeometry(len, 0.006, 0.04); geo.translate(len / 2, 0, 0)
    const m = new THREE.Mesh(geo, mats.lines); m.receiveShadow = true
    m.position.set(x1, 0.003, z1); m.rotation.y = -Math.atan2(z2 - z1, x2 - x1); G[6].add(m); lines.push(m)
  }
  const cx = 2.8, cz = 1.27
  addLine(-cx, -cz, cx, -cz); addLine(cx, -cz, cx, cz); addLine(cx, cz, -cx, cz); addLine(-cx, cz, -cx, -cz)
  addLine(-cx, -cz + 0.19, cx, -cz + 0.19); addLine(-cx, cz - 0.19, cx, cz - 0.19)
  addLine(0, -cz, 0, cz)
  ;[-0.83, 0.83].forEach((x) => addLine(x, -cz, x, cz))
  ;[-1, 1].forEach((s) => addLine(s * 0.83, 0, s * cx, 0))
  ;[-1, 1].forEach((s) => addLine(s * (cx - 0.32), -cz, s * (cx - 0.32), cz))

  const roll0 = roll
  const gap = 0.7

  // In the layers view the whole stack is kept centred on y = 0 whether it is assembled or exploded.
  const setExplode = (v: number) => {
    const top = YS[6] + H[6] + 6 * gap * v
    const c = mode === 'layers' ? top / 2 : 0
    G.forEach((g, i) => { g.position.y = YS[i] + i * gap * v - c })
    ground.position.y = -0.002 - c
    G.forEach((g) => { g.visible = true })
    lastPose = () => setExplode(v)
    applyFall()
  }
  // Mode switch: layers spin up and away ('out') or spin and drop in from above ('in'), staggered.
  let fall: { phase: 'in' | 'out' | 'side'; t: number } | null = null
  let lastPose: () => void = () => {}
  const applyFall = () => {
    G.forEach((g, i) => {
      if (!fall) { g.rotation.y = 0; g.position.x = 0; return }
      if (fall.phase === 'side') {
        const q = seg(fall.t, i / 12, i / 12 + 0.5)
        g.rotation.y = 0
        g.position.x = (1 - easeOut(q)) * (i % 2 ? 9 : -9)
        if (q <= 0) g.visible = false
        return
      }
      g.position.x = 0
      if (fall.phase === 'in') {
        const q = seg(fall.t, i / 12, i / 12 + 0.5)
        g.position.y += (1 - easeOut(q)) * 3.4
        g.rotation.y = -(1 - easeOut(q)) * Math.PI / 2
        if (q <= 0) g.visible = false
      } else {
        const q = seg(fall.t, (6 - i) / 12, (6 - i) / 12 + 0.5)
        g.position.y += q * q * 9
        g.rotation.y = q * Math.PI / 2
        if (q >= 1) g.visible = false
      }
    })
  }
  const setFall = (phase: 'in' | 'out' | 'side' | null, t: number) => {
    fall = phase ? { phase, t } : null
    lastPose()
    if (!phase) G.forEach((g) => { g.rotation.y = 0; g.position.x = 0 })
  }
  const finish = (k: number) => mats.boards.forEach((m) => { m.clearcoat = 0.1 + 0.9 * k })
  setExplode(mode === 'layers' ? 1 : 0)

  const setProgress = (t: number) => {
    G.forEach((g, i) => { g.position.y = YS[i] })
    ground.position.y = -0.002
    const s0 = seg(t, 0, 0.1)
    G[0].visible = s0 > 0; slab.scale.y = Math.max(0.001, easeOut(s0))
    const s1 = seg(t, 0.1, 0.22)
    G[1].visible = s1 > 0
    const sx = Math.max(0.001, s1 < 1 ? s1 * s1 * (3 - 2 * s1) : 1)
    membrane.scale.x = sx; membrane.position.x = -memW / 2 + (memW / 2) * sx
    roll0.visible = s1 > 0 && s1 < 1
    roll0.position.set(-memW / 2 + memW * sx, 0.09, 0)
    roll0.rotation.set(Math.PI / 2, 0, 0)
    roll0.scale.setScalar(0.35 + 0.65 * (1 - s1))
    const s2 = seg(t, 0.22, 0.36)
    G[2].visible = s2 > 0
    padPos.forEach((_, i) => { const st = i / (padPos.length - 1); const q = seg(s2, st * 0.65, st * 0.65 + 0.35); setPad(i, (1 - easeOut(q)) * 1.2, q > 0 ? 1 : 0.0001) })
    pads.instanceMatrix.needsUpdate = true
    const s3 = seg(t, 0.36, 0.48)
    G[3].visible = s3 > 0
    battens.forEach((m, j) => { const q = seg(s3, (j / 7) * 0.6, (j / 7) * 0.6 + 0.4); m.visible = q > 0; m.position.z = zs[j] + (1 - easeOut(q)) * 3.4 })
    const s4 = seg(t, 0.48, 0.62)
    G[4].visible = s4 > 0
    panels.forEach((m, k) => { const q = seg(s4, k * 0.45, k * 0.45 + 0.55); m.visible = q > 0; m.position.y = H[4] / 2 + (1 - easeOut(q)) * 1.7; m.rotation.z = (1 - q) * (k ? 0.1 : -0.1) })
    const s5 = seg(t, 0.62, 0.88)
    G[5].visible = s5 > 0
    boards.forEach((m, i) => { const q = seg(s5, (i / nb) * 0.78, (i / nb) * 0.78 + 0.22); m.visible = q > 0; m.position.y = H[5] / 2 + (1 - easeOut(q)) * 1.1; m.rotation.z = (1 - q) * (i % 2 ? 0.06 : -0.06) })
    const s6 = seg(t, 0.88, 1)
    G[6].visible = s6 > 0
    lines.forEach((m, l) => { const q = seg(s6, (l / lines.length) * 0.7, (l / lines.length) * 0.7 + 0.3); m.visible = q > 0; m.scale.x = Math.max(0.001, q) })
    finish(seg(t, 0.86, 1))
    lastPose = () => setProgress(t)
    applyFall()
  }

  const all: THREE.MeshStandardMaterial[][] = [[mats.slab], [mats.membrane], [mats.pads], [mats.battens], [mats.plywood], mats.boards, [mats.lines]]
  // Hovering a layer in the list paints it dark red and glossy; leaving restores its own finish.
  const saved = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; rough: number; coat?: number; coatRough?: number; metal: number }>()
  const restore = () => {
    saved.forEach((v, m) => {
      m.color.copy(v.color); m.roughness = v.rough; m.metalness = v.metal; m.emissive.set(0x000000); m.emissiveIntensity = 0
      const p = m as THREE.MeshPhysicalMaterial
      if (v.coat !== undefined) { p.clearcoat = v.coat; p.clearcoatRoughness = v.coatRough! }
    })
    saved.clear()
  }
  const highlight = (i: number | null) => {
    restore()
    if (i === null) return
    all[i].forEach((m) => {
      const p = m as THREE.MeshPhysicalMaterial
      saved.set(m, { color: m.color.clone(), rough: m.roughness, metal: m.metalness, coat: p.isMeshPhysicalMaterial ? p.clearcoat : undefined, coatRough: p.isMeshPhysicalMaterial ? p.clearcoatRoughness : undefined })
      m.color.set(0xb3121f); m.roughness = 0.12; m.metalness = 0.1
      m.emissive.set(0x3a0008); m.emissiveIntensity = 0.6
      if (p.isMeshPhysicalMaterial) { p.clearcoat = 1; p.clearcoatRoughness = 0.04 }
    })
  }

  return {
    setExplode, setProgress, highlight, setFall, setMode: (m) => { mode = m },
    dispose: () => {},
  }
}
