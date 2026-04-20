'use client'

export default function Footer({ onContact }: { onContact: () => void }) {
  return (
    <footer style={{ background: 'var(--color-ink)', padding: '64px 32px 40px' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex justify-between items-start flex-wrap gap-8 mb-12">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: '#ffffff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              Tradery
              <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--color-accent)', verticalAlign: 'middle' }} />
            </div>
            <p style={{ fontSize: 14, color: '#6b5f54', maxWidth: 260, lineHeight: 1.6 }}>
              Bespoke websites for London tradespeople. Built fast, handed over fully.
            </p>
          </div>
          <button
            onClick={onContact}
            style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, padding: '11px 22px', borderRadius: 'var(--radius-btn)', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Get in touch
          </button>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-3" style={{ borderTop: '1px solid #2e2923', paddingTop: 24 }}>
          <div style={{ fontSize: 13, color: '#4d443c' }}>© 2026 Tradery. Run by Robbie, London.</div>
          <div style={{ fontSize: 13, color: '#4d443c' }}>No monthly fees. No nonsense.</div>
        </div>
      </div>
    </footer>
  )
}
