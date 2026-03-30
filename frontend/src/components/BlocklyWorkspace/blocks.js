import * as Blockly from 'blockly';
import { COLORS } from '../../utils/colors';
import { i18n, getTooltip } from '../../i18n/index';

function updateAllAttributes(workspace) {
  const allBlocks = workspace.getAllBlocks();

  allBlocks.forEach((block) => {
    if (block.type === 'sql_attribute' && typeof block.updateAttributes === 'function') {
      block.updateAttributes();
    }
  });
}

Blockly.Blocks['sql_select'] = {
  init: function () {
    this.workspace_ = this.workspace;

    this.appendDummyInput().appendField(i18n('SELECT'));
    this.appendStatementInput('COLUMNS').setCheck('sql_attribute').appendField('');

    this.updatingTable_ = false;

    const tableDropdown = new Blockly.FieldDropdown(
      () => this.getTables(),
      (newValue) => {
        if (this.updatingTable_) return;

        try {
          this.updatingTable_ = true;

          Blockly.Events.disable();
          this.setFieldValue(newValue, 'table');
          Blockly.Events.enable();

          this.onTableChange(newValue);
        } finally {
          this.updatingTable_ = false;
        }
      }
    );

    this.appendDummyInput().appendField(i18n('FROM')).appendField(tableDropdown, 'table');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, ['sql_join', 'sql_where', 'sql_order_by']);
    this.setColour(COLORS.QUERY);
    this.setTooltip(getTooltip('sql_select'));
  },

  getTables: function () {
    try {
      const workspace = this.workspace_ || Blockly.getMainWorkspace();
      const tables = workspace?.tables || [];

      if (tables.length === 0) {
        return [[i18n('SELECT_TABLE'), 'no_table']];
      }

      return tables.map((table) => [table.name, table.name]);
    } catch (error) {
      return [[i18n('ERROR_LOADING'), 'error']];
    }
  },

  onTableChange: function () {
    if (this.getFieldValue('table') === 'no_table') {
      this.setWarningText(i18n('NO_TABLES_AVAILABLE'));
    } else {
      this.setWarningText(null);
      this.updateAttributes();
    }
  },

  updateAttributes: function () {
    updateAllAttributes(this.workspace);
  }
};

Blockly.Blocks['sql_attribute'] = {
  init: function () {
    this.appendDummyInput('ATTRIBUTE_INPUT')
      .appendField(i18n('FIELD') + ':')
      .appendField(new Blockly.FieldDropdown(this.getAttributes.bind(this)), 'ATTRIBUTE');
    this.setPreviousStatement(true, 'sql_attribute');
    this.setNextStatement(true, 'sql_attribute');
    this.setColour(COLORS.VALUE);
    this.setTooltip(getTooltip('sql_attribute'));
  },

  isDirectlyInSelect: function () {
    const parentBlock = this.getParent();
    return parentBlock && parentBlock.type === 'sql_select';
  },

  getAttributes: function () {
    const workspace = this.workspace;
    const tables = workspace.tables || [];
    const usedTables = new Set();
    const isInSelect = this.isDirectlyInSelect();

    const allBlocks = workspace.getAllBlocks();
    allBlocks.forEach((block) => {
      if (
        block.type === 'sql_select' ||
        block.type === 'sql_insert' ||
        block.type === 'sql_update' ||
        block.type === 'sql_delete'
      ) {
        const tableName = block.getFieldValue('table');
        if (tableName && tableName !== 'no_table') usedTables.add(tableName);
      } else if (block.type === 'sql_join') {
        const tableName = block.getFieldValue('table');
        if (tableName && tableName !== 'no_table') usedTables.add(tableName);
      }
    });

    const attributes = [];
    const usedTablesArray = Array.from(usedTables);

    tables.forEach((table) => {
      if (usedTables.has(table.name)) {
        table.attributes.forEach((attr) => {
          attributes.push([`${table.name}.${attr.name}`, `${table.name}.${attr.name}`]);
        });
      }
    });

    if (isInSelect && usedTablesArray.length > 0) {
      usedTablesArray.forEach(tableName => {
        attributes.unshift([`${tableName}.*`, `${tableName}.*`]);
      });

      if (usedTablesArray.length > 1) {
        attributes.unshift([i18n('ALL_TABLES'), '*']);
      }
    } else if (isInSelect && attributes.length > 0) {
      attributes.unshift(['*', '*']);
    }

    return attributes.length > 0 ? attributes : [['*', '*']];
  },

  updateAttributes: function () {
    const dropdown = this.getField('ATTRIBUTE');
    if (dropdown) {
      const options = this.getAttributes();
      const currentValue = dropdown.getValue();
      const isInSelect = this.isDirectlyInSelect();

      let defaultValue = currentValue;
      if (isInSelect && (currentValue === null || currentValue === undefined)) {
      }

      if (JSON.stringify(options) !== JSON.stringify(dropdown.getOptions())) {
        const newDropdown = new Blockly.FieldDropdown(options);

        if (options.some((opt) => opt[1] === defaultValue)) {
          newDropdown.setValue(defaultValue);
        } else if (options.length > 0) {
          newDropdown.setValue(options[0][1]);
        }

        this.removeInput('ATTRIBUTE_INPUT');
        this.appendDummyInput('ATTRIBUTE_INPUT')
          .appendField(i18n('ATTRIBUTE') + ':')
          .appendField(newDropdown, 'ATTRIBUTE');
      }
    }
  },
};

