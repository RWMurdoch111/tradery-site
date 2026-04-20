'use client'

export default function Hero({ onContact }: { onContact: () => void }) {
  return (
    <section className="pt-36 pb-24 px-8">
      <div className="max-w-[1100px] mx-auto flex flex-col-reverse items-center gap-12 md:flex-row md:items-center md:gap-16">
        <div className="flex-1 min-w-0 w-full">
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 20 }}>
            London · Bespoke websites
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: 24 }}>
            You see the site<br />
            <em style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>before you pay</em><br />
            a penny.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--color-ink-3)', maxWidth: 460, marginBottom: 36 }}>
            I'm Robbie. I build bespoke websites for London tradespeople — plumbers, electricians, builders. One price. Full handover. You own everything.
          </p>
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 460 }}>
            <button
              onClick={onContact}
              style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500, padding: '13px', borderRadius: 'var(--radius-btn)', border: 'none', cursor: 'pointer', width: '100%' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Get in touch
            </button>
            <a
              href="#how-it-works"
              style={{ background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500, padding: '13px', borderRadius: 'var(--radius-btn)', border: '1.5px solid var(--color-ink)', textDecoration: 'none', display: 'block', textAlign: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              See how it works
            </a>
          </div>
          <div className="flex gap-8 mt-10">
            {[['£650', 'One-time fee'], ['48h', 'First preview'], ['100%', 'You own it']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--color-ink)' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo placeholder */}
        <div
          className="shrink-0 flex flex-col items-center justify-center gap-3 w-full md:w-[440px]"
          style={{ height: 420, borderRadius: 'var(--radius-card)', background: 'var(--color-subtle)', border: '1px solid var(--color-border)' }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-border)' }} />
          <div style={{ fontSize: 13, color: 'var(--color-muted)', textAlign: 'center' }}>
            Robbie's photo here<br />
            <span style={{ fontSize: 11 }}>Direct eye contact, natural light</span>
          </div>
        </div>
      </div>
    </section>
  )
}
