// SlidePreview – renders a scaled-down iframe of a single slide
const PREVIEW_W = 260
const PREVIEW_H = Math.round(PREVIEW_W * (9 / 16))
const PREVIEW_SCALE = PREVIEW_W / 1280

export default function SlidePreview({ src, title }) {
  return (
    <div style={{
      position: 'relative',
      width: `${PREVIEW_W}px`,
      height: `${PREVIEW_H}px`,
      overflow: 'hidden',
      borderRadius: 8,
      background: '#111',
    }}>
      <iframe
        src={src}
        title={title || 'Slide preview'}
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
    </div>
  )
}
