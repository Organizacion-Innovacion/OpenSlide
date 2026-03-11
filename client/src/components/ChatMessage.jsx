export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isAssistant ? 'flex-start' : 'flex-end',
      marginBottom: 16
    }}>
      {isAssistant && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg,#1B5E20,#4CAF50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 2
        }}>▶</div>
      )}
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isAssistant ? '#151515' : '#1B5E2033',
        border: `1px solid ${isAssistant ? '#222' : '#1B5E2066'}`,
        color: '#ddd',
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        {message.content}
        {message.extra && <div style={{ marginTop: 10 }}>{message.extra}</div>}
      </div>
    </div>
  )
}
