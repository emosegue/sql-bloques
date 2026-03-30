import React, { useState, useMemo  } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import BlocklyWorkspace from '../BlocklyWorkspace/BlocklyWorkspace'
import SchemaView from '../SchemaView/SchemaView'
import './WorkspaceTabs.css'
import { getNormalizedSchema } from '../../utils/normalizeSchema'
import { i18n } from '../../i18n'

const WorkspaceContainer = ({ onBlocksChange, databaseTables }) => {
  const [tabIndex, setTabIndex] = useState(0)
  const normalizedSchema = useMemo(() => getNormalizedSchema(databaseTables), [databaseTables])


  const handleChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={tabIndex}
        onChange={handleChange}
        className="custom-tabs"
        TabIndicatorProps={{ style: { backgroundColor: '#1976d2', height: '3px' } }}
      >
        <Tab
          label={i18n('WORKSPACE')}
          className={`custom-tab ${tabIndex === 0 ? 'custom-tab-active' : ''}`}
        />
        <Tab
          label={i18n('SCHEMA')}
          className={`custom-tab ${tabIndex === 1 ? 'custom-tab-active' : ''}`}
        />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          className={`tab-panel ${tabIndex === 0 ? 'tab-panel--visible' : 'tab-panel--hidden'}`}
        >
          <BlocklyWorkspace
            onBlocksChange={onBlocksChange}
            databaseTables={normalizedSchema}
          />
        </div>
        <div
          className={`tab-panel ${tabIndex === 1 ? 'tab-panel--visible' : 'tab-panel--hidden'}`}
        >
          <SchemaView databaseTables={normalizedSchema} />
        </div>
      </Box>
    </Box>
  )
}

export default WorkspaceContainer
