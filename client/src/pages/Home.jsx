import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/useProjectStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProjects, deleteProject } from '../services/api'
import ProjectCard from '../components/ProjectCard'

function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text2)',
        cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

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
    if (!confirm(`¿Eliminar "${slug}"? Esta acción no se puede deshacer.`)) return
    await deleteProject(slug)
    setProjects(projects.filter(p => p.slug !== slug))
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        height: 60,
        display: 'flex', alignItems: 'center',
        boxShadow: '0 1px 0 var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', maxWidth: 1100, margin: '0 auto',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>
              OpenSlide
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={() => navigate('/new')}
              style={{
                padding: '8px 18px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              + Nueva presentación
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        width: '100%', maxWidth: 1100,
        margin: '0 auto',
        padding: '48px 32px 80px',
        boxSizing: 'border-box',
      }}>
        {/* Page title */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 700,
            color: 'var(--text)', margin: '0 0 6px',
            letterSpacing: '-0.3px',
          }}>
            Tus presentaciones
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, margin: 0, fontWeight: 400 }}>
            Genera y gestiona presentaciones con IA
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '60px 0' }}>
            <div style={{
              width: 16, height: 16,
              border: '2px solid var(--border)',
              borderTop: '2px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>Cargando proyectos…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '80px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: 15, margin: '0 0 8px' }}>
              Sin presentaciones aún
            </p>
            <p style={{ color: 'var(--text3)', fontSize: 13, margin: '0 0 24px', maxWidth: 280 }}>
              Crea tu primera presentación con IA en segundos
            </p>
            <button
              onClick={() => navigate('/new')}
              style={{
                padding: '10px 22px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              Crear presentación
            </button>
          </div>
        )}

        {/* Project grid */}
        {!loading && projects.length > 0 && (
          <>
            <p style={{
              color: 'var(--text3)', fontSize: 11,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 20, fontWeight: 600,
            }}>
              {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 20,
            }}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  onDelete={() => handleDelete(project.slug)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 32px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', justifyContent: 'center',
        gap: 24,
      }}>
        {[
          { key: '←→', label: 'Navegar' },
          { key: 'F', label: 'Pantalla completa' },
          { key: 'Esc', label: 'Salir' },
        ].map(item => (
          <span key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <kbd style={{
              background: 'var(--surface2)',
              color: 'var(--text2)',
              padding: '2px 7px',
              borderRadius: 5,
              fontSize: 11,
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}>{item.key}</kbd>
            <span style={{ color: 'var(--text3)', fontSize: 11 }}>{item.label}</span>
          </span>
        ))}
      </footer>
    </div>
  )
}
