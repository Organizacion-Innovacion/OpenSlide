import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/useSettingsStore'
import { generatePresentationStream, sendChat } from '../services/api'
import ChatMessage from '../components/ChatMessage'
import ModelSelector from '../components/ModelSelector'

// ─── GenerationProgress ───────────────────────────────────────────────────────
function GenerationProgress({ plan, slidesStatus, statusMessage }) {
  const total = plan.length
  const done = Object.values(slidesStatus).filter(s => s === 'done' || s === 'error').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      minWidth: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: total > 0 ? 12 : 0 }}>
        <div style={{
          width: 14, height: 14,
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }} />
        <span style={{ color: 'var(--text2)', fontSize: 13, flex: 1, fontWeight: 500 }}>
          {statusMessage || 'Iniciando...'}
        </span>
        {total > 0 && (
          <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>{pct}%</span>
        )}
      </div>
      {total > 0 && (
        <>
          <div style={{
            background: 'var(--surface2)', borderRadius: 4, height: 4, marginBottom: 14,
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'var(--accent)',
              borderRadius: 4, transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {plan.map((content, i) => {
              const status = slidesStatus[i + 1] || 'pending'
              const color = status === 'done' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--text3)'
              const dot = status === 'done' ? '●' : status === 'generating' ? '◐' : '○'
              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color, flexShrink: 0 }}>{dot}</span>
                  <span style={{
                    color: status === 'done' ? 'var(--text2)' : status === 'error' ? 'var(--danger)' : 'var(--text3)',
                    fontSize: 12, flex: 1, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400,
                  }}>
                    Slide {i + 1}: {content?.slice(0, 50)}{content?.length > 50 ? '...' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── SlideCanvas ─────────────────────────────────────────────────────────────
function SlideCanvas({ slides, isGenerating }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [view, setView] = useState('preview')
  const [codeContent, setCodeContent] = useState('')
  const [copied, setCopied] = useState(false)
  const previewRef = useRef(null)
  const [scale, setScale] = useState(1)

  const selectedUrl = slides[selectedIdx] || null

  useEffect(() => {
    if (slides.length > 0) setSelectedIdx(slides.length - 1)
  }, [slides.length])

  useEffect(() => {
    if (!previewRef.current) return
    const el = previewRef.current
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const padding = 32
      const availW = width - padding
      const availH = height - padding
      if (availW > 0 && availH > 0) {
        setScale(Math.min(availW / 1280, availH / 720))
      }
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedUrl])

  useEffect(() => {
    if (view === 'code' && selectedUrl) {
      setCodeContent('')
      fetch(selectedUrl)
        .then(r => r.text())
        .then(setCodeContent)
        .catch(() => setCodeContent('Error al cargar el código'))
    }
  }, [view, selectedUrl])

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--canvas-bg)', overflow: 'hidden', minWidth: 0 }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1,
        }}>
          Canvas {slides.length > 0 ? `· ${slides.length} slide${slides.length > 1 ? 's' : ''}` : ''}
        </span>
        {selectedUrl && (
          <>
            {['preview', 'code'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '3px 10px', borderRadius: 5,
                  border: 'none', cursor: 'pointer',
                  background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: view === v ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                }}
              >
                {v === 'preview' ? 'Preview' : '</> Código'}
              </button>
            ))}
            {view === 'code' && codeContent && (
              <button
                onClick={handleCopy}
                style={{
                  padding: '3px 10px', borderRadius: 5,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'none',
                  color: copied ? '#4ADE80' : 'rgba(255,255,255,0.25)',
                  cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                }}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Body: lista de slides + preview */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar thumbnails */}
        {slides.length > 0 && (
          <div style={{
            width: 88, flexShrink: 0, overflowY: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {slides.map((url, i) => (
              <button
                key={url}
                onClick={() => { setSelectedIdx(i); setView('preview') }}
                style={{
                  position: 'relative', width: '100%', aspectRatio: '16/9',
                  borderRadius: 5, overflow: 'hidden', border: 'none',
                  outline: selectedIdx === i
                    ? '2px solid var(--accent)'
                    : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', background: '#111', padding: 0, flexShrink: 0,
                }}
                title={`Slide ${i + 1}`}
              >
                <iframe
                  src={url}
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: '1280px', height: '720px', border: 'none', transform: 'scale(0.0609)', transformOrigin: 'top left', pointerEvents: 'none' }}
                />
                {isGenerating && i === slides.length - 1 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(77,124,246,0.15)',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                  }} />
                )}
                <div style={{
                  position: 'absolute', bottom: 2, right: 4,
                  color: selectedIdx === i ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                  fontSize: 9, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
              </button>
            ))}
            {isGenerating && (
              <div style={{
                width: '100%', aspectRatio: '16/9', borderRadius: 5,
                border: '1px dashed rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{
                  width: 10, height: 10,
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTop: '2px solid var(--accent)',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>
        )}

        {/* Main area */}
        <div
          ref={previewRef}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden', minWidth: 0 }}
        >
          {!selectedUrl ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', margin: 0 }}>
                {isGenerating ? 'Generando slides...' : 'El canvas mostrará los slides aquí'}
              </p>
            </div>
          ) : view === 'preview' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                position: 'relative',
                width: `${1280 * scale}px`, height: `${720 * scale}px`,
                background: '#111', borderRadius: 8, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 16px 60px rgba(0,0,0,0.7)', flexShrink: 0,
              }}>
                <iframe
                  key={selectedUrl}
                  src={selectedUrl}
                  sandbox="allow-scripts allow-same-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '1280px', height: '720px', border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                />
                {isGenerating && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(77,124,246,0.05) 0%, transparent 50%, rgba(77,124,246,0.05) 100%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, textAlign: 'center', margin: '6px 0 0' }}>
                Slide {selectedIdx + 1}
              </p>
            </div>
          ) : (
            <div style={{
              width: '100%', height: '100%', overflow: 'auto',
              background: '#0d0d10', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <pre style={{
                margin: 0, padding: 16, color: '#7AA2F7',
                fontSize: 11, lineHeight: 1.6,
                fontFamily: "'Courier New', monospace",
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {codeContent || 'Cargando...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const SYSTEM_PROMPT = `Eres un asistente experto en la creación de presentaciones llamado OpenSlide. Tu trabajo es conversar de manera natural con el usuario para entender exactamente qué quiere presentar.

Haz preguntas relevantes sobre:
- El tema y objetivo de la presentación
- La audiencia target
- El contenido específico (el usuario puede darte texto, datos, estructura que ya tiene)
- El estilo visual preferido (minimal, dark-tech, corporativo, creativo, o deja que la IA elija)
- La cantidad de diapositivas
- Cualquier detalle o instrucción particular

El usuario puede darte contenido directamente (texto, datos, estructura) y TÚ lo usarás para crear los slides al detalle. No supongas: pregunta lo que necesites saber.

Cuando tengas SUFICIENTE información para crear una presentación completa, O cuando el usuario diga que está listo para generar, responde con un resumen amigable Y LUEGO el siguiente bloque JSON exactamente así (al final de tu mensaje):

<GENERATE>
{
  "projectName": "nombre-del-proyecto-en-minusculas-con-guiones",
  "brief": "descripción completa y detallada incluyendo TODO lo que el usuario especificó",
  "slideCount": 8,
  "theme": "dark-tech",
  "extraInstructions": "instrucciones adicionales específicas del usuario"
}
</GENERATE>

Los temas válidos son: minimal, dark-tech, corporate, creative, ai-generated

Habla en español, sé amigable y profesional.`

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewProject() {
  const navigate = useNavigate()
  const { model, setModel } = useSettingsStore()

  // Fases: 'model' → 'chat' → 'generating' → 'done'
  const [phase, setPhase] = useState('model')
  const [selectedModel, setSelectedModel] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy OpenSlide. Selecciona el modelo de IA que quieres usar para crear tu presentación.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const chatHistoryRef = useRef([{ role: 'system', content: SYSTEM_PROMPT }])

  const [genPlan, setGenPlan] = useState([])
  const [slidesStatus, setSlidesStatus] = useState({})
  const [genStatus, setGenStatus] = useState('')
  const [generatedSlides, setGeneratedSlides] = useState([])
  const [currentSlug, setCurrentSlug] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const abortRef = useRef(null)

  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { return () => { if (abortRef.current) abortRef.current() } }, [])

  const addMsg = (role, content, extra = null) => {
    setMessages(prev => [...prev, { role, content, extra }])
  }

  // ── Selección de modelo ────────────────────────────────────────────────────
  const handleModelSelect = (m) => {
    setSelectedModel(m)
    setModel(m)
    const labels = { openai: 'GPT-4o', claude: 'Claude Sonnet', gemini: 'Gemini Flash' }
    addMsg('user', labels[m])
    addMsg('assistant', `Perfecto, usaremos ${labels[m]}. ¡Cuéntame sobre tu presentación! ¿De qué trata?`)
    setPhase('chat')
  }

  // ── Enviar mensaje al LLM ─────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput('')
    addMsg('user', userText)

    const newHistory = [...chatHistoryRef.current, { role: 'user', content: userText }]
    const systemMsg = newHistory.find(m => m.role === 'system')
    const rest = newHistory.filter(m => m.role !== 'system').slice(-20)
    chatHistoryRef.current = systemMsg ? [systemMsg, ...rest] : rest
    setLoading(true)

    try {
      const response = await sendChat(chatHistoryRef.current, selectedModel)
      const assistantText = response.message || response.error || 'Sin respuesta'

      chatHistoryRef.current = [...chatHistoryRef.current, { role: 'assistant', content: assistantText }]

      const generateMatch = assistantText.match(/<GENERATE>([\s\S]*?)<\/GENERATE>/i)
      if (generateMatch) {
        try {
          const genData = JSON.parse(generateMatch[1].trim())
          const displayText = assistantText.replace(/<GENERATE>[\s\S]*?<\/GENERATE>/i, '').trim()
          if (displayText) addMsg('assistant', displayText)

          addMsg('assistant', `¿Empezamos a generar la presentación?`, (
            <button
              onClick={() => startGeneration(genData)}
              style={{
                marginTop: 10, padding: '9px 20px', borderRadius: 8,
                border: 'none', background: 'var(--accent)', color: '#fff',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              Generar presentación →
            </button>
          ))
        } catch {
          addMsg('assistant', assistantText.replace(/<GENERATE>[\s\S]*?<\/GENERATE>/i, '').trim())
        }
      } else {
        addMsg('assistant', assistantText)
      }
    } catch (err) {
      addMsg('assistant', `Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [input, loading, selectedModel])

  // ── Iniciar generación ─────────────────────────────────────────────────────
  const startGeneration = (genData) => {
    const slug = toSlug(genData.projectName || 'presentacion')
    setCurrentSlug(slug)
    setIsGenerating(true)
    setGenPlan([])
    setSlidesStatus({})
    setGenStatus('Iniciando...')
    setGeneratedSlides([])
    setPhase('generating')

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Generando tu presentación...',
      _isProgress: true
    }])

    abortRef.current = generatePresentationStream({
      slug,
      model: selectedModel,
      projectName: genData.projectName,
      brief: genData.brief,
      slideCount: Math.min(parseInt(genData.slideCount) || 5, 20),
      theme: genData.theme || 'dark-tech',
      extraInstructions: genData.extraInstructions || '',
    }, {
      onStatus: (p) => setGenStatus(p.message),
      onPlan: (p) => {
        setGenPlan(p.slides)
        const init = {}
        p.slides.forEach((_, i) => { init[i + 1] = 'pending' })
        setSlidesStatus(init)
        setGenStatus('Plan listo, generando slides...')
      },
      onProgress: (p) => {
        setSlidesStatus(prev => ({ ...prev, [p.slideIndex]: 'generating' }))
        setGenStatus(`Generando slide ${p.slideIndex} de ${p.total}...`)
      },
      onSlide: (p) => {
        setSlidesStatus(prev => ({ ...prev, [p.slideIndex]: 'done' }))
        const url = `/slides/${slug}/${p.filename}?t=${Date.now()}`
        setTimeout(() => {
          setGeneratedSlides(prev => {
            const next = [...prev]
            next[p.slideIndex - 1] = url
            return next
          })
        }, 300)
      },
      onComplete: (p) => {
        setIsGenerating(false)
        setMessages(prev => {
          const filtered = prev.filter(m => !m._isProgress)
          return [...filtered, {
            role: 'assistant',
            content: `Listo. Se generaron ${p.slides?.length || 0} slides. Redirigiendo al visor...`
          }]
        })
        setTimeout(() => navigate(`/viewer/${slug}`), 1500)
      },
      onFatal: (p) => {
        setIsGenerating(false)
        setPhase('chat')
        const msg = p.message?.includes('already exists')
          ? `Ya existe un proyecto con ese nombre. Dime un nombre diferente.`
          : `Error: ${p.message}`
        setMessages(prev => {
          const filtered = prev.filter(m => !m._isProgress)
          return [...filtered, { role: 'assistant', content: msg }]
        })
      }
    })
  }

  const showInput = phase === 'chat' && !isGenerating
  const showModelSelector = phase === 'model'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: isGenerating ? 'var(--canvas-bg)' : 'var(--bg)',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', height: 56,
        borderBottom: `1px solid ${isGenerating ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
        background: isGenerating ? 'rgba(0,0,0,0.4)' : 'var(--surface)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '6px 12px', borderRadius: 7,
            border: `1px solid ${isGenerating ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
            background: 'transparent',
            color: isGenerating ? 'rgba(255,255,255,0.5)' : 'var(--text2)',
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          ← Volver
        </button>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: isGenerating ? 'rgba(255,255,255,0.7)' : 'var(--text)',
        }}>
          Nueva Presentación
        </span>
        {selectedModel && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: isGenerating ? 'rgba(255,255,255,0.3)' : 'var(--text3)',
            background: isGenerating ? 'rgba(255,255,255,0.05)' : 'var(--surface2)',
            padding: '3px 9px', borderRadius: 20,
            border: `1px solid ${isGenerating ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
          }}>
            {selectedModel === 'openai' ? 'GPT-4o' : selectedModel === 'claude' ? 'Claude' : 'Gemini'}
          </span>
        )}
        {isGenerating && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)', animation: 'pulse 1.5s infinite',
            }} />
            <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
              Generando con IA...
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Panel chat */}
        <div style={{
          width: isGenerating ? '36%' : '100%',
          display: 'flex', flexDirection: 'column',
          borderRight: isGenerating ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'width 0.35s ease',
          minWidth: isGenerating ? 280 : 'auto',
          background: isGenerating ? 'rgba(0,0,0,0.25)' : 'var(--bg)',
        }}>
          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ maxWidth: isGenerating ? '100%' : 600, margin: '0 auto' }}>
              {messages.map((msg, i) => {
                if (msg._isProgress) {
                  return (
                    <div key={i} style={{ marginLeft: isGenerating ? 0 : 38, marginBottom: 16 }}>
                      <GenerationProgress plan={genPlan} slidesStatus={slidesStatus} statusMessage={genStatus} />
                    </div>
                  )
                }
                return <ChatMessage key={i} message={msg} />
              })}

              {showModelSelector && (
                <div style={{ marginLeft: isGenerating ? 0 : 38, marginTop: 4 }}>
                  <ModelSelector onSelect={handleModelSelect} selected={selectedModel} />
                </div>
              )}

              {loading && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginLeft: 38, color: 'var(--text3)', fontSize: 13,
                }}>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid var(--border)',
                    borderTop: '2px solid var(--accent)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  Pensando...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          {showInput && (
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${isGenerating ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
              background: isGenerating ? 'rgba(0,0,0,0.3)' : 'var(--surface)',
              flexShrink: 0,
            }}>
              <div style={{ maxWidth: isGenerating ? '100%' : 600, margin: '0 auto', display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${isGenerating ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
                    background: isGenerating ? 'rgba(255,255,255,0.05)' : 'var(--surface2)',
                    color: isGenerating ? 'rgba(255,255,255,0.8)' : 'var(--text)',
                    fontSize: 13, outline: 'none', fontFamily: 'inherit', fontWeight: 400,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{
                    padding: '10px 18px', borderRadius: 8,
                    border: 'none', background: 'var(--accent)',
                    color: '#fff', cursor: loading ? 'default' : 'pointer',
                    fontSize: 13, fontWeight: 600, opacity: loading ? 0.5 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas panel */}
        {isGenerating && (
          <SlideCanvas
            slides={generatedSlides.filter(Boolean)}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  )
}
