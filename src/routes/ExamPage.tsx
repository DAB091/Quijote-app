import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { useExamTimer } from '@/utils/useExamTimer'
import { PhaseNav } from '@/components/layout/PhaseNav'
import { Phase1 } from '@/features/phase1/Phase1'
import { Phase2 } from '@/features/phase2/Phase2'
import { Phase3 } from '@/features/phase3/Phase3'
import { Phase4 } from '@/features/phase4/Phase4'
import { Phase5 } from '@/features/phase5/Phase5'

export function ExamPage() {
  const { examStarted, examFinished, currentPhase } = useExamStore()
  const navigate = useNavigate()
  useExamTimer() // Starts the countdown, handles auto-submit

  useEffect(() => {
    if (!examStarted) navigate('/')
  }, [examStarted, navigate])

  useEffect(() => {
    if (examFinished) navigate('/results')
  }, [examFinished, navigate])

  const PHASE_MAP: Record<number, React.ReactNode> = {
    1: <Phase1 />,
    2: <Phase2 />,
    3: <Phase3 />,
    4: <Phase4 />,
    5: <Phase5 />,
  }

  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto',
      padding: 'var(--space-8)',
      display: 'grid',
      gridTemplateColumns: '196px 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start',
    }}>
      {/* Sidebar — phase navigation */}
      <aside style={{ position: 'sticky', top: 80 }}>
        <PhaseNav />
      </aside>

      {/* Main content — active phase */}
      <main>
        {PHASE_MAP[currentPhase] ?? <Phase1 />}
      </main>
    </div>
  )
}
