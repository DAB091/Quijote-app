# Voces Narrativas — Don Quijote
### Examen Académico Interactivo (Frontend-only)

A production-grade, fully self-contained React + Vite + TypeScript exam application. No backend, no database, no external services required.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173
```

---

## Project Structure

```
src/
├── styles/
│   └── global.css              # Design system: CSS variables, typography, base styles
│
├── data/
│   └── canonicalData.ts        # 📌 CANONICAL REFERENCE: voices, fragments, questions
│
├── store/
│   └── examStore.ts            # Zustand store with localStorage persistence
│
├── utils/
│   └── useExamTimer.ts         # Countdown hook, auto-submit, formatting
│
├── components/
│   ├── ui/
│   │   └── index.tsx           # Button, Card, Badge, ProgressBar, PhaseHeader
│   └── layout/
│       ├── Header.tsx          # Sticky header with logo + timer
│       └── PhaseNav.tsx        # Sidebar navigation
│
├── features/
│   ├── phase1/Phase1.tsx       # Voice recognition (multiple choice)
│   ├── phase2/Phase2.tsx       # Dependency relations (dropdown selector)
│   ├── phase3/Phase3.tsx       # Level classification (0–3 buttons)
│   ├── phase4/Phase4.tsx       # Error detection (flag incorrect relations)
│   ├── phase5/Phase5.tsx       # React Flow tree builder
│   ├── evaluation/
│   │   └── evaluationEngine.ts # Pure scoring functions — zero UI coupling
│   └── results/
│       ResultsPage.tsx          # Full breakdown + tree comparison
│
├── routes/
│   ├── AppRouter.tsx           # Route definitions
│   ├── LandingPage.tsx         # Home / start screen
│   └── ExamPage.tsx            # Exam shell + phase switcher
│
└── main.tsx                    # Entry point
```

---

## Architecture Principles

### Separation of Concerns
- **`evaluationEngine.ts`** contains zero React imports. All scoring is pure: `(answers) → scores`. Fully unit-testable.
- **`canonicalData.ts`** is the single source of truth. Changing this file changes the entire exam.
- **`examStore.ts`** owns all state. Components only read/dispatch — never own logic.

### State Management (Zustand)
```ts
// All exam state lives here:
const { currentPhase, timeLeft, answers, studentTree, evaluation } = useExamStore()

// Persisted to localStorage (except timer):
// currentPhase, examStarted, examFinished, answers, studentTree, evaluation
```

### Timer
- Starts when `startExam()` is called
- Ticks every second via `setInterval`
- At `timeLeft === 0`: runs full evaluation, saves to store, navigates to `/results`
- Manual submit available from Phase 5

### Evaluation Flow
```
User submits → runFullEvaluation(answers, studentTree)
             → evaluatePhaseOne()   → PhaseResult
             → evaluatePhaseTwo()   → PhaseResult
             → evaluatePhaseThree() → PhaseResult
             → evaluatePhaseFour()  → PhaseResult
             → evaluateTreeStructure() → { results, accuracy }
             → Weighted total score
             → setEvaluation(result) → stored in Zustand
```

### Score Weights
| Phase | Description | Weight |
|-------|-------------|--------|
| 1 | Voice Recognition | 20% |
| 2 | Dependency Relations | 20% |
| 3 | Level Classification | 15% |
| 4 | Error Detection | 15% |
| 5 | Tree Structure | 30% |

---

## Extending the Exam

### Add a new narrative voice:
```ts
// src/data/canonicalData.ts
export const canonicalVoices = [
  ...
  {
    id: 'new-voice',
    label: 'Nueva voz',
    description: 'Descripción narratológica',
    parent: 'existing-voice-id',  // or null for root
    level: 2,
    levelLabel: 'Nivel 2 — Descripción',
  }
]
```

### Add a new question to Phase 1:
```ts
export const narrativeFragments = [
  ...
  {
    id: 'f6',
    text: '«Nuevo fragmento de texto...»',
    attribution: 'Capítulo X',
    correctVoiceId: 'cide',
    distractors: ['editor', 'traductor', 'cervantes'],
  }
]
```

---

## Migrating to Full-Stack

The architecture is designed for this. When ready:

1. **`canonicalData.ts`** → seed SQL migration
2. **`evaluationEngine.ts`** → move to backend service (zero changes needed)
3. **`examStore.ts`** → replace `localStorage` persistence with API calls
4. Add `userId`, `sessionId` fields to answers shape

---

## Available Scripts

```bash
npm run dev          # Development server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
npm run type-check   # TypeScript validation only
```
