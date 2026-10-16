import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type Stage = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  onFrame: (fn: (dt: number, t: number) => void) => void
  setZoom: (z: number) => void
  dispose: () => void
}

type Opts = {
  cam: [number, number, number]
  target: [number, number, number]
  fov?: number
  exposure?: number
  env?: number
  autoRotate?: boolean
  azimuth?: [number, number]
}

/** A WebGL stage with physically based rendering, image-based light, soft shadows and a render loop that sleeps off-screen. */
export function createStage(host: HTMLElement, o: Opts): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = o.exposure ?? 1
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  scene.environmentIntensity = o.env ?? 0.5

  const camera = new THREE.PerspectiveCamera(o.fov ?? 34, 1, 0.1, 100)
  camera.position.set(...o.cam)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(...o.target)
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = 1.46
  if (o.azimuth) { controls.minAzimuthAngle = o.azimuth[0]; controls.maxAzimuthAngle = o.azimuth[1] }
  controls.autoRotate = !!o.autoRotate
  controls.autoRotateSpeed = 0.5
  controls.update()

  const frames: ((dt: number, t: number) => void)[] = []
  let visible = false
  let raf = 0
  let last = 0
  let elapsed = 0
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000 || 0)
    last = now
    elapsed += dt
    controls.update()
    frames.forEach((f) => f(dt, elapsed))
    renderer.render(scene, camera)
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) } }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }

  let extra = 1
  let fit = 1
  const applyZoom = () => { camera.zoom = fit * extra; camera.updateProjectionMatrix() }
  const resize = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    fit = Math.min(1, camera.aspect / 1.0)   // narrow (portrait) views pull back so the whole object stays in frame
    applyZoom()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !document.hidden) start(); else stop() }, { threshold: 0.02 })
  io.observe(host)
  const vis = () => { if (document.hidden) stop(); else if (visible) start() }
  document.addEventListener('visibilitychange', vis)
  renderer.render(scene, camera)

  return {
    scene, camera, renderer, controls,
    onFrame: (fn) => { frames.push(fn) },
    setZoom: (z) => { extra = z; applyZoom() },
    dispose: () => {
      stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis)
      controls.dispose(); envRT.dispose(); pmrem.dispose()
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose())
      })
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeOutBack = (x: number) => { const c1 = 1.5; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) }
