import { i18n } from '../../i18n';
import { blockToSQL } from './sql-generator';

export function generateSelect(block) {
  if (!block || block.type !== 'sql_select') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('SELECT_BLOCK_EXPECTED')}`);
  }

  const table = block.getFieldValue('table');
  if (!table) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('SELECT_TABLE_MISSING')}`);
  }

  let columns = '';
  const columnsInput = block.getInput('COLUMNS');

  if (columnsInput && columnsInput.connection) {
    let columnBlock = columnsInput.connection.targetBlock();
    while (columnBlock) {
      if (columnBlock.type === 'sql_attribute') {
        columns += (columns ? ', ' : '') + columnBlock.getFieldValue('ATTRIBUTE');
      }
      columnBlock = columnBlock.getNextBlock();
    }
  }

  if (!columns) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('SELECT_ATTRIBUTE_EXPECTED')}`);
  }

  let sql = `SELECT ${columns} FROM ${table}`;
  let nextBlock = block.getNextBlock();

  while (nextBlock) {
    switch (nextBlock.type) {
      case 'sql_join': {
        sql += ' ' + generateJoinClause(nextBlock);
        const afterJoin = nextBlock.getNextBlock()?.getNextBlock();
        if (
          afterJoin &&
          !['sql_where', 'sql_order_by', 'sql_limit', 'sql_union'].includes(afterJoin.type)
        ) {
          throw new Error(
            `${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_BLOCK_INVALID_NEXT')} ${afterJoin.type}`
          );
        }
        nextBlock = afterJoin;
        break;
      }
      case 'sql_union':
        sql += ' ' + generateUnionClause(nextBlock);
        nextBlock = null;
        break;
      case 'sql_where':
        sql += ' ' + generateWhereClause(nextBlock);
        nextBlock = nextBlock.getNextBlock();
        break;
      case 'sql_order_by':
        sql += ' ' + generateOrderByClause(nextBlock);
        nextBlock = nextBlock.getNextBlock();
        break;
      case 'sql_limit':
        sql += ' ' + generateLimitClause(nextBlock);
        nextBlock = nextBlock.getNextBlock();
        break;
      default:
        if (nextBlock.type === 'sql_select') {
          throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('NO_SECOND_SELECT_ALLOWED')}`);
        }
        sql += ' ' + blockToSQL(nextBlock);
        nextBlock = nextBlock.getNextBlock();
        break;
    }
  }

  return sql;
}

export function generateInsert(block) {
  if (!block || block.type !== 'sql_insert') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_BLOCK_EXPECTED')}`);
  }

  const table = block.getFieldValue('table');
  if (!table) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_TABLE_MISSING')}`);
  }

  let columns = '';
  let values = '';
  let columnCount = 0;
  let valueCount = 0;

  const columnsInput = block.getInput('COLUMNS');
  if (!columnsInput || !columnsInput.connection || !columnsInput.connection.targetBlock()) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_COLUMNS_MISSING')}`);
  }

  let columnBlock = columnsInput.connection.targetBlock();
  while (columnBlock) {
    if (columnBlock.type === 'sql_attribute') {
      const name = columnBlock.getFieldValue('ATTRIBUTE');
      if (!name) {
        throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_ATTRIBUTE_NO_NAME')}`);
      }
      columns += (columns ? ', ' : '') + name;
      columnCount++;
    }
    columnBlock = columnBlock.getNextBlock();
  }

  const valuesInput = block.getInput('VALUES');
  if (!valuesInput || !valuesInput.connection || !valuesInput.connection.targetBlock()) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_VALUES_MISSING')}`);
  }

  let valueBlock = valuesInput.connection.targetBlock();
  while (valueBlock) {
    if (valueBlock.type === 'sql_constant') {
      const type = valueBlock.getFieldValue('TYPE');
      let value = valueBlock.getFieldValue('VALUE');

      if (value === undefined) {
        throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_VALUE_UNDEFINED')}`);
      }

      if (type === 'String') {
        value = `'${value.replace(/'/g, "''")}'`;
      } else if (type === 'Boolean') {
        value = value.toLowerCase();
      } else if (type === 'NULL') {
        value = 'NULL';
      } else if (type === 'Date') {
        const year = valueBlock.getFieldValue('YEAR');
        const month = valueBlock.getFieldValue('MONTH');
        const day = valueBlock.getFieldValue('DAY');

        if (!year || !month || !day) {
          throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_DATE_INCOMPLETE')}`);
        }

        value = `'${year}-${month}-${day}'`;
      }

      values += (values ? ', ' : '') + value;
      valueCount++;
    }
    valueBlock = valueBlock.getNextBlock();
  }

  if (columnCount !== valueCount) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('INSERT_COLUMNS_VALUES_MISMATCH')}`);
  }

  if (!columns && !values) {
    return `INSERT INTO ${table} DEFAULT VALUES`;
  }

  return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
}

export function generateDelete(block) {
  if (!block || block.type !== 'sql_delete') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('DELETE_BLOCK_EXPECTED')}`);
  }

  const table = block.getFieldValue('table');
  if (!table) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('DELETE_TABLE_MISSING')}`);
  }

  let whereClause = '';

  const conditionInput = block.getInput('CONDITION');
  if (conditionInput && conditionInput.connection) {
    const conditionBlock = conditionInput.connection.targetBlock();
    if (conditionBlock) {
      whereClause = ' WHERE ' + generateConditionClause(conditionBlock);
    }
  }

  return `DELETE FROM ${table}${whereClause}`;
}

export function generateConditionClause(block) {
  if (!block) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('CONDITION_EXPECTED')}`);
  }

  if (block.type === 'sql_condition') {
    const operator = block.getFieldValue('OPERATOR');
    if (!operator) {
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('CONDITION_OPERATOR_UNDEFINED')}`);
    }

    const condition1 = block.getInputTargetBlock('CONDITION1');
    if (!condition1) {
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('CONDITION_MISSING_FIRST')}`);
    }

    if (operator === 'NOT') {
      return `NOT (${generateConditionClause(condition1)})`;
    }

    if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
      return `(${generateConditionClause(condition1)} ${operator})`;
    }

    const condition2 = block.getInputTargetBlock('CONDITION2');
    if (!condition2) {
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('CONDITION_MISSING_SECOND')}`);
    }

    return `(${generateConditionClause(condition1)} ${operator} ${generateConditionClause(condition2)})`;
  } else if (block.type === 'sql_attribute') {
    const attribute = block.getFieldValue('ATTRIBUTE');
    if (!attribute) {
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('ATTRIBUTE_UNDEFINED')}`);
    }
    return attribute;
  } else if (block.type === 'sql_constant') {
    const type = block.getFieldValue('TYPE');
    let value = block.getFieldValue('VALUE');

    if (value === undefined) {
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('VALUE_UNDEFINED')}`);
    }

    switch (type) {
      case 'String':
        return `'${value.replace(/'/g, "''")}'`;
      case 'Number':
        return value;
      case 'Boolean':
        return value.toLowerCase();
      case 'Date': {
        const year = block.getFieldValue('YEAR');
        const month = block.getFieldValue('MONTH');
        const day = block.getFieldValue('DAY');

        if (!year || !month || !day) {
          throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('DATE_INCOMPLETE')}`);
        }

        return `'${year}-${month}-${day}'`;
      }
      case 'NULL':
        return 'NULL';
      default:
        throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNRECOGNIZED_TYPE')} ${type}`);
    }
  }

  throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNSUPPORTED_BLOCK_TYPE')} ${block.type}`);
}

