import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { LandingPage } from './LandingPage'
import { ExamPage } from './ExamPage'
import { ResultsPage } from '@/features/results/ResultsPage'

export function AppRouter() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--ink-100)',
        padding: 'var(--space-5) var(--space-8)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--ink-300)',
        }}>
          Voces Narrativas — Don Quijote de la Mancha
          <span style={{ margin: '0 12px', color: 'var(--ink-200)' }}>·</span>
          Evaluación Académica Interactiva
          <span style={{ margin: '0 12px', color: 'var(--ink-200)' }}>·</span>
          Miguel de Cervantes Saavedra
        </p>
      </footer>
    </div>
  )
}