Blockly.Blocks['sql_constant'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('TYPE') + ':')
      .appendField(
        new Blockly.FieldDropdown([
          [i18n('STRING'), 'String'],
          [i18n('NUMBER'), 'Number'],
          [i18n('BOOLEAN'), 'Boolean'],
          [i18n('DATE'), 'Date'],
          ['NULL', 'NULL'],
        ], this.onTypeChanged.bind(this)),
        'TYPE'
      );

    this.valueInput = this.appendDummyInput('value_input')
      .appendField(i18n('VALUE') + ':', 'VALUE_LABEL')
      .appendField(new Blockly.FieldTextInput(''), 'VALUE');

    this.setPreviousStatement(true, ['sql_constant', 'sql_condition']);
    this.setNextStatement(true, 'sql_constant');
    this.setColour(COLORS.VALUE);
    this.setTooltip(getTooltip('sql_constant'));
  },

  onTypeChanged: function (newType) {
    const input = this.getInput('value_input');
    if (!input) return;

    const fields = ['VALUE', 'VALUE_LABEL', 'YEAR', 'MONTH', 'DAY', 'LABEL_YEAR', 'LABEL_MONTH', 'LABEL_DAY'];
    fields.forEach((name) => {
      const existe = input.fieldRow.some((f) => f.name === name);
      if (existe) input.removeField(name);
    });

    // Agregar campos según tipo
    if (newType === 'Boolean') {
      input.appendField(new Blockly.FieldDropdown([
        ['TRUE', 'TRUE'],
        ['FALSE', 'FALSE'],
      ]), 'VALUE');

    } else if (newType === 'Number') {
      input
        .appendField(i18n('VALUE') + ':', 'VALUE_LABEL')
        .appendField(new Blockly.FieldNumber(0), 'VALUE');

    } else if (newType === 'Date') {
      const selectedYear = new Date().getFullYear();
      let selectedMonth = '01';

      const yearField = new Blockly.FieldNumber(selectedYear, 1900, 2100, 1, function (val) {
        updateDayDropdown();
        return val;
      });

      const monthNames = [
        [i18n('MONTH_JANUARY'), '01'],
        [i18n('MONTH_FEBRUARY'), '02'],
        [i18n('MONTH_MARCH'), '03'],
        [i18n('MONTH_APRIL'), '04'],
        [i18n('MONTH_MAY'), '05'],
        [i18n('MONTH_JUNE'), '06'],
        [i18n('MONTH_JULY'), '07'],
        [i18n('MONTH_AUGUST'), '08'],
        [i18n('MONTH_SEPTEMBER'), '09'],
        [i18n('MONTH_OCTOBER'), '10'],
        [i18n('MONTH_NOVEMBER'), '11'],
        [i18n('MONTH_DECEMBER'), '12']
      ];

      const monthField = new Blockly.FieldDropdown(monthNames, function (m) {
        selectedMonth = m;
        updateDayDropdown();
      });

      const daysFor = (year, month) => {
        const numDays = new Date(year, month, 0).getDate();
        return Array.from({ length: numDays }, (_, i) => {
          const d = i + 1;
          const padded = d < 10 ? '0' + d : d.toString();
          return [padded, padded];
        });
      };

      const dayField = new Blockly.FieldDropdown(daysFor(selectedYear, selectedMonth));

      const updateDayDropdown = () => {
        const year = yearField.getValue();
        const newDays = daysFor(year, parseInt(selectedMonth));
        const currentDay = dayField.getValue();
        dayField.menuGenerator_ = newDays;
        if (!newDays.some(([label, value]) => value === currentDay)) {
          dayField.setValue(newDays[0][1]);
        }
        dayField.forceRerender && dayField.forceRerender();
        this.render();
      };

      input.appendField(i18n('Mes') + ':', 'LABEL_MONTH').appendField(monthField, 'MONTH');
      input.appendField(i18n('Día') + ':', 'LABEL_DAY').appendField(dayField, 'DAY');
      input.appendField(i18n('Año') + ':', 'LABEL_YEAR').appendField(yearField, 'YEAR');
    } else if (newType === 'NULL') {
      input.appendField(new Blockly.FieldLabel('NULL'), 'VALUE');

    } else {
      input.appendField(i18n('VALUE') + ':', 'VALUE_LABEL')
        .appendField(new Blockly.FieldTextInput(''), 'VALUE');
    }

    this.render();
  }
};


