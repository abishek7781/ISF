type Request = { method?: string; body?: unknown }
type Response = {
  setHeader(name: string, value: string): void
  status(code: number): Response
  json(body: unknown): Response
}

const ZOHO_ACTION = 'https://crm.zoho.in/crm/WebToLeadForm'

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string'
      ? req.body
      : new URLSearchParams(req.body as Record<string, string>).toString()

    const zoho = await fetch(ZOHO_ACTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Keep the request aligned with the domain configured for this Zoho web form.
        Origin: 'https://indiasportsfloorings.com',
        Referer: 'https://indiasportsfloorings.com/contact/',
      },
      body,
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
