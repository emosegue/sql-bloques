import React, { useMemo, useEffect } from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { generateSchemaGraph } from '../../utils/generateSchemaGraph'
import DatabaseSchemaNode from './nodes/DatabaseSchemaNode'

const nodeTypes = {
  'database-schema': DatabaseSchemaNode,
}

function AutoFitView({ schemaKey, edgeCount }) {
  const reactFlowInstance = useReactFlow()

  useEffect(() => {
    if (!schemaKey) return

    const fitAll = () => {
      try {
        reactFlowInstance.fitView({
          padding: 0.28,
          maxZoom: 1,
          minZoom: 0.05,
          duration: 250,
          includeHiddenNodes: false,
        })
      } catch {
        // ReactFlow may not be mounted yet
      }
    }

    const initialTimer = setTimeout(fitAll, 80)
    const settleTimer = setTimeout(fitAll, 280)

    return () => {
      clearTimeout(initialTimer)
      clearTimeout(settleTimer)
    }
  }, [schemaKey, edgeCount, reactFlowInstance])

  return null
}

const SchemaFlow = ({ databaseTables }) => {
  const schemaKey = useMemo(
    () => JSON.stringify(databaseTables?.tables?.map((table) => table.name) ?? []),
    [databaseTables]
  )

  const initialGraph = useMemo(() => generateSchemaGraph(databaseTables), [databaseTables])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges)

  useEffect(() => {
    const newGraph = generateSchemaGraph(databaseTables)
    setNodes(newGraph.nodes)
    setEdges(newGraph.edges)
  }, [databaseTables, setNodes, setEdges])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        elevateEdgesOnSelect={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.05}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
        }}
      >
        <AutoFitView schemaKey={schemaKey} edgeCount={edges.length} />
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

const SchemaView = ({ databaseTables }) => (
  <ReactFlowProvider>
    <SchemaFlow databaseTables={databaseTables} />
  </ReactFlowProvider>
)

export default SchemaView
