# SQL Bloques — Frontend

Interfaz de usuario de SQL Bloques, una herramienta visual para construir consultas SQL mediante bloques arrastrables. Desarrollada como trabajo final de tesis en la Universidad Nacional del Comahue.

## Arquitectura

Aplicación React 18 construida con Vite. Utiliza Blockly como motor de bloques y se comunica con el BFF exclusivamente a través de `/api/connections`. En desarrollo, Vite proxea esas peticiones a `localhost:3001`. En producción, nginx las redirige al servicio BFF interno.

## Desarrollo

```bash
npm install
npm run dev     # Vite en :3000
```

Requiere el BFF corriendo en :3001. Ver instrucciones en el README raíz.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_TOKEN` | Token compartido con el BFF para autenticar peticiones |
