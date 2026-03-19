import React from 'react'
import { VSField, SectionTitle, TopPostsGrid, NumField } from './FormFields'
import InstagramImporter from './InstagramImporter'

export default function EconegociosForm({ data, onChange }) {
  const set = (path, val) => {
    const keys = path.split('.')
    const updated = JSON.parse(JSON.stringify(data))
    let ref = updated
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]]
    ref[keys[keys.length - 1]] = val
    onChange(updated)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle icon="📸" title="Instagram — @econegocios" color="var(--green)" />
          <InstagramImporter
            brand="@econegocios"
            onImport={parsed => {
              const updated = JSON.parse(JSON.stringify(data))
              const ig = updated.instagram
              if (parsed.visualizaciones) ig.visualizaciones = parsed.visualizaciones
              if (parsed.cuentasAlcanzadas) ig.cuentasAlcanzadas = parsed.cuentasAlcanzadas
              if (parsed.interacciones) ig.interacciones = parsed.interacciones
              if (parsed.seguidoresPct) ig.seguidoresPct = parsed.seguidoresPct
              if (parsed.noSeguidoresPct) ig.noSeguidoresPct = parsed.noSeguidoresPct
              if (parsed.publicacionesPct) ig.publicacionesPct = parsed.publicacionesPct
              if (parsed.reelPct) ig.reelPct = parsed.reelPct
              if (parsed.topPosts?.length) {
                parsed.topPosts.forEach((p, i) => {
                  if (ig.topPosts[i]) {
                    ig.topPosts[i].vistas = p.vistas || ''
                    ig.topPosts[i].fecha = p.fecha || ''
                  }
                })
              }
              onChange(updated)
            }}
          />
        </div>

        <VSField
          label="Visualizaciones"
          value={data.instagram.visualizaciones}
          valueSP={data.instagram.visualizacionesSP}
          onChange={v => set('instagram.visualizaciones', v)}
          onChangeSP={v => set('instagram.visualizacionesSP', v)}
        />

        <VSField
          label="Interacciones"
          value={data.instagram.interacciones}
          valueSP={data.instagram.interaccionesSP}
          onChange={v => set('instagram.interacciones', v)}
          onChangeSP={v => set('instagram.interaccionesSP', v)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Cuentas Alcanzadas</label>
            <input type="number" value={data.instagram.cuentasAlcanzadas} onChange={e => set('instagram.cuentasAlcanzadas', e.target.value)} placeholder="9" min="0" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Seguidores %</label>
            <input type="number" value={data.instagram.seguidoresPct} onChange={e => set('instagram.seguidoresPct', e.target.value)} placeholder="100" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>No seguidores %</label>
            <input type="number" value={data.instagram.noSeguidoresPct} onChange={e => set('instagram.noSeguidoresPct', e.target.value)} placeholder="0" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Publicaciones %</label>
            <input type="number" value={data.instagram.publicacionesPct} onChange={e => set('instagram.publicacionesPct', e.target.value)} placeholder="100" min="0" max="100" />
          </div>
        </div>

        <TopPostsGrid
          posts={data.instagram.topPosts}
          onChange={(i, field, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.instagram.topPosts[i][field] = v
            onChange(updated)
          }}
        />
      </div>
    </div>
  )
}
