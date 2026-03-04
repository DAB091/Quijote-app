// ═══════════════════════════════════════════════════════════════
// GLOBAL EXAM STORE — Zustand
// Manages all exam state. UI components should never contain
// business logic — only read from and dispatch to this store.
// ═══════════════════════════════════════════════════════════════
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EvaluationResult } from '@/features/evaluation/evaluationEngine'

// ── State shape ────────────────────────────────────────────────
export interface Phase1Answers {
  [fragmentId: string]: string // fragmentId → selected voiceId
}

export interface Phase2Answers {
  [questionId: string]: string | null // questionId → selected parentId
}

export interface Phase3Answers {
  [voiceId: string]: number // voiceId → assigned level (0–3)
}

export interface Phase4Answers {
  [relationId: string]: boolean // relationId → flagged as error
}

export interface StudentTreeNode {
  id: string
  parent: string | null
}

export interface ExamAnswers {
  phase1: Phase1Answers
  phase2: Phase2Answers
  phase3: Phase3Answers
  phase4: Phase4Answers
}

export interface ExamState {
  // Navigation
  currentPhase: number

  // Timer
  timeLeft: number
  timerActive: boolean

  // Lifecycle flags
  examStarted: boolean
  examFinished: boolean

  // All phase answers
  answers: ExamAnswers

  // Phase 5 tree structure
  studentTree: StudentTreeNode[]

  // Post-submission evaluation
  evaluation: EvaluationResult | null
}

// ── Actions shape ──────────────────────────────────────────────
export interface ExamActions {
  startExam: () => void
  finishExam: () => void
  goToPhase: (phase: number) => void
  tickTimer: () => void

  setPhase1Answer: (fragmentId: string, voiceId: string) => void
  setPhase2Answer: (questionId: string, parentId: string | null) => void
  setPhase3Answer: (voiceId: string, level: number) => void
  setPhase4Answer: (relationId: string, flagged: boolean) => void
  setStudentTree: (tree: StudentTreeNode[]) => void
  setEvaluation: (result: EvaluationResult) => void

  resetExam: () => void
}

export type ExamStore = ExamState & ExamActions

// ── Initial state ──────────────────────────────────────────────
const INITIAL_STATE: ExamState = {
  currentPhase: 1,
  timeLeft: 1800,
  timerActive: false,
  examStarted: false,
  examFinished: false,
  answers: {
    phase1: {},
    phase2: {},
    phase3: {},
    phase4: {},
  },
  studentTree: [],
  evaluation: null,
}

// ── Store ──────────────────────────────────────────────────────
export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      startExam: () =>
        set({
          examStarted: true,
          timerActive: true,
          currentPhase: 1,
          timeLeft: 1800,
        }),

      finishExam: () =>
        set({ examFinished: true, timerActive: false }),

      goToPhase: (phase) => {
        if (get().examFinished) return
        set({ currentPhase: phase })
      },

      tickTimer: () => {
        const { timeLeft, examFinished } = get()
        if (examFinished) return
        if (timeLeft <= 1) {
          set({ timeLeft: 0, timerActive: false, examFinished: true })
        } else {
          set({ timeLeft: timeLeft - 1 })
        }
      },

      setPhase1Answer: (fragmentId, voiceId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            phase1: { ...state.answers.phase1, [fragmentId]: voiceId },
          },
        })),

      setPhase2Answer: (questionId, parentId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            phase2: { ...state.answers.phase2, [questionId]: parentId },
          },
        })),

      setPhase3Answer: (voiceId, level) =>
        set((state) => ({
          answers: {
            ...state.answers,
            phase3: { ...state.answers.phase3, [voiceId]: level },
          },
        })),

      setPhase4Answer: (relationId, flagged) =>
        set((state) => ({
          answers: {
            ...state.answers,
            phase4: { ...state.answers.phase4, [relationId]: flagged },
          },
        })),

      setStudentTree: (tree) => set({ studentTree: tree }),

      setEvaluation: (result) => set({ evaluation: result }),

      resetExam: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'quijote-exam-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist relevant keys to avoid stale timer state
      partialize: (state) => ({
        currentPhase: state.currentPhase,
        examStarted: state.examStarted,
        examFinished: state.examFinished,
        answers: state.answers,
        studentTree: state.studentTree,
        evaluation: state.evaluation,
        // timeLeft is NOT persisted: timer re-syncs on mount
      }),
    }
  )
)

// ── Derived selectors (avoids re-render on unrelated changes) ──
export const selectAnswersComplete = (phase: number) => (state: ExamStore): boolean => {
  switch (phase) {
    case 1: return Object.keys(state.answers.phase1).length >= 5
    case 2: return Object.keys(state.answers.phase2).length >= 5
    case 3: return Object.keys(state.answers.phase3).length >= 5
    case 4: return Object.keys(state.answers.phase4).length >= 4
    case 5: return state.studentTree.length >= 5
    default: return false
  }
}
