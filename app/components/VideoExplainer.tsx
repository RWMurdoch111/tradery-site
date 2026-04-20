'use client'
import { useState } from 'react'

export default function VideoExplainer() {
  const [playing, setPlaying] = useState(false)

  // Replace with real YouTube/Vimeo embed ID when ready
  const VIDEO_ID = null

  return (
    <section style={{ padding: '96px 32px', background: 'var(--color-surface)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="max-w-[640px] mx-auto text-center mb-12">
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 16 }}>
            See it in action
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: 16 }}>
            Here's exactly how it works
          </h2>
          <p style={{ fontSize: 17, color: 'var(--color-ink-3)', lineHeight: 1.65 }}>
            Two minutes. I'll show you what a finished site looks like and walk through what you get for your money.
          </p>
        </div>

        {/* Video container */}
        <div
          className="relative mx-auto overflow-hidden"
          style={{ maxWidth: 800, aspectRatio: '16/9', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', background: '#0f0f0f', boxShadow: 'var(--shadow-card-lg)' }}
        >
          {VIDEO_ID && playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Placeholder / thumbnail */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
              style={{ background: 'linear-gradient(135deg, #111c32 0%, #0f0f0f 100%)' }}
              onClick={() => VIDEO_ID && setPlaying(true)}
            >
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.4) 40px, rgba(255,255,255,0.4) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.4) 40px, rgba(255,255,255,0.4) 41px)'
              }} />

              {/* Play button */}
              <div
                className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 0 12px rgba(42,94,245,0.15)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              <div style={{ marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
                {VIDEO_ID ? 'Watch the explainer' : 'Video coming soon'}
              </div>

              {!VIDEO_ID && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                  Placeholder — drop a YouTube ID into VideoExplainer.tsx
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
