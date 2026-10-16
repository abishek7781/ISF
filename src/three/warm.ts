/** Runs while the preloader is on screen: fetches the 3D code and builds the shared textures (in a worker, off the main thread) so the scenes start instantly. */
export function warm3D() {
  void import('../components/PortfolioBuilds')
  void Promise.all([import('./textures'), import('./stage'), import('./floorScene'), import('./lightScene'), import('./fabScene'), import('./badminton')]).then(([tx]) => {
    tx.beamTexture()
    const jobs = [
      { k: 'c', kind: 'c' }, { k: 'p', kind: 'p' },
      { k: 'w33:-3', kind: 'w', seed: 33, tone: -3 }, { k: 'w61:0', kind: 'w', seed: 61, tone: 0 },
      ...[0, 1, 2, 3].map((i) => ({ k: `w${40 + i * 7}:${(i % 3) - 1}`, kind: 'w', seed: 40 + i * 7, tone: (i % 3) - 1 })),
    ]
    try {
      const n = Math.min(3, Math.max(1, (navigator.hardwareConcurrency || 2) - 1))
      const pool = Array.from({ length: n }, () => new Worker(new URL('./texWorker.ts', import.meta.url), { type: 'module' }))
      let left = jobs.length
      const feed = (w: Worker) => { const j = jobs.shift(); if (j) w.postMessage(j); else w.terminate() }
      pool.forEach((w) => {
        w.onmessage = (e) => { tx.prime(e.data.k, e.data.p); left--; feed(w) }
        w.onerror = () => w.terminate()
        feed(w)
      })
    } catch { /* scenes fall back to building textures on demand */ }
  })
}
