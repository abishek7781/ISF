type Request = { method?: string; body?: unknown }
type Response = {
  setHeader(name: string, value: string): void
  status(code: number): Response
  json(body: unknown): Response
}

const ZOHO_ACTION = 'https://crm.zoho.in/crm/WebToLeadForm'
// Zoho assigned the Website Enquiry Reference field to LEADCF47 in this org.
const ENQUIRY_REFERENCE_FIELD = 'LEADCF47'

function normalise(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * A stable reference for one website enquiry.
 *
 * The phone number identifies the customer, while the project and requested
 * callback slot identify the enquiry. This deliberately does not use the
 * person's name, so a spelling correction does not create a second enquiry.
 */
function enquiryReference(params: URLSearchParams): string {
  const phone = normalise(params.get('Phone'))
  const project = normalise(params.get('LEADCF5') || params.get('LEADCF4'))
  const date = normalise(params.get('LEADCF118'))
  const hour = normalise(params.get('LEADCF118hour'))
  const minute = normalise(params.get('LEADCF118minute'))
  const ampm = normalise(params.get('LEADCF118ampm'))
  const raw = [phone, project, date, hour, minute, ampm].join('|')

  // Keep the reference deterministic and safe for a CRM text field without
  // adding a server-side database dependency to this Web-to-Lead endpoint.
  let hash = 2166136261
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `ISF-${(hash >>> 0).toString(16).padStart(8, '0').toUpperCase()}`
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const params = typeof req.body === 'string'
      ? new URLSearchParams(req.body)
      : new URLSearchParams(req.body as Record<string, string>)

    const reference = enquiryReference(params)
    params.set(ENQUIRY_REFERENCE_FIELD, reference)
    const currentDescription = params.get('Description') || ''
    if (!currentDescription.includes('Website enquiry reference:')) {
      const description = [
        currentDescription,
        `Website enquiry reference: ${reference}`,
      ].filter(Boolean).join('\n')
      params.set('Description', description)
    }

    const zoho = await fetch(ZOHO_ACTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Keep the request aligned with the domain configured for this Zoho web form.
        Origin: 'https://indiasportsfloorings.com',
        Referer: 'https://indiasportsfloorings.com/contact/',
      },
      body: params.toString(),
    })

    const responseText = await zoho.text()
    if (!zoho.ok) {
      return res.status(502).json({ error: 'Zoho rejected the lead request' })
    }

    return res.status(200).json({ ok: true, response: responseText.slice(0, 200) })
  } catch {
    return res.status(502).json({ error: 'Unable to reach Zoho' })
  }
}
