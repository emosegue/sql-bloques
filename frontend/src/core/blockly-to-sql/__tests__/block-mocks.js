import {
  makeInsertBlock,
  makeAttributeBlock,
  makeConditionBlock,
  makeConstantBlock,
  makeJoinBlock,
  makeLimitBlock,
  makeOrderByBlock,
  makeWhereBlock,
  makeUnionBlock,
  makeEquality,
  makeUpdateBlock,
  makeAttributeConstantPair,
  makeDeleteBlock,
} from "./utils";

/** SELECT */

export function mockGenericCase1() {
  const condition = makeConditionBlock('nombre', makeConstantBlock('Emanuel', 'String'));
  return {
    type: 'sql_where',
    getInputTargetBlock: name => (name === 'EXPRESSION' ? condition : null),
    getNextBlock: () => null
  };
}

export function mockSelectCase1() {
  const attr = makeAttributeBlock('nombre', makeAttributeBlock('apellido'));
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => null
  };
}

export function mockSelectCase2() {
  const attr = makeAttributeBlock('nombre', makeAttributeBlock('apellido'));
  const condition = makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'));
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase3() {
  const attr = makeAttributeBlock('nombre', makeAttributeBlock('apellido'));
  const condition = makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'));
  const where = makeWhereBlock(condition);
  const orderBy = makeOrderByBlock('apellido', 'DESC');
  const limit = makeLimitBlock('5');
  where.getNextBlock = () => orderBy;
  orderBy.getNextBlock = () => limit;
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase4() {
  const attr = makeAttributeBlock('atributoInexistente', makeAttributeBlock('apellido'));
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => null
  };
}

export function mockSelectCase5() {
  const attr = makeAttributeBlock('nombre', makeAttributeBlock('apellido'));
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? null : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => null
  };
}

export function mockSelectCase6() {
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => null } } : null,
    getNextBlock: () => null
  };
}

export function mockSelectCase7() {
  const attr = makeAttributeBlock('nombre');
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? '>' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') {
        return { type: 'sql_attribute', getFieldValue: () => 'altura' };
      }
      if (name === 'CONDITION2') {
        return makeConstantBlock('1.80', 'Number');
      }
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase8() {
  const attr = makeAttributeBlock('nombre');
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? 'AND' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') {
        return makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'));
      }
      if (name === 'CONDITION2') {
        return makeConditionBlock('posicion', makeConstantBlock('defensor', 'String'));
      }
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase9() {
  const attr = makeAttributeBlock('nombre');
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? 'OR' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') {
        return makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'));
      }
      if (name === 'CONDITION2') {
        return makeConditionBlock('nacionalidad', makeConstantBlock('uruguayo', 'String'));
      }
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase10() {
  const attr = makeAttributeBlock('nombre');
  const inner = makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'));
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? 'NOT' : null),
    getInputTargetBlock: name => (name === 'CONDITION1' ? inner : null),
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase11() {
  const attr = makeAttributeBlock('nombre');
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? 'LIKE' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') return { type: 'sql_attribute', getFieldValue: () => 'nombre' };
      if (name === 'CONDITION2') return makeConstantBlock('%man%', 'String');
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase12() {
  const attr = makeAttributeBlock('nombre');
  const condition = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? 'IS NOT NULL' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') return { type: 'sql_attribute', getFieldValue: () => 'altura' };
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(condition);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase13() {
  const attr = { type: 'sql_attribute', getFieldValue: name => (name === 'ATTRIBUTE' ? '*' : null), getNextBlock: () => null };
  const inner = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? '+' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') return { type: 'sql_attribute', getFieldValue: () => 'detalles_venta.precio_unitario' };
      if (name === 'CONDITION2') return makeConstantBlock('1000', 'Number');
      return null;
    },
    getNextBlock: () => null
  };
  const outer = {
    type: 'sql_condition',
    getFieldValue: name => (name === 'OPERATOR' ? '>' : null),
    getInputTargetBlock: name => {
      if (name === 'CONDITION1') return inner;
      if (name === 'CONDITION2') return makeConstantBlock('5000', 'Number');
      return null;
    },
    getNextBlock: () => null
  };
  const where = makeWhereBlock(outer);
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'detalles_venta' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };
}

