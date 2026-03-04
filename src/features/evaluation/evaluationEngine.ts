// ═══════════════════════════════════════════════════════════════
// EVALUATION ENGINE — Pure evaluation logic
// No UI imports. No side effects. Fully testable in isolation.
// All functions are pure: (answers, canonical) → score
// ═══════════════════════════════════════════════════════════════
import {
  canonicalVoices,
  voiceById,
  narrativeFragments,
  relationQuestions,
  errorTreeRelations,
} from '@/data/canonicalData'
import type {
  Phase1Answers,
  Phase2Answers,
  Phase3Answers,
  Phase4Answers,
  StudentTreeNode,
} from '@/store/examStore'

// ── Result Types ───────────────────────────────────────────────
export interface PhaseResult {
  score: number        // 0–100
  correct: number
  total: number
  detail: PhaseDetail[]
}

export interface PhaseDetail {
  id: string
  label: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface TreeNodeResult {
  id: string
  label: string
  studentParent: string | null
  correctParent: string | null
  isCorrect: boolean
}

export interface EvaluationResult {
  phase1: PhaseResult
  phase2: PhaseResult
  phase3: PhaseResult
  phase4: PhaseResult
  phaseScores: number[]           // [p1, p2, p3, p4] 0–100
  structuralAccuracy: number      // 0–1
  treeResults: TreeNodeResult[]
  totalScore: number              // 0–100 weighted
  grade: 'Sobresaliente' | 'Notable' | 'Aprobado' | 'Suspendido'
}

// ── Phase weights (must sum to 1) ──────────────────────────────
const WEIGHTS = {
  phase1: 0.20,
  phase2: 0.20,
  phase3: 0.15,
  phase4: 0.15,
  tree:   0.30,
}

// ── Helpers ────────────────────────────────────────────────────
function pct(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

function gradeFromScore(score: number): EvaluationResult['grade'] {
  if (score >= 90) return 'Sobresaliente'
  if (score >= 70) return 'Notable'
  if (score >= 50) return 'Aprobado'
  return 'Suspendido'
}

// ── Phase 1 — Voice Recognition ───────────────────────────────
export function evaluatePhaseOne(answers: Phase1Answers): PhaseResult {
  const detail: PhaseDetail[] = narrativeFragments.map((frag) => {
    const student = answers[frag.id] ?? ''
    const isCorrect = student === frag.correctVoiceId
    return {
      id: frag.id,
      label: frag.text.slice(0, 60) + '…',
      studentAnswer: voiceById[student]?.label ?? '(sin respuesta)',
      correctAnswer: voiceById[frag.correctVoiceId]?.label ?? frag.correctVoiceId,
      isCorrect,
    }
  })
  const correct = detail.filter((d) => d.isCorrect).length
  return { score: pct(correct, detail.length), correct, total: detail.length, detail }
}

// ── Phase 2 — Dependency Relations ────────────────────────────
export function evaluatePhaseTwo(answers: Phase2Answers): PhaseResult {
  const detail: PhaseDetail[] = relationQuestions.map((q) => {
    const student = answers[q.id] !== undefined ? answers[q.id] : '__unanswered__'
    const isCorrect = student === q.correctParentId
    return {
      id: q.id,
      label: q.prompt,
      studentAnswer: student !== null && student !== '__unanswered__'
        ? (voiceById[student as string]?.label ?? String(student))
        : '(ninguno / raíz)',
      correctAnswer: q.correctParentId !== null
        ? (voiceById[q.correctParentId]?.label ?? q.correctParentId)
        : '(ninguno — es la raíz)',
      isCorrect,
    }
  })
  const correct = detail.filter((d) => d.isCorrect).length
  return { score: pct(correct, detail.length), correct, total: detail.length, detail }
}

// ── Phase 3 — Level Classification ────────────────────────────
export function evaluatePhaseThree(answers: Phase3Answers): PhaseResult {
  const detail: PhaseDetail[] = canonicalVoices.map((voice) => {
    const student = answers[voice.id]
    const isCorrect = student === voice.level
    return {
      id: voice.id,
      label: voice.label,
      studentAnswer: student !== undefined ? `Nivel ${student}` : '(sin respuesta)',
      correctAnswer: `Nivel ${voice.level} — ${voice.levelLabel}`,
      isCorrect,
    }
  })
  const correct = detail.filter((d) => d.isCorrect).length
  return { score: pct(correct, detail.length), correct, total: detail.length, detail }
}

// ── Phase 4 — Error Detection ──────────────────────────────────
export function evaluatePhaseFour(answers: Phase4Answers): PhaseResult {
  const detail: PhaseDetail[] = errorTreeRelations.map((rel) => {
    const studentFlagged = answers[rel.id] === true
    const isCorrect = studentFlagged === rel.isError
    const child = voiceById[rel.childId]
    const parent = rel.presentedParentId ? voiceById[rel.presentedParentId] : null
    return {
      id: rel.id,
      label: `${child?.label ?? rel.childId} → ${parent?.label ?? 'raíz'}`,
      studentAnswer: studentFlagged ? 'Marcado como error' : 'No marcado',
      correctAnswer: rel.isError ? 'Es un error' : 'Es correcto',
      isCorrect,
    }
  })
  const correct = detail.filter((d) => d.isCorrect).length
  return { score: pct(correct, detail.length), correct, total: detail.length, detail }
}

// ── Phase 5 — Tree Structure ───────────────────────────────────
export function evaluateTreeStructure(studentTree: StudentTreeNode[]): {
  results: TreeNodeResult[]
  accuracy: number
} {
  const studentMap = new Map(studentTree.map((n) => [n.id, n.parent]))

  const results: TreeNodeResult[] = canonicalVoices.map((voice) => {
    const studentParent = studentMap.has(voice.id)
      ? (studentMap.get(voice.id) ?? null)
      : null
    const isCorrect = studentParent === voice.parent
    return {
      id: voice.id,
      label: voice.label,
      studentParent,
      correctParent: voice.parent,
      isCorrect,
    }
  })

  const correct = results.filter((r) => r.isCorrect).length
  const accuracy = canonicalVoices.length > 0 ? correct / canonicalVoices.length : 0

  return { results, accuracy }
}

// ── Full Evaluation ────────────────────────────────────────────
export function runFullEvaluation(
  phase1: Phase1Answers,
  phase2: Phase2Answers,
  phase3: Phase3Answers,
  phase4: Phase4Answers,
  studentTree: StudentTreeNode[]
): EvaluationResult {
  const p1 = evaluatePhaseOne(phase1)
  const p2 = evaluatePhaseTwo(phase2)
  const p3 = evaluatePhaseThree(phase3)
  const p4 = evaluatePhaseFour(phase4)
  const { results: treeResults, accuracy } = evaluateTreeStructure(studentTree)

  const totalScore = Math.round(
    p1.score * WEIGHTS.phase1 +
    p2.score * WEIGHTS.phase2 +
    p3.score * WEIGHTS.phase3 +
    p4.score * WEIGHTS.phase4 +
    accuracy * 100 * WEIGHTS.tree
  )

  return {
    phase1: p1,
    phase2: p2,
    phase3: p3,
    phase4: p4,
    phaseScores: [p1.score, p2.score, p3.score, p4.score],
    structuralAccuracy: accuracy,
    treeResults,
    totalScore,
    grade: gradeFromScore(totalScore),
  }
}
