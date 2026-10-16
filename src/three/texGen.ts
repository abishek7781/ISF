// Small deterministic value-noise toolkit for procedural, physically plausible surface maps.
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }
function makeNoise(seed: number) {
  const r = rng(seed)
  const N = 256
  const g = new Float32Array(N * N)
  for (let i = 0; i < g.length; i++) g[i] = r()
  const at = (x: number, y: number) => g[((y & 255) * N) + (x & 255)]
  const smooth = (t: number) => t * t * (3 - 2 * t)
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi)
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1)
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
  }
  const fbm = (x: number, y: number, o = 4) => { let v = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { v += a * noise(x * f, y * f); f *= 2; a *= 0.5 } return v }
  return { noise, fbm, r }
}

export type Raw = { w: number; h: number; data: Uint8ClampedArray; srgb: boolean }
export type RawPbr = { map: Raw; bump: Raw }

/** Pixel buffers only (no DOM or three.js), so the same code runs in a worker. */
function canvasTex(w: number, h: number, draw: (d: ImageData) => void, srgb = true): Raw {
  const data = new Uint8ClampedArray(w * h * 4)
  draw({ data } as ImageData)
  return { w, h, data, srgb }
}

/** One prefinished maple board: long grain along x, growth rings, pores, edge bevel shadow. */
export function woodBoard_(seed: number, tone: number): RawPbr {
  const { fbm, noise } = makeNoise(seed)
  const W = 1024, H = 128
  const base = [226 + tone * 8, 186 + tone * 8, 132 + tone * 6]
  const col = canvasTex(W, H, (img) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const warp = fbm(x * 0.0032, y * 0.02 + seed, 3) * 34
      const rings = Math.sin((y + warp) * 0.52 + fbm(x * 0.0018, y * 0.04, 2) * 6)
      const streak = fbm(x * 0.008, y * 0.44 + seed * 3, 3)
      const pores = noise(x * 1.1, y * 0.36) > 0.82 ? -14 : 0
      let k = 1 + rings * 0.05 + (streak - 0.5) * 0.26
      const edge = Math.min(y, H - 1 - y)
      if (edge < 2) k *= 0.7 + edge * 0.15
      const i = (y * W + x) * 4
      img.data[i] = Math.max(0, base[0] * k + pores)
      img.data[i + 1] = Math.max(0, base[1] * k + pores)
      img.data[i + 2] = Math.max(0, base[2] * k + pores)
      img.data[i + 3] = 255
    }
  })
  const bump = canvasTex(W, H, (img) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const warp = fbm(x * 0.0032, y * 0.02 + seed, 3) * 34
      const rings = Math.sin((y + warp) * 0.52) * 0.5 + 0.5
      const pores = noise(x * 1.1, y * 0.36) > 0.82 ? 0 : 1
      const edge = Math.min(y, H - 1 - y)
      const v = (edge < 2 ? edge / 2 : 1) * (0.6 + rings * 0.3) * (0.75 + pores * 0.25) * 255
      const i = (y * W + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
  }, false)
  return { map: col, bump }
}

export function concrete_(): RawPbr {
  const { fbm, noise } = makeNoise(11)
  const S = 512
  const f = (img: ImageData, rgb: boolean) => {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = fbm(x * 0.024, y * 0.024, 4)
      const sp = noise(x * 1.8, y * 1.8) > 0.93 ? -18 : 0
      const v = 128 + (n - 0.5) * 70 + sp + (noise(x * 0.24, y * 0.24) - 0.5) * 16
      const i = (y * S + x) * 4
      img.data[i] = rgb ? v * 1.0 : v
      img.data[i + 1] = rgb ? v * 1.02 : v
      img.data[i + 2] = rgb ? v * 1.04 : v
      img.data[i + 3] = 255
    }
  }
  return { map: canvasTex(S, S, (i) => f(i, true)), bump: canvasTex(S, S, (i) => f(i, false), false) }
}

export function plywood_(): RawPbr {
  const { fbm } = makeNoise(5)
  const W = 512, H = 512
  const f = (img: ImageData, rgb: boolean) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const streak = fbm(x * 0.006, y * 0.18, 3)
      const band = Math.floor(y / 64) % 2 ? 6 : 0
      const k = 0.92 + (streak - 0.5) * 0.3 + (Math.sin(y * 0.9 + streak * 7) * 0.025)
      const edge = y % 64 < 1 ? 0.7 : 1
      const i = (y * W + x) * 4
      const v = rgb ? [196, 150, 98] : [150, 150, 150]
      img.data[i] = v[0] * k * edge + band
      img.data[i + 1] = v[1] * k * edge + band
      img.data[i + 2] = v[2] * k * edge + band
      img.data[i + 3] = 255
    }
  }
  return { map: canvasTex(W, H, (i) => f(i, true)), bump: canvasTex(W, H, (i) => f(i, false), false) }
}

export function turf_(): RawPbr {
  const { fbm, noise } = makeNoise(21)
  const S = 512
  const f = (img: ImageData, rgb: boolean) => {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const stripe = Math.floor(x / 64) % 2 ? 1 : 0.88
      const blade = noise(x * 3.4, y * 3.4)
      const patch = fbm(x * 0.02, y * 0.02, 3)
      const k = (0.62 + blade * 0.55) * stripe * (0.85 + patch * 0.3)
      const i = (y * S + x) * 4
      if (rgb) { img.data[i] = 38 * k; img.data[i + 1] = 118 * k; img.data[i + 2] = 44 * k } else { img.data[i] = img.data[i + 1] = img.data[i + 2] = 80 + blade * 175 }
      img.data[i + 3] = 255
    }
  }
  return { map: canvasTex(S, S, (i) => f(i, true)), bump: canvasTex(S, S, (i) => f(i, false), false) }
}

