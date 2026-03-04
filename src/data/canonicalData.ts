// ═══════════════════════════════════════════════════════════════
// CANONICAL DATA — Voces Narrativas de Don Quijote
// This module is the authoritative reference for evaluation.
// All evaluation logic compares student answers against these.
// ═══════════════════════════════════════════════════════════════

export interface CanonicalVoice {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly parent: string | null
  readonly level: number
  readonly levelLabel: string
}

export interface NarrativeFragment {
  readonly id: string
  readonly text: string
  readonly attribution: string
  readonly correctVoiceId: string
  readonly distractors: string[]
}

export interface RelationQuestion {
  readonly id: string
  readonly childId: string
  readonly correctParentId: string | null
  readonly prompt: string
}

export interface LevelQuestion {
  readonly id: string
  readonly voiceId: string
  readonly correctLevel: number
}

export interface ErrorRelation {
  readonly id: string
  readonly childId: string
  readonly wrongParentId: string | null
  readonly isError: boolean
}

// ── Canonical Narrative Hierarchy ─────────────────────────────
export const canonicalVoices: readonly CanonicalVoice[] = [
  {
    id: 'cervantes',
    label: 'Miguel de Cervantes',
    description: 'El autor histórico y real de la obra. Voz extradiegética primaria.',
    parent: null,
    level: 0,
    levelLabel: 'Nivel 0 — Autor real',
  },
  {
    id: 'editor',
    label: 'Editor ficticio',
    description: 'Narrador que recopila, ordena y presenta los manuscritos. Voz marco de primer nivel.',
    parent: 'cervantes',
    level: 1,
    levelLabel: 'Nivel 1 — Narrador marco',
  },
  {
    id: 'cide',
    label: 'Cide Hamete Benengeli',
    description: 'El historiador arábigo, supuesto autor del manuscrito original. Voz intradiegética.',
    parent: 'editor',
    level: 2,
    levelLabel: 'Nivel 2 — Narrador manuscrito',
  },
  {
    id: 'traductor',
    label: 'Traductor morisco',
    description: 'Mediador lingüístico entre el manuscrito árabe y el lector castellano.',
    parent: 'cide',
    level: 3,
    levelLabel: 'Nivel 3 — Mediador textual',
  },
  {
    id: 'personajes',
    label: 'Voces de personajes',
    description: 'Don Quijote, Sancho y demás personajes que hablan dentro del relato.',
    parent: 'cide',
    level: 3,
    levelLabel: 'Nivel 3 — Voces diegéticas',
  },
] as const

// Derived lookup maps for O(1) access
export const voiceById: Readonly<Record<string, CanonicalVoice>> =
  Object.fromEntries(canonicalVoices.map((v) => [v.id, v]))

export const voiceIds = canonicalVoices.map((v) => v.id) as string[]

// ── Phase 1 — Narrative Fragments ─────────────────────────────
export const narrativeFragments: readonly NarrativeFragment[] = [
  {
    id: 'f1',
    text: '«En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero...»',
    attribution: 'Capítulo I, apertura de la narración',
    correctVoiceId: 'cide',
    distractors: ['editor', 'cervantes', 'traductor'],
  },
  {
    id: 'f2',
    text: '«Pero yo, aunque parezco padre, soy padrastro de don Quijote, y no quiero ir con la corriente del uso, ni suplicarte, casi con las lágrimas en los ojos, como otros hacen...»',
    attribution: 'Prólogo al lector, Primera parte',
    correctVoiceId: 'cervantes',
    distractors: ['cide', 'editor', 'personajes'],
  },
  {
    id: 'f3',
    text: '«Y así, el segundo autor desta obra no quiso creer que tan curiosa historia estuviese entregada a las leyes del olvido...»',
    attribution: 'Capítulo IX, hallazgo del manuscrito',
    correctVoiceId: 'editor',
    distractors: ['cide', 'cervantes', 'traductor'],
  },
  {
    id: 'f4',
    text: '«Dícese que tenía el sobrenombre de "Quijada" o "Quesada"... aunque por conjeturas verisímiles se deja entender que se llamaba "Quijana"»',
    attribution: 'Cide Hamete en primera persona dudando sobre los hechos',
    correctVoiceId: 'cide',
    distractors: ['editor', 'personajes', 'cervantes'],
  },
  {
    id: 'f5',
    text: '«El morisco, leyendo el cartapacio, dijo que la historia se llamaba "Don Quijote de la Mancha"...»',
    attribution: 'Capítulo IX, traducción del manuscrito árabe',
    correctVoiceId: 'traductor',
    distractors: ['cide', 'editor', 'personajes'],
  },
]

// ── Phase 2 — Dependency Relation Questions ────────────────────
export const relationQuestions: readonly RelationQuestion[] = [
  {
    id: 'r1',
    childId: 'editor',
    correctParentId: 'cervantes',
    prompt: '¿De quién depende narrativamente el Editor ficticio?',
  },
  {
    id: 'r2',
    childId: 'cide',
    correctParentId: 'editor',
    prompt: '¿Quién encarga y presenta la voz de Cide Hamete Benengeli?',
  },
  {
    id: 'r3',
    childId: 'traductor',
    correctParentId: 'cide',
    prompt: '¿En qué nivel narrativo se inserta el Traductor morisco?',
  },
  {
    id: 'r4',
    childId: 'personajes',
    correctParentId: 'cide',
    prompt: '¿Quién tiene autoridad narrativa sobre las voces de los personajes?',
  },
  {
    id: 'r5',
    childId: 'cervantes',
    correctParentId: null,
    prompt: '¿Qué voz no depende de ninguna otra en la jerarquía?',
  },
]

// ── Phase 3 — Level Classification ────────────────────────────
export const levelQuestions: readonly LevelQuestion[] = voiceIds.map((id) => ({
  id: `l-${id}`,
  voiceId: id,
  correctLevel: voiceById[id].level,
}))

// ── Phase 4 — Intentionally Incorrect Tree (for error detection)
export interface ErrorTreeRelation {
  readonly id: string
  readonly childId: string
  readonly presentedParentId: string | null
  readonly isError: boolean
  readonly errorDescription?: string
}

export const errorTreeRelations: readonly ErrorTreeRelation[] = [
  {
    id: 'e1',
    childId: 'editor',
    presentedParentId: 'cervantes',
    isError: false,
  },
  {
    id: 'e2',
    childId: 'cide',
    presentedParentId: 'cervantes', // ERROR: should be 'editor'
    isError: true,
    errorDescription: 'Cide Hamete debe depender del Editor, no directamente de Cervantes',
  },
  {
    id: 'e3',
    childId: 'traductor',
    presentedParentId: 'editor', // ERROR: should be 'cide'
    isError: true,
    errorDescription: 'El Traductor morisco depende de Cide Hamete, no del Editor',
  },
  {
    id: 'e4',
    childId: 'personajes',
    presentedParentId: 'cide',
    isError: false,
  },
]
