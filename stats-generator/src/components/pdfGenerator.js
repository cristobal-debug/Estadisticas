/**
 * PDF Report Generator
 * Generates a multi-page stats report using jsPDF
 * Style matches the dark theme from the original PDF
 */

const W = 297  // A4 landscape width mm
const H = 210  // A4 landscape height mm

const COLORS = {
  bg: '#111318',
  surface: '#1a1d26',
  cyan: '#00e5cc',
  cyan2: '#40c4ff',
  magenta: '#e040fb',
  green: '#4caf50',
  text: '#e8eaf0',
  muted: '#7b82a0',
  border: '#2a2f3d',
  white: '#ffffff',
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function setFill(doc, hex) { doc.setFillColor(...hexToRgb(hex)) }
function setTxt(doc, hex) { doc.setTextColor(...hexToRgb(hex)) }
function setDraw(doc, hex) { doc.setDrawColor(...hexToRgb(hex)) }

function bgPage(doc) {
  setFill(doc, COLORS.bg)
  doc.rect(0, 0, W, H, 'F')
}

function header(doc, brandName, brandColor, weekLabel) {
  // Top bar
  setFill(doc, COLORS.surface)
  doc.roundedRect(8, 6, W - 16, 18, 2, 2, 'F')

  setTxt(doc, brandColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(brandName.toUpperCase(), 16, 18)

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('ESTADÍSTICAS WEB Y REDES SOCIALES', W / 2, 18, { align: 'center' })

  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(weekLabel || '', W - 16, 18, { align: 'right' })
}

function card(doc, x, y, w, h, title, titleColor) {
  setFill(doc, COLORS.surface)
  setDraw(doc, COLORS.border)
  doc.roundedRect(x, y, w, h, 3, 3, 'FD')

  if (title) {
    setTxt(doc, titleColor || COLORS.cyan)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(title.toUpperCase(), x + 6, y + 8)

    setDraw(doc, COLORS.border)
    doc.line(x + 4, y + 10, x + w - 4, y + 10)
  }
}

function vsChip(doc, x, y, current, previous) {
  const trend = Number(current) >= Number(previous) ? '▲' : '▼'
  const trendColor = Number(current) >= Number(previous) ? COLORS.cyan : '#ff5252'
  const val = `${current} vs sp ${previous}`

  setFill(doc, COLORS.cyan)
  doc.roundedRect(x, y, 60, 8, 4, 4, 'F')
  setTxt(doc, '#0a0e14')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(val, x + 30, y + 5.5, { align: 'center' })
}

function barChart(doc, x, y, w, h, data, color) {
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1)
  const barW = (w - 8) / data.length - 3
  let bx = x + 4

  // Axis
  setDraw(doc, COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(x + 2, y + h - 10, x + w - 2, y + h - 10)

  data.forEach(d => {
    const barH = ((Number(d.value) || 0) / maxVal) * (h - 20)
    const by = y + h - 10 - barH

    setFill(doc, color)
    doc.roundedRect(bx, by, barW, barH, 1, 1, 'F')

    // Label
    setTxt(doc, COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    const label = d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label
    doc.text(label, bx + barW / 2, y + h - 5, { align: 'center' })

    bx += barW + 3
  })
}

function pieChart(doc, cx, cy, r, pct, color1, color2, label1, label2) {
  const a1 = (pct / 100) * 2 * Math.PI
  // Simple two-slice pie approximation using filled arcs
  // jsPDF doesn't have arc, so we draw as colored rects (simplified)
  setFill(doc, color1)
  doc.circle(cx, cy, r, 'F')

  // Slice 2 approximation
  if (pct < 100) {
    setFill(doc, color2)
    const sliceRatio = (100 - pct) / 100
    doc.circle(cx, cy, r * Math.sqrt(sliceRatio), 'F')
  }

  // Labels
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(`${label1} ${pct}%`, cx - r - 2, cy + r + 5)
  doc.text(`${label2} ${100 - pct}%`, cx + 2, cy + r + 5)
}

function hBarChart(doc, x, y, w, h, data, color) {
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1)
  const rowH = (h - 4) / data.length - 1
  let by = y + 2

  data.forEach(d => {
    const barW = ((Number(d.value) || 0) / maxVal) * (w - 50)
    setFill(doc, color)
    doc.roundedRect(x + 45, by, barW, rowH - 2, 0.5, 0.5, 'F')

    setTxt(doc, COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    const label = d.label.length > 30 ? d.label.slice(0, 30) + '…' : d.label
    doc.text(label, x + 43, by + rowH / 2 + 1, { align: 'right' })

    setTxt(doc, COLORS.text)
    doc.setFontSize(5.5)
    doc.text(String(d.value || 0), x + 47 + barW, by + rowH / 2 + 1)

    by += rowH + 1
  })
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

export function buildAsemaforWebPage(doc, data, weekLabel) {
  bgPage(doc)
  header(doc, 'ASEMAFOR', COLORS.cyan, weekLabel)

  // Visitantes card
  card(doc, 8, 28, 85, 44, 'Visitantes Web', COLORS.cyan)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(String(data.web.visitantes || 0), 50, 52, { align: 'center' })
  vsChip(doc, 14, 58, data.web.visitantes || 0, data.web.visitantesSP || 0)

  // Países bar chart
  card(doc, 97, 28, 100, 70, 'Visitantes por País', COLORS.cyan)
  const paisesData = data.web.paises.map(p => ({
    label: p.nombre,
    value: p.porcentaje ?? p.valor ?? 0
  }))
  barChart(doc, 99, 36, 96, 58, paisesData, COLORS.cyan)

  // Fuentes bar chart
  card(doc, 8, 75, 85, 60, 'Fuentes de Tráfico', COLORS.cyan)
  const fuentesData = data.web.fuentes.map(f => ({ label: f.nombre, value: f.valor || 0 }))
  barChart(doc, 10, 83, 81, 48, fuentesData, COLORS.cyan2)

  // Dispositivos
  card(doc, 97, 100, 100, 35, 'Dispositivos', COLORS.cyan)
  const dispData = [
    { label: 'Smartphone', value: data.web.dispositivos.smartphone || 0 },
    { label: 'Desktop', value: data.web.dispositivos.desktop || 0 },
    { label: 'Tablet', value: data.web.dispositivos.tablet || 0 },
    { label: 'Phablet', value: data.web.dispositivos.phablet || 0 },
  ]
  barChart(doc, 99, 108, 96, 23, dispData, COLORS.cyan2)

  // Páginas más visitadas
  card(doc, 8, 138, 189, 64, 'Páginas más Visitadas', COLORS.magenta)
  const paginasData = data.web.paginasVisitadas.map(p => ({ label: p.nombre, value: p.visitas || 0 }))
  hBarChart(doc, 10, 146, 185, 50, paginasData, COLORS.magenta)

  // Footer
  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('asemafor.cl', W - 16, H - 4, { align: 'right' })
}

export function buildAsemaforIGPage(doc, data, weekLabel) {
  bgPage(doc)
  header(doc, 'ASEMAFOR', COLORS.cyan, weekLabel)

  const ig = data.instagram

  // Visualizaciones
  card(doc, 8, 28, 88, 44, 'Visualizaciones Instagram', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.visualizaciones || 0), 52, 51, { align: 'center' })
  vsChip(doc, 14, 58, ig.visualizaciones || 0, ig.visualizacionesSP || 0)

  // Cuentas alcanzadas
  card(doc, 100, 28, 88, 44, 'Cuentas Alcanzadas', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.cuentasAlcanzadas || 0), 144, 51, { align: 'center' })
  vsChip(doc, 106, 58, ig.cuentasAlcanzadas || 0, ig.cuentasAlcanzadasSP || 0)

  // Interacciones
  card(doc, 192, 28, 97, 44, 'Interacciones', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.interacciones || 0), 240, 51, { align: 'center' })
  vsChip(doc, 198, 58, ig.interacciones || 0, ig.interaccionesSP || 0)

  // Distribución seguidores / no seguidores
  card(doc, 8, 76, 88, 55, 'Audiencia', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Seguidores: ${ig.seguidoresPct || 0}%`, 16, 90)
  doc.text(`No seguidores: ${ig.noSeguidoresPct || 0}%`, 16, 100)
  doc.setFontSize(8)
  setTxt(doc, COLORS.muted)
  doc.text(`Seguidores: ${ig.seguidores || 0} vs sp ${ig.seguidoresSP || 0}`, 16, 118)

  // Alcance por tipo
  card(doc, 100, 76, 88, 55, 'Alcance por Tipo', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Publicaciones: ${ig.publicacionesPct || 0}%`, 108, 90)
  doc.text(`Reel: ${ig.reelPct || 0}%`, 108, 100)

  // Visitas al perfil
  card(doc, 192, 76, 97, 55, 'Visitas al Perfil', COLORS.magenta)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.visitasPerfil || 0), 240, 99, { align: 'center' })
  setTxt(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.text(`vs sp ${ig.visitasPerfilSP || 0}`, 240, 110, { align: 'center' })

  // Top posts
  card(doc, 8, 135, 281, 65, 'Publicaciones Más Vistas', COLORS.magenta)
  const postW = 87
  ig.topPosts.forEach((post, i) => {
    const px = 10 + i * (postW + 3)
    setFill(doc, COLORS.surface2 || '#21252f')
    doc.roundedRect(px, 143, postW, 50, 2, 2, 'F')
    setTxt(doc, COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(String(post.vistas || 0), px + postW / 2, 165, { align: 'center' })
    setTxt(doc, COLORS.muted)
    doc.setFontSize(8)
    doc.text(post.fecha || '-', px + postW / 2, 183, { align: 'center' })
  })

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('INSTAGRAM · @asemafor', W - 16, H - 4, { align: 'right' })
}

export function buildInnovariegoWebPage(doc, data, weekLabel) {
  bgPage(doc)
  header(doc, 'INNOVARIEGO', COLORS.cyan2, weekLabel)

  card(doc, 8, 28, 85, 44, 'Visitantes Web', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(String(data.web.visitantes || 0), 50, 52, { align: 'center' })
  vsChip(doc, 14, 58, data.web.visitantes || 0, data.web.visitantesSP || 0)

  card(doc, 97, 28, 100, 70, 'Visitantes por País', COLORS.cyan2)
  const paisesData = data.web.paises.map(p => ({ label: p.nombre, value: p.valor || 0 }))
  barChart(doc, 99, 36, 96, 58, paisesData, COLORS.cyan2)

  card(doc, 8, 75, 85, 60, 'Fuentes de Tráfico', COLORS.cyan2)
  const fuentesData = data.web.fuentes.map(f => ({ label: f.nombre, value: f.valor || 0 }))
  barChart(doc, 10, 83, 81, 48, fuentesData, COLORS.cyan2)

  card(doc, 97, 100, 100, 35, 'Dispositivos', COLORS.cyan2)
  const dispData = [
    { label: 'Smartphone', value: data.web.dispositivos.smartphone || 0 },
    { label: 'Desktop', value: data.web.dispositivos.desktop || 0 },
    { label: 'Tablet', value: data.web.dispositivos.tablet || 0 },
    { label: 'Phablet', value: data.web.dispositivos.phablet || 0 },
  ]
  barChart(doc, 99, 108, 96, 23, dispData, COLORS.cyan)

  card(doc, 8, 138, 189, 64, 'Páginas más Visitadas', COLORS.cyan2)
  const paginasData = data.web.paginasVisitadas.map(p => ({ label: p.nombre, value: p.visitas || 0 }))
  hBarChart(doc, 10, 146, 185, 50, paginasData, COLORS.cyan2)

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('innovariego.cl', W - 16, H - 4, { align: 'right' })
}

export function buildInnovariegoIGPage(doc, data, weekLabel) {
  bgPage(doc)
  header(doc, 'INNOVARIEGO', COLORS.cyan2, weekLabel)

  const ig = data.instagram

  card(doc, 8, 28, 88, 44, 'Visualizaciones Instagram', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.visualizaciones || 0), 52, 51, { align: 'center' })
  vsChip(doc, 14, 58, ig.visualizaciones || 0, ig.visualizacionesSP || 0)

  card(doc, 100, 28, 88, 44, 'Cuentas Alcanzadas', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.cuentasAlcanzadas || 0), 144, 51, { align: 'center' })
  vsChip(doc, 106, 58, ig.cuentasAlcanzadas || 0, ig.cuentasAlcanzadasSP || 0)

  card(doc, 192, 28, 97, 44, 'Interacciones', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.interacciones || 0), 240, 51, { align: 'center' })
  vsChip(doc, 198, 58, ig.interacciones || 0, ig.interaccionesSP || 0)

  card(doc, 8, 76, 88, 55, 'Audiencia', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Seguidores: ${ig.seguidoresPct || 0}%`, 16, 90)
  doc.text(`No seguidores: ${ig.noSeguidoresPct || 0}%`, 16, 100)
  setTxt(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.text(`Total: ${ig.seguidores || 0} vs sp ${ig.seguidoresSP || 0}`, 16, 118)

  card(doc, 100, 76, 88, 55, 'Alcance por Tipo', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Publicaciones: ${ig.publicacionesPct || 0}%`, 108, 90)
  doc.text(`Reel: ${ig.reelPct || 0}%`, 108, 100)

  card(doc, 192, 76, 97, 55, 'Visitas al Perfil', COLORS.cyan2)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.visitasPerfil || 0), 240, 99, { align: 'center' })
  setTxt(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.text(`vs sp ${ig.visitasPerfilSP || 0}`, 240, 110, { align: 'center' })

  card(doc, 8, 135, 281, 65, 'Publicaciones Más Vistas', COLORS.cyan2)
  const postW = 87
  ig.topPosts.forEach((post, i) => {
    const px = 10 + i * (postW + 3)
    setFill(doc, '#21252f')
    doc.roundedRect(px, 143, postW, 50, 2, 2, 'F')
    setTxt(doc, COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(String(post.vistas || 0), px + postW / 2, 165, { align: 'center' })
    setTxt(doc, COLORS.muted)
    doc.setFontSize(8)
    doc.text(post.fecha || '-', px + postW / 2, 183, { align: 'center' })
  })

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('INSTAGRAM · @innovariego', W - 16, H - 4, { align: 'right' })
}

export function buildEconegociosIGPage(doc, data, weekLabel) {
  bgPage(doc)
  header(doc, 'ECONEGOCIOS', COLORS.green, weekLabel)

  const ig = data.instagram

  card(doc, 8, 28, 88, 44, 'Visualizaciones Instagram', COLORS.green)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.visualizaciones || 0), 52, 51, { align: 'center' })
  vsChip(doc, 14, 58, ig.visualizaciones || 0, ig.visualizacionesSP || 0)

  card(doc, 100, 28, 88, 44, 'Interacciones', COLORS.green)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.interacciones || 0), 144, 51, { align: 'center' })
  vsChip(doc, 106, 58, ig.interacciones || 0, ig.interaccionesSP || 0)

  card(doc, 192, 28, 97, 44, 'Cuentas Alcanzadas', COLORS.green)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(ig.cuentasAlcanzadas || 0), 240, 51, { align: 'center' })

  card(doc, 8, 76, 88, 55, 'Audiencia', COLORS.green)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Seguidores: ${ig.seguidoresPct || 0}%`, 16, 90)
  doc.text(`No seguidores: ${ig.noSeguidoresPct || 0}%`, 16, 100)

  card(doc, 100, 76, 88, 55, 'Alcance por Tipo', COLORS.green)
  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Publicaciones: ${ig.publicacionesPct || 0}%`, 108, 90)

  card(doc, 8, 135, 281, 65, 'Publicaciones Más Vistas', COLORS.green)
  const postW = 87
  ig.topPosts.forEach((post, i) => {
    const px = 10 + i * (postW + 3)
    setFill(doc, '#21252f')
    doc.roundedRect(px, 143, postW, 50, 2, 2, 'F')
    setTxt(doc, COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(String(post.vistas || 0), px + postW / 2, 165, { align: 'center' })
    setTxt(doc, COLORS.muted)
    doc.setFontSize(8)
    doc.text(post.fecha || '-', px + postW / 2, 183, { align: 'center' })
  })

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('INSTAGRAM · @econegocios', W - 16, H - 4, { align: 'right' })
}

