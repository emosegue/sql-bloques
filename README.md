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

Pre-seeded al primer arranque del contenedor MySQL:

| Base de datos | Descripción |
|---------------|-------------|
| `universidad` | Alumnos, materias, docentes, inscripciones |
| `sistema_ventas` | Clientes, productos, empleados, ventas |
| `hospital` | Pacientes, médicos, turnos, internaciones, diagnósticos |

Usuario de acceso: `sqlbloques` / `sqlbloques`

---

## Estructura del proyecto

```
sqlbloques/
├── infra/                  # Docker Compose (producción y desarrollo)
├── bff/                    # API Node.js + Express + TypeScript
│   ├── src/
│   └── script/             # Scripts SQL de inicialización
├── frontend/               # React + Vite
│   └── src/
├── .env.example            # Plantilla de variables de entorno
└── README.md
```
