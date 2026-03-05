import { useExamStore } from '@/store/examStore'
import { narrativeFragments, voiceById } from '@/data/canonicalData'
import { Card, PhaseHeader, Button } from '@/components/ui'

export function Phase1() {
  const { answers, setPhase1Answer, goToPhase, examFinished } = useExamStore()

  const answered = Object.keys(answers.phase1).length

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <PhaseHeader
        phase={1}
        title="Reconocimiento de Voces"
        subtitle="Identifica qué instancia narrativa corresponde a cada fragmento."
        total={narrativeFragments.length}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {narrativeFragments.map((fragment, i) => {
          const selected = answers.phase1[fragment.id]
          const options = [fragment.correctVoiceId, ...fragment.distractors]
            .sort(() => {
              // Deterministic shuffle by fragment id
              const seed = fragment.id.charCodeAt(1)
              return (seed % 2 === 0 ? 1 : -1)
            })

          return (
            <Card key={fragment.id} style={{ padding: 'var(--space-6)', animation: `fadeUp 0.35s ${i * 0.07}s ease both` }}>
              {/* Question number */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 'var(--space-4)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-300)',
                }}>
                  Fragmento {i + 1}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
              </div>

              {/* Fragment text */}
              <blockquote style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 17,
                lineHeight: 1.75,
                color: 'var(--ink-700)',
                borderLeft: '3px solid var(--gold)',
                paddingLeft: 'var(--space-5)',
                marginBottom: 'var(--space-2)',
              }}>
                {fragment.text}
              </blockquote>
              <p style={{
                fontSize: 13, color: 'var(--ink-300)',
                fontFamily: 'var(--font-mono)',
                paddingLeft: 'var(--space-5)',
                marginBottom: 'var(--space-5)',
              }}>
                — {fragment.attribution}
              </p>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-2)' }}>
                {options.map((voiceId) => {
                  const voice = voiceById[voiceId]
                  const isSelected = selected === voiceId
                  return (
                    <button
                      key={voiceId}
                      disabled={examFinished}
                      onClick={() => setPhase1Answer(fragment.id, voiceId)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${isSelected ? 'var(--ink-700)' : 'var(--ink-200)'}`,
                        background: isSelected ? 'var(--ink-800)' : 'var(--parchment-100)',
                        color: isSelected ? 'var(--parchment-200)' : 'var(--ink-600)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 15,
                        cursor: examFinished ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {voice?.label ?? voiceId}
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-6)',
        borderTop: 'var(--border-hairline)',
      }}>
        <span style={{ fontSize: 14, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
          {answered} / {narrativeFragments.length} respondidas
        </span>
        <Button onClick={() => goToPhase(2)}>
          Fase 2 →
        </Button>
      </div>
    </div>
  )
}