Blockly.Blocks['sql_condition'] = {
  init: function () {
    const CATEGORIES = [
      [i18n('UNARIO'), 'UNARY'],
      [i18n('LOGICO'), 'LOGICAL'],
      [i18n('ARITMETICO'), 'ARITHMETIC'],
    ];

    const OPERATORS = {
      UNARY: [
        ['NOT', 'NOT'],
        ['IS NULL', 'IS NULL'],
        ['IS NOT NULL', 'IS NOT NULL'],
      ],
      LOGICAL: [
        ['=', '='],
        ['≠', '<>'],
        ['>', '>'],
        ['<', '<'],
        ['>=', '>='],
        ['<=', '<='],
        ['AND', 'AND'],
        ['OR', 'OR'],
        ['LIKE', 'LIKE'],
      ],
      ARITHMETIC: [
        ['+', '+'],
        ['-', '-'],
        ['*', '*'],
        ['/', '/'],
        ['%', '%'],
      ]
    };

    const block = this;

    block.appendDummyInput('CATEGORY_ROW')
      .appendField(new Blockly.FieldDropdown(CATEGORIES, function (newCategory) {
        updateOperatorDropdown(newCategory);
        updateLayout(newCategory);
      }), 'CATEGORY');

    block.appendStatementInput('CONDITION1')
      .setCheck(['sql_condition', 'sql_attribute', 'sql_constant'])
      .appendField('');

    block.appendDummyInput('OPERATOR_ROW')
      .appendField(new Blockly.FieldDropdown(OPERATORS.LOGICAL), 'OPERATOR');

    block.appendStatementInput('CONDITION2')
      .setCheck(['sql_condition', 'sql_attribute', 'sql_constant'])
      .appendField('');

    block.setPreviousStatement(true, ['sql_condition']);
    block.setNextStatement(true, ['sql_condition', 'sql_where']);
    block.setColour(COLORS.CONDITION);
    block.setTooltip(getTooltip('sql_condition'));

    function updateOperatorDropdown(category) {
      const operatorDropdown = block.getField('OPERATOR');
      operatorDropdown.menuGenerator_ = OPERATORS[category];
      operatorDropdown.setValue(OPERATORS[category][0][1]);
    }

    function updateLayout(category) {
      const input2 = block.getInput('CONDITION2');
      const operatorRow = block.getInput('OPERATOR_ROW');

      if (category === 'UNARY') {
        input2.setVisible(false);
        operatorRow.setVisible(true);
        block.moveInputBefore('OPERATOR_ROW', null);
      } else {
        input2.setVisible(true);
        operatorRow.setVisible(true);
        block.moveInputBefore('OPERATOR_ROW', 'CONDITION2');
      }

      block.render();
    }

    block.getField('CATEGORY').setValue('LOGICAL');
    updateLayout('LOGICAL');
  }
};


