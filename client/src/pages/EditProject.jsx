import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import { getProject, sendChat, regenerateSlide } from '../services/api'
import { useSettingsStore } from '../store/useSettingsStore'

export default function EditProject() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { model } = useSettingsStore()
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const [selectedSlide, setSelectedSlide] = useState(null)
  const [editingSlide, setEditingSlide] = useState(null)
  const [scale, setScale] = useState(1)
  const previewContainerRef = useRef(null)

  useEffect(() => {
    getProject(slug).then(p => {
      setProject(p)
      setMessages([{
        role: 'assistant',
        content: `Listo para editar "${p.name}". Tienes ${p.slideCount || p.slides?.length || 0} slides.\n\nHaz clic en una miniatura para seleccionar un slide y luego dime qué quieres cambiar.`
      }])
    }).catch(() => navigate('/'))
  }, [slug])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!previewContainerRef.current) return
    const el = previewContainerRef.current
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const availW = width - 40
      const availH = height - 40
      if (availW > 0 && availH > 0) {
        setScale(Math.min(availW / 1280, availH / 720))
      }
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedSlide])

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
        setMessages(prev => [...prev, { role: 'assistant', content: `Regenerando slide ${targetSlide}...` }])
        const result = await regenerateSlide({ slug, slideIndex: targetSlide, instructions: currentInput })
        setEditingSlide(null)
        const updatedProject = await getProject(slug)
        setProject(updatedProject)
        setMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: result.ok
            ? `Slide ${targetSlide} regenerado correctamente.`
            : `Error: ${result.error}`
        }])
      } else {
        const slideCount = project?.slideCount || project?.slides?.length || 0
        const contextMessages = [
          {
            role: 'system',
            content: `Eres el asistente de OpenSlide ayudando a editar el proyecto "${project?.name}". El proyecto tiene ${slideCount} slides con tema "${project?.theme}".${selectedSlide ? ` El usuario está viendo el slide ${selectedSlide}.` : ''} Ayuda al usuario a planificar cambios. Si quiere regenerar slides específicos, indícale que mencione el número del slide.`
          },
          ...messages.filter(m => m.role !== 'system'),
          userMsg
        ]
        const response = await sendChat(contextMessages, model, slug)
        setMessages(prev => [...prev, { role: 'assistant', content: response.message }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  if (!project) return (
    <div style={{
      background: 'var(--bg)', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text3)', fontFamily: "'Montserrat', sans-serif",
      fontSize: 13,
    }}>
      Cargando...
    </div>
  )

  const slideCount = project.slideCount || project.slides?.length || 0

  return (
    <div style={{
      background: 'var(--bg)', height: '100vh',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Montserrat', sans-serif", overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0 20px', height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0, background: 'var(--surface)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text2)', padding: '6px 12px', borderRadius: 7,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          ← Proyectos
        </button>
        <button
          onClick={() => navigate(`/viewer/${slug}`)}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text2)', padding: '6px 12px', borderRadius: 7,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          Ver presentación
        </button>
        <span style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 'auto', fontWeight: 500 }}>
          {project.name} · {slideCount} slides
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: Chat */}
        <div style={{
          width: '40%', minWidth: 300,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)', overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          {/* Slide context banner */}
          {selectedSlide && (
            <div style={{
              padding: '8px 16px',
              background: 'var(--accent-bg)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                Editando slide {selectedSlide}
              </span>
              <button
                onClick={() => setSelectedSlide(null)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                }}
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
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)', flexShrink: 0,
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={selectedSlide
                  ? `Editando slide ${selectedSlide} — ¿qué quieres cambiar?`
                  : 'Pide cambios... ej: "Regenera el slide 3 con más detalle"'}
                disabled={loading}
                style={{
                  flex: 1, background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px', color: 'var(--text)',
                  fontSize: 13, outline: 'none', fontFamily: 'inherit', fontWeight: 400,
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                style={{
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 8,
                  padding: '10px 16px', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13,
                  opacity: loading ? 0.5 : 1, fontFamily: 'inherit',
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Canvas */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--canvas-bg)',
        }}>
          {/* Canvas header */}
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Canvas · {slideCount} slides
            </span>
            {selectedSlide && (
              <span style={{
                marginLeft: 8, fontSize: 11, color: 'var(--accent)',
                background: 'var(--accent-bg)', padding: '2px 8px',
                borderRadius: 4, fontWeight: 600,
              }}>
                Slide {selectedSlide}
              </span>
            )}
          </div>

          {/* Canvas body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            {/* Thumbnails */}
            <div style={{
              width: 88, flexShrink: 0, overflowY: 'auto',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 5,
            }}>
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
                    onClick={() => setSelectedSlide(idx)}
                    style={{
                      position: 'relative',
                      width: thumbW, height: thumbH,
                      borderRadius: 4, overflow: 'hidden',
                      border: isSelected
                        ? '2px solid var(--accent)'
                        : isEditing
                        ? '2px solid #F59E0B'
                        : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer', background: '#111', padding: 0, flexShrink: 0,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <iframe
                      src={`/slides/${slug}/${slideUrl}`}
                      title={`Slide ${idx}`}
                      sandbox="allow-scripts allow-same-origin"
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '1280px', height: '720px', border: 'none',
                        transform: `scale(${thumbScale})`, transformOrigin: 'top left', pointerEvents: 'none',
                      }}
                    />
                    {isEditing && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 14, height: 14,
                          border: '2px solid #F59E0B',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                        }} />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 2, right: 3,
                      fontSize: 8,
                      color: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                      fontWeight: 700,
                    }}>
                      {idx}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Main preview */}
            <div
              ref={previewContainerRef}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', overflow: 'hidden', minWidth: 0, minHeight: 0,
              }}
            >
              {selectedSlide && project.slides && project.slides[selectedSlide - 1] ? (
                <div style={{
                  position: 'relative',
                  width: `${1280 * scale}px`, height: `${720 * scale}px`,
                  background: '#111', borderRadius: 8, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 16px 60px rgba(0,0,0,0.7)', flexShrink: 0,
                }}>
                  <iframe
                    src={`/slides/${slug}/${project.slides[selectedSlide - 1]}`}
                    title={`Slide ${selectedSlide}`}
                    sandbox="allow-scripts allow-same-origin"
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '1280px', height: '720px', border: 'none',
                      transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none',
                    }}
                  />
                  {editingSlide === selectedSlide && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 32, height: 32,
                        border: '3px solid #F59E0B',
                        borderTop: '3px solid transparent',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                      <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600 }}>
                        Regenerando slide {editingSlide}...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
                    <path d="M15 15l5 5M5 9v4m4-8h4m-4 12h4M5 5l1 1m12-1l-1 1M5 19l1-1"/>
                  </svg>
                  <p style={{ fontSize: 12, margin: 0 }}>
                    Haz clic en una miniatura para previsualizar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
