import { useExamStore } from '@/store/examStore'
import { canonicalVoices } from '@/data/canonicalData'
import { Card, PhaseHeader, Button } from '@/components/ui'

const LEVEL_LABELS: Record<number, string> = {
  0: 'Nivel 0 — Autor real (extradiegético)',
  1: 'Nivel 1 — Narrador marco (intradiegético)',
  2: 'Nivel 2 — Narrador manuscrito',
  3: 'Nivel 3 — Voz diegética / personaje',
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'var(--vermillion)',
  1: 'var(--sapphire)',
  2: 'var(--emerald)',
  3: 'var(--gold)',
}

export function Phase3() {
  const { answers, setPhase3Answer, goToPhase, examFinished } = useExamStore()
  const answered = Object.keys(answers.phase3).length

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <PhaseHeader
        phase={3}
        title="Clasificación por Niveles"
        subtitle="Asigna el nivel narrativo diegético correcto a cada voz (0 = más externo)."
        total={canonicalVoices.length}
      />

      {/* Level reference */}
      <Card style={{
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-6)',
        background: 'var(--ink-900)',
        border: '1px solid var(--ink-700)',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-400)', marginBottom: 10,
        }}>
          Referencia de niveles
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(LEVEL_LABELS).map(([level, label]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: LEVEL_COLORS[Number(level)],
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: 'var(--parchment-400)' }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {canonicalVoices.map((voice, i) => {
          const selected = answers.phase3[voice.id]
          const isAnswered = voice.id in answers.phase3

          return (
            <Card key={voice.id} style={{
              padding: 'var(--space-5)',
              animation: `fadeUp 0.35s ${i * 0.07}s ease both`,
              borderLeft: `3px solid ${isAnswered ? LEVEL_COLORS[selected] ?? 'var(--emerald)' : 'var(--ink-200)'}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                gap: 'var(--space-5)', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 17, fontWeight: 600,
                    color: 'var(--ink-800)', marginBottom: 4,
                  }}>
                    {voice.label}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--ink-400)', fontStyle: 'italic' }}>
                    {voice.description}
                  </p>
                </div>

                {/* Level selector — radio buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[0, 1, 2, 3].map((level) => {
                    const isSelected = selected === level
                    return (
                      <button
                        key={level}
                        disabled={examFinished}
                        onClick={() => setPhase3Answer(voice.id, level)}
                        style={{
                          width: 44, height: 44,
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${isSelected ? LEVEL_COLORS[level] : 'var(--ink-200)'}`,
                          background: isSelected ? LEVEL_COLORS[level] : 'var(--parchment-100)',
                          color: isSelected ? '#fff' : 'var(--ink-500)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 16, fontWeight: 600,
                          cursor: examFinished ? 'default' : 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title={LEVEL_LABELS[level]}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)',
        borderTop: 'var(--border-hairline)',
      }}>
        <Button variant="ghost" size="sm" onClick={() => goToPhase(2)}>← Fase 2</Button>
        <span style={{ fontSize: 14, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
          {answered} / {canonicalVoices.length}
        </span>
        <Button onClick={() => goToPhase(4)}>Fase 4 →</Button>
      </div>
    </div>
  )
}
