import React from 'react'

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

export function PaisesGrid({ paises, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Distribución por País (%)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {paises.map((p, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{p.nombre}</label>
            <input
              type="number"
              value={p.porcentaje ?? p.valor ?? ''}
              onChange={e => onChange(i, e.target.value)}
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

export function PaginasGrid({ paginas, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Páginas más visitadas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {paginas.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</span>
            <input
              type="number"
              value={p.visitas}
              onChange={e => onChange(i, e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FuentesGrid({ fuentes, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Fuentes de tráfico (visitas)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fuentes.map((f, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.nombre}</span>
            <input
              type="number"
              value={f.valor}
              onChange={e => onChange(i, e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopPostsGrid({ posts, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label">Top 3 publicaciones más vistas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Fecha #{i + 1}</label>
              <input
                type="text"
                value={p.fecha}
                onChange={e => onChange(i, 'fecha', e.target.value)}
                placeholder="ej. 16 mar."
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Vistas</label>
              <input
                type="number"
                value={p.vistas}
                onChange={e => onChange(i, 'vistas', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
