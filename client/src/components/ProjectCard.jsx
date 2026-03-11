import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ACCENT_COLORS = [
  { from: '#1B5E20', to: '#4CAF50' },
  { from: '#0D47A1', to: '#2196F3' },
  { from: '#4A148C', to: '#9C27B0' },
  { from: '#B71C1C', to: '#F44336' },
  { from: '#E65100', to: '#FF9800' },
  { from: '#006064', to: '#00BCD4' },
]

const PREVIEW_W = 260
const PREVIEW_H = Math.round(PREVIEW_W * (9 / 16))
const PREVIEW_SCALE = PREVIEW_W / 1280

export default function ProjectCard({ project, colorIndex }) {
  const { from, to } = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length]
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  const slideCount = project.slideCount || project.count || project.slides?.length || 0
  const firstSlide = project.slides?.[0]
    ? `/slides/${project.slug}/${project.slides[0]}`
    : null

  return (
    <button
      onClick={() => navigate(`/viewer/${project.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#111',
        border: `1px solid ${hovered ? `${from}80` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        padding: '0 0 20px',
        cursor: 'pointer',
        color: '#fff',
        width: `${PREVIEW_W}px`,
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px ${from}60`
          : '0 4px 24px rgba(0,0,0,0.4)',
        textAlign: 'left',
      }}
    >
      {/* Barra de color superior */}
      <div style={{
        width: '100%', height: 4,
        position: 'absolute', top: 0, left: 0,
        background: `linear-gradient(to right, ${from}, ${to})`
      }} />

      {/* Preview iframe */}
      <div style={{
        position: 'relative', width: '100%',
        height: `${PREVIEW_H}px`, overflow: 'hidden',
        marginTop: 4, flexShrink: 0,
      }}>
        {firstSlide && (
          <iframe
            src={firstSlide}
            title={`Preview ${project.name}`}
            sandbox="allow-scripts allow-same-origin"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '1280px', height: '720px',
              border: 'none', display: 'block',
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: hovered
            ? `linear-gradient(to bottom, transparent 60%, ${from}55)`
            : 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55))',
          transition: 'background 0.3s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: 8, right: 10, zIndex: 3,
          fontSize: 11, fontWeight: 700,
          padding: '3px 8px', borderRadius: 6,
          background: `${from}cc`, color: '#fff',
        }}>
          {slideCount} slides
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 18px 0', width: '100%', boxSizing: 'border-box' }}>
        <p style={{
          fontSize: 15, fontWeight: 600, color: '#eee',
          margin: '0 0 4px', textTransform: 'capitalize',
          wordBreak: 'break-word', lineHeight: 1.3,
        }}>
          {project.name.replace(/-/g, ' ')}
        </p>
        <p style={{ fontSize: 12, color: '#555', margin: 0 }}>
          {slideCount} {slideCount === 1 ? 'diapositiva' : 'diapositivas'}
        </p>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 16, padding: '7px 20px', borderRadius: 20,
        border: `1px solid ${hovered ? 'transparent' : '#2a2a2a'}`,
        fontSize: 12, fontWeight: 600,
        background: hovered ? `linear-gradient(to right, ${from}, ${to})` : '#1a1a1a',
        color: hovered ? '#fff' : '#555',
        transition: 'background 0.2s, color 0.2s',
      }}>
        {hovered ? 'Abrir presentación →' : 'Seleccionar'}
      </div>
    </button>
  )
}
