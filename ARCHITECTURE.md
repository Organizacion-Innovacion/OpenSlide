# OpenSlide — Architecture

Generador de presentaciones HTML asistido por IA.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 + React Router 6 |
| Estado global | Zustand (con persistencia en localStorage) |
| Backend | Node.js + Express 4 |
| Almacenamiento | Sistema de archivos local |
| IA (Fase 3) | OpenAI / Anthropic Claude / Google Gemini |

## Estructura del proyecto

```
OpenSlide/
├── client/                    # Frontend React
│   └── src/
│       ├── pages/             # Home, NewProject, Viewer, Settings
│       ├── components/        # ProjectCard, ChatMessage, ModelSelector, SlidePreview
│       ├── store/             # Zustand stores (settings, projects)
│       └── services/          # api.js — llamadas al backend
│
├── server/                    # Backend Express (puerto 3001)
│   ├── routes/                # /api/projects, /api/ai, /api/settings
│   └── services/
│       ├── projectManager.js  # CRUD de proyectos en disco
│       └── ai/                # Providers: openai, anthropic, gemini (patrón Strategy)
│
├── slides/                    # Proyectos generados
│   └── {slug}/
│       ├── meta.json          # Metadatos + historial de chat
│       └── slide-N.html       # Slides individuales
│
└── config/
    └── settings.json          # API keys (no en git)
```

## Rutas del cliente

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Lista de proyectos |
| `/new` | NewProject | Chat con asistente IA para crear presentación |
| `/viewer/:slug` | Viewer | Visor de slides con fullscreen y navegación |
| `/settings` | Settings | Configuración de API keys por proveedor |

## API del servidor

### Proyectos
```
GET    /api/projects          Lista todos los proyectos
GET    /api/projects/:slug    Retorna metadata de un proyecto
POST   /api/projects          Crea nuevo proyecto
DELETE /api/projects/:slug    Elimina proyecto
```

### Configuración
```
GET    /api/settings          API keys configuradas (ofuscadas)
POST   /api/settings          Guarda API keys
```

### IA (Fase 3)
```
POST   /api/ai/chat           Chat con el LLM seleccionado
POST   /api/ai/generate-slide Genera HTML de un slide
```

## Slides estáticos

Los slides se sirven directamente por Express:
```
GET /slides/{slug}/{archivo}.html
```

El cliente accede a ellos via proxy Vite en desarrollo.

## Cómo ejecutar

```bash
# Instalar dependencias (primera vez)
cd client && npm install
cd ../server && npm install

# Desarrollo (dos terminales)
cd client && npm run dev      # puerto 5173
cd server && npm run dev      # puerto 3001
```

## Fases de desarrollo

- ✅ **Fase 1** — Refactoring + arquitectura base + backend Express
- ✅ **Fase 2** — UI de configuración + flujo de nuevo proyecto (chat guiado)
- 🔲 **Fase 3** — Integración real de los LLMs (OpenAI, Claude, Gemini)
- 🔲 **Fase 4** — Generación progresiva de slides + edición por IA
- 🔲 **Fase 5** — Iteración por slide, exportación ZIP/PDF, temas visuales

## Notas de seguridad

- `config/settings.json` nunca debe commitearse (está en `.gitignore`)
- Las API keys se ofuscan en las respuestas del servidor (solo últimos 4 chars visibles)
- Los slides se cargan en `iframe` con `sandbox="allow-scripts allow-same-origin"`