export function generateUpdate(block) {
  if (!block || block.type !== 'sql_update') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UPDATE_BLOCK_EXPECTED')}`);
  }

  const table = block.getFieldValue('table');
  if (!table || table === 'no_table' || table === 'error') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UPDATE_TABLE_MISSING')}`);
  }

  const setClauses = [];
  const setInput = block.getInput('SET');

  if (setInput && setInput.connection) {
    let setBlock = setInput.connection.targetBlock();
    while (setBlock) {
      if (setBlock.type === 'sql_attribute_constant_pair') {
        const attributeBlock = setBlock.getInputTargetBlock('ATTRIBUTE');
        const constantBlock = setBlock.getInputTargetBlock('CONSTANT');

        if (attributeBlock && constantBlock) {
          const field = attributeBlock.getFieldValue('ATTRIBUTE');
          const value = constantBlock.getFieldValue('VALUE');
          const valueType = constantBlock.getFieldValue('TYPE');

          let formattedValue = formatValue(value, valueType, constantBlock);

          if (field && value !== undefined) {
            setClauses.push(`${field} = ${formattedValue}`);
          }
        }
      } else if (setBlock.type === 'sql_attribute') {
        const field = setBlock.getFieldValue('ATTRIBUTE');
        if (field) {
          const valuesInput = block.getInput('VALUES');
          if (valuesInput && valuesInput.connection) {
            let valueBlock = valuesInput.connection.targetBlock();
            if (valueBlock && valueBlock.type === 'sql_constant') {
              const value = valueBlock.getFieldValue('VALUE');
              const valueType = valueBlock.getFieldValue('TYPE');

              let formattedValue = formatValue(value, valueType, valueBlock);

              if (value !== undefined) {
                setClauses.push(`${field} = ${formattedValue}`);
              }
            }
          }
        }
      }
      setBlock = setBlock.getNextBlock();
    }
  }

  if (setClauses.length === 0) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UPDATE_SET_MISSING')}`);
  }

  let whereClause = '';
  const whereInput = block.getInput('WHERE_CONDITION');
  if (whereInput && whereInput.connection) {
    const conditionBlock = whereInput.connection.targetBlock();
    if (conditionBlock) {
      whereClause = ' WHERE ' + generateConditionClause(conditionBlock);
    }
  }

  return `UPDATE ${table} SET ${setClauses.join(', ')}${whereClause}`;
}

