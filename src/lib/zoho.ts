import { ZOHO } from '../data/content'

/** Posts the lead through the same-origin Vercel endpoint so Zoho's response is reliable. */
export async function postLead(fields: Record<string, string>): Promise<void> {
  const response = await fetch('/api/zoho-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...ZOHO.hidden, ...fields }).toString(),
  })
  if (!response.ok) throw new Error('Zoho did not accept the lead request')
}

