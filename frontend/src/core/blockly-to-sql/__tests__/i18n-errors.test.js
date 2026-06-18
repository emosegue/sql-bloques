import { generateSQL } from '../sql-generator.js';
import { generateSelect, generateConditionClause } from '../sql-clauses.js';
import { i18n, setLanguage, getBlockLabel, getDataTypeLabel } from '../../../i18n';
import * as mockCases from './block-mocks.js';
import { makeAttributeBlock, makeJoinBlock, makeEquality } from './utils.js';

const mockWorkspace = (block) => ({
  getTopBlocks: () => [block],
});

const normalize = (text) => text.replace(/\s+/g, ' ').trim();

function expectSyntaxError(result, messageParts) {
  const normalized = normalize(result);
  messageParts.forEach((part) => {
    expect(normalized).toContain(normalize(part));
  });
}

function expectThrowsSyntaxError(fn, messageParts) {
  try {
    fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (error.message === 'Expected function to throw') {
      throw error;
    }
    expectSyntaxError(error.message, messageParts);
  }
}

function buildJoinWithInvalidNextBlock(invalidBlockType) {
  const attr = makeAttributeBlock('nombre');
  const joinCond = makeEquality('Jugador.id_equipo', 'Equipo.id');
  const invalidNext = { type: invalidBlockType };
  joinCond.getNextBlock = () => invalidNext;
  const join = makeJoinBlock('INNER JOIN', 'Equipo', joinCond);

  return {
    type: 'sql_select',
    getFieldValue: (name) => (name === 'table' ? 'Jugador' : null),
    getInput: (name) =>
      name === 'COLUMNS' ? { connection: { targetBlock: () => attr } } : null,
    getNextBlock: () => join,
  };
}

const invalidTypeConstantBlock = {
  type: 'sql_constant',
  getFieldValue: (name) => {
    if (name === 'VALUE') return 'x';
    if (name === 'TYPE') return 'InvalidType';
    return null;
  },
};

describe('i18n error messages', () => {
  afterEach(() => {
    setLanguage('es');
  });

  describe('Spanish', () => {
    beforeEach(() => {
      setLanguage('es');
    });

    it('JOIN without ON clause uses Spanish block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase20()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('JOIN_ON_EXPECTED')]);
    });

    it('second JOIN not allowed uses Spanish block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase16()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('JOIN_ONLY_ONE_ALLOWED')]);
    });

    it('second UNION not allowed uses Spanish block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase18()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('UNION_ONLY_ONE_ALLOWED')]);
    });

    it('invalid block after JOIN uses translated block label', () => {
      expectThrowsSyntaxError(
        () => generateSelect(buildJoinWithInvalidNextBlock('sql_insert')),
        [i18n('JOIN_BLOCK_INVALID_NEXT'), getBlockLabel('sql_insert')]
      );
    });

    it('unsupported block type in condition uses translated block label', () => {
      expectThrowsSyntaxError(
        () => generateConditionClause({ type: 'sql_insert' }),
        [i18n('UNSUPPORTED_BLOCK_TYPE'), getBlockLabel('sql_insert')]
      );
    });

    it('unrecognized data type uses translated type label', () => {
      expectThrowsSyntaxError(
        () => generateConditionClause(invalidTypeConstantBlock),
        [i18n('UNRECOGNIZED_TYPE'), getDataTypeLabel('InvalidType')]
      );
    });
  });

  describe('English', () => {
    beforeEach(() => {
      setLanguage('en');
    });

    it('JOIN without ON clause uses English block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase20()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('JOIN_ON_EXPECTED')]);
    });

    it('second JOIN not allowed uses English block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase16()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('JOIN_ONLY_ONE_ALLOWED')]);
    });

    it('second UNION not allowed uses English block labels', () => {
      const result = generateSQL(mockWorkspace(mockCases.mockSelectCase18()));
      expectSyntaxError(result, [i18n('SYNTAX_ERROR'), i18n('UNION_ONLY_ONE_ALLOWED')]);
    });

    it('invalid block after JOIN uses translated block label', () => {
      expectThrowsSyntaxError(
        () => generateSelect(buildJoinWithInvalidNextBlock('sql_insert')),
        [i18n('JOIN_BLOCK_INVALID_NEXT'), getBlockLabel('sql_insert')]
      );
    });

    it('unsupported block type in condition uses translated block label', () => {
      expectThrowsSyntaxError(
        () => generateConditionClause({ type: 'sql_insert' }),
        [i18n('UNSUPPORTED_BLOCK_TYPE'), getBlockLabel('sql_insert')]
      );
    });

    it('unrecognized data type uses translated type label', () => {
      expectThrowsSyntaxError(
        () => generateConditionClause(invalidTypeConstantBlock),
        [i18n('UNRECOGNIZED_TYPE'), getDataTypeLabel('InvalidType')]
      );
    });
  });
});
