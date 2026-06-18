import { applyAutoAliases } from '../auto-alias.js';

describe('applyAutoAliases', () => {
  it('does not change queries without duplicate column names', () => {
    const query = 'SELECT docentes.nombre, docentes.apellido FROM docentes';
    expect(applyAutoAliases(query)).toBe(query);
  });

  it('adds aliases when qualified columns share the same name', () => {
    const query =
      'SELECT docentes.nombre, docentes.apellido, materias.nombre FROM materias INNER JOIN docentes ON (materias.docente_id = docentes.id)';
    const result = applyAutoAliases(query);

    expect(result).toContain('docentes.nombre AS `docentes.nombre`');
    expect(result).toContain('materias.nombre AS `materias.nombre`');
    expect(result).toContain('docentes.apellido');
    expect(result).not.toMatch(/docentes\.apellido AS/);
  });

  it('keeps existing explicit aliases', () => {
    const query = 'SELECT docentes.nombre AS docente, materias.nombre AS materia FROM materias';
    expect(applyAutoAliases(query)).toBe(query);
  });

  it('does not change non-SELECT queries', () => {
    const query = 'INSERT INTO alumnos (nombre) VALUES (\'Ana\')';
    expect(applyAutoAliases(query)).toBe(query);
  });

  it('does not change UNION queries', () => {
    const query = 'SELECT nombre FROM alumnos UNION SELECT nombre FROM docentes';
    expect(applyAutoAliases(query)).toBe(query);
  });

  it('expands table.* using schema object with tables property', () => {
    const schema = {
      tables: [
        {
          name: 'alumnos',
          attributes: [
            { name: 'id' },
            { name: 'nombre' },
            { name: 'apellido' },
          ],
        },
      ],
    };

    const query = 'SELECT alumnos.* FROM alumnos';
    const result = applyAutoAliases(query, schema);

    expect(result).toContain('alumnos.id');
    expect(result).toContain('alumnos.nombre');
    expect(result).not.toContain('alumnos.*');
  });

  it('expands table.* using schema array', () => {
    const tables = [
      {
        name: 'docentes',
        attributes: [
          { name: 'id' },
          { name: 'nombre' },
          { name: 'apellido' },
          { name: 'email' },
        ],
      },
      {
        name: 'materias',
        attributes: [{ name: 'id' }, { name: 'nombre' }, { name: 'codigo' }],
      },
    ];

    const query =
      'SELECT materias.nombre, docentes.* FROM materias INNER JOIN docentes ON (materias.docente_id = docentes.id)';
    const result = applyAutoAliases(query, tables);

    expect(result).toContain('materias.nombre AS `materias.nombre`');
    expect(result).toContain('docentes.nombre AS `docentes.nombre`');
    expect(result).toContain('docentes.id');
    expect(result).not.toContain('docentes.*');
  });
});
