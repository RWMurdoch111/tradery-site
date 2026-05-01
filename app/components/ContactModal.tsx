'use client'
import { useState, useEffect, useRef } from 'react'

type Form = { name: string; trade: string; contact: string; notes: string }

export default function ContactModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Form>({ name: '', trade: '', contact: '', notes: '' })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const inputStyle = {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    color: 'var(--color-ink)',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '10px 13px',
    outline: 'none',
  }

  const update = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const submit = async () => {
    if (submitting) return
    if (!form.name.trim() || !form.trade.trim() || !form.contact.trim()) {
      setError('Please fill in your name, trade, and contact.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }))
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fields: Array<{ key: keyof Form; label: string; placeholder: string }> = [
    { key: 'name', label: 'Your name', placeholder: 'e.g. Dave Hutchins' },
    { key: 'trade', label: 'Your trade', placeholder: 'e.g. Plumber' },
    { key: 'contact', label: 'Phone or email', placeholder: 'Best way to reach you' },
  ]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,23,20,0.6)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 40, maxWidth: 480, width: '92%', position: 'relative' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer"
          style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--color-muted)', lineHeight: 1 }}
        >×</button>

        {sent ? (
          <div className="text-center py-8">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 16 }}>
              Thanks — I'll be in touch.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-ink-3)', marginBottom: 28 }}>
              I'll usually reply within a few hours. If it's urgent, drop me a text.
            </p>
            <button
              onClick={onClose}
              style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, padding: '11px 22px', borderRadius: 'var(--radius-btn)', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 8 }}>
              Get in touch
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-ink-3)', marginBottom: 28 }}>
              Tell me your name and trade. I'll send you a link to a preview site for your business within 48 hours.
            </p>
            <div className="flex flex-col gap-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)', marginBottom: 5 }}>{label}</div>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={update(key)}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(42,94,245,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)', marginBottom: 5 }}>Anything else? (optional)</div>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={update('notes')}
                  placeholder="Areas you cover, anything specific you want on the site…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(42,94,245,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {error && (
                <div style={{ fontSize: 13, color: '#c0392b', marginTop: -4 }}>
                  {error}
                </div>
              )}
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-1 w-full transition-colors duration-150"
                style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, padding: 13, borderRadius: 'var(--radius-btn)', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-accent-hover)' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-accent)' }}
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
