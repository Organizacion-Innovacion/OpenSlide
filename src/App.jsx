import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function HomeScreen({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/slides/manifest.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div style={s.home}>
      {/* Orbs decorativos de fondo */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Header */}
      <header style={s.homeHeader}>
        <div style={s.homeLogoWrap}>
          <span style={s.homeLogo}>▶</span>
        </div>
        <div>
          <h1 style={s.homeTitle}>Mis Presentaciones</h1>
          <p style={s.homeSubtitle}>Selecciona un proyecto para comenzar</p>
        </div>
      </header>

      {/* Content */}
      {loading && (
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <span style={{ color: "#555", marginLeft: 12 }}>Cargando proyectos…</span>
        </div>
      )}

      {!loading && (error || projects.length === 0) && (
        <EmptyState error={error} />
      )}

      {!loading && projects.length > 0 && (
        <>
          <p style={s.sectionLabel}>
            {projects.length} {projects.length === 1 ? "proyecto encontrado" : "proyectos encontrados"}
          </p>
          <div style={s.grid}>
            {projects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                colorIndex={i}
                onClick={() => onSelectProject(project)}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer de atajos */}
      <footer style={s.homeFooter}>
        <span>Usa las flechas del teclado para navegar</span>
        <span style={s.footerDot}>·</span>
        <span><kbd style={s.kbd}>F</kbd> pantalla completa</span>
        <span style={s.footerDot}>·</span>
        <span><kbd style={s.kbd}>Esc</kbd> salir</span>
      </footer>
    </div>
  );
}

function EmptyState({ error }) {
  return (
    <div style={s.emptyState}>
      <span style={{ fontSize: 52 }}>📂</span>
      <p style={{ color: "#ccc", fontWeight: 600, margin: "12px 0 6px" }}>
        {error ? "No se pudieron cargar los proyectos" : "Sin proyectos aún"}
      </p>
      <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
        Crea carpetas dentro de{" "}
        <code style={s.code}>public/slides/</code> con archivos{" "}
        <code style={s.code}>.html</code>
      </p>
    </div>
  );
}

const ACCENT_COLORS = [
  { from: "#1B5E20", to: "#4CAF50" },
  { from: "#0D47A1", to: "#2196F3" },
  { from: "#4A148C", to: "#9C27B0" },
  { from: "#B71C1C", to: "#F44336" },
  { from: "#E65100", to: "#FF9800" },
  { from: "#006064", to: "#00BCD4" },
];

// Escala para encajar un iframe 1280×720 en un contenedor de 260px de ancho
const PREVIEW_W = 260;
const PREVIEW_H = Math.round(PREVIEW_W * (9 / 16)); // 146px
const PREVIEW_SCALE = PREVIEW_W / 1280;              // 0.203125

function ProjectCard({ project, colorIndex, onClick }) {
  const { from, to } = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length];
  const [hovered, setHovered] = useState(false);
  const firstSlide = `/slides/${project.slug}/${project.slides[0]}`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.card,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px ${from}60`
          : "0 4px 24px rgba(0,0,0,0.4)",
        borderColor: hovered ? `${from}80` : "rgba(255,255,255,0.07)",
      }}
    >
      {/* Barra de color superior */}
      <div style={{ ...s.cardBar, background: `linear-gradient(to right, ${from}, ${to})` }} />

      {/* Preview con iframe real del primer slide */}
      <div style={{ ...s.cardPreview, height: `${PREVIEW_H}px` }}>
        <iframe
          src={firstSlide}
          title={`Preview ${project.name}`}
          sandbox="allow-scripts allow-same-origin"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1280px",
            height: "720px",
            border: "none",
            display: "block",
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        />
        {/* Overlay para bloquear interacción y añadir efecto hover */}
        <div style={{
          ...s.cardPreviewOverlay,
          background: hovered
            ? `linear-gradient(to bottom, transparent 60%, ${from}55)`
            : "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55))",
        }} />
        {/* Badge de cantidad */}
        <div style={{ ...s.cardBadge, background: `${from}cc`, color: "#fff" }}>
          {project.count} slides
        </div>
      </div>

      {/* Info */}
      <div style={s.cardBody}>
        <p style={s.cardName}>{project.name.replace(/-/g, " ")}</p>
        <p style={s.cardMeta}>
          {project.count} {project.count === 1 ? "diapositiva" : "diapositivas"}
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          ...s.cardCta,
          background: hovered ? `linear-gradient(to right, ${from}, ${to})` : "#1a1a1a",
          color: hovered ? "#fff" : "#555",
          borderColor: hovered ? "transparent" : "#2a2a2a",
        }}
      >
        {hovered ? "Abrir presentación →" : "Seleccionar"}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENTATION VIEWER
// ─────────────────────────────────────────────────────────────────────────────
function PresentationViewer({ project, onBack }) {
  const [current, setCurrent] = useState(1);
  const [hint, setHint] = useState(null);        // "prev" | "next" | null
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Escala via estado (evita conflicto React-style vs JS-style) ──────────
  // fsSize = {w, h} cuando estamos en fullscreen, null si no.
  // scale  = factor de escala del iframe (siempre activo).
  const [fsSize, setFsSize] = useState(null);
  const [scale, setScale] = useState(1);

  const wrapperRef   = useRef(null);
  const rootRef      = useRef(null);
  const controlsRef  = useRef(null);
  const hideTimerRef = useRef(null);
  const touchStartX  = useRef(null);

  const totalSlides = project.slides.length;
  const slideSrc    = `/slides/${project.slug}/${project.slides[current - 1]}`;
  const progress    = ((current - 1) / Math.max(totalSlides - 1, 1)) * 100;

  // Navegación
  const prev = useCallback(() => setCurrent((n) => Math.max(1, n - 1)), []);
  const next = useCallback(() => setCurrent((n) => Math.min(totalSlides, n + 1)), [totalSlides]);

  // Fullscreen
  const enterFullscreen = useCallback(() => rootRef.current?.requestFullscreen?.(), []);
  const exitFullscreen  = useCallback(() => document.exitFullscreen?.(), []);
  const toggleFullscreen = useCallback(
    () => (document.fullscreenElement ? exitFullscreen() : enterFullscreen()),
    [enterFullscreen, exitFullscreen]
  );

  // Salir fullscreen al volver al menú
  const handleBack = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    onBack();
  }, [onBack]);

  // ── Auto-hide de controles flotantes (DOM directo, sin setState) ──────────
  const revealControls = useCallback(() => {
    const el = controlsRef.current;
    if (!el) return;
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!controlsRef.current) return;
      controlsRef.current.style.opacity = "0";
      controlsRef.current.style.pointerEvents = "none";
    }, 3000);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      const t = setTimeout(revealControls, 80);
      return () => clearTimeout(t);
    }
    clearTimeout(hideTimerRef.current);
  }, [isFullscreen, revealControls]);

  // ── Cálculo de escala via rAF (evita setState sincrónico en effect body) ──
  useEffect(() => {
    const update = () => {
      if (document.fullscreenElement) {
        const sc = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
        setScale(sc);
        setFsSize({ w: Math.round(1280 * sc), h: Math.round(720 * sc) });
      } else {
        setFsSize(null);
        const el = wrapperRef.current;
        if (!el) return;
        const w = el.getBoundingClientRect().width;
        if (w > 0) setScale(w / 1280);
      }
    };

    // Primer cálculo diferido (rAF) → no es setState sincrónico en effect body
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, []);

  // ── Sincronizar estado isFullscreen ───────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ── Teclado ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen]);

  // ── Swipe táctil ─────────────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
    touchStartX.current = null;
  };

  // ── Clic en zonas del slide ───────────────────────────────────────────────
  const handleSlideClick = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const zone = rect.width * 0.2;
    if (x < zone) prev();
    else if (x > rect.width - zone) next();
  };

  // ── Mouse move ────────────────────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (isFullscreen) revealControls();
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const zone = rect.width * 0.2;
    if (x < zone && current > 1)                            setHint("prev");
    else if (x > rect.width - zone && current < totalSlides) setHint("next");
    else                                                     setHint(null);
  };

  // ── Estilos del wrapper (React-managed → sin conflicto con JS) ───────────
  const wrapperStyle = fsSize
    ? {
        // FULLSCREEN: tamaño exacto calculado, sin maxWidth
        ...s.slideWrapper,
        width: `${fsSize.w}px`,
        height: `${fsSize.h}px`,
        maxWidth: "none",
        borderRadius: 0,
        boxShadow: "none",
        cursor: "default",
      }
    : {
        // NORMAL: ancho porcentual, altura derivada de scale
        ...s.slideWrapper,
        height: `${720 * scale}px`,
        cursor: hint === "prev" ? "w-resize" : hint === "next" ? "e-resize" : "default",
        borderRadius: "12px",
        boxShadow: "0 16px 60px rgba(0,0,0,0.8)",
      };

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      style={{
        ...s.root,
        padding: isFullscreen ? 0 : "20px 16px",
        background: isFullscreen ? "#000" : "#0a0a0a",
      }}
    >
      {/* Barra de progreso (solo modo normal) */}
      {!isFullscreen && (
        <div style={s.progressTrack}>
          <div
            style={{
              ...s.progressBar,
              width: `${progress}%`,
            }}
          />
        </div>
      )}

      {/* Top bar (modo normal) */}
      {!isFullscreen && (
        <div style={s.topBar}>
          <button onClick={handleBack} style={s.backBtn}>
            ← Proyectos
          </button>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbProject}>{project.name.replace(/-/g, " ")}</span>
            <span style={s.breadcrumbSep}>›</span>
            <span style={s.breadcrumbSlide}>Slide {current}</span>
          </div>
          <span style={s.slideCounter}>
            {current} <span style={{ color: "#444" }}>/</span> {totalSlides}
          </span>
        </div>
      )}

      {/* Wrapper del slide */}
      <div
        ref={wrapperRef}
        onClick={handleSlideClick}
        onMouseLeave={() => setHint(null)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={wrapperStyle}
      >
        {/* Zona izquierda */}
        <div
          style={{
            ...s.zone,
            left: 0,
            opacity: hint === "prev" ? 1 : 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent)",
          }}
        >
          <span style={s.arrowHint}>‹</span>
        </div>

        {/* Zona derecha */}
        <div
          style={{
            ...s.zone,
            right: 0,
            opacity: hint === "next" ? 1 : 0,
            background: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)",
          }}
        >
          <span style={{ ...s.arrowHint, left: "auto", right: 16 }}>›</span>
        </div>

        {/* Botón fullscreen (solo modo normal) */}
        {!isFullscreen && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            title="Pantalla completa (F)"
            style={s.fsBtnOverlay}
          >
            ⛶
          </button>
        )}

        {/* Indicador de slide (solo modo normal) */}
        {!isFullscreen && (
          <div style={s.slideNumOverlay}>
            {current}/{totalSlides}
          </div>
        )}

        <iframe
          key={current}
          src={slideSrc}
          title={`Slide ${current}`}
          style={{ ...s.iframe, transform: `scale(${scale})` }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Controles normales */}
      {!isFullscreen && (
        <>
          <div style={s.controls}>
            <button
              onClick={prev}
              disabled={current === 1}
              style={{ ...s.btn, opacity: current === 1 ? 0.3 : 1 }}
            >
              ← Anterior
            </button>

            <div style={s.dots}>
              {Array.from({ length: totalSlides }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i + 1)}
                  title={`Slide ${i + 1}`}
                  style={{
                    ...s.dot,
                    background: current === i + 1 ? "#4CAF50" : "#333",
                    transform: current === i + 1 ? "scale(1.5)" : "scale(1)",
                    boxShadow: current === i + 1 ? "0 0 8px #4CAF5088" : "none",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={current === totalSlides}
              style={{ ...s.btn, opacity: current === totalSlides ? 0.3 : 1 }}
            >
              Siguiente →
            </button>

            <button onClick={toggleFullscreen} style={s.btnFs}>
              ⛶ Pantalla completa
            </button>
          </div>

          <p style={s.tip}>
            Clic en los bordes · Flechas ⬅ ➡ · Deslizar · <kbd style={s.kbd}>F</kbd> fullscreen
          </p>
        </>
      )}

      {/* Controles flotantes (fullscreen, auto-hide) */}
      {isFullscreen && (
        <div ref={controlsRef} style={s.floating}>
          {/* Menú */}
          <button onClick={handleBack} style={{ ...s.floatBtn, fontSize: "12px", padding: "5px 11px", opacity: 0.7 }}>
            ☰
          </button>

          <div style={s.floatDivider} />

          <button onClick={prev} disabled={current === 1} style={{ ...s.floatBtn, opacity: current === 1 ? 0.25 : 1 }}>
            ←
          </button>

          <div style={s.dots}>
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i + 1)}
                style={{
                  ...s.dot,
                  background: current === i + 1 ? "#fff" : "rgba(255,255,255,0.25)",
                  transform: current === i + 1 ? "scale(1.5)" : "scale(1)",
                  boxShadow: current === i + 1 ? "0 0 6px #ffffff88" : "none",
                }}
              />
            ))}
          </div>

          <span style={s.floatCounter}>
            {current}<span style={{ opacity: 0.4 }}>/</span>{totalSlides}
          </span>

          <button onClick={next} disabled={current === totalSlides} style={{ ...s.floatBtn, opacity: current === totalSlides ? 0.25 : 1 }}>
            →
          </button>

          <div style={s.floatDivider} />

          <button onClick={exitFullscreen} style={{ ...s.floatBtn, fontSize: "12px", padding: "5px 11px" }}>
            ✕ Salir
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  if (selectedProject) {
    return (
      <PresentationViewer
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }
  return <HomeScreen onSelectProject={setSelectedProject} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  // ── Home ────────────────────────────────────────────────────────────────────
  home: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,                  // llena el #root que ya es 100vh
    background: "#080808",
    padding: "56px 24px 80px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    top: "-160px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "700px",
    height: "400px",
    background: "radial-gradient(ellipse, #1B5E2022 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    bottom: "0",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(ellipse, #0D47A115 0%, transparent 70%)",
    pointerEvents: "none",
  },
  homeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "48px",
    zIndex: 1,
  },
  homeLogoWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #1B5E20, #4CAF50)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px #1B5E2060",
    flexShrink: 0,
  },
  homeLogo: {
    fontSize: "22px",
    color: "#fff",
    marginLeft: "3px",
  },
  homeTitle: {
    color: "#f0f0f0",
    fontSize: "2rem",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  homeSubtitle: {
    color: "#555",
    fontSize: "14px",
    margin: "4px 0 0",
  },
  sectionLabel: {
    color: "#444",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "20px",
    fontWeight: 600,
    zIndex: 1,
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    marginTop: "60px",
    zIndex: 1,
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid #222",
    borderTop: "2px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "60px",
    textAlign: "center",
    zIndex: 1,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    justifyContent: "center",
    maxWidth: "1000px",
    zIndex: 1,
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "0 0 20px",
    cursor: "pointer",
    color: "#fff",
    width: `${PREVIEW_W}px`,  // 260px — igual al ancho del preview
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
    textAlign: "left",
  },
  cardBar: {
    width: "100%",
    height: "4px",
    position: "absolute",
    top: 0,
    left: 0,
  },
  cardPreview: {
    position: "relative",
    width: "100%",
    // height se aplica inline con PREVIEW_H para que sea exactamente 16:9
    overflow: "hidden",
    marginTop: "4px",
    flexShrink: 0,
  },
  cardPreviewOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    transition: "background 0.3s ease",
  },
  cardBadge: {
    position: "absolute",
    bottom: "8px",
    right: "10px",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  cardBody: {
    padding: "14px 18px 0",
    width: "100%",
    boxSizing: "border-box",
  },
  cardName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#eee",
    margin: "0 0 4px",
    textTransform: "capitalize",
    wordBreak: "break-word",
    lineHeight: 1.3,
  },
  cardMeta: {
    fontSize: "12px",
    color: "#555",
    margin: 0,
  },
  cardCta: {
    marginTop: "16px",
    padding: "7px 20px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
    transition: "background 0.2s, color 0.2s",
  },
  homeFooter: {
    position: "absolute",
    bottom: "20px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    color: "#333",
    fontSize: "12px",
    zIndex: 1,
  },
  footerDot: { color: "#222" },

  // ── Viewer ───────────────────────────────────────────────────────────────────
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  progressTrack: {
    width: "100%",
    maxWidth: "1280px",
    height: "3px",
    background: "#151515",
    borderRadius: "2px",
    marginBottom: "0",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(to right, #1B5E20, #4CAF50)",
    borderRadius: "2px",
    transition: "width 0.35s ease",
  },
  topBar: {
    width: "100%",
    maxWidth: "1280px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0 12px",
    boxSizing: "border-box",
  },
  backBtn: {
    padding: "7px 16px",
    background: "#141414",
    color: "#aaa",
    border: "1px solid #222",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
    minWidth: 0,
  },
  breadcrumbProject: {
    color: "#555",
    fontSize: "13px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  breadcrumbSep: { color: "#333", fontSize: "13px" },
  breadcrumbSlide: { color: "#888", fontSize: "13px", whiteSpace: "nowrap" },
  slideCounter: {
    color: "#666",
    fontSize: "13px",
    fontVariantNumeric: "tabular-nums",
    fontWeight: "600",
    marginLeft: "auto",
    flexShrink: 0,
  },
  slideWrapper: {
    position: "relative",
    overflow: "hidden",
    background: "#fff",
    userSelect: "none",
    maxWidth: "1280px",
    width: "100%",
  },
  iframe: {
    width: "1280px",
    height: "720px",
    border: "none",
    display: "block",
    transformOrigin: "top left",
    pointerEvents: "none",
  },
  zone: {
    position: "absolute",
    top: 0,
    width: "20%",
    height: "100%",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
  },
  arrowHint: {
    position: "absolute",
    left: 16,
    color: "#fff",
    fontSize: "60px",
    fontWeight: "bold",
    lineHeight: 1,
    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
    userSelect: "none",
  },
  fsBtnOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "8px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "18px",
    backdropFilter: "blur(6px)",
    lineHeight: 1,
    transition: "background 0.2s",
  },
  slideNumOverlay: {
    position: "absolute",
    bottom: 10,
    right: 12,
    zIndex: 20,
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    fontWeight: "600",
    fontVariantNumeric: "tabular-nums",
    pointerEvents: "none",
    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "18px",
    color: "#fff",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
    padding: "10px 22px",
    background: "#151515",
    color: "#ccc",
    border: "1px solid #222",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.15s, color 0.15s",
  },
  btnFs: {
    padding: "10px 18px",
    background: "#151515",
    color: "#666",
    border: "1px solid #222",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  dots: {
    display: "flex",
    gap: "7px",
    alignItems: "center",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
    padding: 0,
    flexShrink: 0,
  },
  tip: {
    marginTop: "10px",
    color: "#333",
    fontSize: "12px",
    letterSpacing: "0.01em",
  },
  kbd: {
    background: "#1a1a1a",
    color: "#666",
    padding: "1px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    border: "1px solid #333",
    fontFamily: "monospace",
  },
  // Floating (fullscreen)
  floating: {
    position: "fixed",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "10px 20px",
    borderRadius: "50px",
    border: "1px solid rgba(255,255,255,0.1)",
    zIndex: 200,
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 0.4s ease",
  },
  floatBtn: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "6px 13px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background 0.15s",
  },
  floatDivider: {
    width: "1px",
    height: "20px",
    background: "rgba(255,255,255,0.12)",
    flexShrink: 0,
  },
  floatCounter: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    fontVariantNumeric: "tabular-nums",
    minWidth: "40px",
    textAlign: "center",
  },
  code: {
    background: "#181818",
    color: "#aaa",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    border: "1px solid #2a2a2a",
  },
};
