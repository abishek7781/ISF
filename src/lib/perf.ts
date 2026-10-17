/**
 * Keeps scrolling smooth:
 *  - sections that are off screen get the class "offscreen", which pauses their looping CSS animations (see styles.css);
 *  - images decode off the main thread, so a picture appearing does not stall the page.
 */
export function startPerf() {
  const seen = new WeakSet<Element>()
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('offscreen', !e.isIntersecting)),
    { rootMargin: '160px 0px' },
  )
  const scan = () => {
    document.querySelectorAll('section, footer, .cta-band').forEach((el) => {
      if (!seen.has(el)) { seen.add(el); io.observe(el) }
    })
    document.querySelectorAll('img:not([decoding])').forEach((img) => img.setAttribute('decoding', 'async'))
  }
  let timer = 0
  const later = () => { clearTimeout(timer); timer = window.setTimeout(scan, 120) }
  scan()
  new MutationObserver(later).observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
}