export function mockSelectCase14() {
  const attr = makeAttributeBlock('Jugador.nombre', makeAttributeBlock('Equipo.nombre'));
  const joinCond = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const join = makeJoinBlock('INNER JOIN', 'Equipo', joinCond);
  joinCond.getNextBlock = () => null;
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => join
  };
}

export function mockSelectCase15() {
  const attr = makeAttributeBlock('Jugador.nombre', makeAttributeBlock('Equipo.nombre'));
  const joinCond = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const join = makeJoinBlock('INNER JOIN', 'Equipo', joinCond);
  const where = makeWhereBlock(makeConditionBlock('Equipo.nombre', makeConstantBlock('Boca', 'String')));
  joinCond.getNextBlock = () => where;
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => join
  };
}

export function mockSelectCase16() {
  const attr = makeAttributeBlock('Jugador.nombre', makeAttributeBlock('Equipo.nombre', makeAttributeBlock('Club.nombre')));
  const joinCond1 = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const join1 = makeJoinBlock('INNER JOIN', 'Equipo', joinCond1);
  const joinCond2 = makeEquality('Equipo.id_club', 'Club.id');
  const join2 = makeJoinBlock('INNER JOIN', 'Club', joinCond2);
  joinCond1.getNextBlock = () => join2;
  joinCond2.getNextBlock = () => null;
  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => join1
  };
}

export function mockSelectCase17() {
  const attr1 = makeAttributeBlock('nombre');
  const where1 = makeWhereBlock(makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String')));
  const select1 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name => name === 'COLUMNS' ? { connection: { targetBlock: () => attr1 } } : null,
    getNextBlock: () => where1
  };
  const attr2 = makeAttributeBlock('nombre');
  const where2 = makeWhereBlock(makeConditionBlock('nacionalidad', makeConstantBlock('uruguayo', 'String')));
  const select2 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name => name === 'COLUMNS' ? { connection: { targetBlock: () => attr2 } } : null,
    getNextBlock: () => where2
  };
  const union = makeUnionBlock('UNION', select2);
  where1.getNextBlock = () => union;
  return select1;
}

export function mockSelectCase18() {
  const makeSelectWithValue = nacionalidad => {
    const attr = makeAttributeBlock('nombre');
    const where = makeWhereBlock(
      makeConditionBlock('nacionalidad', makeConstantBlock(nacionalidad, 'String'))
    );
    return {
      type: 'sql_select',
      getFieldValue: name => (name === 'table' ? 'Jugador' : null),
      getInput: name =>
        name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
      getNextBlock: () => where
    };
  };

  const select3 = makeSelectWithValue('chileno');
  const union2 = makeUnionBlock('UNION', select3);

  const select2 = makeSelectWithValue('uruguayo');
  select2.getNextBlock = () => union2;

  const union1 = makeUnionBlock('UNION', select2);

  const select1 = makeSelectWithValue('argentino');
  select1.getNextBlock = () => union1;

  return select1;
}

export function mockSelectCase19() {
  const attr = makeAttributeBlock('nombre');
  const where = makeWhereBlock(
    makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'))
  );

  const select1 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => where
  };

  const union = {
    type: 'sql_union',
    getFieldValue: name => (name === 'union_type' ? 'UNION' : null),
    getNextBlock: () => null
  };

  where.getNextBlock = () => union;

  return select1;
}

export function mockSelectCase20() {
  const attr = makeAttributeBlock('nombre');
  const join = {
    type: 'sql_join',
    getFieldValue: name => {
      if (name === 'join_type') return 'INNER JOIN';
      if (name === 'table') return 'Equipo';
      return null;
    },
    getNextBlock: () => null
  };

  return {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => join
  };
}

export function mockSelectCase21() {
  const attrJoin = makeAttributeBlock('Jugador.nombre', makeAttributeBlock('Equipo.nombre'));
  const joinCond = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const join = makeJoinBlock('INNER JOIN', 'Equipo', joinCond);
  joinCond.getNextBlock = () => null;

  const select1 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attrJoin } } : null,
    getNextBlock: () => join
  };

  const attr2 = makeAttributeBlock('nombre');
  const where2 = makeWhereBlock(
    makeConditionBlock('nacionalidad', makeConstantBlock('uruguayo', 'String'))
  );

  const select2 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr2 } } : null,
    getNextBlock: () => where2
  };

  const union = makeUnionBlock('UNION', select2);
  joinCond.getNextBlock = () => union;

  return select1;
}

