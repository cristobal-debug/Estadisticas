import React, { useState } from 'react'

const SYSTEM_PROMPT = `Eres un extractor de estadísticas de Instagram. 
El usuario te pegará el texto copiado del panel de Instagram Insights.
Debes extraer los datos y responder ÚNICAMENTE con un JSON válido, sin texto adicional, sin backticks, sin explicaciones.

El JSON debe tener exactamente esta estructura:
{
  "visualizaciones": "número como string",
  "cuentasAlcanzadas": "número como string",
  "interacciones": "número como string",
  "visitasPerfil": "número como string",
  "seguidores": "número como string",
  "seguidoresPct": "número como string (sin %)",
  "noSeguidoresPct": "número como string (sin %)",
  "publicacionesPct": "número como string (sin %)",
  "reelPct": "número como string (sin %)",
  "interaccionesSegPct": "número como string (sin %)",
  "interaccionesNoSegPct": "número como string (sin %)",
  "topPosts": [
    { "vistas": "número", "fecha": "ej: 13 mar." },
    { "vistas": "número", "fecha": "ej: 16 mar." },
    { "vistas": "número", "fecha": "ej: 12 mar." }
  ]
}

Notas importantes:
- Los topPosts deben ser los 3 posts con más visualizaciones (no interacciones). Busca la sección "Contenido destacado en función de las visualizaciones".
- Si un valor no aparece en el texto, usa string vacío "".
- Los porcentajes: "Seguidores 97,2%" → seguidoresPct: "97.2" (usa punto decimal, no coma).
- Los números con puntos de miles como "1.529" → "1529".
- Las fechas de los posts mantenlas como aparecen, ej: "13 mar."
`

export default function InstagramImporter({ onImport, brand = '' }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const handleParse = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setPreview(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: text }],
        }),
      })

      const data = await response.json()
      const raw = data.content?.find(b => b.type === 'text')?.text || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setPreview(parsed)
    } catch (e) {
      setError('No se pudo interpretar el texto. Asegúrate de pegar el contenido completo del panel de Instagram.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!preview) return
    onImport(preview)
    setOpen(false)
    setText('')
    setPreview(null)
  }

  const handleClose = () => {
    setOpen(false)
    setText('')
    setPreview(null)
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          padding: '8px 14px',
          fontSize: 12,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          letterSpacing: '0.03em',
          boxShadow: '0 2px 8px rgba(131,58,180,0.35)',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        ✨ Importar desde Instagram
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          backdropFilter: 'blur(4px)',
        }} onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 580,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, margin: 0 }}>
                  ✨ Importar datos de Instagram
                </h3>
                {brand && (
                  <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>{brand}</p>
                )}
              </div>
              <button onClick={handleClose} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--muted)', borderRadius: 8, width: 32, height: 32,
                cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            {/* Instructions */}
            <div style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 16,
              borderLeft: '3px solid #833ab4',
            }}>
              <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#c084fc' }}>Cómo hacerlo:</strong><br />
                1. Abre <strong>instagram.com/accounts/insights</strong> en tu navegador<br />
                2. Selecciona todo el texto de la página <kbd style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: 11, border: '1px solid var(--border)' }}>Ctrl+A</kbd> → <kbd style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: 11, border: '1px solid var(--border)' }}>Ctrl+C</kbd><br />
                3. Pégalo aquí abajo
              </p>
            </div>

            {/* Textarea */}
            {!preview && (
              <>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Pega aquí el texto copiado del panel de Instagram Insights..."
                  style={{
                    width: '100%',
                    height: 180,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--text)',
                    padding: '12px 14px',
                    fontSize: 13,
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                  }}
                />

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8, padding: '10px 12px', marginTop: 12,
                    fontSize: 13, color: '#fca5a5',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button onClick={handleClose} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--muted)', borderRadius: 8, padding: '9px 18px',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600,
                  }}>
                    Cancelar
                  </button>
                  <button
                    onClick={handleParse}
                    disabled={loading || !text.trim()}
                    style={{
                      background: loading || !text.trim()
                        ? 'var(--surface2)'
                        : 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                      border: 'none', borderRadius: 8,
                      color: loading || !text.trim() ? 'var(--muted)' : '#fff',
                      padding: '9px 20px', fontSize: 13,
                      cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                    }}
                  >
                    {loading ? '⏳ Procesando...' : '✨ Extraer datos con IA'}
                  </button>
                </div>
              </>
            )}

            {/* Preview */}
            {preview && (
              <div>
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                  fontSize: 13, color: '#86efac',
                }}>
                  ✅ Datos extraídos correctamente. Revisa y confirma:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Visualizaciones', key: 'visualizaciones' },
                    { label: 'Cuentas Alcanzadas', key: 'cuentasAlcanzadas' },
                    { label: 'Interacciones', key: 'interacciones' },
                    { label: 'Visitas al Perfil', key: 'visitasPerfil' },
                    { label: 'Seguidores', key: 'seguidores' },
                    { label: 'Seg. %', key: 'seguidoresPct' },
                    { label: 'No seg. %', key: 'noSeguidoresPct' },
                    { label: 'Publicaciones %', key: 'publicacionesPct' },
                    { label: 'Reel %', key: 'reelPct' },
                    { label: 'Interacc. Seg. %', key: 'interaccionesSegPct' },
                    { label: 'Interacc. No seg. %', key: 'interaccionesNoSegPct' },
                  ].map(({ label, key }) => preview[key] !== undefined && (
                    <div key={key} style={{
                      background: 'var(--surface2)', borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: preview[key] ? 'var(--text)' : 'var(--muted)' }}>
                        {preview[key] || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {preview.topPosts?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>
                      TOP POSTS (VISUALIZACIONES)
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {preview.topPosts.map((p, i) => (
                        <div key={i} style={{
                          background: 'var(--surface2)', borderRadius: 8,
                          padding: '8px 12px', flex: 1, textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{p.vistas || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.fecha || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setPreview(null); setError('') }} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--muted)', borderRadius: 8, padding: '9px 18px',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600,
                  }}>
                    ← Volver
                  </button>
                  <button onClick={handleApply} style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none', borderRadius: 8,
                    color: '#fff', padding: '9px 20px', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                  }}>
                    ✓ Aplicar datos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
