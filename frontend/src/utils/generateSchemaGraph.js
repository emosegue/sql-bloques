import dagre from 'dagre'

const nodeWidth = 200
const nodeHeight = 120
const layoutDirection = 'TB' // Top to Bottom
const ranksep = 120 // Separación entre filas
const nodesep = 160 // Separación entre nodos

const getLayoutedElements = (nodes, edges, direction = layoutDirection) => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction, ranksep, nodesep })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
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
            position: { x: 0, y: 0 }, // será ajustado por dagre
            data: {
                table: table.name,
                columns: table.attributes.map(attr => ({
                    name: attr.name,
                    type: attr.type,
                    isPrimary: !!attr.primaryKey,
                    isForeign: !!attr.foreignKey,
                    isUnique: !!attr.unique,
                })),
            },
        })
    })

    schema.tables.forEach(table => {
        table.attributes.forEach(attr => {
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
                    style: { stroke: '#1976d2' },
                    labelStyle: { fill: '#1976d2', fontWeight: 500 },
                    labelBgStyle: { fill: '#fff', fillOpacity: 0.8, stroke: '#ccc' },
                    markerEnd: {
                        type: 'arrowclosed',
                        width: 20,
                        height: 20,
                        color: '#1976d2',
                    },
                })
            }
        })
    })

    return getLayoutedElements(nodes, edges)
}
