import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PREVIEW_W = 280
const PREVIEW_H = Math.round(PREVIEW_W * (9 / 16))
const PREVIEW_SCALE = PREVIEW_W / 1280

export default function ProjectCard({ project, onDelete }) {
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
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 14,
        padding: 0,
        cursor: 'pointer',
        color: 'var(--text)',
        width: `${PREVIEW_W}px`,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 32px var(--shadow-lg)'
          : '0 2px 8px var(--shadow)',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      {/* Botón eliminar */}
      {hovered && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 30,
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)',
            color: 'var(--danger)',
            borderRadius: 8, padding: '4px 10px',
            cursor: 'pointer', fontSize: 11, fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Eliminar
        </button>
      )}

      {/* Preview iframe */}
      <div style={{
        position: 'relative', width: '100%',
        height: `${PREVIEW_H}px`, overflow: 'hidden',
        background: '#18181C', flexShrink: 0,
      }}>
        {firstSlide ? (
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
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555', fontSize: 11,
          }}>
            Sin previsualización
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.45))',
        }} />
        <div style={{
          position: 'absolute', bottom: 8, left: 12, zIndex: 3,
          fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 5,
          background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(4px)',
        }}>
          {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', width: '100%', boxSizing: 'border-box' }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)',
          margin: '0 0 4px', textTransform: 'capitalize',
          wordBreak: 'break-word', lineHeight: 1.4,
        }}>
          {project.name.replace(/-/g, ' ')}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, fontWeight: 500 }}>
          {slideCount} {slideCount === 1 ? 'diapositiva' : 'diapositivas'}
        </p>
      </div>
    </button>
  )
}
