import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/useProjectStore'
import { getProjects, deleteProject } from '../services/api'
import ProjectCard from '../components/ProjectCard'

export default function Home() {
  const navigate = useNavigate()
  const { projects, loading, setProjects, setLoading } = useProjectStore()

  useEffect(() => {
    setLoading(true)
    getProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (slug) => {
    if (!confirm(`¿Eliminar el proyecto "${slug}"? Esta acción no se puede deshacer.`)) return
    await deleteProject(slug)
    setProjects(projects.filter(p => p.slug !== slug))
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      background: '#080808',
      padding: '56px 24px 80px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
      overflow: 'hidden',
      minHeight: '100vh',
    }}>
      {/* Orbs */}
      <div style={{
        position: 'absolute', top: '-160px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, #1B5E2022 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, #0D47A115 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 1000, marginBottom: 48, zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px #1B5E2060', flexShrink: 0,
          }}>
            <span style={{ fontSize: 22, color: '#fff', marginLeft: 3 }}>▶</span>
          </div>
          <div>
            <h1 style={{ color: '#f0f0f0', fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              OpenSlide
            </h1>
            <p style={{ color: '#555', fontSize: 14, margin: '4px 0 0' }}>
              Tus presentaciones con IA
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/new')}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 16px #1B5E2060',
            }}
          >
            + Nueva Presentación
          </button>
          <button
            onClick={() => navigate('/settings')}
            style={{
              padding: '10px 14px', borderRadius: 10,
              border: '1px solid #2a2a2a', cursor: 'pointer',
              background: '#111', color: '#888', fontSize: 18,
            }}
            title="Configuración"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Content */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 60, zIndex: 1 }}>
          <div style={{
            width: 18, height: 18, border: '2px solid #222',
            borderTop: '2px solid #4CAF50', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: '#555', marginLeft: 12 }}>Cargando proyectos…</span>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60, zIndex: 1 }}>
          <span style={{ fontSize: 52 }}>📂</span>
          <p style={{ color: '#ccc', fontWeight: 600, margin: '12px 0 6px' }}>Sin proyectos aún</p>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
            Crea tu primera presentación con IA
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <>
          <p style={{
            color: '#444', fontSize: 12, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 20, fontWeight: 600, zIndex: 1,
            alignSelf: 'flex-start', maxWidth: 1000,
          }}>
            {projects.length} {projects.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 24,
            justifyContent: 'center', maxWidth: 1000, zIndex: 1,
          }}>
            {projects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} colorIndex={i} onDelete={() => handleDelete(project.slug)} />
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{
        position: 'absolute', bottom: 20,
        display: 'flex', gap: 10, alignItems: 'center',
        color: '#333', fontSize: 12, zIndex: 1,
      }}>
        <span>Usa las flechas del teclado para navegar</span>
        <span style={{ color: '#222' }}>·</span>
        <span><kbd style={{ background: '#1a1a1a', color: '#666', padding: '1px 6px', borderRadius: 4, fontSize: 11, border: '1px solid #333' }}>F</kbd> pantalla completa</span>
        <span style={{ color: '#222' }}>·</span>
        <span><kbd style={{ background: '#1a1a1a', color: '#666', padding: '1px 6px', borderRadius: 4, fontSize: 11, border: '1px solid #333' }}>Esc</kbd> salir</span>
      </footer>
    </div>
  )
}
