# SQL Bloques — BFF

API backend de SQL Bloques, responsable de gestionar conexiones a bases de datos y ejecutar consultas SQL. Desarrollada como trabajo final de tesis en la Universidad Nacional del Comahue.

## Arquitectura

Node.js + Express + TypeScript. Expone endpoints bajo `/api/connections` para crear, listar, probar y eliminar conexiones, y bajo `/api/connections/:id/query` para ejecutar consultas. Las conexiones se persisten en SQLite. En producción, solo es accesible internamente desde nginx.

## Desarrollo

```bash
npm install
npm run dev     # ts-node-dev en :3001
```

Requiere MySQL en :3307 si se usan las conexiones pre-seeded. Ver instrucciones en el README raíz.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `API_TOKEN` | Token compartido con el frontend para autenticar peticiones |
| `SQLITE_PATH` | Ruta del archivo SQLite (ej. `./database.sqlite`) |
| `PORT` | Puerto del servidor (default: `3001`) |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) |
