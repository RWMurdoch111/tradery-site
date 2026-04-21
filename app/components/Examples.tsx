const templates = [
  {
    tier: 'Premium',
    name: 'High-end tradesperson',
    desc: 'Navy and gold, editorial feel. Built for contractors who do premium refurbishments and want a site that reflects the quality of their work.',
    accent: '#1a2744',
    href: '/demos/plumber-premium/index.html',
    live: true,
  },
  {
    tier: 'Standard',
    name: 'Friendly local trader',
    desc: 'Warm, approachable, straight-talking. Built for the trusted local who wants a site that feels like them — not like a big company.',
    accent: '#2563eb',
    href: '/demos/plumber-standard/index.html',
    live: true,
  },
  {
    tier: 'Essential',
    name: 'Simple & clean',
    desc: 'No frills, fast, professional. One page, clear services, phone number front and centre. Gets the job done.',
    accent: '#16a34a',
    href: '#',
    live: false,
  },
]

export default function Examples() {
  return (
    <section id="examples" className="px-4 md:px-8" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-[1100px] mx-auto">
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
          Examples
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: 12, lineHeight: 1.2 }}>
          Three styles.<br />Pick the right fit.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.65, maxWidth: 420, marginBottom: 56 }}>
          Every site is built to one of these templates then fully personalised with your details, photos, and copy.
        </p>

        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {templates.map((t) => (
            <div
              key={t.tier}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Colour swatch preview */}
              <div style={{ height: 8, background: t.accent }} />

              <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>
                  {t.tier}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 12, lineHeight: 1.25 }}>
                  {t.name}
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-ink-3)', lineHeight: 1.65, flex: 1 }}>
                  {t.desc}
                </p>

                <div style={{ marginTop: 28 }}>
                  {t.live ? (
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block', textAlign: 'center', background: t.accent, color: '#fff',
                        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                        padding: '10px 0', borderRadius: 'var(--radius-btn)', textDecoration: 'none',
                      }}
                    >
                      View example →
                    </a>
                  ) : (
                    <div style={{
                      display: 'block', textAlign: 'center', background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)', color: 'var(--color-muted)',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                      padding: '10px 0', borderRadius: 'var(--radius-btn)',
                    }}>
                      Coming soon
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
