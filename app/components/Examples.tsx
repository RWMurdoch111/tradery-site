'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
    accent: 'oklch(46% 0.17 148)',
    href: '/demos/plumber-standard/index.html',
    live: true,
  },
  {
    tier: 'Essential',
    name: 'Simple & clean',
    desc: 'Crisp white, vibrant blue. Services, reviews, and a lead-capture form designed to turn visitors into bookings.',
    accent: '#1A6EF5',
    href: '/demos/plumber-essential/index.html',
    live: true,
  },
]

export default function Examples() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0, y: 20, duration: 0.55, ease: 'power2.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      })

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          opacity: 0, y: 32, duration: 0.55, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: cardsRef.current, start: 'top 82%' },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="examples" className="px-4 md:px-8" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-[1100px] mx-auto">
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
          Examples
        </div>
        <h2 ref={headingRef} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: 12, lineHeight: 1.2 }}>
          A few of my<br />recent builds.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.65, maxWidth: 480, marginBottom: 56 }}>
          A flavour of what's possible. Every site is custom-built — if you've got something different in mind, I'll build that too.
        </p>

        <div ref={cardsRef} className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
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
