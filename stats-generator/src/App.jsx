import React, { useState, useCallback } from 'react'
import { emptyStats } from './data/defaultStats'
import AsemaforForm from './components/AsemaforForm'
import InnovariegoForm from './components/InnovariegoForm'
import EconegociosForm from './components/EconegociosForm'
import { generatePDF } from './components/pdfGenerator'

const BRANDS = [
  { id: 'general', label: 'General', icon: '📅', color: 'var(--muted)' },
  { id: 'asemafor', label: 'Asemafor', icon: '🌿', color: 'var(--cyan)' },
  { id: 'innovariego', label: 'Innovariego', icon: '💧', color: 'var(--cyan2)' },
  { id: 'econegocios', label: 'Econegocios', icon: '♻️', color: 'var(--green)' },
  { id: 'guide', label: '📡 Auto-datos', icon: '', color: '#f59e0b' },
]

export default function App() {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('stats-draft')
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(emptyStats))
  })
  const [activeTab, setActiveTab] = useState('general')
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = useCallback((data) => {
    setStats(data)
    localStorage.setItem('stats-draft', JSON.stringify(data))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const setField = (path, val) => {
    const keys = path.split('.')
    const updated = JSON.parse(JSON.stringify(stats))
    let ref = updated
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]]
    ref[keys[keys.length - 1]] = val
    save(updated)
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      await generatePDF(stats)
    } catch (e) {
      alert('Error generando PDF: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleReset = () => {
    if (confirm('¿Borrar todos los datos ingresados?')) {
      const fresh = JSON.parse(JSON.stringify(emptyStats))
      setStats(fresh)
      localStorage.setItem('stats-draft', JSON.stringify(fresh))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* TOP NAV */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--cyan), var(--cyan2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>📊</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Stats Generator</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Asemafor · Innovariego · Econegocios</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--font-display)' }}>
              ✓ Guardado
            </span>
          )}
          <button onClick={handleReset} className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>
            Resetear
          </button>
          <button
            onClick={handleGeneratePDF}
            className="btn-primary"
            disabled={generating}
            style={{ opacity: generating ? 0.7 : 1 }}
          >
            {generating ? '⏳ Generando…' : '⬇️ Generar PDF'}
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 200,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          position: 'sticky',
          top: 60,
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Secciones</div>
          {BRANDS.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveTab(b.id)}
              style={{
                width: '100%',
                background: activeTab === b.id ? `color-mix(in srgb, ${b.color} 15%, transparent)` : 'transparent',
                border: activeTab === b.id ? `1px solid ${b.color}` : '1px solid transparent',
                color: activeTab === b.id ? b.color : 'var(--muted)',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </button>
          ))}

          <div style={{ marginTop: 24, padding: '12px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
              💡 Los datos se guardan automáticamente en tu navegador mientras escribes.
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: 900 }}>

          {activeTab === 'general' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                Datos Generales
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
                Ingresa el período que cubre este reporte.
              </p>

              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      NOMBRE DE LA SEMANA
                    </label>
                    <input
                      type="text"
                      value={stats.semana}
                      onChange={e => setField('semana', e.target.value)}
                      placeholder="ej. Semana 12 — Marzo 2026"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      FECHA INICIO
                    </label>
                    <input
                      type="date"
                      value={stats.fechaInicio}
                      onChange={e => setField('fechaInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      FECHA FIN
                    </label>
                    <input
                      type="date"
                      value={stats.fechaFin}
                      onChange={e => setField('fechaFin', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--muted)' }}>
                  Resumen del reporte
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { brand: 'Asemafor', icon: '🌿', color: 'var(--cyan)', web: stats.asemafor.web.visitantes, ig: stats.asemafor.instagram.visualizaciones },
                    { brand: 'Innovariego', icon: '💧', color: 'var(--cyan2)', web: stats.innovariego.web.visitantes, ig: stats.innovariego.instagram.visualizaciones },
                    { brand: 'Econegocios', icon: '♻️', color: 'var(--green)', web: null, ig: stats.econegocios.instagram.visualizaciones },
                  ].map(b => (
                    <div key={b.brand} className="card" style={{ borderColor: b.color + '33' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span>{b.icon}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: b.color }}>{b.brand}</span>
                      </div>
                      {b.web !== null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Visitantes web</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.web || '—'}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Visualizaciones IG</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.ig || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'asemafor' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 10, height: 32, background: 'var(--cyan)', borderRadius: 4 }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Asemafor</h2>
              </div>
              <AsemaforForm
                data={stats.asemafor}
                onChange={updated => save({ ...stats, asemafor: updated })}
              />
            </div>
          )}

          {activeTab === 'innovariego' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 10, height: 32, background: 'var(--cyan2)', borderRadius: 4 }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Innovariego</h2>
              </div>
              <InnovariegoForm
                data={stats.innovariego}
                onChange={updated => save({ ...stats, innovariego: updated })}
              />
            </div>
          )}

          {activeTab === 'econegocios' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 10, height: 32, background: 'var(--green)', borderRadius: 4 }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Econegocios</h2>
              </div>
              <EconegociosForm
                data={stats.econegocios}
                onChange={updated => save({ ...stats, econegocios: updated })}
              />
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                📡 Guía de Automatización
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
                Cómo extraer datos automáticamente sin pagar herramientas externas.
              </p>

              {[
                {
                  title: '1. Instagram Basic Display API (Gratis)',
                  color: 'var(--magenta)',
                  content: [
                    '→ Entra a developers.facebook.com y crea una app tipo "Consumidor"',
                    '→ Activa "Instagram Basic Display"',
                    '→ Cada cuenta necesita su propio token (válidos 60 días, refrescables)',
                    '→ Endpoint útil: GET /me/media?fields=timestamp,media_type,like_count,comments_count,insights.metric(impressions,reach)',
                    '⚠️ Limitación: solo funciona para cuentas que tú controlas directamente',
                    '→ Para renovar tokens automáticamente agrega una function de Vercel (serverless) que los refresque cada 30 días',
                  ]
                },
                {
                  title: '2. Google Analytics / Search Console (Gratis)',
                  color: 'var(--cyan)',
                  content: [
                    '→ Activa la API de Google Analytics Data API v1 (GA4)',
                    '→ Crea una Service Account en Google Cloud Console',
                    '→ Descarga el JSON de credenciales y agrégalo como variable de entorno en Vercel',
                    '→ Endpoint: POST /v1beta/properties/{GA4_PROPERTY_ID}:runReport',
                    '→ Métricas clave: sessions, activeUsers, screenPageViews, country',
                    '→ Para asemafor.cl e innovariego.cl cada sitio tiene su propio Property ID en GA4',
                  ]
                },
                {
                  title: '3. Flujo recomendado en Vercel (serverless)',
                  color: 'var(--cyan2)',
                  content: [
                    '→ Crea /api/fetch-stats.js en tu repo',
                    '→ Esta función llama a Instagram API + Google Analytics API',
                    '→ Retorna un JSON con todos los datos listos para pre-rellenar el formulario',
                    '→ En el formulario agrega botón "🔄 Cargar datos automáticos"',
                    '→ Al hacer clic, llama a /api/fetch-stats y rellena los campos',
                    '→ Luego el usuario solo revisa, corrige si hay algo mal, y genera el PDF',
                  ]
                },
                {
                  title: '4. Variables de entorno necesarias en Vercel',
                  color: '#f59e0b',
                  content: [
                    'INSTAGRAM_TOKEN_ASEMAFOR=...',
                    'INSTAGRAM_TOKEN_INNOVARIEGO=...',
                    'INSTAGRAM_TOKEN_ECONEGOCIOS=...',
                    'GA4_PROPERTY_ASEMAFOR=...',
                    'GA4_PROPERTY_INNOVARIEGO=...',
                    'GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}',
                    '→ Nunca pongas estos valores en el código fuente',
                  ]
                },
              ].map((section, i) => (
                <div key={i} className="card" style={{ marginBottom: 16, borderLeft: `3px solid ${section.color}` }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: section.color, marginBottom: 12 }}>
                    {section.title}
                  </h3>
                  {section.content.map((line, j) => (
                    <div key={j} style={{
                      fontSize: 13,
                      color: line.startsWith('⚠️') ? '#fbbf24' : line.startsWith('→') ? 'var(--text)' : 'var(--cyan)',
                      marginBottom: 6,
                      fontFamily: line.includes('=') ? 'monospace' : 'var(--font-body)',
                      background: line.includes('=') ? 'var(--surface2)' : 'transparent',
                      padding: line.includes('=') ? '4px 8px' : '0',
                      borderRadius: line.includes('=') ? 4 : 0,
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
