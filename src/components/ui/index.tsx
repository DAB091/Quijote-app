// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS — Reusable, typed, style-isolated
// ═══════════════════════════════════════════════════════════════
import React from 'react'

// ── Button ─────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary', size = 'md', fullWidth = false,
  children, style, ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 500,
    cursor: 'pointer', border: 'none', borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : undefined,
    letterSpacing: '0.02em',
  }
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 15 },
    md: { padding: '10px 22px', fontSize: 17 },
    lg: { padding: '14px 32px', fontSize: 18 },
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--ink-800)', color: 'var(--parchment-50)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--parchment-100)', color: 'var(--ink-700)',
      border: '1px solid var(--ink-200)',
    },
    ghost: {
      background: 'transparent', color: 'var(--ink-600)',
      border: '1px solid var(--ink-200)',
    },
    danger: {
      background: 'var(--vermillion)', color: '#fff',
      boxShadow: 'var(--shadow-sm)',
    },
  }

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Card ───────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  elevated?: boolean
  className?: string
}

export function Card({ children, style, elevated = false, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--parchment-50)',
        border: 'var(--border-light)',
        borderRadius: 'var(--radius-md)',
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  color?: 'default' | 'green' | 'red' | 'blue' | 'gold'
}

const badgeColors: Record<string, React.CSSProperties> = {
  default: { background: 'var(--parchment-400)', color: 'var(--ink-700)' },
  green:   { background: 'var(--emerald-bg)',    color: 'var(--emerald)' },
  red:     { background: 'var(--vermillion-bg)', color: 'var(--vermillion)' },
  blue:    { background: 'var(--sapphire-bg)',   color: 'var(--sapphire)' },
  gold:    { background: '#fef3cd',              color: 'var(--gold)' },
}

export function Badge({ children, color = 'default' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 13,
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      ...badgeColors[color],
    }}>
      {children}
    </span>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
interface ProgressBarProps {
  value: number  // 0–100
  color?: string
  height?: number
  showLabel?: boolean
}

export function ProgressBar({ value, color = 'var(--ink-600)', height = 6, showLabel }: ProgressBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        flex: 1, height, background: 'var(--ink-100)',
        borderRadius: height, overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%', background: color,
          borderRadius: height,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', minWidth: 36 }}>
          {value}%
        </span>
      )}
    </div>
  )
}

// ── Phase Header ───────────────────────────────────────────────
interface PhaseHeaderProps {
  phase: number
  title: string
  subtitle: string
  total: number
}

export function PhaseHeader({ phase, title, subtitle, total }: PhaseHeaderProps) {
  return (
    <div style={{
      borderBottom: 'var(--border-light)',
      paddingBottom: 'var(--space-6)',
      marginBottom: 'var(--space-8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--parchment-400)',
              background: 'var(--ink-800)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
            }}>
              Fase {phase} de 5
            </span>
          </div>
          <h2 style={{ marginBottom: 6 }}>{title}</h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 16, fontStyle: 'italic' }}>{subtitle}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--ink-400)',
          }}>
            {total} {total === 1 ? 'pregunta' : 'preguntas'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────
export function Divider({ style }: { style?: React.CSSProperties }) {
  return (
    <hr style={{
      border: 'none',
      borderTop: 'var(--border-hairline)',
      margin: 'var(--space-6) 0',
      ...style,
    }} />
  )
}

// ── Section Label ──────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--ink-400)',
      marginBottom: 'var(--space-3)',
    }}>
      {children}
    </p>
  )
}
