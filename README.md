# OpenSlide ▶

Generador de presentaciones HTML asistido por inteligencia artificial.

Crea presentaciones profesionales a través de una conversación con tu asistente de IA favorito (OpenAI, Claude o Gemini). Cada slide se genera como HTML autocontenido, listo para presentar en el navegador.

## ✨ Características

- **Chat guiado** — el asistente te guía paso a paso en la creación de tu presentación
- **3 proveedores de IA** — OpenAI GPT-4o, Anthropic Claude Sonnet, Google Gemini Pro
- **Generación en tiempo real** — ve cómo se crea cada slide con progreso en vivo
- **4 temas visuales** — Minimal, Dark Tech, Corporativo, Creativo
- **Edición por chat** — modifica tu presentación conversando con la IA
- **Regeneración de slides** — rehaz slides específicos con nuevas instrucciones
- **Exportación ZIP** — descarga todos los slides de un proyecto
- **Visor integrado** — presenta en pantalla completa desde el navegador

## 🏗 Arquitectura

```
OpenSlide/
├── client/          # React 19 + Vite + React Router + Zustand
├── server/          # Node.js + Express (puerto 3001)
├── slides/          # Proyectos generados (HTML por slide)
└── config/          # Configuración y API keys (no en git)
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles técnicos completos.

## 🚀 Inicio rápido

**Requisitos:** Node.js 20+

```bash
git clone https://github.com/yonyhome/OpenSlide.git
cd OpenSlide
npm run install:all   # instala dependencias de client/ y server/
npm run setup         # configura API keys y opciones de red (interactivo)
npm run dev           # arranca todo con un solo comando
```

Abrir http://localhost:5173 en el navegador.

### Modo producción (un solo puerto)

```bash
npm start             # compila el cliente y sirve todo desde puerto 3001
```

Abrir http://localhost:3001

### Con Docker

```bash
docker compose up -d
```

Abrir http://localhost

## ⚙️ Configuración

### Desde la consola (recomendado para primera vez)

```bash
npm run setup
```

El asistente de configuración te guía para:
- Agregar API keys de OpenAI, Anthropic y/o Google Gemini
- Elegir el puerto del servidor
- Configurar modo de red (solo local o accesible desde otros dispositivos)

### Desde la interfaz web

1. Ir a **Settings** (⚙️ en el header)
2. Ingresar la API key del proveedor que tengas disponible:
   - [OpenAI](https://platform.openai.com/api-keys) — `sk-...`
   - [Anthropic](https://console.anthropic.com/) — `sk-ant-...`
   - [Google AI Studio](https://aistudio.google.com/apikey) — `AIza...`
3. Usar el botón **Verificar** para confirmar que la key funciona

## 📖 Uso

### Crear una presentación

1. Click en **"+ Nueva Presentación"** en la pantalla principal
2. Selecciona tu modelo de IA preferido
3. Responde las preguntas del asistente:
   - Nombre del proyecto
   - Descripción y tema de la presentación
   - Cantidad de slides
   - Estilo visual (Minimal / Dark Tech / Corporativo / Creativo)
4. Confirma y observa la generación en tiempo real

### Presentar

- Click en cualquier proyecto para abrir el visor
- Navega con **flechas del teclado** ← →, clicks en los bordes o swipe táctil
- Presiona **F** para pantalla completa
- Presiona **Esc** para salir

### Editar

- Desde el visor: **"✏️ Editar con IA"** para chat de edición
- **"↺ Regenerar slide"** para rehacer el slide actual con instrucciones
- **"⬇ Exportar ZIP"** para descargar todos los slides

## 🐳 Docker

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `client` | 80 | Frontend React servido por nginx |
| `server` | 3001 | API Express (interno) |

### Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3001` | Puerto del servidor Express |
| `NODE_ENV` | `production` | Entorno de ejecución |

### Volúmenes persistentes

| Volumen | Ruta en contenedor | Descripción |
|---------|--------------------|-------------|
| `./slides` | `/app/slides` | Proyectos generados |
| `./config` | `/app/config` | Configuración y API keys |

### Comandos útiles

```bash
# Iniciar en segundo plano
docker compose up -d

# Ver logs
docker compose logs -f

# Ver logs de un servicio
docker compose logs -f server

# Detener
docker compose down

# Reconstruir imágenes
docker compose build

# Reconstruir y reiniciar
docker compose up -d --build
```

## 🌐 Acceso desde otros dispositivos

Hay dos formas de compartir tus presentaciones:

### Modo red local (LAN)

Ejecuta `npm run setup` y elige **modo red**. Luego:

```bash
npm run dev    # o npm start
```

El servidor mostrará tu IP local al arrancar:
```
  ▶  OpenSlide API corriendo
     http://localhost:3001
     http://192.168.1.X:3001  ← red local
```

Desde cualquier dispositivo en la misma red WiFi, abre esa URL.

### Modo producción con `npm start`

```bash
npm start
```

Sirve el cliente compilado + API en un solo puerto. Ideal para demos o presentaciones en vivo.

### Exposición pública (túnel temporal)

Para compartir con personas fuera de tu red:

```bash
npx localtunnel --port 3001   # genera un URL público temporal
# o
npx ngrok http 3001
```

## 🔒 Seguridad

- Las API keys se guardan en `config/settings.json` (excluido del git)
- Las keys se ofuscan en las respuestas de la API (solo últimos 4 caracteres visibles)
- Los slides se cargan en `iframe` con `sandbox="allow-scripts allow-same-origin"`
- En producción, considera restringir CORS en `server/index.js`

## 📁 Estructura de un proyecto

```
slides/mi-presentacion/
├── meta.json        # Metadatos, modelo usado, historial de chat
├── slide-1.html     # Slide autocontenido (1280×720px)
├── slide-2.html
└── ...
```

## 🗺 Roadmap

- [x] Fase 1-2: Arquitectura base, flujo guiado
- [x] Fase 3: Integración real OpenAI / Claude / Gemini
- [x] Fase 4: Streaming SSE, edición por chat
- [x] Fase 5: Exportación ZIP, gestión de proyectos
- [ ] Autenticación multi-usuario
- [ ] Plantillas de slides predefinidas
- [ ] Exportación PDF
- [ ] Soporte para imágenes generadas por IA en slides

## 📄 Licencia

MIT
