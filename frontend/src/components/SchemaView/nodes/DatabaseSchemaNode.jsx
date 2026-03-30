// src/components/nodes/DatabaseSchemaNode.jsx

import React from 'react'
import { Handle, Position } from 'reactflow'
import './DatabaseSchemaNode.css'

const DatabaseSchemaNode = ({ data }) => {
  return (
    <div className="db-node">
      <div className="db-node__header">{data.table}</div>
      <div className="db-node__columns">
        {data.columns.map((col, i) => (
          <div key={i} className="db-node__row">
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${col.name}`}
              style={{ opacity: 0 }}
            />
            <span>
              {col.name}
              {col.isPrimary && ' 🔑'}
              {col.isForeign && ' 🔗'}
              {col.isUnique && ' *'}
            </span>
            <span className="db-node__type">{col.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`out-${col.name}`}
              style={{ opacity: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DatabaseSchemaNode
