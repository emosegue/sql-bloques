import { generateSQL } from '../sql-generator.js';
import * as mockCases from './block-mocks.js';

const mockWorkspace = (block) => ({
  getTopBlocks: () => [block]
});

describe('Generic cases', () => {
  it('INVALID STRUCTURE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockGenericCase1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Estructura inválida");
  });

})

describe('Select cases', () => {
  it('SELECT SIMPLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre, apellido FROM Jugador;");
  });

  it('SELECT WITH WHERE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre, apellido FROM Jugador WHERE (nacionalidad = 'argentino');");
  });

  it('SELECT WITH WHERE, ORDER BY DESC AND LIMIT', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase3()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre, apellido FROM Jugador WHERE (nacionalidad = 'argentino') ORDER BY apellido DESC LIMIT 5;");
  });

  it('SELECT WITH INEXISTENT ATTRIBUTE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase4()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT atributoInexistente, apellido FROM Jugador;"); // This case is handled by backend, but the UI should block it
  });

  it('SELECT WITH INEXISTENT TABLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase5()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Falta especificar la tabla en el bloque SELECT");
  });

  it('SELECT WITHOUT SELECTING ATTRIBUTE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase6()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Se esperaba un atributo dentro del bloque SELECT");
  });

  it('SELECT WITH > OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase7()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE (altura > 1.80);");
  });

  it('SELECT WITH AND OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase8()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE ( (nacionalidad = 'argentino') AND (posicion = 'defensor') );");
  });

  it('SELECT WITH OR OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase9()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE ( (nacionalidad = 'argentino') OR (nacionalidad = 'uruguayo') );");
  });

  it('SELECT WITH NOT OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase10()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE NOT ((nacionalidad = 'argentino'));");
  });

  it('SELECT WITH LIKE OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase11()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE (nombre LIKE '%man%');");
  });

  it('SELECT WITH IS NOT NULL OPERATOR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase12()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE (altura IS NOT NULL);");
  });

  it('SELECT WITH LOGICAL AND ARITHMETIC CONDITIONS', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase13()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT * FROM detalles_venta WHERE ((detalles_venta.precio_unitario + 1000) > 5000);");
  });

  it('SELECT WITH JOIN CONDITION', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase14()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT Jugador.nombre, Equipo.nombre FROM Jugador INNER JOIN Equipo ON (Jugador.id_equipo = Equipo.id);");
  });

  it('SELECT WITH JOIN AND WHERE CONDITION', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase15()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT Jugador.nombre, Equipo.nombre FROM Jugador INNER JOIN Equipo ON (Jugador.id_equipo = Equipo.id) WHERE (Equipo.nombre = 'Boca');");
  });

  it('SELECT WITH MORE THAN TWO JOINS', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase16()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Solo se permite un JOIN por instrucción.");
  });

  it('SELECT WITH JOIN WITHOUT ON CLAUSE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase20()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Se esperaba una condición ON en JOIN");
  });

  it('SELECT WITH VALID UNION', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase17()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE (nacionalidad = 'argentino') UNION SELECT nombre FROM Jugador WHERE (nacionalidad = 'uruguayo');");
  });

  it('SELECT WITH MORE THAN THREE UNIONS', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase18()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Solo se permite un UNION por instrucción.");
  });

  it('SELECT WITH INVALID UNION STRUCTURE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase19()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Se esperaba un bloque SELECT luego del bloque UNION");
  });

  it('SELECT WITH JOIN AND UNION', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase21()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT Jugador.nombre, Equipo.nombre FROM Jugador INNER JOIN Equipo ON (Jugador.id_equipo = Equipo.id) UNION SELECT nombre FROM Jugador WHERE (nacionalidad = 'uruguayo');");
  });

  it('SELECT WITH UNION AND JOIN', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockSelectCase22()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("SELECT nombre FROM Jugador WHERE (nacionalidad = 'argentino') UNION SELECT Jugador.nombre, Equipo.nombre FROM Jugador INNER JOIN Equipo ON (Jugador.id_equipo = Equipo.id);");
  });

});

describe('Insert cases', () => {
  it('INSERT SIMPLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockInsertCase1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("INSERT INTO Jugador (nombre) VALUES ('Juan');");
  });

  it('INSERT MULTIPLE ATTRIBUTE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockInsertCase2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("INSERT INTO Jugador (nombre, apellido) VALUES ('Juan', 'Pérez');");
  });

  it('INSERT COMPLETE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockInsertCase3()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("INSERT INTO Jugador (dni, nombre, apellido) VALUES (28222111, 'Juan', 'Pérez');");
  });

  it('INSERT ERROR AMOUNT OF COLUMN / VALUES', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockInsertCaseError1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Cantidad de columnas y valores no coinciden en INSERT");
  });

  it('INSERT WITH NOT SPECIFIED COLUMNS', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockInsertCaseError2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Falta especificar columnas en INSERT");
  });

})

describe('Update cases', () => {
  it('UPDATE SIMPLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockUpdateCase1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("UPDATE Jugador SET nacionalidad = 'argentino';");
  });

  it('UPDATE MULTIPLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockUpdateCase2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("UPDATE Jugador SET nombre = 'Juan', apellido = 'Pérez';");
  });

  it('UPDATE SIMPLE WITH WHERE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockUpdateCase3()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("UPDATE Jugador SET nacionalidad = 'argentino' WHERE (dni = 12345678);");
  });

  it('UPDATE SIMPLE WITH ERROR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockUpdateCaseError1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Falta cláusula SET válida en UPDATE");
  });

  it('UPDATE SIMPLE WITH ERROR', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockUpdateCaseError2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Falta especificar la tabla en UPDATE");
  });


})

describe('Delete cases', () => {
  it('DELETE SIMPLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockDeleteCase1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe('DELETE FROM Jugador;');
  });

  it('DELETE WITH CONDITION', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockDeleteCase2()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("DELETE FROM Jugador WHERE (dni = 12345678);");
  });

  it('DELETE ERROR WITHOUT TABLE', () => {
    const sql = generateSQL(mockWorkspace(mockCases.mockDeleteCaseError1()));
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    expect(cleanSql).toBe("Error de sintaxis: Falta especificar la tabla en DELETE");
  });
});