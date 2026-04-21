'use client'

const includes = [
  'Bespoke design — nothing templated',
  'Mobile-friendly, fast-loading',
  'Your domain, registered in your name',
  'Hosting sorted for the first year',
  'Full handover — every password, every login',
  'Tweaks and changes before handover',
]

export default function Pricing({ onContact }: { onContact: () => void }) {
  return (
    <section id="pricing" className="px-4 md:px-8" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-[1100px] mx-auto flex gap-20 items-start flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
            Pricing
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: 20, lineHeight: 1.2 }}>
            One price.<br />No surprises.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.65, maxWidth: 380 }}>
            A single flat fee of £650. If your job needs something extra I'll tell you upfront — but there are no monthly fees, ever.
          </p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '36px 32px', boxShadow: 'var(--shadow-card-lg)', width: '100%', maxWidth: 480, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1 }}>
            <sup style={{ fontSize: 24, verticalAlign: 'super' }}>£</sup>650
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 6, marginBottom: 28 }}>
            One-time. No monthly fees. No surprises.
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {includes.map((item, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span style={{ color: 'var(--color-accent)', fontSize: 14, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onContact}
            className="mt-7 w-full cursor-pointer transition-colors duration-150"
            style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, padding: '13px', borderRadius: 'var(--radius-btn)', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Get in touch
          </button>
        </div>
      </div>
    </section>
  )
}
