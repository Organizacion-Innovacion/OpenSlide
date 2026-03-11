import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/useSettingsStore'

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { keys, setKey } = useSettingsStore()
  const [drafts, setDrafts] = useState({ openai: '', anthropic: '', gemini: '' })
  const [saved, setSaved] = useState({})

  const handleSave = (provider) => {
    if (!drafts[provider].trim()) return
    setKey(provider, drafts[provider].trim())
    setSaved((s) => ({ ...s, [provider]: true }))
    setTimeout(() => setSaved((s) => ({ ...s, [provider]: false })), 2000)
    setDrafts((d) => ({ ...d, [provider]: '' }))
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid #222', background: '#111',
              color: '#aaa', cursor: 'pointer', fontSize: 13,
            }}
          >
            ← Volver
          </button>
          <h1 style={{ color: '#f0f0f0', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Configuración
          </h1>
        </div>

        <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>
          Ingresa tus API keys para activar la generación de presentaciones con IA.
          Las claves se guardan localmente en tu navegador.
        </p>

        {PROVIDERS.map((p) => (
          <div key={p.id} style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 24, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ color: '#ccc', fontWeight: 600, fontSize: 15 }}>
                {p.label}
              </label>
              {keys[p.id] && (
                <span style={{ color: '#4CAF50', fontSize: 13, fontWeight: 600 }}>
                  ✓ Configurado
                </span>
              )}
            </div>

            {keys[p.id] && (
              <p style={{ color: '#444', fontSize: 12, marginBottom: 10 }}>
                Key guardada: ****{keys[p.id].slice(-4)}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="password"
                placeholder={keys[p.id] ? 'Nueva key (reemplazar)' : p.placeholder}
                value={drafts[p.id]}
                onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(p.id)}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #2a2a2a', background: '#0a0a0a',
                  color: '#ddd', fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={() => handleSave(p.id)}
                disabled={!drafts[p.id].trim()}
                style={{
                  padding: '10px 18px', borderRadius: 8, border: 'none',
                  background: saved[p.id] ? '#1B5E20' : '#1a1a1a',
                  color: saved[p.id] ? '#4CAF50' : '#666',
                  cursor: drafts[p.id].trim() ? 'pointer' : 'default',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                {saved[p.id] ? '✓ Guardado' : 'Guardar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
