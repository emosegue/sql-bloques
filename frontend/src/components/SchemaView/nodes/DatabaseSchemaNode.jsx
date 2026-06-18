// src/components/nodes/DatabaseSchemaNode.jsx

import React from 'react'
import { Handle, Position } from 'reactflow'
import './DatabaseSchemaNode.css'

const DatabaseSchemaNode = ({ data }) => {
  return (
    <div className="db-node">
      <div className="db-node__header">{data.table}</div>
      <div className="db-node__columns">
        {data.columns.map((col) => (
          <div key={col.name} className="db-node__row">
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${col.name}`}
              className={`db-node__handle db-node__handle--target ${
                col.isPrimary ? 'db-node__handle--visible' : ''
              }`}
            />
            <span className="db-node__name">
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
              className={`db-node__handle db-node__handle--source ${
                col.isForeign ? 'db-node__handle--visible' : ''
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DatabaseSchemaNode
