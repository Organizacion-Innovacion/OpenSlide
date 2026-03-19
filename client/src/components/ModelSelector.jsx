const MODELS = [
  {
    id: 'openai',
    label: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Preciso y versátil',
  },
  {
    id: 'claude',
    label: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Creativo y detallado',
  },
  {
    id: 'gemini',
    label: 'Gemini Flash',
    provider: 'Google',
    description: 'Rápido y eficiente',
  },
]

export default function ModelSelector({ onSelect, selected }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {MODELS.map(m => {
        const isSelected = selected === m.id
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 10,
              border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              background: isSelected ? 'var(--accent-bg)' : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: isSelected ? 'var(--accent)' : 'var(--text)',
                marginBottom: 2,
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 11,
                color: isSelected ? 'var(--accent)' : 'var(--text3)',
                fontWeight: 400,
              }}>
                {m.provider} · {m.description}
              </div>
            </div>
            {isSelected && (
              <div style={{
                width: 18, height: 18,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
