import { useExamStore } from '@/store/examStore'
import { errorTreeRelations, voiceById } from '@/data/canonicalData'
import { Card, PhaseHeader, Button } from '@/components/ui'

export function Phase4() {
  const { answers, setPhase4Answer, goToPhase, examFinished } = useExamStore()
  const answered = Object.keys(answers.phase4).length

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <PhaseHeader
        phase={4}
        title="Detección de Errores"
        subtitle="El siguiente árbol narrativo contiene relaciones incorrectas. Identifica cuáles son erróneas."
        total={errorTreeRelations.length}
      />

      {/* Alert banner */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        background: '#fff8e1',
        border: '1px solid #ffe082',
        borderLeft: '4px solid var(--gold)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-6)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--ink-700)', fontSize: 15, marginBottom: 4 }}>
            Árbol con errores intencionales
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6 }}>
            Algunas de las siguientes relaciones presentadas son incorrectas desde el punto de vista narratológico.
            Marca con ✗ las que consideres erróneas. Deja sin marcar las que sean correctas.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {errorTreeRelations.map((rel, i) => {
          const child = voiceById[rel.childId]
          const parent = rel.presentedParentId ? voiceById[rel.presentedParentId] : null
          const isFlagged = answers.phase4[rel.id] === true

          return (
            <Card key={rel.id} style={{
              padding: 'var(--space-4) var(--space-5)',
              animation: `fadeUp 0.3s ${i * 0.06}s ease both`,
              border: `1.5px solid ${isFlagged ? 'var(--vermillion)' : 'var(--ink-200)'}`,
              background: isFlagged ? 'var(--vermillion-bg)' : 'var(--parchment-50)',
              transition: 'all var(--transition-fast)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 'var(--space-4)', flexWrap: 'wrap',
              }}>
                {/* Relation diagram */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    padding: '6px 14px',
                    background: 'var(--parchment-200)',
                    border: 'var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Padre</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-800)' }}>
                      {parent?.label ?? '(raíz — sin padre)'}
                    </span>
                  </div>

                  <span style={{ color: 'var(--ink-300)', fontSize: 20 }}>→</span>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    padding: '6px 14px',
                    background: 'var(--parchment-200)',
                    border: 'var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hijo</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-800)' }}>
                      {child?.label ?? rel.childId}
                    </span>
                  </div>
                </div>

                {/* Error toggle button */}
                <button
                  disabled={examFinished}
                  onClick={() => setPhase4Answer(rel.id, !isFlagged)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${isFlagged ? 'var(--vermillion)' : 'var(--ink-200)'}`,
                    background: isFlagged ? 'var(--vermillion)' : 'var(--parchment-100)',
                    color: isFlagged ? '#fff' : 'var(--ink-500)',
                    fontFamily: 'var(--font-body)', fontSize: 15,
                    fontWeight: isFlagged ? 600 : 400,
                    cursor: examFinished ? 'default' : 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    minWidth: 140,
                    justifyContent: 'center',
                  }}
                >
                  {isFlagged ? '✗ Error marcado' : '○ Sin error'}
                </button>
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
        <Button variant="ghost" size="sm" onClick={() => goToPhase(3)}>← Fase 3</Button>
        <span style={{ fontSize: 14, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
          {answered} / {errorTreeRelations.length} revisadas
        </span>
        <Button onClick={() => goToPhase(5)}>Fase 5 — Árbol →</Button>
      </div>
    </div>
  )
}
