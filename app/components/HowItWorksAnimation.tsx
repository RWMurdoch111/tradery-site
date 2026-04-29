'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

// ─── Easing ───────────────────────────────────────────────────────────────────
type EaseFn = (t: number) => number
const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => {
    const u = t - 1
    return u * u * u + 1
  },
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
} satisfies Record<string, EaseFn>

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))

function interpolate(input: number[], output: number[], ease: EaseFn | EaseFn[] = Easing.linear) {
  return (t: number) => {
    if (t <= input[0]) return output[0]
    if (t >= input[input.length - 1]) return output[output.length - 1]
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i]
        const local = span === 0 ? 0 : (t - input[i]) / span
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease
        const eased = easeFn(local)
        return output[i] + (output[i + 1] - output[i]) * eased
      }
    }
    return output[output.length - 1]
  }
}

// ─── Contexts ─────────────────────────────────────────────────────────────────
type TimelineCtx = {
  time: number
  duration: number
  playing: boolean
  setTime: (t: number) => void
  setPlaying: (p: boolean | ((b: boolean) => boolean)) => void
}
const TimelineContext = createContext<TimelineCtx>({
  time: 0,
  duration: 10,
  playing: false,
  setTime: () => {},
  setPlaying: () => {},
})
const useTime = () => useContext(TimelineContext).time
const useTimeline = () => useContext(TimelineContext)

type SpriteCtx = { localTime: number; progress: number; duration: number; visible: boolean }
const SpriteContext = createContext<SpriteCtx>({
  localTime: 0,
  progress: 0,
  duration: 0,
  visible: false,
})
const useSprite = () => useContext(SpriteContext)

// ─── Sprite ──────────────────────────────────────────────────────────────────
function Sprite({
  start = 0,
  end = Infinity,
  children,
  keepMounted = false,
}: {
  start?: number
  end?: number
  children: ReactNode | ((ctx: SpriteCtx) => ReactNode)
  keepMounted?: boolean
}) {
  const { time } = useTimeline()
  const visible = time >= start && time <= end
  if (!visible && !keepMounted) return null

  const duration = end - start
  const localTime = Math.max(0, time - start)
  const progress =
    duration > 0 && Number.isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0
  const value: SpriteCtx = { localTime, progress, duration, visible }

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  )
}

