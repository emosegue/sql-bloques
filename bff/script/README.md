# Scripts SQL de inicialización

Estos archivos se montan en `/docker-entrypoint-initdb.d/` del contenedor MySQL y se ejecutan **solo en el primer arranque** (volumen `mysql_data` vacío). El orden lo define el prefijo numérico en `infra/docker-compose.yml`.

| Archivo | Base de datos | Contenido |
|---------|---------------|-----------|
| `universidad.sql` | `universidad` | Esquema académico con datos de demo para exposiciones |
| `sistema_ventas.sql` | `sistema_ventas` | Clientes, productos, empleados, ventas |
| `04-hospital.sql` | `hospital` | Pacientes, médicos, turnos, internaciones |
| `03-grants.sql` | — | Permisos del usuario `sqlbloques` sobre las tres bases |

## `universidad`

### Esquema

```
alumnos ──┬── inscripciones ── materias ── docentes
          └── notas ── examenes ── materias
```

- **`docentes`**: nombre, apellido, email
- **`materias`**: nombre, codigo, `docente_id` (FK opcional a `docentes`)
- **`inscripciones`**: relación alumno ↔ materia
- **`examenes`** / **`notas`**: evaluaciones por materia y alumno

### Datos de demo

**Alumnos:** Emanuel Mosegue (primero), María Gómez, Carlos López

**Docentes y materias (presentación):**

| Docente | Materia | Código |
|---------|---------|--------|
| Jorge Rodríguez | Técnicas de Meditación I | MED101 |
| Gerardo Parra | Jardinería Avanzada | JAR301 |
| Laura Cecchi | Lógica en Fórmulas de Helado | HEL201 |
| Ignacio Sampedro | Teoría de Juegos… de Mesa | JUE401 |

También existen materias “serias” sin docente asignado: Matemática (MAT101), Física (FIS102), Programación (PROG103).

### Consultas útiles para demos

Docentes y sus materias:

```sql
SELECT d.nombre, d.apellido, m.nombre AS materia, m.codigo
FROM docentes d
JOIN materias m ON m.docente_id = d.id;
```

Alumnos inscriptos con nombre de materia:

```sql
SELECT a.nombre, a.apellido, m.nombre AS materia
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
JOIN materias m ON m.id = i.materia_id;
```

## Recargar scripts

Los cambios en estos archivos **no** se aplican automáticamente si MySQL ya tiene datos. Desde la raíz del proyecto:

```bash
docker compose -f infra/docker-compose.yml --env-file .env down -v
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```
