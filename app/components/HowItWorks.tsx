'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { n: '01', title: 'I build it first', body: "Before any money changes hands, I build a working version of your site. You get a link to click around." },
  { n: '02', title: 'You have a look', body: "Show it to your partner. Show it to a mate. Take your time. If you don't like it, walk away — no hard feelings." },
  { n: '03', title: 'We finish it together', body: "Happy? We go through any changes, finalise everything, and I hand it all over. Domain, hosting, passwords — it's yours." },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0, y: 24, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      })

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          opacity: 0, y: 36, duration: 0.55, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: cardsRef.current, start: 'top 82%' },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" style={{ background: 'var(--color-ink)', padding: '96px 32px' }}>
      <div className="max-w-[1100px] mx-auto">
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
          How it works
        </div>
        <h2 ref={headingRef} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: '#ffffff', marginBottom: 64, maxWidth: 500, lineHeight: 1.2 }}>
          No commitment until you're happy.
        </h2>
        <div ref={cardsRef} className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {steps.map(s => (
            <div key={s.n} style={{ background: '#231f1b', border: '1px solid #2e2923', borderRadius: 'var(--radius-card)', padding: '32px 28px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 20, opacity: 0.7 }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: '#ffffff', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
