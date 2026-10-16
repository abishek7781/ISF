import { ZOHO } from '../data/content'

/**
 * Posts a lead the same way Zoho's own embedded web form does: a real browser form submission,
 * sent into a hidden frame so the visitor stays on the page. (A script request can be dropped by Zoho.)
 * Resolves once Zoho has answered; the reply itself is not readable across sites.
 */
export function postLead(fields: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const name = `zoho-${Date.now()}`
    const frame = document.createElement('iframe')
    frame.name = name
    frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden'
    frame.setAttribute('aria-hidden', 'true')
    frame.tabIndex = -1
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = import.meta.env.DEV ? '/zoho-lead' : ZOHO.action
    form.target = name
    form.acceptCharset = 'UTF-8'
    form.style.display = 'none'
    Object.entries({ ...ZOHO.hidden, ...fields }).forEach(([k, v]) => {
      const i = document.createElement('input')
      i.type = 'hidden'; i.name = k; i.value = v
      form.appendChild(i)
    })
    let done = false
    const finish = (ok: boolean) => {
      if (done) return
      done = true
      window.setTimeout(() => { frame.remove(); form.remove() }, 500)
      ok ? resolve() : reject(new Error('Zoho did not answer'))
    }
    document.body.append(frame, form)
    // let the empty frame settle, then send; the next load in the frame is Zoho's reply
    window.setTimeout(() => {
      frame.addEventListener('load', () => finish(true), { once: true })
      form.submit()
    }, 50)
    window.setTimeout(() => finish(false), 10000)
  })
}