export function buildCoverPage(doc, weekLabel) {
  bgPage(doc)

  // Decorative background lines
  setDraw(doc, COLORS.border)
  doc.setLineWidth(0.2)
  for (let i = 0; i < 20; i++) {
    doc.line(0, i * 12, W, i * 12)
  }

  // Center block
  setFill(doc, COLORS.surface)
  doc.roundedRect(W / 2 - 80, H / 2 - 40, 160, 80, 6, 6, 'F')

  setTxt(doc, COLORS.cyan)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('ESTADÍSTICAS WEB Y REDES SOCIALES', W / 2, H / 2 - 22, { align: 'center' })

  setTxt(doc, COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('REPORTE SEMANAL', W / 2, H / 2 - 5, { align: 'center' })

  setTxt(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(weekLabel || '', W / 2, H / 2 + 10, { align: 'center' })

  setDraw(doc, COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - 40, H / 2 + 16, W / 2 + 40, H / 2 + 16)

  setTxt(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.text('Asemafor · Innovariego · Econegocios', W / 2, H / 2 + 26, { align: 'center' })
}

export async function generatePDF(stats) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const weekLabel = stats.semana || `${stats.fechaInicio || ''} - ${stats.fechaFin || ''}`

  // Cover
  buildCoverPage(doc, weekLabel)

  // Asemafor Web
  doc.addPage()
  buildAsemaforWebPage(doc, stats.asemafor, weekLabel)

  // Asemafor IG
  doc.addPage()
  buildAsemaforIGPage(doc, stats.asemafor, weekLabel)

  // Innovariego Web
  doc.addPage()
  buildInnovariegoWebPage(doc, stats.innovariego, weekLabel)

  // Innovariego IG
  doc.addPage()
  buildInnovariegoIGPage(doc, stats.innovariego, weekLabel)

  // Econegocios IG
  doc.addPage()
  buildEconegociosIGPage(doc, stats.econegocios, weekLabel)

  const fileName = `estadisticas-${(weekLabel || 'semana').replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}
