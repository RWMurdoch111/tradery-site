'use client'
import { useState, useEffect, useRef } from 'react'

export default function ContactModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false)
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
              {[['Your name', 'text', 'e.g. Dave Hutchins'], ['Your trade', 'text', 'e.g. Plumber'], ['Phone or email', 'text', 'Best way to reach you']].map(([label, type, ph]) => (
                <div key={label}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)', marginBottom: 5 }}>{label}</div>
                  <input
                    type={type}
                    placeholder={ph}
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
                  placeholder="Areas you cover, anything specific you want on the site…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(42,94,245,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button
                onClick={() => setSent(true)}
                className="mt-1 w-full cursor-pointer transition-colors duration-150"
                style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, padding: 13, borderRadius: 'var(--radius-btn)', border: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
              >
                Send message
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
