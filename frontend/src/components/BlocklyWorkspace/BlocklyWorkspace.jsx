import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import './blocks'
import { generateToolboxJson } from './generateToolbox';
import './BlocklyWorkspace.css'

const CompactTheme = Blockly.Theme.defineTheme('compact', {
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: 'Arial',
    weight: 'normal',
    size: 10,
  },
  componentStyles: {
    workspaceBackgroundColour: '#ffffff',
    toolboxBackgroundColour: '#f9f9f9',
    toolboxForegroundColour: '#333333',
    flyoutBackgroundColour: '#f0f0f0',
    flyoutForegroundColour: '#888888',
    flyoutOpacity: 1,
    scrollbarColour: '#ccc',
    insertionMarkerColour: '#000000',
    insertionMarkerOpacity: 0.3,
    markerColour: '#000000',
    cursorColour: '#d0d0d0'
  }
});

const BlocklyWorkspace = ({ onBlocksChange, databaseTables = null }) => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [toolboxJson, setToolboxJson] = useState(null);
  const [listenerActive, setListenerActive] = useState(false);

  useEffect(() => {
    const toolbox = generateToolboxJson(databaseTables, {enableTransactions: false, enableTableDefinition: false});

    setToolboxJson(JSON.parse(JSON.stringify(toolbox)));

    if (workspaceRef.current) {
      workspaceRef.current.tables = databaseTables.tables;
    }
  }, [databaseTables]);

  useEffect(() => {
    if (!blocklyDiv.current || !toolboxJson) return;

    const changeListener = () => {
      if (!workspaceRef.current) return;

      const blocksData = workspaceRef.current.getAllBlocks(false).map((block) => ({
        type: block.type,
        fields: Object.fromEntries(
          block.inputList.flatMap((input) =>
            input.fieldRow.map((field) => [field.name, field.getValue()])
          )
        ),
        inputs: block.inputList
          .filter((input) => input.connection)
          .map((input) => input.connection.targetBlock()?.type)
          .filter(Boolean),
      }));

      onBlocksChange(blocksData);
    };

    if (!workspaceRef.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxJson,
        scrollbars: false,
        trashcan: true,
        renderer: 'geras',
        theme: CompactTheme,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#fff',  //#ccc
          snap: true
        },
      });

      workspaceRef.current.tables = databaseTables.tables;

      workspaceRef.current.addChangeListener(changeListener);
      setListenerActive(true);
    } else {
      try {
        if (listenerActive) {
          workspaceRef.current.removeChangeListener(changeListener);
          setListenerActive(false);
        }

        workspaceRef.current.updateToolbox(toolboxJson);

        workspaceRef.current.tables = databaseTables.tables;

        workspaceRef.current.addChangeListener(changeListener);
        setListenerActive(true);

        // Forzar actualización de bloques existentes
        setTimeout(() => {
          if (workspaceRef.current) {
            workspaceRef.current.getAllBlocks().forEach((block) => {
              if (typeof block.updateAttributes === 'function') {
                block.updateAttributes();
              }
            });
            workspaceRef.current.setVisible(false);
            workspaceRef.current.setVisible(true);
          }
        }, 100);
      } catch (error) {
        console.error('Error al actualizar toolbox:', error);
      }
    }

    return () => {
      if (workspaceRef.current && listenerActive) {
        workspaceRef.current.removeChangeListener(changeListener);
      }
    };
  }, [toolboxJson, onBlocksChange, databaseTables]);

  useEffect(() => {
    if (!blocklyDiv.current) return;
    const observer = new ResizeObserver(() => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    });
    observer.observe(blocklyDiv.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={blocklyDiv} className="blocklyWorkspace" style={{ width: '100%', height: '100%' }} />;
};


export default BlocklyWorkspace;
