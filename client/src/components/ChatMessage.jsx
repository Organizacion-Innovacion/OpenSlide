export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isAssistant ? 'flex-start' : 'flex-end',
      marginBottom: 14,
      animation: 'fadeIn 0.2s ease',
    }}>
      {isAssistant && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, marginRight: 10, flexShrink: 0, marginTop: 2,
          color: '#fff', fontWeight: 700,
        }}>
          OS
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '10px 14px',
        borderRadius: isAssistant ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isAssistant ? 'var(--surface)' : 'var(--accent)',
        border: isAssistant ? '1px solid var(--border)' : 'none',
        color: isAssistant ? 'var(--text)' : '#ffffff',
        fontSize: 13,
        lineHeight: 1.6,
        fontWeight: 400,
        boxShadow: '0 1px 3px var(--shadow)',
      }}>
        {message.content}
        {message.extra && <div style={{ marginTop: 10 }}>{message.extra}</div>}
      </div>
    </div>
  )
}
