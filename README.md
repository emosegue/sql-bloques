# SQL Bloques

Herramienta visual para construcción de consultas SQL mediante bloques interactivos.
Desarrollada como trabajo final de tesis — Universidad Nacional del Comahue, Facultad de Informática.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite, servido por nginx |
| BFF | Node.js + Express + TypeScript |
| Base de datos operativa | SQLite (registro de conexiones guardadas) |
| Bases de datos educativas | MySQL 8.0 (pre-seeded al primer arranque) |

---

## Producción

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores reales:

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | Sí | — | Contraseña root de MySQL |
| `MYSQL_USER` | No | `sqlbloques` | Usuario de la app |
| `MYSQL_PASSWORD` | No | `sqlbloques` | Contraseña del usuario |
| `API_TOKEN` | Sí | — | Secreto compartido entre frontend y BFF |
| `BASE_PATH` | No | `/` | Subpath de la URL (ej. `/sqlbloques`) |

### 2. Levantar

```bash
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```

La aplicación queda disponible en `http://localhost`.

### Deploys posteriores (código nuevo, datos intactos)

```bash
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```

Los volúmenes `mysql_data` y `bff_data` persisten entre deploys.
Para resetear todos los datos: `docker compose ... down -v`

---

## Desarrollo local

### 1. Levantar solo MySQL

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml \
  --env-file .env up -d mysql
```

MySQL queda disponible en `localhost:3307`.

### 2. Correr BFF y frontend por separado

```bash
# Terminal 1 — BFF con hot-reload en :3001
cd bff && npm install && npm run dev

# Terminal 2 — Frontend con Vite proxy en :3000
cd frontend && npm install && npm run dev
```

### Conexiones de prueba (primera vez)

Descomentar `SEED_CONNECTIONS=true` en `bff/.env` y reiniciar el BFF.
Se crean automáticamente las tres conexiones apuntando a `localhost:3307`.
Volver a comentar la línea una vez creadas.

---

## Bases de datos educativas

Pre-seeded al primer arranque del contenedor MySQL (scripts en `bff/script/`).
Los scripts solo se ejecutan cuando el volumen `mysql_data` está vacío.

| Base de datos | Descripción |
|---------------|-------------|
| `universidad` | Gestión académica: alumnos, docentes, materias, inscripciones, exámenes y notas |
| `sistema_ventas` | Clientes, productos, empleados, ventas y detalles |
| `hospital` | Pacientes, médicos, especialidades, turnos, internaciones y diagnósticos |

Usuario de acceso: `sqlbloques` / `sqlbloques`

### Base `universidad` (demo de exposición)

**Tablas:** `alumnos`, `docentes`, `materias`, `inscripciones`, `examenes`, `notas`

| Tabla | Relaciones |
|-------|------------|
| `materias` | `docente_id` → `docentes` (opcional) |
| `inscripciones` | `alumno_id` → `alumnos`, `materia_id` → `materias` |
| `examenes` | `materia_id` → `materias` |
| `notas` | `alumno_id` → `alumnos`, `examen_id` → `examenes` |

**Datos de ejemplo:**
- Primer alumno: **Emanuel Mosegue**
- Docentes y materias (útiles para JOINs en vivo):

| Docente | Materia | Código |
|---------|---------|--------|
| Jorge Rodríguez | Técnicas de Meditación I | MED101 |
| Gerardo Parra | Jardinería Avanzada | JAR301 |
| Laura Cecchi | Lógica en Fórmulas de Helado | HEL201 |
| Ignacio Sampedro | Teoría de Juegos… de Mesa | JUE401 |

**Consulta sugerida para la demo:**

```sql
SELECT d.nombre, d.apellido, m.nombre AS materia, m.codigo
FROM docentes d
JOIN materias m ON m.docente_id = d.id;
```

**Recargar datos tras cambiar los scripts SQL:**

```bash
docker compose -f infra/docker-compose.yml --env-file .env down -v
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```

---

## Tests

```bash
cd frontend && npm test
```

Cubre generación SQL desde bloques, mensajes de error i18n (ES/EN) y renderizado de resultados paginados.

---

## Estructura del proyecto

```
sqlbloques/
├── infra/                  # Docker Compose (producción y desarrollo)
├── bff/                    # API Node.js + Express + TypeScript
│   ├── src/
│   └── script/             # Scripts SQL de inicialización (ver script/README.md)
├── frontend/               # React + Vite
│   └── src/
├── .env.example            # Plantilla de variables de entorno
└── README.md
```
