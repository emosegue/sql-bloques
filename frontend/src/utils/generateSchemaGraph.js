import dagre from 'dagre'
import { MarkerType } from 'reactflow'

export const nodeWidth = 220
const headerHeight = 36
const rowHeight = 28
const nodePadding = 16
const layoutDirection = 'LR'
const ranksep = 140
const nodesep = 60

export const getNodeHeight = (columnCount) => headerHeight + nodePadding + columnCount * rowHeight

const getLayoutedElements = (nodes, edges, direction = layoutDirection) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, ranksep, nodesep, marginx: 40, marginy: 40 })

  nodes.forEach((node) => {
    const columnCount = node.data?.columns?.length ?? 0
    dagreGraph.setNode(node.id, { width: nodeWidth, height: getNodeHeight(columnCount) })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id)
    node.position = { x, y }
  })

  return { nodes, edges }
}

export function generateSchemaGraph(schema) {
  const nodes = []
  const edges = []

  schema.tables.forEach((table) => {
    nodes.push({
      id: table.name,
      type: 'database-schema',
      position: { x: 0, y: 0 },
      data: {
        table: table.name,
        columns: table.attributes.map((attr) => ({
          name: attr.name,
          type: attr.type,
          isPrimary: !!attr.primaryKey,
          isForeign: !!attr.foreignKey,
          isUnique: !!attr.unique,
        })),
      },
    })
  })

  schema.tables.forEach((table) => {
    table.attributes.forEach((attr) => {
      if (attr.foreignKey) {
        const [targetTable, targetCol] = attr.foreignKey.split('.')

        edges.push({
          id: `${table.name}.${attr.name}->${targetTable}.${targetCol}`,
          source: table.name,
          sourceHandle: `out-${attr.name}`,
          target: targetTable,
          targetHandle: `in-${targetCol}`,
          type: 'smoothstep',
          animated: true,
          label: `${attr.name} → ${targetCol}`,
          style: { stroke: '#1976d2', strokeWidth: 2 },
          labelStyle: { fill: '#1565c0', fontWeight: 600, fontSize: 11 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.95, stroke: '#90caf9' },
          labelBgPadding: [6, 4],
          labelBgBorderRadius: 4,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: '#1976d2',
          },
          pathOptions: { borderRadius: 12, offset: 24 },
          zIndex: 0,
        })
      }
    })
  })

  return getLayoutedElements(nodes, edges)
}
