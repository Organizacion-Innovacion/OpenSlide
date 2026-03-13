import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import { getProject, sendChat, regenerateSlide } from '../services/api'
import { useSettingsStore } from '../store/useSettingsStore'

export default function EditProject() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { model, keys } = useSettingsStore()
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Canvas state
  const [selectedSlide, setSelectedSlide] = useState(null)
  const [editingSlide, setEditingSlide] = useState(null)
  const [scale, setScale] = useState(1)
  const previewContainerRef = useRef(null)

  const apiKey = model === 'openai' ? keys.openai : model === 'claude' ? keys.anthropic : keys.gemini

  useEffect(() => {
    getProject(slug).then(p => {
      setProject(p)
      setMessages([{
        role: 'assistant',
        content: `Hola, estoy listo para ayudarte a editar "${p.name}". Tienes ${p.slideCount || p.slides?.length || 0} slides en tema ${p.theme || 'por defecto'}.\n\n¿Qué quieres cambiar? Puedes hacer clic en una miniatura para seleccionar un slide y luego pedirme cambios.`
      }])
    }).catch(() => navigate('/'))
  }, [slug])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Scale con ResizeObserver
  useEffect(() => {
    if (!previewContainerRef.current) return
    const el = previewContainerRef.current
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const padding = 40 // 20px cada lado
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
  }, [selectedSlide])

  const handleSlideSelect = (index) => {
    setSelectedSlide(index)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const currentInput = input.trim()
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const slideMatch = currentInput.match(/slide\s*(\d+)/i)
      const targetSlide = slideMatch ? parseInt(slideMatch[1]) : selectedSlide

      if (targetSlide) {
        setEditingSlide(targetSlide)
        setMessages(prev => [...prev, { role: 'assistant', content: `🔄 Regenerando slide ${targetSlide}...` }])
        const result = await regenerateSlide({ slug, slideIndex: targetSlide, instructions: currentInput, apiKey })
        setEditingSlide(null)
        // recargar proyecto para actualizar la lista de slides
        const updatedProject = await getProject(slug)
        setProject(updatedProject)
        setMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: result.ok
            ? `✅ Slide ${targetSlide} regenerado correctamente.`
            : `❌ Error: ${result.error}`
        }])
      } else {
        const slideCount = project?.slideCount || project?.slides?.length || 0
        const contextMessages = [
          {
            role: 'system',
            content: `Eres el asistente de OpenSlide ayudando a editar el proyecto "${project?.name}". El proyecto tiene ${slideCount} slides con tema "${project?.theme}".${selectedSlide ? ` El usuario está viendo el slide ${selectedSlide} y quiere hacer cambios en él.` : ''} Ayuda al usuario a planificar cambios. Si quiere regenerar slides específicos, indícale que mencione el número del slide.`
          },
          ...messages.filter(m => m.role !== 'system'),
          userMsg
        ]
        const response = await sendChat(contextMessages, model, apiKey, slug)
        setMessages(prev => [...prev, { role: 'assistant', content: response.message }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  if (!project) return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      Cargando...
    </div>
  )

  const slideCount = project.slideCount || project.slides?.length || 0

  return (
    <div style={{ background: '#080808', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Proyectos</button>
        <button onClick={() => navigate(`/viewer/${slug}`)} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>👁 Ver presentación</button>
        <span style={{ color: '#555', fontSize: 13, marginLeft: 'auto' }}>{project.name} · {slideCount} slides</span>
      </div>

      {/* Body: split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Chat panel (40%) */}
        <div style={{ width: '40%', minWidth: 320, display: 'flex', flexDirection: 'column', borderRight: '1px solid #111', overflow: 'hidden' }}>
          {/* Slide context banner */}
          {selectedSlide && (
            <div style={{ padding: '8px 16px', background: '#0d1a0d', borderBottom: '1px solid #1a2a1a', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: '#4CAF50' }}>✎</span>
              <span style={{ fontSize: 12, color: '#5a9a5a' }}>Editando slide {selectedSlide}</span>
              <button
                onClick={() => setSelectedSlide(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 12 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {loading && <ChatMessage message={{ role: 'assistant', content: '...' }} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={selectedSlide ? `Editando slide ${selectedSlide} — ¿qué quieres cambiar?` : 'Pide cambios... ej: "Regenera el slide 3 con más detalle"'}
                disabled={loading}
                style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '10px 14px', color: '#eee', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                style={{ background: 'linear-gradient(135deg,#1B5E20,#4CAF50)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: loading ? 0.5 : 1 }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Canvas panel (60%) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050505' }}>
          {/* Canvas header */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ color: '#333', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Canvas · {slideCount} slides
            </span>
            {selectedSlide && (
              <span style={{ marginLeft: 8, fontSize: 11, color: '#4CAF50', background: '#0a1a0a', padding: '2px 8px', borderRadius: 4, border: '1px solid #1a2e1a' }}>
                Slide {selectedSlide} seleccionado
              </span>
            )}
          </div>

          {/* Canvas body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

            {/* Thumbnails sidebar */}
            <div style={{ width: 88, flexShrink: 0, overflowY: 'auto', borderRight: '1px solid #0e0e0e', background: '#030303', padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {project.slides && project.slides.map((slideUrl, i) => {
                const idx = i + 1
                const isSelected = selectedSlide === idx
                const isEditing = editingSlide === idx
                const thumbW = 76
                const thumbH = Math.round(thumbW * 9 / 16)
                const thumbScale = thumbW / 1280
                return (
                  <button
                    key={idx}
                    onClick={() => handleSlideSelect(idx)}
                    style={{
                      position: 'relative',
                      width: thumbW, height: thumbH,
                      borderRadius: 4, overflow: 'hidden',
                      border: isSelected ? '2px solid #4CAF50' : isEditing ? '2px solid #ff9800' : '2px solid transparent',
                      cursor: 'pointer', background: '#111', padding: 0, flexShrink: 0,
                      boxShadow: isSelected ? '0 0 8px rgba(76,175,80,0.4)' : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <iframe
                      src={`/slides/${slug}/${slideUrl}`}
                      title={`Slide ${idx}`}
                      sandbox="allow-scripts allow-same-origin"
                      style={{ position: 'absolute', top: 0, left: 0, width: '1280px', height: '720px', border: 'none', transform: `scale(${thumbScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                    />
                    {/* Editing overlay */}
                    {isEditing && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 16, height: 16, border: '2px solid #ff9800', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    )}
                    {/* Slide number */}
                    <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 8, color: isSelected ? '#4CAF50' : '#333', fontWeight: 700 }}>{idx}</div>
                  </button>
                )
              })}
            </div>

            {/* Main preview */}
            <div
              ref={previewContainerRef}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden', minWidth: 0, minHeight: 0 }}
            >
              {selectedSlide && project.slides && project.slides[selectedSlide - 1] ? (
                <div style={{ position: 'relative', width: `${1280 * scale}px`, height: `${720 * scale}px`, background: '#111', borderRadius: 6, overflow: 'hidden', border: '1px solid #1a1a1a', boxShadow: '0 8px 40px rgba(0,0,0,0.8)', flexShrink: 0 }}>
                  <iframe
                    src={`/slides/${slug}/${project.slides[selectedSlide - 1]}`}
                    title={`Slide ${selectedSlide}`}
                    sandbox="allow-scripts allow-same-origin"
                    style={{ position: 'absolute', top: 0, left: 0, width: '1280px', height: '720px', border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                  />
                  {/* Editing overlay on main preview */}
                  {editingSlide === selectedSlide && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, border: '3px solid #ff9800', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ color: '#ff9800', fontSize: 13, fontWeight: 600 }}>Regenerando slide {editingSlide}...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#333' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                  <p style={{ fontSize: 13, margin: 0 }}>Haz clic en una miniatura para previsualizar el slide</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
