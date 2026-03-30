import { COLORS } from '../../utils/colors';
import { i18n } from '../../i18n';

export const generateToolboxJson = (databaseSchema, options = {}) => {
  const { enableTransactions = false, enableTableDefinition = false } = options;
  const tables = databaseSchema.tables || [];

  // Convertir tablas a formato de opciones para los dropdowns
  const tableOptions = tables.map((table) => [table.name, table.name]);

  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: i18n('CATEGORY_QUERY'),
        colour: COLORS.QUERY,
        contents: [
          { kind: 'label', text: i18n('LABEL_SELECTION') },
          {
            kind: 'block',
            type: 'sql_select',
            fields: {
              table: tableOptions[0]?.[0] || '',
            },
          },
        ],
      },
      {
        kind: 'category',
        name: i18n('CATEGORY_DML'),
        colour: COLORS.DML,
        contents: [
          { kind: 'label', text: i18n('LABEL_INSERTION') },
          {
            kind: 'block',
            type: 'sql_insert',
            fields: {
              table: tableOptions[0]?.[0] || '',
            },
          },
          { kind: 'label', text: i18n('LABEL_MODIFICATION') },
          {
            kind: 'block',
            type: 'sql_update',
            fields: {
              table: tableOptions[0]?.[0] || '',
            },
          },
          { kind: 'block', type: 'sql_attribute_constant_pair' },
          { kind: 'label', text: i18n('LABEL_DELETION') },
          {
            kind: 'block',
            type: 'sql_delete',
            fields: {
              table: tableOptions[0]?.[0] || '',
            },
          },
        ],
      },
      {
        kind: 'category',
        name: i18n('CATEGORY_VALUE'),
        colour: COLORS.VALUE,
        contents: [
          { kind: 'label', text: i18n('LABEL_ATTRIBUTES') },
          { kind: 'block', type: 'sql_attribute' },
          { kind: 'label', text: i18n('LABEL_CONSTANTS') },
          { kind: 'block', type: 'sql_constant' },
        ],
      },
      {
        kind: 'category',
        name: i18n('CATEGORY_CONDITION'),
        colour: COLORS.CONDITION,
        contents: [
          { kind: 'label', text: i18n('LABEL_CONDITION') },
          { kind: 'block', type: 'sql_where' },
          { kind: 'label', text: i18n('LABEL_OPERATOR') },
          { kind: 'block', type: 'sql_condition' },
        ],
      },
      {
        kind: 'category',
        name: i18n('CATEGORY_JOIN'),
        colour: COLORS.JOIN,
        contents: [
          { kind: 'label', text: i18n('LABEL_TABLE_OPERATIONS') },
          { kind: 'block', type: 'sql_join' },
          { kind: 'block', type: 'sql_union' },
        ],
      },
      {
        kind: 'category',
        name: i18n('CATEGORY_SORTING'),
        colour: COLORS.SORTING,
        contents: [
          { kind: 'label', text: i18n('LABEL_ORDERING') },
          { kind: 'block', type: 'sql_order_by' },
          { kind: 'label', text: i18n('LABEL_LIMITING') },
          { kind: 'block', type: 'sql_limit' },
        ],
      },
    ],
  };

  if (enableTableDefinition) {
    toolbox.contents.push({
      kind: 'category',
      name: i18n('CATEGORY_DDL'),
      colour: COLORS.DDL,
      contents: [
        { kind: 'block', type: 'sql_create_table' },
        { kind: 'block', type: 'sql_alter_table' },
        { kind: 'block', type: 'sql_drop_table' },
      ],
    });
  }

  if (enableTransactions) {
    toolbox.contents.push({
      kind: 'category',
      name: i18n('CATEGORY_TRANSACTION'),
      colour: COLORS.TRANSACTION,
      contents: [
        { kind: 'block', type: 'sql_begin_transaction' },
        { kind: 'block', type: 'sql_commit' },
        { kind: 'block', type: 'sql_rollback' },
      ],
    });
  }

  return toolbox;
}

/* Prueba de concepto para mostrar bloques prearmados

const _getSelectExample = (tableOptions) => {
  const tableName = tableOptions[0]?.[0] || 'no_table';
  const attributeName = tableName !== 'no_table' ? `${tableName}.id_cliente` : '*';

  return {
    kind: 'block',
    type: 'sql_select',
    fields: {
      table: tableName,
    },
    statements: {
      COLUMNS: {
        block: {
          type: 'sql_attribute',
          fields: {
            ATTRIBUTE: attributeName,
          },
        },
      },
    },
    next: {
      block: {
        type: 'sql_where',
        statements: {
          EXPRESSION: {
            block: {
              type: 'sql_condition',
              fields: {
                OPERATOR: '='
              },
              statements: {
                CONDITION1: {
                  block: {
                    type: 'sql_attribute',
                    fields: {
                      ATTRIBUTE: attributeName,
                    },
                  },
                },
                CONDITION2: {
                  block: {
                    type: 'sql_constant',
                    fields: {
                      TYPE: 'Number',
                      VALUE: '1',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

*/