// ─── Stage ────────────────────────────────────────────────────────────────────
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  loop = true,
  autoplay = true,
  audioSrc,
  children,
}: {
  width?: number
  height?: number
  duration?: number
  background?: string
  loop?: boolean
  autoplay?: boolean
  audioSrc?: string
  children: ReactNode
}) {
  const [time, setTime] = useState<number>(0)
  const [playing, setPlaying] = useState<boolean>(autoplay)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
  const [audioPaused, setAudioPaused] = useState<boolean>(true)
  const [hoverControls, setHoverControls] = useState<boolean>(false)

  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hoverHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-scale to fit
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const s = Math.min(el.clientWidth / width, el.clientHeight / height)
      setScale(Math.max(0.05, s))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [width, height])

  // Animation loop — RAF-driven when audio isn't playing
  useEffect(() => {
    if (!playing || audioPlaying) {
      lastTsRef.current = null
      return
    }
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setTime((t) => {
        let next = t + dt
        if (next >= duration) {
          if (loop) next = next % duration
          else {
            next = duration
            setPlaying(false)
          }
        }
        return next
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }
  }, [playing, duration, loop, audioPlaying])

  // When audio is playing, drive playhead from audio.currentTime
  useEffect(() => {
    if (!audioPlaying) return
    let raf = 0
    const tick = () => {
      const a = audioRef.current
      if (a) setTime(a.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [audioPlaying])

  // Start audio from the beginning (used by the centre "Watch with sound" CTA)
  const startAudio = async () => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    setTime(0)
    try {
      await a.play()
      setAudioPlaying(true)
    } catch {}
  }

  // Stop audio entirely and return to the silent visual loop
  const stopAudio = () => {
    audioRef.current?.pause()
    setAudioPlaying(false)
    setTime(0)
  }

  // Play/pause toggle while audio is the timeline driver
  const togglePlayPause = async () => {
    const a = audioRef.current
    if (!audioPlaying) {
      // Audio not active — start it from 0 (treat as "watch with sound")
      await startAudio()
      return
    }
    if (!a) return
    if (a.paused) {
      try { await a.play() } catch {}
    } else {
      a.pause()
    }
  }

  const onAudioEnded = () => {
    setAudioPlaying(false)
    setTime(0)
  }

  // Show controls on hover, auto-hide after 1.6s of no movement
  const revealControls = () => {
    setHoverControls(true)
    if (hoverHideRef.current) clearTimeout(hoverHideRef.current)
    hoverHideRef.current = setTimeout(() => setHoverControls(false), 1600)
  }
  const hideControls = () => {
    if (hoverHideRef.current) clearTimeout(hoverHideRef.current)
    setHoverControls(false)
  }
  useEffect(() => () => {
    if (hoverHideRef.current) clearTimeout(hoverHideRef.current)
  }, [])

  const onSeek = (t: number) => {
    if (audioPlaying && audioRef.current) {
      audioRef.current.currentTime = t
    }
    setTime(t)
  }

  const displayTime = hoverTime != null ? hoverTime : time

  const ctxValue = useMemo<TimelineCtx>(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  )

  const isPlaying = audioPlaying ? !audioPaused : playing
  const showCenterPlay = !!audioSrc && !audioPlaying

  const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-controls]')) return
    if (audioSrc) togglePlayPause()
  }

  return (
    <div
      ref={stageRef}
      onMouseEnter={revealControls}
      onMouseMove={revealControls}
      onMouseLeave={hideControls}
      onClick={onCanvasClick}
      style={{
        position: 'absolute',
        inset: 0,
        background,
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        cursor: audioSrc ? 'pointer' : 'default',
      }}
    >
      {/* Canvas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width,
            height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>{children}</TimelineContext.Provider>
        </div>
      </div>

      {/* Centre "Watch with sound" CTA */}
      {showCenterPlay && (
        <div
          data-controls
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              startAudio()
            }}
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px 14px 18px',
              background: 'rgba(255,255,255,0.96)',
              color: '#19191c',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.005em',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 180ms ease, background 180ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)'
              e.currentTarget.style.background = 'rgba(255,255,255,1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.96)'
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#19191c',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
                <polygon points="0 0 9 5.5 0 11" />
              </svg>
            </span>
            Watch with sound
          </button>
        </div>
      )}

      {/* Bottom controls overlay */}
      <div
        data-controls
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '48px 16px 14px',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)',
          opacity: hoverControls ? 1 : 0,
          pointerEvents: hoverControls ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      >
        <PlaybackBar
          time={displayTime}
          duration={duration}
          playing={isPlaying}
          showStop={audioPlaying}
          onPlayPause={() => {
            if (audioSrc) togglePlayPause()
            else setPlaying((p) => !p)
          }}
          onStop={stopAudio}
          onSeek={onSeek}
          onHover={(t) => setHoverTime(t)}
        />
      </div>

      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          onPlay={() => setAudioPaused(false)}
          onPause={() => setAudioPaused(true)}
          onEnded={onAudioEnded}
        />
      )}
    </div>
  )
}

