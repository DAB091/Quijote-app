import { useNavigate } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { Button, Card } from '@/components/ui'

const PHASE_DESCRIPTIONS = [
  { num: 1, title: 'Reconocimiento de voces', desc: 'Identifica qué voz narrativa corresponde a cada fragmento del texto.' },
  { num: 2, title: 'Relaciones de dependencia', desc: 'Determina qué voz actúa como autoridad narrativa de cada otra.' },
  { num: 3, title: 'Clasificación por niveles', desc: 'Asigna el nivel diegético correcto a cada voz (0–3).' },
  { num: 4, title: 'Detección de errores', desc: 'Señala las relaciones incorrectas en un árbol intencionalmente defectuoso.' },
  { num: 5, title: 'Constructor de árbol', desc: 'Reconstruye la jerarquía narrativa completa de forma interactiva.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { startExam, resetExam, examStarted, examFinished } = useExamStore()

  const handleStart = () => {
    resetExam()
    startExam()
    navigate('/exam')
  }

  const handleContinue = () => {
    navigate('/exam')
  }

  const handleViewResults = () => {
    navigate('/results')
  }

  return (
    <div style={{
      maxWidth: 820, margin: '0 auto',
      padding: 'var(--space-12) var(--space-8)',
      animation: 'fadeUp 0.5s ease both',
    }}>
      {/* Ornamental header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ink-300)',
          marginBottom: 'var(--space-4)',
        }}>
          Evaluación académica interactiva
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          color: 'var(--ink-900)',
          marginBottom: 'var(--space-3)',
        }}>
          Voces Narrativas
        </h1>

        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
          color: 'var(--ink-400)',
          fontWeight: 400,
          marginBottom: 'var(--space-6)',
        }}>
          El ingenioso hidalgo Don Quijote de la Mancha
        </p>

        {/* Decorative rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, transparent, var(--ink-200))' }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>✦</span>
          <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, var(--ink-200), transparent)' }} />
        </div>

        <p style={{
          fontSize: 18, color: 'var(--ink-500)',
          maxWidth: 520, margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Examen de <strong>30 minutos</strong> sobre la arquitectura narrativa de Cervantes.
          Cinco fases progresivas que evalúan la comprensión de la jerarquía de voces.
        </p>
      </div>

      {/* Phase overview */}
      <div style={{
        display: 'grid', gap: 'var(--space-3)',
        marginBottom: 'var(--space-10)',
      }}>
        {PHASE_DESCRIPTIONS.map((phase, i) => (
          <Card
            key={phase.num}
            style={{
              padding: 'var(--space-4) var(--space-5)',
              display: 'grid',
              gridTemplateColumns: '32px 1fr',
              gap: 'var(--space-4)',
              alignItems: 'start',
              animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: 'var(--ink-800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontWeight: 600,
              fontSize: 13, color: 'var(--gold)',
              flexShrink: 0,
            }}>
              {phase.num}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink-800)', marginBottom: 2 }}>
                {phase.title}
              </p>
              <p style={{ fontSize: 15, color: 'var(--ink-400)', lineHeight: 1.5 }}>
                {phase.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Exam info strip */}
      <Card style={{
        padding: 'var(--space-5) var(--space-6)',
        marginBottom: 'var(--space-8)',
        display: 'flex', gap: 'var(--space-8)',
        flexWrap: 'wrap',
        background: 'var(--ink-900)',
        border: '1px solid var(--ink-700)',
      }}>
        {[
          { label: 'Duración', value: '30 minutos' },
          { label: 'Fases', value: '5 secciones' },
          { label: 'Envío', value: 'Auto al terminar' },
          { label: 'Resultado', value: 'Inmediato' },
        ].map((item) => (
          <div key={item.label}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 4 }}>
              {item.label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--parchment-200)', fontWeight: 500 }}>
              {item.value}
            </p>
          </div>
        ))}
      </Card>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {examFinished ? (
          <>
            <Button variant="ghost" onClick={handleViewResults} size="lg">
              Ver resultados
            </Button>
            <Button onClick={handleStart} size="lg">
              Nuevo examen
            </Button>
          </>
        ) : examStarted ? (
          <>
            <Button variant="ghost" onClick={handleStart} size="lg">
              Reiniciar
            </Button>
            <Button onClick={handleContinue} size="lg">
              Continuar examen →
            </Button>
          </>
        ) : (
          <Button onClick={handleStart} size="lg" style={{ minWidth: 220 }}>
            Comenzar Examen →
          </Button>
        )}
      </div>
    </div>
  )
}
