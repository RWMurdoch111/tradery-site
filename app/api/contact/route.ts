export async function POST(request: Request) {
  let body: { name?: string; trade?: string; contact?: string; notes?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const trade = body.trade?.trim() ?? ''
  const contact = body.contact?.trim() ?? ''
  const notes = body.notes?.trim() ?? ''

  if (!name || !trade || !contact) {
    return Response.json({ error: 'Name, trade and contact are required.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL ?? 'Tradery Leads <onboarding@resend.dev>'

  if (!apiKey || !to) {
    console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL env vars')
    return Response.json({ error: 'Server is not configured to send mail.' }, { status: 500 })
  }

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)

  const text = [
    'New lead from tradery.co.uk',
    '',
    `Name: ${name}`,
    `Trade: ${trade}`,
    `Contact: ${contact}`,
    notes ? `\nNotes:\n${notes}` : '',
  ].join('\n').trim()

  const html = `
    <h2 style="font-family:system-ui,sans-serif">New lead from tradery.co.uk</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Trade:</strong> ${escapeHtml(trade)}</p>
    <p><strong>Contact:</strong> ${escapeHtml(contact)}</p>
    ${notes ? `<p><strong>Notes:</strong><br>${escapeHtml(notes).replace(/\n/g, '<br>')}</p>` : ''}
  `.trim()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New lead: ${name} (${trade})`,
      text,
      html,
      ...(looksLikeEmail ? { reply_to: contact } : {}),
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('Resend error:', res.status, errBody)
    return Response.json({ error: 'Failed to send.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
