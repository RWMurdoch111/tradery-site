export default function About() {
  return (
    <section id="about" className="px-4 md:px-8" style={{ paddingTop: 96, paddingBottom: 96, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Photo */}
          <div
            className="shrink-0 w-full md:w-[315px]"
            style={{ height: 378, borderRadius: 11, overflow: 'hidden', background: 'var(--color-subtle)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <img
              src="/robbie.png"
              alt="Robbie Murdoch"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
              Who am I?
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: 20 }}>
              Hi, I'm Robbie.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.7, marginBottom: 16, maxWidth: 520 }}>
              I have a background in product and web design, and I've spent the last few years watching great tradespeople lose work to competitors with better websites — not better skills.
            </p>
            <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.7, marginBottom: 16, maxWidth: 520 }}>
              Tradery is my attempt to fix that. I build fast, professional websites specifically for independent tradespeople — priced fairly, handed over fully, with no ongoing lock-in.
            </p>
            <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.7, maxWidth: 520 }}>
              Based in London. Every site built personally by me.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
