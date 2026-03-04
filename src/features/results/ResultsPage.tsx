import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { canonicalVoices } from '@/data/canonicalData'
import { Card, Badge, ProgressBar, Button, SectionLabel } from '@/components/ui'
import type { PhaseResult, TreeNodeResult } from '@/features/evaluation/evaluationEngine'

const PHASE_LABELS = [
  'Reconocimiento de voces',
  'Relaciones de dependencia',
  'Clasificación por niveles',
  'Detección de errores',
]

const WEIGHTS = [20, 20, 15, 15, 30]

function gradeColor(score: number): string {
  if (score >= 90) return 'var(--emerald)'
  if (score >= 70) return 'var(--sapphire)'
  if (score >= 50) return 'var(--gold)'
  return 'var(--vermillion)'
}

function gradeVariant(score: number): 'green' | 'blue' | 'gold' | 'red' {
  if (score >= 90) return 'green'
  if (score >= 70) return 'blue'
  if (score >= 50) return 'gold'
  return 'red'
}

// ── Phase Result Card ──────────────────────────────────────────
function PhaseResultCard({ result, label, weight, phaseNum }: {
  result: PhaseResult
  label: string
  weight: number
  phaseNum: number
}) {
  const [expanded, setExpanded] = useExpandState(`phase-${phaseNum}`)

  return (
    <Card style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: 'var(--space-5)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: 'var(--ink-800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 600,
          fontSize: 14, color: 'var(--gold)', flexShrink: 0,
        }}>
          {phaseNum}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink-800)', marginBottom: 4 }}>{label}</p>
          <ProgressBar value={result.score} color={gradeColor(result.score)} height={5} />
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 22,
            fontWeight: 600, color: gradeColor(result.score),
          }}>
            {result.score}%
          </span>
          <p style={{ fontSize: 12, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
            {result.correct}/{result.total} · peso {weight}%
          </p>
        </div>
        <span style={{ color: 'var(--ink-300)', fontSize: 14, marginLeft: 4 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div style={{
          borderTop: 'var(--border-hairline)',
          padding: 'var(--space-4) var(--space-5)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.detail.map((item) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 1fr auto',
                gap: 12, alignItems: 'start',
                padding: '6px 0',
                borderBottom: 'var(--border-hairline)',
                fontSize: 14,
              }}>
                <span style={{
                  color: item.isCorrect ? 'var(--emerald)' : 'var(--vermillion)',
                  fontWeight: 700, fontSize: 15,
                }}>
                  {item.isCorrect ? '✓' : '✗'}
                </span>
                <span style={{ color: 'var(--ink-600)', fontStyle: 'italic' }}>{item.label}</span>
                <div>
                  <span style={{ color: 'var(--ink-400)', fontSize: 12, display: 'block' }}>Tu respuesta:</span>
                  <span style={{ color: 'var(--ink-700)' }}>{item.studentAnswer}</span>
                </div>
                {!item.isCorrect && (
                  <div>
                    <span style={{ color: 'var(--ink-400)', fontSize: 12, display: 'block' }}>Correcto:</span>
                    <span style={{ color: 'var(--emerald)', fontWeight: 500 }}>{item.correctAnswer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Tree Display (results view) ────────────────────────────────
function buildResultNodes(
  treeResults: TreeNodeResult[],
  isCanonical: boolean
): { nodes: Node[]; edges: Edge[] } {
  const cols = 3
  const nodes: Node[] = canonicalVoices.map((voice, i) => {
    const result = treeResults.find((r) => r.id === voice.id)
    const isCorrect = result?.isCorrect ?? false
    return {
      id: voice.id,
      position: { x: (i % cols) * 210 + 30, y: Math.floor(i / cols) * 100 + 30 },
      data: { label: voice.label },
      style: {
        padding: '8px 14px',
        borderRadius: 6,
        border: `2px solid ${isCanonical ? '#1a6b3c' : isCorrect ? '#1a6b3c' : '#c0392b'}`,
        background: isCanonical ? '#eef7f2' : isCorrect ? '#eef7f2' : '#fdf0ee',
        fontFamily: 'var(--font-display)',
        fontSize: 13, fontWeight: 600,
        color: isCanonical ? '#1a5030' : isCorrect ? '#1a5030' : '#7a2020',
        minWidth: 130, textAlign: 'center' as const,
      },
    }
  })

  const edges: Edge[] = []
  if (isCanonical) {
    canonicalVoices.forEach((v) => {
      if (v.parent) {
        edges.push({
          id: `c-${v.parent}-${v.id}`,
          source: v.parent, target: v.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#1a6b3c' },
          style: { stroke: '#1a6b3c', strokeWidth: 1.5 },
        })
      }
    })
  } else {
    treeResults.forEach((r) => {
      if (r.studentParent) {
        edges.push({
          id: `s-${r.studentParent}-${r.id}`,
          source: r.studentParent, target: r.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: r.isCorrect ? '#1a6b3c' : '#c0392b' },
          style: { stroke: r.isCorrect ? '#1a6b3c' : '#c0392b', strokeWidth: 1.5 },
        })
      }
    })
  }

  return { nodes, edges }
}

// ── Simple expand state helper ─────────────────────────────────
import { useState } from 'react'
function useExpandState(key: string): [boolean, (v: boolean) => void] {
  const [map, setMap] = useState<Record<string, boolean>>({})
  return [map[key] ?? false, (v) => setMap((m) => ({ ...m, [key]: v }))]
}

// ── Results Page ───────────────────────────────────────────────
export function ResultsPage() {
  const navigate = useNavigate()
  const { evaluation, resetExam, examFinished } = useExamStore()

  if (!examFinished || !evaluation) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-20)', color: 'var(--ink-400)' }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>No hay resultados disponibles.</p>
        <Button onClick={() => navigate('/')}>← Volver al inicio</Button>
      </div>
    )
  }

  const { phase1, phase2, phase3, phase4, structuralAccuracy, totalScore, grade, treeResults } = evaluation
  const phaseResults = [phase1, phase2, phase3, phase4]
  const studentTree = buildResultNodes(treeResults, false)
  const canonicalTree = buildResultNodes(treeResults, true)

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto',
      padding: 'var(--space-10) var(--space-8)',
      animation: 'fadeUp 0.4s ease both',
    }}>
      {/* ── Score Hero ── */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-8)',
        marginBottom: 'var(--space-10)',
        background: 'var(--ink-900)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 30px, white 30px, white 31px)',
        }} />

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--ink-400)', marginBottom: 16, position: 'relative',
        }}>
          Resultado final del examen
        </p>

        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', gap: 8,
          marginBottom: 12, position: 'relative',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 12vw, 7rem)',
            fontWeight: 700, lineHeight: 1,
            color: gradeColor(totalScore),
          }}>
            {totalScore}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 24,
            color: 'var(--ink-400)', marginBottom: 12,
          }}>
            / 100
          </span>
        </div>

        <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
          <Badge color={gradeVariant(totalScore)}>
            {grade}
          </Badge>
        </div>

        {/* Phase score mini-bars */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8, maxWidth: 480, margin: '0 auto',
          position: 'relative',
        }}>
          {[...phaseResults.map((p) => p.score), Math.round(structuralAccuracy * 100)].map((score, i) => (
            <div key={i}>
              <div style={{
                height: 4, background: 'var(--ink-700)',
                borderRadius: 2, overflow: 'hidden', marginBottom: 4,
              }}>
                <div style={{
                  width: `${score}%`, height: '100%',
                  background: gradeColor(score), borderRadius: 2,
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--ink-500)',
              }}>
                F{i + 1}: {score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Score Breakdown Table ── */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <SectionLabel>Desglose por fase</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {phaseResults.map((result, i) => (
            <PhaseResultCard
              key={i}
              result={result}
              label={PHASE_LABELS[i]}
              weight={WEIGHTS[i]}
              phaseNum={i + 1}
            />
          ))}

          {/* Phase 5 — tree summary */}
          <Card style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: 'var(--ink-800)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                fontSize: 14, color: 'var(--gold)', flexShrink: 0,
              }}>5</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink-800)', marginBottom: 4 }}>
                  Constructor de árbol narrativo
                </p>
                <ProgressBar value={Math.round(structuralAccuracy * 100)} color={gradeColor(structuralAccuracy * 100)} height={5} />
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 22,
                  fontWeight: 600, color: gradeColor(structuralAccuracy * 100),
                }}>
                  {Math.round(structuralAccuracy * 100)}%
                </span>
                <p style={{ fontSize: 12, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
                  {treeResults.filter((r) => r.isCorrect).length}/{treeResults.length} nodos · peso 30%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Tree Comparison ── */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <SectionLabel>Comparación de árboles narrativos</SectionLabel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
          {/* Student tree */}
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--ink-700)' }}>
              Tu árbol
              <span style={{ marginLeft: 8 }}>
                <Badge color={gradeVariant(Math.round(structuralAccuracy * 100))}>
                  {Math.round(structuralAccuracy * 100)}% correcto
                </Badge>
              </span>
            </p>
            <div style={{ height: 320, border: 'var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <ReactFlow
                nodes={studentTree.nodes}
                edges={studentTree.edges}
                fitView fitViewOptions={{ padding: 0.15 }}
                nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
                zoomOnScroll={false} panOnScroll={false}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c8c2b8" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </div>

          {/* Canonical tree */}
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--ink-700)' }}>
              Árbol canónico
              <span style={{ marginLeft: 8 }}>
                <Badge color="green">Referencia</Badge>
              </span>
            </p>
            <div style={{ height: 320, border: 'var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <ReactFlow
                nodes={canonicalTree.nodes}
                edges={canonicalTree.edges}
                fitView fitViewOptions={{ padding: 0.15 }}
                nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
                zoomOnScroll={false} panOnScroll={false}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c8c2b8" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </div>
        </div>

        {/* Node-by-node comparison */}
        <Card style={{ marginTop: 'var(--space-5)', padding: 'var(--space-5)' }}>
          <p style={{ fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--ink-700)' }}>
            Detalle por nodo
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {treeResults.map((r) => (
              <div key={r.id} style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 1fr 1fr',
                gap: 12, alignItems: 'center',
                padding: '6px 0',
                borderBottom: 'var(--border-hairline)',
                fontSize: 14,
              }}>
                <span style={{
                  color: r.isCorrect ? 'var(--emerald)' : 'var(--vermillion)',
                  fontWeight: 700, fontSize: 16,
                }}>
                  {r.isCorrect ? '✓' : '✗'}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--ink-700)' }}>
                  {r.label}
                </span>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--ink-400)', display: 'block' }}>Tu respuesta</span>
                  <span style={{ color: r.isCorrect ? 'var(--emerald)' : 'var(--vermillion)' }}>
                    {r.studentParent ?? '(sin padre)'}
                  </span>
                </div>
                {!r.isCorrect && (
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--ink-400)', display: 'block' }}>Correcto</span>
                    <span style={{ color: 'var(--emerald)' }}>{r.correctParent ?? '(sin padre)'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
        <Button variant="ghost" onClick={() => { resetExam(); navigate('/') }}>
          Nuevo examen
        </Button>
        <Button onClick={() => window.print()}>
          Imprimir resultados
        </Button>
      </div>
    </div>
  )
}