export function mockSelectCase22() {
  const attr1 = makeAttributeBlock('nombre');
  const where1 = makeWhereBlock(
    makeConditionBlock('nacionalidad', makeConstantBlock('argentino', 'String'))
  );

  const select1 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr1 } } : null,
    getNextBlock: () => where1
  };

  const attrJoin = makeAttributeBlock('Jugador.nombre', makeAttributeBlock('Equipo.nombre'));
  const joinCond = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const join = makeJoinBlock('INNER JOIN', 'Equipo', joinCond);
  joinCond.getNextBlock = () => null;

  const select2 = {
    type: 'sql_select',
    getFieldValue: name => (name === 'table' ? 'Jugador' : null),
    getInput: name =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attrJoin } } : null,
    getNextBlock: () => join
  };

  const union = makeUnionBlock('UNION', select2);
  where1.getNextBlock = () => union;

  return select1;
}

/** INSERT */

export function mockInsertCase1() {
  const col = makeAttributeBlock('nombre');
  const val = makeConstantBlock('Juan');
  return makeInsertBlock('Jugador', col, val);
}

export function mockInsertCase2() {
  const col2 = makeAttributeBlock('apellido');
  const col1 = makeAttributeBlock('nombre', col2);

  const val2 = makeConstantBlock('Pérez');
  const val1 = makeConstantBlock('Juan', 'String', val2);

  return makeInsertBlock('Jugador', col1, val1);
}

export function mockInsertCase3() {
  const col3 = makeAttributeBlock('apellido');
  const col2 = makeAttributeBlock('nombre', col3);
  const col1 = makeAttributeBlock('dni', col2);

  const val3 = makeConstantBlock('Pérez');
  const val2 = makeConstantBlock('Juan', 'String', val3);
  const val1 = makeConstantBlock(28222111, 'Number', val2);

  return makeInsertBlock('Jugador', col1, val1);
}

export function mockInsertCaseError1() {
  const col = makeAttributeBlock('nombre');

  const val2 = makeConstantBlock('Juan');
  const val1 = makeConstantBlock('Pérez', 'String', val2); // dos valores

  return makeInsertBlock('Jugador', col, val1);
}

export function mockInsertCaseError2() {
  const val = makeConstantBlock('Juan');
  return makeInsertBlock('Jugador', null, val);
}

/** UPDATE */

export function mockUpdateCase1() {
  const setBlock = makeAttributeConstantPair('nacionalidad', makeConstantBlock('argentino'));
  return makeUpdateBlock('Jugador', setBlock);
}

export function mockUpdateCase2() {
  const pair2 = makeAttributeConstantPair('apellido', makeConstantBlock('Pérez'));
  const pair1 = makeAttributeConstantPair('nombre', makeConstantBlock('Juan'), pair2);
  return makeUpdateBlock('Jugador', pair1);
}

export function mockUpdateCase3() {
  const setBlock = makeAttributeConstantPair('nacionalidad', makeConstantBlock('argentino'));
  const condition = makeConditionBlock('dni', makeConstantBlock(12345678, 'Number'));
  return makeUpdateBlock('Jugador', setBlock, condition);
}

export function mockUpdateCaseError1() {
  return makeUpdateBlock('Jugador', null);
}

export function mockUpdateCaseError2() {
  const setBlock = makeAttributeConstantPair('nombre', makeConstantBlock('Juan'));
  return makeUpdateBlock(null, setBlock);
}


/** DELETE */

export function mockDeleteCase1() {
  return makeDeleteBlock('Jugador');
}

export function mockDeleteCase2() {
  const condition = makeConditionBlock('dni', makeConstantBlock(12345678, 'Number'));
  return makeDeleteBlock('Jugador', condition);
}

export function mockDeleteCaseError1() {
  return makeDeleteBlock(null);
}