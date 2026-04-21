'use client'
import { useState, useEffect } from 'react'

export default function Header({ onContact }: { onContact: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid #e2d8cc' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: 'var(--color-ink)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
          Tradery
          <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--color-accent)', verticalAlign: 'middle' }} />
        </div>
        <nav className="flex items-center gap-7">
          {['How it works', 'Pricing', 'Examples'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="hidden md:block"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-2)', textDecoration: 'none', letterSpacing: '0.01em' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-2)')}
            >
              {item}
            </a>
          ))}
          <button
            onClick={onContact}
            className="cursor-pointer transition-colors duration-150"
            style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, padding: '8px 18px', borderRadius: 'var(--radius-btn)', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Get in touch
          </button>
        </nav>
      </div>
    </header>
  )
}
