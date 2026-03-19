import React from 'react'
import {
  VSField, SectionTitle, PaisesGrid, DispositivosGrid,
  PaginasGrid, FuentesGrid, TopPostsGrid
} from './FormFields'
import InstagramImporter from './InstagramImporter'

export default function InnovariegoForm({ data, onChange }) {
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

      {/* WEB */}
      <div className="card">
        <SectionTitle icon="🌐" title="Web — innovariego.cl" color="var(--cyan2)" />

        <VSField
          label="Visitantes únicos"
          value={data.web.visitantes}
          valueSP={data.web.visitantesSP}
          onChange={v => set('web.visitantes', v)}
          onChangeSP={v => set('web.visitantesSP', v)}
        />

        <PaisesGrid
          paises={data.web.paises}
          onChange={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paises[i].valor = v
            onChange(updated)
          }}
          onChangeName={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paises[i].nombre = v
            onChange(updated)
          }}
          onAdd={() => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paises.push({ nombre: '', valor: '' })
            onChange(updated)
          }}
          onRemove={i => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paises.splice(i, 1)
            onChange(updated)
          }}
        />

        <FuentesGrid
          fuentes={data.web.fuentes}
          onChange={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.fuentes[i].valor = v
            onChange(updated)
          }}
          onChangeName={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.fuentes[i].nombre = v
            onChange(updated)
          }}
          onAdd={() => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.fuentes.push({ nombre: '', valor: '' })
            onChange(updated)
          }}
          onRemove={i => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.fuentes.splice(i, 1)
            onChange(updated)
          }}
        />

        <DispositivosGrid
          dispositivos={data.web.dispositivos}
          onChange={(k, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.dispositivos[k] = v
            onChange(updated)
          }}
        />

        <PaginasGrid
          paginas={data.web.paginasVisitadas}
          onChange={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paginasVisitadas[i].visitas = v
            onChange(updated)
          }}
          onChangeName={(i, v) => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paginasVisitadas[i].nombre = v
            onChange(updated)
          }}
          onAdd={() => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paginasVisitadas.push({ nombre: '', visitas: '' })
            onChange(updated)
          }}
          onRemove={i => {
            const updated = JSON.parse(JSON.stringify(data))
            updated.web.paginasVisitadas.splice(i, 1)
            onChange(updated)
          }}
        />
      </div>

      {/* INSTAGRAM */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle icon="📸" title="Instagram — @innovariego" color="var(--cyan2)" />
          <InstagramImporter
            brand="@innovariego"
            onImport={parsed => {
              const updated = JSON.parse(JSON.stringify(data))
              const ig = updated.instagram
              if (parsed.visualizaciones) ig.visualizaciones = parsed.visualizaciones
              if (parsed.cuentasAlcanzadas) ig.cuentasAlcanzadas = parsed.cuentasAlcanzadas
              if (parsed.interacciones) ig.interacciones = parsed.interacciones
              if (parsed.visitasPerfil) ig.visitasPerfil = parsed.visitasPerfil
              if (parsed.seguidores) ig.seguidores = parsed.seguidores
              if (parsed.seguidoresPct) ig.seguidoresPct = parsed.seguidoresPct
              if (parsed.noSeguidoresPct) ig.noSeguidoresPct = parsed.noSeguidoresPct
              if (parsed.publicacionesPct) ig.publicacionesPct = parsed.publicacionesPct
              if (parsed.reelPct) ig.reelPct = parsed.reelPct
              if (parsed.interaccionesSegPct) ig.interaccionesSegPct = parsed.interaccionesSegPct
              if (parsed.interaccionesNoSegPct) ig.interaccionesNoSegPct = parsed.interaccionesNoSegPct
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <VSField
            label="Visualizaciones"
            value={data.instagram.visualizaciones}
            valueSP={data.instagram.visualizacionesSP}
            onChange={v => set('instagram.visualizaciones', v)}
            onChangeSP={v => set('instagram.visualizacionesSP', v)}
          />
          <VSField
            label="Cuentas Alcanzadas"
            value={data.instagram.cuentasAlcanzadas}
            valueSP={data.instagram.cuentasAlcanzadasSP}
            onChange={v => set('instagram.cuentasAlcanzadas', v)}
            onChangeSP={v => set('instagram.cuentasAlcanzadasSP', v)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <VSField
            label="Interacciones"
            value={data.instagram.interacciones}
            valueSP={data.instagram.interaccionesSP}
            onChange={v => set('instagram.interacciones', v)}
            onChangeSP={v => set('instagram.interaccionesSP', v)}
          />
          <VSField
            label="Visitas al Perfil"
            value={data.instagram.visitasPerfil}
            valueSP={data.instagram.visitasPerfilSP}
            onChange={v => set('instagram.visitasPerfil', v)}
            onChangeSP={v => set('instagram.visitasPerfilSP', v)}
          />
        </div>

        <VSField
          label="Seguidores"
          value={data.instagram.seguidores}
          valueSP={data.instagram.seguidoresSP}
          onChange={v => set('instagram.seguidores', v)}
          onChangeSP={v => set('instagram.seguidoresSP', v)}
        />

        <div className="section-label" style={{ marginTop: 8 }}>Distribución audiencia (%)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Seguidores %</label>
            <input type="number" value={data.instagram.seguidoresPct} onChange={e => set('instagram.seguidoresPct', e.target.value)} placeholder="97" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>No seguidores %</label>
            <input type="number" value={data.instagram.noSeguidoresPct} onChange={e => set('instagram.noSeguidoresPct', e.target.value)} placeholder="3" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Publicaciones % (alcance)</label>
            <input type="number" value={data.instagram.publicacionesPct} onChange={e => set('instagram.publicacionesPct', e.target.value)} placeholder="98" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Reel % (alcance)</label>
            <input type="number" value={data.instagram.reelPct} onChange={e => set('instagram.reelPct', e.target.value)} placeholder="2" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Interacc. Seguidores %</label>
            <input type="number" value={data.instagram.interaccionesSegPct} onChange={e => set('instagram.interaccionesSegPct', e.target.value)} placeholder="41" min="0" max="100" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Interacc. No seg. %</label>
            <input type="number" value={data.instagram.interaccionesNoSegPct} onChange={e => set('instagram.interaccionesNoSegPct', e.target.value)} placeholder="59" min="0" max="100" />
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
