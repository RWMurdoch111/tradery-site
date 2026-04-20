const quotes = [
  { q: "Got the site in a week. Customers ring me directly from it now.", name: "Dave H.", trade: "Plumber, Hackney" },
  { q: "Robbie showed me the site before I handed over a penny. That's what sold it.", name: "Mark T.", trade: "Electrician, Islington" },
  { q: "Dead easy. I told him what I needed, he built it, and now it's mine.", name: "Sean O.", trade: "Builder, Lewisham" },
]

export default function SocialProof() {
  return (
    <section style={{ padding: '96px 32px', background: 'var(--color-surface)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 48, textAlign: 'center' }}>
          What tradespeople say
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {quotes.map((q, i) => (
            <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '28px 24px', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--color-ink)', lineHeight: 1.55, marginBottom: 20 }}>
                "{q.q}"
              </p>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)' }}>{q.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{q.trade}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
