import { useExamStore } from '@/store/examStore'
import { relationQuestions, canonicalVoices, voiceById } from '@/data/canonicalData'
import { Card, PhaseHeader, Button } from '@/components/ui'

export function Phase2() {
  const { answers, setPhase2Answer, goToPhase, examFinished } = useExamStore()
  const answered = Object.keys(answers.phase2).length

  // Parent options include all voices + "ninguno (raíz)"
  const parentOptions: Array<{ id: string | null; label: string }> = [
    { id: null, label: '— Ninguno (es la raíz)' },
    ...canonicalVoices.map((v) => ({ id: v.id, label: v.label })),
  ]

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <PhaseHeader
        phase={2}
        title="Relaciones de Dependencia"
        subtitle="Indica de qué voz narrativa depende cada instancia. La raíz no tiene padre."
        total={relationQuestions.length}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {relationQuestions.map((q, i) => {
          const child = voiceById[q.childId]
          const selected = answers.phase2[q.id]
          const isAnswered = q.id in answers.phase2

          return (
            <Card key={q.id} style={{
              padding: 'var(--space-6)',
              animation: `fadeUp 0.35s ${i * 0.07}s ease both`,
              borderLeft: `3px solid ${isAnswered ? 'var(--emerald)' : 'var(--ink-200)'}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--ink-300)',
                    marginBottom: 6,
                  }}>
                    Pregunta {i + 1}
                  </p>
                  <p style={{ fontSize: 17, color: 'var(--ink-700)', lineHeight: 1.6 }}>
                    {q.prompt}
                  </p>
                </div>

                {/* Voice being classified */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--parchment-200)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-hairline)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Voz:</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                    color: 'var(--ink-800)',
                  }}>
                    {child?.label ?? q.childId}
                  </span>
                  <span style={{ fontStyle: 'italic', color: 'var(--ink-400)', fontSize: 14 }}>
                    — {child?.description}
                  </span>
                </div>

                {/* Parent selector */}
                <div>
                  <label style={{
                    display: 'block', fontFamily: 'var(--font-mono)',
                    fontSize: 11, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--ink-400)',
                    marginBottom: 8,
                  }}>
                    Depende de:
                  </label>
                  <select
                    disabled={examFinished}
                    value={isAnswered ? (selected === null ? '__null__' : (selected as string)) : ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setPhase2Answer(q.id, val === '__null__' ? null : val || null)
                    }}
                    style={{
                      width: '100%', maxWidth: 360,
                      padding: '10px 14px',
                      fontFamily: 'var(--font-body)', fontSize: 16,
                      border: 'var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--parchment-50)',
                      color: 'var(--ink-700)',
                      appearance: 'none',
                      cursor: examFinished ? 'default' : 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="">— Selecciona una opción —</option>
                    {parentOptions
                      .filter((opt) => opt.id !== q.childId)
                      .map((opt) => (
                        <option key={String(opt.id)} value={opt.id === null ? '__null__' : opt.id}>
                          {opt.label}
                        </option>
                      ))
                    }
                  </select>
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
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="sm" onClick={() => goToPhase(1)}>← Fase 1</Button>
        </div>
        <span style={{ fontSize: 14, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
          {answered} / {relationQuestions.length}
        </span>
        <Button onClick={() => goToPhase(3)}>Fase 3 →</Button>
      </div>
    </div>
  )
}
