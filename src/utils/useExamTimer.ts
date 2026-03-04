// ═══════════════════════════════════════════════════════════════
// useExamTimer — Manages countdown, auto-submit, and formatting
// Isolated from UI concerns. Reads from and writes to the store.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { runFullEvaluation } from '@/features/evaluation/evaluationEngine'

export function useExamTimer() {
  const {
    timerActive, examFinished, tickTimer,
    finishExam, setEvaluation,
    answers, studentTree,
  } = useExamStore()
  const navigate = useNavigate()
  const hasAutoSubmitted = useRef(false)

  useEffect(() => {
    if (!timerActive || examFinished) return

    const interval = setInterval(() => {
      tickTimer()
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, examFinished, tickTimer])

  // Auto-submit when timer reaches 0
  useEffect(() => {
    const state = useExamStore.getState()
    if (state.timeLeft <= 0 && !hasAutoSubmitted.current && state.examStarted) {
      hasAutoSubmitted.current = true
      const result = runFullEvaluation(
        state.answers.phase1,
        state.answers.phase2,
        state.answers.phase3,
        state.answers.phase4,
        state.studentTree
      )
      setEvaluation(result)
      finishExam()
      navigate('/results')
    }
  })

  // Manual submit (callable from phase 5 or header)
  const submitExam = () => {
    if (hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    const state = useExamStore.getState()
    const result = runFullEvaluation(
      answers.phase1,
      answers.phase2,
      answers.phase3,
      answers.phase4,
      studentTree
    )
    setEvaluation(result)
    finishExam()
    navigate('/results')
  }

  return { submitExam }
}

// ── Formatting utility ─────────────────────────────────────────
export function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, '0')
  const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function timeIsUrgent(seconds: number): boolean {
  return seconds > 0 && seconds <= 300
}