export function generateWhereClause(block) {
  if (!block || block.type !== 'sql_where') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('WHERE_BLOCK_EXPECTED')}`);
  }

  const conditionBlock = block.getInputTargetBlock('EXPRESSION');
  if (!conditionBlock) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('WHERE_EXPRESSION_EXPECTED')}`);
  }

  return `WHERE ${generateConditionClause(conditionBlock)}`;
}

export function generateJoinClause(block) {
  if (!block || block.type !== 'sql_join') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_BLOCK_EXPECTED')}`);
  }

  const joinType = block.getFieldValue('join_type');
  if (!joinType) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_TYPE_MISSING')}`);
  }

  const table = block.getFieldValue('table');
  if (!table) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_TABLE_MISSING')}`);
  }

  const conditionBlock = block.getNextBlock();
  if (!conditionBlock || conditionBlock.type !== 'sql_condition') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_ON_EXPECTED')}`);
  }

  const onCondition = generateConditionClause(conditionBlock);
  if (!onCondition) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_ON_EMPTY')}`);
  }

  const nextBlock = conditionBlock.getNextBlock();
  if (nextBlock && nextBlock.type === 'sql_join') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('JOIN_ONLY_ONE_ALLOWED')}`);
  }

  return `${joinType} ${table} ON ${onCondition}`;
}

export function generateUnionClause(block) {
  if (!block || block.type !== 'sql_union') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNION_BLOCK_EXPECTED')}`);
  }

  const unionType = block.getFieldValue('union_type');
  if (!unionType) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNION_TYPE_MISSING')}`);
  }

  const selectBlock = block.getNextBlock();
  if (!selectBlock || selectBlock.type !== 'sql_select') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNION_SELECT_EXPECTED')}`);
  }

  const after = selectBlock.getNextBlock?.();
  if (after && after.type === 'sql_union') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UNION_ONLY_ONE_ALLOWED')}`);
  }

  return ` ${unionType} ${generateSelect(selectBlock)}`;
}

export function generateOrderByClause(block) {
  if (!block || block.type !== 'sql_order_by') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('ORDER_BY_BLOCK_EXPECTED')}`);
  }

  const column = block.getFieldValue('column');
  const order = block.getFieldValue('order') || 'ASC';

  if (!column || column === 'ERROR') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('ORDER_BY_COLUMN_INVALID')}`);
  }

  return `ORDER BY ${column} ${order}`;
}

export function generateLimitClause(block) {
  if (!block || block.type !== 'sql_limit') {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('LIMIT_BLOCK_EXPECTED')}`);
  }

  const limitValue = block.getFieldValue('LIMIT_VALUE');

  if (!limitValue || isNaN(parseInt(limitValue))) {
    throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('LIMIT_VALUE_INVALID')}`);
  }

  return `LIMIT ${limitValue}`;
}

function formatValue(value, valueType, block) {
  switch (valueType) {
    case 'String':
      return `'${value.replace(/'/g, "''")}'`;
    case 'Number':
      return value;
    case 'Boolean':
      return value.toLowerCase();
    case 'Date': {
      const year = block.getFieldValue('YEAR');
      const month = block.getFieldValue('MONTH');
      const day = block.getFieldValue('DAY');

      if (!year || !month || !day) {
        throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UPDATE_DATE_INCOMPLETE')}`);
      }
      return `'${year}-${month}-${day}'`;
    }
    case 'NULL':
      return 'NULL';
    default:
      throw new Error(`${i18n('SYNTAX_ERROR')}\n\n${i18n('UPDATE_UNRECOGNIZED_TYPE')} ${valueType}`);
  }
}