Blockly.Blocks['sql_attribute_constant_pair'] = {
  init: function () {
    this.appendStatementInput('ATTRIBUTE')
      .setCheck('sql_attribute')
      .appendField(i18n('FIELD'));

    this.appendStatementInput('CONSTANT')
      .setCheck('sql_constant')
      .appendField(i18n('VALUE'));

    this.setPreviousStatement(true, 'sql_attribute_constant_pair');
    this.setNextStatement(true, 'sql_attribute_constant_pair');
    this.setColour(COLORS.DML);
    this.setTooltip(getTooltip('sql_constant_pair'));
  },

  onchange: function (event) {
    if (event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_MOVE) {
      const attribute = this.getInput('ATTRIBUTE').connection.targetBlock();
      const constant = this.getInput('CONSTANT').connection.targetBlock();

      if (!attribute || !constant) {
        this.setWarningText(i18n('WARNING_BOTH_FIELDS_REQUIRED'));
      } else {
        this.setWarningText(null);
      }
    }
  }
};

Blockly.Blocks['sql_insert'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('INSERT_INTO'))
      .appendField(
        new Blockly.FieldDropdown(this.getTables(), this.onTableChange.bind(this)),
        'table'
      );
    this.appendStatementInput('COLUMNS').setCheck('sql_attribute').appendField('');
    this.appendStatementInput('VALUES').setCheck('sql_constant').appendField(i18n('VALUES'));
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setColour(COLORS.DML);
    this.setTooltip(getTooltip('sql_insert'));
  },
  getTables: function () {
    try {
      const workspace = this.workspace_ || Blockly.getMainWorkspace();
      const tables = workspace?.tables || [];

      if (tables.length === 0) {
        return [[i18n('SELECT_TABLE'), 'no_table']];
      }

      return tables.map((table) => [table.name, table.name]);
    } catch (error) {
      return [[i18n('ERROR_LOADING'), 'error']];
    }
  },
  onTableChange: function () {
    this.updateAttributes();
  },
  updateAttributes: function () {
    const columnsInput = this.getInput('COLUMNS');
    if (columnsInput && columnsInput.connection) {
      let attributeBlock = columnsInput.connection.targetBlock();
      while (attributeBlock) {
        if (attributeBlock.type === 'sql_attribute') {
          attributeBlock.updateAttributes();
        }
        attributeBlock = attributeBlock.getNextBlock();
      }
    }
  },
};

Blockly.Blocks['sql_update'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('UPDATE'))
      .appendField(
        new Blockly.FieldDropdown(this.getTables, this.onTableChange.bind(this)),
        'table'
      );

    this.appendStatementInput('SET')
      .setCheck(['sql_attribute', 'sql_attribute_constant_pair'])
      .appendField(i18n('SET'));

    this.appendStatementInput('VALUES')
      .setCheck('sql_constant')
      .appendField(i18n('VALUES'))

    this.appendStatementInput('WHERE_CONDITION')
      .setCheck('sql_condition')
      .appendField(i18n('WHERE'));

    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setColour(COLORS.DML);
    this.setTooltip(getTooltip('sql_update'));
  },

  getTables: function () {
    try {
      const workspace = this.workspace_ || Blockly.getMainWorkspace();
      const tables = workspace?.tables || [];

      if (tables.length === 0) {
        return [[i18n('SELECT_TABLE'), 'no_table']];
      }

      return tables.map((table) => [table.name, table.name]);
    } catch (error) {
      return [[i18n('ERROR_LOADING'), 'error']];
    }
  },


  onTableChange: function () {
    this.updateAttributes();
  },

  updateAttributes: function () {
    const setInput = this.getInput('SET');
    const whereInput = this.getInput('WHERE_CONDITION');

    [setInput, whereInput].forEach(input => {
      if (input && input.connection) {
        let block = input.connection.targetBlock();
        while (block) {
          if (block.updateAttributes) {
            block.updateAttributes();
          }
          block = block.getNextBlock();
        }
      }
    });

    const firstBlock = setInput.connection?.targetBlock();
    const valuesInput = this.getInput('VALUES');
    if (valuesInput) {
      if (firstBlock && firstBlock.type === 'sql_attribute') {
        valuesInput.setVisible(true);
      } else {
        valuesInput.setVisible(false);
      }
    }
  }
};