// ─── Playback bar ─────────────────────────────────────────────────────────────
function PlaybackBar({
  time,
  duration,
  playing,
  showStop,
  onPlayPause,
  onStop,
  onSeek,
  onHover,
}: {
  time: number
  duration: number
  playing: boolean
  showStop: boolean
  onPlayPause: () => void
  onStop: () => void
  onSeek: (t: number) => void
  onHover: (t: number | null) => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const timeFromEvent = useCallback(
    (e: { clientX: number }) => {
      if (!trackRef.current) return 0
      const rect = trackRef.current.getBoundingClientRect()
      const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
      return x * duration
    },
    [duration]
  )

  const onTrackMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return
    const t = timeFromEvent(e)
    if (dragging) onSeek(t)
    else onHover(t)
  }
  const onTrackLeave = () => {
    if (!dragging) onHover(null)
  }
  const onTrackDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    onSeek(timeFromEvent(e))
    onHover(null)
  }

  useEffect(() => {
    if (!dragging) return
    const onUp = () => setDragging(false)
    const onMove = (e: MouseEvent) => {
      onSeek(timeFromEvent(e))
    }
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
    }
  }, [dragging, timeFromEvent, onSeek])

  const pct = duration > 0 ? (time / duration) * 100 : 0
  const fmt = (t: number) => {
    const total = Math.max(0, t)
    const m = Math.floor(total / 60)
    const s = Math.floor(total % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const mono = '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: '#f6f4ef',
        fontFamily: 'Inter, system-ui, sans-serif',
        userSelect: 'none',
        padding: '0 4px',
      }}
    >
      <PlayerButton onClick={onPlayPause} title={playing ? 'Pause' : 'Play'}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor" />
            <rect x="8" y="2" width="3" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
          </svg>
        )}
      </PlayerButton>

      <div
        style={{
          fontFamily: mono,
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          color: 'rgba(246,244,239,0.92)',
          minWidth: 78,
          letterSpacing: 0.2,
        }}
      >
        {fmt(time)} <span style={{ color: 'rgba(246,244,239,0.45)' }}>/ {fmt(duration)}</span>
      </div>

      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 18,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.22)',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${pct}%`,
            height: 3,
            background: '#fff',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${pct}%`,
            top: '50%',
            width: 11,
            height: 11,
            marginLeft: -5.5,
            marginTop: -5.5,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {showStop && (
        <PlayerButton onClick={onStop} title="Stop sound">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </PlayerButton>
      )}
    </div>
  )
}

function PlayerButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode
  onClick: () => void
  title: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.16)' : 'transparent',
        border: 'none',
        borderRadius: 999,
        color: '#fff',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  )
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG = '#19191c'
const BLUE = '#4a72e0'
const MUTED = 'rgba(74,114,224,0.18)'
const TEXT = '#f0ede6'
const TEXT2 = 'rgba(240,237,230,0.45)'
const CARD = '#242428'
const SERIF = '"Lora", Georgia, serif'
const SANS = '"DM Sans", "Inter", system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

const TOTAL = 34.3

// ─── Helpers ──────────────────────────────────────────────────────────────────
const eoc = (t: number) => {
  const u = t - 1
  return u * u * u + 1
}
const eic = (t: number) => t * t * t
const fIn = (t: number, start: number, dur = 0.55) => eoc(clamp((t - start) / dur, 0, 1))
const fOut = (t: number, end: number, dur = 0.6) => 1 - eic(clamp((t - (end - dur)) / dur, 0, 1))

// ─── Step layout ──────────────────────────────────────────────────────────────
function StepLayout({
  num,
  title,
  desc,
  localTime: t,
  dur,
  children,
}: {
  num: string
  title: string
  desc: string
  localTime: number
  dur: number
  children: ReactNode
}) {
  const numOp = fIn(t, 0)
  const titleOp = fIn(t, 0.3)
  const titleY = (1 - titleOp) * 18
  const descOp = fIn(t, 0.65)
  const descY = (1 - descOp) * 10
  const exitOp = fOut(t, dur)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        opacity: exitOp,
      }}
    >
      <div style={{ width: 460, paddingLeft: 96, flexShrink: 0 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 60,
            fontWeight: 300,
            color: BLUE,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 20,
            opacity: numOp,
          }}
        >
          {num}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 40,
            color: TEXT,
            lineHeight: 1.18,
            marginBottom: 20,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 16,
            color: TEXT2,
            lineHeight: 1.75,
            maxWidth: 290,
            opacity: descOp,
            transform: `translateY(${descY}px)`,
          }}
        >
          {desc}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: 72,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── INTRO ────────────────────────────────────────────────────────────────────
function IntroScene() {
  const { localTime: t, duration: dur } = useSprite()
  const labelOp = fIn(t, 0, 0.45)
  const headOp = fIn(t, 0.35, 0.7)
  const headY = (1 - headOp) * 22
  const exitOp = fOut(t, dur, 0.55)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 96,
        opacity: exitOp,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: BLUE,
          textTransform: 'uppercase',
          marginBottom: 26,
          opacity: labelOp,
        }}
      >
        How it works
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 70,
          color: TEXT,
          lineHeight: 1.1,
          opacity: headOp,
          transform: `translateY(${headY}px)`,
          maxWidth: 580,
        }}
      >
        No commitment
        <br />
        until you&apos;re happy.
      </div>
    </div>
  )
}

// ─── SCENE 01: Code editor → lo-fi browser ───────────────────────────────────
type CodeLine = { txt: string; col: string }
const CODE_LINES: CodeLine[] = [
  { txt: '<nav>', col: '#a78bfa' },
  { txt: '  <a>Home</a>', col: TEXT2 },
  { txt: '  <a>About</a>', col: TEXT2 },
  { txt: '</nav>', col: '#a78bfa' },
  { txt: '', col: TEXT2 },
  { txt: '<section>', col: '#a78bfa' },
  { txt: '  <h1>Tradery</h1>', col: '#6ee7b7' },
  { txt: '  <p>Your local', col: TEXT2 },
  { txt: '  builder</p>', col: TEXT2 },
  { txt: '  <button>', col: '#a78bfa' },
  { txt: '    Get started', col: TEXT2 },
  { txt: '  </button>', col: '#a78bfa' },
  { txt: '</section>', col: '#a78bfa' },
]

function CodeEditor({ progress: p }: { progress: number }) {
  const lineCount = CODE_LINES.length
  const typingEnd = 0.68
  const visibleLines = Math.floor(clamp(p / typingEnd, 0, 1) * lineCount)
  const partialFrac = (clamp(p / typingEnd, 0, 1) * lineCount) % 1
  const cursorBlink = Math.sin(p * 38) > 0

  return (
    <div
      style={{
        width: 460,
        background: '#141417',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: '22px',
      }}
    >
      <div
        style={{
          background: '#1e1e22',
          padding: '10px 16px',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
        <span style={{ marginLeft: 10, fontFamily: MONO, fontSize: 11, color: TEXT2 }}>index.html</span>
      </div>
      <div style={{ padding: '14px 20px', minHeight: 240 }}>
        {CODE_LINES.slice(0, visibleLines + 1).map((line, i) => {
          const isLast = i === visibleLines
          const chars = isLast
            ? line.txt.slice(0, Math.ceil(partialFrac * line.txt.length))
            : line.txt
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', height: 22 }}>
              <span
                style={{
                  color: 'rgba(240,237,230,0.18)',
                  width: 24,
                  flexShrink: 0,
                  fontSize: 11,
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: line.col, whiteSpace: 'pre' }}>{chars}</span>
              {isLast && cursorBlink && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 14,
                    background: BLUE,
                    marginLeft: 1,
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoFiBrowser({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        width: 460,
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#1d1d21',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: '#252529',
          padding: '10px 16px',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
        <div
          style={{
            flex: 1,
            background: '#141417',
            borderRadius: 5,
            height: 20,
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT2 }}>yoursite.com</span>
        </div>
      </div>
      <div
        style={{
          background: '#222226',
          padding: '10px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 60, height: 10, borderRadius: 3, background: 'rgba(240,237,230,0.25)' }} />
        <div style={{ flex: 1 }} />
        {[40, 36, 44].map((w, i) => (
          <div
            key={i}
            style={{ width: w, height: 8, borderRadius: 3, background: 'rgba(240,237,230,0.12)' }}
          />
        ))}
        <div
          style={{
            width: 60,
            height: 22,
            borderRadius: 4,
            background: MUTED,
            border: `1px solid ${BLUE}40`,
          }}
        />
      </div>
      <div style={{ padding: '22px 18px 14px', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div
          style={{
            width: '65%',
            height: 18,
            borderRadius: 4,
            background: 'rgba(240,237,230,0.22)',
            marginBottom: 10,
          }}
        />
        <div
          style={{
            width: '45%',
            height: 10,
            borderRadius: 3,
            background: 'rgba(240,237,230,0.1)',
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: '50%',
            height: 10,
            borderRadius: 3,
            background: 'rgba(240,237,230,0.1)',
            marginBottom: 18,
          }}
        />
        <div
          style={{
            width: 90,
            height: 26,
            borderRadius: 5,
            background: MUTED,
            border: `1px solid ${BLUE}50`,
          }}
        />
      </div>
      {[0, 1, 2].map((i) => {
        const w1 = [80, 100, 70][i]
        const w2 = [110, 90, 120][i]
        return (
          <div
            key={i}
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid rgba(240,237,230,0.04)',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: 'rgba(240,237,230,0.07)',
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  width: w1,
                  height: 9,
                  borderRadius: 3,
                  background: 'rgba(240,237,230,0.18)',
                  marginBottom: 5,
                }}
              />
              <div
                style={{ width: w2, height: 7, borderRadius: 3, background: 'rgba(240,237,230,0.08)' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Scene01() {
  const { localTime: t, duration: dur } = useSprite()
  const sceneP = clamp((t - 1.0) / (dur - 1.8), 0, 1)
  const codeOp = 1 - eoc(clamp((sceneP - 0.7) / 0.14, 0, 1))
  const browserOp = eoc(clamp((sceneP - 0.7) / 0.15, 0, 1))

  return (
    <StepLayout
      num="01"
      title="I build it first"
      desc="Before any money changes hands, I build a working version of your site — then send you a link to click around."
      localTime={t}
      dur={dur}
    >
      <div style={{ position: 'relative', width: 460, height: 310 }}>
        <div style={{ opacity: codeOp, position: 'absolute', top: 0, left: 0, width: '100%' }}>
          <CodeEditor progress={sceneP} />
        </div>
        <LoFiBrowser opacity={browserOp} />
      </div>
    </StepLayout>
  )
}

// ─── SCENE 02: Lo-fi site scroll + click ─────────────────────────────────────
function ScrollBrowser({ progress: p }: { progress: number }) {
  const scrollY = interpolate(
    [0.08, 0.55, 0.85, 1.0],
    [0, 120, 120, 120],
    Easing.easeInOutCubic
  )(p)
  const curOp = eoc(clamp((p - 0.6) / 0.12, 0, 1))
  const curX = interpolate(
    [0.6, 0.75, 0.8, 1.0],
    [320, 248, 248, 248],
    Easing.easeInOutCubic
  )(p)
  const curY = interpolate(
    [0.6, 0.75, 0.8, 1.0],
    [60, 144, 144, 144],
    Easing.easeInOutCubic
  )(p)
  const clicked = p > 0.79 && p < 0.89
  const rippleS = eoc(clamp((p - 0.79) / 0.09, 0, 1))
  const rippleOp = 1 - eoc(clamp((p - 0.79) / 0.09, 0, 1))

  return (
    <div
      style={{
        width: 460,
        background: '#1d1d21',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          background: '#252529',
          padding: '10px 16px',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
        <div
          style={{
            flex: 1,
            background: '#141417',
            borderRadius: 5,
            height: 20,
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT2 }}>yoursite.com</span>
        </div>
      </div>
      <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
        <div style={{ transform: `translateY(-${scrollY}px)`, width: '100%' }}>
          <div
            style={{
              background: '#222226',
              padding: '10px 18px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div
              style={{ width: 60, height: 10, borderRadius: 3, background: 'rgba(240,237,230,0.25)' }}
            />
            <div style={{ flex: 1 }} />
            {[40, 36, 44].map((w, i) => (
              <div
                key={i}
                style={{ width: w, height: 8, borderRadius: 3, background: 'rgba(240,237,230,0.12)' }}
              />
            ))}
          </div>
          <div style={{ padding: '22px 18px 14px', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
            <div
              style={{
                width: '65%',
                height: 18,
                borderRadius: 4,
                background: 'rgba(240,237,230,0.22)',
                marginBottom: 10,
              }}
            />
            <div
              style={{
                width: '45%',
                height: 10,
                borderRadius: 3,
                background: 'rgba(240,237,230,0.1)',
                marginBottom: 6,
              }}
            />
            <div
              style={{
                width: '50%',
                height: 10,
                borderRadius: 3,
                background: 'rgba(240,237,230,0.1)',
                marginBottom: 18,
              }}
            />
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={{
                  width: 90,
                  height: 26,
                  borderRadius: 5,
                  background: clicked ? BLUE : MUTED,
                  border: `1px solid ${BLUE}70`,
                  transition: 'background 0.15s',
                }}
              />
              {clicked && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 90 * rippleS,
                    height: 90 * rippleS,
                    borderRadius: '50%',
                    border: `1.5px solid ${BLUE}`,
                    opacity: rippleOp * 0.7,
                    transform: 'translate(-50%,-50%)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => {
            const w1 = [80, 100, 70, 90, 60][i]
            const w2 = [110, 90, 120, 80, 100][i]
            return (
              <div
                key={i}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(240,237,230,0.04)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: 'rgba(240,237,230,0.07)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      width: w1,
                      height: 9,
                      borderRadius: 3,
                      background: 'rgba(240,237,230,0.18)',
                      marginBottom: 5,
                    }}
                  />
                  <div
                    style={{
                      width: w2,
                      height: 7,
                      borderRadius: 3,
                      background: 'rgba(240,237,230,0.08)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <svg
          style={{
            position: 'absolute',
            left: curX,
            top: curY,
            opacity: curOp,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
          width={20}
          height={24}
        >
          <polygon
            points="0,0 0,18 5,13 8,20 11,19 8,12 14,12"
            fill={TEXT}
            stroke="#000"
            strokeWidth={0.6}
          />
        </svg>
      </div>
    </div>
  )
}

function Scene02() {
  const { localTime: t, duration: dur } = useSprite()
  const sceneP = clamp((t - 1.0) / (dur - 1.8), 0, 1)
  return (
    <StepLayout
      num="02"
      title="You have a look"
      desc="I'll send you a link. Scroll through it, click around. Show your partner, show a mate. Take your time."
      localTime={t}
      dur={dur}
    >
      <ScrollBrowser progress={sceneP} />
    </StepLayout>
  )
}

// ─── SCENE 03: Chat messages ─────────────────────────────────────────────────
type Message = { from: 'client' | 'builder'; text: string; delay: number }
const MESSAGES: Message[] = [
  { from: 'client', text: 'Love it! Can we move the logo up a bit?', delay: 0.05 },
  { from: 'builder', text: 'Done — have a look at the updated version.', delay: 0.22 },
  { from: 'client', text: 'Perfect. Can we try a darker background?', delay: 0.4 },
  { from: 'builder', text: 'Done. Also tweaked the button colour to match.', delay: 0.56 },
  { from: 'client', text: "That's it. I'm happy — let's go!", delay: 0.72 },
  { from: 'builder', text: 'Brilliant. Sending everything over now.', delay: 0.85 },
]

function ChatBubble({ msg, visible }: { msg: Message; visible: boolean }) {
  const isClient = msg.from === 'client'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isClient ? 'flex-start' : 'flex-end',
        marginBottom: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      <div
        style={{
          maxWidth: '72%',
          background: isClient ? CARD : MUTED,
          border: `1px solid ${isClient ? 'rgba(240,237,230,0.08)' : BLUE + '40'}`,
          borderRadius: isClient ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          padding: '9px 14px',
          fontFamily: SANS,
          fontSize: 13.5,
          color: TEXT,
          lineHeight: 1.55,
        }}
      >
        {msg.text}
      </div>
    </div>
  )
}

function ChatWindow({ progress: p }: { progress: number }) {
  return (
    <div
      style={{
        width: 460,
        background: '#1d1d21',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: '#252529',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(240,237,230,0.07)',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: MUTED,
            border: `1px solid ${BLUE}50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: BLUE, opacity: 0.5 }} />
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: TEXT, fontWeight: 500 }}>Your builder</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: TEXT2 }}>online</div>
        </div>
      </div>
      <div style={{ padding: '16px 14px', minHeight: 240 }}>
        {MESSAGES.map((msg, i) => (
          <ChatBubble key={i} msg={msg} visible={p > msg.delay} />
        ))}
      </div>
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid rgba(240,237,230,0.07)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#141417',
            borderRadius: 20,
            height: 32,
            border: '1px solid rgba(240,237,230,0.1)',
          }}
        />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: MUTED,
            border: `1px solid ${BLUE}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7l10-5-5 10-1.5-4L2 7z"
              stroke={BLUE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

function Scene03() {
  const { localTime: t, duration: dur } = useSprite()
  const sceneP = clamp((t - 1.0) / (dur - 1.8), 0, 1)
  return (
    <StepLayout
      num="03"
      title="We fine-tune it"
      desc="A few rounds of back and forth until it's exactly right. Move this, change that. I handle every tweak."
      localTime={t}
      dur={dur}
    >
      <ChatWindow progress={sceneP} />
    </StepLayout>
  )
}

// ─── SCENE 04: Ready to get started? ─────────────────────────────────────────
function Scene04() {
  const { localTime: t, duration: dur } = useSprite()
  const labelOp = fIn(t, 0.1, 0.5)
  const headOp = fIn(t, 0.45, 0.65)
  const headY = (1 - headOp) * 22
  const subOp = fIn(t, 0.75, 0.55)
  const subY = (1 - subOp) * 12
  const btnOp = fIn(t, 1.0, 0.55)
  const exitOp = fOut(t, dur, 0.55)
  const ulW = eoc(clamp((t - 1.6) / 0.7, 0, 1))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity: exitOp,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: BLUE,
          textTransform: 'uppercase',
          marginBottom: 28,
          opacity: labelOp,
        }}
      >
        Step 04
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 68,
            color: TEXT,
            lineHeight: 1.08,
            opacity: headOp,
            transform: `translateY(${headY}px)`,
            maxWidth: 680,
          }}
        >
          Ready to get started?
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${ulW * 100}%`,
            height: 2,
            background: `linear-gradient(90deg, ${BLUE}, rgba(74,114,224,0))`,
            borderRadius: 1,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 19,
          color: TEXT2,
          marginTop: 32,
          marginBottom: 44,
          opacity: subOp,
          transform: `translateY(${subY}px)`,
        }}
      >
        No upfront payment. No contract. Just a link.
      </div>
      <div
        style={{
          opacity: btnOp,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: BLUE,
          color: TEXT,
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 500,
          padding: '14px 36px',
          borderRadius: 50,
          letterSpacing: '0.02em',
          boxShadow: `0 0 40px rgba(74,114,224,0.35)`,
        }}
      >
        Get in touch
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots() {
  const time = useTime()
  const active = time < 2.26 ? -1 : time < 11.2 ? 0 : time < 19.53 ? 1 : time < 27.52 ? 2 : 3
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: active === i ? 26 : 7,
            height: 7,
            borderRadius: 4,
            background: active === i ? BLUE : 'rgba(240,237,230,0.15)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

function Grid() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(240,237,230,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,230,0.022) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }}
    />
  )
}

// ─── Default export: section + Stage ─────────────────────────────────────────
export default function HowItWorksAnimation() {
  const wrapStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 980,
    margin: '0 auto',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
    background: BG,
  }

  return (
    <section id="how-it-works" style={{ padding: '96px 32px', background: 'var(--color-ink)' }}>
      <div className="max-w-[1100px] mx-auto">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 3vw, 36px)',
            fontWeight: 500,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: 40,
          }}
        >
          How it works
        </h2>
        <div style={wrapStyle}>
          <Stage
            width={1280}
            height={720}
            duration={TOTAL}
            background={BG}
            loop
            autoplay={false}
            audioSrc="/voiceover.mp3"
          >
            <Grid />
            <Sprite start={0} end={2.71}>
              <IntroScene />
            </Sprite>
            <Sprite start={2.23} end={11.0}>
              <Scene01 />
            </Sprite>
            <Sprite start={10.53} end={19.3}>
              <Scene02 />
            </Sprite>
            <Sprite start={18.82} end={27.43}>
              <Scene03 />
            </Sprite>
            <Sprite start={26.94} end={34.3}>
              <Scene04 />
            </Sprite>
            <ProgressDots />
          </Stage>
        </div>
      </div>
    </section>
  )
}
