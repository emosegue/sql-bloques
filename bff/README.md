# SQL Bloques — BFF

API backend de SQL Bloques, responsable de gestionar conexiones a bases de datos y ejecutar consultas SQL. Desarrollada como trabajo final de tesis en la Universidad Nacional del Comahue.

## Arquitectura

Node.js + Express + TypeScript. Expone endpoints bajo `/api/connections` para crear, listar, probar y eliminar conexiones, y bajo `/api/connections/execute` para ejecutar consultas. Las conexiones se persisten en SQLite. En producción, solo es accesible internamente desde nginx.

### Ejecución de consultas y paginación

`POST /api/connections/execute` acepta en el body:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `connection_params` | object | Host, puerto, usuario, contraseña, base de datos |
| `query` | string | Consulta SQL (SELECT, INSERT, UPDATE, DELETE) |
| `language` | `es` \| `en` | Idioma para mensajes de error del servidor |
| `page` | number | Página **1-based** (default: 1) |
| `results` | number | Filas por página (default: 10) |

En consultas SELECT, el BFF calcula el total con `COUNT(*)` y aplica `LIMIT offset, results` en MySQL. La respuesta incluye `data.results` (filas de la página actual) y `data.pagination` (`totalResults`, `totalPages`, `currentPage`, etc.).

## Bases de datos educativas

Scripts de seed en [`script/`](script/). Ver [`script/README.md`](script/README.md) para esquema detallado de `universidad` (docentes, materias de demo, consultas sugeridas).

## Desarrollo

```bash
npm install
npm run dev     # ts-node-dev en :3001
```

Requiere MySQL en `:3307` si se usan las conexiones pre-seeded. Ver instrucciones en el README raíz.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `API_TOKEN` | Token compartido con el frontend para autenticar peticiones |
| `SQLITE_PATH` | Ruta del archivo SQLite (ej. `./database.sqlite`) |
| `PORT` | Puerto del servidor (default: `3001`) |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) |
| `SEED_CONNECTIONS` | Si es `true`, crea conexiones de prueba al arrancar |
| `SEED_DB_HOST` / `SEED_DB_PORT` | Host y puerto MySQL para el seed de conexiones |
