import React, { useMemo, useEffect } from 'react'
import ReactFlow, {  useNodesState, useEdgesState, Background, Controls, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { generateSchemaGraph } from '../../utils/generateSchemaGraph'
import  DatabaseSchemaNode  from './nodes/DatabaseSchemaNode'

const nodeTypes = {
  'database-schema': DatabaseSchemaNode,
}

// Componente hijo para centrar el grafo
function AutoFitView({ nodes }) {
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.2 });
        } catch (e) {}
      }, 0);
    }
  }, [nodes, reactFlowInstance]);
  return null;
}

const SchemaView = ({ databaseTables }) => {
  const initialGraph = useMemo(() => generateSchemaGraph(databaseTables), [databaseTables])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges)

  // Resetear nodos y edges cuando cambie el esquema
  useEffect(() => {
    const newGraph = generateSchemaGraph(databaseTables)
    setNodes(newGraph.nodes)
    setEdges(newGraph.edges)
  }, [databaseTables, setNodes, setEdges])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <AutoFitView nodes={nodes} />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default SchemaView