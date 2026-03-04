import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useExamStore } from '@/store/examStore'
import { canonicalVoices } from '@/data/canonicalData'
import { PhaseHeader, Button, Card } from '@/components/ui'
import { useExamTimer } from '@/utils/useExamTimer'
import type { StudentTreeNode } from '@/store/examStore'

// ── Voice Node Component ───────────────────────────────────────
const LEVEL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: '#fdf0ee', border: '#c0392b', text: '#7a2020' },
  1: { bg: '#eef2f9', border: '#1a3a6b', text: '#1a3a6b' },
  2: { bg: '#eef7f2', border: '#1a6b3c', text: '#1a5030' },
  3: { bg: '#fef9ec', border: '#c0922a', text: '#7a5a10' },
}

function VoiceNode({ data }: { data: { label: string; level: number; description: string } }) {
  const colors = LEVEL_COLORS[data.level] ?? LEVEL_COLORS[3]
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 6,
      background: colors.bg,
      border: `2px solid ${colors.border}`,
      minWidth: 160, maxWidth: 200,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontFamily: 'var(--font-body)',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: colors.text, opacity: 0.7, marginBottom: 3,
      }}>
        Nivel {data.level}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: colors.text,
        fontFamily: 'var(--font-display)', lineHeight: 1.3,
      }}>
        {data.label}
      </div>
    </div>
  )
}

const nodeTypes = { voiceNode: VoiceNode }

// ── Initial layout: spread voices in a vertical grid ──────────
function buildInitialNodes(): Node[] {
  const cols = 3
  return canonicalVoices.map((voice, i) => ({
    id: voice.id,
    type: 'voiceNode',
    position: {
      x: (i % cols) * 220 + 40,
      y: Math.floor(i / cols) * 120 + 40,
    },
    data: {
      label: voice.label,
      level: voice.level,
      description: voice.description,
    },
  }))
}

// ── Phase 5 Component ──────────────────────────────────────────
export function Phase5() {
  const { setStudentTree, studentTree, goToPhase, examFinished, answers } = useExamStore()
  const { submitExam } = useExamTimer()

  const initialNodes = useMemo(buildInitialNodes, [])
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Restore edges from saved studentTree on mount
  useEffect(() => {
    if (studentTree.length > 0) {
      const restored: Edge[] = studentTree
        .filter((n): n is StudentTreeNode & { parent: string } => n.parent !== null)
        .map((n) => ({
          id: `${n.parent}-${n.id}`,
          source: n.parent,
          target: n.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#7a7468' },
          style: { stroke: '#7a7468', strokeWidth: 1.5 },
        }))
      setEdges(restored)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist tree to store whenever edges change
  useEffect(() => {
    const tree: StudentTreeNode[] = canonicalVoices.map((voice) => {
      const edge = edges.find((e) => e.target === voice.id)
      return { id: voice.id, parent: edge ? edge.source : null }
    })
    setStudentTree(tree)
  }, [edges, setStudentTree])

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return
      // Only one parent allowed: remove existing edge to same target
      setEdges((prev) => {
        const filtered = prev.filter((e) => e.target !== connection.target)
        return addEdge(
          {
            ...connection,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#7a7468' },
            style: { stroke: '#7a7468', strokeWidth: 1.5 },
            animated: false,
          },
          filtered
        )
      })
    },
    [setEdges]
  )

  const clearEdges = () => setEdges([])

  const connectedCount = new Set(edges.map((e) => e.target)).size
  const allAnswersComplete =
    Object.keys(answers.phase1).length >= 5 &&
    Object.keys(answers.phase2).length >= 5 &&
    Object.keys(answers.phase3).length >= 5 &&
    Object.keys(answers.phase4).length >= 4

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PhaseHeader
        phase={5}
        title="Constructor de Árbol Narrativo"
        subtitle="Conecta cada voz con su padre narrativo arrastrando entre nodos. Sólo la raíz puede quedar sin conexión."
        total={canonicalVoices.length}
      />

      {/* Instructions */}
      <Card style={{
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--sapphire-bg)',
        border: '1px solid rgba(26,58,107,0.2)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: 'var(--sapphire)', lineHeight: 1.7 }}>
          <strong>Cómo construir el árbol:</strong> Arrastra desde el borde inferior de un nodo hasta el borde superior de otro para crear una relación padre → hijo.
          Para eliminar una conexión, selecciónala y presiona <kbd style={{ background: 'rgba(26,58,107,0.1)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 12 }}>Backspace</kbd> o <kbd style={{ background: 'rgba(26,58,107,0.1)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 12 }}>Delete</kbd>.
        </div>
      </Card>

      {/* React Flow canvas */}
      <div style={{
        height: 480,
        border: 'var(--border-light)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode={['Backspace', 'Delete']}
          connectionLineStyle={{ stroke: '#a09890', strokeWidth: 1.5, strokeDasharray: '4 3' }}
          defaultEdgeOptions={{
            style: { stroke: '#7a7468', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#7a7468' },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#c8c2b8"
          />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const level = (node.data as { level: number }).level
              return LEVEL_COLORS[level]?.border ?? '#aaa'
            }}
            style={{ background: 'var(--parchment-200)' }}
          />
        </ReactFlow>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-6)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--parchment-100)',
        border: 'var(--border-light)',
        borderRadius: 'var(--radius-sm)',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Nodos totales', value: canonicalVoices.length },
          { label: 'Conexiones activas', value: edges.length },
          { label: 'Nodos conectados', value: connectedCount },
          { label: 'Raíces libres', value: canonicalVoices.length - connectedCount },
        ].map((stat) => (
          <div key={stat.label}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 2 }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: 'var(--ink-800)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 'var(--space-4)',
        borderTop: 'var(--border-hairline)',
        flexWrap: 'wrap', gap: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="sm" onClick={() => goToPhase(4)}>← Fase 4</Button>
          <Button variant="ghost" size="sm" onClick={clearEdges}>
            Limpiar árbol
          </Button>
        </div>

        {!examFinished && (
          <Button
            variant="primary"
            size="lg"
            onClick={submitExam}
            style={{
              background: allAnswersComplete ? 'var(--emerald)' : 'var(--ink-600)',
              minWidth: 200,
            }}
          >
            {allAnswersComplete ? '✓ Entregar Examen' : 'Entregar Examen'}
          </Button>
        )}
      </div>
    </div>
  )
}
