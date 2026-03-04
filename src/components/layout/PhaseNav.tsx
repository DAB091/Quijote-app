import { useExamStore, selectAnswersComplete } from '@/store/examStore'

const PHASES = [
  { num: 1, label: 'Reconocimiento', short: 'Voces' },
  { num: 2, label: 'Dependencias', short: 'Relaciones' },
  { num: 3, label: 'Niveles', short: 'Clasificación' },
  { num: 4, label: 'Errores', short: 'Detección' },
  { num: 5, label: 'Árbol final', short: 'Constructor' },
]

export function PhaseNav() {
  const { currentPhase, goToPhase, examFinished } = useExamStore()

  return (
    <nav style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: 'var(--space-4)',
      background: 'var(--parchment-100)',
      border: 'var(--border-light)',
      borderRadius: 'var(--radius-md)',
      minWidth: 180,
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-300)', marginBottom: 8, paddingBottom: 8,
        borderBottom: 'var(--border-hairline)',
      }}>
        Fases
      </p>
      {PHASES.map((phase) => {
        const isActive = phase.num === currentPhase
        const isDone = examFinished || phase.num < currentPhase
        const isComplete = useExamStore(selectAnswersComplete(phase.num))

        return (
          <button
            key={phase.num}
            onClick={() => !examFinished && goToPhase(phase.num)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--ink-800)' : 'transparent',
              cursor: examFinished ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'background var(--transition-fast)',
            }}
          >
            {/* Phase number circle */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              background: isActive
                ? 'var(--gold)'
                : isDone && isComplete
                  ? 'var(--emerald)'
                  : 'var(--ink-200)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: isActive || isDone ? '#fff' : 'var(--ink-500)',
            }}>
              {isDone && isComplete && !isActive ? '✓' : phase.num}
            </div>
            <div>
              <div style={{
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--parchment-200)' : 'var(--ink-600)',
                lineHeight: 1.2,
              }}>
                {phase.label}
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )
}
