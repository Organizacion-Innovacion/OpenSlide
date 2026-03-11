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

  const apiKey = model === 'openai' ? keys.openai : model === 'claude' ? keys.anthropic : keys.gemini

  useEffect(() => {
    getProject(slug).then(p => {
      setProject(p)
      setMessages([{
        role: 'assistant',
        content: `Hola, estoy listo para ayudarte a editar "${p.name}". Tienes ${p.slideCount || p.slides?.length || 0} slides en tema ${p.theme || 'por defecto'}.\n\n¿Qué quieres cambiar? Puedes pedirme regenerar un slide específico, cambiar el estilo, o ajustar el contenido.`
      }])
    }).catch(() => navigate('/'))
  }, [slug])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const currentInput = input.trim()
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const slideMatch = currentInput.match(/slide\s*(\d+)/i)

      if (slideMatch) {
        const slideIndex = parseInt(slideMatch[1])
        setMessages(prev => [...prev, { role: 'assistant', content: `🔄 Regenerando slide ${slideIndex}...` }])
        const result = await regenerateSlide({ slug, slideIndex, instructions: currentInput, apiKey })
        setMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: result.ok
            ? `✅ Slide ${slideIndex} regenerado. Puedes verlo en el [visor](/viewer/${slug}).`
            : `❌ Error: ${result.error}`
        }])
      } else {
        const contextMessages = [
          {
            role: 'system',
            content: `Eres el asistente de OpenSlide ayudando a editar el proyecto "${project?.name}". El proyecto tiene ${project?.slideCount || project?.slides?.length || 0} slides con tema "${project?.theme}". Ayuda al usuario a planificar cambios. Si quiere regenerar slides específicos, indícale que mencione el número del slide.`
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
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Proyectos</button>
        <button onClick={() => navigate(`/viewer/${slug}`)} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>👁 Ver presentación</button>
        <span style={{ color: '#555', fontSize: 13, marginLeft: 'auto' }}>{project.name} · {slideCount} slides</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {loading && <ChatMessage message={{ role: 'assistant', content: '...' }} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a1a', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder='Pide cambios... ej: "Regenera el slide 3 con más detalle"'
            style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 16px', color: '#eee', fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg,#1B5E20,#4CAF50)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: loading ? 0.5 : 1 }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
