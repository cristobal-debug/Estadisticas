import React, { useRef } from 'react'

const btnSmall = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  color: 'var(--muted)',
  borderRadius: 6,
  padding: '3px 8px',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

export function NumField({ label, value, onChange, suffix = '', hint = '' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
        {label} {suffix && <span style={{ color: 'var(--cyan)', opacity: 0.7 }}>{suffix}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
        min="0"
      />
      {hint && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{hint}</p>}
    </div>
  )
}

export function TextField({ label, value, onChange, placeholder = '' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function VSField({ label, value, valueSP, onChange, onChangeSP }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 3, letterSpacing: '0.05em' }}>ESTA SEMANA</div>
          <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0" min="0" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3, letterSpacing: '0.05em' }}>SEM. ANTERIOR (sp)</div>
          <input type="number" value={valueSP} onChange={e => onChangeSP(e.target.value)} placeholder="0" min="0" />
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({ icon, title, color = 'var(--cyan)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
      paddingBottom: 12, borderBottom: `1px solid var(--border)`
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color }}>{title}</h3>
    </div>
  )
}

export function PaisesGrid({ paises, onChange, onChangeName, onAdd, onRemove }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="section-label" style={{ margin: 0 }}>Distribución por País (%)</div>
        <button style={btnSmall} onClick={onAdd}>+ Agregar</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {paises.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 28px', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={p.nombre}
              onChange={e => onChangeName(i, e.target.value)}
              placeholder="País"
              style={{ fontSize: 12 }}
            />
            <input
              type="number"
              value={p.porcentaje ?? p.valor ?? ''}
              onChange={e => onChange(i, e.target.value)}
              placeholder="%"
              min="0" max="100"
            />
            <button onClick={() => onRemove(i)} style={{ ...btnSmall, color: '#ff5252', borderColor: '#ff525244', padding: '3px 6px' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DispositivosGrid({ dispositivos, onChange }) {
  const items = [
    { key: 'smartphone', label: 'Smartphone' },
    { key: 'desktop', label: 'Desktop' },
    { key: 'tablet', label: 'Tablet' },
    { key: 'phablet', label: 'Phablet' },
  ]
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Dispositivos (%)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {items.map(item => (
          <div key={item.key}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{item.label}</label>
            <input
              type="number"
              value={dispositivos[item.key] ?? ''}
              onChange={e => onChange(item.key, e.target.value)}
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaginasGrid({ paginas, onChange, onChangeName, onAdd, onRemove }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="section-label" style={{ margin: 0 }}>Páginas más visitadas</div>
        <button style={btnSmall} onClick={onAdd}>+ Agregar</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {paginas.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 28px', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={p.nombre}
              onChange={e => onChangeName(i, e.target.value)}
              placeholder="Nombre de página"
              style={{ fontSize: 12 }}
            />
            <input
              type="number"
              value={p.visitas}
              onChange={e => onChange(i, e.target.value)}
              placeholder="0" min="0"
            />
            <button onClick={() => onRemove(i)} style={{ ...btnSmall, color: '#ff5252', borderColor: '#ff525244', padding: '3px 6px' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FuentesGrid({ fuentes, onChange, onChangeName, onAdd, onRemove }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="section-label" style={{ margin: 0 }}>Fuentes de tráfico (visitas)</div>
        <button style={btnSmall} onClick={onAdd}>+ Agregar</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fuentes.map((f, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 28px', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={f.nombre}
              onChange={e => onChangeName(i, e.target.value)}
              placeholder="Fuente"
              style={{ fontSize: 12 }}
            />
            <input
              type="number"
              value={f.valor}
              onChange={e => onChange(i, e.target.value)}
              placeholder="0" min="0"
            />
            <button onClick={() => onRemove(i)} style={{ ...btnSmall, color: '#ff5252', borderColor: '#ff525244', padding: '3px 6px' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopPostsGrid({ posts, onChange }) {
  const fileRefs = [useRef(), useRef(), useRef()]

  const handleFile = (i, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => onChange(i, 'imagen', e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Top 3 publicaciones más vistas</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {posts.map((p, i) => (
          <div key={i} style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Image area */}
            <div
              onClick={() => fileRefs[i].current.click()}
              style={{
                height: 120,
                background: p.imagen ? 'transparent' : 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {p.imagen ? (
                <>
                  <img src={p.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <span style={{ fontSize: 12, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>Click para subir</div>
                </div>
              )}
              <input
                ref={fileRefs[i]}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(i, e.target.files[0])}
              />
            </div>

            {/* Fields */}
            <div style={{ padding: '10px 10px 12px' }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  FECHA
                </label>
                <input
                  type="text"
                  value={p.fecha}
                  onChange={e => onChange(i, 'fecha', e.target.value)}
                  placeholder="ej. 16 mar."
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  VISTAS
                </label>
                <input
                  type="number"
                  value={p.vistas}
                  onChange={e => onChange(i, 'vistas', e.target.value)}
                  placeholder="0" min="0"
                  style={{ fontSize: 12 }}
                />
              </div>
              {p.imagen && (
                <button
                  onClick={() => onChange(i, 'imagen', '')}
                  style={{ ...btnSmall, marginTop: 8, color: '#ff5252', borderColor: '#ff525244', width: '100%', textAlign: 'center' }}
                >
                  ✕ Quitar imagen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