Blockly.Blocks['sql_delete'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('DELETE_FROM'))
      .appendField(new Blockly.FieldDropdown(this.getTables()), 'table');
    this.appendDummyInput().appendField(i18n('WHERE'));
    this.appendStatementInput('CONDITION').setCheck('sql_condition');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setColour(COLORS.DML);
    this.setTooltip(getTooltip('sql_delete'));

    this.setWarningText(null);
    this.setOnChange(function (changeEvent) {
      if (!this.getInput('CONDITION').connection.targetBlock()) {
        this.setWarningText(i18n('WARNING_DELETE_WITHOUT_WHERE'));
        this.setColour(COLORS.WARNING);
      } else {
        this.setWarningText(null);
        this.setColour(COLORS.DML);
      }
    });
  },
  getTables: function () {
    try {
      const workspace = this.workspace_ || Blockly.getMainWorkspace();
      const tables = workspace?.tables || [];

      if (tables.length === 0) {
        return [[i18n('SELECT_TABLE'), 'no_table']];
      }

      return tables.map((table) => [table.name, table.name]);
    } catch (error) {
      return [[i18n('ERROR_LOADING'), 'error']];
    }
  },
};

Blockly.Blocks['sql_where'] = {
  init: function () {
    this.appendDummyInput().appendField(i18n('WHERE'));
    this.appendStatementInput('EXPRESSION').setCheck('sql_condition');
    this.setPreviousStatement(true, [
      'sql_condition',
      'sql_select',
      'sql_delete',
      'sql_update',
      'sql_join',
    ]);
    this.setNextStatement(true, ['sql_group_by', 'sql_order_by', 'sql_limit']);
    this.setColour(COLORS.CONDITION);
    this.setTooltip(getTooltip('sql_where'));
  },
};

Blockly.Blocks['sql_join'] = {
  init: function () {
    this.workspace_ = this.workspace;

    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        [i18n('INNER_JOIN'), 'INNER JOIN'],
        [i18n('LEFT_JOIN'), 'LEFT JOIN'],
        [i18n('RIGHT_JOIN'), 'RIGHT JOIN'],
      ]),
      'join_type'
    );

    const tableDropdown = new Blockly.FieldDropdown(
      () => this.getTables(),
      (newValue) => {
        if (this.updatingTable_) return;

        try {
          this.updatingTable_ = true;

          Blockly.Events.disable();
          this.setFieldValue(newValue, 'table');
          Blockly.Events.enable();

          this.onTableChange(newValue);
        } finally {
          this.updatingTable_ = false;
        }
      }
    );

    this.appendDummyInput().appendField(tableDropdown, 'table').appendField(i18n('ON'));

    this.setPreviousStatement(true, ['sql_select', 'sql_join']);
    this.setNextStatement(true, ['sql_where', 'sql_join', 'sql_condition']);
    this.setColour(COLORS.JOIN);
    this.setTooltip(getTooltip('sql_join'));
  },

  getTables: function () {
    try {
      const workspace = this.workspace_ || Blockly.getMainWorkspace();
      const tables = workspace?.tables || [];

      if (tables.length === 0) {
        return [[i18n('SELECT_TABLE'), 'no_table']];
      }

      return tables.map((table) => [table.name, table.name]);
    } catch (error) {
      return [[i18n('ERROR_LOADING'), 'error']];
    }
  },

  onTableChange: function () {
    if (this.getFieldValue('table') === 'no_table') {
      this.setWarningText(i18n('No hay tablas disponibles'));
    } else {
      this.setWarningText(null);
      this.updateAttributes();
    }
  },

  updateAttributes: function () {
    updateAllAttributes(this.workspace);
  },
};

Blockly.Blocks['sql_union'] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        [i18n('UNION'), 'UNION'],
        [i18n('UNION_ALL'), 'UNION ALL'],
      ]),
      'union_type'
    );
    this.setPreviousStatement(true, ['sql_select', 'sql_where', 'sql_order_by']);
    this.setNextStatement(true, ['sql_select', 'sql_where']);
    this.setColour(COLORS.JOIN);
    this.setTooltip(getTooltip('sql_union'));
  },
};

Blockly.Blocks['sql_group_by'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('GROUP_BY'))
      .appendField(new Blockly.FieldTextInput('columna'), 'column');
    this.setPreviousStatement(true, ['sql_select', 'sql_where']);
    this.setNextStatement(true, ['sql_having', 'sql_order_by']);
    this.setColour(COLORS.SORTING);
    this.setTooltip(getTooltip('sql_group_by'));
  },
};

