# SQL Bloques — Frontend

Interfaz de usuario de SQL Bloques, una herramienta visual para construir consultas SQL mediante bloques arrastrables. Desarrollada como trabajo final de tesis en la Universidad Nacional del Comahue.

## Arquitectura

Aplicación React 18 construida con Vite. Utiliza Blockly como motor de bloques y se comunica con el BFF exclusivamente a través de `/api/connections`. En desarrollo, Vite proxea esas peticiones a `localhost:3001`. En producción, nginx las redirige al servicio BFF interno.

### Internacionalización (i18n)

- Traducciones en `src/i18n/translations/` (`es.json`, `en.json`)
- Los bloques muestran etiquetas en el idioma elegido (ej. SELECCIONAR / SELECT)
- Los mensajes de error de sintaxis usan los mismos nombres que ve el usuario en los bloques
- Helpers `getBlockLabel()` y `getDataTypeLabel()` en `src/i18n/index.js` traducen tipos internos en errores dinámicos

### Resultados y paginación

La tabla de resultados muestra las filas devueltas por el BFF para la página actual. La navegación de páginas dispara una nueva petición al servidor (`page` 1-based en el API, 0-based en la UI de MUI). Al ejecutar una consulta nueva, la página se reinicia en la primera.

## Desarrollo

```bash
npm install
npm run dev     # Vite en :3000
```

Requiere el BFF corriendo en `:3001`. Ver instrucciones en el README raíz.

## Tests

```bash
npm test
```

| Suite | Ubicación | Qué verifica |
|-------|-----------|--------------|
| Generación SQL | `src/core/blockly-to-sql/__tests__/` | Bloques → SQL y errores de sintaxis |
| i18n | `src/i18n/__tests__/` | Etiquetas de bloques y tipos de dato por idioma |
| Resultados | `src/components/ResultsTable/` | Renderizado sin doble paginación en cliente |

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_TOKEN` | Token compartido con el BFF para autenticar peticiones |

## Guía y ayuda en la app

- **Guía** (`src/components/modals/GuideModal/GuideData.json`): ejemplos por tipo de bloque
- **Ayuda** (`src/components/modals/HelpModal/HelpData.json`): conexión, esquema dinámico y consejos de uso
