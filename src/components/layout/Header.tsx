import { useExamStore } from '@/store/examStore'
import { formatTime, timeIsUrgent } from '@/utils/useExamTimer'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { timeLeft, examStarted, examFinished } = useExamStore()
  const location = useLocation()
  const showTimer = examStarted && !examFinished && location.pathname === '/exam'
  const urgent = timeIsUrgent(timeLeft)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--ink-900)',
      borderBottom: '1px solid var(--ink-700)',
    }}>
      {/* Gold accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--gold) 0%, var(--parchment-800) 50%, var(--gold) 100%)' }} />

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 var(--space-8)',
        height: 64,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 'var(--space-4)',
      }}>
        {/* Left — Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {/* Logo: rendered as text emblem since no logo.png in dev */}
            <div style={{
              width: 36, height: 36,
              background: 'var(--gold)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 700,
                color: 'var(--ink-900)',
                letterSpacing: '-0.02em',
              }}>Q</span>
            </div>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: 32, display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </Link>
        </div>

        {/* Center — Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(13px, 2vw, 17px)',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: 'var(--parchment-200)',
            whiteSpace: 'nowrap',
          }}>
            Examen Interactivo
            <span style={{ color: 'var(--parchment-600)', fontWeight: 300 }}> — </span>
            Voces Narrativas
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ink-400)',
            marginTop: 2,
          }}>
            Don Quijote de la Mancha
          </p>
        </div>

        {/* Right — Timer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {showTimer && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '4px 16px',
              border: `1px solid ${urgent ? 'var(--vermillion)' : 'var(--ink-600)'}`,
              borderRadius: 'var(--radius-sm)',
              background: urgent ? 'rgba(192,57,43,0.15)' : 'var(--ink-800)',
              transition: 'all 0.3s',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22, fontWeight: 500,
                color: urgent ? '#ff6b6b' : 'var(--parchment-200)',
                letterSpacing: '0.08em',
                lineHeight: 1.2,
                animation: urgent && timeLeft <= 60 ? 'pulse 1s infinite' : undefined,
              }}>
                {formatTime(timeLeft)}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: urgent ? 'var(--vermillion)' : 'var(--ink-400)',
              }}>
                {urgent ? '¡Tiempo!' : 'Tiempo'}
              </span>
            </div>
          )}
          {examFinished && (
            <div style={{
              padding: '4px 16px',
              border: '1px solid var(--emerald)',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(26,107,60,0.15)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13,
                color: 'var(--emerald-light)', letterSpacing: '0.08em',
              }}>
                ✓ Completado
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