Blockly.Blocks['sql_order_by'] = {
  init: function () {
    this.appendDummyInput().appendField(i18n('ORDER_BY'));
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown(this.getAttributes.bind(this)),
      'column'
    );
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        [i18n('ASC'), 'ASC'],
        [i18n('DESC'), 'DESC'],
      ]),
      'order'
    );

    this.setPreviousStatement(true, ['sql_select', 'sql_where', 'sql_order_by']);

    this.setNextStatement(true, ['sql_limit']);

    this.setColour(COLORS.SORTING);
    this.setTooltip(getTooltip('sql_order_by'));
  },
  getAttributes: function () {
    const workspace = this.workspace;
    const tables = workspace.tables || [];

    let parentBlock = this.getParent();
    while (parentBlock && parentBlock.type !== 'sql_select') {
      parentBlock = parentBlock.getParent();
    }
    if (parentBlock) {
      const selectedTable = parentBlock.getFieldValue('table');
      const table = tables.find((table) => table.name === selectedTable);
      if (table) {
        return table.attributes.map((attr) => [attr.name, attr.name]);
      }
    }
    return [[i18n('SELECT_COLUMN'), 'ERROR']];
  },
};

Blockly.Blocks['sql_limit'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('LIMIT'))
      .appendField(
        new Blockly.FieldDropdown([
          ['1', '1'],
          ['2', '2'],
          ['3', '3'],
          ['4', '4'],
          ['5', '5'],
        ]),
        'LIMIT_VALUE'
      );

    this.setPreviousStatement(true, ['sql_select', 'sql_where', 'sql_order_by', 'sql_limit']);

    this.setNextStatement(false, null);

    this.setColour(COLORS.SORTING);
    this.setTooltip(getTooltip('sql_limit'));
  },
};

Blockly.Blocks['sql_having'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('HAVING'))
      .appendField(new Blockly.FieldTextInput('condición'), 'condition');
    this.setPreviousStatement(true, ['sql_group_by']);
    this.setNextStatement(true, ['sql_order_by']);
    this.setColour(COLORS.CONDITION);
    this.setTooltip(getTooltip('sql_having'));
  },
};

Blockly.Blocks['sql_create_table'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('CREATE_TABLE'))
      .appendField(new Blockly.FieldTextInput('tabla'), 'table');
    this.appendDummyInput()
      .appendField('(')
      .appendField(new Blockly.FieldTextInput('columna1 tipo, columna2 tipo'), 'columns')
      .appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip(getTooltip('sql_create_table'));
  },
};

Blockly.Blocks['sql_alter_table'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('ALTER_TABLE'))
      .appendField(new Blockly.FieldTextInput('tabla'), 'table');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          [i18n('ADD'), 'ADD'],
          [i18n('DROP_COLUMN'), 'DROP'],
          [i18n('MODIFY'), 'MODIFY'],
        ]),
        'action'
      )
      .appendField(new Blockly.FieldTextInput('columna tipo'), 'column');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip(getTooltip('sql_alter_table'));
  },
};

Blockly.Blocks['sql_drop_table'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('DROP_TABLE'))
      .appendField(new Blockly.FieldTextInput('tabla'), 'table');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip(getTooltip('sql_drop_table'));
  },
};

Blockly.Blocks['sql_begin_transaction'] = {
  init: function () {
    this.appendDummyInput().appendField(i18n('BEGIN_TRANSACTION'));
    this.setPreviousStatement(false, null);
    this.setNextStatement(true, ['sql_select', 'sql_insert', 'sql_update']);
    this.setColour(300);
    this.setTooltip(getTooltip('sql_begin_transaction'));
  },
};

Blockly.Blocks['sql_commit'] = {
  init: function () {
    this.appendDummyInput().appendField(i18n('COMMIT'));
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(300);
    this.setTooltip(getTooltip('sql_commit'));
  },
};

Blockly.Blocks['sql_rollback'] = {
  init: function () {
    this.appendDummyInput().appendField(i18n('ROLLBACK'));
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(300);
    this.setTooltip(getTooltip('sql_rollback'));
  },
};

Blockly.Blocks['sql_aggregation'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(i18n('FUNCTION'))
      .appendField(new Blockly.FieldDropdown([
        ['SUM', 'SUM'],
        ['AVG', 'AVG'],
        ['COUNT', 'COUNT'],
        ['MAX', 'MAX'],
        ['MIN', 'MIN'],
      ]), 'AGG_FUNCTION');

    this.appendValueInput('ATTRIBUTE')
      .setCheck('sql_attribute')
      .appendField(i18n('ON'));

    this.setOutput(true, 'sql_attribute');
    this.setColour(COLORS.VALUE);
    this.setTooltip(getTooltip('sql_aggregation'));
  }
};