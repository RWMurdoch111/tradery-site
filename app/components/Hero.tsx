'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero({ onContact }: { onContact: () => void }) {
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.from(eyebrowRef.current, { opacity: 0, y: 10, duration: 0.5 })
        .from(headlineRef.current, { opacity: 0, y: 22, duration: 0.6 }, '-=0.3')
        .from(bodyRef.current, { opacity: 0, y: 16, duration: 0.5 }, '-=0.35')
        .from(buttonsRef.current, { opacity: 0, y: 12, duration: 0.45 }, '-=0.3')
        .from(statsRef.current?.children ? Array.from(statsRef.current.children) : [], {
          opacity: 0, y: 10, duration: 0.4, stagger: 0.1,
        }, '-=0.25')
        .from(photoRef.current, { opacity: 0, x: 20, duration: 0.65, ease: 'power2.out' }, '-=0.7')
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className="pt-36 pb-24 px-8">
      <div className="max-w-[1100px] mx-auto flex items-center gap-12 md:gap-16">
        <div className="flex-1 min-w-0">
          <div ref={eyebrowRef} style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 20 }}>
            Websites for London tradespeople
          </div>
          <h1 ref={headlineRef} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: 24 }}>
            Your website,<br />
            <em style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>built in 48 hours.</em>
          </h1>
          <p ref={bodyRef} style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--color-ink-3)', maxWidth: 460, marginBottom: 36 }}>
            One price. £650. No monthly fees. Full handover. You own everything.
          </p>
          <div ref={buttonsRef} className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 460 }}>
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
          <div ref={statsRef} className="flex gap-8 mt-10">
            {[['£650', 'One-time fee'], ['48h', 'First preview'], ['100%', 'You own it']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--color-ink)' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero illustration — desktop only */}
        <div ref={photoRef} className="hidden md:block shrink-0 md:w-[440px]">
          <img
            src="/hero-illustration.png"
            alt="Hand-drawn illustration of a laptop showing a finished website with a 'Website complete' construction sign"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </section>
  )
}
