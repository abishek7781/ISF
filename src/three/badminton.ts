import * as THREE from 'three'

/** Regulation badminton court (13.4 x 6.1 m doubles) drawn to scale, with posts and net across x = 0. */
export function addBadmintonCourt(parent: THREE.Object3D, o: { scale: number; y: number; surface?: number; apron?: number; apronPad?: number; net?: boolean }) {
  const s = o.scale
  const Lc = 13.4 * s, Wc = 6.1 * s
  const g = new THREE.Group(); g.position.y = o.y; parent.add(g)
  const rec = <T extends THREE.Mesh>(m: T) => { m.receiveShadow = true; return m }
  if (o.apron !== undefined) {
    const pad = o.apronPad ?? 1.4 * s
    const ap = rec(new THREE.Mesh(new THREE.BoxGeometry(Lc + pad * 2, 0.03, Wc + pad * 2), new THREE.MeshStandardMaterial({ color: o.apron, roughness: 0.75 }))); ap.position.y = -0.016; g.add(ap)
  }
  if (o.surface !== undefined) {
    const sf = rec(new THREE.Mesh(new THREE.BoxGeometry(Lc, 0.032, Wc), new THREE.MeshStandardMaterial({ color: o.surface, roughness: 0.72 }))); sf.position.y = -0.014; g.add(sf)
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.55 })
  const lw = Math.max(0.035, 0.04 * s * 1.6)
  const line = (x1: number, z1: number, x2: number, z2: number) => {
    const len = Math.hypot(x2 - x1, z2 - z1)
    const m = rec(new THREE.Mesh(new THREE.BoxGeometry(len, 0.004, lw), mat))
    m.position.set((x1 + x2) / 2, 0.004, (z1 + z2) / 2); m.rotation.y = -Math.atan2(z2 - z1, x2 - x1); g.add(m)
  }
  const hx = Lc / 2, hz = Wc / 2
  line(-hx, -hz, hx, -hz); line(hx, -hz, hx, hz); line(hx, hz, -hx, hz); line(-hx, hz, -hx, -hz)
  line(-hx, -hz + 0.46 * s, hx, -hz + 0.46 * s); line(-hx, hz - 0.46 * s, hx, hz - 0.46 * s)
  line(0, -hz, 0, hz)
  ;[-1, 1].forEach((k) => { line(k * 1.98 * s, -hz, k * 1.98 * s, hz); line(k * (hx - 0.76 * s), -hz, k * (hx - 0.76 * s), hz); line(k * 1.98 * s, 0, k * hx, 0) })

  const net = new THREE.Group(); g.add(net)
  if (o.net !== false) {
    const steel = new THREE.MeshStandardMaterial({ color: 0xb9c0c8, metalness: 0.9, roughness: 0.35 })
    const ph = 1.55 * s * 1.25
    ;[-1, 1].forEach((k) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ph, 16), steel); p.position.set(0, ph / 2, k * (hz + 0.22 * s)); p.castShadow = true; net.add(p)
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 20), steel); b.position.set(0, 0.025, k * (hz + 0.22 * s)); net.add(b)
    })
    const c = document.createElement('canvas'); c.width = 256; c.height = 64
    const x = c.getContext('2d')!; x.strokeStyle = 'rgba(245,245,240,0.95)'; x.lineWidth = 1.6
    for (let i = 0; i <= 256; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.stroke() }
    for (let j = 0; j <= 64; j += 8) { x.beginPath(); x.moveTo(0, j); x.lineTo(256, j); x.stroke() }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
    const nh = 0.76 * s * 1.25, nw = Wc + 0.44 * s
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(nw, nh), new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.8 }))
    sheet.rotation.y = Math.PI / 2; sheet.position.set(0, ph - nh / 2 - 0.02, 0); net.add(sheet)
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.06, nw), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })); tape.position.set(0, ph - 0.03, 0); net.add(tape)
  }
  return { group: g, net, Lc, Wc }
}

/** A shuttlecock: cork head, feather skirt. */
export function makeShuttle(scale = 1) {
  const g = new THREE.Group()
  const cork = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: 0xd8b98a, roughness: 0.6 }))
  cork.position.y = -0.05; g.add(cork)
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.052, 0.17, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.94 }))
  skirt.position.y = 0.06; g.add(skirt)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.005, 8, 40), new THREE.MeshStandardMaterial({ color: 0xe6e0d0 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.145; g.add(rim)
  g.scale.setScalar(scale)
  return g
}
