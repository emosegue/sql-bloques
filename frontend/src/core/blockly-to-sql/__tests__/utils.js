export function makeAttributeBlock(name, next = null) {
  return {
    type: 'sql_attribute',
    getFieldValue: (field) => (field === 'ATTRIBUTE' ? name : null),
    getNextBlock: () => next
  };
}

export function makeConstantBlock(value, type = 'String', next = null) {
  return {
    type: 'sql_constant',
    getFieldValue: (name) => {
      if (name === 'VALUE') return value;
      if (name === 'TYPE') return type;
      return null;
    },
    getNextBlock: () => next
  };
}

export function makeConditionBlock(attribute, constant) {
  return {
    type: 'sql_condition',
    getFieldValue: (name) => (name === 'OPERATOR' ? '=' : null),
    getInputTargetBlock: (name) => {
      if (name === 'CONDITION1') {
        return {
          type: 'sql_attribute',
          getFieldValue: () => attribute,
          getInputTargetBlock: () => null
        };
      }
      if (name === 'CONDITION2') return constant;
      return null;
    },
    getNextBlock: () => null
  };
}

export function makeWhereBlock(conditionBlock) {
  return {
    type: 'sql_where',
    getInputTargetBlock: (name) => (name === 'EXPRESSION' ? conditionBlock : null),
    getNextBlock: () => null
  };
}

export function makeOrderByBlock(column, order = 'ASC') {
  return {
    type: 'sql_order_by',
    getFieldValue: (name) => {
      if (name === 'column') return column;
      if (name === 'order') return order;
      return null;
    },
    getNextBlock: () => null
  };
}

export function makeLimitBlock(limitValue) {
  return {
    type: 'sql_limit',
    getFieldValue: (name) => (name === 'LIMIT_VALUE' ? limitValue : null),
    getNextBlock: () => null
  };
}

export function makeJoinBlock(type, table, conditionBlock) {
  return {
    type: 'sql_join',
    getFieldValue: name => {
      if (name === 'join_type') return type;
      if (name === 'table') return table;
      return null;
    },
    getNextBlock: () => conditionBlock
  };
}

export function makeEquality(left, right) {
  return {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? '=' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') return { type: 'sql_attribute', getFieldValue: () => left };
      if (name === 'CONDITION2') return { type: 'sql_attribute', getFieldValue: () => right };
      return null;
    },
    getNextBlock: () => null
  };
}

export function makeUnionBlock(unionType, selectBlock) {
  return {
    type: 'sql_union',
    getFieldValue: (name) => (name === 'union_type' ? unionType : null),
    getNextBlock: () => selectBlock
  };
}

export function makeAttributeValue(attr, valueBlock, next = null) {
  return {
    type: 'sql_attribute_value',
    getFieldValue: (field) => (field === 'ATTRIBUTE' ? attr : null),
    valueBlock,
    getNextBlock: () => next
  };
}

export function makeInsertBlock(table, columnsBlock, valuesBlock) {
  return {
    type: 'sql_insert',
    getFieldValue: (name) => (name === 'table' ? table : null),
    getInput: (name) => {
      if (name === 'COLUMNS') return { connection: { targetBlock: () => columnsBlock } };
      if (name === 'VALUES') return { connection: { targetBlock: () => valuesBlock } };
      return null;
    },
    getNextBlock: () => null
  };
}

export function makeUpdateBlock(table, setBlock, whereConditionBlock = null) {
  return {
    type: 'sql_update',
    getFieldValue: (name) => {
      if (name === 'table') return table;
      return null;
    },
    getInput: (name) => {
      if (name === 'SET') return { connection: { targetBlock: () => setBlock } };
      if (name === 'WHERE_CONDITION' && whereConditionBlock) {
        return { connection: { targetBlock: () => whereConditionBlock } };
      }
      return null;
    },
    getNextBlock: () => null
  };
}

export function makeAttributeConstantPair(attrName, constantBlock, next = null) {
  return {
    type: 'sql_attribute_constant_pair',
    getInputTargetBlock: (inputName) => {
      if (inputName === 'ATTRIBUTE') {
        return {
          type: 'sql_attribute',
          getFieldValue: (name) => (name === 'ATTRIBUTE' ? attrName : null)
        };
      }
      if (inputName === 'CONSTANT') {
        return constantBlock;
      }
      return null;
    },
    getNextBlock: () => next
  };
}

export function makeDeleteBlock(table, conditionBlock = null) {
  return {
    type: 'sql_delete',
    getFieldValue: (name) => (name === 'table' ? table : null),
    getInput: (name) =>
      name === 'CONDITION' && conditionBlock
        ? { connection: { targetBlock: () => conditionBlock } }
        : null,
    getNextBlock: () => null
  };
}