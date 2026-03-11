const MODELS = [
  { id: 'openai', label: 'OpenAI GPT-4', icon: '🤖', color: '#10a37f' },
  { id: 'claude', label: 'Claude Sonnet', icon: '🧠', color: '#d4763b' },
  { id: 'gemini', label: 'Gemini Pro', icon: '✨', color: '#4285f4' },
]

export default function ModelSelector({ onSelect, selected }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
      {MODELS.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: `1px solid ${selected === m.id ? m.color : '#2a2a2a'}`,
            background: selected === m.id ? `${m.color}22` : '#111',
            color: selected === m.id ? m.color : '#666',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{m.icon}</span>{m.label}
        </button>
      ))}
    </div>
  )
}
