import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { type Stage, easeOut, easeOutBack, seg } from './stage'
import type { SceneApi } from './lightScene'
import { addBadmintonCourt } from './badminton'

export const FAB_STEPS = [
  { key: 'plates', a: 0, b: 0.12 }, { key: 'posts', a: 0.12, b: 0.32 }, { key: 'rails', a: 0.32, b: 0.5 },
  { key: 'net', a: 0.5, b: 0.76 }, { key: 'roof', a: 0.76, b: 0.94 }, { key: 'done', a: 0.94, b: 1 },
] as const

const L = 10, W = 5.2, H = 3.4

/** A netted enclosure around a badminton court: portal frames on footings, rails and bracing, side nets, then the top net. */
export function buildFabrication(stage: Stage): SceneApi {
  const scene = stage.scene
  const sun = new THREE.DirectionalLight(0xfff1de, 3)
  sun.position.set(7, 10, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 36 })
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5
  scene.add(sun, new THREE.HemisphereLight(0xbcd8ff, 0x2a3a1a, 0.5))

  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.ShadowMaterial({ opacity: 0.4 }))
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; ground.receiveShadow = true; scene.add(ground)
  // a concrete pad is the only thing the cage stands on
  const SLAB = 0.14
  const pad = new THREE.Mesh(new RoundedBoxGeometry(L + 1.2, SLAB, W + 1.2, 3, 0.02), new THREE.MeshStandardMaterial({ color: 0x8f9296, roughness: 0.95 }))
  pad.position.y = SLAB / 2; pad.castShadow = true; pad.receiveShadow = true; scene.add(pad)
  const root = new THREE.Group(); root.position.y = SLAB; scene.add(root)
  const court = addBadmintonCourt(root, { scale: 0.7, y: 0.032, apron: 0x2f5fa5, surface: 0x3a8a58, apronPad: 0.6 })
  court.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true })

  const steel = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.95, roughness: 0.32 })
  const bolt = new THREE.MeshStandardMaterial({ color: 0x6d7379, metalness: 1, roughness: 0.3 })
  const conc = new THREE.MeshStandardMaterial({ color: 0x9a9da1, roughness: 0.95 })
  const netMat = new THREE.MeshStandardMaterial({ color: 0xeef2f4, roughness: 0.6, metalness: 0.1 })
  const sh = <T extends THREE.Mesh>(m: T): T => { m.castShadow = true; m.receiveShadow = true; return m }

  const xs = [-5, -2.5, 0, 2.5, 5]
  const zs = [-W / 2, W / 2]
  const footings: { g: THREE.Group }[] = []
  const posts: THREE.Mesh[] = []
  xs.forEach((x) => zs.forEach((z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z)
    const f = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.1, 24), conc)); f.position.y = 0.05; g.add(f)
    const pl = sh(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.03, 0.34, 2, 0.006), steel)); pl.position.y = 0.115; g.add(pl)
    ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const b1 = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 6), bolt)); b1.position.set(a * 0.12, 0.147, b * 0.12); g.add(b1) })
    root.add(g); footings.push({ g })
    const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, H, 28), steel)); m.geometry.translate(0, H / 2, 0); m.position.set(x, 0.13, z); root.add(m); posts.push(m)
  }))

  type Rail = { m: THREE.Mesh }
  const railOf = (from: THREE.Vector3, to: THREE.Vector3, r: number): Rail => {
    const len = from.distanceTo(to)
    const geo = new THREE.CylinderGeometry(r, r, len, 18); geo.translate(0, len / 2, 0)
    const m = sh(new THREE.Mesh(geo, steel)); m.position.copy(from)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()); root.add(m); return { m }
  }
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  const rails: Rail[] = []
  xs.forEach((x) => rails.push(railOf(V(x, H + 0.13, -W / 2), V(x, H + 0.13, W / 2), 0.032)))
  ;[-W / 2, 0, W / 2].forEach((z) => rails.push(railOf(V(-L / 2, H + 0.13, z), V(L / 2, H + 0.13, z), 0.03)))
  ;[-W / 2, W / 2].forEach((z) => rails.push(railOf(V(-L / 2, H / 2 + 0.13, z), V(L / 2, H / 2 + 0.13, z), 0.026)))
  ;[-W / 2, W / 2].forEach((z) => { rails.push(railOf(V(-5, 0.2, z), V(-2.5, H + 0.1, z), 0.016)); rails.push(railOf(V(5, 0.2, z), V(2.5, H + 0.1, z), 0.016)) })

  type Strand = { a: THREE.Vector3; b: THREE.Vector3; order: number; roof: boolean; q?: THREE.Quaternion; len?: number }
  const strands: Strand[] = []
  const step = 0.14
  const face = (o: THREE.Vector3, u: THREE.Vector3, ulen: number, v: THREE.Vector3, vlen: number, base: number, roof: boolean) => {
    const nu = Math.round(ulen / step), nv = Math.round(vlen / step)
    for (let i = 0; i <= nu; i++) strands.push({ a: o.clone().addScaledVector(u, (i / nu) * ulen).addScaledVector(v, vlen), b: o.clone().addScaledVector(u, (i / nu) * ulen), order: base + (i / nu) * 0.5, roof })
    for (let j = 0; j <= nv; j++) strands.push({ a: o.clone().addScaledVector(v, (j / nv) * vlen), b: o.clone().addScaledVector(v, (j / nv) * vlen).addScaledVector(u, ulen), order: base + 0.5 + (1 - j / nv) * 0.5, roof })
  }
  const Y = new THREE.Vector3(0, 1, 0)
  const y0 = 0.14, hh = H - 0.01
  face(V(-L / 2, y0, W / 2), V(1, 0, 0), L, Y, hh, 0, false)
  face(V(L / 2, y0, W / 2), V(0, 0, -1), W, Y, hh, 1, false)
  face(V(L / 2, y0, -W / 2), V(-1, 0, 0), L, Y, hh, 2, false)
  face(V(-L / 2, y0, -W / 2), V(0, 0, 1), W, Y, hh, 3, false)
  face(V(-L / 2, H + 0.13, -W / 2), V(1, 0, 0), L, V(0, 0, 1), W, 0, true)
  const maxSide = Math.max(...strands.filter((s) => !s.roof).map((s) => s.order))
  const maxRoof = Math.max(...strands.filter((s) => s.roof).map((s) => s.order))
  const strandGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 1, 5); strandGeo.translate(0, 0.5, 0)
  const net = new THREE.InstancedMesh(strandGeo, netMat, strands.length); net.castShadow = true; root.add(net)
  const d = new THREE.Object3D()
  const tmp = new THREE.Vector3()
  strands.forEach((s) => { tmp.copy(s.b).sub(s.a); s.len = tmp.length(); s.q = new THREE.Quaternion().setFromUnitVectors(Y, tmp.normalize()) })
  const place = (i: number, k: number) => {
    const s = strands[i]
    d.position.copy(s.a); d.quaternion.copy(s.q!); d.scale.set(1, Math.max(0.0001, s.len! * k), 1); d.updateMatrix(); net.setMatrixAt(i, d.matrix)
  }

  const setProgress = (t: number) => {
    const sp = seg(t, 0, 0.12)
    footings.forEach((f, i) => { const q = seg(sp, (i / footings.length) * 0.6, (i / footings.length) * 0.6 + 0.4); f.g.visible = q > 0; f.g.scale.setScalar(Math.max(0.001, easeOutBack(q))) })
    const sq = seg(t, 0.12, 0.32)
    posts.forEach((m, i) => { const q = seg(sq, (i / posts.length) * 0.5, (i / posts.length) * 0.5 + 0.5); m.visible = q > 0; m.scale.y = Math.max(0.001, easeOut(q)) })
    const sr = seg(t, 0.32, 0.5)
    rails.forEach((r, i) => { const q = seg(sr, (i / rails.length) * 0.6, (i / rails.length) * 0.6 + 0.4); r.m.visible = q > 0; r.m.scale.y = Math.max(0.001, easeOut(q)) })
    const sn = seg(t, 0.5, 0.76), sf = seg(t, 0.76, 0.94)
    strands.forEach((s, i) => {
      const w = s.roof ? sf : sn, mx = s.roof ? maxRoof : maxSide
      const a = (s.order / (mx + 0.01)) * 0.8
      place(i, easeOut(seg(w, a, a + 0.2)))
    })
    net.instanceMatrix.needsUpdate = true
  }
  setProgress(1)
  return { setProgress, dispose: () => {} }
}
