import {
  translations,
  setLanguage,
  getBlockLabel,
  getDataTypeLabel,
} from '../index';

const blockTypeCases = [
  { type: 'sql_select', key: 'SELECT' },
  { type: 'sql_insert', key: 'INSERT_INTO' },
  { type: 'sql_update', key: 'UPDATE' },
  { type: 'sql_delete', key: 'DELETE_FROM' },
  { type: 'sql_where', key: 'WHERE' },
  { type: 'sql_join', key: 'BLOCK_JOIN' },
  { type: 'sql_union', key: 'UNION' },
  { type: 'sql_order_by', key: 'ORDER_BY' },
  { type: 'sql_limit', key: 'LIMIT' },
  { type: 'sql_attribute', key: 'ATTRIBUTE' },
  { type: 'sql_constant', key: 'LABEL_CONSTANTS' },
  { type: 'sql_condition', key: 'CONDITION' },
  { type: 'sql_attribute_constant_pair', key: 'BLOCK_ATTRIBUTE_VALUE' },
];

const dataTypeCases = [
  { type: 'String', key: 'STRING' },
  { type: 'Number', key: 'NUMBER' },
  { type: 'Boolean', key: 'BOOLEAN' },
  { type: 'Date', key: 'DATE' },
  { type: 'NULL', key: 'NULL' },
];

describe('getBlockLabel', () => {
  afterEach(() => {
    setLanguage('es');
  });

  it.each(blockTypeCases)('returns Spanish label for $type', ({ type, key }) => {
    setLanguage('es');
    expect(getBlockLabel(type)).toBe(translations.es[key]);
  });

  it.each(blockTypeCases)('returns English label for $type', ({ type, key }) => {
    setLanguage('en');
    expect(getBlockLabel(type)).toBe(translations.en[key]);
  });

  it('returns the raw type when no mapping exists', () => {
    setLanguage('es');
    expect(getBlockLabel('tipo_desconocido')).toBe('tipo_desconocido');
  });
});

describe('getDataTypeLabel', () => {
  afterEach(() => {
    setLanguage('es');
  });

  it.each(dataTypeCases)('returns Spanish label for $type', ({ type, key }) => {
    setLanguage('es');
    expect(getDataTypeLabel(type)).toBe(translations.es[key]);
  });

  it.each(dataTypeCases)('returns English label for $type', ({ type, key }) => {
    setLanguage('en');
    expect(getDataTypeLabel(type)).toBe(translations.en[key]);
  });

  it('returns the raw type when no mapping exists', () => {
    setLanguage('es');
    expect(getDataTypeLabel('InvalidType')).toBe('InvalidType');
  });
});
